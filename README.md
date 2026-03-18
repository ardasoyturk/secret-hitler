# Secret Hitler — Pass & Play Edition

A single-device, pass-and-play implementation of the [Secret Hitler](https://secrethitler.com) board game for 5–10 players. The current app is built as a tablet-first Astro + React Progressive Web App with offline caching, install support, optimized assets, and a rules-accurate engine.

![Secret Hitler Game Screenshot](https://github.com/user-attachments/assets/833ce11e-fed1-42ac-af89-c800e9e810f6)

## Play

```bash
bun install
bun run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

For a production-like PWA build:

```bash
bun run build
bun run preview
```

Then open the preview URL and install the app from the browser UI.
`bun run dev` is for UI iteration; install/offline behavior should be verified in preview or production builds.

## Rules

This implementation is faithful to the official Secret Hitler rules:

- **5–10 players** with correct role distribution (Liberals, Fascists, Hitler)
- **17-card policy deck** (11 Fascist, 6 Liberal) with automatic reshuffling
- **Strict majority voting** (>50%, ties fail)
- **Election tracker** — 3 consecutive failed elections enact the top policy
- **Term limits** — last Chancellor always ineligible; last President ineligible with >5 alive
- **Executive powers** by player count (Investigate, Peek, Special Election, Execution)
- **Veto power** unlocks after the 5th Fascist policy
- **Hitler knowledge** — Hitler knows Fascists in 5–6 player games only
- **Win conditions** — 5 Liberal policies, 6 Fascist policies, Hitler executed, Hitler elected Chancellor after 3+ Fascist policies

## Features

- **Pass-and-play** — one device, pass it around the table
- **Tablet-first gameplay shell** — fixed board rail with a scrollable action area for mixed tablet sizes
- **Privacy gates** — role reveals and votes are hidden behind "hand the device to…" screens
- **Offline-capable PWA** — installable, aggressively cached, works without internet after first load
- **Game persistence** — saves to localStorage, survives page refresh
- **Optimized media pipeline** — Astro converts image assets to modern formats for production
- **SVG-aligned boards** — liberal and fascist policy placement is driven by SVG board geometry
- **Touch-first setup flow** — larger player cards with drag-and-drop reordering
- **Lean asset footprint** — unused legacy assets and components were removed from the codebase
- **20 player portraits** — each player picks a unique portrait
- **Colored player borders** — visually distinct at table distance
- **Rules-accurate engine** — 108 unit tests covering all game logic

## Tech Stack

| Layer      | Tool               |
| ---------- | ------------------ |
| Framework  | Astro 6 + React 19 |
| Language   | TypeScript         |
| Styling    | Tailwind CSS v4    |
| PWA        | `@vite-pwa/astro`  |
| Runtime    | Bun                |
| Linting    | oxlint             |
| Formatting | oxfmt              |
| Testing    | bun:test           |

## Scripts

| Command             | Description                 |
| ------------------- | --------------------------- |
| `bun run dev`       | Start dev server            |
| `bun run build`     | Production build to `dist/` |
| `bun run preview`   | Preview production build    |
| `bun test`          | Run all tests               |
| `bun test --watch`  | Run tests in watch mode     |
| `bun run lint`      | Lint source files           |
| `bun run fmt`       | Format source files         |
| `bun run fmt:check` | Check formatting            |

## Project Structure

```
secret-hitler/
├── public/              # Static assets (favicons, install icons)
├── src/
│   ├── assets/          # Active game images (boards, cards, portraits, etc.)
│   ├── components/
│   │   ├── cards/       # PolicyCard, VoteCard, PartyCard
│   │   ├── game/        # Game orchestrator
│   │   ├── layout/      # BoardTrack, Header, viewport overlay helpers
│   │   └── screens/     # Setup, Night, Nomination, Voting, Legislative,
│   │                    #   PolicyEnacted, Executive, Veto, GameOver
│   ├── engine/          # Pure TypeScript rules engine
│   │   ├── types.ts     # Full type system (GameState, GamePhase, etc.)
│   │   ├── constants.ts # Game constants, executive power tables
│   │   ├── deck.ts      # Shuffle, draw, discard, peek, reshuffle
│   │   ├── roles.ts     # Role assignment, distribution
│   │   ├── eligibility.ts # Chancellor eligibility, term limits
│   │   ├── election.ts  # Vote counting, strict majority
│   │   ├── victory.ts   # All win condition checks
│   │   └── reducer.ts   # State machine / reducer
│   ├── hooks/           # useGame, useGamePersistence
│   ├── pages/           # index.astro
│   └── styles/          # global.css (Tailwind v4 theme)
└── tests/               # 108 unit tests
```

`manifest.webmanifest` and `sw.js` are generated at build time by `@vite-pwa/astro`, and the service-worker registration code is bundled into the Astro client output.

## License

This work is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).

Secret Hitler was created by Mike Boxleiter, Tommy Maranges, and Max Temkin, and is licensed under CC BY-NC-SA 4.0. This is an independent derivative work — not affiliated with or endorsed by the original creators.
