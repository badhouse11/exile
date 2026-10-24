/**
 * One component per moment of a round. Every phone renders the same moment;
 * what you can press depends on whether you're bidding, judging or watching.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { CardFace, Dot, Kit, Ticks, nameOf, tempColour } from '../components/Bits';
import { GoldGlyph, PlaneGlyph, Sun, ThermoGlyph } from '../components/Icons';
import { CATEGORIES, cardById } from '../data/cards';
import { BREAKDOWN_MAX, MAX_VERDICT_DAYS, RULES, TIMING, maxBid, revealTimeline } from '../game/rules';
import type { GameView, Player, View } from '../net/protocol';
import type { Room } from '../net/useRoom';
import Intro from './Intro';

interface Ctx {
  view: View;
  room: Room;
  now: number;
}

function useCtx({ view, room, now }: Ctx) {
  const g = view.game!;
  const r = g.round;
  const me = view.you.role === 'player' ? view.you.playerId : null;
  const isAdj = !!me && me === r.adjudicatorId;
  const adjAway = !view.online.includes(r.adjudicatorId);
  const canRun = isAdj || (view.you.isHost && adjAway && view.you.role === 'player');
  const isScreen = view.you.role === 'screen';
  return { g, r, me, isAdj, canRun, isScreen, act: room.act, now, view };
}

export default function Phase(props: Ctx) {
  switch (props.view.game!.phase) {
    case 'intro':
      return <Intro view={props.view} room={props.room} />;
    case 'briefing':
      return <Briefing {...props} />;
    case 'deal':
      return <Deal {...props} />;
    case 'landing':
      return <Landing {...props} />;
    case 'odds':
      return <Data {...props} />;
    case 'pitch':
      return <Pitch {...props} />;
    case 'verdict':
      return <Verdict {...props} />;
    case 'reveal':
      return <Reveal {...props} />;
    case 'roundEnd':
      return <RoundEnd {...props} />;
    case 'final':
      return <Final {...props} />;
  }
}

const Heading = ({ children, size = 52 }: { children: ReactNode; size?: number }) => (
  <h1 className="display" style={{ fontSize: `clamp(${Math.round(size * 0.75)}px, ${size / 5.2}vw, ${size}px)` }}>
    {children}
  </h1>
);

/** The plain "what to do now" line on every screen. */
export const How = ({ children }: { children: ReactNode }) => (
  <div className="how">
    <span className="label">What to do</span>
    <p>{children}</p>
  </div>
);

const bars = (n: number) => `${n} gold ${n === 1 ? 'bar' : 'bars'}`;
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ------------------------------------------------------------------------------- briefing */
function Briefing(p: Ctx) {
  const { g, r, me, isAdj, canRun, act, view } = useCtx(p);
  const adjName = nameOf(g.players, r.adjudicatorId);
  const myGold = me && r.players[me]?.gold;
  return (
    <div className="stack">
      <div className="gauge-hero">
        <PlaneGlyph className="rise" />
      </div>
      {isAdj ? (
        <>
          <Heading>You’re the Adjudicator.</Heading>
          <p>
            Everyone takes a turn at this, and this round it’s you. You don’t pack a bag. You run the round: you take off, watch what everyone grabs,
            reveal the data, time the pitches, then decide how long each player really lasts.
          </p>
          <How>When everyone’s ready, tap Take off.</How>
        </>
      ) : (
        <>
          <Heading>{adjName} is the Adjudicator.</Heading>
          <p>
            {adjName} runs this round and judges who lasts longest. You’re being flown out with five things: a partner, a survival tool, food, an
            animal and something for fun. Everyone gets a turn as Adjudicator.
          </p>
          {myGold ? (
            <div className="panel dark">
              <p className="label">Your gold this round</p>
              <p className="display" style={{ fontSize: 44 }}>
                {bars(myGold)}
              </p>
              {r.bonusFor === me && <p className="small">Includes your Secret Survivalist bonus bar.</p>}
            </div>
          ) : null}
          {!view.you.isHost || !canRun ? <How>Wait for {adjName} to take off.</How> : null}
        </>
      )}
      {canRun && (
        <button className="btn primary big block" onClick={() => act({ a: 'takeOff' })}>
          Take off
        </button>
      )}
      <Players view={p.view} />
    </div>
  );
}

