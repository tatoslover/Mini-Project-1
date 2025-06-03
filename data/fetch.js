import fs from "fs/promises";

const API_URL = "http://rest.nbaapi.com/api/PlayerDataAdvanced/season/2024";

async function fetchData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    // Group by playerId
    const grouped = {};
    for (const player of data) {
      if (!grouped[player.playerId]) grouped[player.playerId] = [];
      grouped[player.playerId].push(player);
    }

    const finalData = [];

    for (const playerId in grouped) {
      const entries = grouped[playerId];
      const totEntry = entries.find((p) => p.team === "TOT");

      if (totEntry) {
        const nonTotEntries = entries.filter((p) => p.team !== "TOT");
        const mostRecentTeam = nonTotEntries.sort(
          (a, b) => b.games - a.games,
        )[0];

        if (mostRecentTeam) {
          // Replace team in TOT entry with most recent non-TOT team
          finalData.push({
            ...totEntry,
            team: mostRecentTeam.team,
          });
        } else {
          finalData.push(totEntry);
        }
      } else {
        finalData.push(...entries);
      }
    }

    console.log("✅ Processed data sample:", finalData.slice(0, 5));
    await fs.writeFile(
      "advancedStats2024.json",
      JSON.stringify(finalData, null, 2),
    );
    console.log("📁 Saved to advancedStats2024.json");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

fetchData();
