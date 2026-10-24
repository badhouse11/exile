/**
 * Chunky lino-cut glyphs. Bold, flat shapes in currentColor, roughened by the
 * #lino-cut filter so they look pressed rather than drawn.
 */
import type { ReactNode } from 'react';
import type { Category } from '../data/cards';

type P = { className?: string; title?: string };

const Svg = ({ children, className, title, rough = true }: P & { children: ReactNode; rough?: boolean }) => (
  <svg viewBox="0 0 100 100" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
    <g fill="currentColor" filter={rough ? 'url(#lino-cut)' : undefined}>
      {children}
    </g>
  </svg>
);

/** A sun with a face: the EXILE mark. */
export const Sun = (p: P) => (
  <Svg {...p}>
    {Array.from({ length: 14 }, (_, i) => (
      <path key={i} d="M50 4 L57 26 L43 26 Z" transform={`rotate(${(360 / 14) * i} 50 50)`} />
    ))}
    <circle cx="50" cy="50" r="25" />
    <g fill="var(--paper, #F4E0A8)">
      <ellipse cx="41.5" cy="45" rx="3.2" ry="4.4" />
      <ellipse cx="58.5" cy="45" rx="3.2" ry="4.4" />
      <path d="M49 47 L51 47 L52 55 L48 55 Z" />
    </g>
    <path d="M41 60 Q50 66 59 60" fill="none" stroke="var(--paper, #F4E0A8)" strokeWidth="2.6" strokeLinecap="round" />
  </Svg>
);

export const PersonGlyph = (p: P) => (
  <Svg {...p}>
    <circle cx="50" cy="30" r="17" />
    <path d="M18 92 C18 62 30 52 50 52 C70 52 82 62 82 92 Z" />
  </Svg>
);

export const AxeGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M60 14 L70 19 L32 94 L22 89 Z" />
    <path d="M50 10 C58 2 74 2 84 10 C92 18 94 32 88 44 C82 36 74 32 66 32 L58 30 Z" />
  </Svg>
);

export const FishGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M8 50 C24 26 52 20 72 36 L92 22 L86 50 L92 78 L72 64 C52 80 24 74 8 50 Z" />
    <circle cx="27" cy="45" r="5" fill="var(--paper, #F4E0A8)" />
    <path d="M44 34 C50 44 50 56 44 66 L48 66 C55 56 55 44 48 34 Z" fill="var(--paper, #F4E0A8)" />
  </Svg>
);

export const PawGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M50 48 C66 48 80 64 78 78 C76 90 62 88 50 86 C38 88 24 90 22 78 C20 64 34 48 50 48 Z" />
    <ellipse cx="20" cy="40" rx="9" ry="12" transform="rotate(-20 20 40)" />
    <ellipse cx="37" cy="22" rx="9" ry="13" transform="rotate(-8 37 22)" />
    <ellipse cx="63" cy="22" rx="9" ry="13" transform="rotate(8 63 22)" />
    <ellipse cx="80" cy="40" rx="9" ry="12" transform="rotate(20 80 40)" />
  </Svg>
);

export const StarGlyph = (p: P) => (
  <Svg {...p}>
    {Array.from({ length: 8 }, (_, i) => (
      <path key={i} d="M50 6 C56 30 56 30 50 50 C44 30 44 30 50 6 Z" transform={`rotate(${45 * i} 50 50)`} />
    ))}
    <circle cx="50" cy="50" r="12" />
  </Svg>
);

/** Back from the dead: a bust with a halo. */
export const HaloGlyph = (p: P) => (
  <Svg {...p}>
    <ellipse cx="50" cy="13" rx="20" ry="6.5" fill="none" stroke="currentColor" strokeWidth="5" />
    <circle cx="50" cy="38" r="15" />
    <path d="M20 94 C20 66 32 57 50 57 C68 57 80 66 80 94 Z" />
  </Svg>
);

export const PlaneGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M46 8 C50 4 54 8 54 14 L54 40 L90 60 L90 68 L54 56 L54 80 L64 88 L64 94 L50 90 L36 94 L36 88 L46 80 L46 56 L10 68 L10 60 L46 40 L46 14 C46 11 46 9 46 8 Z" />
  </Svg>
);

export const ThermoGlyph = ({ level = 0.5, ...p }: P & { level?: number }) => (
  <Svg {...p}>
    <path d="M38 14 C38 6 62 6 62 14 L62 60 C72 66 76 74 76 80 C76 94 64 98 50 98 C36 98 24 94 24 80 C24 74 28 66 38 60 Z" />
    <rect x="44" y={14 + (1 - level) * 52} width="12" height={66 - (1 - level) * 52} rx="5" fill="var(--paper, #F4E0A8)" />
    <circle cx="50" cy="80" r="10" fill="var(--paper, #F4E0A8)" />
  </Svg>
);

export const GoldGlyph = (p: P) => (
  <Svg {...p}>
    <path d="M14 70 L26 44 L74 44 L86 70 Z" />
    <path d="M30 40 L40 18 L76 18 L86 40 Z" opacity="0.85" />
  </Svg>
);

export const Battery = ({ className }: P) => (
  <svg viewBox="0 0 20 11" className={className} aria-hidden="true">
    <rect x="0.8" y="0.8" width="15.4" height="9.4" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <rect x="16.8" y="3.2" width="2.4" height="4.6" rx="0.6" fill="currentColor" />
    <rect x="2.8" y="2.8" width="7.5" height="5.4" fill="currentColor" />
  </svg>
);

export const CategoryGlyph = ({ category, className }: { category: Category; className?: string }) => {
  switch (category) {
    case 'PARTNER':
      return <PersonGlyph className={className} />;
    case 'TOOL':
      return <AxeGlyph className={className} />;
    case 'FOOD':
      return <FishGlyph className={className} />;
    case 'ANIMAL':
      return <PawGlyph className={className} />;
    case 'ENJOYMENT':
      return <StarGlyph className={className} />;
  }
};
