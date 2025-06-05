const pageContent = document.getElementById("page-content");

const tabs = {
  navAbout: "pages/about",
  navPlayers: "pages/players",
  navArena: "pages/arena",
};

// Basketball loading animation functions
function showBasketballLoader() {
  const loader = document.createElement('div');
  loader.className = 'basketball-loader';
  loader.id = 'basketball-loader';
  
  loader.innerHTML = `
    <div class="basketball"></div>
    <div class="basketball-loader-text">Loading</div>
    <div class="basketball-loader-dots"></div>
  `;
  
  document.body.appendChild(loader);
}

function hideBasketballLoader() {
  const loader = document.getElementById('basketball-loader');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(() => {
      loader.remove();
    }, 500);
  }
}

async function loadTabContent(navId) {
  try {
    // Show basketball loading animation
    showBasketballLoader();
    
    const response = await fetch(tabs[navId]);
    if (!response.ok) throw new Error(`Failed to load ${tabs[navId]}`);
    const html = await response.text();

    // Wait for 1.5 seconds to allow page loading and show animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    pageContent.innerHTML = html;

    Object.keys(tabs).forEach((key) => {
      document.getElementById(key).classList.toggle("active", key === navId);
    });

    if (navId === "navPlayers") {
      // Small delay to ensure scripts are loaded
      setTimeout(() => {
        if (typeof initializePlayersTab === "function") {
          initializePlayersTab();
        } else {
          console.error("initializePlayersTab function not available");
          pageContent.innerHTML = `<p class="text-danger">Players functionality not loaded. Please refresh the page.</p>`;
        }
      }, 100);
    } else if (navId === "navArena") {
      // Small delay to ensure scripts are loaded
      setTimeout(() => {
        if (typeof initializeArenaTab === "function") {
          initializeArenaTab();
        } else {
          console.error("initializeArenaTab function not available");
          pageContent.innerHTML = `<p class="text-danger">Arena functionality not loaded. Please refresh the page.</p>`;
        }
      }, 100);
    }

    // Hide loading animation after content is loaded
    hideBasketballLoader();
  } catch (err) {
    hideBasketballLoader();
    pageContent.innerHTML = `<p class="text-danger">Error loading content: ${err.message}</p>`;
  }
}

Object.keys(tabs).forEach((navId) => {
  document.getElementById(navId).addEventListener("click", (e) => {
    e.preventDefault();
    loadTabContent(navId);
  });
});

loadTabContent("navAbout");
