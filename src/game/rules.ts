/**
 * The EXILE rulebook as numbers and pure functions. Shared by the room server
 * and the phones, so everyone always agrees.
 */
import { CARDS, CATEGORIES, LOCATIONS, cardById } from '../data/cards';
import type { Card, Category, Location } from '../data/cards';

export const RULES = {
  minPlayers: 3,
  maxPlayers: 8,
  goldPerRound: 15, // a fresh stack every round; leftovers are lost
  winnerBonusGold: 1, // the last Secret Survivalist starts the next round with one extra bar
  minBid: 1,
  pitchSeconds: 120,
};

/** Timings, in milliseconds. */
export const TIMING = {
  firstDealMs: 3800, // time to take in the temperature before the first card
  betweenCardsMs: 2600, // pause after a sale before the next card
  openMs: 14000, // time for a first bid before the card is binned
  bidMs: 7000, // each new bid resets the clock to at least this
  settledMs: 2200, // nobody else can top it: sold quickly
  terrainMs: 4500, // how long the terrain reveal fills the screen
  revealLeadMs: 1500, // pause before the day counter starts
  revealStepMs: 2600, // time between each survivor dropping out
  revealTailMs: 3500, // after the last one standing is crowned
  debunkMs: 4200, // the DEBUNKED stamp stays on screen this long
  hostAwayMs: 20000,
};

export const PALETTE: Record<string, { name: string; bg: string; fg: string }> = {
  terracotta: { name: 'Terracotta', bg: '#963417', fg: '#F4E0A8' },
  acqua: { name: 'Acqua', bg: '#628981', fg: '#F4E0A8' },
  espresso: { name: 'Espresso', bg: '#542916', fg: '#F1C166' },
  porcelain: { name: 'Porcelain', bg: '#88B8CE', fg: '#3E3B22' },
  ochre: { name: 'Eau Trouble', bg: '#B79858', fg: '#3E3B22' },
  solace: { name: 'Solace', bg: '#CF893A', fg: '#3E3B22' },
  moss: { name: 'Moss', bg: '#5E6B3A', fg: '#F4E0A8' },
  miel: { name: 'Miel Doré', bg: '#F1C166', fg: '#542916' },
};
export const PALETTE_KEYS = Object.keys(PALETTE);

export const emptyKit = (): Record<Category, string | null> => ({ PARTNER: null, TOOL: null, FOOD: null, ANIMAL: null, ENJOYMENT: null });

export const slotsLeft = (kit: Record<Category, string | null>) => CATEGORIES.filter((c) => !kit[c]).length;

/** Keep one bar back for every other empty slot, so nobody can go bust mid-deal. */
export const maxBid = (gold: number, kit: Record<Category, string | null>) => gold - Math.max(0, slotsLeft(kit) - 1);

/** One card's worth on this ground, after the weather and the water have had their say. */
export function cardScore(card: Card, loc: Location) {
  let { body, mind, supply } = card;
  const t = card.tags;
  if (loc.temp === 'FREEZING') {
    if (t.includes('c')) { body += 1; supply += 1; }
    if (t.includes('h')) body -= 1;
  }
  if (loc.temp === 'SCORCHING') {
    if (t.includes('h')) { body += 1; supply += 1; }
    if (t.includes('c')) body -= 1;
    if (t.includes('p')) supply -= 2;
  }
  if (t.includes('w')) supply += loc.water ? 2 : -1;
  const clamp = (n: number) => Math.max(0, Math.min(6, n));
  return { body: clamp(body), mind: clamp(mind), supply: clamp(supply) };
}

/** What the data suggests: how many days this kit keeps you alive. Kept off every screen until the odds phase. */
export function survivalDays(kitIds: string[], loc: Location): number {
  let body = 0, mind = 0, supply = 0;
  for (const id of kitIds) {
    const s = cardScore(cardById(id), loc);
    body += s.body; mind += s.mind; supply += s.supply;
  }
  // Across five random cards the weighted score runs from about 34 to 78 (median 55).
  const score = body * 1.25 + mind * 1.0 + supply * 1.45;
  // A kit with one gaping hole (no food, no morale) doesn't last.
  const weakest = Math.min(body, mind, supply);
  const penalty = weakest < 8 ? 0.7 : 1;
  const x = Math.max(0, Math.min(1.1, (score - 34) / 46));
  return Math.max(2, Math.round((3 + Math.pow(x, 1.8) * 300) * penalty));
}

/** Cards not yet seen this game, for categories at least one bidder still needs. */
export function pickCard(needed: Category[], used: Set<string>, rng: () => number = Math.random): Card | null {
  const open = needed.filter((c) => CARDS[c].some((card) => !used.has(card.id)));
  if (!open.length) return null;
  const cat = open[Math.floor(rng() * open.length)];
  const pool = CARDS[cat].filter((card) => !used.has(card.id));
  return pool[Math.floor(rng() * pool.length)];
}

export function pickLocation(usedNames: string[], rng: () => number = Math.random): Location {
  let pool = LOCATIONS.filter((l) => !usedNames.includes(l.name));
  if (!pool.length) pool = LOCATIONS;
  return pool[Math.floor(rng() * pool.length)];
}

export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * The verdict reveal. The Adjudicator ranks the survivors (first = last one standing).
 * The days on the counter come from the data, handed out in the Adjudicator's order:
 * the first out gets the smallest number, the survivor the biggest.
 */
export function dropDays(ranking: string[], days: Record<string, number>): Record<string, number> {
  const values = ranking.map((id) => days[id] ?? 1).sort((a, b) => a - b);
  const out: Record<string, number> = {};
  const losersFirst = [...ranking].reverse();
  let last = 0;
  losersFirst.forEach((id, i) => {
    const d = Math.max(values[i], last + 1);
    out[id] = d;
    last = d;
  });
  return out;
}

export const revealDurationMs = (n: number) => TIMING.revealLeadMs + n * TIMING.revealStepMs + TIMING.revealTailMs;
