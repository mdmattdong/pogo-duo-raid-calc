const TYPES = [
  "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison",
  "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
  "Steel", "Fairy"
];

const TEAM_TYPES = TYPES.filter(type => type !== "Normal");

const HIDDEN_POWER_TYPES = TYPES.filter(type => !["Normal", "Fairy"].includes(type));

const TYPE_COLORS = {
  Normal: "#8b8a78", Fire: "#c45b36", Water: "#3e78b2", Grass: "#4e8f45",
  Electric: "#b48b21", Ice: "#4b9ca5", Fighting: "#a54839", Poison: "#854796",
  Ground: "#a77b42", Flying: "#6a79b7", Psychic: "#c14d75", Bug: "#7d9234",
  Rock: "#8d7a47", Ghost: "#5c5386", Dragon: "#5d5caf", Dark: "#5b514c",
  Steel: "#6e7f88", Fairy: "#b86593"
};

const TYPE_EFFECT = {
  Normal: [["Ghost"], ["Rock", "Steel"], []],
  Fire: [[], ["Dragon", "Fire", "Rock", "Water"], ["Bug", "Grass", "Ice", "Steel"]],
  Water: [[], ["Dragon", "Grass", "Water"], ["Fire", "Ground", "Rock"]],
  Grass: [[], ["Bug", "Dragon", "Fire", "Flying", "Grass", "Poison", "Steel"], ["Ground", "Rock", "Water"]],
  Electric: [["Ground"], ["Dragon", "Electric", "Grass"], ["Flying", "Water"]],
  Ice: [[], ["Fire", "Ice", "Steel", "Water"], ["Dragon", "Flying", "Grass", "Ground"]],
  Fighting: [["Ghost"], ["Bug", "Fairy", "Flying", "Poison", "Psychic"], ["Dark", "Ice", "Normal", "Rock", "Steel"]],
  Poison: [["Steel"], ["Ghost", "Ground", "Poison", "Rock"], ["Fairy", "Grass"]],
  Ground: [["Flying"], ["Bug", "Grass"], ["Electric", "Fire", "Poison", "Rock", "Steel"]],
  Flying: [[], ["Electric", "Rock", "Steel"], ["Bug", "Fighting", "Grass"]],
  Psychic: [["Dark"], ["Psychic", "Steel"], ["Fighting", "Poison"]],
  Bug: [[], ["Fairy", "Fighting", "Fire", "Flying", "Ghost", "Poison", "Steel"], ["Dark", "Grass", "Psychic"]],
  Rock: [[], ["Fighting", "Ground", "Steel"], ["Bug", "Fire", "Flying", "Ice"]],
  Ghost: [["Normal"], ["Dark"], ["Ghost", "Psychic"]],
  Dragon: [["Fairy"], ["Steel"], ["Dragon"]],
  Dark: [[], ["Dark", "Fairy", "Fighting"], ["Ghost", "Psychic"]],
  Steel: [[], ["Electric", "Fire", "Steel", "Water"], ["Fairy", "Ice", "Rock"]],
  Fairy: [[], ["Fire", "Poison", "Steel"], ["Dark", "Dragon", "Fighting"]]
};

const CPM = [
  0, 0.094, 0.16639787, 0.21573247, 0.25572005, 0.29024988, 0.3210876,
  0.34921268, 0.3752356, 0.39956728, 0.4225, 0.44310755, 0.4627984,
  0.48168495, 0.49985844, 0.51739395, 0.5343543, 0.5507927, 0.5667545,
  0.5822789, 0.5974, 0.6121573, 0.6265671, 0.64065295, 0.65443563,
  0.667934, 0.6811649, 0.69414365, 0.7068842, 0.7193991, 0.7317,
  0.7377695, 0.74378943, 0.74976104, 0.7556855, 0.76156384, 0.76739717,
  0.7731865, 0.77893275, 0.784637, 0.7903, 0.7953, 0.8003, 0.8053,
  0.8103, 0.8153, 0.8203, 0.8253, 0.8303, 0.8353, 0.8403, 0.8453,
  0.8503, 0.8553, 0.8603, 0.8653
];

const APP_CONFIG = typeof window !== "undefined" && window.POKEMON_RAID_ROSTER_CONFIG
  ? window.POKEMON_RAID_ROSTER_CONFIG
  : {};

const DATA_BASES = Array.isArray(APP_CONFIG.dataBases) && APP_CONFIG.dataBases.length
  ? APP_CONFIG.dataBases
  : [
      "https://raw.githubusercontent.com/mgrann03/pokemon-resources/main/",
      "https://pokemon-resources.mgrann03.workers.dev/"
    ];

const SPRITE_BASE_URL = String(APP_CONFIG.spriteBaseUrl || "https://www.serebii.net/pokemongo/pokemon/").replace(/\/?$/, "/");

const SEREBII_FORM_SUFFIXES = {
  alola: "a",
  alolan: "a",
  galar: "g",
  galarian: "g",
  hisui: "h",
  hisuian: "h",
  crownedsword: "c",
  crownedshield: "c",
  origin: "o",
  therian: "t",
  sky: "s",
  black: "b",
  white: "w",
  dawnwings: "dw",
  duskmane: "dm",
  ultra: "u"
};

const PENDING_CSV_KEY = "pokemonRaidRosterPendingCsv";
const CURRENT_CSV_KEY = "pokemonRaidRosterCurrentCsv";
const PREVIOUS_CSV_KEY = "pokemonRaidRosterPreviousCsv";
const SUPPRESS_SAMPLE_KEY = "pokemonRaidRosterSuppressSample";

const FIELDLESS_MEGA_BOOSTS = new Map([
  ["383:Mega", ["Fire", "Grass", "Ground"]],
  ["382:Mega", ["Water", "Electric", "Bug"]],
  ["384:Mega", ["Flying", "Psychic", "Dragon"]]
]);

const MEGA_ADDITIONAL_CHARGED_MOVES = new Map([
  ["150:Mega", ["Dynamic Punch+"]],
  ["150:MegaY", ["Future Sight+"]],
  ["652:Mega", ["Seed Bomb+"]],
  ["655:Mega", ["Mystical Fire+"]],
  ["658:Mega", ["Surf+"]],
  ["26:Mega", ["Volt Tackle+"]],
  ["26:MegaY", ["Zap Cannon+"]],
  ["227:Mega", ["Drill Peck+"]],
  ["870:Mega", ["Brick Break+"]],
  ["121:Mega", ["Liquidation+"]],
  ["71:Mega", ["Acid Spray+"]],
  ["687:Mega", ["Psybeam+"]],
  ["149:Mega", ["Outrage+"]]
]);

const SHADOW_ATTACK_MULTIPLIER = Math.fround(1.2);
const SHADOW_DAMAGE_TAKEN_MULTIPLIER = Math.fround(1.2);

const SAMPLE_CSV = `account,name,form,level,atk_iv,def_iv,hp_iv,shadow,purified,fast_move,charged_move,charged_move_2,cp,can_mega,notes
Main,Groudon,Normal,40,15,14,15,false,false,Mud Shot,Precipice Blades,Fire Punch,,true,Ground anchor
Main,Mamoswine,Normal,35,15,12,14,true,false,Powder Snow,Avalanche,,,false,Shadow ice
Main,Lucario,Normal,36.5,14,15,13,false,false,Force Palm,Aura Sphere,,,false,Fighting
Main,Metagross,Normal,,15,15,14,true,false,Bullet Punch,Meteor Mash,,3840,false,Level inferred from CP
Alt,Garchomp,Normal,36,15,13,12,false,false,Mud Shot,Earth Power,,,false,Ground
Alt,Excadrill,Normal,33,14,14,13,false,false,Mud-Slap,Scorching Sands,,,false,Ground
Alt,Terrakion,Normal,30,15,13,13,false,false,Double Kick,Sacred Sword,,,false,Fighting
Alt,Mamoswine,Normal,31,14,12,12,false,false,Mud-Slap,High Horsepower,,,false,Ground coverage`;

const GRASS_SAMPLE_CSV = `account,name,form,level,atk_iv,def_iv,hp_iv,shadow,purified,fast_move,charged_move,charged_move_2,cp,can_mega,notes
Main,Groudon,Normal,41,15,14,15,false,false,Mud Shot,Precipice Blades,Fire Punch,,true,Primal Groudon should win Grass slot 0 by background boost
Main,Kartana,Normal,35,15,13,14,false,false,Razor Leaf,Leaf Blade,,,false,Fast Grass damage
Main,Sceptile,Normal,37,14,14,13,false,false,Bullet Seed,Frenzy Plant,,,true,Mega Sceptile option
Main,Venusaur,Normal,40,14,15,15,false,false,Vine Whip,Frenzy Plant,,,true,Mega Venusaur option
Main,Roserade,Normal,34.5,15,12,13,false,false,Magical Leaf,Grass Knot,,,false,Strong non-legendary Grass
Main,Zarude,Normal,33,13,15,14,false,false,Vine Whip,Power Whip,,,false,Mythical Grass attacker
Main,Tangrowth,Normal,32.5,14,13,15,false,false,Vine Whip,Power Whip,,,false,Bulky Grass
Main,Chesnaught,Normal,30,13,13,13,false,false,Vine Whip,Frenzy Plant,,,false,Upgrade watch candidate
Main,Victreebel,Normal,29,15,10,12,true,false,Razor Leaf,Leaf Blade,,,false,Shadow Grass spice
Main,Meowscarada,Normal,28,15,13,12,false,false,Leafage,Play Rough,Night Slash,,false,Needs a Grass charged move plus levels
Alt,Sceptile,Normal,40.5,15,14,14,false,false,Bullet Seed,Frenzy Plant,,,true,Mega Sceptile should be slot 0 here
Alt,Venusaur,Normal,38,15,13,15,false,false,Vine Whip,Frenzy Plant,,,true,Mega Venusaur backup
Alt,Kartana,Normal,31,14,12,13,false,false,Razor Leaf,Leaf Blade,,,false,Lower-level Kartana
Alt,Tapu Bulu,Normal,33,14,15,12,false,false,Bullet Seed,Grass Knot,,,false,Grass Fairy coverage
Alt,Meowscarada,Normal,32,15,13,12,false,false,Leafage,Flower Trick,Play Rough,,false,Newer Grass attacker
Alt,Rillaboom,Normal,30,15,12,13,false,false,Razor Leaf,Frenzy Plant,,,false,Power-up candidate
Alt,Torterra,Normal,34,13,15,14,true,false,Razor Leaf,Frenzy Plant,,,false,Shadow Grass Ground
Alt,Decidueye,Normal,31,14,13,14,false,false,Magical Leaf,Frenzy Plant,,,false,Community Day move
Alt,Exeggutor,Alola,29.5,14,12,15,false,false,Bullet Seed,Solar Beam,,,false,Dragon Grass bench option`;

const state = {
  pokemon: [],
  fastMoves: [],
  chargedMoves: [],
  moveByName: new Map(),
  pokemonNameIndex: new Map(),
  currentRosterEntries: [],
  currentUsableByUid: new Map(),
  expandedTypeKey: "",
  expandedRosterUid: null,
  currentTypeTeams: [],
  currentSettings: null,
  pendingMessage: null,
  quickEditRowNumber: null,
  quickEditSource: "",
  previewingSample: false,
  rosterSearch: "",
  expandedUpgradeTypes: new Set(),
  ready: false
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  setupControls();
  setRosterText(getInitialRosterCSV());
  loadData();
});

function bindElements() {
  for (const id of [
    "data-status", "metric-select", "party-size", "team-size", "relobby-time",
    "allow-elite", "upgrade-level", "use-current-moves", "csv-file",
    "sample-button", "grass-sample-button", "clear-button", "calculate-button",
    "roster-input", "summary-rows", "summary-matched", "summary-six",
    "messages", "type-results-body", "type-context", "upgrade-results-body",
    "upgrade-context", "roster-search", "roster-box", "roster-box-context",
    "quick-edit-modal", "quick-edit-sprite", "quick-edit-title", "quick-edit-meta",
    "quick-edit-form", "quick-edit-level", "quick-edit-cp", "quick-edit-full-link"
  ]) {
    el[toCamel(id)] = document.getElementById(id);
  }
}

