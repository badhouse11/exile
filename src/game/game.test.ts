/**
 * Plays whole games of EXILE through the room logic, phone by phone, with a fake clock.
 * Run with: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARDS, CATEGORIES, LOCATIONS } from '../data/cards';
import { RoomCore, newRoom } from '../net/room-core';
import type { Meta } from '../net/room-core';
import type { ClientMsg } from '../net/protocol';
import { RULES, maxBid, survivalDays } from './rules';

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function playGame(n: number, seed: number) {
  const rng = seeded(seed);
  let now = 1_000_000;
  const core = new RoomCore(newRoom('ABCD', now));
  core.rng = rng;
  const metas: Meta[] = [];
  const online = () => new Set(metas.map((m) => m.playerId!).filter(Boolean));
  const send = (i: number, msg: ClientMsg) => {
    const out = core.handle(metas[i], msg, now, online());
    if (out.meta) metas[i] = out.meta;
    // Like the real host: seats can change under a phone (game start), so keep identities current.
    for (let j = 0; j < metas.length; j++) {
      const seat = metas[j].token ? core.state.seats[metas[j].token!] : undefined;
      if (seat) metas[j] = { token: metas[j].token, role: seat.role, playerId: seat.playerId };
    }
    core.tick(now);
    return out;
  };
  // Host creates the room, everyone joins.
  metas.push({ token: null, role: 'guest', playerId: null });
  assert.equal(send(0, { t: 'hello', create: true }).reply?.t, 'welcome');
  for (let i = 0; i < n; i++) {
    if (i > 0) {
      metas.push({ token: null, role: 'guest', playerId: null });
      send(i, { t: 'hello' });
    }
    const out = send(i, { t: 'join', name: `Player ${i + 1}`, colour: 'terracotta' });
    assert.notEqual(out.reply?.t, 'error', JSON.stringify(out.reply));
  }
  assert.equal(new Set(core.state.lobby.map((l) => l.colour)).size, n, 'colours are unique');
  assert.equal(send(0, { t: 'start' }).reply, undefined);
  const g = core.state.game!;
  assert.equal(g.rota.length, n);

  const idx = (playerId: string) => metas.findIndex((m) => m.playerId === playerId);
  const advance = (ms: number) => {
    now += ms;
    core.tick(now);
  };

  for (let round = 0; round < n; round++) {
    const r = g.round;
    assert.equal(g.phase, 'briefing');
    const adj = idx(r.adjudicatorId);
    // Someone else can't take off.
    assert.equal(send((adj + 1) % n, { t: 'act', action: { a: 'takeOff' } }).reply?.t, 'error');
    send(adj, { t: 'act', action: { a: 'takeOff' } });
    assert.equal(g.phase, 'deal');
    assert.ok(r.location);
    const view = core.viewFor(metas[(adj + 1) % n], online(), now);
    assert.equal(view.game!.round.terrain, null, 'terrain hidden at first');
    assert.equal(view.game!.round.days, null, 'days hidden during the deal');

    let guard = 0;
    while (g.phase === 'deal') {
      if (++guard > 2000) throw new Error('deal never finished');
      if (!core.state.auction) {
        advance(500);
        continue;
      }
      const a = core.state.auction;
      const cat = CARDS[a.cardId.split('-')[0] as keyof typeof CARDS] ? (a.cardId.split('-')[0] as keyof typeof CARDS) : 'PARTNER';
      // A random eligible player bids, sometimes nobody does.
      const eligible = Object.entries(r.players).filter(([, rp]) => !rp.kit[cat]);
      assert.ok(eligible.length > 0, 'every dealt card has someone who needs it');
      // Sometimes everyone passes: the card goes quickly.
      if (!a.high && rng() < 0.12) {
        for (const [pid] of eligible) {
          const out = send(idx(pid), { t: 'act', action: { a: 'pass' } });
          assert.equal(out.reply, undefined, JSON.stringify(out.reply));
        }
        assert.ok(core.state.auction!.endsAt <= now + 1000, 'all passed: settles fast');
        advance(1000);
        assert.equal(core.state.auction?.cardId === a.cardId, false, 'passed card is gone');
        continue;
      }
      if (rng() < 0.85) {
        const [pid, rp] = eligible[Math.floor(rng() * eligible.length)];
        const floor = a.high ? a.high.amount + 1 : 1;
        const cap = maxBid(rp.gold, rp.kit);
        if (a.high?.playerId !== pid && cap >= floor) {
          const amount = floor + Math.floor(rng() * Math.min(3, cap - floor + 1));
          const out = send(idx(pid), { t: 'act', action: { a: 'bid', amount } });
          assert.notEqual(out.reply?.t, 'error', JSON.stringify(out.reply));
        } else {
          // Over-bidding is refused.
          const out = send(idx(pid), { t: 'act', action: { a: 'bid', amount: cap + 50 } });
          assert.equal(out.reply?.t, 'error');
        }
      }
      advance(3000);
      // Nobody ever goes bust.
      for (const rp of Object.values(r.players)) assert.ok(rp.gold >= 0);
    }
    assert.equal(g.phase, 'landing');
    assert.ok(r.terrainRevealed);
    send(adj, { t: 'act', action: { a: 'seeData' } });
    assert.equal(g.phase, 'odds');
    assert.equal(send(adj, { t: 'act', action: { a: 'toPitches' } }).reply?.t, 'error', 'data first');
    const before = core.viewFor(metas[(adj + 1) % n], online(), now);
    assert.equal(before.game!.round.days, null, 'no data until revealed');
    for (let k = 0; k < r.dataOrder.length; k++) {
      send(adj, { t: 'act', action: { a: 'nextData' } });
      const v = core.viewFor(metas[(adj + 1) % n], online(), now);
      assert.equal(Object.keys(v.game!.round.days!).length, k + 1, 'one more player revealed');
    }
    for (const rp of Object.values(r.players)) for (const c of CATEGORIES) assert.ok(rp.kit[c], 'every slot filled');
    assert.ok(Object.values(r.days!).every((d) => d >= 2));

    send(adj, { t: 'act', action: { a: 'toPitches' } });
    assert.equal(g.phase, 'pitch');
    // Two players try to debunk the first pitch: each can, once per game.
    const pitcher = r.pitchOrder[0];
    const debunker = Object.keys(r.players).find((id) => id !== pitcher && !g.players.find((p) => p.id === id)!.debunkUsed);
    if (debunker) {
      const out = send(idx(debunker), { t: 'act', action: { a: 'debunk' } });
      assert.equal(out.reply, undefined);
      assert.equal(core.state.event?.tone, 'debunk');
      assert.equal(send(idx(debunker), { t: 'act', action: { a: 'debunk' } }).reply?.t, 'error', 'one debunk per game');
    }
    assert.equal(send(adj, { t: 'act', action: { a: 'debunk' } }).reply?.t, 'error', 'Adjudicator cannot debunk');
    send(adj, { t: 'act', action: { a: 'clockStart' } });
    advance(5000);
    send(adj, { t: 'act', action: { a: 'clockPause' } });
    assert.ok(core.state.clock.remainingMs <= RULES.pitchSeconds * 1000 - 5000);
    for (let i = 0; i < r.pitchOrder.length; i++) send(adj, { t: 'act', action: { a: 'nextPitch' } });
    assert.equal(g.phase, 'verdict');

    const ids = Object.keys(r.players);
    // Missing a player, or a tie at the top, is refused.
    assert.equal(send(adj, { t: 'act', action: { a: 'verdict', days: { [ids[0]]: 10 } } }).reply?.t, 'error');
    const tied = Object.fromEntries(ids.map((id) => [id, 50]));
    assert.equal(send(adj, { t: 'act', action: { a: 'verdict', days: tied } }).reply?.t, 'error', 'no tie at the top');
    // The Adjudicator overrules the data.
    const verdict = Object.fromEntries(ids.map((id, i) => [id, (r.days![id] ?? 10) + Math.round(rng() * 40) + i * 1000 * 0 + i]));
    const top = Math.max(...Object.values(verdict));
    const leaders = ids.filter((id) => verdict[id] === top);
    if (leaders.length > 1) verdict[leaders[0]] += 1;
    send(adj, { t: 'act', action: { a: 'verdict', days: verdict } });
    assert.equal(g.phase, 'reveal');
    const order = r.revealOrder!;
    for (let i = 1; i < order.length; i++) assert.ok(verdict[order[i]] >= verdict[order[i - 1]], 'shortest first');
    const winner = order[order.length - 1];
    assert.equal(r.winnerId, winner);
    advance(60_000);
    assert.equal(g.phase, 'roundEnd');
    assert.equal(g.results.length, round + 1);
    send(adj, { t: 'act', action: { a: 'nextRound' } });
    if (round < n - 1) {
      assert.equal(g.round.players[winner]?.gold ?? RULES.goldPerRound + 1, RULES.goldPerRound + 1, 'winner bonus bar');
    }
  }
  assert.equal(g.phase, 'final');
  assert.equal(g.players.reduce((s, p) => s + p.wins, 0), n, 'one Secret Survivalist per round');
  // Every Adjudicator served once.
  assert.deepEqual([...g.results.map((x) => x.adjudicatorId)].sort(), [...g.rota].sort());
  // No card dealt twice.
  assert.equal(new Set(g.usedCards).size, g.usedCards.length);
  // Play again.
  send(0, { t: 'act', action: { a: 'backToLobby' } });
  assert.equal(core.state.game, null);
  assert.equal(send(0, { t: 'start' }).reply, undefined);
}

for (const n of [3, 4, 5, 6, 8]) {
  test(`a full game for ${n} players`, () => {
    for (let s = 1; s <= 4; s++) playGame(n, s * 97 + n);
  });
}

test('the data gives a sensible spread of days', () => {
  const rng = seeded(7);
  const all: number[] = [];
  for (let i = 0; i < 4000; i++) {
    const kit = CATEGORIES.map((c) => CARDS[c][Math.floor(rng() * CARDS[c].length)].id);
    all.push(survivalDays(kit, LOCATIONS[Math.floor(rng() * LOCATIONS.length)]));
  }
  all.sort((a, b) => a - b);
  const pct = (p: number) => all[Math.floor((all.length - 1) * p)];
  console.log(`days: min ${all[0]}, 10% ${pct(0.1)}, median ${pct(0.5)}, 90% ${pct(0.9)}, max ${all[all.length - 1]}`);
  assert.ok(pct(0.5) > 10 && pct(0.5) < 200);
  assert.ok(all[all.length - 1] < 600);
});