/* ------------------------------------------------------------------------------- the deal */
function Deal(p: Ctx) {
  const { g, r, me, isAdj, canRun, act, now, view } = useCtx(p);
  const a = view.auction;
  const rp = me ? r.players[me] : undefined;
  const anyPacked = Object.values(r.players).some((x) => CATEGORIES.some((c) => x.kit[c]));

  // The very start: just the temperature, big.
  if (!a && !anyPacked && r.nextDealAt && now < r.nextDealAt) {
    return (
      <div className="gauge-hero">
        <ThermoGlyph level={r.temp === 'FREEZING' ? 0.12 : r.temp === 'SCORCHING' ? 0.95 : 0.5} className="rise" />
        <p className="label">The gauge reads</p>
        <div className="display" style={{ color: tempColour(r.temp) }}>
          {r.temp}
        </div>
        <p className="muted">That’s all you get. You’ll find out exactly where you’ve landed once everyone’s packed.</p>
      </div>
    );
  }

  const away = Object.keys(r.players).filter((id) => !view.online.includes(id) && CATEGORIES.some((c) => !r.players[id].kit[c]));

  return (
    <div className="stack">
      {rp ? (
        <How>Items come up in a random order. Bid gold bars on what you want, or tap Pass. You need one of each, and once a slot’s filled, you sit that category out.</How>
      ) : isAdj ? (
        <How>You’re judging this round. Watch what everyone packs. You’ll hear why it matters soon.</How>
      ) : null}

      {a ? (
        <Lot ctx={p} />
      ) : (
        <div className="card-back">
          <Sun />
        </div>
      )}

      {rp && (
        <section className="stack" style={{ gap: 8 }}>
          <div className="bidline">
            <span className="label">Your bag</span>
            <span className="icon-line" style={{ fontWeight: 700 }}>
              <GoldGlyph /> {bars(rp.gold)} left
            </span>
          </div>
          <Kit kit={rp.kit} />
        </section>
      )}

      {canRun && away.length > 0 && (
        <div className="panel stack" style={{ gap: 8 }}>
          <p className="small">
            {away.map((id) => nameOf(g.players, id)).join(', ')} {away.length === 1 ? 'has' : 'have'} dropped out. You can wait, or pack for them.
          </p>
          {away.map((id) => (
            <button key={id} className="btn" onClick={() => act({ a: 'autoFill', playerId: id })}>
              Pack {nameOf(g.players, id)}’s bag
            </button>
          ))}
        </div>
      )}

      <Players view={view} showGold />
    </div>
  );
}

