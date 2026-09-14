const TYPES = [
  "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison",
  "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
  "Steel", "Fairy"
];

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
const RAID_BOSS_TIERS = new Set([4, 5, 6, 7]);
const RAID_TIER_CONFIGS = new Map([
  [4, {tier: 4, label: "Tier-4 Mega", hp: 9000, timer: 300, cpm: 0.79, energyRace: true}],
  [5, {tier: 5, label: "Tier-5", hp: 15000, timer: 300, cpm: 0.79, energyRace: false}],
  [6, {tier: 6, label: "Tier-6 Mega/Primal", hp: 22500, timer: 300, cpm: 0.79, energyRace: true}],
  [7, {tier: 7, label: "Tier-7", hp: 20000, timer: 300, cpm: 1.0, energyRace: false}]
]);
// DialgaDex marks several 2026 debuts as tier 8 Super Mega forms, but the
// Mega Ascension rotation uses them as standard Mega Raids.
const RAID_BOSS_TIER_OVERRIDES = new Map([
  ["26:Mega:megaraichux", 4],
  ["26:MegaY:megaraichuy", 4],
  ["71:Mega:megavictreebel", 4],
  ["149:Mega:megadragonite", 4],
  ["227:Mega:megaskarmory", 4],
  ["687:Mega:megamalamar", 4],
  ["870:Mega:megafalinks", 4]
]);
const DEFAULT_RAID_TIER_CONFIG = RAID_TIER_CONFIGS.get(5);
const REGULAR_MEGA_FIELD_UPTIME = 0.35;
const ADVENTURE_ATTACK_MULTIPLIER = Math.fround(1.1);
const ADVENTURE_DEFENSE_MULTIPLIER = Math.fround(1.1);
const ADVENTURE_MEWTWO_X_MEGA_DAMAGE_MULTIPLIER = Math.fround(1.15);
const SHADOW_GEMS_PER_PLAYER = 4;
const SHADOW_GEM_PLAYERS = 2;
const SHADOW_TOTAL_GEMS = SHADOW_GEMS_PER_PLAYER * SHADOW_GEM_PLAYERS;
const SHADOW_ATTACK_MULTIPLIER = Math.fround(1.2);
const SHADOW_DAMAGE_TAKEN_MULTIPLIER = Math.fround(1.2);

const FIELDLESS_MEGA_BOOSTS = new Map([
  ["383:Mega", ["Fire", "Grass", "Ground"]],
  ["382:Mega", ["Water", "Electric", "Bug"]],
  ["384:Mega", ["Flying", "Psychic", "Dragon"]]
]);

const RAID_SAMPLE_CSV = `account,name,form,level,atk_iv,def_iv,hp_iv,shadow,purified,fast_move,charged_move,charged_move_2,cp,can_mega,notes
Main,Groudon,Normal,41,15,14,15,false,false,Mud Shot,Precipice Blades,Fire Punch,,true,Primal background option
Main,Kartana,Normal,35,15,13,14,false,false,Razor Leaf,Leaf Blade,,,false,Grass damage
Main,Rhyperior,Normal,40,15,14,14,false,false,Mud-Slap,Rock Wrecker,,,false,Rock/Ground coverage
Main,Terrakion,Normal,36,15,13,13,false,false,Double Kick,Sacred Sword,,,false,Fighting
Main,Metagross,Normal,38,15,15,14,true,false,Bullet Punch,Meteor Mash,,,false,Steel
Main,Rayquaza,Normal,35,15,12,13,false,false,Dragon Tail,Dragon Ascent,Outrage,,true,Mega Ray option
Main,Sceptile,Normal,32,14,14,13,false,false,Bullet Seed,Frenzy Plant,,,true,Grass mega option
Main,Dialga,Normal,35,15,13,13,false,false,Metal Claw,Iron Head,,,false,Steel Dragon
Main,Gardevoir,Normal,34,15,12,15,false,false,Charm,Dazzling Gleam,,,true,Fairy mega option
Main,Xerneas,Normal,33,14,14,14,false,false,Tackle,Moonblast,,,false,Fairy coverage
Alt,Kyogre,Normal,40,15,14,15,false,false,Waterfall,Origin Pulse,Surf,,true,Primal background option
Alt,Mamoswine,Normal,37,15,12,14,true,false,Powder Snow,Avalanche,,,false,Ice
Alt,Garchomp,Normal,36,15,13,12,false,false,Mud Shot,Earth Power,,,true,Ground mega option
Alt,Zekrom,Normal,35,14,14,15,false,false,Charge Beam,Fusion Bolt,Wild Charge,,false,Electric
Alt,Lucario,Normal,35,15,13,13,false,false,Force Palm,Aura Sphere,,,true,Fighting mega option
Alt,Tyranitar,Normal,36,14,15,14,false,false,Smack Down,Stone Edge,Brutal Swing,,true,Rock/Dark mega option
Alt,Reshiram,Normal,34,14,13,15,false,false,Fire Fang,Fusion Flare,Overheat,,false,Fire
Alt,Dialga,Normal,34,14,14,13,false,false,Metal Claw,Iron Head,,,false,Steel Dragon
Alt,Metagross,Normal,35,15,13,14,false,false,Bullet Punch,Meteor Mash,,,true,Steel mega option
Alt,Gardevoir,Normal,33,14,13,15,false,false,Charm,Dazzling Gleam,,,true,Fairy mega option`;

const state = {
  pokemon: [],
  raidBosses: [],
  raidBossGroups: [],
  fastMoves: [],
  chargedMoves: [],
  moveByName: new Map(),
  pokemonNameIndex: new Map(),
  bossGroupByKey: new Map(),
  currentPlan: null,
  currentRosterEntries: [],
  currentUsableEntries: [],
  currentUsableByUid: new Map(),
  currentSettings: null,
  expandedRosterUid: null,
  rosterSearch: "",
  pendingMessage: null,
  quickEditRowNumber: null,
  quickEditSource: "",
  adventureEffects: new Map(),
  previewingSample: false,
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
  ]) {
    el[toCamel(id)] = document.getElementById(id);
  }
}