function setupControls() {
  el.csvFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setRosterText(await file.text());
    rememberRosterText(el.rosterInput.value, true);
    calculate();
  });

  el.sampleButton.addEventListener("click", () => {
    previewSampleRoster(SAMPLE_CSV);
  });
  el.grassSampleButton.addEventListener("click", () => {
    previewSampleRoster(GRASS_SAMPLE_CSV);
  });
  el.clearButton.addEventListener("click", () => {
    if (!confirmClearRoster()) return;
    setRosterText("");
    rememberClearedRoster();
    calculate();
  });
  el.calculateButton.addEventListener("click", calculate);
  el.rosterInput.addEventListener("input", () => {
    rememberRosterText(el.rosterInput.value, state.previewingSample);
    state.previewingSample = false;
  });
  el.typeResultsBody.addEventListener("click", handlePokemonCardClick);
  el.typeResultsBody.addEventListener("click", handleTypeRowClick);
  el.typeResultsBody.addEventListener("keydown", handleTypeRowKeydown);
  el.upgradeResultsBody.addEventListener("click", handleUpgradeGroupClick);
  el.upgradeResultsBody.addEventListener("keydown", handleUpgradeGroupKeydown);
  el.rosterBox.addEventListener("click", handleRosterBoxClick);
  el.rosterBox.addEventListener("input", handleRosterEditInput);
  el.rosterSearch.addEventListener("input", () => {
    state.rosterSearch = el.rosterSearch.value.trim();
    renderRosterBox(state.currentRosterEntries, state.currentUsableByUid, state.currentSettings || readSettings());
  });
  el.quickEditLevel.addEventListener("input", () => syncQuickEditLevelCP("level"));
  el.quickEditCp.addEventListener("input", () => syncQuickEditLevelCP("cp"));
  el.quickEditForm.addEventListener("submit", event => {
    event.preventDefault();
    saveQuickEdit();
  });
  el.quickEditModal.addEventListener("click", handleQuickEditModalClick);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !el.quickEditModal.hidden) closeQuickEdit();
  });

  for (const input of [
    el.metricSelect, el.partySize, el.teamSize, el.relobbyTime,
    el.upgradeLevel, el.allowElite, el.useCurrentMoves
  ]) {
    input.addEventListener("change", calculate);
  }
}

async function loadData() {
  setStatus("Loading DialgaDex data...");
  try {
    const [pokemon, fastMoves, chargedMoves] = await Promise.all([
      fetchResource("pogo_pkm.min.json"),
      fetchResource("pogo_fm.json"),
      fetchResource("pogo_cm.json")
    ]);

    state.pokemon = pokemon.filter(p => p.released !== false && p.fm && p.cm);
    state.fastMoves = fastMoves.map(move => move.name === "Hidden Power" ? {...move, type: "None"} : move);
    state.chargedMoves = chargedMoves;
    state.moveByName = new Map([...state.fastMoves, ...state.chargedMoves].map(m => [cleanName(m.name), m]));
    state.pokemonNameIndex = buildPokemonNameIndex(state.pokemon);
    state.ready = true;
    setStatus(`Ready: ${state.pokemon.length.toLocaleString()} species/forms loaded`, "ready");
    calculate();
  } catch (error) {
    setStatus("Could not load remote data", "error");
    addMessages([{type: "error", text: `Data load failed: ${error.message}`}]);
  }
}

async function fetchResource(path) {
  let lastError;
  for (const base of DATA_BASES) {
    try {
      const response = await fetch(base + path, {cache: "no-store"});
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`Unable to load ${path}`);
}

function buildPokemonNameIndex(pokemon) {
  const index = new Map();
  for (const p of pokemon) {
    const keys = [
      p.name,
      `${p.name} ${p.form}`,
      `${p.form} ${p.name}`,
      displayPokemonName(p, false)
    ];
    for (const key of keys) {
      const cleaned = cleanName(key);
      if (!index.has(cleaned)) index.set(cleaned, []);
      index.get(cleaned).push(p);
    }
  }
  return index;
}

function setRosterText(value) {
  el.rosterInput.value = value.trim();
}

function previewSampleRoster(csv) {
  setRosterText(csv);
  state.previewingSample = true;
  calculate();
  addMessages([{type: "warning", text: "Sample preview loaded. Your saved roster was not replaced; reload this page to return to saved data."}]);
}

function getInitialRosterCSV() {
  const pendingCSV = consumePendingRosterCSV();
  if (pendingCSV !== null) {
    clearSampleSuppression();
    rememberRosterText(pendingCSV, true);
    return pendingCSV;
  }

  const currentCSV = getSavedRosterText();
  if (currentCSV !== null) return currentCSV;

  return "";
}

function consumePendingRosterCSV() {
  if (typeof localStorage === "undefined") return null;
  try {
    const csv = localStorage.getItem(PENDING_CSV_KEY);
    if (csv !== null) localStorage.removeItem(PENDING_CSV_KEY);
    return csv;
  } catch (error) {
    return null;
  }
}

function getSavedRosterText() {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(CURRENT_CSV_KEY);
  } catch (error) {
    return null;
  }
}

function rememberRosterText(value = el.rosterInput.value, keepBackup = false) {
  if (typeof localStorage === "undefined") return;
  try {
    const text = value.trim();
    if (keepBackup) backupSavedRosterText(text);
    localStorage.setItem(CURRENT_CSV_KEY, text);
  } catch (error) {
    // Local storage is a convenience only; calculation can still run.
  }
}

function rememberClearedRoster() {
  if (typeof localStorage === "undefined") return;
  try {
    backupSavedRosterText("");
    localStorage.setItem(CURRENT_CSV_KEY, "");
    localStorage.setItem(SUPPRESS_SAMPLE_KEY, "true");
    localStorage.removeItem(PENDING_CSV_KEY);
  } catch (error) {
    // Clearing the visible roster is still the source of truth for this session.
  }
}

function backupSavedRosterText(nextValue) {
  if (typeof localStorage === "undefined") return;
  try {
    const current = localStorage.getItem(CURRENT_CSV_KEY);
    if (current !== null && current.trim() && current !== nextValue.trim()) {
      localStorage.setItem(PREVIOUS_CSV_KEY, current);
    }
  } catch (error) {
    // Backups are a safety net only; the requested save should still continue.
  }
}

function confirmClearRoster() {
  if (!el.rosterInput.value.trim()) return true;
  return window.prompt("Type CLEAR to erase the roster CSV saved in this browser.") === "CLEAR";
}

function clearSampleSuppression() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(SUPPRESS_SAMPLE_KEY);
  } catch (error) {
    // Ignore storage failures; the selected CSV is already loaded.
  }
}