function Lot({ ctx }: { ctx: Ctx }) {
  const { g, r, me, act, now, view } = useCtx(ctx);
  const a = view.auction!;
  const card = cardById(a.cardId);
  const rp = me ? r.players[me] : undefined;
  const left = Math.max(0, a.endsAt - now);
  const span = a.bids ? TIMING.bidMs : TIMING.openMs;
  const floor = a.high ? a.high.amount + 1 : RULES.minBid;
  const cap = rp ? maxBid(rp.gold, rp.kit) : 0;
  const needIt = !!rp && !rp.kit[card.category];
  const top = a.high?.playerId === me;
  const passed = !!me && a.passed.includes(me);
  const raises = [...new Set([floor + 1, floor + 4])].filter((n) => n <= cap);
  const bidders = Object.entries(r.players).filter(([, x]) => !x.kit[card.category]).length;
  const passers = a.passed.map((id) => (id === me ? 'You' : nameOf(g.players, id)));

  return (
    <section className="stack" style={{ gap: 12 }}>
      <CardFace id={a.cardId} />
      <div className={`timer ${left < 3000 ? 'hot' : ''}`} aria-label={`${Math.ceil(left / 1000)} seconds left`}>
        <i style={{ width: `${Math.min(100, (left / span) * 100)}%` }} />
      </div>
      <div className="bidline">
        <div>
          <p className="label">{a.high ? 'Top bid' : 'No bids yet'}</p>
          <p style={{ fontWeight: 700 }}>
            {a.high ? (
              <span className="icon-line">
                <Dot colour={g.players.find((x) => x.id === a.high!.playerId)?.colour ?? ''} />
                {a.high.playerId === me ? 'You' : nameOf(g.players, a.high.playerId)}
              </span>
            ) : (
              `${plural(bidders, 'player needs', 'players need')} one of these`
            )}
          </p>
        </div>
        <div className="amount">{a.high ? a.high.amount : '–'}</div>
      </div>
      {passers.length > 0 && <p className="small muted">Passed: {passers.join(', ')}</p>}

      {rp &&
        (!needIt ? (
          <p className="small muted" style={{ textAlign: 'center' }}>
            You’ve already packed {card.category === 'ENJOYMENT' ? 'something for fun' : card.category === 'TOOL' ? 'a survival tool' : `a ${card.category.toLowerCase()}`}. Sit this one out.
          </p>
        ) : top ? (
          <div className="panel dark" style={{ textAlign: 'center', fontWeight: 700 }}>
            You’re the top bid. Hold your nerve.
          </div>
        ) : passed ? (
          <div className="panel" style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700 }}>You passed on this one.</p>
          </div>
        ) : floor > cap ? (
          <div className="stack" style={{ gap: 8 }}>
            <p className="small muted" style={{ textAlign: 'center' }}>
              Too rich for you. You need to keep one gold bar for every empty slot.
            </p>
            <button className="btn block" onClick={() => act({ a: 'pass' })}>
              Pass
            </button>
          </div>
        ) : (
          <div className="stack" style={{ gap: 10 }}>
            <button className="btn primary big block" onClick={() => act({ a: 'bid', amount: floor })}>
              Bid {bars(floor)}
            </button>
            <div className="row">
              {raises.map((n) => (
                <button key={n} className="btn" onClick={() => act({ a: 'bid', amount: n })}>
                  Bid {n}
                </button>
              ))}
              <button className="btn ghost" onClick={() => act({ a: 'pass' })}>
                Pass
              </button>
            </div>
            <p className="small muted" style={{ textAlign: 'center' }}>
              You can bid up to {bars(cap)} on this.
            </p>
          </div>
        ))}
    </section>
  );
}

/* ------------------------------------------------------------------------------- landing */
function Landing(p: Ctx) {
  const { r, canRun, act, me, isAdj, view } = useCtx(p);
  const rp = me ? r.players[me] : undefined;
  return (
    <div className="stack">
      <div className="gauge-hero" style={{ paddingBottom: 26 }}>
        <p className="label">Touchdown. You’re spending the rest of your days in the</p>
        <div className="stamp" style={{ color: tempColour(r.temp), fontSize: 'clamp(40px, 12vw, 84px)' }}>
          {r.terrain}
        </div>
      </div>
      {rp && (
        <section className="stack" style={{ gap: 8 }}>
          <span className="label">What you brought</span>
          <Kit kit={rp.kit} />
        </section>
      )}
      <How>
        {isAdj
          ? 'Let it sink in. Then tap the button to see what the data says about everyone’s chances.'
          : 'Take a look at your bag. Is it any use here? The data on everyone’s chances is coming next.'}
      </How>
      {canRun && (
        <button className="btn primary big block" onClick={() => act({ a: 'seeData' })}>
          See what the data says
        </button>
      )}
      <Players view={view} />
    </div>
  );
}

