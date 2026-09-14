const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const root = process.cwd();
  const appPath = path.join(root, "outputs/pokemon-raid-roster/index.html");
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
  await page.goto(`file://${appPath}`);
  await page.waitForSelector(".status-pill.ready", {timeout: 15000});
  await page.click("#calculate-button");
  await page.waitForFunction(() => document.querySelectorAll("#type-results-body tr").length > 0);
  const empty = await page.evaluate(() => ({
    status: document.querySelector("#data-status").textContent,
    rows: document.querySelector("#summary-rows").textContent,
    matched: document.querySelector("#summary-matched").textContent,
    accounts: document.querySelector("#summary-six").textContent,
    typeContext: document.querySelector("#type-context").textContent,
    firstName: document.querySelector("#type-results-body .pokemon-name")?.textContent || "",
    typeRows: document.querySelectorAll("#type-results-body tr").length,
    upgradeRows: document.querySelectorAll("#upgrade-results-body tr").length,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  if (empty.rows !== "0" || empty.matched !== "0" || empty.firstName) {
    throw new Error(`Evaluator should open without sample data now: ${JSON.stringify(empty)}`);
  }

  await page.click("#grass-sample-button");
  await page.waitForFunction(() => document.querySelector("#summary-rows").textContent === "19");
  await page.evaluate(() => {
    const grassRow = [...document.querySelectorAll("#type-results-body tr.type-summary-row")]
      .find(row => row.children[0]?.textContent.trim() === "Main" && row.children[1]?.textContent.includes("Grass"));
    if (!grassRow) throw new Error("Main Grass row not found");
    grassRow.click();
  });
  await page.waitForSelector(".type-detail-row .pokemon-card", {timeout: 10000});
  await page.waitForFunction(() => [...document.querySelectorAll(".type-detail-row .pokemon-sprite")].some(img => img.naturalWidth > 0), null, {timeout: 15000});
  const grass = await page.evaluate(() => ({
    rows: document.querySelector("#summary-rows").textContent,
    matched: document.querySelector("#summary-matched").textContent,
    typeRows: document.querySelectorAll("#type-results-body tr.type-summary-row").length,
    detailRows: document.querySelectorAll("#type-results-body tr.type-detail-row").length,
    visualCards: document.querySelectorAll(".type-detail-row .pokemon-card").length,
    currentCards: document.querySelectorAll(".type-detail-row .pokemon-card:not(.upgrade-card)").length,
    megaCards: document.querySelectorAll(".type-detail-row .mega-row .pokemon-card").length,
    regularCards: document.querySelectorAll(".type-detail-row .regular-team-grid .pokemon-card").length,
    upgradeCards: document.querySelectorAll(".type-detail-row .upgrade-card").length,
    potentialCards: document.querySelectorAll(".type-detail-row .potential-grid .upgrade-card").length,
    loadedSprites: [...document.querySelectorAll(".type-detail-row .pokemon-sprite")].filter(img => img.naturalWidth > 0).length,
    spriteUrls: [...document.querySelectorAll(".type-detail-row .pokemon-sprite")].map(img => img.src).slice(0, 3),
    cpCards: [...document.querySelectorAll(".type-detail-row .cp-line")].map(node => node.textContent).slice(0, 3),
    upgradeNames: [...document.querySelectorAll(".type-detail-row .upgrade-card .pokemon-name")].map(node => node.textContent),
    rosterBoxSlots: [...document.querySelectorAll("#roster-box .roster-entry .card-slot")].slice(0, 3).map(node => node.textContent.trim()),
    rosterBoxIds: [...document.querySelectorAll("#roster-box .roster-entry")].slice(0, 3).map(node => node.id),
    hasPotentialHeading: document.querySelector(".type-detail-row")?.textContent.includes("Potential") || false,
    hasSlotFivePotential: document.querySelector(".type-detail-row")?.textContent.includes("Could take slot 5") || false,
    hasSlotFiveThreshold: document.querySelector(".type-detail-row")?.textContent.includes("beats #5") || false,
    hasCandyText: document.querySelector(".type-detail-row")?.textContent.includes("Candy") || false,
    hasMoveText: document.querySelector(".type-detail-row")?.textContent.includes("Moves") || false,
    hasLevelGainText: /\(\+\d/.test(document.querySelector(".type-detail-row")?.textContent || ""),
    hasPrimalGroudon: document.querySelector("#type-results-body").textContent.includes("Primal Groudon"),
    hasMegaSceptile: document.querySelector("#type-results-body").textContent.includes("Mega Sceptile"),
    savedCsv: localStorage.getItem("pokemonRaidRosterCurrentCsv"),
    firstGrassText: [...document.querySelectorAll("#type-results-body tr")]
      .find(row => row.querySelector(".type-chip")?.textContent.trim() === "Grass")?.textContent.trim().replace(/\s+/g, " ").slice(0, 240) || ""
  }));
  await page.setViewportSize({width: 390, height: 900});
  const mobile = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    controlsWidth: document.querySelector(".control-surface").getBoundingClientRect().width,
    shellWidth: document.querySelector(".app-shell").getBoundingClientRect().width
  }));
  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  if (empty.overflow) throw new Error(`Initial empty evaluator overflowed: ${JSON.stringify(empty)}`);
  if (!grass.hasPrimalGroudon || !grass.hasMegaSceptile) throw new Error(`Grass sample did not show expected Megas: ${JSON.stringify(grass)}`);
  if (grass.savedCsv !== null) throw new Error(`Sample preview should not save over current roster: ${JSON.stringify(grass)}`);
  if (grass.megaCards !== 1 || grass.regularCards !== 6 || grass.upgradeCards !== 3 || grass.potentialCards !== 3 || !grass.hasPotentialHeading || !grass.hasSlotFivePotential || !grass.hasSlotFiveThreshold || !grass.hasCandyText || !grass.hasMoveText || !grass.hasLevelGainText || !grass.upgradeNames.includes("Roserade") || !grass.upgradeNames.includes("Meowscarada")) {
    throw new Error(`Grass visual upgrade cards are not clear: ${JSON.stringify(grass)}`);
  }
  if (grass.visualCards < 10 || grass.loadedSprites < 1 || !grass.cpCards.every(text => text.startsWith("CP ")) || !grass.spriteUrls.every(src => src.startsWith("https://www.serebii.net/pokemongo/pokemon/"))) {
    throw new Error(`Grass visual cards missing CP or Serebii sprites: ${JSON.stringify(grass)}`);
  }
  if (grass.rosterBoxSlots.join(",") !== "1,2,3" || grass.rosterBoxIds.join(",") !== "roster-entry-2,roster-entry-3,roster-entry-4") {
    throw new Error(`Roster box should display roster numbers while preserving CSV row ids: ${JSON.stringify(grass)}`);
  }
  const rosterBeforeClick = await page.locator("#roster-input").inputValue();
  await page.locator(".type-detail-row .upgrade-card", {hasText: "Meowscarada"}).click();
  await page.waitForSelector("#quick-edit-modal:not([hidden])", {timeout: 10000});
  const openedQuickEdit = await page.evaluate(() => ({
    title: document.querySelector("#quick-edit-title").textContent,
    meta: document.querySelector("#quick-edit-meta").textContent,
    level: document.querySelector("#quick-edit-level").value,
    cp: document.querySelector("#quick-edit-cp").value,
    href: document.querySelector("#quick-edit-full-link").getAttribute("href"),
    rosterAfterClick: document.querySelector("#roster-input").value,
    rows: document.querySelector("#summary-rows").textContent,
    matched: document.querySelector("#summary-matched").textContent
  }));
  if (!openedQuickEdit.title.includes("Meowscarada") || !openedQuickEdit.meta.includes("Roster #10") || openedQuickEdit.level !== "28" || openedQuickEdit.href !== "#roster-entry-11" || openedQuickEdit.rosterAfterClick !== rosterBeforeClick || openedQuickEdit.rows !== "19" || openedQuickEdit.matched !== "19") {
    throw new Error(`Card click did not open the quick editor without mutating CSV: ${JSON.stringify(openedQuickEdit)}`);
  }

  await page.fill("#quick-edit-level", "28.5");
  await page.waitForFunction(() => document.querySelector("#quick-edit-cp").value === "2269", null, {timeout: 10000});
  await page.click("#quick-edit-save");
  await page.waitForFunction(() => document.querySelector("#messages").textContent.includes("Saved Roster #10"), null, {timeout: 10000});
  await page.waitForSelector("#roster-entry-11.is-expanded", {timeout: 10000});
  await page.fill('#roster-form-11 [name="charged_move"]', "Frenzy Plant");
  await page.click('#roster-form-11 [data-roster-action="save"]');
  await page.waitForFunction(() => document.querySelector("#messages").textContent.includes("Saved Roster #10"), null, {timeout: 10000});
  const savedRoster = await page.evaluate(() => {
    const roster = document.querySelector("#roster-input").value;
    const line = roster.split("\n").find(row => row.startsWith("Main,Meowscarada,")) || "";
    const detailText = document.querySelector(".type-detail-row")?.textContent.trim().replace(/\s+/g, " ") || "";
    return {
      hasSavedMessage: document.querySelector("#messages").textContent.includes("Saved Roster #10"),
      line,
      hasExpandedRosterEntry: Boolean(document.querySelector("#roster-entry-11.is-expanded")),
      detailText: detailText.slice(0, 1200),
      rows: document.querySelector("#summary-rows").textContent,
      matched: document.querySelector("#summary-matched").textContent
    };
  });
  if (!savedRoster.hasSavedMessage || !savedRoster.line.includes(",28.5,") || !savedRoster.line.includes("Frenzy Plant,Night Slash") || !savedRoster.hasExpandedRosterEntry || !savedRoster.detailText.includes("Meowscarada") || savedRoster.rows !== "19" || savedRoster.matched !== "19") {
    throw new Error(`Roster box save did not update and recalculate: ${JSON.stringify(savedRoster)}`);
  }
  await page.click("#roster-entry-2 .roster-summary");
  await page.waitForSelector('#roster-form-2 [name="can_mega"]', {timeout: 10000});
  await page.uncheck('#roster-form-2 [name="can_mega"]');
  await page.click('#roster-form-2 [data-roster-action="save"]');
  await page.waitForFunction(() => document.querySelector("#messages").textContent.includes("Saved Roster #1"), null, {timeout: 10000});
  const megaToggle = await page.evaluate(() => {
    const detailText = document.querySelector(".type-detail-row")?.textContent.trim().replace(/\s+/g, " ") || "";
    const line = document.querySelector("#roster-input").value.split("\n").find(row => row.startsWith("Main,Groudon,")) || "";
    return {
      line,
      detailText: detailText.slice(0, 500),
      hasPrimalGroudonInDetail: detailText.includes("Primal Groudon"),
      hasReplacementMegaInDetail: detailText.includes("Mega Sceptile") || detailText.includes("Mega Venusaur"),
      savedMessage: document.querySelector("#messages").textContent
    };
  });
  if (!megaToggle.line.includes(",false,") || megaToggle.hasPrimalGroudonInDetail || !megaToggle.hasReplacementMegaInDetail) {
    throw new Error(`Can Mega/Primal checkbox did not affect slot 0: ${JSON.stringify(megaToggle)}`);
  }
  page.once("dialog", dialog => dialog.accept("CLEAR"));
  await page.click("#clear-button");
  await page.waitForFunction(() => document.querySelector("#summary-rows").textContent === "0");
  const cleared = await page.evaluate(() => ({
    csv: document.querySelector("#roster-input").value,
    rows: document.querySelector("#summary-rows").textContent,
    matched: document.querySelector("#summary-matched").textContent,
    savedCsv: localStorage.getItem("pokemonRaidRosterCurrentCsv"),
    sampleSuppressed: localStorage.getItem("pokemonRaidRosterSuppressSample")
  }));
  if (cleared.csv !== "" || cleared.rows !== "0" || cleared.matched !== "0" || cleared.savedCsv !== "" || cleared.sampleSuppressed !== "true") {
    throw new Error(`Clear did not persist an empty roster: ${JSON.stringify(cleared)}`);
  }
  await page.reload();
  await page.waitForSelector(".status-pill.ready", {timeout: 15000});
  await page.waitForFunction(() => document.querySelector("#summary-rows").textContent === "0");
  const reloadedClear = await page.evaluate(() => ({
    csv: document.querySelector("#roster-input").value,
    rows: document.querySelector("#summary-rows").textContent,
    matched: document.querySelector("#summary-matched").textContent,
    savedCsv: localStorage.getItem("pokemonRaidRosterCurrentCsv"),
    sampleSuppressed: localStorage.getItem("pokemonRaidRosterSuppressSample")
  }));
  if (reloadedClear.csv !== "" || reloadedClear.rows !== "0" || reloadedClear.matched !== "0" || reloadedClear.savedCsv !== "" || reloadedClear.sampleSuppressed !== "true") {
    throw new Error(`Cleared roster came back after reload: ${JSON.stringify(reloadedClear)}`);
  }
  await browser.close();
  console.log(JSON.stringify({empty, grass, mobile, cleared, reloadedClear}, null, 2));
})();
