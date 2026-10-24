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

1. Go to **exilethegame.com**. One player taps **Start a game**; everyone else scans the QR code on their phone, taps **Invite friends**, or types the four-letter code. Everyone picks a name and a colour.
2. The host taps **Take off**. The game shuffles an Adjudicator rota: everyone judges exactly one round.
3. **Briefing.** The Adjudicator takes off. The temperature gauge shows FREEZING, MILD or SCORCHING. The place stays secret.
4. **The deal.** Items come up one category at a time: Partner, Tool, Food, Animal, Fun. Players bid gold bars from their phones or tap **Pass**; when everyone else has passed, the top bid wins straight away. The last player still needing a category gets **last pick**: three to choose from, for one gold bar. Fresh 20 gold bars a round (21 for the last Secret Survivalist). Players always keep one bar back for each empty slot.
5. **Touchdown.** Once every bag is full, the place is stamped across every screen.
6. **The data.** The Adjudicator reveals each player's numbers one at a time, lowest first: Health, Morale and Supplies out of 30, then the days the data gives them. Then: *However… the data may suggest this, but it comes down to the pitches.*
7. **The pitches.** Two minutes each, on a clock the Adjudicator runs. Everyone has one **Debunk** card per game, played from their phone during someone else's pitch. Pure theatre: a big red stamp on every screen.
8. **The verdict.** The Adjudicator starts from the data and moves each player's days up or down based on their pitch. The screen goes dark and the days are revealed one by one, shortest first: *Surviving 39 days is… Dev.* The final two get the drumroll, and the longest is the **Secret Survivalist**.
9. After everyone has adjudicated, whoever won the most rounds is crowned **Last One Standing**.

## Editing the cards

All 250 cards (50 per category) and the 13 places live in `src/data/cards.ts`. Each card is one line:

```
Name|BODY|MIND|SUPPLY|tags|kind|note|battery
Bear Grylls|5|2|5|ch|Survivalist|Will get you out alive. Will make you drink something first.
Jaws|1|4|1|w|Film|An all-time classic. You'll never swim again.|3
```

- **BODY, MIND, SUPPLY** (1 to 5) are the hidden scores: health and safety, morale, and how long it keeps you going. Players never see them.
- **tags:** `c` good in the cold, `h` good in the heat, `w` good near water, `p` spoils in the heat, `l` legendary, `d` back from the dead (a legendary partner). Legends are rare: at most one per category per round.
- **kind** is the small label (Survivalist, Grow, Film…), **note** is the card's line (the upside, then the catch), **battery** is days of power or `solar`.

The deck reshuffles every round, so big games never run out; cards from earlier rounds only come back once the fresh ones are used up.

Add, remove or reword lines freely.

## How the data works out the days

`survivalDays` in `src/game/rules.ts` adds up each bag's BODY, MIND and SUPPLY, after the place has had its say. Cold-friendly kit gets a boost on FREEZING ground and heat-friendly kit when it's SCORCHING; fresh food spoils in the heat; boats and fishing gear only help near water. A bag with one gaping hole (no food, no morale) takes a 30% hit. On random bags the result runs from a handful of days to around 240.

The data only sets the scene. The Adjudicator's own days decide the round.

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
