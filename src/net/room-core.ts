/**
 * The room: one EXILE game night. Holds the true game, runs the live auctions,
 * the pitch clock and the verdict reveal, checks who is allowed to do what, and
 * hands every phone only what it is allowed to see. Pure logic: the Cloudflare
 * wrapper feeds it messages and the time, and stores what it returns.
 */
import { CATEGORIES, cardById } from '../data/cards';
import type { Category, Location } from '../data/cards';
import {
  PALETTE_KEYS,
  RULES,
  TIMING,
  dropDays,
  emptyKit,
  maxBid,
  pickCard,
  pickLocation,
  revealDurationMs,
  shuffle,
  slotsLeft,
  survivalDays,
} from '../game/rules';
import type {
  Action,
  Auction,
  ClientMsg,
  Clock,
  LobbyPlayer,
  Phase,
  Player,
  Role,
  RoomEvent,
  RoundPlayer,
  RoundResult,
  View,
} from './protocol';

export interface Seat {
  role: 'screen' | 'player';
  playerId: string | null;
}

export interface Meta {
  token: string | null;
  role: Role;
  playerId: string | null;
}

export interface Round {
  adjudicatorId: string;
  location: Location | null;
  terrainRevealed: boolean;
  terrainAt: number;
  players: Record<string, RoundPlayer>;
  bonusFor: string | null;
  days: Record<string, number> | null;
  pitchOrder: string[];
  pitchIndex: number;
  ranking: string[] | null;
  drop: Record<string, number> | null;
  revealAt: number;
  winnerId: string | null;
  nextDealAt: number | null;
}

export interface Game {
  phase: Phase;
  players: Player[];
  rota: string[];
  roundIndex: number;
  round: Round;
  results: RoundResult[];
  usedCards: string[];
  usedLocations: string[];
}

export interface RoomState {
  code: string;
  createdAt: number;
  seats: Record<string, Seat>; // token -> seat
  lobby: LobbyPlayer[];
  game: Game | null;
  auction: Auction | null;
  clock: Clock;
  lastSeen: Record<string, number>;
  event: RoomEvent | null;
  eventSeq: number;
  hostToken: string | null;
}

export interface Outcome {
  reply?: { t: 'welcome'; token: string | null; role: Role; playerId: string | null } | { t: 'error'; message: string };
  meta?: Meta;
  changed: boolean;
}

const PITCH_MS = RULES.pitchSeconds * 1000;
const token = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + Date.now().toString(36);

export class Denied extends Error {}

export function newRoom(code: string, now: number): RoomState {
  return {
    code,
    createdAt: now,
    seats: {},
    lobby: [],
    game: null,
    auction: null,
    clock: { remainingMs: PITCH_MS, runningSince: null },
    lastSeen: {},
    event: null,
    eventSeq: 0,
    hostToken: null,
  };
}

function newRound(players: Player[], adjudicatorId: string, bonusFor: string | null): Round {
  const rp: Record<string, RoundPlayer> = {};
  for (const p of players) {
    if (p.id === adjudicatorId) continue;
    rp[p.id] = { gold: RULES.goldPerRound + (p.id === bonusFor ? RULES.winnerBonusGold : 0), kit: emptyKit() };
  }
  return {
    adjudicatorId,
    location: null,
    terrainRevealed: false,
    terrainAt: 0,
    players: rp,
    bonusFor: bonusFor && rp[bonusFor] ? bonusFor : null,
    days: null,
    pitchOrder: [],
    pitchIndex: 0,
    ranking: null,
    drop: null,
    revealAt: 0,
    winnerId: null,
    nextDealAt: null,
  };
}

const ODDS_PHASES: Phase[] = ['odds', 'pitch', 'verdict', 'reveal', 'roundEnd', 'final'];

export class RoomCore {
  private online = new Set<string>();
  private now = 0;
  /** Swappable for tests. */
  rng: () => number = Math.random;

  constructor(public state: RoomState) {}

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */
  private get g(): Game {
    if (!this.state.game) throw new Denied('The game hasn’t started yet.');
    return this.state.game;
  }

  private say(text: string, tone: RoomEvent['tone'] = 'info', extra: Partial<RoomEvent> = {}) {
    this.state.eventSeq += 1;
    this.state.event = { id: this.state.eventSeq, text, tone, at: this.now, ...extra };
  }

  private name(id: string) {
    return this.g.players.find((p) => p.id === id)?.name ?? 'Someone';
  }

