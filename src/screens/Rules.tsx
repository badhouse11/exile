import { CATEGORY_LABELS, CATEGORIES } from '../data/cards';
import { RULES } from '../game/rules';

export default function Rules({ onBack }: { onBack: () => void }) {
  return (
    <main className="app rules">
      <div className="topbar">
        <button className="wordmark" onClick={onBack}>
          EXILE
        </button>
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </div>
      <h1 className="display" style={{ fontSize: 56 }}>
        How to play
      </h1>
      <p>
        You’ve been exiled. A jet is waiting. You can take five things with you, and everyone else wants them too. Bid for your bag, then
        convince the room you’ll survive.
      </p>

      <h2>Before you start</h2>
      <ul>
        <li>3 to 8 players, each on their own phone, all in the same room.</li>
        <li>One person taps Start a game and shares the four-letter code. Everyone else joins with it.</li>
        <li>Pick a name and a colour. The host takes off when everyone’s on board.</li>
      </ul>

      <h2>Each round</h2>
      <ol>
        <li>
          <b>The Adjudicator.</b> One player judges the round instead of playing it. Everyone takes a turn, once each.
        </li>
        <li>
          <b>Take off.</b> The temperature gauge shows FREEZING, MILD or SCORCHING. Where exactly you’re going stays secret.
        </li>
        <li>
          <b>The deal.</b> Items appear one at a time, in random order. Your bag has five slots:
          <div className="legend-cats" style={{ marginTop: 8 }}>
            {CATEGORIES.map((c) => (
              <span key={c} className={`cat-${c}`}>
                {CATEGORY_LABELS[c]}
              </span>
            ))}
          </div>
          You get {RULES.goldPerRound} gold bars a round to bid with. Once a slot is filled it’s locked, and you always keep one bar back for every
          empty slot. Leftover gold doesn’t carry over, so spend it.
        </li>
        <li>
          <b>The terrain.</b> Halfway through the deal, the place is revealed. Fishing rod? Lovely. You’re in a swamp.
        </li>
        <li>
          <b>The data.</b> When every bag is full, everyone’s survival odds go up: <i>Data suggests: 43 days</i>. It’s only data. The pitch is
          what counts.
        </li>
        <li>
          <b>The pitches.</b> Two minutes each on why you’ll make it. Everyone has one <b>Debunk</b> card per game: play it during someone else’s
          pitch to call nonsense.
        </li>
        <li>
          <b>The verdict.</b> The Adjudicator ranks who lasts longest. The day counter rolls and people drop out until one is left: the{' '}
          <b>Secret Survivalist</b>, who starts the next round with a bonus gold bar.
        </li>
      </ol>

      <h2>Winning</h2>
      <p>
        Once everyone has been Adjudicator, whoever won the most rounds is crowned <b>Last One Standing</b>.
      </p>

      <button className="btn primary block" onClick={onBack}>
        Got it
      </button>
    </main>
  );
}
