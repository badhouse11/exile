# EXILE

*You've been exiled. One jet. Five things. Bid for your survival.*

A same-room party game for 3 to 8 players, each on their own phone. Everyone bids gold bars on what to take into exile (a partner, a survival tool, food, an animal and something for fun), then pitches the room on why they'll survive. One player each round is the **Adjudicator**, who decides who lasts longest.

Built on the same bones as GREENLIT, but it is a completely separate project: its own repo, its own Netlify site and its own room server. Nothing here touches GREENLIT.

## Setting it live

Everything runs on one free Cloudflare Worker: the website and the game rooms share one address.

1. In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**, pick `badhouse11/exile`.
2. Name it **`exile-rooms`**. Build command `npm run build`, deploy command `npx wrangler deploy`.
3. In the Worker's **Settings → Domains & Routes**, enable **workers.dev**.
4. Open that address (`https://exile-rooms.<your-subdomain>.workers.dev`). That's the game. Share it with the players.

Every push to `main` redeploys it automatically.

Netlify is optional. To host the site there instead, import the repo (settings come from `netlify.toml`) and set the environment variable `VITE_ROOM_SERVER` to the Worker address above.

## How a game runs

1. One player taps **Start a game** and shares the code or invite link. Everyone joins, picks a name and a colour.
2. The host taps **Take off**. The game shuffles an Adjudicator rota: everyone judges exactly one round.
3. **Briefing.** The Adjudicator takes off. The temperature gauge shows FREEZING, MILD or SCORCHING. The place itself is secret.
4. **The deal.** Items come up one at a time in random order: partner, tool, food, animal, enjoyment, in any mix. Bids go from each phone. Each player has a fresh 15 gold bars a round (16 for the last Secret Survivalist). A slot, once filled, is locked. Players always keep one bar back for each empty slot, so nobody goes bust.
5. **The terrain.** Halfway through the deal, the place is stamped across every screen.
6. **The data.** When every bag is full, everyone sees *Data suggests: 43 days* for each player.
7. **The pitches.** Two minutes each, on a clock the Adjudicator runs. Everyone has one **Debunk** card per game, played from their phone during someone else's pitch. It's pure theatre: a big red stamp on every screen.
8. **The verdict.** The Adjudicator ranks the players, survivor first. The day counter rolls and players drop out one by one until the **Secret Survivalist** is left standing.
9. After everyone has adjudicated, whoever won the most rounds is crowned **Last One Standing**.

Optional: a laptop or TV can tap **Big screen** and enter the code to show the game to the room.

If a phone drops out, it rejoins automatically. Someone else can pick up that player from a new phone, or the Adjudicator can pack their bag for them. If the host's phone goes quiet for 20 seconds, anyone can step in.

## Editing the cards

All 500 cards and the 13 places live in `src/data/cards.ts`. Each card is one line:

```
Name|BODY|MIND|SUPPLY|tags|kind|note|battery
Bear Grylls|5|2|5|ch|Survivalist|Ex-SAS. Will drink anything
Jaws|1|4|1|w|Film|DVD player|3
```

- **BODY, MIND, SUPPLY** (1 to 5) are the hidden scores: health and safety, morale, and how long it keeps you going. Players never see them.
- **tags:** `c` good in the cold, `h` good in the heat, `w` good near water, `p` spoils in the heat, `d` back from the dead.
- **kind** is the small label (Survivalist, Grow, Film…), **note** is the subheading under the name, **battery** is days of power or `solar`.

Add, remove or reword lines freely.

## How the data works out the days

`survivalDays` in `src/game/rules.ts` adds up each bag's BODY, MIND and SUPPLY, after the place has had its say. Cold-friendly kit gets a boost on FREEZING ground and heat-friendly kit when it's SCORCHING; fresh food spoils in the heat; boats and fishing gear only help near water. A bag with one gaping hole (no food, no morale) takes a 30% hit. On random bags the result runs from a handful of days to around 240.

The days only set the scene. The Adjudicator's ranking decides the round, and the counter hands out those same day totals in the Adjudicator's order.

Every rule number (gold, timings, pitch length) lives at the top of `src/game/rules.ts`.

## Run it locally

You need Node 20 or newer.

```bash
npm install
npm run dev      # the site, at http://localhost:5173
npm test         # plays whole games through the room logic
```

For multiplayer locally, run the Worker with `npx wrangler dev` and set `VITE_ROOM_SERVER=http://localhost:8787` in a `.env.local` file.

## Structure

```
src/
  data/cards.ts       the deck and the places (edit me)
  game/rules.ts       rule numbers, scoring, dealing
  game/game.test.ts   full-game simulations
  net/                room logic, wire format, the phone connection
  screens/            home, rules, lobby and every phase of a round
  components/         cards, bags, the gauge, lino-cut icons
  styles/global.css   the print look: paper, olive ink, Solace orange
server/index.ts       the Cloudflare room server
```

Type is **Gloock** (headlines) and **Hanken Grotesk** (body), both from Google Fonts.
