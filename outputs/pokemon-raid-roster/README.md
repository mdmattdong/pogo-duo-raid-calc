# Pokemon GO Raid Roster Evaluator

Open `index.html` through a local web server, paste a roster CSV, and calculate. Use `raid-boss.html` when you want boss-specific raid teams instead of reusable type teams.

The app is built for two-account raid team planning. Put an `account` column in your CSV, such as `Main` and `Alt`; teams and upgrade candidates are grouped separately for each account. Party Power defaults to `2 players`.

Use `manual-entry.html` when you want to build or edit the roster by hand. It lets you choose a player/account from a dropdown, then enter Pokemon, form, CP, HP, level, IVs, moves, Shadow/Purified, notes, and Mega/Primal readiness. Click any entered row to load it back into the form, then `Save changes` to update the row and the shared roster used by the type evaluator and raid boss calculator. If you enter Pokemon, CP, and HP, it lists possible level/IV matches and auto-fills level plus IVs when there is only one exact match.

There are three main views:

- Best teams by type: each account's reusable top six for the 17 raid-useful attacking types. Normal is intentionally omitted because it is never super effective.
- Type upgrade candidates: Pokemon that can enter the active regular lineup, or materially improve an existing type team slot.
- Raid boss calculator: chooses the best paired plan for the selected Tier-4 Mega, Tier-5, Tier-6, or Tier-7 boss across loaded accounts, including each account's slot 0 Mega/Primal, active regular attackers, and boss-specific upgrade candidates.

The app fetches the same public resource JSON that DialgaDex preloads:

- `pogo_pkm.min.json`
- `pogo_fm.json`
- `pogo_cm.json`

Safe public configuration, including the data source and sprite base URLs, lives in `config.js`; `config.example.js` mirrors those publishable defaults. Keep any private local overrides, real roster exports, screenshots, or browser/session data out of Git; the root `.gitignore` is set up for that.

Accepted roster columns include:

- `name` or `pokemon`
- `account`
- `form`
- `level`
- `cp`
- `atk_iv`
- `def_iv`
- `hp_iv`
- `shadow`
- `purified`
- `can_mega`
- `mega_forms`
- `fast_move`
- `charged_move`
- `charged_move_2`
- `notes`

Test data:

- The evaluator and raid boss pages open with saved roster data when present, otherwise with a blank roster. Sample buttons load fake data as a preview only and do not replace the saved roster.
- `grass-test-roster.csv` is the same fake two-account Grass roster. It includes Primal Groudon on `Main` to demonstrate Grass background-boost slot 0, plus Mega Sceptile and Mega Venusaur options.

Display:

- Click any account/type row to open a visual team view. The expanded view shows slot 0 on its own row, then the regular top six in two rows of three with Serebii Pokemon GO sprites, CP, level, IVs, moves, and score. CSV notes are not shown in the visual cards.
- The expanded view also has a `Potential` row with up to three upgrade candidates outside the active cutoff. Each card shows the candy, level gain, and move changes needed to barely beat the current cutoff: #5 when slot 0 is available, otherwise #6.
- Type upgrade candidates are grouped by attack type; click a type group to expand or collapse its candidate rows.
- Click any visual Pokemon card to jump to that Pokemon's expanded spot in the bottom `Roster box`. You can also search the roster box by Pokemon, account, move, type, CP, or note, then click a roster spot to expand it. Edit level, CP, moves, IVs, notes, or Mega/Primal readiness there and use `Save edits` to update the roster and recalculate.

Shadow attacker handling:

- Roster Pokemon marked `shadow` get the Pokemon GO Shadow damage modifiers in both calculators: 20% more outgoing attack damage and 20% more incoming damage.
- The incoming-damage penalty is modeled as lower effective defense during TDO/eDPS calculations.

If `level` is blank and `cp` plus IVs are present, the tool estimates the nearest half-level. If moves are blank, it searches that Pokemon's best legal moveset for each attacking type. If moves are filled in and "use entered moves" is checked, it evaluates those actual moves only. `charged_move_2` is optional; when present, the evaluator can choose either charged move for the relevant type.

