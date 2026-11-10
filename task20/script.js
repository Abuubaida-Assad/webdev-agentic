/**
 * ==============================================================================
 * WeatherNow - Minimal Weather Application
 * Built with Vanilla JavaScript (ES6+), Tailwind CSS, and Visual Crossing API.
 * ==============================================================================
 */

// ==============================================================================
// 1. API CONFIGURATION
// ==============================================================================
/**
 * For local frontend testing, paste your personal Visual Crossing API key below.
 * In production, API calls should be routed through a server-side proxy so that
 * your secret key is never exposed to the browser.
 */
const CONFIG = {
  // Replace YOUR_API_KEY_HERE with your Visual Crossing API key
  API_KEY: 'YOUR_API_KEY_HERE',
  BASE_URL: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline',
};

// ==============================================================================
// 2. APPLICATION STATE
// ==============================================================================
let activeLocation = null;
let activeAbortController = null;
let requestCounter = 0;
let isLoading = false;

// ==============================================================================
// 3. DOM ELEMENT REFERENCES
// ==============================================================================
const searchForm = document.getElementById('search-form');
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const refreshBtn = document.getElementById('refresh-btn');
const refreshIcon = document.getElementById('refresh-icon');

const validationErrorContainer = document.getElementById('validation-error');
const validationErrorText = document.getElementById('validation-error-text');

const apiErrorContainer = document.getElementById('api-error');
const apiErrorMessage = document.getElementById('api-error-message');

const loadingSpinner = document.getElementById('loading-spinner');
const loadingText = document.getElementById('loading-text');

const welcomeState = document.getElementById('welcome-state');
const weatherContent = document.getElementById('weather-content');

// Current weather elements
const currentLocationEl = document.getElementById('current-location');
const currentDatetimeEl = document.getElementById('current-datetime');
const currentIconEl = document.getElementById('current-icon');
const currentTempEl = document.getElementById('current-temp');
const currentConditionEl = document.getElementById('current-condition');
const currentWindEl = document.getElementById('current-wind');
const currentPrecipEl = document.getElementById('current-precip');

// Hourly lists
const previousHoursList = document.getElementById('previous-hours-list');
const nextHoursList = document.getElementById('next-hours-list');

// Quick location pills
const quickLocationBtns = document.querySelectorAll('.quick-location-btn');

// ==============================================================================
// 4. WEATHER ICON HELPER
// ==============================================================================
/**
 * Generates lightweight, accessible inline SVGs based on Visual Crossing weather icon keys.
 * Uses semantic stroke/fill with responsive sizing.
 *
 * @param {string} iconKey - Visual Crossing icon name (e.g., 'clear-day', 'rain')
 * @param {string} conditions - Fallback condition text
 * @param {string} sizeClasses - Tailwind width/height classes
 * @returns {string} SVG markup
 */
