const fs = require("fs");
const vm = require("vm");
const assert = require("assert/strict");
const context = vm.createContext({assert, console, document: {addEventListener() {}},
  read: name => JSON.parse(fs.readFileSync(`work/dialgadex-data/${name}`, "utf8"))});
vm.runInContext(fs.readFileSync("outputs/pokemon-raid-roster/raid-boss.js", "utf8"), context);
vm.runInContext(`
state.pokemon = read("pogo_pkm.min.json").filter(p => p.released !== false && p.fm && p.cm);
state.fastMoves = read("pogo_fm.json");
state.chargedMoves = read("pogo_cm.json");
state.moveByName = new Map([...state.fastMoves, ...state.chargedMoves].map(m => [moveKey(m.name), m]));
const get = name => state.pokemon.find(p => p.name === name && p.form === "Normal");
const boss = get("Kyurem");
const settings = {metric: "DPS", partySize: 2, teamSize: 6, relobbyTime: 10, upgradeLevel: 40,
  allowElite: true, useCurrentMoves: false, requireEffective: true, boostSources: [],
  bossFastMove: "Dragon Breath", bossChargedMove: "Blizzard"};
function row(pokemon, uid, account = "Main", level = 50, eligible = false) {
  return {pokemon, rawName: pokemon.name, uid, rowNumber: uid, account, level,
    ivs: {atk: 15, def: 15, hp: 15}, shadow: false, purified: false, canMega: false,
    megaForms: [], superMaxForms: [], bestBuddyEligible: eligible,
    fastMove: "", chargedMove: "", chargedMove2: "", notes: "Preserve my data"};
}
const legacy = parseRoster("account,name,level,notes\\nMain,Mewtwo,50,keep").entries[0];
assert.equal(legacy.bestBuddyEligible, false);
const imported = parseRoster("account,name,level,best_buddy_eligible,notes\\nMain,Mewtwo,50,true,keep").entries[0];
assert.equal(imported.bestBuddyEligible, true);
assert.equal(imported.notes, "keep");
const regular = row(get("Mamoswine"), 2, "Main", 50, true);
const enemy = buildRaidBossEnemy(boss, settings);
const raw = JSON.stringify(regular);
const noSelection = rankPokemon(regular.pokemon, regular, enemy, settings);
const selected = rankPokemon(regular.pokemon, regular, enemy, {...settings, bestBuddyUid: 2});
assert.equal(noSelection.level, 50, "Eligibility alone must not activate the boost");
assert.equal(selected.level, 51, "Best Buddy is a full level, not a half level");
assert.equal(selected.baseLevel, 50);
assert(selected.dps > noSelection.dps);
assert.equal(rankPokemon(regular.pokemon, {...regular, bestBuddyEligible: false}, enemy, {...settings, bestBuddyUid: 2}).level, 50);
assert.equal(rankPokemon(regular.pokemon, {...regular, uid: 3}, enemy, {...settings, bestBuddyUid: 2}).level, 50,
  "Another copy of the same species must not receive the boost");
assert.equal(JSON.stringify(regular), raw);
const upgrading = {...regular, level: 40};
const buddySettings = {...settings, bestBuddyUid: upgrading.uid};
const firstStep = rankScenario(upgrading, enemy, buddySettings, 40.5, false);
assert.equal(firstStep.level, 41.5);
assert.equal(findMinimumLevelForScenario(upgrading, {level: 42, useCurrentMoves: false}, enemy, buddySettings, firstStep.metric), 40.5,
  "Upgrade suggestions must charge for permanent levels, not free buddy levels");

const rows = [50, 48, 46, 44, 42, 40, 39.5].map((level, i) => row(get("Mamoswine"), i + 2, "Main", level, i === 6));
const before = JSON.stringify(rows);
const plan = buildRaidPlan(rows, boss, settings);
const account = plan.accountPlans[0];
assert.equal(account.buddyRecommendation.entry.uid, 8, "An eligible bench attacker can earn an active slot with the boost");
assert.equal(account.activeMembers.filter(r => r.bestBuddyBoosted).length, 1);
assert.equal(account.activeMembers.find(r => r.bestBuddyBoosted).level, 40.5);
assert(account.buddyRecommendation.metricGain > 0);
assert(renderBuddyRecommendation(account, settings).includes("Recommended buddy"));
assert(renderPokemonCard(account.activeMembers.find(r => r.bestBuddyBoosted), settings, "6", "Active", "").includes("Recommended active buddy"));
assert.equal(JSON.stringify(rows), before);

// Compare the chosen team against independently ranked teams for every possible
// single-buddy choice, including no buddy. Never boost all eligible copies.
const allEligible = rows.map(r => ({...r, bestBuddyEligible: true}));
const optimized = buildRaidPlan(allEligible, boss, settings).accountPlans[0];
const forcedScores = [null, ...allEligible.map(r => r.uid)].map(uid => {
  const ranked = allEligible.map(r => rankPokemon(r.pokemon, r, enemy, {...settings, bestBuddyUid: uid, requireEffective: true}));
  return ranked.filter(Boolean).sort((a, b) => b.metric - a.metric).slice(0, 6).reduce((sum, r) => sum + r.metric, 0) / 6;
});
assert(Math.abs(optimized.teamMetric - Math.max(...forcedScores)) < 1e-9);
assert.equal(optimized.activeMembers.filter(r => r.bestBuddyBoosted).length, 1);
const twoAccounts = buildRaidPlan([regular, row(get("Mamoswine"), 3, "Alt", 40, true)], boss, settings);
assert.equal(twoAccounts.accountPlans.length, 2);
for (const p of twoAccounts.accountPlans) {
  assert.equal(p.activeMembers.filter(r => r.bestBuddyBoosted).length, 1);
  assert.equal(p.buddyRecommendation.entry.account, p.account);
}

const megaEntry = {...row(get("Mewtwo"), 2, "Main", 50, true), canMega: true,
  megaForms: ["Mega Mewtwo X"], superMaxForms: ["Mega Mewtwo X"]};
const megaPlan = buildRaidPlan([megaEntry], boss, settings).accountPlans[0];
assert(megaPlan.slot0.bestBuddyBoosted);
assert.equal(megaPlan.slot0.level, 53, "Super Max +2 and Best Buddy +1 stack");
assert.equal(megaPlan.buddyRecommendation.entry.uid, 2);
assert.equal(megaEntry.level, 50);
const noEligible = buildRaidPlan(rows.map(r => ({...r, bestBuddyEligible: false})), boss, settings).accountPlans[0];
assert.equal(noEligible.buddyRecommendation, null);
assert.equal(noEligible.activeMembers.some(r => r.bestBuddyBoosted), false);
const uselessBench = rows.map((r, i) => ({...r, level: i === 6 ? 1 : r.level}));
assert.equal(buildRaidPlan(uselessBench, boss, settings).accountPlans[0].buddyRecommendation, null,
  "Do not recommend an eligible copy that cannot improve the active team");
console.log("Best Buddy: per-row eligibility, one full level, optimal team choice, one per account, bench promotion, Mega stacking and data preservation passed");
`, context);
