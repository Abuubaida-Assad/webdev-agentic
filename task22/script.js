// ==========================================
// 1. STATE & CONSTANTS
// ==========================================
const DEFAULT_SUBREDDITS = ["javascript", "webdev", "programming"];
const STORAGE_KEY = "reddit_feed_subreddits";

let subreddits = [];

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const addForm = document.getElementById("add-subreddit-form");
const subredditInput = document.getElementById("subreddit-input");
const lanesContainer = document.getElementById("lanes-container");
const emptyState = document.getElementById("empty-state");
const restoreDefaultsBtn = document.getElementById("restore-defaults-btn");
const navError = document.getElementById("nav-error");
const navErrorText = document.getElementById("nav-error-text");
const dismissNavErrorBtn = document.getElementById("dismiss-nav-error");

// ==========================================
// 3. STORAGE FUNCTIONS
// ==========================================

// Loads saved subreddits from localStorage or uses default list
function loadSubreddits() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        subreddits = parsed;
      } else {
        subreddits = [...DEFAULT_SUBREDDITS];
      }
    } catch (e) {
      subreddits = [...DEFAULT_SUBREDDITS];
    }
  } else {
    subreddits = [...DEFAULT_SUBREDDITS];
  }

  saveSubreddits();
  renderAllLanes();
}

// Saves current subreddit list to localStorage
function saveSubreddits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subreddits));
}

// ==========================================
// 4. API INTEGRATION
// ==========================================