Upgrade candidates compare each Pokemon's current result to:

- best moves at its current level
- current moves powered up to the upgrade level
- best moves powered up to the upgrade level

The upgrade table highlights Pokemon that could enter that account's active regular lineup for a specific attacking type, plus material gains for Pokemon already in that type team.

Mega, Primal, and Mega Rayquaza handling:

- Pokemon with an available Mega Evolution or Primal Reversion and `Can Mega/Primal` checked in the roster box are evaluated separately as `slot 0`.
- For Pokemon with multiple Mega forms, such as Charizard X/Y, use `mega_forms` to choose which forms are ready. Values can be separated by `|`, `/`, `;`, or commas, such as `Mega Charizard X|Mega Charizard Y`. If `can_mega` is true and `mega_forms` is blank, the legacy behavior is to allow all available Mega/Primal forms.
- A Poke Genie export without `can_mega` starts unchecked; saving a Mega/Primal-capable roster spot writes `can_mega` and, when relevant, `mega_forms` back into the CSV.
- Slot 0 is displayed separately from the six regular attackers, but potential-upgrade cutoffs assume the Mega/Primal takes one battle slot when it is available.
- Primal Groudon, Primal Kyogre, and Mega Rayquaza are prioritized when their background boost applies:
  - Primal Groudon: Fire, Grass, Ground
  - Primal Kyogre: Water, Electric, Bug
  - Mega Rayquaza: Flying, Psychic, Dragon

Raid boss calculator notes:

- The boss picker is built from `raid_tier: 4`, `5`, `6`, and `7` Pokemon/forms in the local data. Shadow bosses are not listed separately; use the `shadow raid boss` checkbox when that boss has a Shadow variant.
- Mega Ascension bosses that the local data marks as `raid_tier: 8` are treated as Tier-4 Mega raids when they appear in the Mega Ascension rotation.
- Bosses use tier-specific HP and CPM values with a 300-second timer, plus boss-specific typing, defense, and move pools.
- Boss fast and charged moves can stay on `Any`, or you can choose exact boss moves when you know them.
- Zacian, Zamazenta, and Mewtwo X Adventure Effect toggles are per account. Behemoth Blade is modeled as +10% outgoing raid attack, Behemoth Bash is modeled as +10% raid defense, and Mewtwo X Dynamic Punch+ is modeled as +15% outgoing damage during Tier-4 Mega and Tier-6 Mega/Primal raids only.
- For Shadow raid bosses, the calculator assumes two players use four Purified Gems each, for eight total gems, and treats the boss as subdued for planning purposes.
- For Tier-4 Mega and Tier-6 Mega/Primal raids, the calculator calls out estimated time to win because faster clears award more Mega/Primal Energy.
- The paired Mega/Primal optimizer evaluates accounts together. Primal Groudon, Primal Kyogre, and Mega Rayquaza use full background-style boost weighting; regular Megas use a partial field-window boost estimate.
- If an account has any eligible Pokemon marked `can_mega`, the calculator chooses a slot 0 Mega/Primal for that account and treats the regular active cutoff as slot #5. If no Mega/Primal is available, the cutoff is slot #6.
- Team cards on the type evaluator and raid boss page open a quick level/CP editor first. Changing level auto-fills calculated CP, changing CP auto-fills the closest half-level for that Pokemon and IV spread, and Save writes both back to the shared roster. The full-details link opens that Pokemon's roster row for moves, IVs, Shadow/Purified status, notes, and Mega readiness before recalculating.
- Each account plan shows estimated boss-HP damage capacity based on that account's boosted DPS over the full raid timer, so a strong account can show more than 100% on easier bosses. The percentage reflects Party Power plus the selected Mega/Primal pair.

The formulas are a practical local implementation of DialgaDex/GamePress-style raid DPS, TDO, and eDPS. This is intended for "which six of mine should I bring?" decisions, not frame-perfect raid simulation.
