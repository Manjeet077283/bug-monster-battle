# Bug Monster Battle

Bug Monster Battle is a browser-based CodeQuest coding adventure. Debug your way through nine Python missions across Bug Forest, Neon Dungeon, and Cyber Abyss, learn from each test result, and defeat the Bug Lord.

## Features

- Nine progressively challenging missions grouped into three worlds.
- A turn-based battle loop with boss and player health, attacks, XP, streaks, achievements, and unlockable levels.
- A beginner-friendly editor, progressive hints, meaningful test cases, and an explanation after each successful challenge.
- Optional Copilot prompt assistance and suggested fixes. The game does not connect to a Copilot API.
- A restricted local challenge checker. It recognizes only the supported mission patterns and never executes arbitrary player code or sends it to a server.
- Responsive cyberpunk arenas, world-specific visuals, reduced-motion support, and optional sound.

## Technology

- React 19 and TypeScript
- Vite
- Framer Motion
- Lucide React
- Vitest and Oxlint

## Requirements

- Node.js 20.19+ or 22.12+
- npm (the repository includes `package-lock.json`)

## Run locally

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173/`).

## Play

Choose the current unlocked mission from the campaign map, inspect the mission story and objective, then repair the Python function in the editor. Select **Run tests** to check the solution against predefined cases. Failed tests show expected and actual values and let the boss counterattack; hints are optional and do not prevent mission completion. Passing every test defeats the boss, explains the concept, awards XP, and unlocks the next mission. Complete all nine missions to reveal the treasure.

## Quality checks

```sh
npm test
npm run lint
npm run build
```

## Deploy to Render

This project is a static Vite site and includes a `render.yaml` Blueprint:

- **Service type:** Static Site
- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **Environment variables:** none required

Push the repository to GitHub, then in Render choose **New + → Blueprint**, connect the repository, and apply the `render.yaml` Blueprint. Render builds and publishes the static site from the configured branch. The app uses a single page and hash-based in-page navigation, so no server-side runtime or SPA rewrite is required.
