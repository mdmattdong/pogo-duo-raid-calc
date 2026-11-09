const fs = require("fs");
const vm = require("vm");

const elementIds = [
  "manual-status", "entry-account", "entry-name", "entry-form", "entry-cp",
  "entry-current-hp", "entry-level", "entry-atk", "entry-def", "entry-hp", "entry-fast",
  "entry-hidden-power-wrap", "entry-hidden-power-type", "entry-charged", "entry-charged-2", "entry-notes", "entry-shadow", "entry-purified", "entry-best-buddy",
  "entry-can-mega", "entry-can-mega-wrap", "entry-mega-form-options", "entry-super-max-options", "entry-preview",
  "inference-summary", "inference-select", "apply-inference-button",
  "add-entry-button", "reset-entry-button", "manual-csv-output",
  "manual-row-count", "manual-account-count", "manual-mega-count",
  "manual-messages", "manual-rows-body", "pokemon-suggestions",
  "copy-csv-button", "download-csv-button", "use-roster-button",
  "clear-rows-button", "row-player-filter", "row-search", "row-sort", "manual-view-count"
];

function makeClassList() {
  const classes = new Set();
  return {
    add(name) { classes.add(name); },
    remove(name) { classes.delete(name); },
    contains(name) { return classes.has(name); },
    toggle(name, force) {
      const shouldAdd = force === undefined ? !classes.has(name) : Boolean(force);
      if (shouldAdd) classes.add(name);
      else classes.delete(name);
      return shouldAdd;
    },
    toString() { return [...classes].join(" "); }
  };
}

function makeElement() {
  return {
    value: "",
    checked: false,
    disabled: false,
    innerHTML: "",
    textContent: "",
    className: "",
    classList: makeClassList(),
    attributes: {},
    dataset: {},
    readOnly: false,
    addEventListener() {},
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name] || null; },
    removeAttribute(name) { delete this.attributes[name]; },
    focus() { this.focused = true; },
    select() { this.selected = true; },
    scrollIntoView(options) { this.scrolled = options || true; },
    querySelectorAll() { return []; }
  };
}