function getWeatherIconSvg(iconKey, conditions = '', sizeClasses = 'w-full h-full') {
  const normalizedKey = (iconKey || '').toLowerCase();
  const normalizedCond = (conditions || '').toLowerCase();

  // Thunderstorms
  if (normalizedKey.includes('thunder') || normalizedCond.includes('thunder')) {
    return `
      <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
        <polyline points="13 11 9 17 15 17 11 23"></polyline>
      </svg>
    `;
  }

  // Snow
  if (normalizedKey.includes('snow') || normalizedCond.includes('snow')) {
    return `
      <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path>
        <line x1="8" y1="16" x2="8.01" y2="16"></line>
        <line x1="8" y1="20" x2="8.01" y2="20"></line>
        <line x1="12" y1="18" x2="12.01" y2="18"></line>
        <line x1="12" y1="22" x2="12.01" y2="22"></line>
        <line x1="16" y1="16" x2="16.01" y2="16"></line>
        <line x1="16" y1="20" x2="16.01" y2="20"></line>
      </svg>
    `;
  }

  // Rain & Showers
  if (normalizedKey.includes('rain') || normalizedKey.includes('shower') || normalizedCond.includes('rain') || normalizedCond.includes('drizzle')) {
    return `
      <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
        <path d="M16 14v6"></path>
        <path d="M8 14v6"></path>
        <path d="M12 16v6"></path>
      </svg>
    `;
  }

  // Fog & Mist
  if (normalizedKey.includes('fog') || normalizedCond.includes('fog') || normalizedCond.includes('mist')) {
    return `
      <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 14h16"></path>
        <path d="M4 18h16"></path>
        <path d="M4 10h16"></path>
        <path d="M4 6h16"></path>
      </svg>
    `;
  }

  // Wind
  if (normalizedKey.includes('wind') || normalizedCond.includes('wind')) {
    return `
      <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
        <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
        <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
      </svg>
    `;
  }

  // Clear Night
  if (normalizedKey === 'clear-night') {
    return `
      <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        <path d="M19 3v4"></path>
        <path d="M21 5h-4"></path>
      </svg>
    `;
  }

  // Partly Cloudy Night
  if (normalizedKey.includes('cloudy') && normalizedKey.includes('night')) {
    return `
      <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
      </svg>
    `;
  }

  // Clear Day / Sunny
  if (normalizedKey === 'clear-day' || normalizedCond.includes('clear') || normalizedCond.includes('sunny')) {
    return `
      <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
      </svg>
    `;
  }

  // Cloudy / Overcast
  if (normalizedKey === 'cloudy' || normalizedCond.includes('overcast') || normalizedCond === 'cloudy') {
    return `
      <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
      </svg>
    `;
  }

  // Default: Partly Cloudy Day
  return `
    <svg class="${sizeClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 2v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="M20 12h2"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
      <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"></path>
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"></path>
    </svg>
  `;
}

// ==============================================================================
// 5. INPUT VALIDATION
// ==============================================================================
/**
 * Strict, Unicode-aware validation for user location input.
 * Enforces all requirements from Section 6 of the specification:
 * - Not empty.
 * - No leading or trailing spaces.
 * - Single internal spaces allowed for multiword names (e.g., 'New York').
 * - Rejects special characters, emojis, HTML/script tags.
 * - Allows alphabetic characters and legitimate punctuation (hyphens, apostrophes, commas, periods).
 * - Supports international names (Unicode \p{L} and \p{M}).
 *
 * @param {string} location - Raw input string
 * @returns {{ isValid: boolean, error?: string }}
 */
