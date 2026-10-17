/* Runs before any page initializes its roster. Existing storage is never migrated. */
(() => {
  "use strict";
  const backupKey = "pokemonRaidRosterBeforeMegaLevel4_20261017";
  const keys = [
    "pokemonRaidRosterCurrentCsv", "pokemonRaidRosterPreviousCsv",
    "pokemonRaidRosterPendingCsv", "pokemonRaidRosterManualRows",
    "pokemonRaidRosterManualRowsBackup", "pokemonRaidRosterPlayerNames",
    "pokemonRaidRosterSuppressSample"
  ];

  function capture() {
    const values = {};
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value !== null) values[key] = value;
    }
    return {version: 1, savedAt: new Date().toISOString(), source: location.href, values};
  }

  function ensureBackup() {
    try {
      if (localStorage.getItem(backupKey) !== null) return "Previous roster backup is saved in this browser.";
      const backup = capture();
      const hasRoster = keys.slice(0, 5).some(key => backup.values[key] && backup.values[key] !== "[]");
      if (!hasRoster) return "No previous roster found at this browser address. Open the original app file to access its saved roster.";
      localStorage.setItem(backupKey, JSON.stringify(backup));
      return "Previous roster backed up in this browser. Download a copy to keep it outside browser storage.";
    } catch (error) {
      return "Browser backup unavailable. Download a roster backup before editing your Pokémon.";
    }
  }

  const status = ensureBackup();
  document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("download-roster-backup");
    const message = document.getElementById("roster-backup-status");
    if (message) message.textContent = status;
    if (!button) return;
    button.addEventListener("click", () => {
      try {
        const backup = {current: capture(), beforeMegaLevel4: JSON.parse(localStorage.getItem(backupKey) || "null")};
        const blob = new Blob([JSON.stringify(backup, null, 2)], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `pokemon-roster-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        if (message) message.textContent = "Roster backup downloaded, including current entries and the saved pre-update snapshot.";
      } catch (error) {
        if (message) message.textContent = "Could not download the backup. Keep this page open and export your roster CSV before editing.";
      }
    });
  });
})();
