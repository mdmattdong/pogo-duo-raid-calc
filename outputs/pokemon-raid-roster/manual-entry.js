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

const HIDDEN_POWER_TYPES = [
  "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground",
  "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel"
];

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

const CSV_HEADERS = [
  "account", "name", "form", "level", "atk_iv", "def_iv", "hp_iv",
  "shadow", "purified", "fast_move", "charged_move", "charged_move_2", "cp", "can_mega", "mega_forms", "notes"
];

const DEFAULT_PLAYER_NAMES = ["Main", "Alt"];
const ALL_PLAYERS_VALUE = "__all_players__";
const ADD_PLAYER_VALUE = "__add_player__";
const PLAYER_STORAGE_KEY = "pokemonRaidRosterPlayerNames";
const STORAGE_KEY = "pokemonRaidRosterManualRows";
const STORAGE_BACKUP_KEY = "pokemonRaidRosterManualRowsBackup";
const PENDING_CSV_KEY = "pokemonRaidRosterPendingCsv";
const CURRENT_CSV_KEY = "pokemonRaidRosterCurrentCsv";
const PREVIOUS_CSV_KEY = "pokemonRaidRosterPreviousCsv";
const SUPPRESS_SAMPLE_KEY = "pokemonRaidRosterSuppressSample";

const state = {
  allPokemon: [],
  rosterPokemon: [],
  pokemonIndex: new Map(),
  rows: [],
  playerNames: [...DEFAULT_PLAYER_NAMES],
  rowPlayerFilter: ALL_PLAYERS_VALUE,
  lastSelectedPlayer: DEFAULT_PLAYER_NAMES[0],
  selectedPokemon: null,
  inferenceMatches: [],
  editingIndex: null,
  autocompleteResults: [],
  activeSuggestionIndex: -1,
  ready: false
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  setupControls();
  loadSavedRows();
  renderPlayerDropdowns();
  renderRows();
  loadData();
});

function bindElements() {
  for (const id of [
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
  ]) {
    el[toCamel(id)] = document.getElementById(id);
  }
}

function setupControls() {
  renderHiddenPowerTypeOptions();
  el.entryAccount.addEventListener("change", handleEntryPlayerChange);
  el.rowPlayerFilter.addEventListener("change", handleRowPlayerFilterChange);
  el.entryName.addEventListener("input", () => {
    handlePokemonInput();
    renderPokemonSuggestions();
  });
  el.entryName.addEventListener("focus", renderPokemonSuggestions);
  el.entryName.addEventListener("keydown", handlePokemonSuggestionKeydown);
  el.entryName.addEventListener("blur", () => window.setTimeout(hidePokemonSuggestions, 120));
  el.entryForm.addEventListener("input", handlePokemonInput);
  el.entryFast.addEventListener("change", updateHiddenPowerTypeUI);
  el.entryHiddenPowerType.addEventListener("change", updateHiddenPowerTypeUI);
  el.entryCp.addEventListener("input", updateInference);
  el.entryCurrentHp.addEventListener("input", updateInference);
  el.entryShadow.addEventListener("change", refreshMoveOptions);
  el.entryPurified.addEventListener("change", refreshMoveOptions);
  el.applyInferenceButton.addEventListener("click", applySelectedInference);
  el.addEntryButton.addEventListener("click", saveCurrentEntry);
  el.resetEntryButton.addEventListener("click", resetForm);
  el.copyCsvButton.addEventListener("click", copyCSV);
  el.downloadCsvButton.addEventListener("click", downloadCSV);
  el.useRosterButton.addEventListener("click", useRosterInPlanners);
  el.clearRowsButton.addEventListener("click", () => clearRows("Rows cleared.", true));
  el.pokemonSuggestions.addEventListener("mousedown", event => event.preventDefault());
  el.pokemonSuggestions.addEventListener("click", handlePokemonSuggestionClick);
  el.manualRowsBody.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (button) {
      const index = Number(button.dataset.index);
      if (button.dataset.action === "edit") editRow(index);
      if (button.dataset.action === "remove") removeRow(index);
      return;
    }

    const row = event.target.closest("tr[data-row-index]");
    if (row) editRow(Number(row.dataset.rowIndex));
  });
  el.manualRowsBody.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const row = event.target.closest("tr[data-row-index]");
    if (!row) return;
    event.preventDefault();
    editRow(Number(row.dataset.rowIndex));
  });
}

function handleEntryPlayerChange() {
  const previousPlayer = state.lastSelectedPlayer || DEFAULT_PLAYER_NAMES[0];
  if (el.entryAccount.value === ADD_PLAYER_VALUE) {
    const playerName = normalizePlayerName(window.prompt("Player name"));
    if (!playerName) {
      renderPlayerDropdowns(previousPlayer);
      return;
    }
    addPlayerName(playerName);
    renderPlayerDropdowns(playerName);
    savePlayerNames();
    showMessage(`Added player ${playerName}.`, "success");
    return;
  }

  const playerName = normalizePlayerName(el.entryAccount.value) || DEFAULT_PLAYER_NAMES[0];
  state.lastSelectedPlayer = playerName;
  addPlayerName(playerName);
  savePlayerNames();
}

function handleRowPlayerFilterChange() {
  state.rowPlayerFilter = el.rowPlayerFilter.value || ALL_PLAYERS_VALUE;
  renderRows();
}

