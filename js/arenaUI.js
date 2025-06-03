function initializeArenaTab() {
  const player1SearchInput = document.getElementById("player1SearchInput");
  const player1Dropdown = document.getElementById("player1Dropdown");
  const player1Select = document.getElementById("player1Select");
  const player1TeamFilter = document.getElementById("player1TeamFilter");
  const player1PositionFilter = document.getElementById("player1PositionFilter");
  const player1Display = document.getElementById("player1Display");
  
  const player2SearchInput = document.getElementById("player2SearchInput");
  const player2Dropdown = document.getElementById("player2Dropdown");
  const player2Select = document.getElementById("player2Select");
  const player2TeamFilter = document.getElementById("player2TeamFilter");
  const player2PositionFilter = document.getElementById("player2PositionFilter");
  const player2Display = document.getElementById("player2Display");
  
  const statSelect = document.getElementById("statSelect");
  const compareButton = document.getElementById("compareButton");
  const resultDiv = document.getElementById("arenaResult");

  // Defensive: if these don't exist, don't proceed
  if (!player1SearchInput || !player1Dropdown || !player1Select || 
      !player2SearchInput || !player2Dropdown || !player2Select ||
      !player1TeamFilter || !player1PositionFilter || !player1Display ||
      !player2TeamFilter || !player2PositionFilter || !player2Display ||
      !statSelect || !compareButton || !resultDiv) {
    console.error("Arena tab: required elements not found.");
    return;
  }

  // Add local function if not available from utils
  const localNormalizePosition = function(pos) {
    if (!pos) return "";
    if (pos.includes("G")) return pos.includes("F") ? "SF" : "PG";
    if (pos.includes("F")) return pos.includes("C") ? "PF" : "SF";
    if (pos.includes("C")) return "C";
    return pos;
  };

  let filteredPlayers1 = [];
  let filteredPlayers2 = [];
  let selectedPlayer1 = null;
  let selectedPlayer2 = null;

  Promise.all([
    fetch("data/stats.json").then((res) => res.json()),
    fetch("data/teams.json").then((res) => res.json()),
  ]).then(([players, teams]) => {
    allPlayers = players.map((p) => ({
      ...p,
      position: typeof normalizePosition === 'function' ? normalizePosition(p.position) : localNormalizePosition(p.position),
    }));
    teamNames = teams;

    filteredPlayers1 = [...allPlayers];
    filteredPlayers2 = [...allPlayers];
    
    populateStatSelect(statSelect);
    populateTeamFilters();
    setupPlayerSearch();
    setupEventListeners();
    
    // Initial random selection
    selectRandomPlayers();
    updateCompareButtonState();
  }).catch((err) => {
    resultDiv.innerHTML = `<p class="text-danger">Failed to load arena data: ${err.message}</p>`;
  });

  function populateTeamFilters() {
    const teamOptions = '<option value="">All Teams</option>' + 
      Object.entries(teamNames)
        .sort(([,a], [,b]) => a.localeCompare(b))
        .map(([key, val]) => `<option value="${key}">${val}</option>`)
        .join('');
    
    player1TeamFilter.innerHTML = teamOptions;
    player2TeamFilter.innerHTML = teamOptions;
  }

  function setupPlayerSearch() {
    // Player 1 search functionality
    setupPlayerSearchForElement(1, player1SearchInput, player1Dropdown, player1Select, () => filteredPlayers1);
    
    // Player 2 search functionality
    setupPlayerSearchForElement(2, player2SearchInput, player2Dropdown, player2Select, () => filteredPlayers2);
  }

  function setupPlayerSearchForElement(playerNum, searchInput, dropdown, hiddenSelect, getFilteredPlayers) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchTerm.length === 0) {
        hideDropdown(dropdown);
        hiddenSelect.value = "";
        // Clear manual selection, go back to random
        if (playerNum === 1) {
          selectedPlayer1 = null;
          updatePlayerDisplay(1);
        } else {
          selectedPlayer2 = null;
          updatePlayerDisplay(2);
        }
        updateCompareButtonState();
        return;
      }

      const filtered = getFilteredPlayers().filter(player => 
        player.playerName.toLowerCase().includes(searchTerm)
      );

      showDropdown(dropdown, filtered, (player) => {
        selectSpecificPlayer(searchInput, hiddenSelect, dropdown, player, playerNum);
      });
    });

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim().length > 0) {
        const filtered = getFilteredPlayers().filter(player => 
          player.playerName.toLowerCase().includes(searchInput.value.toLowerCase().trim())
        );
        showDropdown(dropdown, filtered, (player) => {
          selectSpecificPlayer(searchInput, hiddenSelect, dropdown, player, playerNum);
        });
      }
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(`#player${playerNum}SearchInput`) && 
          !e.target.closest(`#player${playerNum}Dropdown`)) {
        hideDropdown(dropdown);
      }
    });
  }

  function showDropdown(dropdown, players, onSelectCallback) {
    dropdown.innerHTML = "";
    
    if (players.length === 0) {
      dropdown.innerHTML = '<div class="dropdown-item-text text-muted">No players found</div>';
    } else {
      players.slice(0, 10).forEach(player => {
        const item = document.createElement("a");
        item.className = "dropdown-item";
        item.href = "#";
        item.textContent = `${player.playerName} (${teamNames[player.team] || player.team})`;
        item.addEventListener("click", (e) => {
          e.preventDefault();
          onSelectCallback(player);
        });
        dropdown.appendChild(item);
      });

      if (players.length > 10) {
        const moreItem = document.createElement("div");
        moreItem.className = "dropdown-item-text text-muted";
        moreItem.textContent = `... and ${players.length - 10} more`;
        dropdown.appendChild(moreItem);
      }
    }

    dropdown.style.display = "block";
  }

  function hideDropdown(dropdown) {
    dropdown.style.display = "none";
  }

  function selectSpecificPlayer(searchInput, hiddenSelect, dropdown, player, playerNum) {
    searchInput.value = player.playerName;
    hiddenSelect.value = player.playerName;
    hideDropdown(dropdown);
    
    if (playerNum === 1) {
      selectedPlayer1 = player;
      updatePlayerDisplay(1);
    } else {
      selectedPlayer2 = player;
      updatePlayerDisplay(2);
    }
    updateCompareButtonState();
  }

  function applyFilters(playerNum) {
    const teamFilter = playerNum === 1 ? player1TeamFilter : player2TeamFilter;
    const positionFilter = playerNum === 1 ? player1PositionFilter : player2PositionFilter;
    
    let filtered = allPlayers.filter(player => {
      const teamMatch = !teamFilter.value || player.team === teamFilter.value;
      const positionMatch = !positionFilter.value || player.position === positionFilter.value;
      return teamMatch && positionMatch;
    });

    if (playerNum === 1) {
      filteredPlayers1 = filtered;
      // If no specific player selected, update random selection
      if (!selectedPlayer1) {
        updatePlayerDisplay(1);
      }
    } else {
      filteredPlayers2 = filtered;
      // If no specific player selected, update random selection
      if (!selectedPlayer2) {
        updatePlayerDisplay(2);
      }
    }

    // Clear search if current selection doesn't match filters
    const searchInput = playerNum === 1 ? player1SearchInput : player2SearchInput;
    const hiddenSelect = playerNum === 1 ? player1Select : player2Select;
    
    if (hiddenSelect.value) {
      const currentPlayer = allPlayers.find(p => p.playerName === hiddenSelect.value);
      if (currentPlayer && !filtered.includes(currentPlayer)) {
        searchInput.value = "";
        hiddenSelect.value = "";
        if (playerNum === 1) {
          selectedPlayer1 = null;
        } else {
          selectedPlayer2 = null;
        }
        updatePlayerDisplay(playerNum);
        updateCompareButtonState();
      }
    }
  }

  function updatePlayerDisplay(playerNum) {
    const display = playerNum === 1 ? player1Display : player2Display;
    const filteredPlayers = playerNum === 1 ? filteredPlayers1 : filteredPlayers2;
    const selectedPlayer = playerNum === 1 ? selectedPlayer1 : selectedPlayer2;
    
    if (selectedPlayer) {
      // Show specific selected player
      display.innerHTML = `
        <div class="text-center">
          <h5 class="text-primary mb-2">${selectedPlayer.playerName}</h5>
          <p class="mb-1"><strong>Team:</strong> ${teamNames[selectedPlayer.team] || selectedPlayer.team}</p>
          <p class="mb-0"><strong>Position:</strong> ${selectedPlayer.position}</p>
          <small class="text-muted">Manually selected</small>
        </div>
      `;
    } else {
      // Show random player info or filter status
      if (filteredPlayers.length === 0) {
        display.innerHTML = `
          <div class="text-center text-warning">
            <i class="fas fa-exclamation-triangle mb-2"></i>
            <p class="mb-0">No players match current filters</p>
          </div>
        `;
      } else {
        const randomPlayer = typeof getRandomFromPool === 'function' ? 
          getRandomFromPool(filteredPlayers) :
          filteredPlayers[Math.floor(Math.random() * filteredPlayers.length)];
        display.innerHTML = `
          <div class="text-center">
            <h6 class="text-secondary mb-2">Random from ${filteredPlayers.length} players</h6>
            <small class="text-muted">Player will be randomly selected on compare</small>
          </div>
        `;
      }
    }
  }

  function selectRandomPlayers() {
    updatePlayerDisplay(1);
    updatePlayerDisplay(2);
  }

  function setupEventListeners() {
    // Team filter listeners
    player1TeamFilter.addEventListener("change", () => {
      applyFilters(1);
      updateCompareButtonState();
    });
    
    player2TeamFilter.addEventListener("change", () => {
      applyFilters(2);
      updateCompareButtonState();
    });

    // Position filter listeners
    player1PositionFilter.addEventListener("change", () => {
      applyFilters(1);
      updateCompareButtonState();
    });
    
    player2PositionFilter.addEventListener("change", () => {
      applyFilters(2);
      updateCompareButtonState();
    });

    // Stat selection listener
    statSelect.addEventListener("change", updateCompareButtonState);

    // Compare button listener
    compareButton.addEventListener("click", () => {
      comparePlayersDirectly();
    });
  }

  function updateCompareButtonState() {
    const hasValidPlayer1 = selectedPlayer1 || filteredPlayers1.length > 0;
    const hasValidPlayer2 = selectedPlayer2 || filteredPlayers2.length > 0;
    const hasStat = statSelect.value.trim() !== "";
    
    compareButton.disabled = !(hasValidPlayer1 && hasValidPlayer2 && hasStat);
  }

  function populateStatSelect(select) {
    select.innerHTML = '<option value="">Select a stat...</option>';
    
    // Fallback if statLabels is not available
    const labels = typeof statLabels !== 'undefined' ? statLabels : {
      per: "PER",
      tsPercent: "TS%",
      winShares: "Win Shares",
      vorp: "VORP",
      box: "Box +/-",
      assistPercent: "Assist %",
      totalReboundPercent: "Total Rebound %",
      usagePercent: "Usage %"
    };
    
    Object.keys(labels).forEach((stat) => {
      const option = document.createElement("option");
      option.value = stat;
      option.textContent = labels[stat];
      select.appendChild(option);
    });
  }

  function comparePlayersDirectly() {
    const stat = statSelect.value;

    if (!stat) {
      resultDiv.innerHTML = "<div class='alert alert-danger'>Please select a stat to compare.</div>";
      return;
    }

    // Get actual players for comparison
    let player1, player2;

    if (selectedPlayer1) {
      player1 = selectedPlayer1;
    } else {
      if (filteredPlayers1.length === 0) {
        resultDiv.innerHTML = "<div class='alert alert-danger'>No valid players in Player 1 filter pool.</div>";
        return;
      }
      player1 = typeof getRandomFromPool === 'function' ? 
        getRandomFromPool(filteredPlayers1.filter(p => p[stat] != null)) :
        filteredPlayers1.filter(p => p[stat] != null)[Math.floor(Math.random() * filteredPlayers1.filter(p => p[stat] != null).length)];
    }

    if (selectedPlayer2) {
      player2 = selectedPlayer2;
    } else {
      if (filteredPlayers2.length === 0) {
        resultDiv.innerHTML = "<div class='alert alert-danger'>No valid players in Player 2 filter pool.</div>";
        return;
      }
      // Ensure player2 is different from player1
      let availablePool = filteredPlayers2.filter(p => p[stat] != null && p.playerName !== player1.playerName);
      if (availablePool.length === 0) {
        availablePool = filteredPlayers2.filter(p => p[stat] != null);
      }
      player2 = typeof getRandomFromPool === 'function' ? 
        getRandomFromPool(availablePool) : 
        availablePool[Math.floor(Math.random() * availablePool.length)];
    }

    if (!player1 || !player2) {
      resultDiv.innerHTML = "<div class='alert alert-danger'>Could not select valid players for comparison.</div>";
      return;
    }

    if (player1.playerName === player2.playerName) {
      resultDiv.innerHTML = "<div class='alert alert-warning'>Same player selected for both sides. Please adjust filters or manual selections.</div>";
      return;
    }

    // Get proper stat label from the select options
    const statSelectElement = document.getElementById('statSelect');
    const selectedOption = statSelectElement ? statSelectElement.options[statSelectElement.selectedIndex] : null;
    const statLabel = selectedOption ? selectedOption.textContent : stat;
    
    if (player1[stat] == null || player2[stat] == null) {
      resultDiv.innerHTML = `<div class='alert alert-warning'>One or both players have no data for ${statLabel}.</div>`;
      return;
    }

    const player1Stat = player1[stat];
    const player2Stat = player2[stat];
    const diff = player1Stat - player2Stat;
    const diffFormatted = Math.abs(diff).toFixed(2);

    const format = (v) =>
      stat === "tsPercent" ? (v * 100).toFixed(1) + "%" : v.toFixed(2);

    // Determine winner and performance indicators
    const isPlayer1Better = diff > 0;
    const betterPlayerStat = isPlayer1Better ? player1Stat : player2Stat;
    const performanceDiff = betterPlayerStat !== 0 ? ((Math.abs(diff) / betterPlayerStat) * 100).toFixed(1) : '0';
    
    const winnerBadge = isPlayer1Better 
      ? `<span class="badge bg-primary fs-6 px-3 py-2">Winner: ${player1.playerName}</span>`
      : `<span class="badge bg-info fs-6 px-3 py-2">Winner: ${player2.playerName}</span>`;

    const selectionInfo1 = selectedPlayer1 ? "Manually Selected" : "Randomly Selected from Filters";
    const selectionInfo2 = selectedPlayer2 ? "Manually Selected" : "Randomly Selected from Filters";

    // Get team colors and player images - with fallbacks
    const player1Colors = typeof getTeamColors === 'function' ? 
      getTeamColors(player1.team) : 
      { primary: '#6c757d', secondary: '#dee2e6' };
    
    const player2Colors = typeof getTeamColors === 'function' ? 
      getTeamColors(player2.team) : 
      { primary: '#6c757d', secondary: '#dee2e6' };
    
    const player1Gradient = typeof getTeamGradient === 'function' ? 
      getTeamGradient(player1.team) : 
      'linear-gradient(135deg, #6c757d, #dee2e6)';
    
    const player2Gradient = typeof getTeamGradient === 'function' ? 
      getTeamGradient(player2.team) : 
      'linear-gradient(135deg, #6c757d, #dee2e6)';
    
    const player1Initials = player1.playerName.split(' ').map(n => n[0]).join('');
    const player2Initials = player2.playerName.split(' ').map(n => n[0]).join('');

    resultDiv.innerHTML = `
      <div class="card">
        <div class="card-header text-center" style="background: linear-gradient(135deg, ${player1Colors.primary}, ${player2Colors.primary}); color: white;">
          <h3 class="mb-0">${player1.playerName} <span class="opacity-75">vs</span> ${player2.playerName}</h3>
          <p class="mb-0 opacity-75">Comparing ${statLabel}</p>
        </div>
        <div class="card-body">
          <!-- Winner Badge - Prominently displayed above both players -->
          <div class="text-center mb-4">
            <div class="mb-3">${winnerBadge}</div>
            <p class="mb-0" style="color: ${isPlayer1Better ? player1Colors.primary : player2Colors.primary}; font-weight: 600;">
              ${isPlayer1Better ? player1.playerName : player2.playerName} has the advantage in ${statLabel}
            </p>
          </div>
          
          <div class="row text-center">
            <div class="col-md-5">
              <div class="card h-100" style="border: 3px solid ${player1Colors.primary};">
                <div class="card-header text-white" style="background: ${player1Gradient};">
                  <h4 class="mb-1">${player1.playerName}</h4>
                  <small class="opacity-75">${selectionInfo1}</small>
                </div>
                <div class="position-relative text-center py-4" style="background: ${player1Gradient};">
                  <h3 class="text-white mb-0">${player1Initials}</h3>
                </div>
                <div class="card-body">
                  <p class="mb-1"><strong>Team:</strong> <span style="color: ${player1Colors.primary};">${teamNames[player1.team] || player1.team}</span></p>
                  <p class="mb-1"><strong>Position:</strong> ${player1.position}</p>
                  <p class="mb-3"><strong>${statLabel}:</strong></p>
                  <h2 class="stat-value" style="color: ${isPlayer1Better ? player1Colors.primary : '#6c757d'};">${format(player1Stat)}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-center justify-content-center">
              <div class="text-center">
                <i class="fas fa-balance-scale fa-3x text-muted mb-3"></i>
              </div>
            </div>
            <div class="col-md-5">
              <div class="card h-100" style="border: 3px solid ${player2Colors.primary};">
                <div class="card-header text-white" style="background: ${player2Gradient};">
                  <h4 class="mb-1">${player2.playerName}</h4>
                  <small class="opacity-75">${selectionInfo2}</small>
                </div>
                <div class="position-relative text-center py-4" style="background: ${player2Gradient};">
                  <h3 class="text-white mb-0">${player2Initials}</h3>
                </div>
                <div class="card-body">
                  <p class="mb-1"><strong>Team:</strong> <span style="color: ${player2Colors.primary};">${teamNames[player2.team] || player2.team}</span></p>
                  <p class="mb-1"><strong>Position:</strong> ${player2.position}</p>
                  <p class="mb-3"><strong>${statLabel}:</strong></p>
                  <h2 class="stat-value" style="color: ${!isPlayer1Better ? player2Colors.primary : '#6c757d'};">${format(player2Stat)}</h2>
                </div>
              </div>
            </div>
          </div>
          
          <hr class="my-4">
          <div class="text-center">
            <h5>Comparison Analysis</h5>
            <p class="mb-2">
              <strong>Difference:</strong> ${diffFormatted} points (${performanceDiff}% difference)
            </p>
          </div>
        </div>
      </div>
    `;

    // Scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}