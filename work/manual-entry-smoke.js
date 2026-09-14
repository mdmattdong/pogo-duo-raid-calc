const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const root = process.cwd();
  const appDir = path.join(root, "outputs/pokemon-raid-roster");
  const dataDir = path.join(root, "work/dialgadex-data");
  let browser;
  try {
    browser = await chromium.launch({headless: true});
  } catch (error) {
    browser = await chromium.launch({channel: "chrome", headless: true});
  }
  const page = await browser.newPage({viewport: {width: 1280, height: 900}});
  const errors = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/pogo_pkm.min.json", route => route.fulfill({
    contentType: "application/json",
    body: fs.readFileSync(path.join(dataDir, "pogo_pkm.min.json"), "utf8")
  }));
  await page.route("**/pogo_fm.json", route => route.fulfill({
    contentType: "application/json",
    body: fs.readFileSync(path.join(dataDir, "pogo_fm.json"), "utf8")
  }));
  await page.route("**/pogo_cm.json", route => route.fulfill({
    contentType: "application/json",
    body: fs.readFileSync(path.join(dataDir, "pogo_cm.json"), "utf8")
  }));

  await page.goto(`file://${path.join(appDir, "manual-entry.html")}`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector(".status-pill.ready", {timeout: 15000});
  const playerDropdowns = await page.evaluate(() => ({
    entryOptions: [...document.querySelector("#entry-account").options].map(option => option.textContent),
    filterOptions: [...document.querySelector("#row-player-filter").options].map(option => option.textContent)
  }));
  if (!playerDropdowns.entryOptions.includes("Main") || !playerDropdowns.entryOptions.includes("Alt") || !playerDropdowns.entryOptions.includes("Add player...") || !playerDropdowns.filterOptions.includes("All players")) {
    throw new Error(`Player dropdowns did not render: ${JSON.stringify(playerDropdowns)}`);
  }
  await page.selectOption("#entry-account", "Main");
  await page.fill("#entry-name", "kart");
  await page.waitForSelector("#pokemon-suggestions:not(.is-hidden) [data-suggestion-index]", {timeout: 10000});
  const autocomplete = await page.evaluate(() => {
    const list = document.querySelector("#pokemon-suggestions");
    const options = [...document.querySelectorAll("#pokemon-suggestions [data-suggestion-index]")];
    return {
      expanded: document.querySelector("#entry-name").getAttribute("aria-expanded"),
      visible: !list.classList.contains("is-hidden"),
      texts: options.map(option => option.textContent.trim().replace(/\s+/g, " "))
    };
  });
  if (!autocomplete.visible || autocomplete.expanded !== "true" || !autocomplete.texts.length || !autocomplete.texts.every(text => /kart/i.test(text))) {
    throw new Error(`Pokemon autocomplete did not filter suggestions: ${JSON.stringify(autocomplete)}`);
  }
  await page.click('#pokemon-suggestions [data-suggestion-index="0"]');
  await page.waitForFunction(() => document.querySelector("#entry-name").value.includes("Kartana"));
  const selectedAutocomplete = await page.evaluate(() => ({
    name: document.querySelector("#entry-name").value,
    form: document.querySelector("#entry-form").value,
    expanded: document.querySelector("#entry-name").getAttribute("aria-expanded"),
    hidden: document.querySelector("#pokemon-suggestions").classList.contains("is-hidden")
  }));
  if (!selectedAutocomplete.name.includes("Kartana") || selectedAutocomplete.expanded !== "false" || !selectedAutocomplete.hidden) {
    throw new Error(`Pokemon autocomplete did not select cleanly: ${JSON.stringify(selectedAutocomplete)}`);
  }
  await page.fill("#entry-name", "zacian crowned");
  await page.waitForSelector("#pokemon-suggestions:not(.is-hidden) [data-suggestion-index]", {timeout: 10000});
  await page.locator("#pokemon-suggestions [data-suggestion-index]", {hasText: "Zacian (Crowned sword)"}).click();
  await page.waitForFunction(() => document.querySelector("#entry-preview .pokemon-sprite")?.src.endsWith("/888-c.png"));
  const crownedSprite = await page.evaluate(() => ({
    name: document.querySelector("#entry-name").value,
    form: document.querySelector("#entry-form").value,
    src: document.querySelector("#entry-preview .pokemon-sprite")?.src || ""
  }));
  if (crownedSprite.form !== "Crowned_sword" || !crownedSprite.src.endsWith("/888-c.png")) {
    throw new Error(`Crowned Zacian did not use the form sprite: ${JSON.stringify(crownedSprite)}`);
  }
  await page.fill("#entry-name", "necrozma dawn");
  await page.waitForSelector("#pokemon-suggestions:not(.is-hidden) [data-suggestion-index]", {timeout: 10000});
  await page.locator("#pokemon-suggestions [data-suggestion-index]", {hasText: "Necrozma (Dawn wings)"}).click();
  await page.waitForFunction(() => document.querySelector("#entry-preview .pokemon-sprite")?.src.endsWith("/800-dw.png"));
  const dawnWingsSprite = await page.evaluate(() => ({
    form: document.querySelector("#entry-form").value,
    src: document.querySelector("#entry-preview .pokemon-sprite")?.src || ""
  }));
  if (dawnWingsSprite.form !== "Dawn_wings" || !dawnWingsSprite.src.endsWith("/800-dw.png")) {
    throw new Error(`Dawn Wings Necrozma did not use the form sprite: ${JSON.stringify(dawnWingsSprite)}`);
  }
  await page.fill("#entry-name", "necrozma dusk");
  await page.waitForSelector("#pokemon-suggestions:not(.is-hidden) [data-suggestion-index]", {timeout: 10000});
  await page.locator("#pokemon-suggestions [data-suggestion-index]", {hasText: "Necrozma (Dusk mane)"}).click();
  await page.waitForFunction(() => document.querySelector("#entry-preview .pokemon-sprite")?.src.endsWith("/800-dm.png"));
  const duskManeSprite = await page.evaluate(() => ({
    form: document.querySelector("#entry-form").value,
    src: document.querySelector("#entry-preview .pokemon-sprite")?.src || ""
  }));
  if (duskManeSprite.form !== "Dusk_mane" || !duskManeSprite.src.endsWith("/800-dm.png")) {
    throw new Error(`Dusk Mane Necrozma did not use the form sprite: ${JSON.stringify(duskManeSprite)}`);
  }
  await page.fill("#entry-name", "Starmie");
  await page.waitForFunction(() => [...document.querySelector("#entry-fast").options].some(option => option.value === "Hidden Power"));
  await page.selectOption("#entry-fast", "Hidden Power");
  await page.waitForSelector("#entry-hidden-power-wrap:not(.is-hidden)", {timeout: 10000});
  await page.selectOption("#entry-hidden-power-type", "Ice");
  const hiddenPowerRow = await page.evaluate(() => collectFormRow());
  if (hiddenPowerRow.fast_move !== "Hidden Power Ice") {
    throw new Error(`Hidden Power type was not serialized into fast_move: ${JSON.stringify(hiddenPowerRow)}`);
  }
  await page.fill("#entry-name", "Charizard");
  await page.waitForSelector("#entry-mega-form-options:not(.is-hidden)", {timeout: 10000});
  const charizardMegaOptions = await page.evaluate(() => ({
    generalHidden: document.querySelector("#entry-can-mega-wrap").classList.contains("is-hidden"),
    labels: [...document.querySelectorAll('#entry-mega-form-options input[name="entry_mega_form"]')].map(input => input.value)
  }));
  if (!charizardMegaOptions.generalHidden || !charizardMegaOptions.labels.includes("Mega Charizard X") || !charizardMegaOptions.labels.includes("Mega Charizard Y")) {
    throw new Error(`Charizard did not show separate Mega X/Y options: ${JSON.stringify(charizardMegaOptions)}`);
  }
  await page.check('#entry-mega-form-options input[value="Mega Charizard X"]');
  const charizardXRow = await page.evaluate(() => collectFormRow());
  if (charizardXRow.can_mega !== "true" || charizardXRow.mega_forms !== "Mega Charizard X") {
    throw new Error(`Charizard X selection was not serialized correctly: ${JSON.stringify(charizardXRow)}`);
  }
  await page.fill("#entry-name", "Groudon");
  await page.waitForFunction(() => !document.querySelector("#entry-can-mega-wrap").classList.contains("is-hidden"));
  await page.fill("#entry-cp", "4159");
  await page.fill("#entry-current-hp", "174");
  await page.waitForFunction(() => !document.querySelector("#inference-select").disabled);
  const inference = await page.evaluate(() => {
    const options = [...document.querySelector("#inference-select").options];
    const levels = options.map(option => Number(option.textContent.match(/Lv ([0-9.]+)/)?.[1] || "0"));
    const lowestFirst = levels.every((level, index) => index === 0 || level >= levels[index - 1]);
    const target = options.find(option => option.textContent.includes("Lv 41") && option.textContent.includes("15/14/15"));
    if (!target) return {found: false, lowestFirst, count: options.length, text: options.map(option => option.textContent).slice(0, 20)};
    document.querySelector("#inference-select").value = target.value;
    return {found: true, lowestFirst, count: options.length, selected: target.textContent, first: options[0]?.textContent || ""};
  });
  if (!inference.found) throw new Error(`Expected inference match not found: ${JSON.stringify(inference)}`);
  if (!inference.lowestFirst) throw new Error(`Inference suggestions are not sorted lowest level first: ${JSON.stringify(inference)}`);
  await page.click("#apply-inference-button");
  const appliedInference = await page.evaluate(() => ({
    level: document.querySelector("#entry-level").value,
    ivs: [
      document.querySelector("#entry-atk").value,
      document.querySelector("#entry-def").value,
      document.querySelector("#entry-hp").value
    ].join("/")
  }));
  await page.waitForFunction(() => [...document.querySelector("#entry-charged").options].some(option => option.value === "Precipice Blades"));
  await page.selectOption("#entry-fast", "Mud Shot");
  await page.selectOption("#entry-charged", "Precipice Blades");
  await page.selectOption("#entry-charged-2", "Fire Punch");
  await page.check("#entry-can-mega");
  await page.click("#add-entry-button");
  await page.waitForFunction(() => document.querySelector("#manual-row-count").textContent === "1");

  const manual = await page.evaluate(() => ({
    rows: document.querySelector("#manual-row-count").textContent,
    accounts: document.querySelector("#manual-account-count").textContent,
    megaReady: document.querySelector("#manual-mega-count").textContent,
    tableText: document.querySelector("#manual-rows-body").textContent.trim().replace(/\s+/g, " "),
    csv: document.querySelector("#manual-csv-output").value
  }));

  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  if (appliedInference.level !== "41" || appliedInference.ivs !== "15/14/15" || manual.rows !== "1" || manual.accounts !== "1" || manual.megaReady !== "1" || !manual.tableText.includes("Groudon") || !manual.tableText.includes("HP 174") || !manual.tableText.includes("Precipice Blades + Fire Punch") || !manual.csv.includes("Main,Groudon,Normal,41,15,14,15,false,false,Mud Shot,Precipice Blades,Fire Punch,4159,true")) {
    throw new Error(`Manual row was not generated correctly: ${JSON.stringify({appliedInference, manual})}`);
  }

  const oldUseButtonCount = await page.locator("#open-evaluator-button, #open-raid-button").count();
  if (oldUseButtonCount !== 0) throw new Error("Destination-specific use buttons should not be present.");
  await page.evaluate(() => localStorage.setItem("pokemonRaidRosterCurrentCsv", "account,name\\nOld,Dragonite"));
  await page.click("#use-roster-button");
  await page.waitForFunction(() => document.querySelector("#manual-messages").textContent.includes("Roster saved"));
  const sharedSave = await page.evaluate(() => ({
    message: document.querySelector("#manual-messages").textContent,
    currentCsv: localStorage.getItem("pokemonRaidRosterCurrentCsv"),
    pendingCsv: localStorage.getItem("pokemonRaidRosterPendingCsv"),
    previousCsv: localStorage.getItem("pokemonRaidRosterPreviousCsv")
  }));
  if (!sharedSave.currentCsv?.includes("Main,Groudon,Normal,41") || !sharedSave.pendingCsv?.includes("Main,Groudon,Normal,41")) {
    throw new Error(`Use roster did not save shared CSV: ${JSON.stringify(sharedSave)}`);
  }
  if (sharedSave.previousCsv !== "account,name\\nOld,Dragonite") {
    throw new Error(`Use roster did not keep previous shared CSV backup: ${JSON.stringify(sharedSave)}`);
  }

  await page.goto(`file://${path.join(appDir, "index.html")}`);
  await page.waitForSelector(".status-pill.ready", {timeout: 15000});
  await page.waitForFunction(() => document.querySelector("#summary-rows").textContent === "1");
  const evaluator = await page.evaluate(() => ({
    rows: document.querySelector("#summary-rows").textContent,
    matched: document.querySelector("#summary-matched").textContent,
    accounts: document.querySelector("#summary-six").textContent,
    csv: document.querySelector("#roster-input").value,
    firstName: document.querySelector("#type-results-body .pokemon-name")?.textContent || ""
  }));

  if (evaluator.rows !== "1" || evaluator.matched !== "1" || evaluator.accounts !== "1" || !evaluator.csv.includes("Main,Groudon,Normal,41,15,14,15,false,false,Mud Shot,Precipice Blades,Fire Punch,4159,true") || !evaluator.firstName) {
    throw new Error(`Manual CSV did not load into evaluator: ${JSON.stringify(evaluator)}`);
  }

  await page.goto(`file://${path.join(appDir, "raid-boss.html")}`);
  await page.waitForSelector(".status-pill.ready", {timeout: 15000});
  await page.waitForFunction(() => document.querySelector("#raid-summary-rows").textContent === "1");
  const raidBoss = await page.evaluate(() => ({
    rows: document.querySelector("#raid-summary-rows").textContent,
    matched: document.querySelector("#raid-summary-matched").textContent,
    accounts: document.querySelector("#raid-summary-accounts").textContent,
    csv: document.querySelector("#raid-roster-input").value
  }));

  if (raidBoss.rows !== "1" || raidBoss.matched !== "1" || raidBoss.accounts !== "1" || !raidBoss.csv.includes("Main,Groudon,Normal,41,15,14,15,false,false,Mud Shot,Precipice Blades,Fire Punch,4159,true")) {
    throw new Error(`Manual CSV did not load into raid boss calculator: ${JSON.stringify(raidBoss)}`);
  }

  await page.goto(`file://${path.join(appDir, "manual-entry.html")}`);
  await page.waitForSelector(".status-pill.ready", {timeout: 15000});
  await page.waitForFunction(() => document.querySelector("#manual-row-count").textContent === "1");
  const clearCsvButtonCount = await page.locator("#clear-csv-button").count();
  if (clearCsvButtonCount !== 0) throw new Error("One-click Clear CSV button should not be present.");
  page.once("dialog", dialog => dialog.accept("CLEAR"));
  await page.click("#clear-rows-button");
  await page.waitForFunction(() => document.querySelector("#manual-row-count").textContent === "0");
  const manualClear = await page.evaluate(() => ({
    csv: document.querySelector("#manual-csv-output").value,
    readOnly: document.querySelector("#manual-csv-output").readOnly,
    rows: document.querySelector("#manual-row-count").textContent,
    accounts: document.querySelector("#manual-account-count").textContent,
    megaReady: document.querySelector("#manual-mega-count").textContent,
    tableText: document.querySelector("#manual-rows-body").textContent.trim().replace(/\s+/g, " "),
    savedRows: localStorage.getItem("pokemonRaidRosterManualRows"),
    pendingCsv: localStorage.getItem("pokemonRaidRosterPendingCsv")
  }));
  if (manualClear.csv !== "" || !manualClear.readOnly || manualClear.rows !== "0" || manualClear.accounts !== "0" || manualClear.megaReady !== "0" || !manualClear.tableText.includes("No manual rows yet") || manualClear.savedRows !== null || manualClear.pendingCsv !== null) {
    throw new Error(`Manual clear did not wipe generated rows: ${JSON.stringify(manualClear)}`);
  }

  await browser.close();
  console.log(JSON.stringify({manual, sharedSave, evaluator, raidBoss, manualClear}, null, 2));
})();
