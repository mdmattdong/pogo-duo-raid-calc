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
const raw = {y_num: 10, cm_num: 60, fast_y_num: 4, charged_y_num: 6, fast_rate: 0.4, charged_rate: 0.1};
const original = JSON.stringify(raw);
assert.equal(applyDodging(raw, {dodgeMode: "none"}), raw);
assert.equal(applyDodging(raw, {}), raw);
const charged = applyDodging(raw, {dodgeMode: "charged", dodgeSuccess: 1});
assert.equal(charged.y_num, 5.5, "Only charged damage receives 75% mitigation");
assert.equal(charged.cm_num, 15);
assert.equal(charged.attackUptime, 0.95, "One 0.5-second dodge per charged attack");
const all = applyDodging(raw, {dodgeMode: "all", dodgeSuccess: 1});
assert.equal(all.y_num, 2.5);
assert.equal(all.attackUptime, 0.75, "Fast and charged dodge attempts both cost time");
const failed = applyDodging(raw, {dodgeMode: "charged", dodgeSuccess: 0});
assert.equal(failed.y_num, raw.y_num, "Failed dodges do not mitigate damage");
assert.equal(failed.attackUptime, 0.95, "Failed dodges still cost time");
assert.equal(applyDodging(raw, {dodgeMode: "charged", dodgeSuccess: 0.5}).y_num, 7.75);
assert.equal(JSON.stringify(raw), original, "A dodge calculation must not modify shared boss data");
const unknown = {y_num: null, cm_num: null, charged_rate: 0};
assert.equal(applyDodging(unknown, {dodgeMode: "all"}), unknown);

for (const names of [["Fire Spin", "Overheat"], ["Dragon Breath", "Blizzard"]]) {
  const model = getSpecificY(["Fire", "Dragon"], 200, findMove(names[0]), findMove(names[1]));
  const incoming = avgYAgainst(model, ["Grass", "Steel"]);
  assert(Math.abs(incoming.y_num - incoming.fast_y_num - incoming.charged_y_num) < 1e-8);
  assert(incoming.charged_rate > 0 && incoming.fast_rate >= 0);
  const dodge = applyDodging(incoming, {dodgeMode: "charged", dodgeSuccess: 1});
  assert(Math.abs(dodge.y_num - incoming.fast_y_num - 0.25 * incoming.charged_y_num) < 1e-8,
    "Mitigation must preserve type effectiveness, including mixed-type boss moves");
}

const pokemon = state.pokemon.find(p => p.name === "Mamoswine" && p.form === "Normal");
const boss = state.pokemon.find(p => p.name === "Kyurem" && p.form === "Normal");
const settings = {metric: "eDPS", partySize: 2, teamSize: 6, relobbyTime: 10,
  allowElite: true, useCurrentMoves: true, requireEffective: false, boostSources: [],
  bossFastMove: "Dragon Breath", bossChargedMove: "Blizzard"};
const enemy = buildRaidBossEnemy(boss, settings);
const entry = {level: 40, ivs: {atk: 15, def: 15, hp: 15}, shadow: false,
  fastMove: "Powder Snow", chargedMove: "Avalanche", chargedMove2: "", notes: "keep this"};
const entryBefore = JSON.stringify(entry);
const base = rankPokemon(pokemon, entry, enemy, settings);
const none = rankPokemon(pokemon, entry, enemy, {...settings, dodgeMode: "none", dodgeSuccess: 0});
assert.equal(none.dps, base.dps, "No dodging must retain existing results");
assert.equal(none.edps, base.edps);
const miss = rankPokemon(pokemon, entry, enemy, {...settings, dodgeMode: "charged", dodgeSuccess: 0});
assert(miss.dps < base.dps, "Attempting and missing dodges must reduce attacking time");
const hit = rankPokemon(pokemon, entry, enemy, {...settings, dodgeMode: "charged", dodgeSuccess: 1});
assert(hit.tdo > base.tdo, "Successful charged dodges should improve lifetime damage in this matchup");
for (const mode of ["none", "charged", "all"]) {
  for (const success of [0, 0.5, 1]) {
    const result = rankPokemon(pokemon, entry, enemy, {...settings, dodgeMode: mode, dodgeSuccess: success});
    for (const metric of ["dps", "tdo", "edps"]) assert(Number.isFinite(result[metric]) && result[metric] > 0);
  }
}
assert.equal(JSON.stringify(entry), entryBefore);
console.log("Dodging: damage mitigation, attempt time, success rate, mixed types, no-dodge baseline and roster preservation passed");
console.log(JSON.stringify({noDodge: {dps: base.dps, tdo: base.tdo, edps: base.edps},
  chargedDodges: {dps: hit.dps, tdo: hit.tdo, edps: hit.edps}}, null, 2));
`, context);
