const fs = require("fs");
const vm = require("vm");
const assert = require("assert/strict");

for (const app of ["app.js", "raid-boss.js"]) {
  const context = vm.createContext({console, document: {addEventListener() {}}, assert,
    read: name => JSON.parse(fs.readFileSync(`work/dialgadex-data/${name}`, "utf8"))});
  vm.runInContext(fs.readFileSync(`outputs/pokemon-raid-roster/${app}`, "utf8"), context);
  vm.runInContext(`
    state.pokemon = read("pogo_pkm.min.json").filter(p => p.released !== false && p.fm && p.cm);
    state.fastMoves = read("pogo_fm.json");
    state.chargedMoves = read("pogo_cm.json");
    state.moveByName = new Map([...state.fastMoves, ...state.chargedMoves].map(m => [moveKey(m.name), m]));
    const eligible = state.pokemon.filter(p => getMegaAdditionalChargedMoves(p).length);
    assert.equal(eligible.length, 17);
    for (const name of ["Mega Beedrill", "Mega Houndoom", "Mega Staraptor", "Mega Manectric"]) {
      assert(eligible.some(p => p.name === name), name + " must have a Plus move");
    }
    for (const name of ["Surf", "Brave Bird", "Dark Pulse", "Outrage", "Future Sight"]) {
      assert.equal(findMove(name).name, name, "Normal move must never resolve to Plus move");
      assert.equal(findMove(name + "+").name, name + "+");
    }
    const greninja = eligible.find(p => p.name === "Mega Greninja");
    const options = getPokemonMoveOptions(greninja, false, false);
    const entered = constrainMoves(options.charged, ["Surf"], true, getMegaAdditionalChargedMoves(greninja));
    assert(entered.some(m => m.name === "Surf") && entered.some(m => m.name === "Surf+"), "Normal and automatic Plus move must coexist");
    const baseGreninja = state.pokemon.find(p => p.name === "Greninja" && p.form === "Normal");
    assert(!getPokemonMoveOptions(baseGreninja, false, true).charged.some(m => m.name.endsWith("+")));
    const entry = {level: 50, ivs: {atk: 15, def: 14, hp: 13}, shadow: false,
      fastMove: "", chargedMove: "", chargedMove2: "", notes: "Preserve this"};
    const before = JSON.stringify(entry);
    const dataBefore = JSON.stringify(state.chargedMoves);
    for (const pokemon of eligible) {
      const move = findMove(getMegaAdditionalChargedMoves(pokemon)[0]);
      assert(move, pokemon.name + " Plus move data must exist");
      for (const level of [1, 2, 3, 4]) {
        assert.equal(getMegaChargedMove(pokemon, move, level).power, move.power * (1 + (level - 1) / 10));
        assert.equal(getBattleLevel(pokemon, entry, level), level === 4 ? 52 : 50);
      }
      const regular = findMove(pokemon.cm[0]);
      assert.equal(getMegaChargedMove(pokemon, regular, 4), regular);
      const enemy = {weakness: new Map(TYPES.map(t => [t, 1.6])), stats: {atk: 200, def: 160, hp: 15000},
        enemyYs: [{Any: {y_num: null, cm_num: null}}]};
      const settings = {metric: "DPS", partySize: 1, teamSize: 6, relobbyTime: 10, allowElite: true,
        useCurrentMoves: false, requireEffective: false, boostSources: []};
      const one = rankPokemon(pokemon, entry, enemy, {...settings, megaLevel: 1});
      const four = rankPokemon(pokemon, entry, enemy, {...settings, megaLevel: 4});
      assert(one && four && four.dps > one.dps, pokemon.name + " Level 4 should increase DPS");
      assert.equal(four.level, 52);
      assert.equal(four.baseLevel, 50);
      assert.equal(four.cp, getPokemonCP(getPokemonStats(pokemon, 52, entry.ivs, false)));
      const repeat = rankPokemon(pokemon, entry, enemy, {...settings, megaLevel: 4});
      assert.equal(repeat.dps, four.dps, "Repeated calculations must not compound the boost");
      assert.equal(getBattleLevel(pokemon, {...entry, level: 51}, 4), 53);
    }
    for (const name of ["Mewtwo", "Mega Rayquaza", "Primal Groudon", "Mega Sceptile"]) {
      const p = state.pokemon.find(p => p.name === name);
      assert.equal(getBattleLevel(p, entry, 4), 50, name + " must not receive the Super Max boost");
    }
    assert.equal(JSON.stringify(entry), before, "User's entered data must stay unchanged");
    assert.equal(JSON.stringify(state.chargedMoves), dataBefore, "Base move data must stay unchanged");
  `, context);
  console.log(`${app}: all 17 Super Max forms, damage scaling, levels, CP and non-mutation passed`);
}

const backupCode = fs.readFileSync("outputs/pokemon-raid-roster/roster-backup.js", "utf8");
const initial = {
  pokemonRaidRosterCurrentCsv: "account,name,level\nMain,Mewtwo,43",
  pokemonRaidRosterManualRows: '[{"name":"Mewtwo","level":43}]',
  pokemonRaidRosterPlayerNames: '["Main"]',
  pokemonRaidRosterPreviousCsv: "previous exact text"
};
const storage = new Map(Object.entries(initial));
const backupContext = vm.createContext({document: {addEventListener() {}}, location: {href: "test-original-address"},
  localStorage: {getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v)}});
vm.runInContext(backupCode, backupContext);
const key = "pokemonRaidRosterBeforeMegaLevel4_20261017";
const first = storage.get(key);
assert.deepEqual(JSON.parse(first).values, initial);
for (const [k, v] of Object.entries(initial)) assert.equal(storage.get(k), v);
storage.set("pokemonRaidRosterCurrentCsv", "later edited roster");
vm.runInContext(backupCode, backupContext);
assert.equal(storage.get(key), first, "Original recovery snapshot must never be replaced");
assert.equal(storage.get("pokemonRaidRosterCurrentCsv"), "later edited roster");
vm.runInNewContext(backupCode, {document: {addEventListener() {}}, localStorage: {getItem() {throw Error("denied");}}});
console.log("Roster backup: exact preservation, idempotency and blocked-storage handling passed");
