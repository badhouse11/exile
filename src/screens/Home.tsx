import { useState } from 'react';
import { Sun } from '../components/Icons';
import { isRoomCode } from '../net/protocol';
import { MULTIPLAYER_READY } from '../net/useRoom';

interface Props {
  onStart: () => void;
  onJoin: (code: string) => void;
  onWatch: (code: string) => void;
  onRules: () => void;
}

export default function Home({ onStart, onJoin, onWatch, onRules }: Props) {
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'join' | 'watch'>('menu');
  const [err, setErr] = useState('');
  const clean = code.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);

  const go = () => {
    if (!isRoomCode(clean)) {
      setErr('Room codes are four letters, like HXRT.');
      return;
    }
    if (mode === 'watch') onWatch(clean);
    else onJoin(clean);
  };

  return (
    <main className="app">
      <section className="hero">
        <Sun className="sun" />
        <h1 className="display logo">EXILE</h1>
        <p className="tagline">You’ve been exiled. One jet. Five things. Bid for your survival, then convince the room you’ll make it.</p>
      </section>

      {!MULTIPLAYER_READY && (
        <div className="panel small">
          The room server isn’t connected yet. Add <b>VITE_ROOM_SERVER</b> in Netlify and redeploy, and every phone can join.
        </div>
      )}

      {mode === 'menu' ? (
        <div className="stack">
          <button className="btn primary big block" onClick={onStart} aria-disabled={!MULTIPLAYER_READY} disabled={!MULTIPLAYER_READY}>
            Start a game
          </button>
          <button className="btn big block" onClick={() => setMode('join')} disabled={!MULTIPLAYER_READY}>
            Join a game
          </button>
          <div className="row">
            <button className="btn ghost" onClick={onRules}>
              How to play
            </button>
            <button className="btn ghost" onClick={() => setMode('watch')} disabled={!MULTIPLAYER_READY}>
              Big screen
            </button>
          </div>
        </div>
      ) : (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
        >
          <label className="label" htmlFor="code">
            {mode === 'watch' ? 'Room code to show on this screen' : 'Room code'}
          </label>
          <input
            id="code"
            className="field code"
            value={clean}
            onChange={(e) => {
              setCode(e.target.value);
              setErr('');
            }}
            autoComplete="off"
            autoCapitalize="characters"
            inputMode="text"
            placeholder="HXRT"
            autoFocus
          />
          {err && <p className="small" style={{ color: 'var(--terra)', fontWeight: 700 }}>{err}</p>}
          <button className="btn primary big block" type="submit">
            {mode === 'watch' ? 'Show the game' : 'Board the jet'}
          </button>
          <button className="btn ghost block" type="button" onClick={() => setMode('menu')}>
            Back
          </button>
        </form>
      )}

      <p className="small muted" style={{ textAlign: 'center' }}>
        3 to 8 players · one phone each · same room
      </p>
    </main>
  );
}
