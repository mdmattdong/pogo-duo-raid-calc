const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const root = process.cwd();
  const appPath = path.join(root, "outputs/pokemon-raid-roster/raid-boss.html");
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
  await page.addInitScript(() => localStorage.clear());
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
  await page.click("#raid-sample-button");
  await page.waitForSelector(".account-plan .pokemon-card", {timeout: 15000});
  const desktop = await page.evaluate(() => ({
    status: document.querySelector("#raid-data-status").textContent,
    boss: document.querySelector("#boss-info .pokemon-name")?.textContent || "",
    rows: document.querySelector("#raid-summary-rows").textContent,
    matched: document.querySelector("#raid-summary-matched").textContent,
    accounts: document.querySelector("#raid-summary-accounts").textContent,
    ttw: document.querySelector("#raid-summary-ttw").textContent,
    weaknessText: document.querySelector("#boss-weaknesses").textContent,
    selectedMegas: document.querySelector(".raid-scoreboard").textContent,
    damageCapacity: document.querySelector(".raid-scoreboard").textContent,
    damagePills: [...document.querySelectorAll(".damage-share-pill")].map(node => node.textContent.trim()),
    damageCards: [...document.querySelectorAll(".damage-share-card")].map(node => node.textContent.replace(/\s+/g, " ").trim()),
    adventureControls: [...document.querySelectorAll(".adventure-effect-row")].map(node => node.textContent.replace(/\s+/g, " ").trim()),
    accountPlans: document.querySelectorAll(".account-plan").length,
    megaCards: document.querySelectorAll(".account-plan .mega-row .pokemon-card").length,
    regularCards: document.querySelectorAll(".account-plan .regular-team-grid .pokemon-card").length,
    clickableCards: document.querySelectorAll(".account-plan button.pokemon-card[data-entry-uid]").length,
    rosterEntries: document.querySelectorAll("#raid-roster-box .roster-entry").length,
    potentialSections: [...document.querySelectorAll(".account-plan")].filter(plan => plan.textContent.includes("Potential")).length,
    bossOptions: [...document.querySelectorAll("#boss-select option")].map(option => option.textContent),
    shadowDisabled: document.querySelector("#boss-shadow-toggle").disabled,
    savedCsv: localStorage.getItem("pokemonRaidRosterCurrentCsv"),
    spriteUrls: [...document.querySelectorAll(".account-plan .pokemon-sprite")].map(img => img.src).slice(0, 4),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));

  const rosterBeforeClick = await page.locator("#raid-roster-input").inputValue();
  await page.locator(".account-plan button.pokemon-card[data-entry-uid]").first().click();
  await page.waitForSelector("#quick-edit-modal:not([hidden])", {timeout: 10000});
  const openedQuickEdit = await page.evaluate(() => ({
    rosterAfterClick: document.querySelector("#raid-roster-input").value,
    title: document.querySelector("#quick-edit-title").textContent,
    meta: document.querySelector("#quick-edit-meta").textContent,
    level: document.querySelector("#quick-edit-level").value,
    href: document.querySelector("#quick-edit-full-link").getAttribute("href")
  }));
  await page.fill("#quick-edit-level", "36.5");
  await page.waitForFunction(() => Boolean(document.querySelector("#quick-edit-cp").value), null, {timeout: 10000});
  await page.click("#quick-edit-save");
  await page.waitForFunction(() => document.querySelector("#raid-messages").textContent.includes("Saved Roster #"), null, {timeout: 10000});
  await page.waitForSelector("#raid-roster-box .roster-entry.is-expanded", {timeout: 10000});
  const savedRoster = await page.evaluate(() => ({
    csv: document.querySelector("#raid-roster-input").value,
    savedCsv: localStorage.getItem("pokemonRaidRosterCurrentCsv"),
    hasSavedMessage: document.querySelector("#raid-messages").textContent.includes("sample preview"),
    hasExpandedRosterEntry: Boolean(document.querySelector("#raid-roster-box .roster-entry.is-expanded")),
    rows: document.querySelector("#raid-summary-rows").textContent,
    matched: document.querySelector("#raid-summary-matched").textContent
  }));

  await page.setViewportSize({width: 390, height: 900});
  const mobile = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    accountPlans: document.querySelectorAll(".account-plan").length,
    shellWidth: document.querySelector(".app-shell").getBoundingClientRect().width
  }));

  if (errors.length) throw new Error(`Browser errors: ${errors.join(" | ")}`);
  if (desktop.boss !== "Kyurem" || desktop.rows !== "20" || desktop.matched !== "20" || desktop.accounts !== "2") {
    throw new Error(`Raid summary did not load as expected: ${JSON.stringify(desktop)}`);
  }
  if (desktop.savedCsv !== null) {
    throw new Error(`Raid sample preview should not save over current roster: ${JSON.stringify(desktop)}`);
  }
  if (!desktop.weaknessText.includes("Fighting") || !desktop.weaknessText.includes("Fairy") || !desktop.selectedMegas.includes("Mega Rayquaza") || !desktop.selectedMegas.includes("Mega Lucario")) {
    throw new Error(`Raid plan did not show expected boss weaknesses and paired Megas: ${JSON.stringify(desktop)}`);
  }
  if (!desktop.damageCapacity.includes("Damage capacity") || desktop.damagePills.length !== 2 || !desktop.damagePills.every(text => text.includes("% boss HP")) || !desktop.damageCards.every(text => text.includes("Boss HP damage") && text.includes("boosted DPS"))) {
    throw new Error(`Raid plan did not show per-account boss HP damage capacity: ${JSON.stringify(desktop)}`);
  }
  if (desktop.adventureControls.length !== 2 || !desktop.adventureControls.every(text => text.includes("Zacian attack") && text.includes("Zamazenta defense") && text.includes("Mewtwo X Mega damage"))) {
    throw new Error(`Raid page did not render per-account Adventure Effect controls: ${JSON.stringify(desktop.adventureControls)}`);
  }
  if (desktop.accountPlans !== 2 || desktop.megaCards !== 2 || desktop.regularCards < 10 || desktop.clickableCards < 10 || desktop.rosterEntries !== 20 || desktop.potentialSections !== 2 || !desktop.spriteUrls.every(src => src.startsWith("https://www.serebii.net/pokemongo/pokemon/"))) {
    throw new Error(`Raid visual plan missing expected cards or sprites: ${JSON.stringify(desktop)}`);
  }
  if (openedQuickEdit.rosterAfterClick !== rosterBeforeClick || !openedQuickEdit.title || !openedQuickEdit.meta.includes("Roster #") || !openedQuickEdit.href.startsWith("#raid-roster-entry-")) {
    throw new Error(`Raid card click did not open the quick editor without mutating CSV: ${JSON.stringify(openedQuickEdit)}`);
  }
  if (!savedRoster.csv.includes(",36.5,") || savedRoster.savedCsv !== null || !savedRoster.hasSavedMessage || !savedRoster.hasExpandedRosterEntry || savedRoster.rows !== "20" || savedRoster.matched !== "20") {
    throw new Error(`Raid roster quick edit did not save and recalculate safely: ${JSON.stringify(savedRoster)}`);
  }
  if (!desktop.bossOptions.some(label => label.includes("Mega Venusaur") && label.includes("Tier-4 Mega")) ||
      !["Mega Victreebel", "Mega Dragonite", "Mega Malamar"].every(name => desktop.bossOptions.some(label => label.includes(name) && label.includes("Tier-4 Mega"))) ||
      !desktop.bossOptions.some(label => label.includes("Primal Kyogre") && label.includes("Tier-6")) ||
      !desktop.bossOptions.some(label => label.includes("Enamorus") && label.includes("Tier-7")) ||
      desktop.bossOptions.some(label => label.startsWith("Shadow "))) {
    throw new Error(`Raid boss dropdown did not include expected tiers or still listed Shadow variants: ${JSON.stringify(desktop.bossOptions.slice(0, 20))}`);
  }

  await page.selectOption("#boss-select", {label: "Mewtwo · Tier-5"});
  await page.check("#boss-shadow-toggle");
  await page.waitForFunction(() => document.querySelector("#boss-info .pokemon-name")?.textContent === "Shadow Mewtwo");
  const shadow = await page.evaluate(() => ({
    boss: document.querySelector("#boss-info .pokemon-name")?.textContent || "",
    shadowEnabled: !document.querySelector("#boss-shadow-toggle").disabled,
    shadowChecked: document.querySelector("#boss-shadow-toggle").checked,
    context: document.querySelector("#raid-context").textContent,
    bossInfo: document.querySelector("#boss-info").textContent,
    rows: document.querySelector("#raid-summary-rows").textContent,
    matched: document.querySelector("#raid-summary-matched").textContent,
    accountPlans: document.querySelectorAll(".account-plan").length
  }));
  if (shadow.boss !== "Shadow Mewtwo" || !shadow.shadowEnabled || !shadow.shadowChecked || !shadow.bossInfo.includes("8 total Purified Gems") || !shadow.context.includes("boss is treated as subdued") || shadow.rows !== "20" || shadow.matched !== "20" || shadow.accountPlans !== 2) {
    throw new Error(`Shadow boss assumption did not render correctly: ${JSON.stringify(shadow)}`);
  }

  await page.selectOption("#boss-select", {label: "Primal Kyogre · Tier-6 Mega/Primal"});
  await page.waitForFunction(() => document.querySelector("#boss-info")?.textContent.includes("22,500 HP"));
  const primal = await page.evaluate(() => ({
    boss: document.querySelector("#boss-info .pokemon-name")?.textContent || "",
    shadowDisabled: document.querySelector("#boss-shadow-toggle").disabled,
    info: document.querySelector("#boss-info").textContent,
    context: document.querySelector("#raid-context").textContent
  }));
  if (primal.boss !== "Primal Kyogre" || !primal.shadowDisabled || !primal.info.includes("22,500 HP") || !primal.context.includes("win speed affects energy rewards")) {
    throw new Error(`Tier-6 Primal raid display did not render correctly: ${JSON.stringify(primal)}`);
  }

  if (mobile.accountPlans !== 2 || mobile.overflow) {
    throw new Error(`Raid page mobile layout overflowed: ${JSON.stringify(mobile)}`);
  }

  await browser.close();
  console.log(JSON.stringify({desktop, shadow, primal, mobile}, null, 2));
})();