  private isAdjudicator(m: Meta) {
    return m.role === 'player' && !!this.state.game && m.playerId === this.state.game.round.adjudicatorId;
  }

  private isHost(m: Meta) {
    return !!m.token && m.token === this.state.hostToken;
  }

  private hostAway() {
    const t = this.state.hostToken;
    if (!t || !this.state.seats[t]) return true;
    const id = this.state.seats[t].playerId;
    if (!id) return !this.online.size;
    if (this.online.has(id)) return false;
    return this.now - (this.state.lastSeen[id] ?? 0) >= TIMING.hostAwayMs;
  }

  private requireHost(m: Meta) {
    if (this.isHost(m)) return;
    if (m.role === 'player' && m.playerId && m.token && this.hostAway()) {
      this.state.hostToken = m.token;
      const name = this.state.game?.players.find((p) => p.id === m.playerId)?.name ?? this.state.lobby.find((l) => l.id === m.playerId)?.name;
      if (name) this.say(`${name} steps in as host.`);
      return;
    }
    throw new Denied('Only the host can do that.');
  }

  /** Table controls belong to the Adjudicator; the host covers if the Adjudicator's phone is away. */
  private requireRunner(m: Meta) {
    if (this.isAdjudicator(m)) return;
    const adj = this.state.game?.round.adjudicatorId;
    if (adj && !this.online.has(adj) && this.isHost(m)) return;
    throw new Denied('That’s the Adjudicator’s call.');
  }

  private requirePhase(...phases: Phase[]) {
    if (!phases.includes(this.g.phase)) throw new Denied('Not at this stage of the round.');
  }

  markSeen(id: string, now: number) {
    this.state.lastSeen[id] = now;
  }

  /* ------------------------------------------------------------------ */
  /*  Entry point                                                        */
  /* ------------------------------------------------------------------ */
  handle(meta: Meta, msg: ClientMsg, now: number, online: Set<string>): Outcome {
    this.online = online;
    this.now = now;
    try {
      switch (msg.t) {
        case 'hello':
          return this.hello(msg.token ?? null, !!msg.create);
        case 'join':
          return this.join(meta, msg.name, msg.colour);
        case 'takeover':
          return this.takeover(meta, msg.playerId, online, now);
        case 'watch':
          return this.watch(meta);
        case 'start':
          return this.start(meta);
        case 'act':
          this.act(meta, msg.action);
          return { changed: true };
        default:
          return { changed: false };
      }
    } catch (e) {
      if (e instanceof Denied) return { changed: false, reply: { t: 'error', message: e.message } };
      throw e;
    }
  }

  private hello(tok: string | null, create: boolean): Outcome {
    const seat = tok ? this.state.seats[tok] : undefined;
    if (seat) {
      return {
        changed: true,
        meta: { token: tok, role: seat.role, playerId: seat.playerId },
        reply: { t: 'welcome', token: tok, role: seat.role, playerId: seat.playerId },
      };
    }
    const exists = Object.keys(this.state.seats).length > 0;
    if (create) {
      if (exists) throw new Denied('That room code is taken.');
      const t = token();
      this.state.seats[t] = { role: 'player', playerId: null };
      this.state.hostToken = t;
      return { changed: true, meta: { token: t, role: 'player', playerId: null }, reply: { t: 'welcome', token: t, role: 'player', playerId: null } };
    }
    if (!exists) throw new Denied('No game with that code. Check it with whoever started the game.');
    return { changed: false, meta: { token: null, role: 'guest', playerId: null }, reply: { t: 'welcome', token: null, role: 'guest', playerId: null } };
  }

