const fs = require("fs");
const vm = require("vm");

const elementIds = [
  "manual-status", "entry-account", "entry-name", "entry-form", "entry-cp",
  "entry-current-hp", "entry-level", "entry-atk", "entry-def", "entry-hp", "entry-fast",
  "entry-hidden-power-wrap", "entry-hidden-power-type", "entry-charged", "entry-charged-2", "entry-notes", "entry-shadow", "entry-purified",
  "entry-can-mega", "entry-can-mega-wrap", "entry-mega-form-options", "entry-preview",
  "inference-summary", "inference-select", "apply-inference-button",
  "add-entry-button", "reset-entry-button", "manual-csv-output",
  "manual-row-count", "manual-account-count", "manual-mega-count",
  "manual-messages", "manual-rows-body", "pokemon-suggestions",
  "copy-csv-button", "download-csv-button", "use-roster-button",
  "clear-rows-button", "row-player-filter"
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
if (!el.manualRowsBody.innerHTML.includes("No rows for Alt")) throw new Error("Player filter should hide rows for other players");
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
if (!sharedAfterEdit.includes("Main,Groudon,Normal,43,15,14,15,false,false,Mud Shot,Precipice Blades,Fire Punch,4270,true,Primal Groudon,edited from manual")) {
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
console.log(JSON.stringify(context.__result, null, 2));
