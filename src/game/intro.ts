/**
 * The intro script: a dark, text-led opening. Each beat has one small symbol,
 * a story line, and sometimes a smaller explainer line under it.
 */
export interface IntroBeat {
  glyph: 'door' | 'envelope' | 'suitcase' | 'crates' | 'gold' | 'thermo' | 'chair' | 'plane';
  lines: { text: string; small?: boolean }[];
  knock?: boolean;
  stamp?: string;
}

export const INTRO: IntroBeat[] = [
  { glyph: 'door', knock: true, lines: [{ text: 'Knock knock.' }] },
  {
    glyph: 'envelope',
    stamp: 'Exiled',
    lines: [{ text: 'You have all been exiled from your home country.' }, { text: 'Effective immediately.', small: true }],
  },
  {
    glyph: 'suitcase',
    lines: [{ text: 'Each of you is handed a suitcase.' }, { text: 'Inside: 20 gold bars. A burner phone. A one-way ticket.', small: true }],
  },
  {
    glyph: 'crates',
    lines: [
      { text: 'The jet can carry five things for each of you.' },
      { text: 'A famous partner. A survival tool. Food. An animal. And something to keep you sane.', small: true },
    ],
  },
  {
    glyph: 'gold',
    lines: [
      { text: 'Bid your gold to win them.' },
      { text: 'Outbid each other, or pass and save it for later. Gold doesn’t fly. Whatever you don’t spend stays behind.', small: true },
    ],
  },
  {
    glyph: 'thermo',
    lines: [{ text: 'We can tell you the temperature where you’re heading.' }, { text: 'Not the place. You’ll find that out as you land.', small: true }],
  },
  {
    glyph: 'chair',
    lines: [
      { text: 'Each round, one of you stays behind.' },
      { text: 'They’re the Adjudicator. Once you land, pitch them why you’ll last the longest. They decide who survives.', small: true },
    ],
  },
  { glyph: 'plane', lines: [{ text: 'Fasten your seatbelts.' }, { text: 'Wheels up.' }] },
];