/* ------------------------------------------------------------------------------- the data, one by one */
function Data(p: Ctx) {
  const { g, r, canRun, act, me } = useCtx(p);
  const total = Object.keys(r.players).length;
  const shown = r.dataOrder;
  const done = shown.length >= total;
  const latest = shown[shown.length - 1];
  return (
    <div className="stack">
      <div>
        <p className="label">
          {done ? 'All the numbers are in' : `Player ${shown.length} of ${total}`}
        </p>
        <Heading>What the data says</Heading>
      </div>
      {shown.length === 0 && (
        <How>
          {canRun
            ? 'Tap the button to reveal each player’s numbers, one at a time. Lowest first.'
            : 'The Adjudicator is about to reveal everyone’s numbers, one at a time.'}
        </How>
      )}
      {[...shown].reverse().map((id) => (
        <DataCard key={id} g={g} id={id} me={me} fresh={id === latest && !done} />
      ))}
      {done && (
        <div className="panel dark stack rise" style={{ gap: 8, textAlign: 'center' }}>
          <p className="label">However…</p>
          <p className="display" style={{ fontSize: 'clamp(30px, 8vw, 46px)' }}>
            The data may suggest this. But it comes down to the pitches.
          </p>
          <p>Each of you gets two minutes to tell the Adjudicator why you’ll last longer than the numbers say.</p>
        </div>
      )}
      {canRun && !done && (
        <button className="btn primary big block" onClick={() => act({ a: 'nextData' })}>
          {shown.length === 0 ? 'Reveal the first player' : 'Reveal the next player'}
        </button>
      )}
      {canRun && done && (
        <button className="btn primary big block" onClick={() => act({ a: 'toPitches' })}>
          Start the pitches
        </button>
      )}
      {!canRun && !done && shown.length > 0 && <p className="label" style={{ textAlign: 'center' }}>{plural(total - shown.length, 'player')} still to come</p>}
    </div>
  );
}

const STAT_LABELS: [keyof NonNullable<GameView['round']['breakdown']>[string], string][] = [
  ['body', 'Health'],
  ['mind', 'Morale'],
  ['supply', 'Supplies'],
];