function isSampleSuppressed() {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(SUPPRESS_SAMPLE_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function calculate() {
  if (!state.ready) return;

  const rows = parseRoster(el.rosterInput.value);
  const settings = readSettings();
  const messages = [...rows.messages];
  if (state.pendingMessage) {
    messages.unshift(state.pendingMessage);
    state.pendingMessage = null;
  }
  const usableEntries = [];

  for (const entry of rows.entries) {
    const resolved = resolveRosterEntry(entry);
    if (!resolved.pokemon) {
      messages.push({type: "warning", text: `${formatRosterReference(entry)}: could not match "${entry.rawName || "blank name"}".`});
      continue;
    }

    const levelResult = resolveLevel(resolved.pokemon, entry);
    if (!levelResult.level) {
      messages.push({type: "warning", text: `${formatRosterReference(entry)}: ${entry.rawName} needs a level or a CP that matches the IVs.`});
      continue;
    }

    const baseEntry = {
      ...entry,
      uid: entry.rowNumber,
      pokemon: resolved.pokemon,
      shadow: resolved.shadow,
      level: levelResult.level,
      levelNote: levelResult.note
    };
    usableEntries.push(baseEntry);
  }

  const typeTeams = buildTypeTeams(usableEntries, settings);
  const upgradeCandidates = buildTypeUpgradeCandidates(typeTeams);
  state.currentRosterEntries = rows.entries;
  state.currentUsableByUid = new Map(usableEntries.map(entry => [entry.uid, entry]));

  renderResults(typeTeams, upgradeCandidates, rows.entries.length, usableEntries.length, messages, settings);
}

function readSettings() {
  return {
    metric: el.metricSelect.value,
    partySize: Number(el.partySize.value),
    teamSize: Number(el.teamSize.value),
    relobbyTime: Number(el.relobbyTime.value || 10),
    upgradeLevel: clamp(toNumber(el.upgradeLevel.value, 40), 1, 51),
    allowElite: el.allowElite.checked,
    useCurrentMoves: el.useCurrentMoves.checked,
    requireEffective: true
  };
}

function parseRoster(text) {
  const messages = [];
  if (!text.trim()) return {entries: [], messages};

  const table = parseCSV(text);
  if (table.length < 2) return {entries: [], messages: [{type: "warning", text: "Paste a CSV header row plus at least one Pokemon row."}]};

  const headers = table[0].map(normalizeHeader);
  const entries = [];
  for (let i = 1; i < table.length; i++) {
    const row = table[i];
    if (row.every(cell => !cell.trim())) continue;
    const obj = {rowNumber: i + 1};
    headers.forEach((header, idx) => {
      obj[header] = (row[idx] || "").trim();
    });
    const entry = normalizeRosterEntry(obj);
    entry.rosterNumber = entries.length + 1;
    entries.push(entry);
  }
  return {entries, messages};
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i++;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  rows.push(row);
  return rows;
}

function normalizeHeader(header) {
  const key = cleanName(header);
  const aliases = {
    acct: "account", trainer: "account", trainername: "account", profile: "account",
    pokemon: "name", species: "name", mon: "name", nickname: "name",
    dex: "id", dexnumber: "id", number: "id",
    lvl: "level", pokemonlevel: "level",
    attackiv: "atk_iv", atkiv: "atk_iv", atk: "atk_iv", attack: "atk_iv",
    defenseiv: "def_iv", defiv: "def_iv", def: "def_iv", defense: "def_iv",
    staminaiv: "hp_iv", staiv: "hp_iv", sta: "hp_iv", hpiv: "hp_iv", hp: "hp_iv",
    purified: "purified", purify: "purified", ispurified: "purified",
    canmega: "can_mega", canmegaevolve: "can_mega", megaeligible: "can_mega",
    megaevolve: "can_mega", megaevolution: "can_mega", canprimal: "can_mega",
    canprimalreversion: "can_mega", primalreversion: "can_mega",
    megaforms: "mega_forms", megaform: "mega_forms", megachoices: "mega_forms",
    megaoption: "mega_forms", megaoptions: "mega_forms",
    megaevolutions: "mega_forms", primalforms: "mega_forms",
    fast: "fast_move", fastmove: "fast_move", quickmove: "fast_move", quick: "fast_move",
    charged: "charged_move", chargemove: "charged_move", chargedmove: "charged_move", charge: "charged_move", special: "charged_move",
    charged2: "charged_move_2", chargemove2: "charged_move_2", chargedmove2: "charged_move_2",
    charge2: "charged_move_2", special2: "charged_move_2", secondcharged: "charged_move_2",
    secondchargedmove: "charged_move_2", chargedmoveii: "charged_move_2"
  };
  return aliases[key] || key;
}

function normalizeRosterEntry(obj) {
  const rawName = obj.name || obj.pokemon || "";
  return {
    rowNumber: obj.rowNumber,
    account: obj.account || "Account 1",
    id: toNumber(obj.id),
    rawName,
    form: obj.form || "",
    level: toNumber(obj.level),
    cp: toNumber(obj.cp),
    ivs: {
      atk: clamp(toNumber(obj.atk_iv, 15), 0, 15),
      def: clamp(toNumber(obj.def_iv, 15), 0, 15),
      hp: clamp(toNumber(obj.hp_iv, 15), 0, 15)
    },
    shadow: parseBoolean(obj.shadow) || cleanName(rawName).startsWith("shadow"),
    purified: parseBoolean(obj.purified) || [obj.charged_move, obj.charged_move_2].some(move => cleanName(move) === "return"),
    canMega: parseBoolean(obj.can_mega),
    megaForms: parseMegaFormTokens(obj.mega_forms),
    fastMove: obj.fast_move || "",
    chargedMove: obj.charged_move || "",
    chargedMove2: obj.charged_move_2 || "",
    notes: obj.notes || ""
  };
}

function resolveRosterEntry(entry) {
  let name = entry.rawName || "";
  let shadow = entry.shadow;
  if (cleanName(name).startsWith("shadow")) {
    name = name.replace(/^\s*shadow\s+/i, "");
    shadow = true;
  }

  let candidates = [];
  if (entry.id) {
    candidates = state.pokemon.filter(p => p.id === entry.id);
  } else {
    candidates = state.pokemonNameIndex.get(cleanName(name)) || [];
  }

  if (entry.form && candidates.length) {
    const formKey = cleanName(entry.form);
    const formMatch = candidates.find(p => cleanName(p.form || "Normal") === formKey);
    if (formMatch) candidates = [formMatch];
  }

  const pokemon = candidates.find(p => p.form === "Normal") || candidates[0] || null;
  return {pokemon, shadow};
}

function resolveLevel(pokemon, entry) {
  if (entry.level) return {level: entry.level, note: ""};
  if (!entry.cp) return {level: null, note: ""};

  const best = findClosestLevelByCP(pokemon, entry.ivs, entry.cp);
  if (!best) return {level: null, note: ""};
  const note = best.delta === 0 ? `level inferred from CP ${entry.cp}` : `closest level by CP ${entry.cp} is ${best.level} (${best.cp} CP)`;
  return {level: best.level, note};
}

function findClosestLevelByCP(pokemon, ivs, targetCp) {
  const cp = toNumber(targetCp);
  if (!pokemon || !cp) return null;
  let best = null;
  for (let level = 1; level <= 51; level += 0.5) {
    const calculatedCp = getPokemonCP(getPokemonStats(pokemon, level, ivs, false));
    const delta = Math.abs(calculatedCp - cp);
    if (!best || delta < best.delta) best = {level, cp: calculatedCp, delta};
    if (delta === 0) break;
  }
  return best;
}

function getBattleStats(pokemon, entry) {
  const stats = getPokemonStats(pokemon, entry.level, entry.ivs, true);
  return {
    atk: entry.shadow ? stats.atk * SHADOW_ATTACK_MULTIPLIER : stats.atk,
    def: entry.shadow ? stats.def / SHADOW_DAMAGE_TAKEN_MULTIPLIER : stats.def,
    hp: Math.floor(stats.hp)
  };
}

function rankPokemon(pokemon, entry, enemy, settings) {
  const {atk, def, hp} = getBattleStats(pokemon, entry);
  const moveOptions = getPokemonMoveOptions(pokemon, entry.shadow, settings.allowElite, entry.purified);
  const fms = constrainMoves(moveOptions.fast, entry.fastMove, settings.useCurrentMoves);
  const cms = constrainMoves(moveOptions.charged, getEntryChargedMoveNames(entry), settings.useCurrentMoves, getMegaAdditionalChargedMoves(pokemon));
  if (!fms.length || !cms.length) return null;

  let best = null;
  for (const fm of fms) {
    for (const cm of cms) {
      if (settings.requiredAttackType && fm.type !== settings.requiredAttackType && cm.type !== settings.requiredAttackType) {
        continue;
      }

      const fmMult = enemy.weakness.get(fm.type) || 1;
      const cmMult = enemy.weakness.get(cm.type) || 1;
      if (settings.requireEffective && Math.max(fmMult, cmMult) <= 1.0001) continue;

      const ratings = enemy.enemyYs.map(enemyY => {
        const incoming = avgYAgainst(enemyY, pokemon.types);
        const dps = getDPS(pokemon.types, atk, def, hp, fm, cm, fmMult, cmMult, enemy.stats.def, incoming, settings);
        const tdo = getTDO(dps, hp, def, incoming);
        const edps = getEDPS(dps, tdo, pokemon, enemy, settings);
        return {dps, tdo, edps};
      });

      const avg = averageRatings(ratings);
      const metric = settings.metric === "DPS" ? avg.dps : settings.metric === "TDO" ? avg.tdo : avg.edps;
      if (!best || metric > best.metric) {
        best = {
          pokemon,
          shadow: entry.shadow,
          level: entry.level,
          ivs: entry.ivs,
          cp: getPokemonCP(getPokemonStats(pokemon, entry.level, entry.ivs, false)),
          fastMove: fm,
          chargedMove: cm,
          enteredFastMove: entry.fastMove,
          enteredChargedMoves: getEntryChargedMoveNames(entry),
          dps: avg.dps,
          tdo: avg.tdo,
          edps: avg.edps,
          metric,
          fmMult,
          cmMult,
          notes: [entry.notes, entry.levelNote].filter(Boolean).join("; ")
        };
      }
    }
  }
  return best;
}

function getPokemonMoveOptions(pokemon, isShadow, allowElite, includeReturn = false) {
  const fastNames = [...(pokemon.fm || [])];
  const chargedNames = [...(pokemon.cm || []), ...getMegaAdditionalChargedMoves(pokemon)];

  if (allowElite) {
    fastNames.push(...(pokemon.elite_fm || []));
    chargedNames.push(...(pokemon.elite_cm || []));
    if (!isShadow && includeReturn && pokemon.shadow) chargedNames.push("Return");
    if (pokemon.form === "S" && pokemon.id === 249) chargedNames.push(isShadow ? "Aeroblast Plus" : "Aeroblast Plus Plus");
    if (pokemon.form === "S" && pokemon.id === 250) chargedNames.push(isShadow ? "Sacred Fire Plus" : "Sacred Fire Plus Plus");
    if (Array.isArray(pokemon.fm_add)) fastNames.push(...pokemon.fm_add);
    if (Array.isArray(pokemon.cm_add)) chargedNames.push(...pokemon.cm_add);
  }

  let fast = unique(fastNames).flatMap(name => expandHiddenPower(name)).map(findMove).filter(Boolean);
  let charged = unique(chargedNames).map(findMove).filter(Boolean);
  if (Array.isArray(pokemon.fm_rem)) fast = fast.filter(m => !pokemon.fm_rem.includes(m.name));
  if (Array.isArray(pokemon.cm_rem)) charged = charged.filter(m => !pokemon.cm_rem.includes(m.name));
  return {fast, charged};
}

function constrainMoves(options, enteredMove, useEntered, alwaysInclude = []) {
  const enteredMoves = Array.isArray(enteredMove) ? enteredMove : [enteredMove];
  const enteredNames = enteredMoves.map(move => String(move || "").trim()).filter(Boolean);
  if (!useEntered || !enteredNames.length) return options;

  const legalMoves = [];
  const seen = new Set();
  const addLegalMove = move => {
    if (!move) return;
    const key = cleanName(move.name);
    if (seen.has(key)) return;
    if (options.some(option => cleanName(option.name) === key)) {
      seen.add(key);
      legalMoves.push(move);
    }
  };
  for (const name of enteredNames) {
    if (cleanName(name) === "hiddenpower") {
      for (const option of options.filter(move => isHiddenPowerMove(move.name))) {
        addLegalMove(option);
      }
      continue;
    }
    addLegalMove(findMove(name));
  }
  for (const name of alwaysInclude) {
    addLegalMove(findMove(name));
  }
  return legalMoves;
}

function expandHiddenPower(name) {
  if (name !== "Hidden Power") return [name];
  return HIDDEN_POWER_TYPES.map(t => `Hidden Power ${t}`);
}

function findMove(name) {
  return state.moveByName.get(cleanName(name));
}

function getMoveNames(pokemon, key) {
  return [...(pokemon[key] || []), ...(key === "fm" ? pokemon.elite_fm || [] : pokemon.elite_cm || [])];
}

function getPokemonStats(pokemon, level, ivs, floorHp) {
  const cpm = getCPM(level);
  const base = pokemon.stats;
  return {
    atk: (base.baseAttack + ivs.atk) * cpm,
    def: (base.baseDefense + ivs.def) * cpm,
    hp: floorHp ? Math.floor((base.baseStamina + ivs.hp) * cpm) : (base.baseStamina + ivs.hp) * cpm
  };
}

function getRaidStats(pokemon) {
  let tier = pokemon.raid_tier;
  if (!tier) tier = pokemon.class ? 5 : 3;
  const cpm = [null, 0.6, 0.67, 0.73, 0.79, 0.79, 0.79, 1.0, 0.79, 0.79][tier] || 0.79;
  return {
    atk: (pokemon.stats.baseAttack + 15) * Math.fround(cpm),
    def: (pokemon.stats.baseDefense + 15) * Math.fround(cpm),
    hp: [null, 600, null, 3600, 9000, 15000, 22500, 20000, 25000, 25000][tier] || 15000
  };
}

function getPokemonCP(stats) {
  return Math.max(10, Math.floor(stats.atk * Math.sqrt(stats.def) * Math.sqrt(stats.hp) / 10));
}

function getCPM(level) {
  if (Number.isInteger(level)) return Math.fround(CPM[level] || 0);
  const lo = Math.floor(level);
  const hi = Math.ceil(level);
  return Math.sqrt((getCPM(lo) ** 2 + getCPM(hi) ** 2) / 2);
}

function effectiveness(attackType, defenderTypes) {
  const table = TYPE_EFFECT[attackType];
  if (!table) return 1;
  let mult = 1;
  for (const defenderType of defenderTypes) {
    if (table[0].includes(defenderType)) mult *= 0.390625;
    else if (table[1].includes(defenderType)) mult *= 0.625;
    else if (table[2].includes(defenderType)) mult *= Math.fround(1.6);
  }
  return mult;
}

function getMovesetYs(types, atk, fms, cms) {
  const all = [];
  for (const fmName of fms) {
    const fm = findMove(fmName);
    if (!fm) continue;
    for (const cmName of cms) {
      const cm = findMove(cmName);
      if (!cm) continue;
      all.push(getSpecificY(types, atk, fm, cm));
    }
  }
  return all;
}

function getSpecificY(types, atk, fm, cm, incomingDps = 50) {
  const chargedMoveChance = 0.3;
  const energyPerHp = 0.5;
  const fmDelay = 1.75;
  const cmDelay = 0.5;
  const fmStab = types.includes(fm.type) && fm.name !== "Hidden Power" ? Math.fround(1.2) : 1;
  const cmStab = types.includes(cm.type) ? Math.fround(1.2) : 1;
  const fmNum = 0.5 * processPower(fm) * fmStab * atk;
  const cmNum = 0.5 * processPower(cm) * cmStab * atk;
  let fmDur = processDuration(fm.duration) + fmDelay;
  let cmDur = processDuration(cm.duration) + cmDelay;
  const epsForDamage = energyPerHp * incomingDps;
  let fmsPerCm = (-cm.energy_delta - epsForDamage * cmDur) / (fm.energy_delta + epsForDamage * fmDur);
  if (fmsPerCm < 0) fmsPerCm = 0;
  fmsPerCm = fmsPerCm + (1 / chargedMoveChance) - 1;
  const cycleDur = fmsPerCm * fmDur + cmDur;
  const y = {Any: {y_num: (fmsPerCm * fmNum + cmNum) / cycleDur, cm_num: cmNum}};
  if (fm.type === cm.type) {
    y[fm.type] = y.Any;
  } else {
    y[fm.type] = {y_num: (fmsPerCm * fmNum) / cycleDur, cm_num: 0};
    y[cm.type] = {y_num: cmNum / cycleDur, cm_num: cmNum};
  }
  return y;
}

function avgYAgainst(enemyY, defenderTypes) {
  let yNum = 0;
  let cmNum = 0;
  for (const [type, y] of Object.entries(enemyY)) {
    if (type === "Any") continue;
    const mult = effectiveness(type, defenderTypes);
    yNum += y.y_num * mult;
    cmNum += y.cm_num * mult;
  }
  return {y_num: yNum || null, cm_num: cmNum || null};
}

function getDPS(types, atk, def, hp, fm, cm, fmMult, cmMult, enemyDef, enemyY, settings) {
  const estimatedYNumerator = 1340;
  const estimatedCmPower = 11670;
  const safeEnemyDef = enemyDef || 180;
  const y = (enemyY?.y_num || estimatedYNumerator) / def;
  const inCmDmg = (enemyY?.cm_num || estimatedCmPower) / def;
  const tof = hp / y;
  let x = 0.5 * -cm.energy_delta + 0.5 * fm.energy_delta + 0.5 * inCmDmg;

  const fmDmgMult = fmMult * (types.includes(fm.type) && fm.name !== "Hidden Power" ? Math.fround(1.2) : 1);
  const fmDmg = calcDamage(atk, safeEnemyDef, processPower(fm), fmDmgMult);
  const fmDps = fmDmg / processDuration(fm.duration);
  const fmEps = fm.energy_delta / processDuration(fm.duration);

  const fToCRatio = (tof * -cm.energy_delta + processDuration(cm.duration) * (x - 0.5 * hp)) /
    (tof * fm.energy_delta - processDuration(fm.duration) * (x - 0.5 * hp));
  const partyBoost = getPartyBoost(fToCRatio, settings.partySize);

  const cmDmgMult = cmMult * (types.includes(cm.type) ? Math.fround(1.2) : 1);
  const cmDmg = calcDamage(atk, safeEnemyDef, processPower(cm), cmDmgMult);
  const cmDps = cmDmg / processDuration(cm.duration);
  const cmDpsAdj = cmDps * (1 + partyBoost);
  let cmEps = -cm.energy_delta / processDuration(cm.duration);
  if (cm.energy_delta === -100) {
    cmEps = (-cm.energy_delta + 0.5 * fm.energy_delta) / processDuration(cm.duration);
  }
  if (fmDps > cmDps) return fmDps;
  const dps0 = (fmDps * cmEps + cmDpsAdj * fmEps) / (cmEps + fmEps);
  const dps = dps0 + ((cmDpsAdj - fmDps) / (cmEps + fmEps)) * (0.5 - x / hp) * y;
  return Math.max(fmDps, dps, 0);
}

function getTDO(dps, hp, def, enemyY) {
  const estimatedYNumerator = 1340;
  const y = (enemyY?.y_num || estimatedYNumerator) / def;
  return dps * (hp / y);
}

function getEDPS(dps, tdo, pokemon, enemy, settings) {
  const respawnTime = 1;
  const hp = enemy.stats?.hp || 1000000000;
  const teamSize = settings.teamSize || 6;
  const tof = tdo / dps;
  const lives = hp / tdo;
  const deaths = lives - 0.5;
  const relobbies = deaths / teamSize - 0.5;
  const ttw = lives * tof + (deaths - relobbies) * respawnTime + settings.relobbyTime * relobbies;
  return hp / ttw;
}

function processDuration(duration) {
  return Math.round((duration / 1000) * 2) / 2;
}

function processPower(move) {
  const newDuration = processDuration(move.duration);
  const modifier = (newDuration - move.duration / 1000) / newDuration;
  if (Math.abs(modifier) >= 0.199) return move.power * (1 + modifier);
  return move.power;
}

function calcDamage(atk, def, power, modifiers) {
  return 0.5 * power * (atk / def) * modifiers + 0.5;
}

function getPartyBoost(fToCRatio, partySize) {
  if (partySize === 1) return 0;
  const movesPerBoost = partySize === 2 ? 18 : partySize === 3 ? 9 : 6;
  return Math.max(0, Math.min(fToCRatio / movesPerBoost, 1));
}

function averageRatings(ratings) {
  return ratings.reduce((acc, r) => ({
    dps: acc.dps + r.dps / ratings.length,
    tdo: acc.tdo + r.tdo / ratings.length,
    edps: acc.edps + r.edps / ratings.length
  }), {dps: 0, tdo: 0, edps: 0});
}

function collectUpgradeCandidatesForEntry(entry, current, group, enemy, settings) {
  const candidates = [];
  const before = current || makeUnrankedBefore(entry);
  const beforeMetric = current?.metric || 0;
  const beforeInTargetTeam = Boolean(current && current.accountRank <= group.cutoffSlot);
  const scenarios = getUpgradeScenarios(entry, settings);

  for (const scenario of scenarios) {
    const after = rankScenario(entry, enemy, settings, scenario.level, scenario.useCurrentMoves);
    if (!after) continue;

    const movesChanged = didMovesChange(before, after);
    if (scenario.key === "best-now" && current && !movesChanged) continue;

    const gain = after.metric - beforeMetric;
    const gainPct = beforeMetric > 0 ? 100 * gain / beforeMetric : null;
    if (beforeMetric > 0 && gainPct < 0.5) continue;

    const crossesTopSix = !beforeInTargetTeam &&
      (group.results.length < group.cutoffSlot ? after.metric > 0 : after.metric >= group.cutoff);
    const materialBenchGain = current && !beforeInTargetTeam && gainPct >= 5;
    const materialTeamGain = beforeInTargetTeam && gainPct >= 2;
    if (!crossesTopSix && !materialBenchGain && !materialTeamGain) continue;

    const minLevel = scenario.allowsLevelSearch && crossesTopSix
      ? findMinimumLevelForScenario(entry, scenario, enemy, settings, group.cutoff || 0.0001)
      : scenario.level;
    const enough = scenario.allowsLevelSearch && crossesTopSix && minLevel < scenario.level - 0.001
      ? rankScenario(entry, enemy, settings, minLevel, scenario.useCurrentMoves)
      : after;

    candidates.push({
      account: entry.account,
      entryUid: entry.uid,
      before,
      after: {
        ...after,
        account: entry.account,
        relative: group.best > 0 ? 100 * after.metric / group.best : 0
      },
      enough: enough
        ? {
          ...enough,
          account: entry.account,
          relative: group.best > 0 ? 100 * enough.metric / group.best : 0
        }
        : null,
      scenario,
      minLevel,
      gain,
      gainPct,
      gainPctSort: gainPct ?? 999,
      crossesTopSix,
      beforeInTargetTeam,
      currentRank: current?.accountRank || null,
      cutoff: group.cutoff,
      cutoffSlot: group.cutoffSlot
    });
  }

  return candidates;
}

function getUpgradeScenarios(entry, settings) {
  const scenarios = [];
  const targetLevel = Math.max(entry.level, settings.upgradeLevel);
  const hasMoves = hasEnteredMoves(entry);

  if (hasMoves) {
    scenarios.push({
      key: "best-now",
      label: "Best moves now",
      level: entry.level,
      useCurrentMoves: false,
      allowsLevelSearch: false
    });
  }

  if (targetLevel > entry.level + 0.001) {
    if (hasMoves) {
      scenarios.push({
        key: "power-current",
        label: "Power current moves",
        level: targetLevel,
        useCurrentMoves: true,
        allowsLevelSearch: true
      });
    }
    scenarios.push({
      key: "power-best",
      label: hasMoves ? "Power + best moves" : "Power up",
      level: targetLevel,
      useCurrentMoves: false,
      allowsLevelSearch: true
    });
  }

  return scenarios;
}

function makeUnrankedBefore(entry) {
  return {
    pokemon: entry.pokemon,
    shadow: entry.shadow,
    level: entry.level,
    ivs: entry.ivs,
    cp: getPokemonCP(getPokemonStats(entry.pokemon, entry.level, entry.ivs, false)),
    metric: 0,
    fastMove: findMove(entry.fastMove) || {name: entry.fastMove || "no qualifying fast move", type: "None"},
    chargedMove: findMove(entry.chargedMove) || findMove(entry.chargedMove2) || {name: entry.chargedMove || entry.chargedMove2 || "no qualifying charged move", type: "None"},
    enteredFastMove: entry.fastMove,
    enteredChargedMoves: getEntryChargedMoveNames(entry),
    inTopSix: false,
    accountRank: null,
    notes: entry.notes
  };
}

function buildTypeTeams(usableEntries, settings) {
  const accounts = unique(usableEntries.map(entry => entry.account));
  const rows = [];

  for (const account of accounts) {
    const accountEntries = usableEntries.filter(entry => entry.account === account);
    for (const type of TEAM_TYPES) {
      const enemy = buildAttackTypeEnemy(type);
      const typedSettings = {
        ...settings,
        requiredAttackType: type
      };
      const results = accountEntries
        .map(entry => {
          const ranking = rankPokemon(entry.pokemon, entry, enemy, typedSettings);
          if (!ranking) return null;
          ranking.account = account;
          ranking.entry = entry;
          return ranking;
        })
        .filter(Boolean)
        .sort((a, b) => b.metric - a.metric);

      const slot0 = findMegaSlot(accountEntries, enemy, typedSettings, type);
      const cutoffSlot = slot0 ? 5 : 6;
      const best = results[0]?.metric || 0;
      const cutoff = results[cutoffSlot - 1]?.metric || 0;
      results.forEach((result, index) => {
        result.accountRank = index + 1;
        result.inTopSix = index < 6;
        result.inActiveRegularTeam = index < cutoffSlot;
        result.relative = best > 0 ? 100 * result.metric / best : 0;
      });

      const group = {
        account,
        results,
        best,
        cutoff,
        cutoffSlot,
        topSixTotal: results.slice(0, 6).reduce((sum, result) => sum + result.metric, 0)
      };
      const currentByEntry = new Map(results.map(result => [result.entry.uid, result]));
      const upgrade = accountEntries
        .flatMap(entry => collectUpgradeCandidatesForEntry(entry, currentByEntry.get(entry.uid) || null, group, enemy, typedSettings))
        .map(candidate => ({...candidate, type}))
        .sort((a, b) =>
          Number(b.crossesTopSix) - Number(a.crossesTopSix) ||
          b.after.metric - a.after.metric ||
          b.gainPctSort - a.gainPctSort
        );

      rows.push({
        account,
        type,
        enemy,
        topSix: results.slice(0, 6),
        slot0,
        cutoffSlot,
        topSixTotal: group.topSixTotal,
        upgrade: upgrade[0] || null,
        upgrades: upgrade
      });
    }
  }

  return rows;
}

function buildTypeUpgradeCandidates(typeTeams) {
  return typeTeams
    .flatMap(row => row.upgrades || [])
    .sort((a, b) =>
      a.account.localeCompare(b.account) ||
      TEAM_TYPES.indexOf(a.type) - TEAM_TYPES.indexOf(b.type) ||
      Number(b.crossesTopSix) - Number(a.crossesTopSix) ||
      b.after.metric - a.after.metric ||
      b.gainPctSort - a.gainPctSort
    );
}

function buildAttackTypeEnemy(type) {
  return {
    typeTeam: type,
    types: [],
    stats: {atk: null, def: 180, hp: 15000},
    weakness: new Map(TYPES.map(attackerType => [attackerType, attackerType === type ? Math.fround(1.6) : 1])),
    enemyYs: [{Any: {y_num: null, cm_num: null}}],
    label: `${type} attackers`
  };
}

function findMegaSlot(accountEntries, enemy, settings, attackType = null) {
  const candidates = [];
  for (const entry of accountEntries) {
    if (entry.shadow || !entry.canMega) continue;
    for (const mega of getEligibleMegaForms(entry)) {
      const priority = getMegaPriority(mega, enemy, attackType);
      let ranking = rankPokemon(mega, {
        ...entry,
        pokemon: mega,
        shadow: false
      }, enemy, settings);
      if (!ranking && priority > 0) {
        ranking = rankPokemon(mega, {
          ...entry,
          pokemon: mega,
          shadow: false
        }, enemy, {
          ...settings,
          requiredAttackType: null,
          requireEffective: false
        });
      }
      if (!ranking) continue;
      ranking.account = entry.account;
      ranking.entry = entry;
      ranking.megaPriority = priority;
      ranking.megaBoostTypes = getFieldlessBoostTypes(mega);
      candidates.push(ranking);
    }
  }

  candidates.sort((a, b) => b.megaPriority - a.megaPriority || b.metric - a.metric);
  return candidates[0] || null;
}

function getMegaForms(pokemon) {
  return state.pokemon.filter(candidate => candidate.id === pokemon.id && isMegaForm(candidate.form));
}

function getEligibleMegaForms(entry) {
  if (!entry?.canMega) return [];
  const forms = getMegaForms(entry.pokemon);
  if (!entry.megaForms?.length) return forms;
  return forms.filter(mega => megaFormMatches(entry.megaForms, mega));
}

function parseMegaFormTokens(value) {
  return unique(String(value || "")
    .split(/[|;,/]/)
    .map(token => token.trim())
    .filter(Boolean));
}

function megaFormToken(pokemon) {
  return displayPokemonName(pokemon, false);
}

function megaFormMatches(tokens, mega) {
  const keys = megaFormKeys(mega);
  return tokens.some(token => keys.includes(cleanName(token)));
}

function megaFormKeys(mega) {
  const keys = [
    mega.form || "",
    mega.name || "",
    displayPokemonName(mega, false),
    megaFormToken(mega)
  ].map(cleanName);
  const name = cleanName(mega.name || "");
  if (name.endsWith("x")) keys.push("x", "megax");
  if (name.endsWith("y") || cleanName(mega.form || "") === "megay") keys.push("y", "megay");
  return unique(keys.filter(Boolean));
}

function isMegaForm(form) {
  return form === "Mega" || form === "MegaY" || form === "MegaZ";
}

function getFieldlessBoostTypes(pokemon) {
  return FIELDLESS_MEGA_BOOSTS.get(`${pokemon.id}:${pokemon.form}`) || [];
}

function getMegaAdditionalChargedMoves(pokemon) {
  return MEGA_ADDITIONAL_CHARGED_MOVES.get(`${pokemon.id}:${pokemon.form}`) || [];
}

function getMegaPriority(pokemon, enemy, attackType = null) {
  const boostTypes = getFieldlessBoostTypes(pokemon);
  if (!boostTypes.length) return 0;
  if (attackType) return boostTypes.includes(attackType) ? 2 : 0;
  return boostTypes.some(type => (enemy.weakness.get(type) || 1) > 1.01) ? 2 : 0;
}

function megaBoostText(slot0) {
  if (!slot0?.megaBoostTypes?.length) return "Mega slot";
  return `${slot0.megaPriority ? "background boost" : "field boost"}: ${slot0.megaBoostTypes.join(", ")}`;
}

function rankScenario(entry, enemy, settings, level, useCurrentMoves) {
  return rankPokemon(entry.pokemon, {
    ...entry,
    level,
    levelNote: ""
  }, enemy, {
    ...settings,
    useCurrentMoves
  });
}

function findMinimumLevelForScenario(entry, scenario, enemy, settings, cutoff) {
  const start = Math.min(scenario.level, nextHalfLevel(entry.level));
  for (let level = start; level <= scenario.level + 0.001; level += 0.5) {
    const after = rankScenario(entry, enemy, settings, roundToHalf(level), scenario.useCurrentMoves);
    if (after && after.metric >= cutoff) return after.level;
  }
  return scenario.level;
}

function hasEnteredMoves(entry) {
  return Boolean((entry.fastMove || "").trim() || getEntryChargedMoveNames(entry).length);
}

function didMovesChange(before, after) {
  const fastChanged = cleanName(moveName(before.fastMove)) !== cleanName(moveName(after.fastMove));
  const beforeCharged = before.enteredChargedMoves?.length
    ? before.enteredChargedMoves
    : [moveName(before.chargedMove)];
  const chargedChanged = !beforeCharged.map(cleanName).includes(cleanName(moveName(after.chargedMove)));
  return fastChanged || chargedChanged;
}

function getEntryChargedMoveNames(entry) {
  return unique([entry.chargedMove, entry.chargedMove2].map(move => String(move || "").trim()).filter(Boolean));
}

function moveName(move) {
  if (!move) return "";
  return typeof move === "string" ? move : move.name;
}

function isHiddenPowerMove(name) {
  return cleanName(name).startsWith("hiddenpower");
}

function nextHalfLevel(level) {
  return roundToHalf(level + 0.5);
}

function roundToHalf(level) {
  return Math.round(level * 2) / 2;
}

function candyCostToLevel(fromLevel, toLevel) {
  const start = roundToHalf(fromLevel);
  const target = roundToHalf(Math.max(fromLevel, toLevel || fromLevel));
  let candy = 0;
  let xl = 0;
  let level = start;

  while (level < target - 0.001) {
    const cost = powerUpCandyCost(level);
    if (level >= 40) xl += cost;
    else candy += cost;
    level = roundToHalf(level + 0.5);
  }

  return {
    candy,
    xl,
    levelGain: Math.max(0, target - start)
  };
}

function powerUpCandyCost(level) {
  if (level < 11) return 1;
  if (level < 21) return 2;
  if (level < 25) return 3;
  if (level < 31) return 4;
  if (level < 33) return 6;
  if (level < 35) return 8;
  if (level < 37) return 10;
  if (level < 39) return 12;
  if (level < 40) return 15;
  if (level < 42) return 10;
  if (level < 44) return 12;
  if (level < 46) return 15;
  if (level < 48) return 17;
  if (level < 50) return 20;
  return 0;
}

function formatCandyCost(cost) {
  const parts = [];
  if (cost.candy > 0 || cost.xl === 0) parts.push(`${cost.candy.toLocaleString()} candy`);
  if (cost.xl > 0) parts.push(`${cost.xl.toLocaleString()} XL`);
  return parts.join(" + ");
}

function formatMoveChange(before, after) {
  const beforeFast = moveName(before.fastMove) || "no fast move";
  const beforeCharged = before.enteredChargedMoves?.length
    ? before.enteredChargedMoves.join(" + ")
    : moveName(before.chargedMove) || "no charged move";
  const afterFast = moveName(after.fastMove) || "no fast move";
  const afterCharged = moveName(after.chargedMove) || "no charged move";
  const beforeMoves = `${beforeFast} / ${beforeCharged}`;
  const afterMoves = `${afterFast} / ${afterCharged}`;
  return !didMovesChange(before, after)
    ? "No move change needed"
    : `${beforeMoves} -> ${afterMoves}`;
}

function renderResults(typeTeams, upgradeCandidates, rowCount, matchedCount, messages, settings) {
  const accountCount = unique(typeTeams.map(row => row.account)).length;
  state.currentTypeTeams = typeTeams;
  state.currentSettings = settings;
  el.summaryRows.textContent = rowCount.toString();
  el.summaryMatched.textContent = matchedCount.toString();
  el.summarySix.textContent = accountCount ? accountCount.toString() : "-";
  el.typeContext.textContent = `Showing ${TEAM_TYPES.length} reusable attacker teams per account by ${settings.metric} with Party Power ${settings.partySize}. Mega/Primal is slot 0.`;
  el.upgradeContext.textContent = `Showing type-team candidates that can enter the active regular lineup by level ${formatNumber(settings.upgradeLevel, 1)}, plus material team gains.`;
  addMessages(messages);

  renderTypeTeams(typeTeams, settings);
  renderUpgradeCandidates(upgradeCandidates, settings);
  renderRosterBox(state.currentRosterEntries, state.currentUsableByUid, settings);
}

function renderTypeTeams(typeTeams, settings) {
  if (!typeTeams.length) {
    el.typeResultsBody.innerHTML = `<tr><td colspan="6" class="subtle">No type teams yet.</td></tr>`;
    return;
  }

  el.typeResultsBody.innerHTML = typeTeams.map(row => {
    const detailKey = typeRowKey(row);
    const isExpanded = state.expandedTypeKey === detailKey;
    const typeCell = `<button class="type-toggle" type="button" aria-expanded="${isExpanded}" aria-label="Show ${escapeAttr(row.account)} ${row.type} team details"><span class="type-chip" style="background:${TYPE_COLORS[row.type] || "#777"}">${row.type}</span><span class="toggle-mark">${isExpanded ? "Hide" : "View"}</span></button>`;
    const slot0 = row.slot0
      ? `<div class="pokemon-name">${escapeHtml(displayPokemonName(row.slot0.pokemon, false))}</div><div class="subtle">${escapeHtml(megaBoostText(row.slot0))}</div><div class="subtle">CP ${row.slot0.cp.toLocaleString()} · ${escapeHtml(row.slot0.fastMove.name)} / ${escapeHtml(row.slot0.chargedMove.name)}</div>`
      : `<span class="subtle">No eligible Mega/Primal</span>`;
    const topSix = row.topSix.length
      ? `<ol class="team-list">${row.topSix.map(result => `<li>${escapeHtml(displayPokemonName(result.pokemon, result.shadow))}<span class="subtle"> · CP ${result.cp.toLocaleString()} · Lv ${formatNumber(result.level, 1)} · ${escapeHtml(result.fastMove.name)} / ${escapeHtml(result.chargedMove.name)}</span></li>`).join("")}</ol>`
      : `<span class="subtle">No qualifying ${row.type} attackers</span>`;
    const upgrade = row.upgrade
      ? `${escapeHtml(displayPokemonName(row.upgrade.before.pokemon, row.upgrade.before.shadow))}<div class="subtle">${escapeHtml(row.upgrade.scenario.label)} · ${escapeHtml(formatUpgradeGainBrief(row.upgrade, settings))}</div>`
      : `<span class="subtle">No standout candidate</span>`;

    const summaryRow = `<tr class="type-summary-row ${isExpanded ? "is-expanded" : ""}" data-type-key="${escapeAttr(detailKey)}" tabindex="0" aria-expanded="${isExpanded}">
      <td>${escapeHtml(row.account)}</td>
      <td>${typeCell}</td>
      <td>${slot0}</td>
      <td>${topSix}</td>
      <td>${formatNumber(row.topSixTotal, 1)}</td>
      <td>${upgrade}</td>
    </tr>`;
    const detailRow = isExpanded ? `<tr class="type-detail-row"><td colspan="6">${renderVisualTeam(row, settings)}</td></tr>` : "";
    return summaryRow + detailRow;
  }).join("");
}

function handleTypeRowClick(event) {
  const row = event.target.closest(".type-summary-row");
  if (!row || !el.typeResultsBody.contains(row)) return;
  toggleTypeDetail(row.dataset.typeKey || "");
}

function handlePokemonCardClick(event) {
  const card = event.target.closest(".pokemon-card[data-entry-uid]");
  if (!card || !el.typeResultsBody.contains(card)) return;
  const rowNumber = Number(card.dataset.entryUid);
  if (rowNumber) {
    event.preventDefault();
    openQuickEdit(rowNumber);
  }
}

function handleRosterBoxClick(event) {
  const action = event.target.closest("[data-roster-action]");
  if (!action || !el.rosterBox.contains(action)) return;
  const rowNumber = Number(action.dataset.entryUid);
  if (!rowNumber) return;

  if (action.dataset.rosterAction === "toggle") {
    state.expandedRosterUid = state.expandedRosterUid === rowNumber ? null : rowNumber;
    renderRosterBox(state.currentRosterEntries, state.currentUsableByUid, state.currentSettings || readSettings());
  } else if (action.dataset.rosterAction === "save") {
    saveRosterEntry(rowNumber);
  }
}

function handleRosterEditInput(event) {
  const field = event.target;
  if (!field?.name || !["level", "cp", "atk_iv", "def_iv", "hp_iv"].includes(field.name)) return;
  const form = field.closest ? field.closest(".roster-edit-form") : null;
  if (!form || !el.rosterBox.contains(form)) return;
  const source = field.name === "cp" ? "cp" : "level";
  form.dataset.levelCpSource = source;
  syncRosterFormLevelCP(form, source);
}

function handleTypeRowKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest(".type-summary-row");
  if (!row || !el.typeResultsBody.contains(row)) return;
  event.preventDefault();
  toggleTypeDetail(row.dataset.typeKey || "");
}

function handleUpgradeGroupClick(event) {
  const row = event.target.closest(".upgrade-group-row");
  if (!row || !el.upgradeResultsBody.contains(row)) return;
  toggleUpgradeType(row.dataset.upgradeType || "");
}

function handleUpgradeGroupKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest(".upgrade-group-row");
  if (!row || !el.upgradeResultsBody.contains(row)) return;
  event.preventDefault();
  toggleUpgradeType(row.dataset.upgradeType || "");
}