// Fetches posts directly from Reddit public JSON API
async function fetchSubredditPosts(subredditName) {
  const cleanName = encodeURIComponent(subredditName);
  const url = `https://www.reddit.com/r/${cleanName}.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Subreddit r/${subredditName} does not exist or was banned.`);
      } else if (response.status === 403) {
        throw new Error(`Reddit returned 403 Forbidden. Access is restricted by Reddit network policy or the subreddit is private.`);
      } else if (response.status === 429) {
        throw new Error(`Reddit rate limit reached. Please wait a moment before refreshing.`);
      } else {
        throw new Error(`Reddit returned HTTP ${response.status} error.`);
      }
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Reddit error: ${data.message || data.error}`);
    }

    if (!data.data || !Array.isArray(data.data.children)) {
      throw new Error("Invalid response format received from Reddit.");
    }

    // Extract post data objects
    const posts = data.data.children.map((child) => child.data);
    return posts;
  } catch (error) {
    // When browser blocks the request via CORS or network failure
    if (error.name === "TypeError" || error.message.includes("Failed to fetch")) {
      throw new Error(`Unable to reach Reddit. Reddit blocked the request (CORS/access error) or connection failed.`);
    }
    throw error;
  }
}

// ==========================================
// 5. LANE & POST RENDERING
// ==========================================

// Renders all subreddits currently in state
function renderAllLanes() {
  lanesContainer.innerHTML = "";

  if (subreddits.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  subreddits.forEach((name) => {
    createSubredditLane(name);
  });
}

// Creates and mounts a single subreddit lane column
function createSubredditLane(subredditName) {
  const lane = document.createElement("section");
  lane.className = "w-full sm:w-80 md:w-96 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[520px] sm:h-[calc(100vh-6.5rem)] overflow-hidden transition-all duration-200";
  lane.dataset.subreddit = subredditName;

  // Lane Header
  const header = document.createElement("header");
  header.className = "px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-2 select-none";

  // Subreddit Title & Icon
  const titleContainer = document.createElement("div");
  titleContainer.className = "flex items-center gap-2 min-w-0";

  const badge = document.createElement("span");
  badge.className = "w-6 h-6 rounded-full bg-[#FF4500] text-white flex items-center justify-center font-bold text-xs flex-shrink-0";
  badge.textContent = "r/";

  const titleLink = document.createElement("a");
  titleLink.href = `https://www.reddit.com/r/${encodeURIComponent(subredditName)}`;
  titleLink.target = "_blank";
  titleLink.rel = "noopener noreferrer";
  titleLink.className = "font-bold text-sm text-gray-900 hover:text-[#FF4500] truncate transition";
  titleLink.textContent = `r/${subredditName}`;
  titleLink.title = `View r/${subredditName} on Reddit`;

  titleContainer.appendChild(badge);
  titleContainer.appendChild(titleLink);

  // Actions Container (Refresh & Remove Buttons)
  const actionsContainer = document.createElement("div");
  actionsContainer.className = "flex items-center gap-1 flex-shrink-0";

  // Refresh Button
  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.className = "p-1.5 text-gray-500 hover:text-[#FF4500] hover:bg-orange-50 rounded-lg transition cursor-pointer";
  refreshBtn.title = "Refresh lane";
  refreshBtn.setAttribute("aria-label", `Refresh r/${subredditName}`);
  refreshBtn.innerHTML = `
    <svg class="w-4 h-4 refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  `;

  // Remove Button
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer";
  removeBtn.title = "Remove lane";
  removeBtn.setAttribute("aria-label", `Remove r/${subredditName}`);
  removeBtn.innerHTML = `
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;

  actionsContainer.appendChild(refreshBtn);
  actionsContainer.appendChild(removeBtn);

  header.appendChild(titleContainer);
  header.appendChild(actionsContainer);

  // Posts Container (Scrollable)
  const postsContainer = document.createElement("div");
  postsContainer.className = "flex-1 overflow-y-auto p-3 space-y-3 bg-[#FAFAFA]";

  lane.appendChild(header);
  lane.appendChild(postsContainer);

  // Event Listeners for Lane Buttons
  refreshBtn.addEventListener("click", () => {
    refreshSubreddit(subredditName, lane);
  });

  removeBtn.addEventListener("click", () => {
    removeSubreddit(subredditName, lane);
  });

  lanesContainer.appendChild(lane);

  // Fetch and display initial posts
  loadLaneData(subredditName, lane);
}

// Loads posts for a specific lane and handles loading/error/success states
async function loadLaneData(subredditName, laneElement) {
  const postsContainer = laneElement.querySelector("div.flex-1");
  const refreshBtn = laneElement.querySelector("button[title='Refresh lane']");

  // Prevent multiple concurrent fetches on the same lane
  if (laneElement.dataset.loading === "true") {
    return;
  }
  laneElement.dataset.loading = "true";

  // Spin refresh icon
  const refreshIcon = refreshBtn ? refreshBtn.querySelector(".refresh-icon") : null;
  if (refreshIcon) {
    refreshIcon.classList.add("animate-spin");
  }

  // Display Loading State
  postsContainer.innerHTML = "";
  const loadingBox = document.createElement("div");
  loadingBox.className = "h-full flex flex-col items-center justify-center text-center p-6 text-gray-400";
  loadingBox.innerHTML = `
    <div class="w-7 h-7 border-2 border-gray-200 border-t-[#FF4500] rounded-full animate-spin mb-3"></div>
    <p class="text-xs font-medium text-gray-600">Loading r/${subredditName}...</p>
    <p class="text-[11px] text-gray-400 mt-0.5">Fetching latest posts</p>
  `;
  postsContainer.appendChild(loadingBox);

  try {
    const posts = await fetchSubredditPosts(subredditName);
    displayPosts(posts, postsContainer, subredditName);
  } catch (err) {
    // Display Error State
    postsContainer.innerHTML = "";
    const errorBox = document.createElement("div");
    errorBox.className = "p-4 bg-red-50 border border-red-200 rounded-lg text-center text-xs text-red-700 space-y-2.5 my-auto";

    const errorHeading = document.createElement("p");
    errorHeading.className = "font-bold text-red-800 text-xs flex items-center justify-center gap-1.5";
    errorHeading.textContent = `Unable to load r/${subredditName}`;

    const errorMsg = document.createElement("p");
    errorMsg.className = "text-[11px] text-red-600 leading-relaxed";
    errorMsg.textContent = err.message;

    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-md text-xs shadow-sm transition cursor-pointer";
    retryBtn.textContent = "Try Again";
    retryBtn.addEventListener("click", () => {
      loadLaneData(subredditName, laneElement);
    });

    errorBox.appendChild(errorHeading);
    errorBox.appendChild(errorMsg);
    errorBox.appendChild(retryBtn);

    postsContainer.appendChild(errorBox);
  } finally {
    laneElement.dataset.loading = "false";
    if (refreshIcon) {
      refreshIcon.classList.remove("animate-spin");
    }
  }
}

// Renders the list of posts inside a lane's container
function displayPosts(posts, container, subredditName) {
  container.innerHTML = "";

  if (!posts || posts.length === 0) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 text-xs";
    emptyBox.textContent = `No posts found in r/${subredditName}.`;
    container.appendChild(emptyBox);
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "bg-white border border-gray-200 rounded-lg p-3 shadow-xs hover:border-gray-300 transition flex flex-col gap-2";

    // Header: Author & Time
    const postHeader = document.createElement("div");
    postHeader.className = "flex items-center justify-between text-[11px] text-gray-500";

    const authorSpan = document.createElement("span");
    authorSpan.className = "truncate max-w-[180px]";
    authorSpan.textContent = `u/${post.author || "unknown"}`;

    const timeSpan = document.createElement("span");
    timeSpan.className = "text-gray-400 flex-shrink-0";
    timeSpan.textContent = formatTimeAgo(post.created_utc);

    postHeader.appendChild(authorSpan);
    postHeader.appendChild(timeSpan);

    // Body: Title and optional Thumbnail
    const bodyContainer = document.createElement("div");
    bodyContainer.className = "flex gap-2.5 items-start";

    // Title Link (open Reddit post in new tab)
    const titleLink = document.createElement("a");
    const postUrl = post.permalink ? `https://www.reddit.com${post.permalink}` : (post.url || "#");
    titleLink.href = postUrl;
    titleLink.target = "_blank";
    titleLink.rel = "noopener noreferrer";
    titleLink.className = "font-medium text-xs sm:text-sm text-gray-900 hover:text-[#FF4500] leading-snug flex-1 transition";
    titleLink.textContent = post.title; // Secure: textContent only

    bodyContainer.appendChild(titleLink);

    // Valid Image Thumbnail (if available)
    if (isValidThumbnail(post.thumbnail)) {
      const thumbImg = document.createElement("img");
      thumbImg.src = post.thumbnail;
      thumbImg.alt = "Post thumbnail";
      thumbImg.className = "w-14 h-14 object-cover rounded bg-gray-100 flex-shrink-0 border border-gray-100";
      thumbImg.loading = "lazy";
      thumbImg.onerror = () => thumbImg.remove();
      bodyContainer.appendChild(thumbImg);
    }

    // Footer: Score, Comments & View Post Link
    const footer = document.createElement("div");
    footer.className = "flex items-center justify-between text-[11px] text-gray-500 pt-1.5 border-t border-gray-100 mt-1";

    const metaStats = document.createElement("div");
    metaStats.className = "flex items-center gap-3";

    // Score
    const scoreSpan = document.createElement("span");
    scoreSpan.className = "flex items-center gap-1 font-semibold text-gray-700";
    scoreSpan.textContent = `▲ ${post.score !== undefined ? post.score.toLocaleString() : "0"}`;

    // Comments
    const commentsSpan = document.createElement("span");
    commentsSpan.className = "flex items-center gap-1";
    commentsSpan.textContent = `💬 ${post.num_comments !== undefined ? post.num_comments.toLocaleString() : "0"}`;

    metaStats.appendChild(scoreSpan);
    metaStats.appendChild(commentsSpan);

    // View Post Link
    const viewPostLink = document.createElement("a");
    viewPostLink.href = postUrl;
    viewPostLink.target = "_blank";
    viewPostLink.rel = "noopener noreferrer";
    viewPostLink.className = "text-[#FF4500] hover:underline font-semibold flex items-center gap-0.5";
    viewPostLink.textContent = "View Post ↗";

    footer.appendChild(metaStats);
    footer.appendChild(viewPostLink);

    // Assemble Card
    card.appendChild(postHeader);
    card.appendChild(bodyContainer);
    card.appendChild(footer);

    container.appendChild(card);
  });
}