function validateLocation(location) {
  if (typeof location !== 'string' || location.length === 0) {
    return {
      isValid: false,
      error: 'Please enter a city or location name.',
    };
  }

  // Rule 2 & 7: Reject leading or trailing whitespace without silent trimming
  if (/^\s/.test(location) || /\s$/.test(location)) {
    return {
      isValid: false,
      error: 'Location name must not contain leading or trailing spaces.',
    };
  }

  // Rule 3: Reject multiple consecutive internal spaces
  if (/\s{2,}/.test(location)) {
    return {
      isValid: false,
      error: 'Location name must not contain multiple consecutive spaces.',
    };
  }

  // Length constraints
  if (location.length < 2) {
    return {
      isValid: false,
      error: 'Location name must be at least 2 characters long.',
    };
  }

  if (location.length > 100) {
    return {
      isValid: false,
      error: 'Location name must not exceed 100 characters.',
    };
  }

  // Rule 4: Reject HTML tags, script characters, and brackets
  if (/[<>{}[\]\\]/.test(location)) {
    return {
      isValid: false,
      error: 'Location name contains invalid characters (HTML/script symbols are forbidden).',
    };
  }

  // Rule 4: Reject emojis and pictographs
  if (/\p{Extended_Pictographic}/u.test(location)) {
    return {
      isValid: false,
      error: 'Location name cannot contain emojis or symbols.',
    };
  }

  // Rules 4, 5, 6: Unicode-aware pattern allowing letters, accents, spaces, hyphens, apostrophes, commas, periods
  const validLocationPattern = /^[\p{L}\p{M}][\p{L}\p{M}\s\-',.]{0,98}[\p{L}\p{M}.]$/u;
  if (!validLocationPattern.test(location)) {
    return {
      isValid: false,
      error: 'Location name contains invalid characters. Use letters and standard punctuation (hyphens, apostrophes, commas).',
    };
  }

  return { isValid: true };
}

/**
 * Displays or clears the input validation message.
 *
 * @param {string|null} message - Error string or null to hide
 */
function showValidationError(message) {
  if (message) {
    validationErrorText.textContent = message;
    validationErrorContainer.classList.remove('hidden');
    locationInput.classList.add('border-rose-400', 'focus:ring-rose-400', 'focus:border-rose-400');
    locationInput.setAttribute('aria-invalid', 'true');
  } else {
    validationErrorText.textContent = '';
    validationErrorContainer.classList.add('hidden');
    locationInput.classList.remove('border-rose-400', 'focus:ring-rose-400', 'focus:border-rose-400');
    locationInput.removeAttribute('aria-invalid');
  }
}

// ==============================================================================
// 6. UI STATE MANAGEMENT: LOADING & ERRORS
// ==============================================================================
/**
 * Sets the loading state of the application.
 * Disables buttons and inputs during network requests to prevent duplicate submissions.
 *
 * @param {boolean} loading - Whether a request is active
 * @param {string} [customText] - Optional status message
 */
function setLoading(loading, customText = 'Fetching weather information...') {
  isLoading = loading;
  searchBtn.disabled = loading;
  refreshBtn.disabled = loading || !activeLocation;
  locationInput.disabled = loading;

  if (loading) {
    loadingText.textContent = customText;
    loadingSpinner.classList.remove('hidden');
    refreshIcon.classList.add('animate-spin-refresh');
  } else {
    loadingSpinner.classList.add('hidden');
    refreshIcon.classList.remove('animate-spin-refresh');
  }
}

/**
 * Displays or hides user-friendly error banners.
 * Ensures the API key is never exposed in error text.
 *
 * @param {string|null} message - Error message to show or null to hide
 */
function showError(message) {
  if (message) {
    // Sanitize any accidental key references
    const sanitizedMessage = message.replace(CONFIG.API_KEY, '[REDACTED]');
    apiErrorMessage.textContent = sanitizedMessage;
    apiErrorContainer.classList.remove('hidden');
  } else {
    apiErrorMessage.textContent = '';
    apiErrorContainer.classList.add('hidden');
  }
}

// ==============================================================================
// 7. API INTEGRATION
// ==============================================================================
/**
 * Fetches weather data from the Visual Crossing Timeline API for yesterday through tomorrow.
 *
 * @param {string} location - Validated location name
 * @param {AbortSignal} signal - AbortSignal to cancel pending requests
 * @returns {Promise<Object>} Visual Crossing JSON response
 */
async function fetchWeather(location, signal) {
  // Verify that an API key has been configured
  if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_API_KEY_HERE' || CONFIG.API_KEY.trim() === '') {
    throw new Error(
      'Visual Crossing API key is not configured. Please paste your API key in script.js (CONFIG.API_KEY) for local testing.'
    );
  }

  // Request yesterday through tomorrow to cover past 24h and next 24h
  const startDate = 'yesterday';
  const endDate = 'tomorrow';

  // Construct URL with URLSearchParams
  const endpoint = `${CONFIG.BASE_URL}/${encodeURIComponent(location)}/${startDate}/${endDate}`;
  const queryParams = new URLSearchParams({
    unitGroup: 'metric',
    include: 'days,hours,current',
    elements: 'datetime,datetimeEpoch,temp,conditions,icon,windspeed,precipprob',
    contentType: 'json',
    key: CONFIG.API_KEY,
  });

  const requestUrl = `${endpoint}?${queryParams.toString()}`;

  let response;
  try {
    response = await fetch(requestUrl, { signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err; // Let caller ignore cancelled requests
    }
    throw new Error('Network error: Unable to connect to the weather service. Please check your internet connection.');
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      errorDetail = await response.text();
    } catch (_) {
      errorDetail = '';
    }

    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid or expired Visual Crossing API key. Please check your key in script.js.');
    } else if (response.status === 400) {
      throw new Error(`Location not found: "${location}". Visual Crossing could not find this place.`);
    } else if (response.status === 429) {
      throw new Error('API rate limit reached. The daily quota for this Visual Crossing key has been exceeded.');
    } else {
      throw new Error(`Weather service error (${response.status}): ${errorDetail || 'Unable to retrieve weather data.'}`);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error('Unexpected response format: Failed to parse weather data.');
  }

  if (!data || !Array.isArray(data.days) || data.days.length === 0) {
    throw new Error('Weather data unavailable: Incomplete response from weather service.');
  }

  return data;
}

