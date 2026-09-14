const fs = require("fs");
const vm = require("vm");

const elementIds = [
  "raid-data-status", "boss-select", "boss-shadow-toggle", "boss-fast-move", "boss-charged-move",
  "raid-metric-select", "raid-party-size", "raid-relobby-time",
  "raid-upgrade-level", "raid-allow-elite", "raid-use-current-moves",
  "raid-csv-file", "raid-sample-button", "raid-calculate-button",
  "raid-roster-input", "boss-info", "raid-summary-rows",
  "raid-summary-matched", "raid-summary-accounts", "raid-summary-ttw",
  "boss-weaknesses", "raid-messages", "raid-context", "raid-results",
  "raid-upgrade-context", "raid-upgrade-results-body",
  "raid-adventure-effects", "raid-adventure-effects-body",
  "raid-roster-search", "raid-roster-box", "raid-roster-box-context",
  "quick-edit-modal", "quick-edit-sprite", "quick-edit-title", "quick-edit-meta",
  "quick-edit-form", "quick-edit-level", "quick-edit-cp", "quick-edit-full-link"
];

function makeElement() {
  return {
    value: "",
    checked: false,
    innerHTML: "",
    textContent: "",
    className: "",
    hidden: false,
    attributes: {},
    addEventListener() {},
    querySelectorAll() {
      return [];
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    focus() { this.focused = true; },
    setSelectionRange(start, end) {
      this.selectionStart = start;
      this.selectionEnd = end;
    },
    scrollIntoView() {},
    closest() {
      return {classList: {toggle() {}}};
    }
  };
}

const elements = Object.fromEntries(elementIds.map(id => [id, makeElement()]));
const context = {
  console,
  fetch: async () => { throw new Error("network disabled in test"); },
  document: {
    addEventListener() {},
    getElementById(id) {
      return elements[id] || makeElement();
    }
  },
  Intl,
  Map,
  Set,
  Number,
  Math,
  String,
  RegExp,
  JSON
};

vm.createContext(context);
const appCode = fs.readFileSync("outputs/pokemon-raid-roster/raid-boss.js", "utf8");
const testCode = `
bindElements();
state.pokemon = JSON.parse(__read("work/dialgadex-data/pogo_pkm.min.json")).filter(p => p.released !== false && p.fm && p.cm);
state.fastMoves = JSON.parse(__read("work/dialgadex-data/pogo_fm.json")).map(move => move.name === "Hidden Power" ? {...move, type: "None"} : move);
state.chargedMoves = JSON.parse(__read("work/dialgadex-data/pogo_cm.json"));
state.moveByName = new Map([...state.fastMoves, ...state.chargedMoves].map(m => [cleanName(m.name), m]));
state.pokemonNameIndex = buildPokemonNameIndex(state.pokemon);
state.raidBossGroups = buildRaidBossGroups(state.pokemon);
state.raidBosses = state.raidBossGroups.map(group => group.base);
state.bossGroupByKey = new Map(state.raidBossGroups.map(group => [group.key, group]));
state.ready = true;

const necrozmaDawnWings = state.pokemon.find(p => p.name === "Necrozma" && p.form === "Dawn_wings");
const necrozmaDuskMane = state.pokemon.find(p => p.name === "Necrozma" && p.form === "Dusk_mane");
if (!pokemonImageUrl(necrozmaDawnWings).endsWith("/800-dw.png")) throw new Error("Dawn Wings Necrozma sprite should use 800-dw.png in raid boss calculator");
if (!pokemonImageUrl(necrozmaDuskMane).endsWith("/800-dm.png")) throw new Error("Dusk Mane Necrozma sprite should use 800-dm.png in raid boss calculator");
const kyuremGroup = state.raidBossGroups.find(group => group.base.name === "Kyurem" && group.base.form === "Normal");
const shadowMewtwoGroup = state.raidBossGroups.find(group => group.base.name === "Mewtwo" && group.base.form === "Normal" && group.shadow);
const megaVenusaurGroup = state.raidBossGroups.find(group => group.base.name === "Mega Venusaur" && group.base.raid_tier === 4);
const primalKyogreGroup = state.raidBossGroups.find(group => group.base.name === "Primal Kyogre" && group.base.raid_tier === 6);
const enamorusGroup = state.raidBossGroups.find(group => group.base.name === "Enamorus" && group.base.raid_tier === 7);
const megaAscensionNames = ["Mega Victreebel", "Mega Dragonite", "Mega Malamar", "Mega Falinks", "Mega Skarmory", "Mega Raichu X", "Mega Raichu Y"];
const megaAscensionGroups = megaAscensionNames.map(name => state.raidBossGroups.find(group => group.base.name === name));
if (!kyuremGroup) throw new Error("Expected Kyurem in raid boss list");
if (!shadowMewtwoGroup) throw new Error("Expected Mewtwo with a checkbox Shadow variant in raid boss list");
if (!megaVenusaurGroup || !primalKyogreGroup || !enamorusGroup) throw new Error("Expected Tier-4 Mega, Tier-6, and Tier-7 bosses in raid boss list");
if (megaAscensionGroups.some(group => !group)) throw new Error("Expected Mega Ascension bosses to appear in raid boss list");
if (!megaAscensionGroups.every(group => group.tier === 4 && getRaidStats(group.base).hp === 9000 && raidBossOptionLabel(group).includes("Tier-4 Mega"))) {
  throw new Error("Mega Ascension tier overrides should calculate as Tier-4 Mega raids");
}
if (!state.raidBossGroups.every(group => RAID_BOSS_TIERS.has(group.tier))) throw new Error("Boss list should only include tier 4, 5, 6, or 7 records after overrides");
if (state.raidBossGroups.some(group => raidBossOptionLabel(group).startsWith("Shadow "))) throw new Error("Boss dropdown labels should not list Shadow variants directly");
if (getRaidStats(megaVenusaurGroup.base).hp !== 9000 || getRaidStats(primalKyogreGroup.base).hp !== 22500 || getRaidStats(enamorusGroup.base).hp !== 20000) {
  throw new Error("Raid tier HP config did not match expected Tier-4/6/7 values");
}

el.bossSelect.value = kyuremGroup.key;
updateBossShadowToggle();
el.bossShadowToggle.checked = false;
el.bossFastMove.value = "";
el.bossChargedMove.value = "";
el.raidMetricSelect.value = "eDPS";
el.raidPartySize.value = "2";
el.raidRelobbyTime.value = "10";
el.raidUpgradeLevel.value = "40";
el.raidAllowElite.checked = true;
el.raidUseCurrentMoves.checked = true;
el.raidRosterInput.value = RAID_SAMPLE_CSV;
setAdventureEffectForAccount("Main", "zacianBlade", true);
setAdventureEffectForAccount("Main", "mewtwoXDynamicPunch", true);
setAdventureEffectForAccount("Alt", "zamazentaBash", true);

calculate();

const plan = state.currentPlan;
if (!plan || plan.boss.name !== "Kyurem") throw new Error("Expected a Kyurem raid plan");
if (plan.enemy.stats.hp !== 15000) throw new Error("Tier-5 plan should use 15,000 boss HP");
if (plan.accounts.length !== 2) throw new Error("Sample should produce two account plans");
if (plan.accountPlans.length !== 2) throw new Error("Expected one visual plan per account");
if (!plan.selectedMegas.length) throw new Error("Sample should select at least one Mega/Primal");
if (!(plan.combinedDps > 0) || !(plan.estimatedTTW > 0)) throw new Error("Plan should have positive DPS and TTW");
if (!plan.accountPlans.every(accountPlan => accountPlan.topSix.length >= 3)) throw new Error("Every account should have multiple ranked attackers");
const bossTimer = getRaidTierConfig(plan.boss).timer;
const expectedTotalBossHealthPercent = 100 * plan.combinedDps * bossTimer / plan.enemy.stats.hp;
const actualTotalBossHealthPercent = plan.accountPlans.reduce((sum, accountPlan) => sum + accountPlan.bossHealthPercent, 0);
if (Math.abs(actualTotalBossHealthPercent - expectedTotalBossHealthPercent) > 0.01) throw new Error("Account boss HP percentages should be based on full-timer boosted DPS, not normalized damage share");
if (Math.abs(expectedTotalBossHealthPercent - 100 * bossTimer / plan.estimatedTTW) > 0.01) throw new Error("Combined boss HP percentage should align with estimated time to win");
if (!plan.accountPlans.every(accountPlan => accountPlan.bossHealthPercent > 0 && accountPlan.estimatedDamage > 0)) throw new Error("Every account plan should have a positive boss HP percentage and estimated damage");

const html = el.raidResults.innerHTML;
const upgradeHtml = el.raidUpgradeResultsBody.innerHTML;
const rosterBoxBeforeOpen = el.raidRosterBox.innerHTML;
const rosterBeforeOpen = el.raidRosterInput.value;
openQuickEdit(2);
const quickEditBeforeSave = {
  open: !el.quickEditModal.hidden,
  title: el.quickEditTitle.textContent,
  level: el.quickEditLevel.value,
  href: el.quickEditFullLink.attributes.href
};
if (!quickEditBeforeSave.open || !quickEditBeforeSave.title.includes("Groudon") || quickEditBeforeSave.level !== "41" || quickEditBeforeSave.href !== "#raid-roster-entry-2") {
  throw new Error("Quick edit modal should open from raid-page Pokemon tiles with the matching roster row");
}
const rosterAfterOpen = el.raidRosterInput.value;
el.quickEditLevel.value = "42.5";
syncQuickEditLevelCP("level");
const quickEditAfterLevelSync = {
  level: el.quickEditLevel.value,
  cp: el.quickEditCp.value,
  meta: el.quickEditMeta.textContent
};
if (quickEditAfterLevelSync.cp !== "4238" || !quickEditAfterLevelSync.meta.includes("CP 4,238")) {
  throw new Error("Raid quick edit level changes should auto-fill CP before save");
}
saveQuickEdit();
const openedRosterBox = el.raidRosterBox.innerHTML;
const editedRoster = {ok: el.quickEditModal.hidden};
const editedTable = parseCSV(el.raidRosterInput.value);
const editedHeaders = editedTable[0].map(normalizeHeader);
const editedRow = editedTable[1];
__result = {
  bossCount: state.raidBosses.length,
  tier4Bosses: state.raidBossGroups.filter(group => group.tier === 4).length,
  tier6Bosses: state.raidBossGroups.filter(group => group.tier === 6).length,
  tier7Bosses: state.raidBossGroups.filter(group => group.tier === 7).length,
  megaAscensionBosses: megaAscensionGroups.map(group => group.base.name + " · " + getRaidTierConfig(group.base).label),
  boss: displayPokemonName(plan.boss, false),
  accounts: plan.accounts,
  selectedMegas: plan.selectedMegas.map(candidate => displayPokemonName(candidate.pokemon, false)),
  combinedDps: plan.combinedDps,
  estimatedTTW: plan.estimatedTTW,
  rows: el.raidSummaryRows.textContent,
  matched: el.raidSummaryMatched.textContent,
  accountCount: el.raidSummaryAccounts.textContent,
  ttw: el.raidSummaryTtw.textContent,
  hasWeaknesses: el.bossWeaknesses.innerHTML.includes("Fighting") && el.bossWeaknesses.innerHTML.includes("Fairy"),
  hasBossSprite: el.bossInfo.innerHTML.includes("pokemon-sprite"),
  adventureControls: el.raidAdventureEffectsBody.innerHTML.includes("Main") && el.raidAdventureEffectsBody.innerHTML.includes("Zacian attack") && el.raidAdventureEffectsBody.innerHTML.includes("Zamazenta defense") && el.raidAdventureEffectsBody.innerHTML.includes("Mewtwo X Mega damage"),
  hasAdventureEffects: el.raidContext.textContent.includes("Adventure effects: Main: Zacian +10% attack") && html.includes("Mewtwo X +15% Mega raid damage") && html.includes("Alt: Zamazenta +10% defense") && html.includes("Zamazenta +10% defense"),
  hasClickableCards: html.includes("button class=\\"pokemon-card") && html.includes("data-entry-uid="),
  quickEdit: {
    ...quickEditBeforeSave,
    afterLevelSync: quickEditAfterLevelSync
  },
  rosterBox: {
    rendered: rosterBoxBeforeOpen.includes("raid-roster-entry-2") && rosterBoxBeforeOpen.includes("Groudon"),
    unchangedOnOpen: rosterAfterOpen === rosterBeforeOpen,
    expanded: openedRosterBox.includes("raid-roster-details-2") && openedRosterBox.includes("Save edits"),
    editOk: editedRoster.ok,
    level: editedRow[editedHeaders.indexOf("level")],
    cp: editedRow[editedHeaders.indexOf("cp")],
    fastMove: editedRow[editedHeaders.indexOf("fast_move")],
    chargedMove: editedRow[editedHeaders.indexOf("charged_move")]
  },
  damageCapacity: formatDamageCapacity(plan),
  damagePercents: plan.accountPlans.map(accountPlan => ({account: accountPlan.account, percent: accountPlan.bossHealthPercent, damage: accountPlan.estimatedDamage})),
  hasDamageCapacity: html.includes("Damage capacity") && html.includes("% boss HP") && html.includes("Boss HP damage"),
  accountPlanSections: (html.match(/class="visual-team account-plan"/g) || []).length,
  pokemonCards: (html.match(/class="pokemon-card/g) || []).length,
  megaSlots: (html.match(/Mega slot/g) || []).length,
  regularSections: (html.match(/Regular attackers/g) || []).length,
  hasPotential: html.includes("Potential"),
  hasUpgradeTable: upgradeHtml.includes("No upgrade candidates") || upgradeHtml.includes("<tr>")
};

if (__result.rows !== "20" || __result.matched !== "20" || __result.accountCount !== "2") {
  throw new Error("Sample summary did not match expected roster counts");
}
if (!__result.hasWeaknesses || !__result.hasBossSprite || !__result.adventureControls || !__result.hasAdventureEffects || !__result.hasClickableCards || !__result.rosterBox.rendered || !__result.rosterBox.unchangedOnOpen || !__result.rosterBox.expanded || !__result.rosterBox.editOk || __result.rosterBox.level !== "42.5" || __result.rosterBox.cp !== "4238" || __result.rosterBox.fastMove !== "Mud Shot" || __result.rosterBox.chargedMove !== "Precipice Blades" || !__result.hasDamageCapacity || __result.accountPlanSections !== 2 || __result.pokemonCards < 8 || __result.megaSlots < 2 || __result.regularSections < 2 || !__result.hasPotential || !__result.hasUpgradeTable) {
  throw new Error("Rendered raid plan is missing expected visual sections: " + JSON.stringify(__result, null, 2));
}
if (Math.abs(SHADOW_ATTACK_MULTIPLIER - 1.2) > 0.00001 || Math.abs(SHADOW_DAMAGE_TAKEN_MULTIPLIER - 1.2) > 0.00001) throw new Error("Shadow attacker modifiers should be 20%");
if (Math.abs(ADVENTURE_ATTACK_MULTIPLIER - 1.1) > 0.00001 || Math.abs(ADVENTURE_DEFENSE_MULTIPLIER - 1.1) > 0.00001 || Math.abs(ADVENTURE_MEWTWO_X_MEGA_DAMAGE_MULTIPLIER - 1.15) > 0.00001) throw new Error("Adventure effect modifiers should match current raid assumptions");
const mamoswine = state.pokemon.find(p => p.name === "Mamoswine" && p.form === "Normal");
const rayquaza = state.pokemon.find(boss => boss.name === "Rayquaza" && boss.form === "Normal" && !boss.shadow);
const iceWeakEnemy = buildRaidBossEnemy(rayquaza, readSettings());
const megaVenusaurEnemy = buildRaidBossEnemy(megaVenusaurGroup.base, readSettings());
const shadowSettings = {...readSettings(), metric: "DPS", useCurrentMoves: true};
const normalMamoEntry = {level: 35, ivs: {atk: 15, def: 15, hp: 15}, shadow: false, purified: false, fastMove: "Powder Snow", chargedMove: "Avalanche", chargedMove2: ""};
const shadowMamoEntry = {...normalMamoEntry, shadow: true};
const normalMamoStats = getBattleStats(mamoswine, normalMamoEntry);
const shadowMamoStats = getBattleStats(mamoswine, shadowMamoEntry);
const bladeMamoStats = getBattleStats(mamoswine, normalMamoEntry, {zacianBlade: true});
const bashMamoStats = getBattleStats(mamoswine, normalMamoEntry, {zamazentaBash: true});
if (shadowMamoStats.atk <= normalMamoStats.atk || shadowMamoStats.def >= normalMamoStats.def) throw new Error("Shadow battle stats should raise attack and lower effective defense in raid boss calculator");
if (bladeMamoStats.atk <= normalMamoStats.atk || bashMamoStats.def <= normalMamoStats.def) throw new Error("Adventure effects should raise account attack or defense stats in raid boss calculator");
const normalMamo = rankPokemon(mamoswine, normalMamoEntry, iceWeakEnemy, shadowSettings);
const shadowMamo = rankPokemon(mamoswine, shadowMamoEntry, iceWeakEnemy, shadowSettings);
const bladeMamo = rankPokemon(mamoswine, normalMamoEntry, iceWeakEnemy, {...shadowSettings, adventureEffects: {zacianBlade: true}});
const bashMamo = rankPokemon(mamoswine, normalMamoEntry, iceWeakEnemy, {...shadowSettings, adventureEffects: {zamazentaBash: true}});
const normalMegaBossMamo = rankPokemon(mamoswine, normalMamoEntry, megaVenusaurEnemy, shadowSettings);
const mewtwoXMegaBossMamo = rankPokemon(mamoswine, normalMamoEntry, megaVenusaurEnemy, {...shadowSettings, adventureEffects: {mewtwoXDynamicPunch: true}});
const mewtwoXNonMegaBossMamo = rankPokemon(mamoswine, normalMamoEntry, iceWeakEnemy, {...shadowSettings, adventureEffects: {mewtwoXDynamicPunch: true}});
if (!normalMamo || !shadowMamo || shadowMamo.dps <= normalMamo.dps) throw new Error("Shadow attacker should apply +20% outgoing damage in raid boss calculator");
if (!bladeMamo || bladeMamo.dps <= normalMamo.dps) throw new Error("Zacian Adventure Effect should raise outgoing raid damage");
if (!bashMamo || bashMamo.tdo <= normalMamo.tdo) throw new Error("Zamazenta Adventure Effect should raise raid durability");
if (!isMegaEnergyRaidBoss(megaVenusaurGroup.base) || isMegaEnergyRaidBoss(rayquaza)) throw new Error("Mewtwo X Adventure Effect should be gated to Mega/Primal energy raid bosses");
if (!normalMegaBossMamo || !mewtwoXMegaBossMamo || Math.abs(mewtwoXMegaBossMamo.dps / normalMegaBossMamo.dps - ADVENTURE_MEWTWO_X_MEGA_DAMAGE_MULTIPLIER) > 0.001) throw new Error("Mewtwo X Adventure Effect should apply +15% damage during Mega raids");
if (!mewtwoXNonMegaBossMamo || Math.abs(mewtwoXNonMegaBossMamo.dps - normalMamo.dps) > 0.0001 || mewtwoXNonMegaBossMamo.adventureDamageMultiplier !== 1) throw new Error("Mewtwo X Adventure Effect should not change normal Tier-5 raid damage");
const charizard = state.pokemon.find(p => p.name === "Charizard" && p.form === "Normal");
const charizardForms = getMegaForms(charizard);
if (charizardForms.length < 2) throw new Error("Expected Charizard to have multiple Mega forms in raid boss calculator");
if (getEligibleMegaForms({pokemon: charizard, canMega: true, megaForms: ["Mega Charizard X"]}).map(megaFormToken).join("|") !== "Mega Charizard X") throw new Error("Raid boss calculator should allow only Charizard X when selected");
if (getEligibleMegaForms({pokemon: charizard, canMega: true, megaForms: ["Mega Charizard Y"]}).map(megaFormToken).join("|") !== "Mega Charizard Y") throw new Error("Raid boss calculator should allow only Charizard Y when selected");

el.bossSelect.value = shadowMewtwoGroup.key;
updateBossShadowToggle();
if (el.bossShadowToggle.disabled) throw new Error("Shadow Mewtwo checkbox should be enabled");
el.bossShadowToggle.checked = true;
el.bossFastMove.value = "";
el.bossChargedMove.value = "";
calculate();
const shadowPlan = state.currentPlan;
if (!shadowPlan?.boss?.shadow) throw new Error("Expected selected boss to be shadow");
if (!el.bossInfo.innerHTML.includes("8 total Purified Gems") || !el.raidContext.textContent.includes("boss is treated as subdued")) {
  throw new Error("Shadow boss display should show the purified gem subdued assumption");
}
__result.shadow = {
  boss: displayBossName(shadowPlan.boss),
  hasGemAssumption: el.bossInfo.innerHTML.includes("8 total Purified Gems"),
  rows: el.raidSummaryRows.textContent,
  matched: el.raidSummaryMatched.textContent,
  accounts: el.raidSummaryAccounts.textContent
};
`;

context.__read = file => fs.readFileSync(file, "utf8");
vm.runInContext(`${appCode}\n${testCode}`, context);
console.log(JSON.stringify(context.__result, null, 2));
