/**
 * The opening story: a dark, text-led sequence. The host taps Play and sets the
 * pace for every phone; each line types itself out, and a tap finishes it.
 */
import { useEffect, useRef, useState } from 'react';
import { nameOf } from '../components/Bits';
import { INTRO } from '../game/intro';
import type { IntroBeat } from '../game/intro';
import type { View } from '../net/protocol';
import type { Room } from '../net/useRoom';

const GLYPHS: Record<IntroBeat['glyph'], string> = {
  door: '<rect x="18" y="6" width="28" height="52" rx="2" fill="none" stroke="currentColor" stroke-width="3.5"/><circle cx="39" cy="34" r="2.6" fill="currentColor"/><path d="M8 58 L56 58" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>',
  envelope: '<rect x="8" y="16" width="48" height="32" rx="2" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M8 18 L32 36 L56 18" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><circle cx="32" cy="38" r="6" fill="#C2502C"/>',
  suitcase: '<rect x="8" y="20" width="48" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M24 20 V13 Q24 10 27 10 H37 Q40 10 40 13 V20" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M8 33 H56" stroke="currentColor" stroke-width="3"/><rect x="28" y="29" width="8" height="8" rx="1.5" fill="currentColor"/>',
  crates: '<g fill="none" stroke="currentColor" stroke-width="3"><rect x="4" y="34" width="16" height="16"/><rect x="24" y="34" width="16" height="16"/><rect x="44" y="34" width="16" height="16"/><rect x="14" y="16" width="16" height="16"/><rect x="34" y="16" width="16" height="16"/></g>',
  gold: '<path d="M10 50 L16 38 H48 L54 50 Z" fill="currentColor"/><path d="M18 34 L23 24 H41 L46 34 Z" fill="currentColor" opacity=".7"/>',
  thermo: '<path d="M27 10 Q27 5 32 5 Q37 5 37 10 V36 Q44 40 44 47 Q44 58 32 58 Q20 58 20 47 Q20 40 27 36 Z" fill="none" stroke="currentColor" stroke-width="3.5"/><circle cx="32" cy="47" r="5" fill="currentColor"/><path d="M32 47 V20" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><text x="52" y="22" font-family="Gloock, Georgia, serif" font-size="18" fill="currentColor">?</text>',
  chair: '<path d="M20 8 V56 M44 30 V56 M20 30 H44 M20 30 V8 Q20 6 22 6 H30" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M16 4 L56 4" stroke="currentColor" stroke-width="2" opacity=".5"/><path d="M36 4 V14" stroke="currentColor" stroke-width="2"/><path d="M30 14 H42 L39 20 H33 Z" fill="currentColor"/>',
  plane: '<path d="M30 6 Q32 3 34 6 V26 L58 38 V43 L34 35 V50 L41 55 V59 L32 56 L23 59 V55 L30 50 V35 L6 43 V38 L30 26 Z" fill="currentColor"/>',
};

const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Types a beat's lines one after another. Returns how much of each line is showing. */
function useTyping(step: number, active: boolean) {
  const beat = INTRO[step];
  // Progress is tagged with its step, so a new beat never flashes the last one's text.
  const [state, setState] = useState<{ step: number; shown: number[]; done: boolean }>({ step, shown: beat.lines.map(() => 0), done: false });
  const setShown = (f: (s: number[]) => number[]) => setState((st) => ({ ...st, step, shown: f(st.step === step ? st.shown : beat.lines.map(() => 0)) }));
  const setDone = (d: boolean) => setState((st) => ({ ...st, step, done: d }));
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearInterval(timer.current);
    if (!active) return;
    if (reduced()) {
      setState({ step, shown: beat.lines.map((l) => l.text.length), done: true });
      return;
    }
    setState({ step, shown: beat.lines.map(() => 0), done: false });
    let line = 0;
    let ch = 0;
    let pause = 0;
    timer.current = window.setInterval(() => {
      if (pause > 0) {
        pause -= 1;
        return;
      }
      const l = beat.lines[line];
      ch += l.small ? 2 : 1;
      // Copy the counters now: the state update runs later, after they've moved on.
      const atLine = line;
      const atChar = Math.min(ch, l.text.length);
      setShown((s) => s.map((v, i) => (i === atLine ? atChar : v)));
      if (ch >= l.text.length) {
        line += 1;
        ch = 0;
        pause = 9;
        if (line >= beat.lines.length) {
          window.clearInterval(timer.current);
          setDone(true);
        }
      }
    }, 40);
    return () => window.clearInterval(timer.current);
    // setShown/setDone are rebuilt each render but only close over step and beat, which are deps.
  }, [step, active, beat]);

  const finish = () => {
    window.clearInterval(timer.current);
    setState({ step, shown: beat.lines.map((l) => l.text.length), done: true });
  };
  const current = state.step === step;
  return { shown: current ? state.shown : beat.lines.map(() => 0), done: current && state.done, finish };
}

