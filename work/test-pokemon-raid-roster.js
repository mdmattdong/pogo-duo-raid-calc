const fs = require("fs");
const vm = require("vm");

const elementIds = [
  "data-status", "metric-select", "party-size", "team-size", "relobby-time",
  "allow-elite", "upgrade-level", "use-current-moves", "csv-file",
  "sample-button", "grass-sample-button", "clear-button", "calculate-button",
  "roster-input", "summary-rows", "summary-matched", "summary-six",
  "messages", "type-results-body", "type-context", "upgrade-results-body",
  "upgrade-context", "roster-search", "roster-box", "roster-box-context",
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
    selectionStart: 0,
    selectionEnd: 0,
    focused: false,
    addEventListener() {},
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    focus() { this.focused = true; },
    setSelectionRange(start, end) {
      this.selectionStart = start;
      this.selectionEnd = end;
    },
    scrollIntoView() {}
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
const appCode = fs.readFileSync("outputs/pokemon-raid-roster/app.js", "utf8");
const testCode = `
bindElements();
state.pokemon = JSON.parse(__read("work/dialgadex-data/pogo_pkm.min.json")).filter(p => p.released !== false && p.fm && p.cm);
state.fastMoves = JSON.parse(__read("work/dialgadex-data/pogo_fm.json")).map(move => move.name === "Hidden Power" ? {...move, type: "None"} : move);
state.chargedMoves = JSON.parse(__read("work/dialgadex-data/pogo_cm.json"));
state.moveByName = new Map([...state.fastMoves, ...state.chargedMoves].map(m => [cleanName(m.name), m]));
state.pokemonNameIndex = buildPokemonNameIndex(state.pokemon);
state.ready = true;
const zacianCrowned = state.pokemon.find(p => p.name === "Zacian" && p.form === "Crowned_sword");
const zamazentaCrowned = state.pokemon.find(p => p.name === "Zamazenta" && p.form === "Crowned_shield");
if (!pokemonImageUrl(zacianCrowned).endsWith("/888-c.png")) throw new Error("Zacian Crowned Sword sprite should use 888-c.png");
if (!pokemonImageUrl(zamazentaCrowned).endsWith("/889-c.png")) throw new Error("Zamazenta Crowned Shield sprite should use 889-c.png");
const necrozmaDawnWings = state.pokemon.find(p => p.name === "Necrozma" && p.form === "Dawn_wings");
const necrozmaDuskMane = state.pokemon.find(p => p.name === "Necrozma" && p.form === "Dusk_mane");
if (!pokemonImageUrl(necrozmaDawnWings).endsWith("/800-dw.png")) throw new Error("Dawn Wings Necrozma sprite should use 800-dw.png");
if (!pokemonImageUrl(necrozmaDuskMane).endsWith("/800-dm.png")) throw new Error("Dusk Mane Necrozma sprite should use 800-dm.png");
const starmie = state.pokemon.find(p => p.name === "Starmie" && p.form === "Normal");
const starmieMoveOptions = getPokemonMoveOptions(starmie, false, true, false);
const starmieHiddenPowerOptions = starmieMoveOptions.fast.filter(move => isHiddenPowerMove(move.name));
const starmieHiddenPowerIce = constrainMoves(starmieMoveOptions.fast, "Hidden Power Ice", true);
const starmieHiddenPowerGeneric = constrainMoves(starmieMoveOptions.fast, "Hidden Power", true);
if (starmieHiddenPowerOptions.length !== 16) throw new Error("Hidden Power should expand to 16 typed fast moves");
if (starmieHiddenPowerIce.length !== 1 || starmieHiddenPowerIce[0].type !== "Ice") throw new Error("Hidden Power Ice should constrain to Ice");
if (starmieHiddenPowerGeneric.length !== 16) throw new Error("Generic Hidden Power should keep all typed Hidden Power options");
if (Math.abs(SHADOW_ATTACK_MULTIPLIER - 1.2) > 0.00001 || Math.abs(SHADOW_DAMAGE_TAKEN_MULTIPLIER - 1.2) > 0.00001) throw new Error("Shadow attacker modifiers should be 20%");
const mamoswine = state.pokemon.find(p => p.name === "Mamoswine" && p.form === "Normal");
const iceEnemy = buildAttackTypeEnemy("Ice");
const shadowSettings = {metric: "DPS", partySize: 2, teamSize: 6, relobbyTime: 10, allowElite: true, useCurrentMoves: true, requireEffective: true, requiredAttackType: "Ice"};
const normalMamoEntry = {level: 35, ivs: {atk: 15, def: 15, hp: 15}, shadow: false, purified: false, fastMove: "Powder Snow", chargedMove: "Avalanche", chargedMove2: ""};
const shadowMamoEntry = {...normalMamoEntry, shadow: true};
const normalMamoStats = getBattleStats(mamoswine, normalMamoEntry);
const shadowMamoStats = getBattleStats(mamoswine, shadowMamoEntry);
if (shadowMamoStats.atk <= normalMamoStats.atk || shadowMamoStats.def >= normalMamoStats.def) throw new Error("Shadow battle stats should raise attack and lower effective defense");
const normalMamo = rankPokemon(mamoswine, normalMamoEntry, iceEnemy, shadowSettings);
const shadowMamo = rankPokemon(mamoswine, shadowMamoEntry, iceEnemy, shadowSettings);
if (!normalMamo || !shadowMamo || shadowMamo.dps <= normalMamo.dps) throw new Error("Shadow attacker should apply +20% outgoing damage");
const charizard = state.pokemon.find(p => p.name === "Charizard" && p.form === "Normal");
const charizardForms = getMegaForms(charizard);
const charizardXOnly = {pokemon: charizard, canMega: true, megaForms: ["Mega Charizard X"]};
const charizardYOnly = {pokemon: charizard, canMega: true, megaForms: ["Mega Charizard Y"]};
const charizardBothLegacy = {pokemon: charizard, canMega: true, megaForms: []};
if (charizardForms.length < 2) throw new Error("Expected Charizard to have multiple Mega forms");
if (getEligibleMegaForms(charizardXOnly).map(megaFormToken).join("|") !== "Mega Charizard X") throw new Error("Mega form filter should allow only Charizard X");
if (getEligibleMegaForms(charizardYOnly).map(megaFormToken).join("|") !== "Mega Charizard Y") throw new Error("Mega form filter should allow only Charizard Y");
if (getEligibleMegaForms(charizardBothLegacy).length !== charizardForms.length) throw new Error("Blank mega_forms with can_mega should keep legacy all-form behavior");
const megaAscensionBases = ["Victreebel", "Dragonite", "Malamar"].map(name => state.pokemon.find(p => p.name === name && p.form === "Normal"));
if (megaAscensionBases.some(pokemon => !pokemon || !getMegaForms(pokemon).some(mega => mega.name === "Mega " + pokemon.name))) {
  throw new Error("Expected Mega Ascension forms to be available from the roster Mega checkbox lookup");
}
el.metricSelect.value = "eDPS";
el.partySize.value = "2";
el.teamSize.value = "6";
el.relobbyTime.value = "10";
el.upgradeLevel.value = "40";
el.allowElite.checked = true;
el.useCurrentMoves.checked = true;
el.rosterInput.value = SAMPLE_CSV;
calculate();
const sampleResult = {
  rows: el.summaryRows.textContent,
  matched: el.summaryMatched.textContent,
  accounts: el.summarySix.textContent,
  typeContext: el.typeContext.textContent,
  typeStart: el.typeResultsBody.innerHTML.slice(0, 500),
  upgradeContext: el.upgradeContext.textContent,
  upgradeStart: el.upgradeResultsBody.innerHTML.slice(0, 500),
  messages: el.messages.innerHTML
};
el.rosterInput.value = GRASS_SAMPLE_CSV;
calculate();
const mainGrassRow = state.currentTypeTeams.find(row => row.account === "Main" && row.type === "Grass");
const mainGrassVisual = renderVisualTeam(mainGrassRow, state.currentSettings);
const initialGrassTypeHtml = el.typeResultsBody.innerHTML;
const meowscaradaUpgrade = getVisualUpgradeCandidates(mainGrassRow).find(candidate => candidate.before.pokemon.name === "Meowscarada");
const groupedUpgradeHtml = el.upgradeResultsBody.innerHTML;
if (!groupedUpgradeHtml.includes("upgrade-group-row") || !groupedUpgradeHtml.includes("data-upgrade-type")) throw new Error("Upgrade candidates should render grouped type rows");
state.rosterSearch = "Meowscarada";
renderRosterBox(state.currentRosterEntries, state.currentUsableByUid, state.currentSettings);
const rosterSearchHtml = el.rosterBox.innerHTML;
const rosterSearchContext = el.rosterBoxContext.textContent;
if (!rosterSearchHtml.includes("Meowscarada") || rosterSearchHtml.includes("Groudon") || !rosterSearchContext.includes("matching")) throw new Error("Roster search should filter the roster box");
state.rosterSearch = "";
renderRosterBox(state.currentRosterEntries, state.currentUsableByUid, state.currentSettings);
const rosterBeforeOpen = el.rosterInput.value;
openRosterEntry(meowscaradaUpgrade.entryUid);
const openedRosterBox = el.rosterBox.innerHTML;
const openedMessage = el.messages.innerHTML;
const openedExpandedUid = state.expandedRosterUid;
openRosterEntry(2);
const megaEligibleRosterBox = el.rosterBox.innerHTML;
const rosterAfterOpen = el.rosterInput.value;
const displayAfter = getCandidateDisplayAfter(meowscaradaUpgrade);
openQuickEdit(meowscaradaUpgrade.entryUid);
const quickEditBeforeSave = {
  open: !el.quickEditModal.hidden,
  title: el.quickEditTitle.textContent,
  level: el.quickEditLevel.value,
  href: el.quickEditFullLink.attributes.href
};
if (!quickEditBeforeSave.open || !quickEditBeforeSave.title.includes("Meowscarada") || quickEditBeforeSave.level !== "28" || quickEditBeforeSave.href !== "#roster-entry-11") {
  throw new Error("Quick edit modal should open from type-page Pokemon tiles with the matching roster row");
}
el.quickEditLevel.value = String(displayAfter.level);
syncQuickEditLevelCP("level");
const quickEditAfterLevelSync = {
  level: el.quickEditLevel.value,
  cp: el.quickEditCp.value,
  meta: el.quickEditMeta.textContent
};
if (quickEditAfterLevelSync.cp !== String(displayAfter.cp) || !quickEditAfterLevelSync.meta.includes("CP " + displayAfter.cp.toLocaleString())) {
  throw new Error("Quick edit level changes should auto-fill CP before save");
}
el.quickEditCp.value = String(displayAfter.cp);
syncQuickEditLevelCP("cp");
const quickEditAfterCpSync = {
  level: el.quickEditLevel.value,
  cp: el.quickEditCp.value,
  meta: el.quickEditMeta.textContent
};
if (quickEditAfterCpSync.level !== String(displayAfter.level) || !quickEditAfterCpSync.meta.includes("Lv " + displayAfter.level.toFixed(1))) {
  throw new Error("Quick edit CP changes should auto-fill the closest level before save");
}
saveQuickEdit();
const moveEdited = updateCSVRow(meowscaradaUpgrade.entryUid, {
  level: String(displayAfter.level),
  cp: String(displayAfter.cp),
  fast_move: displayAfter.fastMove.name,
  charged_move: displayAfter.chargedMove.name,
  charged_move_2: "Night Slash"
});
calculate();
const edited = {ok: moveEdited.ok && el.quickEditModal.hidden};
const editedTable = parseCSV(el.rosterInput.value);
const editedHeaders = editedTable[0].map(normalizeHeader);
const editedRow = editedTable[meowscaradaUpgrade.entryUid - 1];
const recalculatedMainGrass = state.currentTypeTeams.find(row => row.account === "Main" && row.type === "Grass");
const disabledMega = updateCSVRow(2, {can_mega: "false"});
calculate();
const noGroudonMegaGrass = state.currentTypeTeams.find(row => row.account === "Main" && row.type === "Grass");
__result = {
  sample: sampleResult,
  grass: {
    rows: el.summaryRows.textContent,
    matched: el.summaryMatched.textContent,
    accounts: el.summarySix.textContent,
    typeContext: el.typeContext.textContent,
    typeRows: (el.typeResultsBody.innerHTML.match(/class="type-summary-row/g) || []).length,
    hasMainPrimalGroudon: initialGrassTypeHtml.includes("<td>Main</td>") && initialGrassTypeHtml.includes(">Grass</span>") && initialGrassTypeHtml.includes("Primal Groudon"),
    hasAltMegaSceptile: initialGrassTypeHtml.includes("<td>Alt</td>") && initialGrassTypeHtml.includes("Mega Sceptile"),
    hasVisualCardRenderer: mainGrassVisual.includes("pokemon-sprite"),
    currentCardCount: (mainGrassVisual.match(/class="pokemon-card(?:\\s|")/g) || []).length,
    upgradeCardCount: (mainGrassVisual.match(/upgrade-card/g) || []).length,
    megaRowCount: (mainGrassVisual.match(/class="mega-row"/g) || []).length,
    hasRegularTeamGrid: mainGrassVisual.includes("regular-team-grid"),
    hasPotentialGrid: mainGrassVisual.includes("potential-grid"),
    hasCandyText: mainGrassVisual.includes("Candy</span>"),
    hasLevelGainText: mainGrassVisual.includes("levels"),
    hasMoveChangeText: mainGrassVisual.includes("Moves</span>"),
    hasSlotFivePotential: mainGrassVisual.includes("Could take slot 5"),
    hasSlotFiveThreshold: mainGrassVisual.includes("beats #5"),
    hasRoseradeUpgrade: mainGrassVisual.includes("Roserade") && mainGrassVisual.includes("Potential"),
    hasVictreebelUpgrade: mainGrassVisual.includes("Shadow Victreebel") && mainGrassVisual.includes("Potential"),
    hasMeowscaradaUpgrade: mainGrassVisual.includes("Meowscarada") && mainGrassVisual.includes("Potential"),
    rosterOpen: {
      rosterUnchanged: rosterAfterOpen === rosterBeforeOpen,
      expandedUid: openedExpandedUid,
      hasExpandedPanel: openedRosterBox.includes("roster-details") && openedRosterBox.includes("Save edits"),
      hasMoveReference: openedRosterBox.includes("Fast:") && openedRosterBox.includes("Charged:"),
      hasChargedMove2Field: openedRosterBox.includes("Charged move 2"),
      hidesMegaCheckboxForNonMega: !openedRosterBox.includes("Can Mega/Primal"),
      showsMegaCheckboxForMega: megaEligibleRosterBox.includes("Can Mega/Primal"),
      message: openedMessage
    },
    quickEdit: {
      ...quickEditBeforeSave,
      afterLevelSync: quickEditAfterLevelSync,
      afterCpSync: quickEditAfterCpSync
    },
    rosterEdit: {
      ok: edited.ok,
      level: editedRow[editedHeaders.indexOf("level")],
      cp: editedRow[editedHeaders.indexOf("cp")],
      fastMove: editedRow[editedHeaders.indexOf("fast_move")],
      chargedMove: editedRow[editedHeaders.indexOf("charged_move")],
      chargedMove2: editedRow[editedHeaders.indexOf("charged_move_2")],
      isTopSixAfterEdit: recalculatedMainGrass.topSix.some(result => result.entry.uid === meowscaradaUpgrade.entryUid)
    },
    megaToggle: {
      ok: disabledMega.ok,
      slot0AfterDisable: noGroudonMegaGrass.slot0?.pokemon.name || "",
      excludesPrimalGroudon: noGroudonMegaGrass.slot0?.pokemon.name !== "Primal Groudon"
    },
    minimalUpgrade: {
      level: displayAfter.level,
      cp: displayAfter.cp,
      metric: displayAfter.metric,
      cutoff: meowscaradaUpgrade.cutoff,
      cutoffSlot: meowscaradaUpgrade.cutoffSlot
    },
    grassStart: el.typeResultsBody.innerHTML.slice(0, 900)
  }
};
`;
context.__read = file => fs.readFileSync(file, "utf8");
vm.runInContext(`${appCode}\n${testCode}`, context);
console.log(JSON.stringify(context.__result, null, 2));
