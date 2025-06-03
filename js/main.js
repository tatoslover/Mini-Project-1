const pageContent = document.getElementById("page-content");

const tabs = {
  navAbout: "pages/about",
  navPlayers: "pages/players",
  navArena: "pages/arena",
};

async function loadTabContent(navId) {
  try {
    const response = await fetch(tabs[navId]);
    if (!response.ok) throw new Error(`Failed to load ${tabs[navId]}`);
    const html = await response.text();

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
  } catch (err) {
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