export default function Intro({ view, room }: { view: View; room: Room }) {
  const g = view.game!;
  const isHost = view.you.isHost;
  const host = nameOf(g.players, view.host.playerId);
  const { started, step } = g.intro;
  const beat = INTRO[Math.min(step, INTRO.length - 1)];
  const { shown, done, finish } = useTyping(Math.min(step, INTRO.length - 1), started);
  const [shaking, setShaking] = useState(false);

  // Two knocks on the door.
  useEffect(() => {
    if (!started || !beat.knock || reduced()) return;
    const ts = [150, 600].map((t) =>
      window.setTimeout(() => {
        setShaking(false);
        window.requestAnimationFrame(() => setShaking(true));
      }, t),
    );
    return () => ts.forEach((t) => window.clearTimeout(t));
  }, [started, step, beat.knock]);

  const tap = () => {
    if (!started) return;
    if (!done) return finish();
    if (isHost) room.act({ a: 'introNext' });
  };

  const last = step >= INTRO.length - 1;
  return (
    <div
      className={`intro ${shaking ? 'shake' : ''}`}
      onClick={tap}
      onAnimationEnd={() => setShaking(false)}
      role="region"
      aria-label="The story so far"
    >
      <div className="intro-top">
        <span className="intro-mark">EXILE</span>
        {isHost && (
          <button
            className="intro-skip"
            onClick={(e) => {
              e.stopPropagation();
              room.act({ a: 'introSkip' });
            }}
          >
            Skip intro
          </button>
        )}
      </div>

      {!started ? (
        <div className="intro-start">
          <h1>EXILE</h1>
          {isHost ? (
            <>
              <button
                className="intro-play"
                onClick={(e) => {
                  e.stopPropagation();
                  room.act({ a: 'introPlay' });
                }}
              >
                Play
              </button>
              <p>It plays on everyone’s phone. Tap to move it on.</p>
            </>
          ) : (
            <p>Waiting for {host} to press Play.</p>
          )}
        </div>
      ) : (
        <>
          <div className="intro-body" key={step}>
            <svg className="intro-glyph" viewBox="0 0 64 64" aria-hidden="true" dangerouslySetInnerHTML={{ __html: GLYPHS[beat.glyph] }} />
            <div className="intro-lines" aria-live="polite">
              {beat.lines.map((l, i) =>
                shown[i] > 0 || i === 0 ? (
                  <p key={i} className={`intro-line ${l.small ? 'small' : ''}`}>
                    {l.text.slice(0, shown[i])}
                    {!done && shown[i] < l.text.length && (i === 0 || shown[i - 1] >= beat.lines[i - 1].text.length) && <span className="intro-caret" />}
                  </p>
                ) : null,
              )}
              {done && beat.stamp && <div className="intro-stamp">{beat.stamp}</div>}
            </div>
          </div>
          <div className="intro-foot">
            <div className="intro-dots">
              {INTRO.map((_, i) => (
                <i key={i} className={i <= step ? 'on' : ''} />
              ))}
            </div>
            <span className={`intro-hint ${done ? 'on' : ''}`}>
              {isHost ? (last ? 'Tap to take off' : 'Tap to continue') : `${host} moves it on`}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