function renderPlayerDropdowns(selectedPlayer = el.entryAccount?.value || DEFAULT_PLAYER_NAMES[0]) {
  const currentPlayer = normalizePlayerName(selectedPlayer) || state.lastSelectedPlayer || DEFAULT_PLAYER_NAMES[0];
  const players = getPlayerNames();
  if (currentPlayer && !players.some(player => samePlayer(player, currentPlayer))) {
    players.push(currentPlayer);
  }
  state.playerNames = normalizePlayerList(players);
  state.lastSelectedPlayer = state.playerNames.find(player => samePlayer(player, currentPlayer)) || state.playerNames[0] || DEFAULT_PLAYER_NAMES[0];

  if (el.entryAccount) {
    el.entryAccount.innerHTML = [
      ...state.playerNames.map(player => `<option value="${escapeAttr(player)}">${escapeHtml(player)}</option>`),
      `<option value="${escapeAttr(ADD_PLAYER_VALUE)}">Add player...</option>`
    ].join("");
    el.entryAccount.value = state.lastSelectedPlayer;
  }

  if (el.rowPlayerFilter) {
    const filterValue = state.rowPlayerFilter || ALL_PLAYERS_VALUE;
    el.rowPlayerFilter.innerHTML = [
      `<option value="${escapeAttr(ALL_PLAYERS_VALUE)}">All players</option>`,
      ...state.playerNames.map(player => `<option value="${escapeAttr(player)}">${escapeHtml(player)}</option>`)
    ].join("");
    el.rowPlayerFilter.value = state.playerNames.some(player => samePlayer(player, filterValue)) ? filterValue : ALL_PLAYERS_VALUE;
    state.rowPlayerFilter = el.rowPlayerFilter.value;
  }
}

function addPlayerName(name) {
  const playerName = normalizePlayerName(name);
  if (!playerName) return "";
  const existing = state.playerNames.find(player => samePlayer(player, playerName));
  if (existing) return existing;
  state.playerNames = normalizePlayerList([...state.playerNames, playerName]);
  return playerName;
}

function getPlayerNames() {
  return normalizePlayerList([
    ...DEFAULT_PLAYER_NAMES,
    ...state.playerNames,
    ...state.rows.map(row => row.account)
  ]);
}

function normalizePlayerList(players) {
  const seen = new Set();
  const normalized = [];
  for (const value of players) {
    const player = normalizePlayerName(value);
    const key = cleanName(player);
    if (!player || seen.has(key)) continue;
    seen.add(key);
    normalized.push(player);
  }
  return normalized;
}

function normalizePlayerName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function samePlayer(a, b) {
  return cleanName(a) === cleanName(b);
}

