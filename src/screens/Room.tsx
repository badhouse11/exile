import { useEffect, useRef, useState } from 'react';
import { Dot, Gauge, nameOf } from '../components/Bits';
import { PlaneGlyph } from '../components/Icons';
import { PALETTE, PALETTE_KEYS, RULES, TIMING } from '../game/rules';
import type { View } from '../net/protocol';
import { useRoom, useTicker } from '../net/useRoom';
import type { Room as RoomApi } from '../net/useRoom';
import Phase from './Phases';

interface Props {
  code: string;
  create: boolean;
  watch: boolean;
  onLeave: () => void;
}

export default function Room({ code, create, watch, onLeave }: Props) {
  const [fatal, setFatal] = useState<string | null>(null);
  const room = useRoom(code, { create, onFatal: setFatal });
  const { view, status } = room;
  const asked = useRef(false);
  useTicker(true, 250);

  // A big screen asks to watch as soon as it's in.
  useEffect(() => {
    if (watch && view && view.you.role === 'guest' && !asked.current) {
      asked.current = true;
      room.send({ t: 'watch' });
    }
  }, [watch, view, room]);

  if (fatal) {
    return (
      <main className="app">
        <TopBar onLeave={onLeave} code={code} />
        <div className="panel stack">
          <p style={{ fontWeight: 700 }}>{fatal}</p>
          <button className="btn primary" onClick={onLeave}>
            Back to the start
          </button>
        </div>
      </main>
    );
  }

  if (!view) {
    return (
      <main className="app">
        <TopBar onLeave={onLeave} code={code} />
        <div className="gauge-hero">
          <PlaneGlyph className="rise" />
          <p className="label">{status === 'reconnecting' ? 'Reconnecting…' : 'Finding the jet…'}</p>
        </div>
      </main>
    );
  }

  const wide = view.you.role === 'screen';
  return (
    <main className={`app ${wide ? 'wide' : ''}`}>
      <TopBar onLeave={onLeave} code={code} view={view} status={status} />
      {view.game ? <GameShell room={room} view={view} /> : <Lobby room={room} view={view} />}
      <Toasts room={room} view={view} />
    </main>
  );
}

function TopBar({ onLeave, code, view, status }: { onLeave: () => void; code: string; view?: View; status?: string }) {
  const g = view?.game;
  return (
    <div className="topbar">
      <button className="wordmark" onClick={onLeave} aria-label="Leave the game">
        EXILE
      </button>
      {g && g.phase !== 'final' && (
        <span className="label">
          Round {g.round.number} of {g.rota.length}
        </span>
      )}
      <span className={`chip ${status === 'reconnecting' ? '' : 'filled'}`}>{status === 'reconnecting' ? 'Reconnecting' : code}</span>
    </div>
  );
}