// ==============================================================================
// 8. DATA PROCESSING: HOURLY FORECAST SELECTION
// ==============================================================================
/**
 * Processes daily and hourly weather data across adjacent days.
 * Accurately extracts:
 * 1. Previous 24 hours relative to current local time.
 * 2. Next 24 hours forecast starting from the current hour.
 * Handles the midnight boundary correctly using UTC epoch timestamps.
 *
 * @param {Object} weatherData - Response from Visual Crossing
 * @returns {{ previous24: Array<Object>, next24: Array<Object> }}
 */
function getHourlyForecast(weatherData) {
  // Aggregate all hourly records chronologically across days
  const allHours = [];
  if (Array.isArray(weatherData.days)) {
    for (const day of weatherData.days) {
      if (Array.isArray(day.hours)) {
        for (const hour of day.hours) {
          allHours.push({
            ...hour,
            dayDate: day.datetime, // e.g. '2026-10-28'
          });
        }
      }
    }
  }

  // Sort chronologically by UTC epoch timestamp
  allHours.sort((a, b) => (a.datetimeEpoch || 0) - (b.datetimeEpoch || 0));

  if (allHours.length === 0) {
    return { previous24: [], next24: [] };
  }

  // Determine current reference epoch in the target location
  const currentEpoch = Number(weatherData.currentConditions?.datetimeEpoch) || Math.floor(Date.now() / 1000);

  // Find the hourly record representing the current local hour
  // An hour block [hourEpoch, hourEpoch + 3600) covers that clock hour
  let currentHourIndex = allHours.findIndex(
    (h) => h.datetimeEpoch <= currentEpoch && currentEpoch < h.datetimeEpoch + 3600
  );

  // Fallback to closest hour if exact range wasn't matched
  if (currentHourIndex === -1) {
    let smallestDiff = Infinity;
    for (let i = 0; i < allHours.length; i++) {
      const diff = Math.abs((allHours[i].datetimeEpoch || 0) - currentEpoch);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        currentHourIndex = i;
      }
    }
  }

  // Previous 24 hours: 24 hours strictly prior to the current hour
  const prevStartIndex = Math.max(0, currentHourIndex - 24);
  const previous24 = allHours.slice(prevStartIndex, currentHourIndex);

  // Next 24 hours: 24 hours starting with the current hour
  const next24 = allHours.slice(currentHourIndex, currentHourIndex + 24);

  return { previous24, next24 };
}

// ==============================================================================
// 9. DATE & TIME FORMATTING HELPERS
// ==============================================================================
/**
 * Formats local date and time using target location's IANA timezone.
 *
 * @param {number} epochSeconds - UTC epoch seconds
 * @param {string} timezone - Target timezone (e.g., 'America/New_York')
 * @returns {string} Formatted string (e.g., 'Wed, Oct 28, 2:30 PM')
 */
function formatLocalDateTime(epochSeconds, timezone) {
  if (!epochSeconds) return '';
  const date = new Date(epochSeconds * 1000);
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (_) {
    return date.toLocaleString();
  }
}

/**
 * Formats hour label (e.g., '2 PM') in the target timezone.
 *
 * @param {number} epochSeconds - UTC epoch seconds
 * @param {string} timezone - Target timezone
 * @returns {string}
 */
function formatHourTime(epochSeconds, timezone) {
  if (!epochSeconds) return '';
  const date = new Date(epochSeconds * 1000);
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: true,
    }).format(date);
  } catch (_) {
    return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  }
}

/**
 * Formats day label for hourly cards (e.g., 'Wed', 'Thu') in target timezone.
 *
 * @param {number} epochSeconds - UTC epoch seconds
 * @param {string} timezone - Target timezone
 * @returns {string}
 */
function formatHourDay(epochSeconds, timezone) {
  if (!epochSeconds) return '';
  const date = new Date(epochSeconds * 1000);
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
    }).format(date);
  } catch (_) {
    return '';
  }
}

// ==============================================================================
// 10. RENDERING FUNCTIONS
// ==============================================================================
/**
 * Renders the primary current weather card.
 * Uses textContent exclusively for user-facing text to prevent XSS.
 *
 * @param {Object} data - Visual Crossing weather data
 */