async function loadData() {
  try {
    const pokemon = await fetchResource("pogo_pkm.min.json");
    state.allPokemon = pokemon.filter(p => p.released !== false);
    state.rosterPokemon = state.allPokemon
      .filter(p => !isMegaForm(p.form))
      .sort((a, b) => displayPokemonName(a).localeCompare(displayPokemonName(b)));
    state.pokemonIndex = buildPokemonIndex(state.rosterPokemon);
    state.ready = true;
    setStatus(`Ready: ${state.rosterPokemon.length.toLocaleString()} roster forms`, "ready");
    handlePokemonInput();
  } catch (error) {
    setStatus("Could not load Pokemon data", "error");
    showMessage(`Data load failed: ${error.message}`, "error");
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

function buildPokemonIndex(pokemon) {
  const index = new Map();
  for (const p of pokemon) {
    const keys = [
      p.name,
      displayPokemonName(p),
      `${p.name} ${p.form}`,
      `${p.form} ${p.name}`
    ];
    for (const key of keys) {
      const cleaned = cleanName(key);
      if (!index.has(cleaned)) index.set(cleaned, []);
      index.get(cleaned).push(p);
    }
  }
  return index;
}

function handlePokemonInput() {
  const rawName = el.entryName.value.trim();
  const shadowPrefix = /^\s*shadow\s+/i.test(rawName);
  const name = rawName.replace(/^\s*shadow\s+/i, "");
  const matches = state.pokemonIndex.get(cleanName(name)) || [];
  const selected = pickPokemonMatch(matches, el.entryForm.value);
  state.selectedPokemon = selected;
  if (shadowPrefix) el.entryShadow.checked = true;
  if (selected) {
    el.entryName.value = displayPokemonName(selected);
    el.entryForm.value = selected.form || "Normal";
  }
  refreshMoveOptions();
  renderPreview();
  updateInference();
}

function renderPokemonSuggestions() {
  const rawName = el.entryName.value.trim().replace(/^\s*shadow\s+/i, "");
  const query = cleanName(rawName);
  if (!state.ready || !query) {
    hidePokemonSuggestions();
    return;
  }

  const results = getPokemonSuggestionMatches(query);
  state.autocompleteResults = results;
  if (!results.length) {
    hidePokemonSuggestions();
    return;
  }

  if (state.activeSuggestionIndex < 0 || state.activeSuggestionIndex >= results.length) {
    state.activeSuggestionIndex = 0;
  }
  el.pokemonSuggestions.innerHTML = results.map((pokemon, index) => {
    const active = index === state.activeSuggestionIndex;
    return `<div class="autocomplete-option ${active ? "is-active" : ""}" role="option" aria-selected="${active ? "true" : "false"}" data-suggestion-index="${index}">
      <div class="pokemon-name">${escapeHtml(displayPokemonName(pokemon))}</div>
      <div class="subtle">${escapeHtml(formatPokemonSuggestionMeta(pokemon))}</div>
    </div>`;
  }).join("");
  el.pokemonSuggestions.classList.remove("is-hidden");
  el.entryName.setAttribute("aria-expanded", "true");
}

function getPokemonSuggestionMatches(query) {
  return state.rosterPokemon
    .map(pokemon => {
      const label = displayPokemonName(pokemon);
      const nameKey = cleanName(pokemon.name);
      const labelKey = cleanName(label);
      const formKey = cleanName(pokemon.form);
      const dexKey = String(pokemon.id);
      if (![nameKey, labelKey, formKey, dexKey].some(key => key.includes(query))) return null;
      const score =
        nameKey === query || labelKey === query ? 0 :
        nameKey.startsWith(query) || labelKey.startsWith(query) ? 1 :
        nameKey.includes(query) || labelKey.includes(query) ? 2 :
        formKey.includes(query) ? 3 :
        4;
      return {pokemon, label, score};
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.label.localeCompare(b.label))
    .slice(0, 12)
    .map(result => result.pokemon);
}

function formatPokemonSuggestionMeta(pokemon) {
  const parts = [];
  if (pokemon.form && pokemon.form !== "Normal") parts.push(pokemon.form.replaceAll("_", " "));
  if (pokemon.types?.length) parts.push(pokemon.types.join(" / "));
  parts.push(`#${paddedDexNumber(pokemon.id)}`);
  return parts.join(" · ");
}

function handlePokemonSuggestionClick(event) {
  const option = event.target.closest("[data-suggestion-index]");
  if (!option) return;
  selectPokemonSuggestion(Number(option.dataset.suggestionIndex));
}

function handlePokemonSuggestionKeydown(event) {
  if (el.pokemonSuggestions.classList.contains("is-hidden")) return;
  if (event.key === "Escape") {
    hidePokemonSuggestions();
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;
  event.preventDefault();
  if (event.key === "Enter") {
    selectPokemonSuggestion(state.activeSuggestionIndex);
    return;
  }
  const direction = event.key === "ArrowDown" ? 1 : -1;
  const count = state.autocompleteResults.length;
  state.activeSuggestionIndex = (state.activeSuggestionIndex + direction + count) % count;
  renderPokemonSuggestions();
}

function selectPokemonSuggestion(index) {
  const pokemon = state.autocompleteResults[index];
  if (!pokemon) return;
  el.entryName.value = displayPokemonName(pokemon);
  el.entryForm.value = pokemon.form || "Normal";
  hidePokemonSuggestions();
  handlePokemonInput();
  el.entryName.focus();
}

function hidePokemonSuggestions() {
  state.autocompleteResults = [];
  state.activeSuggestionIndex = -1;
  el.pokemonSuggestions.innerHTML = "";
  el.pokemonSuggestions.classList.add("is-hidden");
  el.entryName.setAttribute("aria-expanded", "false");
}

function pickPokemonMatch(matches, currentForm) {
  if (!matches.length) return null;
  const formKey = cleanName(currentForm);
  return matches.find(p => cleanName(p.form) === formKey) ||
    matches.find(p => p.form === "Normal") ||
    matches[0];
}

function refreshMoveOptions() {
  const pokemon = state.selectedPokemon;
  const fastValue = hiddenPowerBaseMoveName(el.entryFast.value);
  const hiddenPowerType = hiddenPowerTypeFromMoveName(el.entryFast.value) || el.entryHiddenPowerType.value;
  const chargedValue = el.entryCharged.value;
  const charged2Value = el.entryCharged2.value;
  const fastNames = pokemon ? getMoveNames(pokemon, "fm") : [];
  const chargedNames = pokemon ? getMoveNames(pokemon, "cm") : [];

  if (pokemon && el.entryPurified.checked && pokemon.shadow && !el.entryShadow.checked) {
    chargedNames.push("Return");
  }

  renderMoveSelect(el.entryFast, fastNames, fastValue);
  renderMoveSelect(el.entryCharged, chargedNames, chargedValue);
  renderMoveSelect(el.entryCharged2, chargedNames, charged2Value, "No second charged move");
  setHiddenPowerTypeValue(hiddenPowerType);
  updateHiddenPowerTypeUI();

  refreshMegaControls();
}

function renderMoveSelect(select, names, previousValue, emptyLabel = "Let evaluator choose") {
  const uniqueNames = unique(names).sort((a, b) => a.localeCompare(b));
  select.innerHTML = [
    `<option value="">${escapeHtml(emptyLabel)}</option>`,
    ...uniqueNames.map(name => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`)
  ].join("");
  if (uniqueNames.includes(previousValue)) {
    select.value = previousValue;
  } else {
    select.value = "";
  }
}

function refreshMegaControls(selectedTokens = selectedMegaFormTokens()) {
  const pokemon = state.selectedPokemon;
  const megaForms = pokemon ? getMegaForms(pokemon) : [];
  el.entryCanMegaWrap.classList.toggle("is-hidden", megaForms.length !== 1);
  el.entryMegaFormOptions.classList.toggle("is-hidden", megaForms.length <= 1);

  if (!megaForms.length) {
    el.entryCanMega.checked = false;
    el.entryMegaFormOptions.innerHTML = "";
    return;
  }

  if (megaForms.length === 1) {
    const checked = selectedTokens.length ? megaFormMatches(selectedTokens, megaForms[0]) : el.entryCanMega.checked;
    el.entryCanMega.checked = checked;
    el.entryMegaFormOptions.innerHTML = "";
    return;
  }

  const selected = selectedTokens.length
    ? selectedTokens
    : el.entryCanMega.checked
      ? megaForms.map(megaFormToken)
      : [];
  el.entryCanMega.checked = selected.length > 0;
  el.entryMegaFormOptions.innerHTML = `<div class="visual-section-label">Mega/Primal forms ready</div>
    ${megaForms.map(mega => {
      const token = megaFormToken(mega);
      const checked = megaFormMatches(selected, mega);
      return `<label class="check-field"><input type="checkbox" name="entry_mega_form" value="${escapeAttr(token)}" ${checked ? "checked" : ""}> ${escapeHtml(token)}</label>`;
    }).join("")}`;
}

function selectedMegaFormTokens() {
  const pokemon = state.selectedPokemon;
  const megaForms = pokemon ? getMegaForms(pokemon) : [];
  if (!megaForms.length) return [];
  if (megaForms.length === 1) return el.entryCanMega.checked ? [megaFormToken(megaForms[0])] : [];
  return [...el.entryMegaFormOptions.querySelectorAll('input[name="entry_mega_form"]:checked')]
    .map(input => input.value.trim())
    .filter(Boolean);
}

function renderHiddenPowerTypeOptions() {
  el.entryHiddenPowerType.innerHTML = [
    `<option value="">Choose type</option>`,
    ...HIDDEN_POWER_TYPES.map(type => `<option value="${escapeAttr(type)}">${escapeHtml(type)}</option>`)
  ].join("");
}

function updateHiddenPowerTypeUI() {
  const isHiddenPower = isHiddenPowerMove(el.entryFast.value);
  el.entryHiddenPowerWrap.classList.toggle("is-hidden", !isHiddenPower);
  el.entryHiddenPowerType.disabled = !isHiddenPower;
  if (!isHiddenPower) el.entryHiddenPowerType.value = "";
}

function setHiddenPowerTypeValue(type) {
  if (HIDDEN_POWER_TYPES.includes(type)) {
    el.entryHiddenPowerType.value = type;
  } else if (!isHiddenPowerMove(el.entryFast.value)) {
    el.entryHiddenPowerType.value = "";
  }
}

function selectedFastMoveName() {
  if (!isHiddenPowerMove(el.entryFast.value)) return el.entryFast.value;
  return el.entryHiddenPowerType.value ? `Hidden Power ${el.entryHiddenPowerType.value}` : "Hidden Power";
}

function setFastMoveFromSavedValue(value) {
  const hiddenPowerType = hiddenPowerTypeFromMoveName(value);
  el.entryFast.value = hiddenPowerType || cleanName(value) === "hiddenpower" ? "Hidden Power" : value;
  setHiddenPowerTypeValue(hiddenPowerType);
}

function hiddenPowerBaseMoveName(value) {
  return isHiddenPowerMove(value) ? "Hidden Power" : value;
}

function hiddenPowerTypeFromMoveName(value) {
  const text = String(value || "").trim();
  const match = text.match(/^Hidden Power\s+(.+)$/i);
  if (!match) return "";
  const type = HIDDEN_POWER_TYPES.find(candidate => cleanName(candidate) === cleanName(match[1]));
  return type || "";
}

function isHiddenPowerMove(value) {
  return cleanName(value).startsWith("hiddenpower");
}

function renderPreview() {
  const pokemon = state.selectedPokemon;
  if (!pokemon) {
    el.entryPreview.innerHTML = `<div class="sprite-placeholder">?</div>
      <div>
        <div class="pokemon-name">No Pokemon selected</div>
        <div class="subtle">Move options will appear after a match.</div>
      </div>`;
    return;
  }

  const megaForms = getMegaForms(pokemon).map(displayPokemonName).join(", ") || "No Mega/Primal form";
  el.entryPreview.innerHTML = `<img class="pokemon-sprite" src="${escapeAttr(pokemonImageUrl(pokemon))}" alt="${escapeAttr(displayPokemonName(pokemon))}" loading="eager" onerror="this.onerror=null;this.src='${escapeAttr(basePokemonImageUrl(pokemon))}'">
    <div>
      <div class="pokemon-name">${escapeHtml(displayPokemonName(pokemon))}</div>
      <div class="subtle">${escapeHtml((pokemon.types || []).join(" / "))}</div>
      <div class="subtle">Mega forms: ${escapeHtml(megaForms)}</div>
    </div>`;
}

function updateInference() {
  const pokemon = state.selectedPokemon;
  const cp = toInteger(el.entryCp.value);
  const hp = toInteger(el.entryCurrentHp.value);
  if (!pokemon || !cp || !hp) {
    state.inferenceMatches = [];
    renderInference("Choose a Pokemon and enter CP plus HP to find possible level and IV matches.");
    return;
  }

  const matches = inferLevelAndIVs(pokemon, cp, hp);
  state.inferenceMatches = matches;
  if (!matches.length) {
    renderInference(`No matches for CP ${cp.toLocaleString()} and HP ${hp}. Check the Pokemon, form, CP, or HP.`);
    return;
  }

  if (matches.length === 1) {
    applyInferenceMatch(matches[0]);
    renderInference(`1 exact match found and applied: ${formatInferenceLabel(matches[0])}.`);
    return;
  }

  renderInference(`${matches.length.toLocaleString()} possible matches. Pick the one that matches the in-game appraisal bars.`);
}

function renderInference(message) {
  el.inferenceSummary.textContent = message;
  el.inferenceSelect.disabled = state.inferenceMatches.length === 0;
  el.applyInferenceButton.disabled = state.inferenceMatches.length === 0;
  if (!state.inferenceMatches.length) {
    el.inferenceSelect.innerHTML = `<option value="">No matches</option>`;
    return;
  }

  el.inferenceSelect.innerHTML = state.inferenceMatches
    .slice(0, 300)
    .map((match, index) => `<option value="${index}">${escapeHtml(formatInferenceLabel(match))}</option>`)
    .join("");
}

function applySelectedInference() {
  const index = Number(el.inferenceSelect.value);
  const match = state.inferenceMatches[index];
  if (!match) return;
  applyInferenceMatch(match);
  showMessage(`Applied ${formatInferenceLabel(match)}.`, "success");
}

function applyInferenceMatch(match) {
  el.entryLevel.value = formatLevel(match.level);
  el.entryAtk.value = String(match.atk_iv);
  el.entryDef.value = String(match.def_iv);
  el.entryHp.value = String(match.hp_iv);
}

function inferLevelAndIVs(pokemon, cp, hp) {
  const matches = [];
  for (let halfLevel = 2; halfLevel <= 102; halfLevel += 1) {
    const level = halfLevel / 2;
    for (let hpIv = 0; hpIv <= 15; hpIv += 1) {
      const displayedHp = getPokemonDisplayedHP(pokemon, level, hpIv);
      if (displayedHp !== hp) continue;
      for (let atkIv = 0; atkIv <= 15; atkIv += 1) {
        for (let defIv = 0; defIv <= 15; defIv += 1) {
          const calculatedCp = getPokemonCP(getPokemonStats(pokemon, level, {atk: atkIv, def: defIv, hp: hpIv}));
          if (calculatedCp === cp) {
            matches.push({level, atk_iv: atkIv, def_iv: defIv, hp_iv: hpIv, cp, hp});
          }
        }
      }
    }
  }

  return matches.sort((a, b) =>
    a.level - b.level ||
    b.atk_iv - a.atk_iv ||
    b.def_iv - a.def_iv ||
    b.hp_iv - a.hp_iv
  );
}

function formatInferenceLabel(match) {
  return `Lv ${formatLevel(match.level)} · ${match.atk_iv}/${match.def_iv}/${match.hp_iv} IV · CP ${match.cp.toLocaleString()} · HP ${match.hp}`;
}

function saveCurrentEntry() {
  const row = collectFormRow();
  const validation = validateRow(row);
  if (validation) {
    showMessage(validation, "warning");
    return;
  }

  if (state.editingIndex === null) {
    state.rows.push(row);
    showMessage(`Added ${row.name}.`, "success");
  } else {
    state.rows[state.editingIndex] = row;
    showMessage(`Updated ${row.name}.`, "success");
  }

  addPlayerName(row.account);
  saveRows();
  const keepAccount = row.account;
  resetForm();
  renderPlayerDropdowns(keepAccount);
  renderRows();
}

function collectFormRow() {
  const rawName = el.entryName.value.trim();
  const shadowPrefix = /^\s*shadow\s+/i.test(rawName);
  const pokemon = state.selectedPokemon;
  const name = pokemon ? pokemon.name : rawName.replace(/^\s*shadow\s+/i, "");
  const form = (el.entryForm.value || pokemon?.form || "Normal").trim() || "Normal";
  const hasMega = pokemon ? getMegaForms(pokemon).length > 0 : false;
  const megaForms = hasMega ? selectedMegaFormTokens() : [];
  return {
    account: el.entryAccount.value.trim() || "Main",
    name,
    form,
    level: el.entryLevel.value.trim(),
    current_hp: el.entryCurrentHp.value.trim(),
    atk_iv: clampNumber(el.entryAtk.value, 0, 15, 15),
    def_iv: clampNumber(el.entryDef.value, 0, 15, 15),
    hp_iv: clampNumber(el.entryHp.value, 0, 15, 15),
    shadow: String(el.entryShadow.checked || shadowPrefix),
    purified: String(el.entryPurified.checked),
    fast_move: selectedFastMoveName(),
    charged_move: el.entryCharged.value,
    charged_move_2: el.entryCharged2.value,
    cp: el.entryCp.value.trim(),
    can_mega: String(hasMega && megaForms.length > 0),
    mega_forms: megaForms.join("|"),
    notes: el.entryNotes.value.trim()
  };
}

function validateRow(row) {
  if (!row.name) return "Enter a Pokemon name.";
  if (!row.cp && !row.level) return "Enter CP, level, or both.";
  if (row.fast_move === "Hidden Power") return "Choose a Hidden Power type.";
  return "";
}

function resetForm() {
  state.editingIndex = null;
  el.addEntryButton.textContent = "Add row";
  el.entryName.value = "";
  el.entryForm.value = "Normal";
  el.entryCp.value = "";
  el.entryCurrentHp.value = "";
  el.entryLevel.value = "";
  el.entryAtk.value = "15";
  el.entryDef.value = "15";
  el.entryHp.value = "15";
  el.entryShadow.checked = false;
  el.entryPurified.checked = false;
  el.entryCanMega.checked = false;
  el.entryMegaFormOptions.innerHTML = "";
  el.entryFast.value = "";
  el.entryHiddenPowerType.value = "";
  el.entryCharged.value = "";
  el.entryCharged2.value = "";
  el.entryNotes.value = "";
  state.selectedPokemon = null;
  hidePokemonSuggestions();
  updateHiddenPowerTypeUI();
  refreshMoveOptions();
  renderPreview();
  updateInference();
}

function editRow(index) {
  const row = state.rows[index];
  if (!row) return;
  state.editingIndex = index;
  el.addEntryButton.textContent = "Save changes";
  addPlayerName(row.account);
  renderPlayerDropdowns(row.account);
  el.entryName.value = displayRowName(row);
  el.entryForm.value = row.form || "Normal";
  el.entryCp.value = row.cp || "";
  el.entryCurrentHp.value = row.current_hp || "";
  el.entryLevel.value = row.level || "";
  el.entryAtk.value = row.atk_iv;
  el.entryDef.value = row.def_iv;
  el.entryHp.value = row.hp_iv;
  el.entryShadow.checked = parseBoolean(row.shadow);
  el.entryPurified.checked = parseBoolean(row.purified);
  el.entryNotes.value = row.notes || "";
  handlePokemonInput();
  setFastMoveFromSavedValue(row.fast_move || "");
  el.entryCharged.value = row.charged_move || "";
  el.entryCharged2.value = row.charged_move_2 || "";
  const savedMegaForms = parseMegaFormTokens(row.mega_forms);
  el.entryCanMega.checked = parseBoolean(row.can_mega);
  refreshMegaControls(savedMegaForms.length ? savedMegaForms : el.entryCanMega.checked && state.selectedPokemon ? getMegaForms(state.selectedPokemon).map(megaFormToken) : []);
  updateHiddenPowerTypeUI();
  renderRows();
  if (typeof el.entryName.focus === "function") el.entryName.focus();
  if (typeof el.entryName.scrollIntoView === "function") {
    el.entryName.scrollIntoView({block: "center", behavior: "smooth"});
  }
  showMessage(`Editing row ${index + 1}.`, "success");
}

function removeRow(index) {
  const row = state.rows[index];
  if (!row) return;
  state.rows.splice(index, 1);
  if (state.editingIndex === index) resetForm();
  if (state.editingIndex !== null && state.editingIndex > index) state.editingIndex -= 1;
  saveRows();
  renderPlayerDropdowns();
  renderRows();
  showMessage(`Removed ${row.name}.`, "success");
}

function clearRows(message = "Rows cleared.", requireConfirmation = false) {
  if (requireConfirmation && !confirmClearRows()) {
    showMessage("Clear cancelled.", "warning");
    return;
  }
  state.rows = [];
  state.editingIndex = null;
  clearSavedRows();
  renderRows();
  resetForm();
  showMessage(message, "success");
}

function confirmClearRows() {
  if (!state.rows.length) return true;
  return window.prompt("Type CLEAR to delete every saved manual roster row.") === "CLEAR";
}

function renderRows() {
  renderPlayerDropdowns();
  const csv = getManualCSV();
  el.manualCsvOutput.value = csv;
  el.manualRowCount.textContent = state.rows.length.toString();
  el.manualAccountCount.textContent = unique(state.rows.map(row => row.account)).length.toString();
  el.manualMegaCount.textContent = state.rows.filter(row => parseBoolean(row.can_mega)).length.toString();

  const indexedRows = state.rows.map((row, index) => ({row, index}));
  const visibleRows = state.rowPlayerFilter === ALL_PLAYERS_VALUE
    ? indexedRows
    : indexedRows.filter(item => samePlayer(item.row.account, state.rowPlayerFilter));

  if (!state.rows.length) {
    el.manualRowsBody.innerHTML = `<tr><td colspan="7" class="subtle">No manual rows yet.</td></tr>`;
    return;
  }

  if (!visibleRows.length) {
    el.manualRowsBody.innerHTML = `<tr><td colspan="7" class="subtle">No rows for ${escapeHtml(state.rowPlayerFilter)}.</td></tr>`;
    return;
  }

  el.manualRowsBody.innerHTML = visibleRows.map(({row, index}) => {
    const tags = [
      parseBoolean(row.shadow) ? "Shadow" : "",
      parseBoolean(row.purified) ? "Purified" : "",
      formatManualMegaTag(row)
    ].filter(Boolean).join(" / ") || "-";
    const isEditing = state.editingIndex === index;
    return `<tr class="${isEditing ? "is-editing" : ""}" data-row-index="${index}" tabindex="0" aria-label="Edit ${escapeAttr(displayRowName(row))}">
      <td>${escapeHtml(row.account)}</td>
      <td><div class="pokemon-name">${escapeHtml(displayRowName(row))}</div><div class="subtle">${escapeHtml(row.form || "Normal")}</div></td>
      <td>${escapeHtml(row.cp || "-")}<div class="subtle">HP ${escapeHtml(row.current_hp || "?")} · Lv ${escapeHtml(row.level || "?")}</div></td>
      <td>${escapeHtml(row.atk_iv)}/${escapeHtml(row.def_iv)}/${escapeHtml(row.hp_iv)}</td>
      <td>${escapeHtml(formatManualRowMoves(row))}</td>
      <td>${escapeHtml(tags)}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-action="edit" data-index="${index}">Edit</button>
          <button type="button" data-action="remove" data-index="${index}">Remove</button>
        </div>
      </td>
    </tr>`;
  }).join("");
}

function getManualCSV() {
  return state.rows.length ? serializeCSV([CSV_HEADERS, ...state.rows.map(rowToCSVCells)]) : "";
}

function rowToCSVCells(row) {
  return CSV_HEADERS.map(header => row[header] ?? "");
}

function formatManualRowMoves(row) {
  const chargedMoves = unique([row.charged_move, row.charged_move_2].map(move => String(move || "").trim()).filter(Boolean));
  return `${row.fast_move || "auto"} / ${chargedMoves.length ? chargedMoves.join(" + ") : "auto"}`;
}

function formatManualMegaTag(row) {
  if (!parseBoolean(row.can_mega)) return "";
  const forms = parseMegaFormTokens(row.mega_forms);
  return forms.length ? `Mega ready: ${forms.join(", ")}` : "Mega ready";
}

function copyCSV() {
  const csv = el.manualCsvOutput.value;
  if (!navigator.clipboard) {
    el.manualCsvOutput.focus();
    el.manualCsvOutput.select();
    showMessage("CSV selected.", "success");
    return;
  }
  navigator.clipboard.writeText(csv)
    .then(() => showMessage("CSV copied.", "success"))
    .catch(() => {
      el.manualCsvOutput.focus();
      el.manualCsvOutput.select();
      showMessage("CSV selected.", "success");
    });
}

function downloadCSV() {
  const blob = new Blob([el.manualCsvOutput.value], {type: "text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pokemon-raid-roster.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showMessage("CSV downloaded.", "success");
}

function useRosterInPlanners() {
  const csv = el.manualCsvOutput.value.trim();
  if (!saveSharedRosterText(csv, {keepBackup: true, pending: true})) {
    showMessage("Could not hand off through browser storage. Copy the CSV instead.", "warning");
    return;
  }
  showMessage("Roster saved for the type evaluator and raid boss calculator.", "success");
}

function saveSharedRosterText(csv, options = {}) {
  if (typeof localStorage === "undefined") return false;
  try {
    const text = String(csv || "").trim();
    if (options.keepBackup) backupSavedRosterText(text);
    localStorage.setItem(CURRENT_CSV_KEY, text);
    if (options.pending) localStorage.setItem(PENDING_CSV_KEY, text);
    if (text) localStorage.removeItem(SUPPRESS_SAMPLE_KEY);
    else localStorage.setItem(SUPPRESS_SAMPLE_KEY, "true");
    return true;
  } catch (error) {
    return false;
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

function loadSavedRows() {
  const savedPlayerNames = readSavedPlayerNames();
  const manualRows = readSavedManualRows();
  const sharedRows = readSharedRosterRows();
  state.rows = reconcileSavedRows(manualRows, sharedRows);
  state.playerNames = normalizePlayerList([
    ...DEFAULT_PLAYER_NAMES,
    ...savedPlayerNames,
    ...manualRows.map(row => row.account),
    ...sharedRows.map(row => row.account),
    ...state.rows.map(row => row.account)
  ]);
  state.lastSelectedPlayer = state.playerNames[0] || DEFAULT_PLAYER_NAMES[0];
}

function readSavedManualRows() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeStoredRow).filter(row => row.name) : [];
  } catch (error) {
    return [];
  }
}

function readSavedPlayerNames() {
  if (typeof localStorage === "undefined") return [];
  try {
    const saved = localStorage.getItem(PLAYER_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.map(normalizePlayerName).filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function readSharedRosterRows() {
  if (typeof localStorage === "undefined") return [];
  try {
    const csv = localStorage.getItem(CURRENT_CSV_KEY);
    return csv ? parseRosterCSVRows(csv) : [];
  } catch (error) {
    return [];
  }
}

function reconcileSavedRows(manualRows, sharedRows) {
  if (!sharedRows.length) return manualRows;
  if (!manualRows.length) return sharedRows;

  if (manualRows.length === sharedRows.length) {
    const aligned = manualRows.every((row, index) => rowIdentity(row) === rowIdentity(sharedRows[index]));
    if (aligned) {
      return sharedRows.map((row, index) => ({
        ...row,
        current_hp: manualRows[index].current_hp || row.current_hp
      }));
    }
  }

  backupManualRows(manualRows);
  return sharedRows;
}

function backupManualRows(rows) {
  if (typeof localStorage === "undefined" || !rows.length) return;
  try {
    localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(rows));
  } catch (error) {
    // The backup is only a guard before adopting shared roster edits.
  }
}

function rowIdentity(row) {
  return [row.account, row.name, row.form || "Normal", parseBoolean(row.shadow) ? "shadow" : "normal"]
    .map(cleanName)
    .join(":");
}

function saveRows(options = {}) {
  const syncShared = options.syncShared !== false;
  const keepBackup = options.keepBackup !== false;
  try {
    state.playerNames = normalizePlayerList([
      ...state.playerNames,
      ...state.rows.map(row => row.account)
    ]);
    savePlayerNames();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.rows));
    if (syncShared) saveSharedRosterText(getManualCSV(), {keepBackup});
  } catch (error) {
    showMessage("Rows are not being saved in this browser.", "warning");
  }
}

function savePlayerNames() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(state.playerNames));
  } catch (error) {
    // Player names can still be rebuilt from saved rows.
  }
}

function clearSavedRows() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PENDING_CSV_KEY);
  } catch (error) {
    // The in-memory rows are already cleared, so the page can still continue.
  }
}

function parseRosterCSVRows(text) {
  const table = parseCSV(text);
  if (table.length < 2) return [];
  const headers = table[0].map(normalizeHeader);
  const rows = [];
  for (let i = 1; i < table.length; i++) {
    const csvRow = table[i];
    if (csvRow.every(cell => !String(cell || "").trim())) continue;
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = String(csvRow[index] || "").trim();
    });
    const row = normalizeStoredRow(obj);
    if (row.name) rows.push(row);
  }
  return rows;
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
    lvl: "level", pokemonlevel: "level",
    currenthp: "current_hp", displayedhp: "current_hp", inbattlehp: "current_hp",
    attackiv: "atk_iv", atkiv: "atk_iv", atk: "atk_iv", attack: "atk_iv",
    defenseiv: "def_iv", defiv: "def_iv", def: "def_iv", defense: "def_iv",
    staminaiv: "hp_iv", staiv: "hp_iv", sta: "hp_iv", hpiv: "hp_iv", hp: "hp_iv",
    purified: "purified", purify: "purified", ispurified: "purified",
    canmega: "can_mega", canmegaevolve: "can_mega", megaeligible: "can_mega",
    megaevolve: "can_mega", megaevolution: "can_mega", canprimal: "can_mega",
    canprimalreversion: "can_mega", primalreversion: "can_mega",
    megaforms: "mega_forms", megaform: "mega_forms", megachoices: "mega_forms",
    megaoption: "mega_forms", megaoptions: "mega_forms", megaevolutions: "mega_forms",
    primalforms: "mega_forms",
    fast: "fast_move", fastmove: "fast_move", quickmove: "fast_move", quick: "fast_move",
    charged: "charged_move", chargemove: "charged_move", chargedmove: "charged_move", charge: "charged_move", special: "charged_move",
    charged2: "charged_move_2", chargemove2: "charged_move_2", chargedmove2: "charged_move_2",
    charge2: "charged_move_2", special2: "charged_move_2", secondcharged: "charged_move_2",
    secondchargedmove: "charged_move_2", chargedmoveii: "charged_move_2"
  };
  return aliases[key] || key;
}

function normalizeStoredRow(row = {}) {
  const name = String(row.name || row.pokemon || "").trim().replace(/^\s*shadow\s+/i, "");
  const shadowPrefix = /^\s*shadow\s+/i.test(String(row.name || row.pokemon || ""));
  return {
    account: String(row.account || "Main").trim() || "Main",
    name,
    form: String(row.form || "Normal").trim() || "Normal",
    level: String(row.level || "").trim(),
    current_hp: String(row.current_hp || "").trim(),
    atk_iv: clampNumber(row.atk_iv, 0, 15, 15),
    def_iv: clampNumber(row.def_iv, 0, 15, 15),
    hp_iv: clampNumber(row.hp_iv, 0, 15, 15),
    shadow: String(parseBoolean(row.shadow) || shadowPrefix),
    purified: String(parseBoolean(row.purified)),
    fast_move: String(row.fast_move || "").trim(),
    charged_move: String(row.charged_move || "").trim(),
    charged_move_2: String(row.charged_move_2 || "").trim(),
    cp: String(row.cp || "").trim(),
    can_mega: String(parseBoolean(row.can_mega)),
    mega_forms: String(row.mega_forms || "").trim(),
    notes: String(row.notes || "").trim()
  };
}

function showMessage(text, type = "") {
  el.manualMessages.innerHTML = `<p class="${escapeAttr(type)}">${escapeHtml(text)}</p>`;
}

function setStatus(text, kind = "") {
  el.manualStatus.textContent = text;
  el.manualStatus.className = `status-pill ${kind}`.trim();
}

function getMoveNames(pokemon, key) {
  const names = [...(pokemon[key] || []), ...(key === "fm" ? pokemon.elite_fm || [] : pokemon.elite_cm || [])];
  if (key === "fm" && Array.isArray(pokemon.fm_add)) names.push(...pokemon.fm_add);
  if (key === "cm" && Array.isArray(pokemon.cm_add)) names.push(...pokemon.cm_add);
  if (key === "cm" && pokemon.form === "S" && pokemon.id === 249) names.push("Aeroblast Plus", "Aeroblast Plus Plus");
  if (key === "cm" && pokemon.form === "S" && pokemon.id === 250) names.push("Sacred Fire Plus", "Sacred Fire Plus Plus");
  const removed = key === "fm" ? pokemon.fm_rem || [] : pokemon.cm_rem || [];
  return names.filter(name => name && !removed.includes(name));
}

function getMegaForms(pokemon) {
  return state.allPokemon.filter(candidate => candidate.id === pokemon.id && isMegaForm(candidate.form));
}

function parseMegaFormTokens(value) {
  return unique(String(value || "")
    .split(/[|;,/]/)
    .map(token => token.trim())
    .filter(Boolean));
}

function megaFormToken(pokemon) {
  return pokemon?.name || "";
}

function megaFormMatches(tokens, mega) {
  const keys = megaFormKeys(mega);
  return tokens.some(token => keys.includes(cleanName(token)));
}

function megaFormKeys(mega) {
  const keys = [
    mega.form || "",
    mega.name || "",
    displayPokemonName(mega),
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

function getPokemonStats(pokemon, level, ivs) {
  const cpm = getCPM(level);
  const base = pokemon.stats;
  return {
    atk: (base.baseAttack + ivs.atk) * cpm,
    def: (base.baseDefense + ivs.def) * cpm,
    hp: (base.baseStamina + ivs.hp) * cpm
  };
}

function getPokemonDisplayedHP(pokemon, level, hpIv) {
  return Math.max(10, Math.floor(getPokemonStats(pokemon, level, {atk: 0, def: 0, hp: hpIv}).hp));
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

function displayPokemonName(pokemon) {
  if (!pokemon) return "";
  const form = pokemon.form && pokemon.form !== "Normal" ? ` (${pokemon.form.replaceAll("_", " ")})` : "";
  return `${pokemon.name}${form}`;
}

function displayRowName(row) {
  const form = row.form && row.form !== "Normal" ? ` (${row.form.replaceAll("_", " ")})` : "";
  return `${parseBoolean(row.shadow) ? "Shadow " : ""}${row.name}${form}`;
}

function serializeCSV(rows) {
  return rows
    .map(row => row.map(serializeCSVCell).join(","))
    .join("\n");
}

function serializeCSVCell(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
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

function paddedDexNumber(id) {
  return String(id).padStart(3, "0");
}

function formatLevel(level) {
  return Number.isInteger(level) ? String(level) : level.toFixed(1);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(fallback);
  return String(Math.min(max, Math.max(min, number)));
}

function toInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function parseBoolean(value) {
  return /^(true|yes|y|1|shadow)$/i.test(String(value || "").trim());
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}