function toggleTypeDetail(detailKey) {
  state.expandedTypeKey = state.expandedTypeKey === detailKey ? "" : detailKey;
  renderTypeTeams(state.currentTypeTeams, state.currentSettings || readSettings());
}

function toggleUpgradeType(type) {
  if (!type) return;
  if (state.expandedUpgradeTypes.has(type)) {
    state.expandedUpgradeTypes.delete(type);
  } else {
    state.expandedUpgradeTypes.add(type);
  }
  renderUpgradeCandidates(buildTypeUpgradeCandidates(state.currentTypeTeams), state.currentSettings || readSettings());
}

function typeRowKey(row) {
  return `${row.account}::${row.type}`;
}

function getRosterEntryByRowNumber(rowNumber) {
  const numericRow = Number(rowNumber);
  return state.currentRosterEntries.find(entry => entry.rowNumber === numericRow) || null;
}

function getRosterNumberForRowNumber(rowNumber) {
  const numericRow = Number(rowNumber);
  const entry = getRosterEntryByRowNumber(numericRow);
  if (entry?.rosterNumber) return entry.rosterNumber;
  return Number.isFinite(numericRow) && numericRow > 1 ? numericRow - 1 : "";
}

function formatRosterReference(entry, fallbackRowNumber = null) {
  const rosterNumber = entry?.rosterNumber || getRosterNumberForRowNumber(fallbackRowNumber ?? entry?.rowNumber);
  return rosterNumber ? `Roster #${rosterNumber}` : "Roster entry";
}

