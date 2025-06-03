// Legacy function for compatibility - the new arena uses direct comparison in arenaUI.js
function updateArenaComparison(
  playerSelect,
  statSelect,
  compareType,
  filterSelect,
  resultDiv,
) {
  // This function is kept for backward compatibility but is no longer used
  // The new arena interface handles comparison directly in arenaUI.js
  console.log("Legacy comparison function called - redirecting to new interface");
  
  resultDiv.innerHTML = `
    <div class="alert alert-info">
      <h5><i class="fas fa-info-circle me-2"></i>Arena Updated!</h5>
      <p class="mb-0">The Arena now supports direct player-to-player comparisons. Please use the new interface above.</p>
    </div>
  `;
}

// Utility function for direct player comparison (used by new arena interface)
function comparePlayersDirectly(player1, player2, stat, teamNames, statLabels) {
  if (!player1 || !player2 || !stat) {
    return { error: "Please select both players and a stat to compare." };
  }

  if (player1.playerName === player2.playerName) {
    return { error: "Please select two different players to compare." };
  }

  if (player1[stat] == null || player2[stat] == null) {
    return { error: `One or both players have no data for ${statLabels[stat]}.` };
  }

  const player1Stat = player1[stat];
  const player2Stat = player2[stat];
  const diff = player1Stat - player2Stat;

  const format = (v) =>
    stat === "tsPercent" ? (v * 100).toFixed(1) + "%" : v.toFixed(2);

  return {
    player1: player1,
    player2: player2,
    stat: stat,
    player1Stat: player1Stat,
    player2Stat: player2Stat,
    difference: diff,
    isPlayer1Better: diff > 0,
    formattedPlayer1Stat: format(player1Stat),
    formattedPlayer2Stat: format(player2Stat),
    statLabel: statLabels[stat]
  };
}
