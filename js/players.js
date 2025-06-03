// ----------- Players tab code ------------

// Local fallback functions in case utils.js isn't loaded
function localNormalizePosition(pos) {
  if (!pos) return "";
  if (pos.includes("G")) return pos.includes("F") ? "SF" : "PG";
  if (pos.includes("F")) return pos.includes("C") ? "PF" : "SF";
  if (pos.includes("C")) return "C";
  return pos;
}

function localGetLastName(fullName) {
  return fullName.split(" ").slice(-1)[0];
}

function localGetRandomFromPool(pool) {
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

function initializePlayersTab() {
  // Find elements inside loaded players.html
  const container = document.getElementById("card-container");
  const teamFilter = document.getElementById("teamFilter");
  const positionFilter = document.getElementById("positionFilter");
  const statSort = document.getElementById("statSort");
  const nameSearch = document.getElementById("nameSearch");

  // Defensive: if these don't exist, don't proceed
  if (
    !container ||
    !teamFilter ||
    !positionFilter ||
    !statSort ||
    !nameSearch
  ) {
    console.error("Players tab: required elements not found.");
    return;
  }

  // Load player and team data (you could cache this if you want)
  Promise.all([
    fetch("data/stats.json").then((res) => res.json()),
    fetch("data/teams.json").then((res) => res.json()),
  ])
    .then(([players, teams]) => {
      allPlayers = players
        .map((p) => ({
          ...p,
          position: typeof normalizePosition === 'function' ? normalizePosition(p.position) : localNormalizePosition(p.position),
        }))
        .sort((a, b) =>
          (typeof getLastName === 'function' ? getLastName(a.playerName) : localGetLastName(a.playerName))
          .localeCompare(typeof getLastName === 'function' ? getLastName(b.playerName) : localGetLastName(b.playerName)),
        );

      teamNames = teams;

      populateTeamFilter(allPlayers, teamFilter);
      populatePositionFilter(allPlayers, positionFilter);
      displayPlayers(allPlayers, container);
      createCharts(allPlayers);

      teamFilter.addEventListener("change", () =>
        filterAndSortPlayers(
          container,
          teamFilter,
          positionFilter,
          statSort,
          nameSearch,
        ),
      );
      positionFilter.addEventListener("change", () =>
        filterAndSortPlayers(
          container,
          teamFilter,
          positionFilter,
          statSort,
          nameSearch,
        ),
      );
      statSort.addEventListener("change", () =>
        filterAndSortPlayers(
          container,
          teamFilter,
          positionFilter,
          statSort,
          nameSearch,
        ),
      );
      nameSearch.addEventListener("input", () =>
        filterAndSortPlayers(
          container,
          teamFilter,
          positionFilter,
          statSort,
          nameSearch,
        ),
      );
    })
    .catch((err) => {
      container.innerHTML = `<p class="text-danger">Failed to load player data: ${err.message}</p>`;
    });
}

function normalizePosition(pos) {
  if (!pos) return "Unknown";
  const primary = pos.split("-")[0];
  const validPositions = ["PG", "SG", "SF", "PF", "C"];
  return validPositions.includes(primary) ? primary : "Unknown";
}

function getLastName(fullName) {
  return fullName.trim().split(" ").slice(-1)[0].toLowerCase();
}

function getRandomFromPool(pool) {
  return typeof localGetRandomFromPool === 'function' ? localGetRandomFromPool(pool) : 
    (pool.length ? pool[Math.floor(Math.random() * pool.length)] : null);
}

function displayPlayers(players, container) {
  container.innerHTML = "";

  players.forEach((player) => {
    const card = document.createElement("div");
    card.className = "col-sm-6 col-md-4 col-lg-3";

    // Define team colors locally if not available from utils
    const localTeamColors = {
      'ATL': { primary: '#E03A3E', secondary: '#C1D32F' },
      'BOS': { primary: '#007A33', secondary: '#BA9653' },
      'BRK': { primary: '#000000', secondary: '#FFFFFF' },
      'CHA': { primary: '#1D1160', secondary: '#00788C' },
      'CHI': { primary: '#CE1141', secondary: '#000000' },
      'CLE': { primary: '#6F263D', secondary: '#FFB81C' },
      'DAL': { primary: '#00538C', secondary: '#002B5E' },
      'DEN': { primary: '#0E2240', secondary: '#FEC524' },
      'DET': { primary: '#C8102E', secondary: '#006BB6' },
      'GSW': { primary: '#1D428A', secondary: '#FFC72C' },
      'HOU': { primary: '#CE1141', secondary: '#000000' },
      'IND': { primary: '#002D62', secondary: '#FDBB30' },
      'LAC': { primary: '#C8102E', secondary: '#1D428A' },
      'LAL': { primary: '#552583', secondary: '#FDB927' },
      'MEM': { primary: '#5D76A9', secondary: '#12173F' },
      'MIA': { primary: '#98002E', secondary: '#F9A01B' },
      'MIL': { primary: '#00471B', secondary: '#EEE1C6' },
      'MIN': { primary: '#0C2340', secondary: '#236192' },
      'NOP': { primary: '#0C2340', secondary: '#C8102E' },
      'NYK': { primary: '#006BB6', secondary: '#F58426' },
      'OKC': { primary: '#007AC1', secondary: '#EF3B24' },
      'ORL': { primary: '#0077C0', secondary: '#C4CED4' },
      'PHI': { primary: '#006BB6', secondary: '#ED174C' },
      'PHX': { primary: '#1D1160', secondary: '#E56020' },
      'POR': { primary: '#E03A3E', secondary: '#000000' },
      'SAC': { primary: '#5A2D81', secondary: '#63727A' },
      'SAS': { primary: '#C4CED4', secondary: '#000000' },
      'TOR': { primary: '#CE1141', secondary: '#000000' },
      'UTA': { primary: '#002B5C', secondary: '#00471B' },
      'WAS': { primary: '#002B5C', secondary: '#E31837' }
    };

    // Get team colors for styling
    const teamColors = localTeamColors[player.team] || { primary: '#6c757d', secondary: '#dee2e6' };
    const teamGradient = `linear-gradient(135deg, ${teamColors.primary}, ${teamColors.secondary})`;

    // Fallback for usefulStats
    const statsToShow = typeof usefulStats !== 'undefined' ? usefulStats : [
      "per", "tsPercent", "winShares", "vorp", "box", "assistPercent", "totalReboundPercent", "usagePercent"
    ];

    const statLabelsLocal = typeof statLabels !== 'undefined' ? statLabels : {
      per: "PER",
      tsPercent: "TS%",
      winShares: "Win Shares",
      vorp: "VORP",
      box: "Box +/-",
      assistPercent: "Assist %",
      totalReboundPercent: "Total Rebound %",
      usagePercent: "Usage %"
    };

    card.innerHTML = `
      <div class="card h-100 shadow team-card" style="border: 3px solid ${teamColors.primary}; border-top: 6px solid ${teamColors.primary};">
        <div class="card-header text-white text-center" style="background: ${teamGradient}; border-bottom: 2px solid ${teamColors.primary};">
          <h5 class="mb-1" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">${player.playerName}</h5>
          <h6 class="mb-0 opacity-90" style="font-weight: 600;">${teamNames[player.team] || player.team} • ${player.position}</h6>
        </div>
        <div class="card-body">
          <div class="stats-container">
            ${statsToShow
              .map((stat) => {
                const value = player[stat];
                if (value === undefined || value === null) return "";
                const label = statLabelsLocal[stat] || stat;
                const formatted =
                  stat === "tsPercent"
                    ? (value * 100).toFixed(1) + "%"
                    : value.toFixed(1);
                return `
                  <div class="stat-row d-flex justify-content-between align-items-center mb-1">
                    <small class="text-muted">${label}:</small>
                    <span class="badge" style="background: ${teamGradient}; color: white;">${formatted}</span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function populateTeamFilter(players, teamFilter) {
  teamFilter.innerHTML = `<option value="all">All Teams</option>`;
  const teams = [...new Set(players.map((p) => p.team))].sort();
  teams.forEach((team) => {
    const option = document.createElement("option");
    option.value = team;
    option.textContent = teamNames[team] || team;
    teamFilter.appendChild(option);
  });
}

function populatePositionFilter(players, positionFilter) {
  positionFilter.innerHTML = `<option value="all">All Positions</option>`;
  const positions = ["PG", "SG", "SF", "PF", "C"];
  positions.forEach((pos) => {
    const option = document.createElement("option");
    option.value = pos;
    option.textContent = pos;
    positionFilter.appendChild(option);
  });
}

function filterAndSortPlayers(
  container,
  teamFilter,
  positionFilter,
  statSort,
  nameSearch,
) {
  const selectedTeam = teamFilter.value;
  const selectedPos = positionFilter.value;
  const selectedStat = statSort.value;
  const searchText = nameSearch.value.toLowerCase();

  let filtered = allPlayers.filter((p) => {
    const teamMatch = selectedTeam === "all" || p.team === selectedTeam;
    const posMatch = selectedPos === "all" || p.position === selectedPos;
    const nameMatch = p.playerName.toLowerCase().includes(searchText);
    return teamMatch && posMatch && nameMatch;
  });

  if (selectedStat !== "default") {
    filtered.sort((a, b) => (b[selectedStat] ?? 0) - (a[selectedStat] ?? 0));
  }

  displayPlayers(filtered, container);
  
  // Update dynamic charts with filtered data
  createPositionChart(filtered);
  createTopPerformersChart(filtered);
}

function createCharts(players) {
  createTeamChart(players);
  createPositionChart(players);
  createTopPerformersChart(players);
}

function createTeamChart(players) {
  const teamCtx = document.getElementById('teamChart');
  if (!teamCtx) return;

  // Aggregate team stats for all players
  const teamStats = {};
  allPlayers.forEach(player => {
    const teamName = teamNames[player.team] || player.team;
    if (!teamStats[teamName]) {
      teamStats[teamName] = { count: 0, totalPER: 0, totalWinShares: 0 };
    }
    teamStats[teamName].count++;
    teamStats[teamName].totalPER += player.per || 0;
    teamStats[teamName].totalWinShares += player.winShares || 0;
  });

  // Calculate averages and prepare data for all teams
  const teamData = Object.entries(teamStats)
    .map(([team, stats]) => ({
      team,
      avgPER: stats.totalPER / stats.count,
      totalWinShares: stats.totalWinShares
    }))
    .sort((a, b) => b.avgPER - a.avgPER);

  // Generate colors using actual team colors
  const colors = teamData.map((team) => {
    const teamCode = Object.keys(teamNames).find(code => teamNames[code] === team.team);
    if (teamCode && typeof getTeamColors === 'function') {
      return getTeamColors(teamCode).primary;
    }
    // Fallback to HSL if team not found
    const index = teamData.indexOf(team);
    const hue = (index * 137.508) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  });

  new Chart(teamCtx, {
    type: 'bar',
    data: {
      labels: teamData.map(d => Object.keys(teamNames).find(code => teamNames[code] === d.team) || d.team),
      datasets: [{
        label: 'Average PER',
        data: teamData.map(d => d.avgPER),
        backgroundColor: colors.map(color => color.includes('#') ? color + '80' : color),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 1,
          callbacks: {
            title: function(context) {
              const data = teamData[context[0].dataIndex];
              return data.team; // Show full team name in title
            },
            label: function(context) {
              const data = teamData[context.dataIndex];
              return [
                `Average PER: ${data.avgPER.toFixed(2)}`,
                `Total Win Shares: ${data.totalWinShares.toFixed(1)}`,
                `Players: ${teamStats[data.team].count}`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: '#666'
          },
          title: {
            display: true,
            text: 'Average PER',
            color: '#333',
            font: {
              weight: 'bold'
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#666',
            maxRotation: 45,
            font: {
              size: 11
            }
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      }
    }
  });
}

let positionChart = null;

function createPositionChart(players) {
  const positionCtx = document.getElementById('positionChart');
  if (!positionCtx) return;

  // Destroy existing chart if it exists
  if (positionChart) {
    positionChart.destroy();
  }

  // Count players by position from filtered data
  const positionCounts = {};
  players.forEach(player => {
    const pos = player.position || 'Unknown';
    positionCounts[pos] = (positionCounts[pos] || 0) + 1;
  });

  const positions = Object.keys(positionCounts);
  const colors = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)', 
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)'
  ];

  positionChart = new Chart(positionCtx, {
    type: 'doughnut',
    data: {
      labels: positions,
      datasets: [{
        label: 'Player Count',
        data: positions.map(pos => positionCounts[pos] || 0),
        backgroundColor: colors.slice(0, positions.length),
        borderColor: colors.slice(0, positions.length).map(color => color.replace('0.8', '1')),
        borderWidth: 3,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            color: '#666',
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((context.parsed * 100) / total).toFixed(1) : '0';
              return `${context.label}: ${context.parsed} players (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500,
        easing: 'easeInOutQuart'
      }
    }
  });
}

let topPerformersChart = null;

function createTopPerformersChart(players) {
  const topPerformersCtx = document.getElementById('topPerformersChart');
  if (!topPerformersCtx) return;

  // Destroy existing chart if it exists
  if (topPerformersChart) {
    topPerformersChart.destroy();
  }

  // Get the currently selected stat for sorting, default to PER
  const statSelect = document.getElementById('statSort');
  const currentStat = statSelect && statSelect.value !== 'default' ? statSelect.value : 'per';
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
  const statLabel = labels[currentStat] || 'PER';

  // Get top 5 players for the current stat
  const topPlayers = players
    .filter(player => player[currentStat] != null && player[currentStat] !== 0)
    .sort((a, b) => (b[currentStat] || 0) - (a[currentStat] || 0))
    .slice(0, 5);

  if (topPlayers.length === 0) {
    topPerformersCtx.getContext('2d').clearRect(0, 0, topPerformersCtx.width, topPerformersCtx.height);
    return;
  }

  const playerNames = topPlayers.map(p => p.playerName.split(' ').slice(-1)[0]); // Last names only
  const statValues = topPlayers.map(p => p[currentStat]);

  topPerformersChart = new Chart(topPerformersCtx, {
    type: 'bar',
    data: {
      labels: playerNames,
      datasets: [{
        label: statLabel,
        data: statValues,
        backgroundColor: [
          'rgba(255, 215, 0, 0.8)',    // Gold
          'rgba(192, 192, 192, 0.8)',  // Silver
          'rgba(205, 127, 50, 0.8)',   // Bronze
          'rgba(13, 110, 253, 0.8)',   // Blue
          'rgba(108, 117, 125, 0.8)'   // Gray
        ],
        borderColor: [
          'rgba(255, 215, 0, 1)',
          'rgba(192, 192, 192, 1)',
          'rgba(205, 127, 50, 1)',
          'rgba(13, 110, 253, 1)',
          'rgba(108, 117, 125, 1)'
        ],
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          callbacks: {
            title: function(context) {
              const playerIndex = context[0].dataIndex;
              return topPlayers[playerIndex].playerName;
            },
            label: function(context) {
              const value = currentStat === 'tsPercent' 
                ? (context.parsed.x * 100).toFixed(1) + '%'
                : context.parsed.x.toFixed(2);
              return `${statLabel}: ${value}`;
            },
            afterLabel: function(context) {
              const playerIndex = context.dataIndex;
              const player = topPlayers[playerIndex];
              return `Team: ${teamNames[player.team] || player.team}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: '#666',
            callback: function(value) {
              return currentStat === 'tsPercent' 
                ? (value * 100).toFixed(0) + '%'
                : value.toFixed(1);
            }
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            color: '#666',
            font: {
              size: 11
            }
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart'
      }
    }
  });
}