function openQuickEdit(rowNumber) {
  const entry = getRosterEntryByRowNumber(rowNumber);
  if (!entry) {
    addMessages([{type: "error", text: "Could not find that roster row."}]);
    return;
  }

  const usableEntry = state.currentUsableByUid.get(rowNumber) || null;
  const pokemon = usableEntry?.pokemon || null;
  const displayName = pokemon ? displayPokemonName(pokemon, usableEntry.shadow) : entry.rawName || "Unmatched Pokemon";
  const calculatedCp = pokemon && usableEntry?.level
    ? getPokemonCP(getPokemonStats(pokemon, usableEntry.level, usableEntry.ivs, false))
    : null;
  const cpValue = entry.cp || calculatedCp || "";
  state.quickEditRowNumber = rowNumber;
  state.quickEditSource = "";
  el.quickEditTitle.textContent = displayName;
  el.quickEditLevel.value = entry.level ? formatRosterNumber(entry.level) : usableEntry?.level ? formatRosterNumber(usableEntry.level) : "";
  el.quickEditCp.value = cpValue ? String(cpValue) : "";
  refreshQuickEditMeta(rowNumber);
  el.quickEditFullLink.setAttribute("href", `#${rosterEntryElementId(rowNumber)}`);
  if (pokemon) {
    el.quickEditSprite.hidden = false;
    el.quickEditSprite.src = pokemonImageUrl(pokemon);
    el.quickEditSprite.alt = displayName;
    el.quickEditSprite.onerror = () => {
      el.quickEditSprite.onerror = null;
      el.quickEditSprite.src = basePokemonImageUrl(pokemon);
    };
  } else {
    el.quickEditSprite.hidden = true;
    el.quickEditSprite.removeAttribute("src");
    el.quickEditSprite.alt = "";
  }
  el.quickEditModal.hidden = false;
  if (document.body?.classList) document.body.classList.add("quick-edit-open");
  if (typeof el.quickEditLevel.focus === "function") el.quickEditLevel.focus();
  if (typeof el.quickEditLevel.setSelectionRange === "function") {
    const length = el.quickEditLevel.value.length;
    el.quickEditLevel.setSelectionRange(0, length);
  }
}

