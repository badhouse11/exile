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
          <b>Take off.</b> The temperature gauge shows FREEZING, MILD or SCORCHING. Where exactly you’re going stays secret until everyone’s packed.
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
          <b>Bidding.</b> Tap a bid to offer gold bars, or tap <b>Pass</b> if you don’t want it. When everyone else has passed, the top bid wins straight away.
        </li>
        <li>
          <b>Touchdown.</b> Once every bag is full, you find out where you’ve landed. Fishing rod? Lovely. You’re in a swamp.
        </li>
        <li>
          <b>The data.</b> One player at a time, the data scores each bag for Health, Morale and Supplies, and says how many days it should
          keep you alive. It’s only data.
        </li>
        <li>
          <b>The pitches.</b> Two minutes each on why you’ll last longer than the numbers say. Everyone has one <b>Debunk</b> card per game:
          play it during someone else’s pitch to call nonsense.
        </li>
        <li>
          <b>The verdict.</b> The Adjudicator starts from the data and moves each player’s days up or down based on their pitch. Then the
          days are revealed one by one, shortest first. Whoever lasts longest is the <b>Secret Survivalist</b>, and starts the next round with
          a bonus gold bar.
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
