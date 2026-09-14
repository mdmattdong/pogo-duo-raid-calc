# Pokemon GO Raid Roster Toolkit

A static browser app for planning Pokemon GO raid teams from your own current roster. It includes a reusable type-team evaluator, a manual roster-entry page, and a raid boss calculator for Tier-4 Mega, Tier-5, Tier-6, and Tier-7 raids.

The raid boss calculator shows each account's estimated boss-HP damage capacity using the same Party Power, Mega/Primal, and Zacian/Zamazenta/Mewtwo X Adventure Effect model that drives the paired-team recommendation. The Mewtwo X damage effect is applied only for Tier-4 Mega and Tier-6 Mega/Primal raids.

For Mega Ascension, the calculator treats Mega Victreebel, Mega Dragonite, Mega Malamar, Mega Falinks, Mega Skarmory, Mega Raichu X, and Mega Raichu Y as Tier-4 Mega raids even when the downloaded source data still flags their debut forms as tier 8.

## Privacy And Public GitHub Safety

This project does not need passwords, API keys, account credentials, browser session cookies, or account numbers. Real roster data should stay local to your browser or in ignored CSV files.

The repository ignore rules are set up to keep these out of Git:

- real roster CSV exports, except the two fake sample CSVs included with the app
- `.env` files and local config overrides
- browser profiles, cookies, Playwright auth snapshots, and HAR files
- local databases such as SQLite, DuckDB, and Realm files
- OS/editor files such as `.DS_Store`
- logs, caches, build output, dependencies, and screenshots

The app stores manually entered roster rows in browser `localStorage` under `pokemonRaidRoster...` keys. Browser storage is not part of this project folder and will not be tracked by Git unless you manually export it into a tracked file.

## Project Layout

- `outputs/pokemon-raid-roster/index.html`: reusable best-attacker teams by type
- `outputs/pokemon-raid-roster/manual-entry.html`: manual roster entry and CP/HP inference
- `outputs/pokemon-raid-roster/raid-boss.html`: boss-specific paired-account calculator
- `outputs/pokemon-raid-roster/config.js`: safe public URLs for game data and sprites
- `outputs/pokemon-raid-roster/config.example.js`: safe example browser config
- `outputs/pokemon-raid-roster/sample-roster.csv`: fake sample roster
- `outputs/pokemon-raid-roster/grass-test-roster.csv`: fake Grass-type sample roster
- `work/`: local regression and browser smoke tests

## Setup

No build step is required for normal use. Serve the folder with any static web server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/outputs/pokemon-raid-roster/
```

The pages can also be opened directly from disk in many browsers, but a local web server is more reliable for loading the public JSON data.

For optional test tooling:

```bash
npm install
```

## Configuration

Runtime config that is safe to publish lives in `outputs/pokemon-raid-roster/config.js`. `outputs/pokemon-raid-roster/config.example.js` mirrors the safe defaults.

The static app has no required private config. If future local scripts or deploy wrappers need environment variables, use `.env.example` as the safe template and keep the real `.env` file local.

Do not put real Pokemon GO roster exports, trainer names you consider private, screenshots, cookies, or browser profiles in tracked files. Use ignored names or folders such as `rosters/`, `exports/`, `local-data/`, or any non-sample `.csv` file.

## Tests

Syntax checks:

```bash
npm run check
```

Core regression tests:

```bash
npm test
```

Browser smoke tests are optional and require Playwright:

```bash
npm run test:smoke
```

## Publishing Checklist

Before the first public commit:

```bash
git status --short --ignored
git add .gitignore .env.example README.md outputs work
git status --short
```

Check that any real roster CSVs, `.env` files, `.DS_Store` files, browser profiles, cookies, databases, and screenshots appear as ignored or untracked files you intentionally leave out of the commit.