function handleQuickEditModalClick(event) {
  const action = event.target.closest("[data-quick-edit-action]");
  if (!action || !el.quickEditModal.contains(action)) return;
  const actionName = action.dataset.quickEditAction;
  if (actionName === "close") {
    event.preventDefault();
    closeQuickEdit();
  } else if (actionName === "full") {
    event.preventDefault();
    const rowNumber = state.quickEditRowNumber;
    closeQuickEdit();
    if (rowNumber) openRosterEntry(rowNumber);
  }
}

function closeQuickEdit() {
  if (!el.quickEditModal) return;
  el.quickEditModal.hidden = true;
  state.quickEditRowNumber = null;
  state.quickEditSource = "";
  if (document.body?.classList) document.body.classList.remove("quick-edit-open");
}

function saveQuickEdit() {
  const rowNumber = state.quickEditRowNumber;
  if (!rowNumber) return;
  if (state.quickEditSource) syncQuickEditLevelCP(state.quickEditSource, {normalizeLevel: true});
  const applied = updateCSVRow(rowNumber, {
    level: el.quickEditLevel.value.trim(),
    cp: el.quickEditCp.value.trim()
  });
  if (!applied.ok) {
    addMessages([{type: "error", text: applied.message}]);
    return;
  }

  const saveText = state.previewingSample
    ? `Saved ${formatRosterReference(getRosterEntryByRowNumber(rowNumber), rowNumber)} in the sample preview. Your saved roster was not replaced.`
    : `Saved ${formatRosterReference(getRosterEntryByRowNumber(rowNumber), rowNumber)}. Teams recalculated.`;
  if (!state.previewingSample) rememberRosterText(el.rosterInput.value, true);
  state.expandedRosterUid = rowNumber;
  state.pendingMessage = {type: "success", text: saveText};
  closeQuickEdit();
  calculate();
}

function rosterEntryElementId(rowNumber) {
  return `roster-entry-${rowNumber}`;
}

function openRosterEntry(rowNumber) {
  state.expandedRosterUid = rowNumber;
  if (state.rosterSearch) {
    state.rosterSearch = "";
    if (el.rosterSearch) el.rosterSearch.value = "";
  }
  renderRosterBox(state.currentRosterEntries, state.currentUsableByUid, state.currentSettings || readSettings());
  const entryElement = document.getElementById(rosterEntryElementId(rowNumber));
  if (entryElement && typeof entryElement.scrollIntoView === "function") {
    entryElement.scrollIntoView({block: "center", behavior: "smooth"});
  }
  addMessages([{type: "success", text: `Opened ${formatRosterReference(getRosterEntryByRowNumber(rowNumber), rowNumber)}.`}]);
}

function saveRosterEntry(rowNumber) {
  const form = document.getElementById(`roster-form-${rowNumber}`);
  if (!form) return;
  if (form.dataset?.levelCpSource) syncRosterFormLevelCP(form, form.dataset.levelCpSource, {normalizeLevel: true});
  const fields = form.querySelectorAll("[name]");
  const updates = {};
  const selectedMegaForms = [];
  const hiddenMegaForms = [];
  let hasMegaFormControls = false;
  fields.forEach(field => {
    if (field.name === "mega_forms") {
      hasMegaFormControls = true;
      if (field.type === "checkbox") {
        if (field.checked) selectedMegaForms.push(field.value.trim());
      } else if (field.value.trim()) {
        hiddenMegaForms.push(field.value.trim());
      }
      return;
    }
    if (field.type === "checkbox") updates[field.name] = field.checked ? "true" : "false";
    else updates[field.name] = field.value.trim();
  });
  if (hasMegaFormControls) {
    updates.mega_forms = unique([...selectedMegaForms, ...hiddenMegaForms]).join("|");
    if (!("can_mega" in updates)) {
      updates.can_mega = selectedMegaForms.length ? "true" : "false";
    }
  }

  const applied = updateCSVRow(rowNumber, updates);
  if (!applied.ok) {
    addMessages([{type: "error", text: applied.message}]);
    return;
  }

  if (!state.previewingSample) rememberRosterText(el.rosterInput.value, true);
  state.expandedRosterUid = rowNumber;
  state.pendingMessage = {
    type: "success",
    text: state.previewingSample
      ? `Saved ${formatRosterReference(getRosterEntryByRowNumber(rowNumber), rowNumber)} in the sample preview. Your saved roster was not replaced.`
      : `Saved ${formatRosterReference(getRosterEntryByRowNumber(rowNumber), rowNumber)}. Teams recalculated.`
  };
  calculate();
}

function updateCSVRow(rowNumber, updates) {
  const table = parseCSV(el.rosterInput.value);
  while (table.length > 1 && table[table.length - 1].every(cell => !cell.trim())) {
    table.pop();
  }

  const rowIndex = rowNumber - 1;
  if (!table.length || !table[rowIndex]) {
    return {ok: false, message: "Could not find that roster row."};
  }

  const headers = table[0].map(normalizeHeader);
  for (const [key, value] of Object.entries(updates)) {
    const column = ensureCSVColumn(table, headers, key, csvHeaderLabel(key));
    table[rowIndex][column] = value;
  }

  el.rosterInput.value = serializeCSV(table);
  return {ok: true};
}

function ensureCSVColumn(table, headers, normalizedHeader, headerLabel) {
  let index = headers.indexOf(normalizedHeader);
  if (index !== -1) return index;
  table[0].push(headerLabel);
  headers.push(normalizedHeader);
  return table[0].length - 1;
}

function csvHeaderLabel(key) {
  return {
    atk_iv: "atk_iv",
    def_iv: "def_iv",
    hp_iv: "hp_iv",
    fast_move: "fast_move",
    charged_move: "charged_move",
    charged_move_2: "charged_move_2",
    can_mega: "can_mega",
    mega_forms: "mega_forms"
  }[key] || key;
}

function serializeCSV(rows) {
  const width = Math.max(...rows.map(row => row.length));
  return rows
    .map(row => {
      const cells = [...row];
      while (cells.length < width) cells.push("");
      return cells.map(serializeCSVCell).join(",");
    })
    .join("\n");
}

function serializeCSVCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function renderRosterBox(entries, usableByUid, settings) {
  if (!entries.length) {
    el.rosterBoxContext.textContent = "No roster rows loaded.";
    el.rosterBox.innerHTML = `<div class="visual-empty">No roster entries yet.</div>`;
    return;
  }

  const query = state.rosterSearch.trim();
  const filteredEntries = query
    ? entries.filter(entry => rosterEntryMatchesSearch(entry, usableByUid.get(entry.rowNumber) || null, query))
    : entries;
  const matchedCount = entries.filter(entry => usableByUid.has(entry.rowNumber)).length;
  const filterText = query ? ` Showing ${filteredEntries.length.toLocaleString()} matching "${query}".` : "";
  el.rosterBoxContext.textContent = `${entries.length.toLocaleString()} roster spots loaded, ${matchedCount.toLocaleString()} matched.${filterText}`;
  el.rosterBox.innerHTML = filteredEntries.length
    ? filteredEntries.map(entry => renderRosterEntry(entry, usableByUid.get(entry.rowNumber) || null, settings)).join("")
    : `<div class="visual-empty">No roster entries match "${escapeHtml(query)}".</div>`;
}