  private join(meta: Meta, rawName: string, colour: string): Outcome {
    if (this.state.game) throw new Denied('This game has already started. Take over a player instead.');
    if (meta.role === 'screen') throw new Denied('A big screen can’t join as a player.');
    const name = String(rawName ?? '').trim().slice(0, 24);
    if (!name) throw new Denied('Give yourself a name.');
    const existing = meta.playerId ? this.state.lobby.find((l) => l.id === meta.playerId) : undefined;
    if (this.state.lobby.some((l) => l.name.toLowerCase() === name.toLowerCase() && l.id !== existing?.id)) {
      throw new Denied('Someone already has that name.');
    }
    const taken = new Set(this.state.lobby.filter((l) => l.id !== existing?.id).map((l) => l.colour));
    const pick = PALETTE_KEYS.includes(colour) && !taken.has(colour) ? colour : PALETTE_KEYS.find((k) => !taken.has(k)) ?? PALETTE_KEYS[0];
    if (existing) {
      existing.name = name;
      existing.colour = pick;
      return { changed: true };
    }
    if (this.state.lobby.length >= RULES.maxPlayers) throw new Denied(`The jet is full: ${RULES.maxPlayers} players maximum.`);
    const id = `L${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    this.state.lobby.push({ id, name, colour: pick });
    const t = meta.token && this.state.seats[meta.token] ? meta.token : token();
    this.state.seats[t] = { role: 'player', playerId: id };
    this.say(`${name} is packing a bag.`);
    return { changed: true, meta: { token: t, role: 'player', playerId: id }, reply: { t: 'welcome', token: t, role: 'player', playerId: id } };
  }

  private takeover(meta: Meta, playerId: string, online: Set<string>, now: number): Outcome {
    if (meta.role === 'screen') throw new Denied('A big screen can’t play.');
    const inLobby = !this.state.game && this.state.lobby.find((l) => l.id === playerId);
    const inGame = this.state.game?.players.find((p) => p.id === playerId);
    if (!inLobby && !inGame) throw new Denied('That player isn’t available.');
    if (online.has(playerId)) throw new Denied('That player is still connected on another phone.');
    const t = token();
    for (const [old, s] of Object.entries(this.state.seats)) {
      if (s.playerId !== playerId) continue;
      if (old === this.state.hostToken) this.state.hostToken = t;
      delete this.state.seats[old];
    }
    this.state.seats[t] = { role: 'player', playerId };
    this.state.lastSeen[playerId] = now;
    const name = inLobby ? inLobby.name : inGame!.name;
    this.say(`${name} is back on the radar.`);
    return { changed: true, meta: { token: t, role: 'player', playerId }, reply: { t: 'welcome', token: t, role: 'player', playerId } };
  }

  private watch(meta: Meta): Outcome {
    if (meta.role === 'player') throw new Denied('This phone is already a player.');
    const t = token();
    this.state.seats[t] = { role: 'screen', playerId: null };
    return { changed: true, meta: { token: t, role: 'screen', playerId: null }, reply: { t: 'welcome', token: t, role: 'screen', playerId: null } };
  }

  private start(meta: Meta): Outcome {
    this.requireHost(meta);
    if (this.state.game) throw new Denied('The game is already running.');
    const lobby = this.state.lobby;
    if (lobby.length < RULES.minPlayers) throw new Denied(`You need at least ${RULES.minPlayers} players. ${lobby.length} so far.`);
    // Lobby ids become game ids (p1, p2...) in the same order.
    const map = new Map(lobby.map((l, i) => [l.id, `p${i + 1}`]));
    const players: Player[] = lobby.map((l) => ({ id: map.get(l.id)!, name: l.name, colour: l.colour, wins: 0, debunkUsed: false }));
    for (const seat of Object.values(this.state.seats)) if (seat.playerId) seat.playerId = map.get(seat.playerId) ?? null;
    const seen: Record<string, number> = {};
    for (const [k, v] of Object.entries(this.state.lastSeen)) seen[map.get(k) ?? k] = v;
    this.state.lastSeen = seen;
    const rota = shuffle(players.map((p) => p.id), this.rng);
    this.state.game = {
      phase: 'briefing',
      players,
      rota,
      roundIndex: 0,
      round: newRound(players, rota[0], null),
      results: [],
      usedCards: [],
      usedLocations: [],
    };
    this.state.auction = null;
    this.state.clock = { remainingMs: PITCH_MS, runningSince: null };
    this.say(`${this.name(rota[0])} is the first Adjudicator.`);
    return { changed: true };
  }

  /* ------------------------------------------------------------------ */
  /*  Game actions                                                       */
  /* ------------------------------------------------------------------ */
  private act(m: Meta, action: Action) {
    if (action.a === 'kick') {
      this.requireHost(m);
      if (this.state.game) throw new Denied('The game is running. Take over that player instead.');
      const entry = this.state.lobby.find((l) => l.id === action.playerId);
      if (!entry) throw new Denied('That player has already left.');
      this.state.lobby = this.state.lobby.filter((l) => l.id !== entry.id);
      for (const [t, seat] of Object.entries(this.state.seats)) if (seat.playerId === entry.id) delete this.state.seats[t];
      this.say(`${entry.name} missed the flight.`);
      return;
    }
    if (action.a === 'backToLobby') {
      this.requireHost(m);
      if (this.state.game && this.state.game.phase !== 'final') throw new Denied('Finish the game first.');
      this.backToLobby();
      return;
    }
    const g = this.g;
    const r = g.round;
    switch (action.a) {
      case 'takeOff': {
        this.requireRunner(m);
        this.requirePhase('briefing');
        const loc = pickLocation(g.usedLocations, this.rng);
        r.location = loc;
        g.usedLocations.push(loc.name);
        g.phase = 'deal';
        r.nextDealAt = this.now + TIMING.firstDealMs;
        this.say(`Wheels up. The gauge reads ${loc.temp}.`);
        break;
      }

      case 'bid':
        this.bid(m, action.amount);
        break;

      case 'autoFill': {
        this.requireRunner(m);
        this.requirePhase('deal');
        const rp = r.players[action.playerId];
        if (!rp) throw new Denied('That player isn’t in this round.');
        if (this.online.has(action.playerId)) throw new Denied('They’re still here. Let them bid.');
        if (this.state.auction?.high?.playerId === action.playerId) throw new Denied('Wait for this card to sell first.');
        const used = new Set(g.usedCards);
        if (this.state.auction) used.add(this.state.auction.cardId);
        for (const cat of CATEGORIES) {
          if (rp.kit[cat]) continue;
          const card = pickCard([cat], used, this.rng);
          if (!card) continue;
          used.add(card.id);
          g.usedCards.push(card.id);
          rp.kit[cat] = card.id;
          rp.gold = Math.max(0, rp.gold - 1);
        }
        this.say(`${this.name(action.playerId)}’s bag was packed for them.`);
        this.afterSale();
        break;
      }

      case 'toPitches':
        this.requireRunner(m);
        this.requirePhase('odds');
        g.phase = 'pitch';
        r.pitchOrder = shuffle(Object.keys(r.players), this.rng);
        r.pitchIndex = 0;
        this.state.clock = { remainingMs: PITCH_MS, runningSince: null };
        this.say(`${this.name(r.pitchOrder[0])} pitches first.`);
        break;

      case 'clockStart': {
        this.requireRunner(m);
        this.requirePhase('pitch');
        const c = this.state.clock;
        if (c.runningSince === null && c.remainingMs > 0) c.runningSince = this.now;
        break;
      }

      case 'clockPause': {
        this.requireRunner(m);
        this.requirePhase('pitch');
        const c = this.state.clock;
        if (c.runningSince !== null) {
          c.remainingMs = Math.max(0, c.remainingMs - (this.now - c.runningSince));
          c.runningSince = null;
        }
        break;
      }

      case 'clockReset':
        this.requireRunner(m);
        this.requirePhase('pitch');
        this.state.clock = { remainingMs: PITCH_MS, runningSince: null };
        break;

      case 'nextPitch':
        this.requireRunner(m);
        this.requirePhase('pitch');
        this.state.clock = { remainingMs: PITCH_MS, runningSince: null };
        if (r.pitchIndex + 1 >= r.pitchOrder.length) {
          g.phase = 'verdict';
          this.say('The Adjudicator retires to deliberate.');
        } else {
          r.pitchIndex += 1;
          this.say(`${this.name(r.pitchOrder[r.pitchIndex])} takes the floor.`);
        }
        break;

      case 'debunk': {
        this.requirePhase('pitch');
        if (m.role !== 'player' || !m.playerId) throw new Denied('Only players can debunk.');
        if (m.playerId === r.adjudicatorId) throw new Denied('The Adjudicator weighs the evidence. No debunking.');
        const me = g.players.find((p) => p.id === m.playerId)!;
        if (me.debunkUsed) throw new Denied('You’ve used your Debunk card this game.');
        const target = r.pitchOrder[r.pitchIndex];
        if (target === m.playerId) throw new Denied('You can’t debunk your own pitch.');
        me.debunkUsed = true;
        this.say(`${me.name} debunks ${this.name(target)}!`, 'debunk', { by: me.id, target });
        break;
      }

      case 'verdict': {
        this.requireRunner(m);
        this.requirePhase('verdict');
        const ids = Object.keys(r.players);
        const ranking = Array.isArray(action.ranking) ? action.ranking.map(String) : [];
        if (ranking.length !== ids.length || new Set(ranking).size !== ids.length || !ranking.every((id) => ids.includes(id))) {
          throw new Denied('Rank every survivor, once each.');
        }
        r.ranking = ranking;
        r.drop = dropDays(ranking, r.days ?? {});
        r.winnerId = ranking[0];
        r.revealAt = this.now;
        g.phase = 'reveal';
        break;
      }

      case 'nextRound': {
        this.requireRunner(m);
        this.requirePhase('roundEnd');
        this.state.auction = null;
        this.state.clock = { remainingMs: PITCH_MS, runningSince: null };
        if (g.roundIndex + 1 >= g.rota.length) {
          g.phase = 'final';
          this.say('Every Adjudicator has spoken.');
          break;
        }
        g.roundIndex += 1;
        const adj = g.rota[g.roundIndex];
        g.round = newRound(g.players, adj, r.winnerId);
        g.phase = 'briefing';
        this.say(`${this.name(adj)} is the Adjudicator.`);
        break;
      }

      default:
        throw new Denied('Unknown move.');
    }
  }

  private bid(m: Meta, amount: number) {
    const g = this.g;
    this.requirePhase('deal');
    const a = this.state.auction;
    if (!a) throw new Denied('Nothing’s up for grabs yet.');
    if (m.role !== 'player' || !m.playerId) throw new Denied('Only players can bid.');
    const rp = g.round.players[m.playerId];
    if (!rp) throw new Denied('The Adjudicator doesn’t bid.');
    const cat = cardById(a.cardId).category;
    if (rp.kit[cat]) throw new Denied('You’ve already packed one of those.');
    if (a.high?.playerId === m.playerId) throw new Denied('You’re already the top bid.');
    const floor = a.high ? a.high.amount + 1 : RULES.minBid;
    const value = Math.floor(Number(amount));
    if (!Number.isFinite(value) || value < floor) throw new Denied(`The bid is already ${floor - 1}. Go higher.`);
    const cap = maxBid(rp.gold, rp.kit);
    if (value > cap) throw new Denied(`You can bid ${cap} at most and still afford a full bag.`);
    a.high = { playerId: m.playerId, amount: value };
    a.bids += 1;
    a.endsAt = Math.max(a.endsAt, this.now + TIMING.bidMs);
    const rivals = this.eligible(cat).filter((id) => id !== m.playerId);
    const canBeat = rivals.some((id) => maxBid(g.round.players[id].gold, g.round.players[id].kit) > value);
    if (!canBeat) a.endsAt = Math.min(a.endsAt, this.now + (rivals.length === 0 ? 900 : TIMING.settledMs));
  }

  private eligible(cat: Category): string[] {
    const r = this.g.round;
    return Object.entries(r.players)
      .filter(([, rp]) => !rp.kit[cat])
      .map(([id]) => id);
  }

  private deal() {
    const g = this.g;
    const needed = CATEGORIES.filter((c) => this.eligible(c).length > 0);
    const card = pickCard(needed, new Set(g.usedCards), this.rng);
    g.round.nextDealAt = null;
    if (!card) return;
    g.usedCards.push(card.id);
    this.state.auction = { cardId: card.id, high: null, endsAt: this.now + TIMING.openMs, bids: 0 };
  }

  private resolveAuction() {
    const a = this.state.auction;
    const g = this.g;
    if (!a) return;
    const card = cardById(a.cardId);
    const rp = a.high ? g.round.players[a.high.playerId] : null;
    if (a.high && rp && !rp.kit[card.category] && a.high.amount <= maxBid(rp.gold, rp.kit)) {
      rp.kit[card.category] = card.id;
      rp.gold -= a.high.amount;
      this.say(`${card.name} goes to ${this.name(a.high.playerId)} for ${a.high.amount} gold.`, 'sold', { by: a.high.playerId });
    } else {
      this.say(`No takers. ${card.name} stays behind.`);
    }
    this.state.auction = null;
    this.afterSale();
  }

  /** After every card: the halfway terrain reveal, the end of the deal, or the next card. */
  private afterSale() {
    const g = this.g;
    const r = g.round;
    const loc = r.location!;
    const all = Object.values(r.players);
    const total = all.length * CATEGORIES.length;
    const filled = all.reduce((n, rp) => n + (CATEGORIES.length - slotsLeft(rp.kit)), 0);
    let pause = TIMING.betweenCardsMs;
    if (!r.terrainRevealed && (filled >= Math.ceil(total / 2) || filled === total)) {
      r.terrainRevealed = true;
      r.terrainAt = this.now;
      this.say(`It’s the ${loc.name}.`, 'terrain');
      pause = TIMING.terrainMs;
    }
    if (filled === total) {
      r.days = {};
      for (const [id, rp] of Object.entries(r.players)) r.days[id] = survivalDays(CATEGORIES.map((c) => rp.kit[c]!), loc);
      g.phase = 'odds';
      r.nextDealAt = null;
      return;
    }
    if (!this.state.auction) r.nextDealAt = this.now + pause;
  }

  private backToLobby() {
    this.state.game = null;
    this.state.auction = null;
    this.state.clock = { remainingMs: PITCH_MS, runningSince: null };
    // Player ids go back to lobby ids so the same people can play again.
    const lobby = this.state.lobby;
    const map = new Map(lobby.map((l, i) => [`p${i + 1}`, l.id]));
    for (const seat of Object.values(this.state.seats)) if (seat.playerId) seat.playerId = map.get(seat.playerId) ?? seat.playerId;
    const seen: Record<string, number> = {};
    for (const [k, v] of Object.entries(this.state.lastSeen)) seen[map.get(k) ?? k] = v;
    this.state.lastSeen = seen;
    this.say('Back at the departure lounge.');
  }

  /* ------------------------------------------------------------------ */
  /*  Timers                                                             */
  /* ------------------------------------------------------------------ */
  nextAlarm(): number | null {
    const times: number[] = [];
    if (this.state.auction) times.push(this.state.auction.endsAt);
    const g = this.state.game;
    if (g?.phase === 'deal' && g.round.nextDealAt) times.push(g.round.nextDealAt);
    if (g?.phase === 'reveal') times.push(g.round.revealAt + revealDurationMs(Object.keys(g.round.players).length));
    return times.length ? Math.min(...times) : null;
  }

  tick(now: number): boolean {
    this.now = now;
    const g = this.state.game;
    if (!g) return false;
    let changed = false;
    if (g.phase === 'deal' && this.state.auction && now >= this.state.auction.endsAt - 20) {
      this.resolveAuction();
      changed = true;
    }
    if (g.phase === 'deal' && !this.state.auction && g.round.nextDealAt && now >= g.round.nextDealAt - 20) {
      this.deal();
      changed = true;
    }
    if (g.phase === 'reveal' && now >= g.round.revealAt + revealDurationMs(Object.keys(g.round.players).length) - 20) {
      const r = g.round;
      const winner = g.players.find((p) => p.id === r.winnerId);
      if (winner) winner.wins += 1;
      g.results.push({ round: g.roundIndex + 1, location: r.location?.name ?? '', adjudicatorId: r.adjudicatorId, winnerId: r.winnerId ?? '' });
      g.phase = 'roundEnd';
      changed = true;
    }
    return changed;
  }

  /* ------------------------------------------------------------------ */
  /*  What each phone sees                                               */
  /* ------------------------------------------------------------------ */
  viewFor(m: Meta, online: Set<string>, now: number): View {
    const s = this.state;
    const g = s.game;
    this.online = online;
    this.now = now;
    const hostId = s.hostToken ? s.seats[s.hostToken]?.playerId ?? null : null;
    let game: View['game'] = null;
    if (g) {
      const r = g.round;
      const showOdds = ODDS_PHASES.includes(g.phase);
      const showRanking = g.phase === 'reveal' || g.phase === 'roundEnd' || g.phase === 'final';
      game = {
        phase: g.phase,
        players: g.players,
        rota: g.rota,
        results: g.results,
        round: {
          number: g.roundIndex + 1,
          adjudicatorId: r.adjudicatorId,
          temp: r.location?.temp ?? null,
          terrain: r.terrainRevealed ? r.location?.name ?? null : null,
          terrainAt: r.terrainAt,
          players: r.players,
          bonusFor: r.bonusFor,
          days: showOdds ? r.days : null,
          pitchOrder: r.pitchOrder,
          pitchIndex: r.pitchIndex,
          ranking: showRanking ? r.ranking : null,
          drop: showRanking ? r.drop : null,
          revealAt: r.revealAt,
          winnerId: showRanking ? r.winnerId : null,
          nextDealAt: r.nextDealAt,
        },
      };
    }
    return {
      code: s.code,
      serverNow: now,
      you: { role: m.role, playerId: m.playerId, isHost: this.isHost(m) },
      host: { playerId: hostId, away: this.hostAway() },
      lobby: s.lobby,
      online: [...online],
      game,
      auction: s.auction,
      clock: s.clock,
      event: s.event,
    };
  }
}