const elements = Object.fromEntries(elementIds.map(id => [id, makeElement()]));
const storage = new Map();
const context = {
  console,
  fetch: async () => { throw new Error("network disabled in test"); },
  document: {
    addEventListener() {},
    getElementById(id) {
      return elements[id] || makeElement();
    }
  },
  window: {
    setTimeout(callback) {
      if (typeof callback === "function") callback();
      return 0;
    },
    prompt() {
      return "CLEAR";
    }
  },
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
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
context.window.localStorage = context.localStorage;
vm.createContext(context);

const appCode = fs.readFileSync("outputs/pokemon-raid-roster/manual-entry.js", "utf8");
const testCode = `
bindElements();
renderHiddenPowerTypeOptions();
state.allPokemon = JSON.parse(__read("work/dialgadex-data/pogo_pkm.min.json")).filter(p => p.released !== false);
state.rosterPokemon = state.allPokemon.filter(p => !isMegaForm(p.form)).sort((a, b) => displayPokemonName(a).localeCompare(displayPokemonName(b)));
state.pokemonIndex = buildPokemonIndex(state.rosterPokemon);
state.ready = true;

const manualRows = [{
  account: "Main",
  name: "Groudon",
  form: "Normal",
  level: "41",
  current_hp: "174",
  atk_iv: "15",
  def_iv: "14",
  hp_iv: "15",
  shadow: "false",
  purified: "false",
  fast_move: "Mud Shot",
  charged_move: "Precipice Blades",
  charged_move_2: "Fire Punch",
  cp: "4159",
  can_mega: "true",
  mega_forms: "Primal Groudon",
  notes: "manual hp should survive"
}];
const sharedCsv = "account,name,form,level,atk_iv,def_iv,hp_iv,shadow,purified,fast_move,charged_move,charged_move_2,cp,can_mega,mega_forms,notes\\nMain,Groudon,Normal,42.5,15,14,15,false,false,Mud Shot,Precipice Blades,Fire Punch,4238,true,Primal Groudon,planner update";
localStorage.setItem(STORAGE_KEY, JSON.stringify(manualRows));
localStorage.setItem(CURRENT_CSV_KEY, sharedCsv);

loadSavedRows();
renderRows();
if (state.rows.length !== 1) throw new Error("Manual page should load one editable row");
if (state.rows[0].level !== "42.5" || state.rows[0].cp !== "4238" || state.rows[0].current_hp !== "174" || state.rows[0].notes !== "planner update") {
  throw new Error("Manual rows should merge planner edits while preserving manual HP: " + JSON.stringify(state.rows[0]));
}
if (!el.entryAccount.innerHTML.includes('value="Main"') || !el.entryAccount.innerHTML.includes('value="Alt"') || !el.entryAccount.innerHTML.includes("Add player")) {
  throw new Error("Manual form should render player dropdown options");
}
if (!el.rowPlayerFilter.innerHTML.includes("All players") || !el.rowPlayerFilter.innerHTML.includes('value="Main"')) {
  throw new Error("Manual table should render a player filter dropdown");
}
if (!el.manualRowsBody.innerHTML.includes("data-row-index=\\"0\\"") || !el.manualRowsBody.innerHTML.includes("HP 174")) {
  throw new Error("Manual row should be clickable and preserve HP display");
}
el.rowPlayerFilter.value = "Alt";
handleRowPlayerFilterChange();
if (!el.manualRowsBody.innerHTML.includes("No Pokémon match your search and player filter")) throw new Error("Player filter should hide rows for other players");
el.rowPlayerFilter.value = "Main";
handleRowPlayerFilterChange();
if (!el.manualRowsBody.innerHTML.includes("Groudon")) throw new Error("Player filter should show rows for the selected player");
window.prompt = () => "Third";
el.entryAccount.value = ADD_PLAYER_VALUE;
handleEntryPlayerChange();
if (el.entryAccount.value !== "Third" || !el.entryAccount.innerHTML.includes('value="Third"') || !localStorage.getItem(PLAYER_STORAGE_KEY)?.includes("Third")) {
  throw new Error("Add player option should create and persist a custom player");
}
el.entryAccount.value = "Main";
handleEntryPlayerChange();

editRow(0);
if (state.editingIndex !== 0 || el.addEntryButton.textContent !== "Save changes") throw new Error("Edit row should enter edit mode");
if (el.entryName.value !== "Groudon" || el.entryLevel.value !== "42.5" || el.entryCp.value !== "4238" || el.entryCurrentHp.value !== "174") {
  throw new Error("Edit row should populate the entry form: " + JSON.stringify({name: el.entryName.value, level: el.entryLevel.value, cp: el.entryCp.value, hp: el.entryCurrentHp.value}));
}
if (!el.manualRowsBody.innerHTML.includes("is-editing")) throw new Error("Editing row should be highlighted");

el.entryLevel.value = "43";
el.entryCp.value = "4270";
el.entryNotes.value = "edited from manual";
saveCurrentEntry();
const savedRows = JSON.parse(localStorage.getItem(STORAGE_KEY));
const sharedAfterEdit = localStorage.getItem(CURRENT_CSV_KEY);
const previousAfterEdit = localStorage.getItem(PREVIOUS_CSV_KEY);
if (state.rows.length !== 1 || state.editingIndex !== null || savedRows[0].level !== "43" || savedRows[0].cp !== "4270" || savedRows[0].current_hp !== "174") {
  throw new Error("Saving an edited manual row should update local editable rows");
}
if (!sharedAfterEdit.includes("Main,Groudon,Normal,43,15,14,15,false,false,Mud Shot,Precipice Blades,Fire Punch,4270,true,Primal Groudon,,edited from manual")) {
  throw new Error("Saving an edited manual row should update the shared roster CSV: " + sharedAfterEdit);
}
if (previousAfterEdit !== sharedCsv) throw new Error("Manual edit should keep a previous shared CSV backup");
if (el.manualRowsBody.innerHTML.includes("is-editing")) throw new Error("Manual row highlight should clear after save");

__result = {
  loaded: state.rows.length,
  editButton: el.addEntryButton.textContent,
  table: el.manualRowsBody.innerHTML.slice(0, 500),
  sharedAfterEdit
};
`;

context.__read = file => fs.readFileSync(file, "utf8");
vm.runInContext(`${appCode}\n${testCode}`, context);
vm.runInContext(`
const ownedRow = normalizeStoredRow({...state.rows[0], name: "Mewtwo", super_max_forms: "Mega Mewtwo X", best_buddy_eligible: "true", notes: "preserve unlocks"});
const ownedCSV = serializeCSV([CSV_HEADERS, rowToCSVCells(ownedRow)]);
const roundTrip = parseRosterCSVRows(ownedCSV)[0];
if (roundTrip.best_buddy_eligible !== "true") throw Error("Best Buddy eligibility must survive manual CSV export/import");
if (roundTrip.super_max_forms !== "Mega Mewtwo X" || roundTrip.notes !== "preserve unlocks") throw Error("Manual CSV export/import must preserve per-form unlocks and existing fields");
state.rows = [ownedRow];
editRow(0);
if (!el.entrySuperMaxOptions.innerHTML.includes('value="Mega Mewtwo X" checked') || el.entrySuperMaxOptions.innerHTML.includes('value="Mega Mewtwo Y" checked')) throw Error("Manual editor must restore the specific unlocked form");
if (!el.entryBestBuddy.checked) throw Error("Manual edit must restore Best Buddy eligibility");
el.entrySuperMaxOptions.querySelectorAll = () => [{value: "Mega Mewtwo X"}];
el.entryNotes.value = "updated notes";
const collected = collectFormRow();
if (collected.best_buddy_eligible !== "true") throw Error("Editing other fields must preserve Best Buddy eligibility");
el.entryBestBuddy.checked = false;
if (collectFormRow().best_buddy_eligible !== "false") throw Error("Unchecking must clear Best Buddy eligibility");
if (collected.super_max_forms !== "Mega Mewtwo X" || collected.notes !== "updated notes") throw Error("Editing normal fields must retain Super Max unlocks");
el.entrySuperMaxOptions.querySelectorAll = () => [];
if (collectFormRow().super_max_forms !== "") throw Error("Unchecking Super Max must remove the unlock");
`, context);
vm.runInContext(`
const testRows = [
  {name: "Groudon", account: "Main", level: "40", cp: "4159", notes: "legacy"},
  {name: "Mewtwo", account: "Main", level: "50", cp: "4,500", date_added: "2026-10-01T12:00:00Z", notes: "legacy psychic", best_buddy_eligible: "true", super_max_forms: "Mega Mewtwo X"},
  {name: "Bulbasaur", account: "Main", level: "20", cp: "", date_added: "2026-11-08T12:00:00Z"},
  {name: "Mewtwo", account: "Alt", level: "50", cp: "4499", date_added: "2026-10-01T12:00:00Z", notes: "other copy"},
  {name: "Unmatched", account: "Main", level: "", cp: "", date_added: "invalid"}
].map(normalizeStoredRow);
state.rows = testRows;
state.rowPlayerFilter = ALL_PLAYERS_VALUE;
state.rowSearch = "";
const beforeView = JSON.stringify(state.rows);
const csvBeforeView = getManualCSV();
const indices = () => getVisibleManualRows().map(item => item.index).join(",");
state.rowSort = "dex-asc";
if (indices() !== "2,1,3,0,4") throw Error("Pokédex sort must be numeric, stable, and put unmatched names last");
state.rowSort = "dex-desc";
if (indices() !== "0,1,3,2,4") throw Error("Descending Pokédex sort must keep missing numbers last");
state.rowSort = "cp-asc";
if (indices() !== "2,0,3,1,4") throw Error("Ascending CP sort must keep missing CP last");
state.rowSort = "cp-desc";
if (indices() !== "1,3,0,2,4") throw Error("CP sort must handle commas, calculated CP, and missing CP");
const calculated = getVisibleManualRows().find(item => item.index === 2);
if (!calculated.calculatedCp || !(calculated.cp > 0) || state.rows[2].cp !== "") throw Error("Calculated CP must not overwrite saved CP");
state.rowSort = "date-desc";
if (indices() !== "2,1,3,0,4") throw Error("Date sort must put newest first and unknown dates last");
state.rowSort = "date-asc";
if (indices() !== "1,3,2,0,4") throw Error("Date sort must keep equal dates stable and unknown dates last");
state.rowSearch = "#150";
if (indices() !== "1,3") throw Error("Exact Pokédex search must find both copies");
state.rowSearch = "mewtwo legacy";
if (indices() !== "1") throw Error("Multi-word search must match name and notes together");
state.rowSearch = "#150";
state.rowPlayerFilter = "Alt";
if (indices() !== "3") throw Error("Player and text filters must combine");
renderRows();
if (!el.manualRowsBody.innerHTML.includes('data-row-index="3"') || !el.manualViewCount.textContent.includes("1 of 5")) throw Error("Rendered row must retain its original edit index and show result count");
editRow(getVisibleManualRows()[0].index);
if (state.editingIndex !== 3 || el.entryAccount.value !== "Alt") throw Error("Editing a sorted and filtered copy must target the correct original row");
if (JSON.stringify(state.rows) !== beforeView || getManualCSV() !== csvBeforeView) throw Error("Search, sort, render and opening an edit must not mutate roster or CSV order");
state.rowSearch = "missingzzzz";
renderRows();
if (!el.manualRowsBody.innerHTML.includes("No Pokémon match")) throw Error("Empty search results need a clear message");
state.rowSearch = "";
state.rowSort = "entry";
state.rowPlayerFilter = ALL_PLAYERS_VALUE;
if (indices() !== "0,1,2,3,4") throw Error("Original entry order must remain available");
const datedRoundTrip = parseRosterCSVRows(getManualCSV());
if (datedRoundTrip[1].date_added !== testRows[1].date_added || datedRoundTrip[1].best_buddy_eligible !== "true" || datedRoundTrip[1].super_max_forms !== "Mega Mewtwo X") throw Error("CSV round trip must preserve dates and existing unlocks");
const reconciledDate = reconcileSavedRows([testRows[1]], [{...testRows[1], date_added: ""}]);
if (reconciledDate[0].date_added !== testRows[1].date_added) throw Error("Older shared CSV must not erase a saved manual timestamp");
editRow(2);
state.editingIndex = null;
const addedAfter = Date.now();
saveCurrentEntry();
const addedIndex = state.rows.length - 1;
const addedTimestamp = state.rows[addedIndex].date_added;
if (!addedTimestamp || Date.parse(addedTimestamp) < addedAfter || Date.parse(addedTimestamp) > Date.now()) throw Error("New rows must receive an actual creation timestamp");
editRow(addedIndex);
el.entryNotes.value = "edited after adding";
saveCurrentEntry();
if (state.rows[addedIndex].date_added !== addedTimestamp) throw Error("Edits must retain the original date added");
editRow(0);
el.entryNotes.value = "edited legacy";
saveCurrentEntry();
if (state.rows[0].date_added !== "") throw Error("Editing a legacy row must not invent its date added");
state.rowSearch = "other copy";
state.rowSort = "cp-desc";
const removeIndex = getVisibleManualRows()[0].index;
removeRow(removeIndex);
if (state.rows.some(row => row.account === "Alt") || !state.rows.some(row => row.name === "Mewtwo" && row.account === "Main")) throw Error("Removing a filtered copy must not remove a different original row");
console.log("Manual list: search, numeric sorting, missing dates, stable edit/remove indices, timestamp lifecycle and full-roster preservation passed");
`, context);
console.log(JSON.stringify(context.__result, null, 2));