// ==========================================
// 6. LANE ACTIONS
// ==========================================

// Refreshes an existing subreddit lane without recreating it
function refreshSubreddit(subredditName, laneElement) {
  loadLaneData(subredditName, laneElement);
}

// Removes a subreddit lane from view and from localStorage
function removeSubreddit(subredditName, laneElement) {
  // Remove lane from DOM
  laneElement.remove();

  // Remove from state array
  subreddits = subreddits.filter(
    (name) => name.toLowerCase() !== subredditName.toLowerCase()
  );

  saveSubreddits();

  // Show empty state if all lanes removed
  if (subreddits.length === 0) {
    emptyState.classList.remove("hidden");
  }
}

// Adds a new subreddit from the user input
function addSubreddit(event) {
  if (event) event.preventDefault();
  clearNavError();

  const rawInput = subredditInput.value;
  // Trim spaces and remove optional leading r/ or /r/
  let name = rawInput.trim().replace(/^\/?r\//i, "").trim();

  // 1. Validate non-empty
  if (!name) {
    showNavError("Please enter a subreddit name.");
    subredditInput.focus();
    return;
  }

  // Basic character validation (alphanumeric and underscores)
  if (!/^[a-zA-Z0-9_]{2,21}$/.test(name)) {
    showNavError("Invalid subreddit name. Use 2-21 letters, numbers, or underscores.");
    subredditInput.focus();
    return;
  }

  // 2. Check if already exists (case-insensitive)
  const isDuplicate = subreddits.some(
    (s) => s.toLowerCase() === name.toLowerCase()
  );
  if (isDuplicate) {
    showNavError(`Subreddit r/${name} is already added in your feed.`);
    subredditInput.focus();
    return;
  }

  // 3. Clear input
  subredditInput.value = "";

  // 4. Update state and storage
  subreddits.push(name);
  saveSubreddits();

  // 5. Hide empty state and render new lane
  emptyState.classList.add("hidden");
  createSubredditLane(name);

  // Scroll to new lane
  lanesContainer.scrollTo({
    left: lanesContainer.scrollWidth,
    behavior: "smooth"
  });
}

// Restores default subreddits if user cleared all
function restoreDefaults() {
  subreddits = [...DEFAULT_SUBREDDITS];
  saveSubreddits();
  renderAllLanes();
}

// ==========================================
// 7. HELPER UTILITIES
// ==========================================

// Checks whether thumbnail string is a valid image URL
function isValidThumbnail(thumb) {
  if (!thumb || typeof thumb !== "string") return false;
  return thumb.startsWith("http://") || thumb.startsWith("https://");
}

// Formats timestamp into readable relative time (e.g., "2h ago")
function formatTimeAgo(utcSeconds) {
  if (!utcSeconds) return "";
  const elapsed = Math.floor(Date.now() / 1000 - utcSeconds);

  if (elapsed < 60) return "just now";
  const minutes = Math.floor(elapsed / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// Displays an alert message near the navigation bar
function showNavError(message) {
  navErrorText.textContent = message;
  navError.classList.remove("hidden");
}

// Clears the navigation error banner
function clearNavError() {
  navErrorText.textContent = "";
  navError.classList.add("hidden");
}

// ==========================================
// 8. EVENT LISTENERS
// ==========================================
addForm.addEventListener("submit", addSubreddit);
dismissNavErrorBtn.addEventListener("click", clearNavError);
restoreDefaultsBtn.addEventListener("click", restoreDefaults);

// Initialize application on load
document.addEventListener("DOMContentLoaded", () => {
  loadSubreddits();
});

