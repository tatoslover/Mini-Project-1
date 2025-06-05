## 🏀 NBA 2K Stat Attack
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue?logo=github)](https://github.com/tatoslover/Mini-Project-1)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-brightgreen?logo=netlify)](https://nbaadvancedstatattack.netlify.app)


Explore, filter, and compare NBA player stats with dynamic charts and team-themed visuals.

- 🧠 Powered by [NBA REST API](https://www.nba.com/stats/api) (~500 players)
- 📊 Built with Bootstrap 5, Chart.js, vanilla JS
- ⚡ Fast, responsive, animated interface

## Project File Structure Overview

### Root Files
- `index.html` - Main entry point with Bootstrap navbar and dynamic content container
- `README.md` - Project documentation
- `.gitignore` / `.gitattributes` - Git configuration files

<details>
<summary>📁 CSS Directory</summary>

- `css/style.css` - Complete styling system including:
  - Custom CSS variables for consistent theming
  - Basketball loading animation (now slowed down to 2s cycles)
  - Responsive design with mobile-first approach
  - Advanced animations (glow effects, hover transitions, pulse effects)
  - Team-specific color schemes for all 30 NBA teams
  - Chart styling and card enhancements
</details>

<details>
<summary>📁 JavaScript Directory</summary>

`js/main.js` - Core Navigation Controller
- Manages single-page application routing between tabs
- NEW: Basketball loading animation system (1.5s delay)
- Dynamic content loading with error handling
- Tab activation and state management

`js/api.js` - Data Management Layer
- `NBADataAPI` class - Simulates real API interactions
- Caching system for performance optimization
- Error handling with retry mechanisms and exponential backoff
- Batch request processing
- Progress tracking for large datasets
- Features:
  - Player search and filtering
  - Team statistics aggregation
  - Top performers analysis
  - Real-time data subscription simulation

`js/utils.js` - Shared Utilities
- Global state management (`allPlayers`, `teamNames`)
- Position normalization functions
- Player placeholder image generation
- Complete NBA team color mappings (30 teams)
- Stat label definitions and formatting

`js/players.js` - Players Tab Functionality
- Advanced filtering system (team, position, name search)
- Dynamic Chart.js visualizations:
  - Team performance bar chart
  - Position distribution pie chart
  - Top performers comparison charts
- Player card generation with team-themed styling
- Real-time filter updates and sorting

`js/arenaUI.js` - Arena Interface Controller
- Two-player comparison system
- Searchable dropdowns with real-time filtering
- Player selection with team/position filters
- Direct statistical comparisons with visual feedback

`js/arenaLogic.js` - Arena Comparison Logic
- Player-vs-player statistical analysis
- Comparison result formatting
- Legacy compatibility functions
</details>

<details>
<summary>📁 Data Directory</summary>

`data/stats.json` - Player Statistics Database
- Comprehensive NBA player data including:
  - Basic info (name, position, age, games played)
  - Advanced metrics (PER, True Shooting %, Win Shares, VORP)
  - Efficiency stats (usage %, rebound %, assist %)
  - ~500+ player records with complete statistical profiles

`data/teams.json` - Team Reference Data
- All 30 NBA team mappings (abbreviation → full name)
- Used for filtering and display purposes
</details>

<details>
<summary>📁 Pages Directory</summary>

`pages/about.html` - Project Information
- Hero section with technology badges
- Navigation sidebar with smooth scrolling
- Project overview and purpose explanation
- Data source information and technical details
- Contact information and acknowledgments

`pages/players.html` - Player Analysis Interface
- Filter controls (team, position, stat sorting, name search)
- Three interactive Chart.js visualizations
- Dynamic player card grid with pagination
- Real-time filtering and sorting capabilities

`pages/arena.html` - Player Comparison Interface
- Dual-panel layout for two-player selection
- Advanced filtering (team and position)
- Searchable player dropdowns
- Statistical comparison with visual indicators
- Head-to-head performance analysis
</details>

---

## 🎯 Key Features & Functionality

<details>
<summary>⚙️ Performance Optimizations</summary>

- Basketball loading animation (1.5s delay) for better UX
- Caching system for API calls
- Lazy loading of chart data
- Responsive image placeholders
</details>

<details>
<summary>📈 Data Visualization</summary>

- Chart.js integration for interactive charts
- Team performance analytics
- Position distribution analysis
- Top performer comparisons
</details>

<details>
<summary>📱 User Experience</summary>

- Mobile-responsive design with Bootstrap 5
- Smooth animations and transitions
- Real-time search and filtering
- Team-themed color schemes
- Accessibility features (ARIA labels, keyboard navigation)
</details>

<details>
<summary>🧱 Technical Architecture</summary>

- Single-page application with dynamic routing
- Modular JavaScript architecture
- Error handling and retry mechanisms
- Progressive enhancement approach
</details>

---

The application demonstrates modern web development practices with a focus on basketball analytics, providing an engaging platform for exploring NBA player performance data through interactive visualizations and comparison tools.