/* ---------------------------------------------------------------------------------- lobby */
function Lobby({ room, view }: { room: RoomApi; view: View }) {
  const me = view.lobby.find((l) => l.id === view.you.playerId);
  const [editing, setEditing] = useState(false);
  const link = `${window.location.origin}${window.location.pathname}?room=${view.code}`;
  const [copied, setCopied] = useState(false);

  if (view.you.role === 'screen') {
    return (
      <div className="stack">
        <div className="codebox panel">
          <p className="label">Join on your phone with code</p>
          <div className="code-big">{view.code}</div>
        </div>
        <Passengers view={view} />
      </div>
    );
  }

  if (!me || editing) {
    return <JoinForm room={room} view={view} current={me} onDone={() => setEditing(false)} />;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const ready = view.lobby.length >= RULES.minPlayers;
  return (
    <div className="stack">
      <div className="codebox panel">
        <p className="label">Room code</p>
        <div className="code-big">{view.code}</div>
        <p className="small muted" style={{ marginTop: 6, overflowWrap: 'anywhere' }}>
          {link}
        </p>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn" onClick={copy}>
            {copied ? 'Link copied' : 'Copy invite link'}
          </button>
        </div>
      </div>
      <Passengers view={view} canKick={view.you.isHost} onKick={(id) => room.act({ a: 'kick', playerId: id })} />
      <button className="btn ghost" onClick={() => setEditing(true)}>
        Change my name or colour
      </button>
      {view.you.isHost ? (
        <button className="btn primary big block" onClick={() => room.send({ t: 'start' })} aria-disabled={!ready}>
          {ready ? 'Take off' : `Waiting for ${RULES.minPlayers - view.lobby.length} more`}
        </button>
      ) : (
        <p className="small muted" style={{ textAlign: 'center' }}>
          {nameOf(view.lobby.map((l) => ({ ...l, wins: 0, debunkUsed: false })), view.host.playerId)} starts the game when everyone’s on board.
        </p>
      )}
    </div>
  );
}

function Passengers({ view, canKick, onKick }: { view: View; canKick?: boolean; onKick?: (id: string) => void }) {
  return (
    <section className="stack" style={{ gap: 8 }}>
      <p className="label">
        Passengers · {view.lobby.length} of {RULES.maxPlayers}
      </p>
      {view.lobby.length === 0 ? (
        <p className="muted small">Nobody’s boarded yet.</p>
      ) : (
        <div className="people">
          {view.lobby.map((l) => (
            <div className={`person ${l.id === view.you.playerId ? 'me' : ''}`} key={l.id}>
              <Dot colour={l.colour} />
              <span className="nm">{l.name}</span>
              {l.id === view.host.playerId && <span className="chip">Host</span>}
              {!view.online.includes(l.id) && <span className="small muted">away</span>}
              {canKick && l.id !== view.you.playerId && (
                <button className="btn ghost" style={{ padding: '4px 10px', flex: 'none' }} onClick={() => onKick?.(l.id)}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function JoinForm({ room, view, current, onDone }: { room: RoomApi; view: View; current?: View['lobby'][number]; onDone: () => void }) {
  const taken = new Set(view.lobby.filter((l) => l.id !== current?.id).map((l) => l.colour));
  const [name, setName] = useState(current?.name ?? '');
  const [colour, setColour] = useState(current?.colour ?? PALETTE_KEYS.find((k) => !taken.has(k)) ?? PALETTE_KEYS[0]);
  const [err, setErr] = useState('');
  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) {
          setErr('Give yourself a name.');
          return;
        }
        room.send({ t: 'join', name: name.trim(), colour });
        onDone();
      }}
    >
      <h1 className="display" style={{ fontSize: 52 }}>
        Who’s fleeing?
      </h1>
      <label className="label" htmlFor="name">
        Your name
      </label>
      <input
        id="name"
        className="field"
        value={name}
        maxLength={24}
        onChange={(e) => {
          setName(e.target.value);
          setErr('');
        }}
        placeholder="Tim"
        autoFocus
        autoComplete="off"
      />
      {err && <p className="small" style={{ color: 'var(--terra)', fontWeight: 700 }}>{err}</p>}
      <p className="label">Your colour</p>
      <div className="swatches">
        {PALETTE_KEYS.map((k) => (
          <button
            type="button"
            key={k}
            className="swatch"
            style={{ background: PALETTE[k].bg, color: PALETTE[k].fg }}
            aria-pressed={colour === k}
            disabled={taken.has(k)}
            onClick={() => setColour(k)}
          >
            {PALETTE[k].name}
          </button>
        ))}
      </div>
      <button className="btn primary big block" type="submit">
        {current ? 'Save' : 'Board the jet'}
      </button>
      {current && (
        <button className="btn ghost" type="button" onClick={onDone}>
          Cancel
        </button>
      )}
    </form>
  );
}

/* ---------------------------------------------------------------------------------- in game */
function GameShell({ room, view }: { room: RoomApi; view: View }) {
  const g = view.game!;
  const now = room.serverNow();
  const isPlayer = view.you.role === 'player' && !!view.you.playerId && g.players.some((p) => p.id === view.you.playerId);

  // Someone arriving mid-game: take over an absent player, or watch.
  if (!isPlayer && view.you.role !== 'screen') {
    const away = g.players.filter((p) => !view.online.includes(p.id));
    return (
      <div className="stack">
        <h1 className="display" style={{ fontSize: 46 }}>
          This flight’s already left.
        </h1>
        <p>Pick up a player whose phone has dropped out, or watch on this screen.</p>
        {away.length > 0 && (
          <div className="people">
            {away.map((p) => (
              <button className="person" key={p.id} style={{ border: 'none', textAlign: 'left' }} onClick={() => room.send({ t: 'takeover', playerId: p.id })}>
                <Dot colour={p.colour} />
                <span className="nm">Play as {p.name}</span>
              </button>
            ))}
          </div>
        )}
        <button className="btn" onClick={() => room.send({ t: 'watch' })}>
          Just watch
        </button>
      </div>
    );
  }

  const r = g.round;
  const showGauge = g.phase !== 'briefing' && g.phase !== 'final';
  const terrainFresh = r.terrain && now - r.terrainAt < TIMING.terrainMs && g.phase === 'deal';
  const ev = view.event;
  const debunk = ev?.tone === 'debunk' && now - ev.at < TIMING.debunkMs ? ev : null;

  return (
    <>
      {showGauge && <Gauge temp={r.temp} terrain={r.terrain} />}
      <Phase view={view} room={room} now={now} />
      {terrainFresh && (
        <div className="overlay ink" role="alert">
          <div style={{ textAlign: 'center' }} className="stack">
            <p className="label" style={{ color: 'var(--miel)' }}>
              The jet’s coming down. It’s the
            </p>
            <div className="stamp" style={{ color: 'var(--miel)', fontSize: 'clamp(44px, 13vw, 96px)' }}>
              {r.terrain}
            </div>
          </div>
        </div>
      )}
      {debunk && (
        <div className="overlay" role="alert">
          <div style={{ textAlign: 'center' }} className="stack">
            <div className="stamp red">Debunked</div>
            <p style={{ fontWeight: 700, fontSize: 20 }}>
              {nameOf(g.players, debunk.by)} isn’t having it.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------------------------- toasts */
function Toasts({ room, view }: { room: RoomApi; view: View }) {
  const [shown, setShown] = useState<{ id: number; text: string } | null>(null);
  const last = useRef(view.event?.id ?? 0);
  const timer = useRef<number | undefined>(undefined);
  const ev = view.event;

  // Keyed on the event id: every state update brings a fresh event object, but only a new id is news.
  useEffect(() => {
    if (!ev || ev.id === last.current) return;
    last.current = ev.id;
    if (ev.tone === 'debunk' || ev.tone === 'terrain') return; // they get the full screen
    setShown({ id: ev.id, text: ev.text });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setShown(null), 3200);
  }, [ev?.id]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!room.error) return;
    const t = window.setTimeout(room.clearError, 3500);
    return () => window.clearTimeout(t);
  }, [room.error, room.clearError]);

  if (room.error)
    return (
      <div className="toast error" role="status" onClick={room.clearError}>
        {room.error}
      </div>
    );
  if (shown)
    return (
      <div className="toast" role="status" key={shown.id}>
        {shown.text}
      </div>
    );
  return null;
}
