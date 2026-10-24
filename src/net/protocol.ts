/**
 * The wire format between the room server and every phone in the room.
 * Shared by the server (Cloudflare) and the browser, so both always agree.
 */
import type { Category, Temp } from '../data/cards';
import type { Breakdown } from '../game/rules';

export type Role = 'screen' | 'player' | 'guest';

export type Phase = 'intro' | 'briefing' | 'deal' | 'landing' | 'odds' | 'pitch' | 'verdict' | 'reveal' | 'roundEnd' | 'final';

export interface Player {
  id: string;
  name: string;
  colour: string;
  wins: number;
  debunkUsed: boolean;
}

export interface RoundPlayer {
  gold: number;
  kit: Record<Category, string | null>;
}

export interface Auction {
  cardId: string;
  high: { playerId: string; amount: number } | null;
  endsAt: number; // server clock, ms
  bids: number;
  passed: string[]; // players who've said no to this one
}

export interface Clock {
  remainingMs: number;
  runningSince: number | null;
}

export interface RoundResult {
  round: number;
  location: string;
  adjudicatorId: string;
  winnerId: string;
}

/** The public face of a round. Secrets are blanked until their moment. */
export interface RoundView {
  number: number; // 1-based
  adjudicatorId: string;
  temp: Temp | null;
  terrain: string | null; // null until revealed
  terrainAt: number; // when the terrain was revealed (for the big reveal moment)
  players: Record<string, RoundPlayer>;
  bonusFor: string | null;
  days: Record<string, number> | null; // the data, revealed one player at a time
  breakdown: Record<string, Breakdown> | null;
  dataOrder: string[]; // the order the data is revealed in, lowest first
  dataStep: number; // how many players' data is showing
  pitchOrder: string[];
  pitchIndex: number;
  verdict: Record<string, number> | null; // the Adjudicator's days, shown once the reveal starts
  revealOrder: string[] | null; // shortest survival first, the Secret Survivalist last
  revealAt: number;
  winnerId: string | null;
  nextDealAt: number | null;
}

/** The opening story. The host starts it and sets the pace for every phone. */
export interface Intro {
  started: boolean;
  step: number;
}

export interface GameView {
  phase: Phase;
  intro: Intro;
  players: Player[];
  rota: string[]; // adjudicator order, one round each
  round: RoundView;
  results: RoundResult[];
}

export interface LobbyPlayer {
  id: string;
  name: string;
  colour: string;
}

export interface RoomEvent {
  id: number;
  text: string;
  tone?: 'sold' | 'terrain' | 'debunk' | 'info';
  by?: string;
  target?: string;
  at: number;
}

/** Everything one device is allowed to know, right now. */
export interface View {
  code: string;
  serverNow: number;
  you: { role: Role; playerId: string | null; isHost: boolean };
  host: { playerId: string | null; away: boolean };
  lobby: LobbyPlayer[];
  online: string[];
  game: GameView | null;
  auction: Auction | null;
  clock: Clock;
  event: RoomEvent | null;
}

export type Action =
  | { a: 'introPlay' }
  | { a: 'introNext' }
  | { a: 'introSkip' }
  | { a: 'takeOff' }
  | { a: 'bid'; amount: number }
  | { a: 'pass' }
  | { a: 'seeData' }
  | { a: 'nextData' }
  | { a: 'toPitches' }
  | { a: 'clockStart' }
  | { a: 'clockPause' }
  | { a: 'clockReset' }
  | { a: 'nextPitch' }
  | { a: 'debunk' }
  | { a: 'verdict'; days: Record<string, number> }
  | { a: 'nextRound' }
  | { a: 'autoFill'; playerId: string }
  | { a: 'kick'; playerId: string }
  | { a: 'backToLobby' };

export type ClientMsg =
  | { t: 'hello'; token?: string | null; create?: boolean }
  | { t: 'join'; name: string; colour: string }
  | { t: 'takeover'; playerId: string }
  | { t: 'watch' }
  | { t: 'start' }
  | { t: 'act'; action: Action }
  | { t: 'ping' };

export type ServerMsg =
  | { t: 'welcome'; token: string | null; role: Role; playerId: string | null }
  | { t: 'state'; view: View }
  | { t: 'error'; message: string }
  | { t: 'pong'; serverNow: number };

/** Room codes avoid letters that read badly across a room (I, O, Q, S, Z). */
export const CODE_LETTERS = 'ABCDEFGHJKLMNPRTUVWXY';
export const makeRoomCode = (rng: () => number = Math.random) =>
  Array.from({ length: 4 }, () => CODE_LETTERS[Math.floor(rng() * CODE_LETTERS.length)]).join('');
export const isRoomCode = (s: string) => new RegExp(`^[${CODE_LETTERS}]{4}$`).test(s);
