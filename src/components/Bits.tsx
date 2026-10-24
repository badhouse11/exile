/**
 * The pieces every screen shares: a card face, a bag of five slots,
 * the temperature gauge, player dots and the battery badge.
 */
import { CATEGORIES, CATEGORY_LABELS, cardById } from '../data/cards';
import type { Category, Temp } from '../data/cards';
import { PALETTE } from '../game/rules';
import type { Player } from '../net/protocol';
import { Battery, CategoryGlyph, HaloGlyph, ThermoGlyph } from './Icons';

export const BatteryBadge = ({ battery }: { battery: string }) =>
  battery ? (
    <span className="battery">
      <Battery />
      {battery === 'solar' ? 'Solar' : `${battery} ${battery === '1' ? 'day' : 'days'}`}
    </span>
  ) : null;

export function CardFace({ id, compact = false }: { id: string; compact?: boolean }) {
  const c = cardById(id);
  const cat = CATEGORY_LABELS[c.category];
  const label = c.dead ? 'Back from the dead' : c.legendary ? `Legendary ${cat.toLowerCase()}` : c.category === 'PARTNER' ? `${cat} · ${c.kind}` : cat;
  const sub = c.dead ? '' : c.kind === 'Film' ? 'Film on DVD' : c.legendary ? '' : c.category === 'PARTNER' ? '' : c.kind;
  return (
    <article className={`card rise ${c.legendary ? 'legend' : ''}`} key={id}>
      <div className={`band ${c.legendary ? '' : `cat-${c.category}`}`}>
        <span>{label}</span>
        {sub && <span>{sub}</span>}
      </div>
      {!compact && (
        <div className={`art ${c.legendary ? '' : `ink-${c.category}`}`} style={c.legendary ? { color: 'var(--miel)' } : undefined}>
          {c.dead ? <HaloGlyph /> : <CategoryGlyph category={c.category} />}
        </div>
      )}
      <div className="name">{c.name}</div>
      {c.note && <div className="note">{c.note}</div>}
      {c.battery && (
        <div className="foot">
          {c.kind === 'Film' ? (
            <span className="battery">
              <Battery /> DVD player · {c.battery} {c.battery === '1' ? 'day' : 'days'}
            </span>
          ) : (
            <BatteryBadge battery={c.battery} />
          )}
        </div>
      )}
    </article>
  );
}

export function Kit({ kit }: { kit: Record<Category, string | null> }) {
  return (
    <div className="kit">
      {CATEGORIES.map((cat) => {
        const id = kit[cat];
        const c = id ? cardById(id) : null;
        return (
          <div key={cat} className={`slot ${c ? `filled ${c.legendary ? 'legend' : `cat-${cat}`}` : 'empty'}`}>
            <span className="label">{cat === 'ENJOYMENT' ? 'Fun' : cat === 'TOOL' ? 'Tool' : CATEGORY_LABELS[cat]}</span>
            <span className="what">{c ? c.name : 'Empty'}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Five little squares: which slots a player has filled. */
export function Ticks({ kit }: { kit: Record<Category, string | null> }) {
  return (
    <span className="ticks" aria-label={`${CATEGORIES.filter((c) => kit[c]).length} of 5 packed`}>
      {CATEGORIES.map((cat) => (
        <i key={cat} className={kit[cat] ? `on cat-${cat}` : ''} />
      ))}
    </span>
  );
}

export const Dot = ({ colour }: { colour: string }) => <span className="dot" style={{ background: PALETTE[colour]?.bg ?? 'var(--ink)' }} />;

export const nameOf = (players: Player[], id: string | null | undefined) => players.find((p) => p.id === id)?.name ?? '…';

const LEVEL: Record<Temp, number> = { FREEZING: 0.12, MILD: 0.5, SCORCHING: 0.95 };

export function Gauge({ temp, terrain }: { temp: Temp | null; terrain: string | null }) {
  if (!temp) return null;
  return (
    <div className="gauge">
      <ThermoGlyph level={LEVEL[temp]} className={`thermo-${temp}`} />
      <div>
        <div className="temp" style={{ color: temp === 'FREEZING' ? '#3f7590' : temp === 'SCORCHING' ? 'var(--terra)' : 'var(--moss)' }}>
          {temp}
        </div>
        <div className={`terrain ${terrain ? '' : 'unknown'}`}>{terrain ?? '? ? ?'}</div>
      </div>
    </div>
  );
}

export const tempColour = (temp: Temp | null) => (temp === 'FREEZING' ? '#3f7590' : temp === 'SCORCHING' ? 'var(--terra)' : 'var(--moss)');