function setupControls() {
  el.raidCsvFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setRosterText(await file.text());
    rememberRosterText(el.raidRosterInput.value, true);
    calculate();
  });

  el.raidSampleButton.addEventListener("click", () => {
    previewSampleRoster(RAID_SAMPLE_CSV);
  });

  el.raidCalculateButton.addEventListener("click", calculate);
  el.raidRosterInput.addEventListener("input", () => {
    rememberRosterText(el.raidRosterInput.value, state.previewingSample);
    state.previewingSample = false;
  });
  el.bossSelect.addEventListener("change", () => {
    updateBossShadowToggle();
    renderBossMoveOptions(getSelectedBoss());
    calculate();
  });
  el.bossShadowToggle.addEventListener("change", () => {
    renderBossMoveOptions(getSelectedBoss());
    calculate();
  });
  el.raidResults.addEventListener("click", handlePokemonCardClick);
  el.raidRosterBox.addEventListener("click", handleRosterBoxClick);
  el.raidRosterBox.addEventListener("input", handleRosterEditInput);
  el.raidRosterSearch.addEventListener("input", () => {
    state.rosterSearch = el.raidRosterSearch.value.trim();
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
  el.raidAdventureEffectsBody.addEventListener("change", event => {
    if (!event.target?.classList?.contains("adventure-effect-toggle")) return;
    setAdventureEffectForAccount(event.target.dataset.account, event.target.dataset.effect, event.target.checked);
    calculate();
  });

  for (const input of [
    el.bossFastMove, el.bossChargedMove, el.raidMetricSelect, el.raidPartySize,
    el.raidRelobbyTime, el.raidUpgradeLevel, el.raidAllowElite, el.raidUseCurrentMoves
  ]) {
    input.addEventListener("change", calculate);
  }
}

async function loadData() {
  setStatus("Loading raid data...");
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
    state.raidBossGroups = buildRaidBossGroups(state.pokemon);
    state.raidBosses = state.raidBossGroups.map(group => group.base);
    state.bossGroupByKey = new Map(state.raidBossGroups.map(group => [group.key, group]));
    renderBossSelect();
    renderBossMoveOptions(getSelectedBoss());
    state.ready = true;
    setStatus(`Ready: ${state.raidBossGroups.length.toLocaleString()} raid bosses`, "ready");
    calculate();
  } catch (error) {
    setStatus("Could not load raid data", "error");
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

function buildRaidBossList(pokemon) {
  return buildRaidBossGroups(pokemon).map(group => group.base);
}

function buildRaidBossGroups(pokemon) {
  const groups = new Map();
  for (const boss of pokemon) {
    const raidTier = getRaidBossTier(boss);
    if (!RAID_BOSS_TIERS.has(raidTier)) continue;
    const key = raidBossGroupKey(boss);
    if (!groups.has(key)) {
      groups.set(key, {key, normal: null, shadow: null, base: null});
    }
    const group = groups.get(key);
    if (boss.shadow) group.shadow = boss;
    else group.normal = boss;
  }

  return [...groups.values()]
    .map(group => {
      group.base = group.normal || makeNonShadowBoss(group.shadow);
      group.tier = getRaidBossTier(group.base);
      return group;
    })
    .filter(group => group.base)
    .sort((a, b) => a.tier - b.tier || bossSortLabel(a.base).localeCompare(bossSortLabel(b.base)));
}

function makeNonShadowBoss(boss) {
  return boss ? {...boss, shadow: false} : null;
}

function renderBossSelect() {
  const preferred = state.raidBossGroups.find(group => group.base.name === "Kyurem" && group.base.form === "Normal") ||
    state.raidBossGroups.find(group => group.base.name === "Mewtwo" && group.base.form === "Normal") ||
    state.raidBossGroups[0];
  el.bossSelect.innerHTML = state.raidBossGroups
    .map(group => `<option value="${escapeAttr(group.key)}">${escapeHtml(raidBossOptionLabel(group))}</option>`)
    .join("");
  if (preferred) el.bossSelect.value = preferred.key;
  updateBossShadowToggle();
}

function renderBossMoveOptions(boss) {
  if (!boss) {
    el.bossFastMove.innerHTML = "";
    el.bossChargedMove.innerHTML = "";
    return;
  }
  const fastValue = el.bossFastMove.value;
  const chargedValue = el.bossChargedMove.value;
  el.bossFastMove.innerHTML = [`<option value="">Any fast move</option>`, ...unique(boss.fm || []).map(name => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`)].join("");
  el.bossChargedMove.innerHTML = [`<option value="">Any charged move</option>`, ...unique(boss.cm || []).map(name => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`)].join("");
  if ([...el.bossFastMove.options].some(option => option.value === fastValue)) el.bossFastMove.value = fastValue;
  if ([...el.bossChargedMove.options].some(option => option.value === chargedValue)) el.bossChargedMove.value = chargedValue;
}

function getSelectedBoss() {
  const group = getSelectedBossGroup();
  if (!group) return null;
  return el.bossShadowToggle.checked && group.shadow ? group.shadow : group.base;
}

function getSelectedBossGroup() {
  return state.bossGroupByKey.get(el.bossSelect.value) || state.raidBossGroups[0] || null;
}

function updateBossShadowToggle() {
  if (!el.bossShadowToggle) return;
  const group = getSelectedBossGroup();
  const canUseShadow = Boolean(group?.shadow);
  el.bossShadowToggle.disabled = !canUseShadow;
  if (!canUseShadow) el.bossShadowToggle.checked = false;
  const label = el.bossShadowToggle.closest ? el.bossShadowToggle.closest("label") : null;
  if (label) label.classList.toggle("is-disabled", !canUseShadow);
}

function calculate() {
  if (!state.ready) return;

  const rows = parseRoster(el.raidRosterInput.value);
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

    usableEntries.push({
      ...entry,
      uid: entry.rowNumber,
      pokemon: resolved.pokemon,
      shadow: resolved.shadow,
      level: levelResult.level,
      levelNote: levelResult.note
    });
  }

  renderAdventureEffectControls(unique(usableEntries.map(entry => entry.account)));
  const settings = readSettings();
  const boss = getSelectedBoss();
  const plan = boss ? buildRaidPlan(usableEntries, boss, settings) : null;
  state.currentPlan = plan;
  state.currentRosterEntries = rows.entries;
  state.currentUsableEntries = usableEntries;
  state.currentUsableByUid = new Map(usableEntries.map(entry => [entry.uid, entry]));
  state.currentSettings = settings;
  renderResults(plan, rows.entries.length, usableEntries.length, messages, settings);
}

function readSettings() {
  return {
    metric: el.raidMetricSelect.value,
    partySize: Number(el.raidPartySize.value),
    teamSize: 6,
    relobbyTime: Number(el.raidRelobbyTime.value || 10),
    upgradeLevel: clamp(toNumber(el.raidUpgradeLevel.value, 40), 1, 51),
    allowElite: el.raidAllowElite.checked,
    useCurrentMoves: el.raidUseCurrentMoves.checked,
    bossFastMove: el.bossFastMove.value,
    bossChargedMove: el.bossChargedMove.value,
    requireEffective: true,
    boostSources: [],
    accountEffects: readAdventureEffectSettings()
  };
}

function readAdventureEffectSettings() {
  const effects = new Map(state.adventureEffects);
  const inputs = el.raidAdventureEffectsBody?.querySelectorAll
    ? el.raidAdventureEffectsBody.querySelectorAll(".adventure-effect-toggle")
    : [];
  for (const input of inputs) {
    setAdventureEffectValue(effects, input.dataset.account, input.dataset.effect, input.checked);
  }
  state.adventureEffects = effects;
  return effects;
}

function renderAdventureEffectControls(accounts) {
  if (!el.raidAdventureEffectsBody) return;
  const activeAccounts = unique(accounts.filter(Boolean));
  readAdventureEffectSettings();
  if (!activeAccounts.length) {
    el.raidAdventureEffectsBody.innerHTML = `<div class="visual-empty">No accounts loaded yet.</div>`;
    return;
  }

  for (const account of activeAccounts) {
    if (!state.adventureEffects.has(account)) {
      state.adventureEffects.set(account, makeAdventureEffectState());
    }
  }

  el.raidAdventureEffectsBody.innerHTML = activeAccounts.map(account => {
    const effects = getAdventureEffectsForAccount(account, {accountEffects: state.adventureEffects});
    return `<div class="adventure-effect-row">
      <strong>${escapeHtml(account)}</strong>
      <label><input class="adventure-effect-toggle" type="checkbox" data-account="${escapeAttr(account)}" data-effect="zacianBlade" ${effects.zacianBlade ? "checked" : ""}> Zacian attack</label>
      <label><input class="adventure-effect-toggle" type="checkbox" data-account="${escapeAttr(account)}" data-effect="zamazentaBash" ${effects.zamazentaBash ? "checked" : ""}> Zamazenta defense</label>
      <label><input class="adventure-effect-toggle" type="checkbox" data-account="${escapeAttr(account)}" data-effect="mewtwoXDynamicPunch" ${effects.mewtwoXDynamicPunch ? "checked" : ""}> Mewtwo X Mega damage</label>
    </div>`;
  }).join("");
}

function setAdventureEffectForAccount(account, effect, checked) {
  const effects = new Map(state.adventureEffects);
  setAdventureEffectValue(effects, account, effect, checked);
  state.adventureEffects = effects;
}

function setAdventureEffectValue(effects, account, effect, checked) {
  if (!account || !effect) return;
  const current = effects.get(account) || makeAdventureEffectState();
  effects.set(account, {
    ...current,
    [effect]: Boolean(checked)
  });
}

function makeAdventureEffectState() {
  return {zacianBlade: false, zamazentaBash: false, mewtwoXDynamicPunch: false};
}

function withAccountEffects(settings, account) {
  return {
    ...settings,
    adventureEffects: getAdventureEffectsForAccount(account, settings)
  };
}

function getAdventureEffectsForAccount(account, settings) {
  return {
    ...makeAdventureEffectState(),
    ...(settings?.accountEffects?.get(account) || {})
  };
}

function buildRaidPlan(usableEntries, boss, settings) {
  const enemy = buildRaidBossEnemy(boss, settings);
  const accounts = unique(usableEntries.map(entry => entry.account));
  if (!accounts.length) {
    return {boss, enemy, accounts: [], accountPlans: [], selectedMegas: [], combinedMetric: 0, combinedDps: 0, estimatedTTW: null};
  }

  const entriesByAccount = new Map(accounts.map(account => [
    account,
    usableEntries.filter(entry => entry.account === account)
  ]));
  const choiceLimit = accounts.length > 2 ? 4 : 8;
  const candidatesByAccount = new Map(accounts.map(account => [
    account,
    getMegaCandidates(entriesByAccount.get(account), enemy, withAccountEffects(settings, account), choiceLimit)
  ]));

  let best = null;
  for (const combo of generateMegaCombos(accounts, candidatesByAccount)) {
    const summary = buildComboPlan(accounts, entriesByAccount, combo, enemy, settings, false);
    if (!best || summary.combinedMetric > best.combinedMetric) best = {combo, summary};
  }

  return best
    ? buildComboPlan(accounts, entriesByAccount, best.combo, enemy, settings, true)
    : {boss, enemy, accounts, accountPlans: [], selectedMegas: [], combinedMetric: 0, combinedDps: 0, estimatedTTW: null};
}

function generateMegaCombos(accounts, candidatesByAccount) {
  let combos = [new Map()];
  for (const account of accounts) {
    const choices = candidatesByAccount.get(account) || [makeNoMegaCandidate(account)];
    const next = [];
    for (const combo of combos) {
      for (const candidate of choices) {
        const copy = new Map(combo);
        copy.set(account, candidate);
        next.push(copy);
      }
    }
    combos = next;
  }
  return combos;
}

function buildComboPlan(accounts, entriesByAccount, combo, enemy, settings, includeUpgrades) {
  const selectedMegas = accounts
    .map(account => combo.get(account))
    .filter(candidate => candidate && !candidate.isNone);
  const boostSources = selectedMegas.map(megaBoostSource);
  const accountPlans = [];

  for (const account of accounts) {
    const entries = entriesByAccount.get(account) || [];
    const selectedMega = combo.get(account);
    const activeMega = selectedMega && !selectedMega.isNone ? selectedMega : null;
    const selectedUid = activeMega?.entry?.uid || null;
    const slotSources = boostSources.filter(source => source.key !== activeMega?.candidateKey);
    const accountSettings = withAccountEffects(settings, account);
    const slot0 = activeMega ? rankMegaCandidate(activeMega, enemy, accountSettings, slotSources) : null;
    const regularSettings = {...accountSettings, boostSources, requireEffective: true};
    const results = entries
      .filter(entry => entry.uid !== selectedUid)
      .map(entry => {
        const ranking = rankPokemon(entry.pokemon, entry, enemy, regularSettings);
        if (!ranking) return null;
        ranking.account = account;
        ranking.entry = entry;
        return ranking;
      })
      .filter(Boolean)
      .sort((a, b) => b.metric - a.metric);

    const activeRegularCount = slot0 ? 5 : 6;
    const best = results[0]?.metric || 0;
    results.forEach((result, index) => {
      result.accountRank = index + 1;
      result.inActiveRegularTeam = index < activeRegularCount;
      result.relative = best > 0 ? 100 * result.metric / best : 0;
    });

    const activeRegulars = results.slice(0, activeRegularCount);
    const activeMembers = [slot0, ...activeRegulars].filter(Boolean);
    const topSix = results.slice(0, 6);
    const cutoff = results[activeRegularCount - 1]?.metric || 0;
    const currentByEntry = new Map(results.map(result => [result.entry.uid, result]));
    const group = {
      account,
      cutoff,
      cutoffSlot: activeRegularCount,
      best,
      activeRegularCount,
      activeEntryUids: new Set(activeRegulars.map(result => result.entry.uid))
    };
    const upgrades = includeUpgrades
      ? entries
        .filter(entry => entry.uid !== selectedUid)
        .flatMap(entry => collectRaidUpgradeCandidatesForEntry(entry, currentByEntry.get(entry.uid) || null, group, enemy, regularSettings))
        .sort(sortUpgradeCandidates)
      : [];

    const plan = {
      account,
      adventureEffects: accountSettings.adventureEffects,
      slot0,
      selectedMega: activeMega,
      boostSources,
      topSix,
      activeRegulars,
      activeMembers,
      activeRegularCount,
      cutoff,
      cutoffSlot: activeRegularCount,
      upgrades,
      teamMetric: averageValue(activeMembers, result => result.metric),
      teamDps: averageValue(activeMembers, result => result.dps)
    };
    accountPlans.push(plan);
  }

  const combinedMetric = accountPlans.reduce((sum, plan) => sum + plan.teamMetric, 0);
  const combinedDps = accountPlans.reduce((sum, plan) => sum + plan.teamDps, 0);
  const bossHp = enemy.stats.hp;
  const bossTimer = getRaidTierConfig(enemy.boss).timer;
  accountPlans.forEach(plan => {
    plan.estimatedDamage = plan.teamDps * bossTimer;
    plan.bossHealthPercent = bossHp > 0 ? 100 * plan.estimatedDamage / bossHp : 0;
  });
  return {
    boss: enemy.boss,
    enemy,
    accounts,
    accountPlans,
    selectedMegas,
    boostSources,
    combinedMetric,
    combinedDps,
    estimatedTTW: combinedDps > 0 ? enemy.stats.hp / combinedDps : null
  };
}

function getMegaCandidates(accountEntries, enemy, settings, limit) {
  const noMega = makeNoMegaCandidate(accountEntries[0]?.account || "Account");
  const candidates = [];
  for (const entry of accountEntries) {
    if (entry.shadow || !entry.canMega) continue;
    for (const mega of getEligibleMegaForms(entry)) {
      const priority = getMegaPriority(mega, enemy);
      const candidate = {
        account: entry.account,
        entry,
        pokemon: mega,
        candidateKey: `${entry.account}:${entry.uid}:${mega.id}:${mega.form}`,
        megaPriority: priority,
        boostTypes: getMegaBoostTypes(mega),
        isFieldless: getFieldlessBoostTypes(mega).length > 0
      };
      const ranking = rankMegaCandidate(candidate, enemy, settings, []);
      if (!ranking) continue;
      candidate.baseResult = ranking;
      candidate.metric = ranking.metric;
      candidate.scoreForSort = priority * 100000 + ranking.metric;
      candidates.push(candidate);
    }
  }

  const sorted = candidates
    .sort((a, b) => b.scoreForSort - a.scoreForSort || b.metric - a.metric)
    .slice(0, Math.max(1, limit));
  return sorted.length ? sorted : [noMega];
}

function makeNoMegaCandidate(account) {
  return {account, isNone: true, candidateKey: `${account}:none`, metric: 0, scoreForSort: 0};
}

function rankMegaCandidate(candidate, enemy, settings, boostSources) {
  const entry = {
    ...candidate.entry,
    pokemon: candidate.pokemon,
    shadow: false
  };
  let ranking = rankPokemon(candidate.pokemon, entry, enemy, {
    ...settings,
    boostSources,
    requireEffective: true
  });
  if (!ranking && candidate.megaPriority > 0) {
    ranking = rankPokemon(candidate.pokemon, entry, enemy, {
      ...settings,
      boostSources,
      requiredAttackType: null,
      requireEffective: false
    });
  }
  if (!ranking) return null;
  ranking.account = candidate.entry.account;
  ranking.entry = candidate.entry;
  ranking.megaPriority = candidate.megaPriority;
  ranking.megaBoostTypes = candidate.boostTypes;
  ranking.isFieldlessMega = candidate.isFieldless;
  ranking.candidateKey = candidate.candidateKey;
  return ranking;
}

function megaBoostSource(candidate) {
  const fieldlessTypes = getFieldlessBoostTypes(candidate.pokemon);
  const isFieldless = fieldlessTypes.length > 0;
  const boostTypes = isFieldless ? fieldlessTypes : candidate.pokemon.types;
  return {
    key: candidate.candidateKey,
    account: candidate.account,
    pokemon: candidate.pokemon,
    boostTypes,
    isFieldless,
    uptime: isFieldless ? 1 : REGULAR_MEGA_FIELD_UPTIME
  };
}

function getRaidMoveBoost(moveType, sources) {
  let best = 1;
  for (const source of sources || []) {
    const raw = source.boostTypes.includes(moveType) ? 1.3 : 1.1;
    const weighted = 1 + (raw - 1) * source.uptime;
    if (weighted > best) best = weighted;
  }
  return Math.fround(best);
}

function getAdventureDamageMultiplier(adventureEffects, enemy) {
  if (adventureEffects?.mewtwoXDynamicPunch && isMegaEnergyRaidBoss(enemy?.boss)) {
    return ADVENTURE_MEWTWO_X_MEGA_DAMAGE_MULTIPLIER;
  }
  return 1;
}

function buildRaidBossEnemy(boss, settings) {
  const stats = getRaidStats(boss);
  const fastNames = settings.bossFastMove ? [settings.bossFastMove] : boss.fm || [];
  const chargedNames = settings.bossChargedMove ? [settings.bossChargedMove] : boss.cm || [];
  const enemyYs = getMovesetYs(boss.types, stats.atk, fastNames, chargedNames);
  return {
    boss,
    types: boss.types,
    stats,
    weakness: new Map(TYPES.map(attackerType => [attackerType, effectiveness(attackerType, boss.types)])),
    enemyYs: enemyYs.length ? enemyYs : [{Any: {y_num: null, cm_num: null}}],
    label: displayBossName(boss)
  };
}

function getBattleStats(pokemon, entry, adventureEffects = makeAdventureEffectState()) {
  const stats = getPokemonStats(pokemon, entry.level, entry.ivs, true);
  let atk = stats.atk;
  let def = stats.def;
  if (entry.shadow) {
    atk *= SHADOW_ATTACK_MULTIPLIER;
    def /= SHADOW_DAMAGE_TAKEN_MULTIPLIER;
  }
  if (adventureEffects.zacianBlade) atk *= ADVENTURE_ATTACK_MULTIPLIER;
  if (adventureEffects.zamazentaBash) def *= ADVENTURE_DEFENSE_MULTIPLIER;
  return {
    atk,
    def,
    hp: Math.floor(stats.hp)
  };
}

function rankPokemon(pokemon, entry, enemy, settings) {
  const adventureEffects = settings.adventureEffects || makeAdventureEffectState();
  const {atk, def, hp} = getBattleStats(pokemon, entry, adventureEffects);
  const adventureDamageMultiplier = getAdventureDamageMultiplier(adventureEffects, enemy);
  const moveOptions = getPokemonMoveOptions(pokemon, entry.shadow, settings.allowElite, entry.purified);
  const fms = constrainMoves(moveOptions.fast, entry.fastMove, settings.useCurrentMoves);
  const cms = constrainMoves(moveOptions.charged, getEntryChargedMoveNames(entry), settings.useCurrentMoves);
  if (!fms.length || !cms.length) return null;

  let best = null;
  for (const fm of fms) {
    for (const cm of cms) {
      const fmEffectiveness = enemy.weakness.get(fm.type) || 1;
      const cmEffectiveness = enemy.weakness.get(cm.type) || 1;
      if (settings.requireEffective && Math.max(fmEffectiveness, cmEffectiveness) <= 1.0001) continue;

      const fmMult = fmEffectiveness * getRaidMoveBoost(fm.type, settings.boostSources);
      const cmMult = cmEffectiveness * getRaidMoveBoost(cm.type, settings.boostSources);
      const ratings = enemy.enemyYs.map(enemyY => {
        const incoming = avgYAgainst(enemyY, pokemon.types);
        const dps = getDPS(pokemon.types, atk, def, hp, fm, cm, fmMult, cmMult, enemy.stats.def, incoming, settings) * adventureDamageMultiplier;
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
          adventureEffects,
          adventureDamageMultiplier,
          notes: [entry.notes, entry.levelNote].filter(Boolean).join("; ")
        };
      }
    }
  }
  return best;
}

function getPokemonMoveOptions(pokemon, isShadow, allowElite, includeReturn = false) {
  const fastNames = [...(pokemon.fm || [])];
  const chargedNames = [...(pokemon.cm || [])];

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

function constrainMoves(options, enteredMove, useEntered) {
  const enteredMoves = Array.isArray(enteredMove) ? enteredMove : [enteredMove];
  const enteredNames = enteredMoves.map(move => String(move || "").trim()).filter(Boolean);
  if (!useEntered || !enteredNames.length) return options;

  const legalMoves = [];
  const seen = new Set();
  for (const name of enteredNames) {
    if (cleanName(name) === "hiddenpower") {
      for (const option of options.filter(move => isHiddenPowerMove(move.name))) {
        const optionKey = cleanName(option.name);
        if (seen.has(optionKey)) continue;
        seen.add(optionKey);
        legalMoves.push(option);
      }
      continue;
    }
    const move = findMove(name);
    if (!move) continue;
    const key = cleanName(move.name);
    if (seen.has(key)) continue;
    if (options.some(option => cleanName(option.name) === key)) {
      seen.add(key);
      legalMoves.push(move);
    }
  }
  return legalMoves;
}

function collectRaidUpgradeCandidatesForEntry(entry, current, group, enemy, settings) {
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

    const crossesActive = !beforeInTargetTeam &&
      (group.activeEntryUids.size < group.cutoffSlot ? after.metric > 0 : after.metric >= group.cutoff);
    const materialBenchGain = current && !beforeInTargetTeam && gainPct >= 5;
    const materialTeamGain = beforeInTargetTeam && gainPct >= 2;
    if (!crossesActive && !materialBenchGain && !materialTeamGain) continue;

    const minLevel = scenario.allowsLevelSearch && crossesActive
      ? findMinimumLevelForScenario(entry, scenario, enemy, settings, group.cutoff || 0.0001)
      : scenario.level;
    const enough = scenario.allowsLevelSearch && crossesActive && minLevel < scenario.level - 0.001
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
      crossesActive,
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

function sortUpgradeCandidates(a, b) {
  return Number(b.crossesActive) - Number(a.crossesActive) ||
    b.after.metric - a.after.metric ||
    b.gainPctSort - a.gainPctSort;
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
    inActiveRegularTeam: false,
    accountRank: null,
    notes: entry.notes
  };
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

function renderResults(plan, rowCount, matchedCount, messages, settings) {
  const accountCount = plan?.accounts?.length || 0;
  el.raidSummaryRows.textContent = rowCount.toString();
  el.raidSummaryMatched.textContent = matchedCount.toString();
  el.raidSummaryAccounts.textContent = accountCount ? accountCount.toString() : "-";
  el.raidSummaryTtw.textContent = plan?.estimatedTTW ? `${formatNumber(plan.estimatedTTW, 0)}s` : "-";
  renderBossInfo(plan?.boss || getSelectedBoss(), plan?.enemy || null);
  addMessages(messages);
  renderRosterBox(state.currentRosterEntries, state.currentUsableByUid, settings);

  if (!plan || !plan.accountPlans.length) {
    el.raidContext.textContent = "No raid plan yet. Add roster rows for at least one account.";
    el.raidResults.innerHTML = `<div class="visual-empty">No qualifying attackers yet.</div>`;
    renderRaidUpgradeCandidates([], settings);
    return;
  }

  const tierConfig = getRaidTierConfig(plan.boss);
  const shadowNote = plan.boss.shadow ? ` Shadow assumption: ${SHADOW_GEM_PLAYERS} players use ${SHADOW_GEMS_PER_PLAYER} Purified Gems each, so the boss is treated as subdued.` : "";
  const energyNote = tierConfig.energyRace ? " Mega/Primal energy raid: the fastest plan matters because win speed affects energy rewards." : "";
  const adventureNote = formatAdventureEffectSummary(settings.accountEffects);
  el.raidContext.textContent = `${displayBossName(plan.boss)} plan by ${settings.metric}, Party Power ${settings.partySize}, with paired Mega/Primal choices tested across loaded accounts.${shadowNote}${energyNote}${adventureNote}`;
  el.raidResults.innerHTML = renderRaidPlan(plan, settings);
  renderRaidUpgradeCandidates(plan.accountPlans.flatMap(accountPlan => accountPlan.upgrades), settings);
}

function renderBossInfo(boss, enemy) {
  if (!boss) {
    el.bossInfo.innerHTML = `<div class="visual-empty">No boss selected.</div>`;
    el.bossWeaknesses.innerHTML = "";
    return;
  }

  const displayName = displayBossName(boss);
  const tierConfig = getRaidTierConfig(boss);
  const bossHp = enemy?.stats?.hp || tierConfig.hp;
  const shadowAssumption = boss.shadow
    ? `<div class="shadow-assumption">Shadow raid: assuming ${SHADOW_TOTAL_GEMS} total Purified Gems (${SHADOW_GEMS_PER_PLAYER} per player across ${SHADOW_GEM_PLAYERS} players), so enraged defense is treated as subdued.</div>`
    : "";
  const energyAssumption = tierConfig.energyRace
    ? `<div class="energy-assumption">Mega/Primal energy raid: prioritize the fastest plan for the best energy payout.</div>`
    : "";
  el.bossInfo.innerHTML = `<div class="boss-card">
    <img class="pokemon-sprite" src="${escapeAttr(pokemonImageUrl(boss))}" alt="${escapeAttr(displayName)}" loading="eager" onerror="this.onerror=null;this.src='${escapeAttr(basePokemonImageUrl(boss))}'">
    <div>
      <div class="pokemon-name">${escapeHtml(displayName)}</div>
      <div>${boss.types.map(type => `<span class="type-chip" style="background:${TYPE_COLORS[type] || "#777"}">${escapeHtml(type)}</span>`).join("")}</div>
      <div class="subtle">${escapeHtml(tierConfig.label)} · ${bossHp.toLocaleString()} HP · ${tierConfig.timer}s</div>
      ${shadowAssumption}
      ${energyAssumption}
    </div>
  </div>`;

  const weaknessRows = enemy
    ? [...enemy.weakness.entries()]
      .filter(([, mult]) => mult > 1.0001)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    : TYPES
      .map(type => [type, effectiveness(type, boss.types)])
      .filter(([, mult]) => mult > 1.0001)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  el.bossWeaknesses.innerHTML = weaknessRows.length
    ? `<div class="visual-section-label">Weak to</div><div class="weakness-chip-row">${weaknessRows.map(([type, mult]) => `<span class="weakness-chip" style="--chip-color:${TYPE_COLORS[type] || "#777"}">${escapeHtml(type)} <strong>x${formatNumber(mult, 2)}</strong></span>`).join("")}</div>`
    : `<div class="subtle">No super-effective attack types found.</div>`;
}

function renderRaidPlan(plan, settings) {
  const megaText = plan.selectedMegas.length
    ? plan.selectedMegas.map(candidate => `${candidate.account}: ${displayPokemonName(candidate.pokemon, false)}`).join(" · ")
    : "No Mega/Primal selected";
  const boostText = plan.boostSources.length
    ? plan.boostSources.map(formatBoostSource).join(" · ")
    : "No raid-side mega boost";
  const shadowText = plan.boss.shadow
    ? ` Shadow boss subdued assumption: ${SHADOW_TOTAL_GEMS} total Purified Gems used.`
    : "";
  const energyText = getRaidTierConfig(plan.boss).energyRace
    ? " Mega/Primal energy raid: watch Est. time; faster wins award more energy."
    : "";
  const adventureText = formatAdventureEffectSummary(settings.accountEffects);

  return `<div class="raid-plan">
    <div class="raid-scoreboard">
      <div><span class="summary-label">Combined ${escapeHtml(settings.metric)}</span><strong>${formatNumber(plan.combinedMetric, 1)}</strong></div>
      <div><span class="summary-label">Total DPS</span><strong>${formatNumber(plan.combinedDps, 1)}</strong></div>
      <div><span class="summary-label">Est. time</span><strong>${plan.estimatedTTW ? `${formatNumber(plan.estimatedTTW, 0)}s` : "-"}</strong></div>
      <div><span class="summary-label">Damage capacity</span><strong class="damage-capacity-text">${escapeHtml(formatDamageCapacity(plan))}</strong></div>
      <div><span class="summary-label">Mega pair</span><strong>${escapeHtml(megaText)}</strong></div>
    </div>
    <div class="boost-summary">${escapeHtml(boostText + shadowText + energyText + adventureText)}</div>
    <div class="account-plan-grid">
      ${plan.accountPlans.map(accountPlan => renderAccountPlan(accountPlan, settings, plan)).join("")}
    </div>
  </div>`;
}

function renderAccountPlan(accountPlan, settings, plan) {
  const boss = plan?.boss || null;
  const color = boss?.types?.[0] ? TYPE_COLORS[boss.types[0]] : "#777";
  const bossHp = plan?.enemy?.stats?.hp || getRaidTierConfig(boss).hp;
  const bossTimer = getRaidTierConfig(boss).timer;
  const bossHealthPercent = Math.max(0, accountPlan.bossHealthPercent || 0);
  const estimatedDamage = accountPlan.estimatedDamage || accountPlan.teamDps * bossTimer;
  const damageWidth = Math.max(0, Math.min(100, bossHealthPercent));
  const adventureText = formatAccountAdventureEffects(accountPlan.adventureEffects);
  const megaSection = accountPlan.slot0
    ? `<div class="visual-section">
        <div class="visual-section-label">Mega slot</div>
        <div class="mega-row">${renderPokemonCard(accountPlan.slot0, settings, "0", "Mega/Primal", megaBoostText(accountPlan.slot0))}</div>
      </div>`
    : `<div class="visual-section">
        <div class="visual-section-label">Mega slot</div>
        <div class="visual-empty">No eligible Mega/Primal selected for this account.</div>
      </div>`;

  const regularSection = accountPlan.topSix.length
    ? `<div class="visual-section">
        <div class="visual-section-label">Regular attackers</div>
        <div class="visual-team-head">
          <strong>${accountPlan.slot0 ? "Slots 1-5 active, slot 6 backup" : "Slots 1-6 active"}</strong>
          <span class="subtle">${formatNumber(accountPlan.teamMetric, 1)} combined ${settings.metric} for this account</span>
        </div>
        <div class="visual-card-grid regular-team-grid">${accountPlan.topSix.map((result, index) => renderPokemonCard(
          result,
          settings,
          String(index + 1),
          index < accountPlan.activeRegularCount ? "Active regular" : "Backup regular",
          `${result.fastMove.name} / ${result.chargedMove.name}`,
          index < accountPlan.activeRegularCount ? "" : "backup-card"
        )).join("")}</div>
      </div>`
    : `<div class="visual-section">
        <div class="visual-section-label">Regular attackers</div>
        <div class="visual-empty">No qualifying attackers found for this boss.</div>
      </div>`;

  const upgradeCandidates = getVisualUpgradeCandidates(accountPlan);
  const upgradeSection = upgradeCandidates.length
    ? `<div class="visual-section visual-upgrades">
        <div class="visual-section-label">Potential</div>
        <div class="visual-team-head">
          <strong>Could take active slot ${escapeHtml(accountPlan.cutoffSlot)}</strong>
          <span class="subtle">Investment needed to barely enter this boss team</span>
        </div>
        <div class="visual-card-grid potential-grid">${upgradeCandidates.map((candidate, index) => renderUpgradeCard(candidate, settings, index + 1)).join("")}</div>
      </div>`
    : `<div class="visual-section visual-upgrades">
        <div class="visual-section-label">Potential</div>
        <div class="visual-empty">No inactive upgrades currently project into active slot ${escapeHtml(accountPlan.cutoffSlot)} for this boss.</div>
      </div>`;

  return `<section class="visual-team account-plan" style="--team-type-color:${color}">
    <div class="visual-team-head">
      <strong>${escapeHtml(accountPlan.account)}</strong>
      <span class="damage-share-pill">${formatNumber(bossHealthPercent, 1)}% boss HP</span>
      <span class="subtle">${escapeHtml(accountPlan.slot0 ? "Mega-active party" : "Six regular attackers")}</span>
    </div>
    ${adventureText ? `<div class="adventure-effect-summary">${escapeHtml(adventureText)}</div>` : ""}
    <div class="damage-share-card">
      <div class="damage-share-top">
        <span class="summary-label">Boss HP damage</span>
        <strong>${formatNumber(bossHealthPercent, 1)}%</strong>
      </div>
      <div class="damage-share-bar" aria-hidden="true"><span style="width:${formatNumber(damageWidth, 1)}%"></span></div>
      <div class="subtle">${formatNumber(accountPlan.teamDps, 1)} boosted DPS × ${bossTimer}s · ~${formatNumber(estimatedDamage, 0)} of ${bossHp.toLocaleString()} boss HP</div>
    </div>
    ${megaSection}
    ${regularSection}
    ${upgradeSection}
  </section>`;
}

function formatDamageCapacity(plan) {
  if (!plan?.accountPlans?.length || !(plan.combinedDps > 0)) return "-";
  return plan.accountPlans
    .map(accountPlan => `${accountPlan.account} ${formatNumber(accountPlan.bossHealthPercent || 0, 1)}%`)
    .join(" · ");
}

function getVisualUpgradeCandidates(accountPlan) {
  const seen = new Set();
  return (accountPlan.upgrades || [])
    .filter(candidate => candidate.crossesActive && !candidate.beforeInTargetTeam)
    .filter(candidate => {
      if (seen.has(candidate.entryUid)) return false;
      seen.add(candidate.entryUid);
      return true;
    })
    .slice(0, 3);
}

function renderPokemonCard(result, settings, slot, slotLabel, detailText, extraClass = "") {
  const name = displayPokemonName(result.pokemon, result.shadow);
  const rowNumber = result.entry?.uid || "";
  const rosterNumber = result.entry?.rosterNumber || (result.entry?.uid ? Math.max(1, Number(result.entry.uid) - 1) : "");
  return `<button class="pokemon-card ${slot === "0" ? "slot-card" : ""} ${extraClass}" type="button" data-entry-uid="${escapeAttr(rowNumber)}" aria-label="Edit roster #${escapeAttr(rosterNumber)} for ${escapeAttr(name)}">
    <div class="card-slot">${escapeHtml(slot)}</div>
    <img class="pokemon-sprite" src="${escapeAttr(pokemonImageUrl(result.pokemon))}" alt="${escapeAttr(name)}" loading="eager" onerror="this.onerror=null;this.src='${escapeAttr(basePokemonImageUrl(result.pokemon))}'">
    <div class="pokemon-card-body">
      <div class="pokemon-name">${escapeHtml(name)}</div>
      <div class="cp-line">CP ${result.cp.toLocaleString()}</div>
      <div class="subtle">Lv ${formatNumber(result.level, 1)} · ${result.ivs.atk}/${result.ivs.def}/${result.ivs.hp}</div>
      <div class="subtle">${escapeHtml(slotLabel)} · ${escapeHtml(detailText)}</div>
      <div class="subtle">${formatNumber(result.metric, 2)} ${settings.metric} · ${formatNumber(result.dps, 1)} DPS</div>
      ${rosterNumber ? `<div class="row-line">Roster #${escapeHtml(rosterNumber)}</div>` : ""}
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
  return `<button class="pokemon-card upgrade-card" type="button" data-entry-uid="${escapeAttr(candidate.entryUid)}" aria-label="Edit roster #${escapeAttr(rosterNumber)} for ${escapeAttr(name)}">
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

function renderRaidUpgradeCandidates(candidates, settings) {
  if (!candidates.length) {
    el.raidUpgradeResultsBody.innerHTML = `<tr><td colspan="7" class="subtle">No upgrade candidates crossed an active-team cutoff or cleared the material-gain threshold.</td></tr>`;
    el.raidUpgradeContext.textContent = "No bench Pokemon currently project into the active raid plan.";
    return;
  }

  const sorted = [...candidates].sort((a, b) =>
    a.account.localeCompare(b.account) ||
    Number(b.crossesActive) - Number(a.crossesActive) ||
    b.after.metric - a.after.metric ||
    b.gainPctSort - a.gainPctSort
  );
  el.raidUpgradeContext.textContent = `Showing boss-specific candidates that can enter the active lineup by level ${formatNumber(settings.upgradeLevel, 1)}, plus material team gains.`;
  el.raidUpgradeResultsBody.innerHTML = sorted.map(candidate => {
    const before = candidate.before;
    const after = getCandidateDisplayAfter(candidate);
    const moveChange = didMovesChange(before, after) ? `${after.fastMove.name} / ${after.chargedMove.name}` : "same moves";
    const levelText = `Lv ${formatNumber(before.level, 1)} -> ${formatNumber(after.level, 1)}`;
    const targetSlot = candidate.cutoffSlot || 6;
    const topSixText = candidate.crossesActive
      ? candidate.cutoff > 0 ? `Barely beats active #${targetSlot} (${formatNumber(candidate.cutoff, 2)})` : `Would fill open active slot ${targetSlot}`
      : candidate.beforeInTargetTeam
        ? `Improves current #${candidate.currentRank}`
        : `Bench gain; still below #${targetSlot}`;
    const rankText = candidate.currentRank ? `Current boss rank #${candidate.currentRank}` : "Not currently ranked";
    const beforeMetricText = before.metric > 0 ? `${formatNumber(before.metric, 2)} ${settings.metric}` : "not ranked";
    return `<tr>
      <td>${escapeHtml(candidate.account)}</td>
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
  }).join("");
}

function handlePokemonCardClick(event) {
  const card = event.target.closest(".pokemon-card[data-entry-uid]");
  if (!card || !el.raidResults.contains(card)) return;
  const rowNumber = Number(card.dataset.entryUid);
  if (rowNumber) {
    event.preventDefault();
    openQuickEdit(rowNumber);
  }
}

function handleRosterBoxClick(event) {
  const action = event.target.closest("[data-roster-action]");
  if (!action || !el.raidRosterBox.contains(action)) return;
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
  if (!form || !el.raidRosterBox.contains(form)) return;
  const source = field.name === "cp" ? "cp" : "level";
  form.dataset.levelCpSource = source;
  syncRosterFormLevelCP(form, source);
}

function renderRosterBox(entries, usableByUid, settings) {
  if (!el.raidRosterBox || !el.raidRosterBoxContext) return;
  if (!entries.length) {
    el.raidRosterBoxContext.textContent = "No roster rows loaded.";
    el.raidRosterBox.innerHTML = `<div class="visual-empty">No roster entries yet.</div>`;
    return;
  }

  const query = state.rosterSearch.trim();
  const filteredEntries = query
    ? entries.filter(entry => rosterEntryMatchesSearch(entry, usableByUid.get(entry.rowNumber) || null, query))
    : entries;
  const matchedCount = entries.filter(entry => usableByUid.has(entry.rowNumber)).length;
  const filterText = query ? ` Showing ${filteredEntries.length.toLocaleString()} matching "${query}".` : "";
  el.raidRosterBoxContext.textContent = `${entries.length.toLocaleString()} roster spots loaded, ${matchedCount.toLocaleString()} matched.${filterText}`;
  el.raidRosterBox.innerHTML = filteredEntries.length
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

  return `<article id="raid-roster-entry-${rowNumber}" class="roster-entry ${isExpanded ? "is-expanded" : ""}">
    <button class="roster-summary" type="button" data-roster-action="toggle" data-entry-uid="${escapeAttr(rowNumber)}" aria-expanded="${isExpanded}" aria-controls="raid-roster-details-${escapeAttr(rowNumber)}">
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

  return `<div id="raid-roster-details-${entry.rowNumber}" class="roster-details">
    <form id="raid-roster-form-${entry.rowNumber}" class="roster-edit-form" data-entry-uid="${escapeAttr(entry.rowNumber)}">
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
  const rowNumber = Number(form?.dataset?.entryUid || form?.id?.replace("raid-roster-form-", ""));
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
  if (!state.previewingSample) rememberRosterText(el.raidRosterInput.value, true);
  state.expandedRosterUid = rowNumber;
  state.pendingMessage = {type: "success", text: saveText};
  closeQuickEdit();
  calculate();
}

function rosterEntryElementId(rowNumber) {
  return `raid-roster-entry-${rowNumber}`;
}

function openRosterEntry(rowNumber) {
  state.expandedRosterUid = rowNumber;
  if (state.rosterSearch) {
    state.rosterSearch = "";
    if (el.raidRosterSearch) el.raidRosterSearch.value = "";
  }
  renderRosterBox(state.currentRosterEntries, state.currentUsableByUid, state.currentSettings || readSettings());
  const entryElement = document.getElementById(rosterEntryElementId(rowNumber));
  if (entryElement && typeof entryElement.scrollIntoView === "function") {
    entryElement.scrollIntoView({block: "center", behavior: "smooth"});
  }
  addMessages([{type: "success", text: `Opened ${formatRosterReference(getRosterEntryByRowNumber(rowNumber), rowNumber)}.`}]);
}

function saveRosterEntry(rowNumber) {
  const form = document.getElementById(`raid-roster-form-${rowNumber}`);
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

  const saveText = state.previewingSample
    ? `Saved ${formatRosterReference(getRosterEntryByRowNumber(rowNumber), rowNumber)} in the sample preview. Your saved roster was not replaced.`
    : `Saved ${formatRosterReference(getRosterEntryByRowNumber(rowNumber), rowNumber)}. Teams recalculated.`;
  if (!state.previewingSample) rememberRosterText(el.raidRosterInput.value, true);
  state.expandedRosterUid = rowNumber;
  state.pendingMessage = {type: "success", text: saveText};
  calculate();
}

function updateCSVRow(rowNumber, updates) {
  const table = parseCSV(el.raidRosterInput.value);
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

  el.raidRosterInput.value = serializeCSV(table);
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

function getCandidateDisplayAfter(candidate) {
  return candidate.crossesActive ? candidate.enough || candidate.after : candidate.after;
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

function megaBoostText(slot0) {
  if (!slot0?.megaBoostTypes?.length) return "field-window boost";
  return `${slot0.isFieldlessMega ? "background boost" : "field-window boost"}: ${slot0.megaBoostTypes.join(", ")}`;
}

function formatBoostSource(source) {
  const label = displayPokemonName(source.pokemon, false);
  const mode = source.isFieldless ? "background" : "field window";
  return `${source.account} ${label}: ${mode} ${source.boostTypes.join(", ")}`;
}

function formatAdventureEffectSummary(accountEffects) {
  if (!accountEffects?.entries) return "";
  const active = [];
  for (const [account, effects] of accountEffects.entries()) {
    const label = formatAccountAdventureEffects(effects);
    if (label) active.push(`${account}: ${label}`);
  }
  return active.length ? ` Adventure effects: ${active.join(" · ")}.` : "";
}

function formatAccountAdventureEffects(effects) {
  const parts = [];
  if (effects?.zacianBlade) parts.push("Zacian +10% attack");
  if (effects?.zamazentaBash) parts.push("Zamazenta +10% defense");
  if (effects?.mewtwoXDynamicPunch) parts.push("Mewtwo X +15% Mega raid damage");
  return parts.join(" · ");
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
  const config = getRaidTierConfig(pokemon);
  const cpm = config.cpm;
  return {
    atk: (pokemon.stats.baseAttack + 15) * Math.fround(cpm),
    def: (pokemon.stats.baseDefense + 15) * Math.fround(cpm),
    hp: config.hp
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

function getMegaBoostTypes(pokemon) {
  const fieldless = getFieldlessBoostTypes(pokemon);
  return fieldless.length ? fieldless : pokemon.types || [];
}

function getMegaPriority(pokemon, enemy) {
  const fieldless = getFieldlessBoostTypes(pokemon);
  const boostTypes = fieldless.length ? fieldless : pokemon.types || [];
  const boostsWeakness = boostTypes.some(type => (enemy.weakness.get(type) || 1) > 1.01);
  if (fieldless.length && boostsWeakness) return 5;
  if (boostsWeakness) return 2;
  if (fieldless.length) return 1.5;
  return 1;
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

function setRosterText(value) {
  el.raidRosterInput.value = value.trim();
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

function rememberRosterText(value = el.raidRosterInput.value, keepBackup = false) {
  if (typeof localStorage === "undefined") return;
  try {
    const text = value.trim();
    if (keepBackup) backupSavedRosterText(text);
    localStorage.setItem(CURRENT_CSV_KEY, text);
  } catch (error) {
    // Local storage is a convenience only; calculation can still run.
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

function addMessages(messages) {
  if (!messages.length) {
    el.raidMessages.innerHTML = `<p>Ready. Boss moves can stay on Any when you do not know the raid moveset.</p>`;
    return;
  }
  el.raidMessages.innerHTML = messages.slice(0, 8).map(m => `<p class="${m.type || ""}">${escapeHtml(m.text)}</p>`).join("");
}

function setStatus(text, kind = "") {
  el.raidDataStatus.textContent = text;
  el.raidDataStatus.className = `status-pill ${kind}`.trim();
}

function displayPokemonName(pokemon, shadow) {
  if (isMegaForm(pokemon.form)) {
    return pokemon.name;
  }
  const form = pokemon.form && pokemon.form !== "Normal" ? ` (${pokemon.form.replaceAll("_", " ")})` : "";
  return `${shadow ? "Shadow " : ""}${pokemon.name}${form}`;
}

function displayBossName(boss) {
  return displayPokemonName(boss, Boolean(boss.shadow));
}

function raidBossOptionLabel(group) {
  return `${displayBossName(group.base)} · ${getRaidTierConfig(group.base).label}`;
}

function getRaidBossTier(boss) {
  const override = RAID_BOSS_TIER_OVERRIDES.get(raidBossTierOverrideKey(boss));
  if (override) return override;
  return Number(boss?.raid_tier || (boss?.class ? 5 : 3));
}

function getRaidTierConfig(boss) {
  return RAID_TIER_CONFIGS.get(getRaidBossTier(boss)) || DEFAULT_RAID_TIER_CONFIG;
}

function isMegaEnergyRaidBoss(boss) {
  return Boolean(boss && getRaidTierConfig(boss).energyRace);
}

function raidBossGroupKey(boss) {
  return `${getRaidBossTier(boss)}:${boss.id}:${boss.form || "Normal"}:${cleanName(boss.name)}`;
}

function raidBossTierOverrideKey(boss) {
  return boss ? `${boss.id}:${boss.form || "Normal"}:${cleanName(boss.name)}` : "";
}

function bossSortLabel(boss) {
  return `${boss.name} ${boss.form || ""} ${boss.shadow ? "Shadow" : "Normal"}`;
}

function bossKey(boss) {
  return `${boss.id}:${boss.form || "Normal"}:${boss.shadow ? "shadow" : "normal"}`;
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

function formatRosterReference(entry, fallbackRowNumber = null) {
  const rosterNumber = entry?.rosterNumber || getRosterNumberForRowNumber(fallbackRowNumber ?? entry?.rowNumber);
  return rosterNumber ? `Roster #${rosterNumber}` : "Roster entry";
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

function averageValue(values, getter) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + getter(value), 0) / values.length;
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