function renderCurrentWeather(data) {
  const current = data.currentConditions || {};

  // Resolved Location Name
  currentLocationEl.textContent = data.resolvedAddress || activeLocation;

  // Local Date & Time
  const formattedTime = formatLocalDateTime(current.datetimeEpoch, data.timezone);
  currentDatetimeEl.textContent = formattedTime || 'Current';

  // Temperature (prominent display)
  if (current.temp !== null && current.temp !== undefined) {
    currentTempEl.textContent = Math.round(current.temp);
  } else {
    currentTempEl.textContent = '--';
  }

  // Weather Condition
  currentConditionEl.textContent = current.conditions || 'Conditions unavailable';

  // Wind Speed (km/h)
  const windVal = current.windspeed !== null && current.windspeed !== undefined ? Math.round(current.windspeed) : '--';
  currentWindEl.textContent = `${windVal} km/h`;

  // Precipitation Probability (%)
  const precipVal = current.precipprob !== null && current.precipprob !== undefined ? Math.round(current.precipprob) : 0;
  currentPrecipEl.textContent = `${precipVal}%`;

  // Weather Icon
  currentIconEl.innerHTML = getWeatherIconSvg(current.icon, current.conditions, 'w-16 h-16 sm:w-20 sm:h-20');
}

/**
 * Renders horizontally scrollable hourly weather cards.
 * Sets all dynamic text nodes via textContent.
 *
 * @param {HTMLElement} container - Carousel container element
 * @param {Array<Object>} hours - List of hourly data objects
 * @param {string} timezone - Location timezone
 * @param {boolean} isPrevious - True if previous 24h, false if next 24h
 */
function renderHourlyForecast(container, hours, timezone, isPrevious = false) {
  container.innerHTML = '';

  if (!hours || hours.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'w-full py-6 text-center text-xs text-slate-400 italic';
    emptyState.textContent = isPrevious
      ? 'No historical hourly records available for this period.'
      : 'No forecast hourly records available for this period.';
    container.appendChild(emptyState);
    return;
  }

  hours.forEach((hour, index) => {
    const isNow = !isPrevious && index === 0;

    const card = document.createElement('div');
    card.className = `hourly-card flex-shrink-0 w-28 sm:w-32 bg-white border ${
      isNow ? 'border-sky-400 ring-2 ring-sky-100 shadow-sm' : 'border-slate-200/90'
    } rounded-xl p-3 flex flex-col items-center text-center gap-1.5 shadow-sm`;

    // Weekday tag
    const dayLabel = document.createElement('span');
    dayLabel.className = 'text-[11px] font-medium text-slate-400 uppercase tracking-wider';
    dayLabel.textContent = formatHourDay(hour.datetimeEpoch, timezone);

    // Time tag
    const timeLabel = document.createElement('span');
    timeLabel.className = `text-xs sm:text-sm font-semibold ${isNow ? 'text-sky-600' : 'text-slate-800'}`;
    timeLabel.textContent = isNow ? 'Now' : formatHourTime(hour.datetimeEpoch, timezone);

    // Weather Icon
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'w-8 h-8 flex items-center justify-center my-0.5 text-sky-500';
    iconWrapper.innerHTML = getWeatherIconSvg(hour.icon, hour.conditions, 'w-7 h-7');

    // Temperature in Celsius
    const tempLabel = document.createElement('span');
    tempLabel.className = 'text-base sm:text-lg font-bold text-slate-900';
    const tempVal = hour.temp !== null && hour.temp !== undefined ? Math.round(hour.temp) : '--';
    tempLabel.textContent = `${tempVal}°C`;

    // Conditions summary
    const conditionLabel = document.createElement('span');
    conditionLabel.className = 'text-[11px] text-slate-500 font-medium truncate w-full px-1';
    conditionLabel.title = hour.conditions || '';
    conditionLabel.textContent = hour.conditions || 'N/A';

    // Metrics container (Precipitation & Wind speed)
    const metricsWrapper = document.createElement('div');
    metricsWrapper.className = 'w-full pt-1.5 border-t border-slate-100 flex flex-col gap-0.5 text-[10px] font-medium';

    const precipSpan = document.createElement('span');
    precipSpan.className = 'text-blue-600 flex items-center justify-center gap-1';
    const precipVal = hour.precipprob !== null && hour.precipprob !== undefined ? Math.round(hour.precipprob) : 0;
    precipSpan.textContent = `💧 ${precipVal}%`;

    const windSpan = document.createElement('span');
    windSpan.className = 'text-slate-500 flex items-center justify-center gap-1';
    const windVal = hour.windspeed !== null && hour.windspeed !== undefined ? Math.round(hour.windspeed) : 0;
    windSpan.textContent = `💨 ${windVal} km/h`;

    metricsWrapper.appendChild(precipSpan);
    metricsWrapper.appendChild(windSpan);

    card.appendChild(dayLabel);
    card.appendChild(timeLabel);
    card.appendChild(iconWrapper);
    card.appendChild(tempLabel);
    card.appendChild(conditionLabel);
    card.appendChild(metricsWrapper);

    container.appendChild(card);
  });
}

