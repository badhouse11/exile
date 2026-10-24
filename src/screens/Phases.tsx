/**
 * One component per moment of a round. Every phone renders the same moment;
 * what you can press depends on whether you're bidding, judging or watching.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { CardFace, Dot, Kit, Ticks, nameOf, tempColour } from '../components/Bits';
import { GoldGlyph, PlaneGlyph, Sun, ThermoGlyph } from '../components/Icons';
import { CATEGORIES, cardById } from '../data/cards';
import { RULES, TIMING, maxBid } from '../game/rules';
import type { GameView, Player, View } from '../net/protocol';
import type { Room } from '../net/useRoom';

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
    case 'briefing':
      return <Briefing {...props} />;
    case 'deal':
      return <Deal {...props} />;
    case 'odds':
      return <Odds {...props} />;
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

/* ------------------------------------------------------------------------------- briefing */
function Briefing(p: Ctx) {
  const { g, r, me, isAdj, canRun, act } = useCtx(p);
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
          <p>You don’t pack this round. You watch what everyone grabs, hear their pitches and decide who lasts longest.</p>
          <p className="muted">When everyone’s ready, take off. The temperature gauge goes up first. Where you’re landing stays secret until halfway through.</p>
        </>
      ) : (
        <>
          <Heading>{adjName} is the Adjudicator.</Heading>
          <p>Five slots in your bag. Items come up in random order, so don’t blow everything on the first thing you see.</p>
          {myGold ? (
            <div className="panel dark">
              <p className="label">Your gold this round</p>
              <p className="display" style={{ fontSize: 44 }}>
                {myGold} bars
              </p>
              {r.bonusFor === me && <p className="small">Includes your Secret Survivalist bonus bar.</p>}
            </div>
          ) : null}
        </>
      )}
      {canRun ? (
        <button className="btn primary big block" onClick={() => act({ a: 'takeOff' })}>
          Take off
        </button>
      ) : (
        <p className="label" style={{ textAlign: 'center' }}>
          Waiting for take-off
        </p>
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
        <p className="muted">You’ll find out exactly where halfway through.</p>
      </div>
    );
  }

  const away = Object.keys(r.players).filter((id) => !view.online.includes(id) && CATEGORIES.some((c) => !r.players[id].kit[c]));

  return (
    <div className="stack">
      {a ? <Lot ctx={p} /> : <div className="card-back"><Sun /></div>}

      {rp && (
        <section className="stack" style={{ gap: 8 }}>
          <div className="bidline">
            <span className="label">Your bag</span>
            <span className="icon-line" style={{ fontWeight: 700 }}>
              <GoldGlyph /> {rp.gold} gold
            </span>
          </div>
          <Kit kit={rp.kit} />
        </section>
      )}

      {isAdj && <p className="small muted">You’re judging this round. Watch what they pack; you’ll hear why it matters soon.</p>}

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
  const options = [...new Set([floor, floor + 1, floor + 4])].filter((n) => n <= cap);
  const bidders = Object.entries(r.players).filter(([, x]) => !x.kit[card.category]).length;

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
              `${bidders} ${bidders === 1 ? 'player needs' : 'players need'} one of these`
            )}
          </p>
        </div>
        <div className="amount">{a.high ? a.high.amount : '–'}</div>
      </div>
      {rp &&
        (needIt ? (
          top ? (
            <div className="panel dark" style={{ textAlign: 'center', fontWeight: 700 }}>
              You’re the top bid. Hold your nerve.
            </div>
          ) : options.length ? (
            <div className="bidpad">
              {options.map((n, i) => (
                <button key={n} className={`btn ${i === 0 ? 'primary' : ''}`} onClick={() => act({ a: 'bid', amount: n })}>
                  {n}
                  <small>{i === 0 ? 'Bid' : 'Jump to'}</small>
                </button>
              ))}
            </div>
          ) : (
            <p className="small muted" style={{ textAlign: 'center' }}>
              Out of your range. You need to keep one bar for every empty slot.
            </p>
          )
        ) : (
          <p className="small muted" style={{ textAlign: 'center' }}>
            You’ve already packed {card.category === 'ENJOYMENT' ? 'something for fun' : `a ${card.category.toLowerCase()}`}. Sit this one out.
          </p>
        ))}
      {rp && needIt && !top && options.length > 0 && (
        <p className="small muted" style={{ textAlign: 'center' }}>
          You can bid up to {cap}.
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------------------- the data */
function Odds(p: Ctx) {
  const { g, r, canRun, act, view } = useCtx(p);
  return (
    <div className="stack">
      <Heading>Data suggests…</Heading>
      <p className="muted">It’s only data. The pitch is what counts.</p>
      <BagsWithDays g={g} me={view.you.playerId} />
      {canRun ? (
        <button className="btn primary big block" onClick={() => act({ a: 'toPitches' })}>
          Start the pitches
        </button>
      ) : (
        <p className="label" style={{ textAlign: 'center' }}>
          {r.adjudicatorId === view.you.playerId ? '' : 'Get your pitch ready: why will you make it?'}
        </p>
      )}
    </div>
  );
}

function BagsWithDays({ g, me, only }: { g: GameView; me: string | null; only?: string }) {
  const r = g.round;
  const ids = Object.keys(r.players)
    .filter((id) => !only || id === only)
    .sort((x, y) => (r.days?.[y] ?? 0) - (r.days?.[x] ?? 0));
  return (
    <div className="stack" style={{ gap: 10 }}>
      {ids.map((id) => {
        const pl = g.players.find((x) => x.id === id)!;
        return (
          <article className="odds rise" key={id}>
            <header style={{ background: id === me ? 'var(--paper-2)' : undefined }}>
              <Dot colour={pl.colour} />
              <span className="nm">{id === me ? `${pl.name} (you)` : pl.name}</span>
              <span className="days">
                {r.days?.[id] ?? '?'}
                <small>DAYS</small>
              </span>
            </header>
            <div className="body">
              <Kit kit={r.players[id].kit} />
            </div>
          </article>
        );
      })}
    </div>
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
          Pitch {r.pitchIndex + 1} of {r.pitchOrder.length}
        </p>
        <Heading>{pitcher === me ? 'You’re up. Why will you make it?' : `${nameOf(g.players, pitcher)} is pitching`}</Heading>
      </div>
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
      <BagsWithDays g={g} me={me} only={pitcher} />
      {next && <p className="small muted">Up next: {r.pitchOrder.slice(r.pitchIndex + 1).map((id) => nameOf(g.players, id)).join(', ')}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------------------- verdict */
function Verdict(p: Ctx) {
  const { g, r, canRun, act, view } = useCtx(p);
  const [order, setOrder] = useState<string[]>([]);
  const ids = Object.keys(r.players);

  if (!canRun) {
    return (
      <div className="stack">
        <div className="gauge-hero">
          <Sun className="rise" />
        </div>
        <Heading>The Adjudicator is deliberating.</Heading>
        <p className="muted">Phones face down. Look nervous.</p>
        <Players view={view} />
      </div>
    );
  }

  const tap = (id: string) => setOrder((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  const done = order.length === ids.length;
  return (
    <div className="stack">
      <Heading>Who lasts longest?</Heading>
      <p className="muted">Tap your survivor first, then the rest in order. The last one you tap is the first to go. Tap again to undo.</p>
      <div className="stack" style={{ gap: 8 }}>
        {ids.map((id) => {
          const pos = order.indexOf(id);
          const pl = g.players.find((x) => x.id === id)!;
          return (
            <button key={id} className={`rank-btn ${pos >= 0 ? 'picked' : ''}`} onClick={() => tap(id)}>
              <span className="pos">{pos >= 0 ? pos + 1 : ''}</span>
              <Dot colour={pl.colour} />
              <span className="nm">{pl.name}</span>
              <span className="small muted">data: {r.days?.[id]} days</span>
            </button>
          );
        })}
      </div>
      <button className="btn primary big block" aria-disabled={!done} onClick={() => done && act({ a: 'verdict', ranking: order })}>
        {done ? 'Lock the verdict' : `Rank ${ids.length - order.length} more`}
      </button>
      {order.length > 0 && (
        <button className="btn ghost" onClick={() => setOrder([])}>
          Start again
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------- the day counter */
function Reveal(p: Ctx) {
  const { g, r, now } = useCtx(p);
  const ranking = r.ranking ?? [];
  const drop = r.drop ?? {};
  const order = [...ranking].reverse(); // first out ... survivor last
  const e = now - r.revealAt;
  const keyAt = (i: number) => TIMING.revealLeadMs + (i + 1) * TIMING.revealStepMs;
  let day = 0;
  for (let i = 0; i < order.length; i++) {
    const t0 = i === 0 ? TIMING.revealLeadMs : keyAt(i - 1);
    const d0 = i === 0 ? 0 : drop[order[i - 1]];
    const t1 = keyAt(i);
    if (e >= t1) {
      day = drop[order[i]];
      continue;
    }
    if (e > t0) day = Math.round(d0 + ((drop[order[i]] - d0) * (e - t0)) / (t1 - t0));
    break;
  }
  const crowned = e >= keyAt(order.length - 1);
  const winner = ranking[0];

  return (
    <div className="stack">
      <div className="counter">
        <p className="label">{crowned ? 'Still standing on' : 'Surviving'}</p>
        <div className="day">DAY {day}</div>
      </div>
      {crowned && (
        <div style={{ textAlign: 'center' }}>
          <div className="stamp small" style={{ color: 'var(--terra)' }}>
            Secret Survivalist
          </div>
          <p className="display" style={{ fontSize: 44, marginTop: 14 }}>
            {nameOf(g.players, winner)}
          </p>
        </div>
      )}
      <div className="stack" style={{ gap: 8 }}>
        {order.map((id, i) => {
          const pl = g.players.find((x) => x.id === id)!;
          const gone = i < order.length - 1 && e >= keyAt(i);
          const won = id === winner && crowned;
          return (
            <div key={id} className={`fate ${gone ? 'gone' : ''} ${won ? 'won' : ''}`}>
              <Dot colour={pl.colour} />
              <span className="nm">{pl.name}</span>
              <span className="small" style={{ fontWeight: 700 }}>
                {gone ? `Gone by day ${drop[id]}` : won ? `Day ${drop[id]}` : 'Hanging on'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------- round end */
function RoundEnd(p: Ctx) {
  const { g, r, canRun, act } = useCtx(p);
  const last = g.results[g.results.length - 1];
  const nextAdj = g.rota[r.number] ?? null;
  return (
    <div className="stack">
      <p className="label">Round {r.number} · {last?.location}</p>
      <Heading>{nameOf(g.players, r.winnerId)} is the Secret Survivalist.</Heading>
      {nextAdj && <p className="muted">They start the next round with a bonus gold bar.</p>}
      <Standings players={g.players} />
      {canRun ? (
        <button className="btn primary big block" onClick={() => act({ a: 'nextRound' })}>
          {nextAdj ? `Next round: ${nameOf(g.players, nextAdj)} adjudicates` : 'Crown the Last One Standing'}
        </button>
      ) : (
        <p className="label" style={{ textAlign: 'center' }}>
          {nextAdj ? `${nameOf(g.players, nextAdj)} adjudicates next` : 'One last reveal…'}
        </p>
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
        {best} {best === 1 ? 'round' : 'rounds'} survived{champs.length > 1 ? ' each. A shared raft.' : '.'}
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
      {view.you.isHost && (
        <button className="btn primary big block" onClick={() => act({ a: 'backToLobby' })}>
          Play again
        </button>
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
