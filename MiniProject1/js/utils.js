// utils.js

// Shared state
let allPlayers = [];
let teamNames = {};

// Useful stat keys and labels
const usefulStats = [
  "per",
  "tsPercent",
  "winShares",
  "vorp",
  "box",
  "assistPercent",
  "totalReboundPercent",
  "usagePercent",
];

const statLabels = {
  per: "PER",
  tsPercent: "TS%",
  winShares: "Win Shares",
  vorp: "VORP",
  box: "Box +/-",
  assistPercent: "Assist %",
  totalReboundPercent: "Total Rebound %",
  usagePercent: "Usage %",
  offensiveRBPercent: "Offensive Rebound %",
  defensiveRBPercent: "Defensive Rebound %",
  stealPercent: "Steal %",
  blockPercent: "Block %",
};

function normalizePosition(pos) {
  if (!pos) return "";
  if (pos.includes("G")) return pos.includes("F") ? "SF" : "PG";
  if (pos.includes("F")) return pos.includes("C") ? "PF" : "SF";
  if (pos.includes("C")) return "C";
  return pos;
}

function getLastName(fullName) {
  return fullName.split(" ").slice(-1)[0];
}

function getRandomFromPool(pool) {
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

// Player image functionality
// Note: Real NBA player images require authentication or have CORS restrictions
// We use placeholder images with team colors and player initials instead
// This approach is more reliable for demo purposes and ensures consistent loading
function generatePlayerPlaceholder(playerName, teamCode) {
  const initials = playerName.split(' ').map(n => n[0]).join('');
  const colors = getTeamColors(teamCode);
  return `https://via.placeholder.com/300x200/${colors.primary.substring(1)}/${colors.secondary.substring(1)}?text=${encodeURIComponent(initials)}&font-size=60`;
}

// Team colors mapping
const teamColors = {
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

// Get team colors
function getTeamColors(teamCode) {
  return teamColors[teamCode] || { primary: '#6c757d', secondary: '#dee2e6' };
}

// Generate team-colored gradient
function getTeamGradient(teamCode) {
  const colors = getTeamColors(teamCode);
  return `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`;
}