// ==============================================================================
// 11. CONTROLLER / WORKFLOW
// ==============================================================================
/**
 * Main coordinator function to fetch and render weather for a given location.
 * Prevents race conditions from overlapping requests using AbortController
 * and sequence checking.
 *
 * @param {string} targetLocation - Location string to query
 * @param {boolean} isRefresh - Whether this query is a user-triggered refresh
 */
async function handleLocationQuery(targetLocation, isRefresh = false) {
  // Cancel any pending in-flight request
  if (activeAbortController) {
    activeAbortController.abort();
  }
  activeAbortController = new AbortController();
  const currentSequence = ++requestCounter;

  // Clear previous errors
  showError(null);
  showValidationError(null);

  // Update loading state
  const loadingLabel = isRefresh
    ? `Refreshing weather for ${targetLocation}...`
    : `Fetching weather for ${targetLocation}...`;
  setLoading(true, loadingLabel);

  try {
    const weatherData = await fetchWeather(targetLocation, activeAbortController.signal);

    // If another request took over while waiting, discard this result
    if (currentSequence !== requestCounter) {
      return;
    }

    // Update active location
    activeLocation = targetLocation;
    refreshBtn.disabled = false;

    // Process hourly splits
    const { previous24, next24 } = getHourlyForecast(weatherData);

    // Render components
    renderCurrentWeather(weatherData);
    renderHourlyForecast(previousHoursList, previous24, weatherData.timezone, true);
    renderHourlyForecast(nextHoursList, next24, weatherData.timezone, false);

    // Toggle view states
    welcomeState.classList.add('hidden');
    weatherContent.classList.remove('hidden');
  } catch (err) {
    // If request was aborted by a newer request, do not display an error
    if (err.name === 'AbortError') {
      return;
    }

    // If another request already started, discard error
    if (currentSequence !== requestCounter) {
      return;
    }

    showError(err.message || 'An unexpected error occurred while fetching weather data.');
  } finally {
    if (currentSequence === requestCounter) {
      setLoading(false);
    }
  }
}

// ==============================================================================
// 12. EVENT LISTENERS
// ==============================================================================
// Form submission handler (Enter key or Search button click)
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const rawLocation = locationInput.value;
  const validation = validateLocation(rawLocation);

  if (!validation.isValid) {
    showValidationError(validation.error);
    locationInput.focus();
    return;
  }

  showValidationError(null);
  handleLocationQuery(rawLocation, false);
});

// Dynamic validation during input: clear error once valid, or warn of leading space
locationInput.addEventListener('input', () => {
  const value = locationInput.value;

  if (value.startsWith(' ')) {
    showValidationError('Location name must not have leading or trailing spaces.');
  } else if (!validationErrorContainer.classList.contains('hidden')) {
    const retest = validateLocation(value);
    if (retest.isValid) {
      showValidationError(null);
    }
  }
});

// Refresh button handler
refreshBtn.addEventListener('click', () => {
  if (!activeLocation || isLoading) return;
  handleLocationQuery(activeLocation, true);
});

// Quick suggestion buttons
quickLocationBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const loc = btn.textContent.trim();
    locationInput.value = loc;
    showValidationError(null);
    handleLocationQuery(loc, false);
  });
});