function rosterEntryMatchesSearch(entry, usableEntry, query) {
  const terms = cleanName(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const pokemon = usableEntry?.pokemon || null;
  const haystack = cleanName([
    entry.rosterNumber,
    entry.rowNumber,
    entry.account,
    entry.rawName,
    entry.form,
    entry.cp,
    entry.level,
    entry.fastMove,
    entry.chargedMove,
    entry.chargedMove2,
    entry.notes,
    pokemon?.name,
    pokemon?.form,
    pokemon?.types?.join(" "),
    formatMegaAvailability(entry, pokemon)
  ].filter(value => value !== undefined && value !== null).join(" "));
  return terms.every(term => haystack.includes(term));
}

function renderRosterEntry(entry, usableEntry, settings) {
  const rowNumber = entry.rowNumber;
  const rosterNumber = entry.rosterNumber || Math.max(1, rowNumber - 1);
  const isExpanded = state.expandedRosterUid === rowNumber;
  const pokemon = usableEntry?.pokemon || null;
  const displayName = pokemon ? displayPokemonName(pokemon, usableEntry.shadow) : entry.rawName || "Unmatched Pokemon";
  const sprite = pokemon
    ? `<img class="pokemon-sprite" src="${escapeAttr(pokemonImageUrl(pokemon))}" alt="${escapeAttr(displayName)}" loading="lazy" onerror="this.onerror=null;this.src='${escapeAttr(basePokemonImageUrl(pokemon))}'">`
    : `<div class="sprite-placeholder">?</div>`;
  const resolvedCp = pokemon && usableEntry?.level
    ? getPokemonCP(getPokemonStats(pokemon, usableEntry.level, usableEntry.ivs, false))
    : entry.cp || null;
  const typeText = pokemon?.types?.join(" / ") || "Unmatched";
  const megaText = formatMegaAvailability(entry, pokemon);
  const levelText = entry.level ? `Lv ${formatNumber(entry.level, 1)}` : "Lv ?";
  const cpText = resolvedCp ? `CP ${resolvedCp.toLocaleString()}` : "CP ?";
  const movesText = formatEntryMoves(entry);

  return `<article id="roster-entry-${rowNumber}" class="roster-entry ${isExpanded ? "is-expanded" : ""}">
    <button class="roster-summary" type="button" data-roster-action="toggle" data-entry-uid="${escapeAttr(rowNumber)}" aria-expanded="${isExpanded}" aria-controls="roster-details-${escapeAttr(rowNumber)}">
      <div class="card-slot">${escapeHtml(rosterNumber)}</div>
      ${sprite}
      <div class="roster-summary-body">
        <div class="pokemon-name">${escapeHtml(displayName)}</div>
        <div class="cp-line">${escapeHtml(cpText)}</div>
        <div class="subtle">${escapeHtml(entry.account)} · ${escapeHtml(levelText)} · ${escapeHtml(entry.ivs.atk)}/${escapeHtml(entry.ivs.def)}/${escapeHtml(entry.ivs.hp)} · ${escapeHtml(typeText)}</div>
        <div class="subtle">${escapeHtml(movesText)} · ${escapeHtml(megaText)}</div>
      </div>
      <span class="toggle-mark">${isExpanded ? "Close" : "Edit"}</span>
    </button>
    ${isExpanded ? renderRosterEntryDetails(entry, usableEntry, resolvedCp, settings) : ""}
  </article>`;
}

function renderRosterEntryDetails(entry, usableEntry, resolvedCp, settings) {
  const pokemon = usableEntry?.pokemon || null;
  const typeText = pokemon?.types?.join(" / ") || "Unmatched";
  const baseStats = pokemon
    ? `${pokemon.stats.baseAttack}/${pokemon.stats.baseDefense}/${pokemon.stats.baseStamina}`
    : "-";
  const legalFastMoves = pokemon ? getMoveNames(pokemon, "fm").join(", ") || "-" : "-";
  const legalChargedMoves = pokemon ? getMoveNames(pokemon, "cm").join(", ") || "-" : "-";
  const megaForms = pokemon ? getMegaForms(pokemon) : [];
  const megaText = megaForms.length ? megaForms.map(form => displayPokemonName(form, false)).join(", ") : "-";
  const megaControls = renderMegaFormControls(entry, megaForms);
  const levelNote = usableEntry?.levelNote || "";
  const cpValue = entry.cp ? String(entry.cp) : "";

  return `<div id="roster-details-${entry.rowNumber}" class="roster-details">
    <form id="roster-form-${entry.rowNumber}" class="roster-edit-form" data-entry-uid="${escapeAttr(entry.rowNumber)}">
      <div class="roster-field-grid">
        ${renderTextField("Account", "account", entry.account)}
        ${renderTextField("Name", "name", entry.rawName)}
        ${renderTextField("Form", "form", entry.form)}
        ${renderTextField("Level", "level", entry.level ? formatRosterNumber(entry.level) : "", "number", "0.5")}
        ${renderTextField("CP", "cp", cpValue, "number", "1")}
        ${renderTextField("Atk IV", "atk_iv", entry.ivs.atk, "number", "1")}
        ${renderTextField("Def IV", "def_iv", entry.ivs.def, "number", "1")}
        ${renderTextField("HP IV", "hp_iv", entry.ivs.hp, "number", "1")}
        ${renderTextField("Fast move", "fast_move", entry.fastMove)}
        ${renderTextField("Charged move", "charged_move", entry.chargedMove)}
        ${renderTextField("Charged move 2", "charged_move_2", entry.chargedMove2)}
        ${renderTextField("Notes", "notes", entry.notes)}
        <label class="check-field"><input type="checkbox" name="shadow" ${entry.shadow ? "checked" : ""}> Shadow</label>
        <label class="check-field"><input type="checkbox" name="purified" ${entry.purified ? "checked" : ""}> Purified</label>
        ${megaControls}
      </div>
      <div class="roster-data-grid">
        <div><span class="summary-label">Roster #</span><strong>${escapeHtml(entry.rosterNumber || Math.max(1, entry.rowNumber - 1))}</strong></div>
        <div><span class="summary-label">CSV line</span><strong>${entry.rowNumber}</strong></div>
        <div><span class="summary-label">Resolved</span><strong>${escapeHtml(pokemon ? pokemon.name : "No")}</strong></div>
        <div><span class="summary-label">Types</span><strong>${escapeHtml(typeText)}</strong></div>
        <div><span class="summary-label">Base stats</span><strong>${escapeHtml(baseStats)}</strong></div>
        <div><span class="summary-label">Calculated CP</span><strong>${resolvedCp ? resolvedCp.toLocaleString() : "-"}</strong></div>
        <div><span class="summary-label">Mega forms</span><strong>${escapeHtml(megaText)}</strong></div>
      </div>
      <div class="move-reference">
        <div class="subtle"><strong>Fast:</strong> ${escapeHtml(legalFastMoves)}</div>
        <div class="subtle"><strong>Charged:</strong> ${escapeHtml(legalChargedMoves)}</div>
        ${levelNote ? `<div class="subtle"><strong>Level:</strong> ${escapeHtml(levelNote)}</div>` : ""}
      </div>
      <div class="roster-actions">
        <button type="button" data-roster-action="save" data-entry-uid="${escapeAttr(entry.rowNumber)}">Save edits</button>
      </div>
    </form>
  </div>`;
}

function formatEntryMoves(entry) {
  const chargedMoves = getEntryChargedMoveNames(entry);
  return `${entry.fastMove || "no fast move"} / ${chargedMoves.length ? chargedMoves.join(" + ") : "no charged move"}`;
}

function renderMegaFormControls(entry, megaForms) {
  if (!megaForms.length) return "";
  const selectedForms = selectedMegaFormsForEntry(entry, megaForms);
  if (megaForms.length === 1) {
    const token = megaFormToken(megaForms[0]);
    return `<label class="check-field"><input type="checkbox" name="can_mega" ${selectedForms.length ? "checked" : ""}> Can Mega/Primal</label>
      <input type="hidden" name="mega_forms" value="${escapeAttr(token)}">`;
  }

  return `<fieldset class="mega-form-options">
    <legend>Mega/Primal forms ready</legend>
    ${megaForms.map(mega => {
      const token = megaFormToken(mega);
      const checked = selectedForms.includes(mega);
      return `<label class="check-field"><input type="checkbox" name="mega_forms" value="${escapeAttr(token)}" ${checked ? "checked" : ""}> ${escapeHtml(token)}</label>`;
    }).join("")}
  </fieldset>`;
}

function selectedMegaFormsForEntry(entry, megaForms) {
  if (!entry?.canMega) return [];
  if (!entry.megaForms?.length) return megaForms;
  return megaForms.filter(mega => megaFormMatches(entry.megaForms, mega));
}

function formatMegaAvailability(entry, pokemon) {
  if (!pokemon) return "No Mega/Primal form";
  const megaForms = getMegaForms(pokemon);
  if (!megaForms.length) return "No Mega/Primal form";
  const selected = selectedMegaFormsForEntry(entry, megaForms);
  if (!selected.length) return "Mega/Primal off";
  return selected.length === megaForms.length
    ? "All Mega/Primal forms ready"
    : `Mega ready: ${selected.map(megaFormToken).join(", ")}`;
}

function renderTextField(label, name, value, type = "text", step = null) {
  const syncAttr = ["level", "cp", "atk_iv", "def_iv", "hp_iv"].includes(name) ? ` data-sync-stat="${escapeAttr(name)}"` : "";
  const numericAttrs = type === "number" ? ` inputmode="decimal"${step ? ` step="${escapeAttr(step)}"` : ""}` : "";
  return `<label class="edit-field">
    <span>${escapeHtml(label)}</span>
    <input type="${escapeAttr(type)}" name="${escapeAttr(name)}" value="${escapeAttr(value)}"${numericAttrs}${syncAttr}>
  </label>`;
}

function formatRosterNumber(value) {
  return Number.isInteger(value) ? String(value) : String(value);
}

function syncQuickEditLevelCP(source, options = {}) {
  state.quickEditSource = source;
  const rowNumber = state.quickEditRowNumber;
  if (!rowNumber) return false;
  const entry = getRosterEntryByRowNumber(rowNumber);
  if (!entry) return false;
  const usableEntry = state.currentUsableByUid.get(rowNumber) || null;
  const resolved = usableEntry?.pokemon ? {pokemon: usableEntry.pokemon} : resolveRosterEntry(entry);
  const synced = syncLevelCPFields({
    pokemon: resolved.pokemon,
    ivs: entry.ivs,
    levelInput: el.quickEditLevel,
    cpInput: el.quickEditCp,
    source,
    normalizeLevel: options.normalizeLevel
  });
  refreshQuickEditMeta(rowNumber);
  return synced;
}

function syncRosterFormLevelCP(form, source, options = {}) {
  const rowNumber = Number(form?.dataset?.entryUid || form?.id?.replace("roster-form-", ""));
  if (!rowNumber) return false;
  const snapshot = getRosterFormSnapshot(form, rowNumber);
  const synced = syncLevelCPFields({
    pokemon: snapshot.pokemon,
    ivs: snapshot.entry.ivs,
    levelInput: getRosterFormField(form, "level"),
    cpInput: getRosterFormField(form, "cp"),
    source,
    normalizeLevel: options.normalizeLevel
  });
  if (synced && form.dataset) form.dataset.levelCpSource = source;
  return synced;
}

function syncLevelCPFields({pokemon, ivs, levelInput, cpInput, source, normalizeLevel = false}) {
  if (!pokemon || !levelInput || !cpInput) return false;
  if (source === "cp") {
    const targetCp = toNumber(cpInput.value);
    if (!targetCp) return false;
    const best = findClosestLevelByCP(pokemon, coerceIvs(ivs), targetCp);
    if (!best) return false;
    levelInput.value = formatRosterNumber(best.level);
    return true;
  }

  const enteredLevel = toNumber(levelInput.value);
  if (!enteredLevel) return false;
  const level = clamp(roundToHalf(enteredLevel), 1, 51);
  if (normalizeLevel) levelInput.value = formatRosterNumber(level);
  cpInput.value = String(getPokemonCP(getPokemonStats(pokemon, level, coerceIvs(ivs), false)));
  return true;
}

function getRosterFormSnapshot(form, rowNumber) {
  const fallback = getRosterEntryByRowNumber(rowNumber) || {};
  const ivs = {
    atk: clamp(toNumber(getRosterFormField(form, "atk_iv")?.value, fallback.ivs?.atk ?? 15), 0, 15),
    def: clamp(toNumber(getRosterFormField(form, "def_iv")?.value, fallback.ivs?.def ?? 15), 0, 15),
    hp: clamp(toNumber(getRosterFormField(form, "hp_iv")?.value, fallback.ivs?.hp ?? 15), 0, 15)
  };
  const entry = {
    ...fallback,
    rawName: getRosterFormField(form, "name")?.value.trim() || fallback.rawName || "",
    form: getRosterFormField(form, "form")?.value.trim() || fallback.form || "",
    id: fallback.id || null,
    ivs
  };
  return {entry, pokemon: resolveRosterEntry(entry).pokemon || null};
}

function getRosterFormField(form, name) {
  return form?.querySelector ? form.querySelector(`[name="${name}"]`) : null;
}

function coerceIvs(ivs) {
  return {
    atk: clamp(toNumber(ivs?.atk, 15), 0, 15),
    def: clamp(toNumber(ivs?.def, 15), 0, 15),
    hp: clamp(toNumber(ivs?.hp, 15), 0, 15)
  };
}

function refreshQuickEditMeta(rowNumber) {
  const entry = getRosterEntryByRowNumber(rowNumber);
  if (!entry) return;
  const level = toNumber(el.quickEditLevel.value);
  const cp = toNumber(el.quickEditCp.value);
  el.quickEditMeta.textContent = [
    formatRosterReference(entry, rowNumber),
    entry.account,
    level ? `Lv ${formatNumber(level, 1)}` : "Lv ?",
    cp ? `CP ${cp.toLocaleString()}` : "CP ?"
  ].filter(Boolean).join(" · ");
}

function renderVisualTeam(row, settings) {
  if (!row.slot0 && !row.topSix.length) {
    return `<div class="visual-empty">No visual team for ${escapeHtml(row.account)} ${escapeHtml(row.type)} yet.</div>`;
  }

  const megaSection = row.slot0
    ? `<div class="visual-section">
        <div class="visual-section-label">Mega slot</div>
        <div class="mega-row">${renderPokemonCard(row.slot0, settings, "0", "Mega slot", megaBoostText(row.slot0))}</div>
      </div>`
    : `<div class="visual-section">
        <div class="visual-section-label">Mega slot</div>
        <div class="visual-empty">No eligible Mega/Primal for this account.</div>
      </div>`;
  const regularSection = row.topSix.length
    ? `<div class="visual-section">
        <div class="visual-section-label">Current six</div>
        <div class="visual-card-grid regular-team-grid">${row.topSix.map((result, index) => renderPokemonCard(result, settings, String(index + 1), "Regular slot", `${result.fastMove.name} / ${result.chargedMove.name}`)).join("")}</div>
      </div>`
    : `<div class="visual-section">
        <div class="visual-section-label">Current six</div>
        <div class="visual-empty">No regular ${escapeHtml(row.type)} attackers found for this account.</div>
      </div>`;
  const upgradeCandidates = getVisualUpgradeCandidates(row);
  const targetSlot = row.cutoffSlot || (row.slot0 ? 5 : 6);
  const upgradeSection = upgradeCandidates.length
    ? `<div class="visual-section visual-upgrades">
        <div class="visual-section-label">Potential</div>
        <div class="visual-team-head">
          <strong>Could take slot ${escapeHtml(targetSlot)}</strong>
          <span class="subtle">Three Pokemon outside the active cutoff with the investment needed to enter this type team</span>
        </div>
        <div class="visual-card-grid potential-grid">${upgradeCandidates.map((candidate, index) => renderUpgradeCard(candidate, settings, index + 1)).join("")}</div>
      </div>`
    : `<div class="visual-section visual-upgrades">
        <div class="visual-section-label">Potential</div>
        <div class="visual-empty">No inactive upgrades currently project into active slot ${escapeHtml(targetSlot)} for this ${escapeHtml(row.type)} team.</div>
      </div>`;

  return `<div class="visual-team" style="--team-type-color:${TYPE_COLORS[row.type] || "#777"}">
    <div class="visual-team-head">
      <span class="type-chip" style="background:${TYPE_COLORS[row.type] || "#777"}">${escapeHtml(row.type)}</span>
      <strong>${escapeHtml(row.account)} current team</strong>
      <span class="subtle">Slot 0, top six regular attackers, and bench upgrades</span>
    </div>
    ${megaSection}
    ${regularSection}
    ${upgradeSection}
  </div>`;
}

function getVisualUpgradeCandidates(row) {
  const slot0Uid = row.slot0?.entry?.uid;
  const seen = new Set();
  return (row.upgrades || [])
    .filter(candidate => candidate.crossesTopSix && !candidate.beforeInTargetTeam && candidate.entryUid !== slot0Uid)
    .filter(candidate => {
      if (seen.has(candidate.entryUid)) return false;
      seen.add(candidate.entryUid);
      return true;
    })
    .slice(0, 3);
}

function renderPokemonCard(result, settings, slot, slotLabel, detailText) {
  const name = displayPokemonName(result.pokemon, result.shadow);
  const rowNumber = result.entry?.uid || "";
  const rosterNumber = result.entry?.rosterNumber || (rowNumber ? Math.max(1, Number(rowNumber) - 1) : "");
  return `<button class="pokemon-card ${slot === "0" ? "slot-card" : ""}" type="button" data-entry-uid="${escapeAttr(rowNumber)}" aria-label="Go to roster #${escapeAttr(rosterNumber)} for ${escapeAttr(name)}">
    <div class="card-slot">${escapeHtml(slot)}</div>
    <img class="pokemon-sprite" src="${escapeAttr(pokemonImageUrl(result.pokemon))}" alt="${escapeAttr(name)}" loading="eager" onerror="this.onerror=null;this.src='${escapeAttr(basePokemonImageUrl(result.pokemon))}'">
    <div class="pokemon-card-body">
      <div class="pokemon-name">${escapeHtml(name)}</div>
      <div class="cp-line">CP ${result.cp.toLocaleString()}</div>
      <div class="subtle">Lv ${formatNumber(result.level, 1)} · ${result.ivs.atk}/${result.ivs.def}/${result.ivs.hp}</div>
      <div class="subtle">${escapeHtml(slotLabel)} · ${escapeHtml(detailText)}</div>
      <div class="subtle">${formatNumber(result.metric, 2)} ${settings.metric}</div>
      <div class="row-line">Roster #${escapeHtml(rosterNumber)}</div>
    </div>
  </button>`;
}

function renderUpgradeCard(candidate, settings, index) {
  const before = candidate.before;
  const after = candidate.enough || candidate.after;
  const name = displayPokemonName(before.pokemon, before.shadow);
  const rosterNumber = getRosterNumberForRowNumber(candidate.entryUid);
  const targetSlot = candidate.cutoffSlot || 6;
  const threshold = candidate.cutoff > 0 ? `beats #${targetSlot} at ${formatNumber(candidate.cutoff, 2)} ${settings.metric}` : `fills open slot ${targetSlot}`;
  const targetLevel = candidate.minLevel || after.level;
  const costs = candyCostToLevel(before.level, targetLevel);
  const levelText = `Lv ${formatNumber(before.level, 1)} -> ${formatNumber(targetLevel, 1)} (+${formatNumber(costs.levelGain, 1)} levels)`;
  const moveText = formatMoveChange(before, after);
  return `<button class="pokemon-card upgrade-card" type="button" data-entry-uid="${escapeAttr(candidate.entryUid)}" aria-label="Go to roster #${escapeAttr(rosterNumber)} for ${escapeAttr(name)}">
    <div class="card-slot">U${index}</div>
    <img class="pokemon-sprite" src="${escapeAttr(pokemonImageUrl(before.pokemon))}" alt="${escapeAttr(name)}" loading="eager" onerror="this.onerror=null;this.src='${escapeAttr(basePokemonImageUrl(before.pokemon))}'">
    <div class="pokemon-card-body">
      <div class="pokemon-name">${escapeHtml(name)}</div>
      <div class="cp-line">CP ${before.cp.toLocaleString()} -> ${after.cp.toLocaleString()}</div>
      <div class="subtle"><span class="upgrade-label">Level</span> ${escapeHtml(levelText)}</div>
      <div class="subtle"><span class="upgrade-label">Candy</span> ${escapeHtml(formatCandyCost(costs))}</div>
      <div class="subtle"><span class="upgrade-label">Moves</span> ${escapeHtml(moveText)}</div>
      <div class="subtle">${escapeHtml(candidate.scenario.label)} · ${formatNumber(after.metric, 2)} ${settings.metric} · ${escapeHtml(threshold)}</div>
      <div class="row-line">Roster #${escapeHtml(rosterNumber)}</div>
    </div>
  </button>`;
}

function renderUpgradeCandidates(candidates, settings) {
  if (!candidates.length) {
    el.upgradeResultsBody.innerHTML = `<tr><td colspan="8" class="subtle">No upgrade candidates crossed an active-team cutoff or cleared the material-gain threshold.</td></tr>`;
    return;
  }

  const groups = groupUpgradeCandidatesByType(candidates);
  el.upgradeResultsBody.innerHTML = groups.map(group => {
    const isExpanded = state.expandedUpgradeTypes.has(group.type);
    const best = group.candidates[0];
    const bestName = displayPokemonName(best.before.pokemon, best.before.shadow);
    const accountCount = unique(group.candidates.map(candidate => candidate.account)).length;
    const groupRow = `<tr class="upgrade-group-row ${isExpanded ? "is-expanded" : ""}" data-upgrade-type="${escapeAttr(group.type)}" tabindex="0" aria-expanded="${isExpanded}">
      <td colspan="8">
        <button class="type-toggle upgrade-group-toggle" type="button" aria-expanded="${isExpanded}" aria-label="${isExpanded ? "Hide" : "Show"} ${escapeAttr(group.type)} upgrade candidates">
          <span class="type-chip" style="background:${TYPE_COLORS[group.type] || "#777"}">${escapeHtml(group.type)}</span>
          <span class="toggle-mark">${isExpanded ? "Hide" : "View"}</span>
        </button>
        <span class="upgrade-group-summary">${group.candidates.length.toLocaleString()} candidates · ${accountCount.toLocaleString()} account${accountCount === 1 ? "" : "s"} · best: ${escapeHtml(bestName)} (${formatNumber(getCandidateDisplayAfter(best).metric, 2)} ${escapeHtml(settings.metric)})</span>
      </td>
    </tr>`;
    const detailRows = isExpanded ? group.candidates.map(candidate => renderUpgradeCandidateRow(candidate, settings)).join("") : "";
    return groupRow + detailRows;
  }).join("");
}

function groupUpgradeCandidatesByType(candidates) {
  const groups = new Map();
  for (const candidate of candidates) {
    if (!groups.has(candidate.type)) groups.set(candidate.type, []);
    groups.get(candidate.type).push(candidate);
  }
  return [...groups.entries()]
    .sort((a, b) => TEAM_TYPES.indexOf(a[0]) - TEAM_TYPES.indexOf(b[0]))
    .map(([type, typeCandidates]) => ({type, candidates: typeCandidates}));
}

function renderUpgradeCandidateRow(candidate, settings) {
  const before = candidate.before;
  const after = getCandidateDisplayAfter(candidate);
  const moveChange = didMovesChange(before, after) ? `${after.fastMove.name} / ${after.chargedMove.name}` : "same moves";
  const levelText = `Lv ${formatNumber(before.level, 1)} -> ${formatNumber(after.level, 1)}`;
  const targetSlot = candidate.cutoffSlot || 6;
  const topSixText = candidate.crossesTopSix
    ? candidate.cutoff > 0 ? `Barely beats active #${targetSlot} (${formatNumber(candidate.cutoff, 2)})` : `Would fill open active slot ${targetSlot}`
    : candidate.beforeInTargetTeam
      ? `Improves current #${candidate.currentRank}`
      : `Bench gain; still below #${targetSlot}`;
  const rankText = candidate.currentRank ? `Current type rank #${candidate.currentRank}` : "Not currently ranked";
  const beforeMetricText = before.metric > 0 ? `${formatNumber(before.metric, 2)} ${settings.metric}` : "not ranked";
  return `<tr class="upgrade-detail-row" data-upgrade-type="${escapeAttr(candidate.type)}">
    <td>${escapeHtml(candidate.account)}</td>
    <td><span class="type-chip" style="background:${TYPE_COLORS[candidate.type] || "#777"}">${escapeHtml(candidate.type)}</span></td>
    <td>
      <div class="pokemon-name">${escapeHtml(displayPokemonName(before.pokemon, before.shadow))}</div>
      <div class="subtle">${rankText} · ${before.ivs.atk}/${before.ivs.def}/${before.ivs.hp}</div>
    </td>
    <td>
      ${escapeHtml(candidate.scenario.label)}
      <div class="subtle">${escapeHtml(moveChange)}</div>
    </td>
    <td>${beforeMetricText}<div class="subtle">${moveName(before.fastMove)} / ${moveName(before.chargedMove)}</div></td>
    <td>${formatNumber(after.metric, 2)} ${settings.metric}<div class="subtle">${levelText}</div></td>
    <td>${formatUpgradeGain(candidate, settings)}</td>
    <td>${escapeHtml(topSixText)}</td>
  </tr>`;
}

function getCandidateDisplayAfter(candidate) {
  return candidate.crossesTopSix ? candidate.enough || candidate.after : candidate.after;
}

function getCandidateDisplayGain(candidate) {
  const beforeMetric = candidate.before.metric || 0;
  const afterMetric = getCandidateDisplayAfter(candidate).metric;
  const gain = afterMetric - beforeMetric;
  return {
    gain,
    gainPct: beforeMetric > 0 ? 100 * gain / beforeMetric : null
  };
}

function formatUpgradeGain(candidate, settings) {
  const displayGain = getCandidateDisplayGain(candidate);
  if (displayGain.gainPct === null || displayGain.gainPct === undefined) {
    return `new qualifier<div class="subtle">+${formatNumber(displayGain.gain, 2)} ${settings.metric}</div>`;
  }
  return `+${formatNumber(displayGain.gainPct, 1)}%<div class="subtle">+${formatNumber(displayGain.gain, 2)} ${settings.metric}</div>`;
}

function formatUpgradeGainBrief(candidate, settings) {
  const displayGain = getCandidateDisplayGain(candidate);
  if (displayGain.gainPct === null || displayGain.gainPct === undefined) {
    return `new qualifier (+${formatNumber(displayGain.gain, 2)} ${settings.metric})`;
  }
  return `+${formatNumber(displayGain.gainPct, 1)}% (+${formatNumber(displayGain.gain, 2)} ${settings.metric})`;
}

function addMessages(messages) {
  if (!messages.length) {
    el.messages.innerHTML = `<p>Ready. Tip: leave moves blank when you want the tool to choose the best available moveset for that Pokemon.</p>`;
    return;
  }
  el.messages.innerHTML = messages.slice(0, 8).map(m => `<p class="${m.type || ""}">${escapeHtml(m.text)}</p>`).join("");
}

function setStatus(text, kind = "") {
  el.dataStatus.textContent = text;
  el.dataStatus.className = `status-pill ${kind}`.trim();
}

function displayPokemonName(pokemon, shadow) {
  if (isMegaForm(pokemon.form)) {
    return pokemon.name;
  }
  const form = pokemon.form && pokemon.form !== "Normal" ? ` (${pokemon.form.replaceAll("_", " ")})` : "";
  return `${shadow ? "Shadow " : ""}${pokemon.name}${form}`;
}

function pokemonImageUrl(pokemon) {
  const number = paddedDexNumber(pokemon.id);
  const form = cleanName(pokemon.form || "Normal");
  const name = cleanName(pokemon.name);
  if (name.startsWith("primal")) return `${SPRITE_BASE_URL}${number}-p.png`;
  if (form === "megay" || name.endsWith("y")) return `${SPRITE_BASE_URL}${number}-my.png`;
  if (form === "megaz") return `${SPRITE_BASE_URL}${number}-m.png`;
  if (form === "mega") {
    const suffix = name.endsWith("x") ? "mx" : "m";
    return `${SPRITE_BASE_URL}${number}-${suffix}.png`;
  }
  const formSuffix = SEREBII_FORM_SUFFIXES[form];
  if (formSuffix) return `${SPRITE_BASE_URL}${number}-${formSuffix}.png`;
  return basePokemonImageUrl(pokemon);
}

function basePokemonImageUrl(pokemon) {
  return `${SPRITE_BASE_URL}${paddedDexNumber(pokemon.id)}.png`;
}

function paddedDexNumber(id) {
  return String(id).padStart(3, "0");
}

function cleanName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function toCamel(id) {
  return id.split("-").map((part, index) => {
    if (index === 0) return part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join("");
}

function toNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : fallback;
}

function parseBoolean(value) {
  return /^(true|yes|y|1|shadow)$/i.test(String(value || "").trim());
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function formatNumber(value, digits) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}
