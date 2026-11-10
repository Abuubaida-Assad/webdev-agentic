# WeatherNow - Minimal Vanilla JavaScript Weather App

A lightweight, modern, responsive weather application built using **only HTML5, CSS3 / Tailwind CSS, and vanilla JavaScript (ES6+)**.

WeatherNow delivers real-time weather conditions, 24 hours of past observations, and a 24-hour upcoming forecast for any city or region worldwide using the **Visual Crossing Weather API**.

---

## Features

- **Real-Time Weather Conditions**:
  - Prominent current temperature in Celsius (°C).
  - Current general weather conditions (e.g. Sunny, Partially Cloudy, Rain).
  - Current wind speed in kilometers per hour (km/h).
  - Current precipitation probability percentage (%).
  - Local date and time synchronized to the queried location's timezone.
  - Resolved location name including state/region and country.
- **Previous 24 Hours Timeline**:
  - Horizontally scrollable timeline of hourly observations leading up to the current hour.
  - Seamlessly handles midnight boundaries across adjacent days.
  - Includes time, temperature, condition summary, precipitation chance, and wind speed.
- **Next 24 Hours Forecast**:
  - Horizontally scrollable timeline covering the upcoming 24-hour forecast starting with the current hour.
  - Clean day markers to make day transitions obvious.
- **Strict Input Validation**:
  - Unicode-aware validation supporting international place names (e.g., Tokyo, München, São Paulo, Hyderabad, Москва).
  - Rejects empty input, leading/trailing whitespace, and consecutive spaces without silent trimming.
  - Blocks script-like tags, HTML, emojis, and special punctuation.
  - Supports both pressing Enter and clicking the Search button.
- **Interactive State Handling**:
  - Welcome state prompting users to search.
  - Quick-search buttons for popular cities (Hyderabad, London, Tokyo, New York).
  - Loading spinner with button disablement to prevent duplicate submissions.
  - Comprehensive, user-friendly error banners (invalid city, network failure, rate limiting).
  - Refresh button that re-fetches updated weather for the active location while avoiding race conditions.

---

## Technologies Used

- **HTML5**: Semantic document structure (`<header>`, `<main>`, `<section>`, `<form>`).
- **Tailwind CSS (via CDN)**: Modern, responsive utility styling.
- **Vanilla CSS (`style.css`)**: Custom horizontal scrollbar styling and micro-animations.
- **Vanilla JavaScript (ES6+)**: Pure ECMAScript with `async/await`, Fetch API, `URLSearchParams`, and `Intl.DateTimeFormat`.
- **Visual Crossing Timeline Weather API**: Real-time and hourly weather data.

---

## Obtaining a Visual Crossing API Key

1. Visit [https://www.visualcrossing.com/weather-api](https://www.visualcrossing.com/weather-api).
2. Sign up for a free account.
3. Access your account dashboard to view your API Key.
4. Copy your key.

---

## API Key Configuration

### Local Testing Setup

Because this is a pure client-side application running directly in the browser without a build step or server bundler, browsers cannot directly read a `.env` file from the local filesystem.

1. Open `script.js` in your text editor.
2. At the top of `script.js`, locate the `CONFIG` object:
   ```javascript
   const CONFIG = {
     // Paste your Visual Crossing API key here:
     API_KEY: 'YOUR_API_KEY_HERE',
     BASE_URL: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline',
   };
   ```
3. Replace `'YOUR_API_KEY_HERE'` with your actual API key:
   ```javascript
   API_KEY: 'abc123yourkeyhere',
   ```
4. Save the file.

### Environment Variable File (`.env`)

A `.env` file is also included in the project directory for standard configuration conventions:
```env
VISUAL_CROSSING_API_KEY=YOUR_API_KEY_HERE
```

> **Note on Browser Restrictions**:
> Browsers run within a strict security sandbox and cannot execute Node.js-style `process.env` commands or fetch local filesystem `.env` files without a backend server or bundler (such as Vite, Webpack, or Next.js). Attempting to `fetch('.env')` in client-side code will fail due to CORS or security policies.

---

## Security Considerations

### 1. Key Exposure in Frontend JavaScript
When an API key is placed in client-side code, it is transmitted directly to the user's browser. Any visitor can open browser Developer Tools (the **Network** tab or **Sources** tab) and inspect the API key.

### 2. Recommended Production Architecture (Server-Side Proxy)
For a production deployment, **never expose third-party API keys in client-side JavaScript**. Instead, implement a lightweight backend server or serverless proxy (such as a Node.js/Express service, Cloudflare Worker, or Vercel Serverless Function):
1. The frontend sends a request to your internal endpoint: `GET /api/weather?location=London`.
2. The server-side proxy reads the secret API key securely from its environment variables (`process.env.VISUAL_CROSSING_API_KEY`).
3. The server makes the request to Visual Crossing and returns the filtered JSON payload to your frontend.
4. Your API key remains protected on the server, and you can enforce rate limiting, user authentication, and response caching.

### 3. Avoiding Committing Secrets to GitHub
- The project includes a `.gitignore` file that automatically excludes `.env`, `*.env`, and temporary system files.
- Before committing code to a public repository, ensure `CONFIG.API_KEY` in `script.js` is reverted to `'YOUR_API_KEY_HERE'`.
- Never commit active API keys to version control.

---

## How to Run Locally

You can run WeatherNow using any static local web server or by directly opening the file in a modern browser.

### Option A: Using Python 3 (Recommended)
Open your terminal, navigate to the `weather-app` (or `task20`) folder, and start a local HTTP server:
```bash
cd task20
python3 -m http.server 8000
```
Then open your browser and navigate to:
```text
http://localhost:8000
```

### Option B: Using Node.js `npx serve`
```bash
cd task20
npx serve .
```

### Option C: Direct Browser Opening
Double-click `index.html` or drag and drop it into any modern web browser (Chrome, Firefox, Safari, Edge).

---

## Project Structure

```text
task20/
├── index.html       # Semantic HTML5 layout and Tailwind structure
├── style.css        # Minimal custom CSS (scrollbar, animations)
├── script.js        # Vanilla JS logic (validation, fetch, calculations, UI)
├── .env             # Environment configuration file
├── .gitignore       # Git ignore rules for secrets and OS files
└── README.md        # Documentation and security guide
```