function DataCard({ g, id, me, fresh = false }: { g: GameView; id: string; me: string | null; fresh?: boolean }) {
  const r = g.round;
  const pl = g.players.find((x) => x.id === id)!;
  const b = r.breakdown?.[id];
  return (
    <article className={`odds ${fresh ? 'rise' : ''}`}>
      <header style={{ background: id === me ? 'var(--paper-2)' : undefined }}>
        <Dot colour={pl.colour} />
        <span className="nm">{id === me ? `${pl.name} (you)` : pl.name}</span>
        <span className="days">
          {r.days?.[id] ?? '?'}
          <small>DAYS</small>
        </span>
      </header>
      <div className="body stack" style={{ gap: 10 }}>
        <Kit kit={r.players[id].kit} />
        {b && (
          <div className="stats">
            {STAT_LABELS.map(([k, label]) => (
              <div className="stat" key={k}>
                <span className="label">{label}</span>
                <span className="bar">
                  <i style={{ width: `${Math.round((b[k] / BREAKDOWN_MAX) * 100)}%` }} />
                </span>
                <span className="num">
                  {b[k]}/{BREAKDOWN_MAX}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------------------- pitches */
function Pitch(p: Ctx) {
  const { g, r, me, isAdj, canRun, act, now, view } = useCtx(p);
  const pitcher = r.pitchOrder[r.pitchIndex];
  const c = view.clock;
  const left = c.runningSince !== null ? Math.max(0, c.remainingMs - (now - c.runningSince)) : c.remainingMs;
  const mm = Math.floor(Math.ceil(left / 1000) / 60);
  const ss = String(Math.ceil(left / 1000) % 60).padStart(2, '0');
  const mine = g.players.find((x) => x.id === me);
  const canDebunk = !!mine && !isAdj && pitcher !== me && !mine.debunkUsed && view.you.role === 'player';
  const [arming, setArming] = useState(false);
  const next = r.pitchOrder[r.pitchIndex + 1];

  return (
    <div className="stack">
      <div>
        <p className="label">
          Pitch {r.pitchIndex + 1} of {r.pitchOrder.length} · The data may suggest it, the pitch decides it
        </p>
        <Heading>{pitcher === me ? 'You’re up. Why will you make it?' : `${nameOf(g.players, pitcher)} is pitching`}</Heading>
      </div>
      <How>
        {pitcher === me
          ? 'You’ve got two minutes. Tell the Adjudicator why your bag keeps you alive longer than the data says.'
          : isAdj
            ? 'Start the clock when they begin. When they’re done, move on to the next player.'
            : 'Listen. If you think it’s nonsense, play your Debunk card. You only get one per game.'}
      </How>
      <div className={`clock ${left < 15000 ? 'low' : ''}`}>
        {mm}:{ss}
      </div>
      {canRun && (
        <div className="row">
          {c.runningSince === null ? (
            <button className="btn primary" onClick={() => act({ a: 'clockStart' })}>
              {left === RULES.pitchSeconds * 1000 ? 'Start clock' : 'Resume'}
            </button>
          ) : (
            <button className="btn" onClick={() => act({ a: 'clockPause' })}>
              Pause
            </button>
          )}
          <button className="btn" onClick={() => act({ a: 'clockReset' })}>
            Reset
          </button>
          <button className="btn dark" onClick={() => act({ a: 'nextPitch' })}>
            {next ? `Next: ${nameOf(g.players, next)}` : 'Close the pitches'}
          </button>
        </div>
      )}
      {canDebunk &&
        (arming ? (
          <div className="row">
            <button
              className="btn danger big"
              onClick={() => {
                setArming(false);
                act({ a: 'debunk' });
              }}
            >
              Debunk {nameOf(g.players, pitcher)}
            </button>
            <button className="btn ghost" style={{ flex: 'none' }} onClick={() => setArming(false)}>
              Not yet
            </button>
          </div>
        ) : (
          <button className="btn danger big block" onClick={() => setArming(true)}>
            Play your Debunk card
          </button>
        ))}
      {mine && !isAdj && mine.debunkUsed && <p className="small muted">You’ve played your Debunk card this game.</p>}
      <DataCard g={g} id={pitcher} me={me} />
      {next && <p className="small muted">Up next: {r.pitchOrder.slice(r.pitchIndex + 1).map((id) => nameOf(g.players, id)).join(', ')}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------------------- verdict */
function Verdict(p: Ctx) {
  const { g, r, canRun, act, view } = useCtx(p);
  const ids = Object.keys(r.players);
  const [days, setDays] = useState<Record<string, number>>(() => Object.fromEntries(ids.map((id) => [id, r.days?.[id] ?? 30])));

  if (!canRun) {
    return (
      <div className="stack">
        <div className="gauge-hero">
          <Sun className="rise" />
        </div>
        <Heading>The Adjudicator is deciding.</Heading>
        <How>Phones face down. The Adjudicator is working out how long each of you really lasts. The data was only the start.</How>
        <Players view={view} />
      </div>
    );
  }

  const set = (id: string, v: number) => setDays((d) => ({ ...d, [id]: Math.max(0, Math.min(MAX_VERDICT_DAYS, Math.round(v))) }));
  const top = Math.max(...ids.map((id) => days[id]));
  const tied = ids.filter((id) => days[id] === top).length > 1;
  return (
    <div className="stack">
      <Heading>How long do they really last?</Heading>
      <How>
        Each player starts on what the data said. Now move their days up or down, based on their pitch. Whoever you give the most days wins the round.
      </How>
      {ids.map((id) => {
        const pl = g.players.find((x) => x.id === id)!;
        const v = days[id];
        const data = r.days?.[id] ?? 0;
        const diff = v - data;
        return (
          <article className="odds" key={id}>
            <header>
              <Dot colour={pl.colour} />
              <span className="nm">{pl.name}</span>
              <span className="days">
                {v}
                <small>DAYS</small>
              </span>
            </header>
            <div className="body stack" style={{ gap: 10 }}>
              <p className="small muted">
                The data said {plural(data, 'day')}
                {diff !== 0 && (
                  <b style={{ color: diff > 0 ? 'var(--moss)' : 'var(--terra)' }}>
                    {' '}
                    · you’ve {diff > 0 ? 'added' : 'taken off'} {Math.abs(diff)}
                  </b>
                )}
              </p>
              <input
                type="range"
                className="slider"
                id={`days-${id}`}
                aria-label={`Days for ${pl.name}`}
                min={0}
                max={Math.max(365, v)}
                step={1}
                value={v}
                onChange={(e) => set(id, Number(e.target.value))}
              />
              <div className="stepper">
                <button className="btn" onClick={() => set(id, v - 10)} aria-label="Take off 10 days">
                  −10
                </button>
                <button className="btn" onClick={() => set(id, v - 1)} aria-label="Take off 1 day">
                  −1
                </button>
                <button className="btn" onClick={() => set(id, v + 1)} aria-label="Add 1 day">
                  +1
                </button>
                <button className="btn" onClick={() => set(id, v + 10)} aria-label="Add 10 days">
                  +10
                </button>
              </div>
            </div>
          </article>
        );
      })}
      {tied && <p className="small" style={{ color: 'var(--terra)', fontWeight: 700 }}>Two players are tied for the most days. Only one can last longest, so nudge one of them.</p>}
      <button className="btn primary big block" aria-disabled={tied} onClick={() => !tied && act({ a: 'verdict', days })}>
        Lock in and reveal
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------------------- the reveal, one by one */
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

function Reveal(p: Ctx) {
  const { g, r, now } = useCtx(p);
  const order = r.revealOrder ?? [];
  const verdict = r.verdict ?? {};
  const e = now - r.revealAt;
  const { beats, finalTwoAt } = revealTimeline(order.length);
  let current = -1;
  beats.forEach((b, i) => {
    if (e >= b.start) current = i;
  });
  const player = (id: string) => g.players.find((x) => x.id === id)!;
  const finalTwo = order.slice(-2);
  const inFinalTwo = current === order.length - 3 || (current < 0 && order.length <= 2) ? e >= finalTwoAt : false;
  const winnerNamed = current === order.length - 1 && e >= beats[current].nameAt;
  const earlier = order.slice(0, Math.max(0, current));

  let body: ReactNode;
  if (inFinalTwo) {
    body = (
      <div className="stage-card rise" key="final-two">
        <p className="label">Two left standing</p>
        <div className="stack" style={{ gap: 6, alignItems: 'center' }}>
          {finalTwo.map((id) => (
            <p key={id} className="display" style={{ fontSize: 'clamp(40px, 11vw, 64px)' }}>
              {player(id).name}
            </p>
          ))}
        </div>
        <p>Only one of them lasts longest.</p>
      </div>
    );
  } else if (current < 0) {
    body = (
      <div className="stage-card" key="intro">
        <Sun className="rise" />
        <p className="display" style={{ fontSize: 'clamp(44px, 12vw, 72px)' }}>
          The verdict.
        </p>
      </div>
    );
  } else {
    const b = beats[current];
    const id = order[current];
    const shown = Math.round(verdict[id] * easeOut((e - b.start) / b.rollMs));
    const named = e >= b.nameAt;
    const big = b.kind !== 'quick';
    body = (
      <div className={`stage-card rise ${big && !named ? 'drum' : ''}`} key={id}>
        <p className="label">{b.kind === 'winner' ? 'The Secret Survivalist, surviving' : 'Surviving'}</p>
        <div className="display big-days">{plural(shown, 'day')}</div>
        <p className="label">is…</p>
        {named ? (
          <div className="stack rise" style={{ alignItems: 'center', gap: 12 }}>
            <p className="display" style={{ fontSize: b.kind === 'winner' ? 'clamp(56px, 16vw, 96px)' : 'clamp(44px, 13vw, 76px)' }}>
              {player(id).name}
            </p>
            {b.kind === 'winner' && <div className="stamp small red">Secret Survivalist</div>}
            <p className="small">The data said {plural(r.days?.[id] ?? 0, 'day')}.</p>
          </div>
        ) : (
          <p className={`display suspense ${big ? 'slow' : ''}`} style={{ fontSize: 'clamp(44px, 13vw, 76px)' }}>
            ? ? ?
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`stage ${winnerNamed ? 'lit' : ''}`} role="region" aria-label="The verdict">
      <div className="stage-inner">
        {body}
        {earlier.length > 0 && !inFinalTwo && (
          <div className="stack" style={{ gap: 8 }}>
            {[...earlier].reverse().map((pid) => (
              <div key={pid} className="fate">
                <Dot colour={player(pid).colour} />
                <span className="nm">{player(pid).name}</span>
                <span className="small" style={{ fontWeight: 700 }}>
                  {plural(verdict[pid], 'day')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------- round end */
function RoundEnd(p: Ctx) {
  const { g, r, canRun, act } = useCtx(p);
  const last = g.results[g.results.length - 1];
  const nextAdj = g.rota[r.number] ?? null;
  const order = [...(r.revealOrder ?? [])].reverse();
  return (
    <div className="stack">
      <p className="label">
        Round {r.number} · {last?.location}
      </p>
      <Heading>{nameOf(g.players, r.winnerId)} is the Secret Survivalist.</Heading>
      {nextAdj && <p className="muted">They start the next round with a bonus gold bar.</p>}
      <section className="stack" style={{ gap: 8 }}>
        <p className="label">The data said · the Adjudicator said</p>
        <div className="people">
          {order.map((id) => {
            const pl = g.players.find((x) => x.id === id)!;
            return (
              <div className="person" key={id}>
                <Dot colour={pl.colour} />
                <span className="nm">{pl.name}</span>
                <span className="small muted">{r.days?.[id]}</span>
                <span className="gold">{r.verdict?.[id]} days</span>
              </div>
            );
          })}
        </div>
      </section>
      <Standings players={g.players} />
      {canRun ? (
        <button className="btn primary big block" onClick={() => act({ a: 'nextRound' })}>
          {nextAdj ? `Next round: ${nameOf(g.players, nextAdj)} adjudicates` : 'Crown the Last One Standing'}
        </button>
      ) : (
        <How>{nextAdj ? `Wait for the next round. ${nameOf(g.players, nextAdj)} adjudicates.` : 'One last reveal coming…'}</How>
      )}
    </div>
  );
}

function Standings({ players }: { players: Player[] }) {
  const sorted = [...players].sort((a, b) => b.wins - a.wins);
  return (
    <section className="stack" style={{ gap: 8 }}>
      <p className="label">Rounds won</p>
      <div className="people">
        {sorted.map((pl) => (
          <div className="person" key={pl.id}>
            <Dot colour={pl.colour} />
            <span className="nm">{pl.name}</span>
            <span className="gold">{pl.wins}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------- final */
function Final(p: Ctx) {
  const { g, view, act } = useCtx(p);
  const best = Math.max(...g.players.map((x) => x.wins));
  const champs = g.players.filter((x) => x.wins === best);
  return (
    <div className="stack">
      <div className="gauge-hero">
        <Sun className="rise" />
        <div className="stamp small" style={{ color: 'var(--terra)' }}>
          Last One Standing
        </div>
      </div>
      <Heading size={64}>{champs.map((c) => c.name).join(' and ')}</Heading>
      <p className="muted">
        {plural(best, 'round')} won{champs.length > 1 ? ' each. A shared raft.' : '.'}
      </p>
      <Standings players={g.players} />
      <section className="stack" style={{ gap: 8 }}>
        <p className="label">The expeditions</p>
        <div className="people">
          {g.results.map((res) => (
            <div className="person" key={res.round}>
              <span className="gold">{res.round}</span>
              <span className="nm">{res.location}</span>
              <span className="small">{nameOf(g.players, res.winnerId)}</span>
            </div>
          ))}
        </div>
      </section>
      {view.you.isHost ? (
        <button className="btn primary big block" onClick={() => act({ a: 'backToLobby' })}>
          Play again
        </button>
      ) : (
        <How>Want another go? The host can tap Play again.</How>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------- the passenger list */
function Players({ view, showGold = false }: { view: View; showGold?: boolean }) {
  const g = view.game!;
  const r = g.round;
  return (
    <section className="stack" style={{ gap: 8 }}>
      <p className="label">On board</p>
      <div className="people">
        {g.players.map((pl) => {
          const rp = r.players[pl.id];
          const isAdj = pl.id === r.adjudicatorId;
          return (
            <div key={pl.id} className={`person ${pl.id === view.you.playerId ? 'me' : ''} ${view.online.includes(pl.id) ? '' : 'out'}`}>
              <Dot colour={pl.colour} />
              <span className="nm">{pl.name}</span>
              {isAdj ? <span className="chip filled">Adjudicator</span> : rp && <Ticks kit={rp.kit} />}
              {showGold && rp && <span className="gold">{rp.gold}g</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
