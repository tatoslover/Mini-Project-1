// api.js - Simulated API interactions to demonstrate fetch techniques

class NBADataAPI {
  constructor() {
    this.baseURL = 'data/'; // Our local data directory
    this.cache = new Map();
    this.requestDelay = 500; // Simulate network latency
  }

  // Simulate API loading with delays and error handling
  async simulateAPICall(endpoint, options = {}) {
    const { useCache = true, retries = 3 } = options;
    
    // Check cache first
    if (useCache && this.cache.has(endpoint)) {
      console.log(`📋 Cache hit for ${endpoint}`);
      await this.delay(100); // Minimal delay for cache
      return this.cache.get(endpoint);
    }

    console.log(`🌐 Fetching ${endpoint}...`);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Simulate network delay
        await this.delay(this.requestDelay);
        
        // Actual fetch call
        const response = await fetch(this.baseURL + endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache successful responses
        if (useCache) {
          this.cache.set(endpoint, data);
          console.log(`💾 Cached ${endpoint}`);
        }
        
        console.log(`✅ Successfully fetched ${endpoint}`);
        return data;
        
      } catch (error) {
        console.warn(`⚠️ Attempt ${attempt} failed for ${endpoint}:`, error.message);
        
        if (attempt === retries) {
          throw new Error(`Failed to fetch ${endpoint} after ${retries} attempts: ${error.message}`);
        }
        
        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 500);
      }
    }
  }

  // Utility method for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all players with optional filters
  async getPlayers(filters = {}) {
    const players = await this.simulateAPICall('stats.json');
    
    return this.applyFilters(players, filters);
  }

  // Get teams data
  async getTeams() {
    return await this.simulateAPICall('teams.json');
  }

  // Get player by name
  async getPlayerByName(playerName) {
    const players = await this.getPlayers();
    const player = players.find(p => p.playerName.toLowerCase() === playerName.toLowerCase());
    
    if (!player) {
      throw new Error(`Player "${playerName}" not found`);
    }
    
    return player;
  }

  // Get players by team
  async getPlayersByTeam(teamCode) {
    return await this.getPlayers({ team: teamCode });
  }

  // Get players by position
  async getPlayersByPosition(position) {
    return await this.getPlayers({ position: position });
  }

  // Get top performers for a specific stat
  async getTopPerformers(stat, limit = 10) {
    const players = await this.getPlayers();
    
    return players
      .filter(player => player[stat] != null && player[stat] !== 0)
      .sort((a, b) => (b[stat] || 0) - (a[stat] || 0))
      .slice(0, limit);
  }

  // Search players by name
  async searchPlayers(query, limit = 20) {
    const players = await this.getPlayers();
    const searchTerm = query.toLowerCase();
    
    return players
      .filter(player => player.playerName.toLowerCase().includes(searchTerm))
      .slice(0, limit);
  }

  // Get team statistics
  async getTeamStats() {
    const [players, teams] = await Promise.all([
      this.getPlayers(),
      this.getTeams()
    ]);

    const teamStats = {};
    
    players.forEach(player => {
      const teamCode = player.team;
      if (!teamStats[teamCode]) {
        teamStats[teamCode] = {
          name: teams[teamCode] || teamCode,
          players: [],
          avgPER: 0,
          totalWinShares: 0,
          avgTrueShootingPct: 0
        };
      }
      teamStats[teamCode].players.push(player);
    });

    // Calculate team averages
    Object.keys(teamStats).forEach(teamCode => {
      const team = teamStats[teamCode];
      const validPlayers = team.players.filter(p => p.per != null);
      
      if (validPlayers.length > 0) {
        team.avgPER = validPlayers.reduce((sum, p) => sum + (p.per || 0), 0) / validPlayers.length;
        team.totalWinShares = team.players.reduce((sum, p) => sum + (p.winShares || 0), 0);
        team.avgTrueShootingPct = validPlayers
          .filter(p => p.tsPercent != null)
          .reduce((sum, p) => sum + (p.tsPercent || 0), 0) / validPlayers.filter(p => p.tsPercent != null).length;
      }
    });

    return teamStats;
  }

  // Apply filters to players array
  applyFilters(players, filters) {
    let filtered = [...players];

    if (filters.team) {
      filtered = filtered.filter(p => p.team === filters.team);
    }

    if (filters.position) {
      filtered = filtered.filter(p => p.position === filters.position);
    }

    if (filters.minPER) {
      filtered = filtered.filter(p => (p.per || 0) >= filters.minPER);
    }

    if (filters.season) {
      filtered = filtered.filter(p => p.season === filters.season);
    }

    return filtered;
  }

  // Simulate real-time data updates
  async subscribeToUpdates(callback) {
    console.log('📡 Subscribing to live updates...');
    
    const interval = setInterval(async () => {
      try {
        // Simulate getting "fresh" data
        const freshData = await this.simulateAPICall('stats.json', { useCache: false });
        callback({
          type: 'data_update',
          data: freshData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        callback({
          type: 'error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      console.log('🔌 Unsubscribed from updates');
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache statistics
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalMemory: JSON.stringify(Array.from(this.cache.values())).length
    };
  }
}

// Create global API instance
const nbaAPI = new NBADataAPI();

// Enhanced fetch utilities
const APIUtils = {
  // Batch multiple API calls
  async batchRequests(requests) {
    console.log(`🔄 Executing ${requests.length} batch requests...`);
    
    try {
      const results = await Promise.allSettled(requests);
      
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);
      
      if (failed.length > 0) {
        console.warn(`⚠️ ${failed.length} requests failed:`, failed);
      }
      
      console.log(`✅ ${successful.length}/${requests.length} requests completed successfully`);
      return { successful, failed };
      
    } catch (error) {
      console.error('❌ Batch request failed:', error);
      throw error;
    }
  },

  // Retry mechanism with exponential backoff
  async retryRequest(requestFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`🔄 Retry attempt ${attempt + 1} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  // Request with timeout
  async requestWithTimeout(requestFn, timeout = 10000) {
    return Promise.race([
      requestFn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  },

  // Progress tracking for large datasets
  async fetchWithProgress(endpoint, onProgress) {
    const response = await fetch(endpoint);
    const reader = response.body.getReader();
    const contentLength = +response.headers.get('Content-Length');
    
    let receivedLength = 0;
    let chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedLength += value.length;
      
      if (onProgress && contentLength) {
        onProgress({
          loaded: receivedLength,
          total: contentLength,
          percentage: Math.round((receivedLength / contentLength) * 100)
        });
      }
    }
    
    const chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }
    
    const result = new TextDecoder("utf-8").decode(chunksAll);
    return JSON.parse(result);
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NBADataAPI, nbaAPI, APIUtils };
}