// ==========================================
// 1. DOM ELEMENTS
// ==========================================
const form = document.getElementById("converter-form");
const tempInput = document.getElementById("temp-input");
const fromUnit = document.getElementById("from-unit");
const toUnit = document.getElementById("to-unit");
const convertBtn = document.getElementById("convert-btn");
const errorMessage = document.getElementById("error-message");
const resultContainer = document.getElementById("result-container");
const resultText = document.getElementById("result-text");

// Unit symbols mapping
const unitSymbols = {
  celsius: "°C",
  fahrenheit: "°F",
  kelvin: "K"
};

// Physical absolute zero lower bounds
const absoluteZeros = {
  celsius: -273.15,
  fahrenheit: -459.67,
  kelvin: 0
};

// ==========================================
// 2. INPUT VALIDATION & BUTTON STATE
// ==========================================

// Checks whether all three fields are validly filled and toggles button
function checkInputs() {
  const rawValue = tempInput.value.trim();
  const numValue = Number(rawValue);

  const isValidNumber = rawValue !== "" && !isNaN(numValue) && isFinite(numValue);
  const isFromSelected = fromUnit.value !== "";
  const isToSelected = toUnit.value !== "";

  // Enable button only if all 3 fields contain valid values
  const canConvert = isValidNumber && isFromSelected && isToSelected;
  convertBtn.disabled = !canConvert;

  // Hide previous result and error message when user modifies any input
  resultContainer.classList.add("hidden");
  errorMessage.classList.add("hidden");
  errorMessage.textContent = "";
}

// ==========================================
// 3. CONVERSION LOGIC
// ==========================================

// Performs the conversion calculations and triggers result display
function convertTemperature(event) {
  if (event) event.preventDefault();

  const temp = Number(tempInput.value.trim());
  const from = fromUnit.value;
  const to = toUnit.value;

  // Double check basic validity
  if (isNaN(temp) || !isFinite(temp) || !from || !to) {
    showError("Please enter a valid temperature and select both units.");
    return;
  }

  // Validate against physical absolute zero limits
  if (temp < absoluteZeros[from]) {
    const minTemp = absoluteZeros[from];
    const symbol = unitSymbols[from];
    showError(`Temperature cannot be below absolute zero (${minTemp}${symbol}).`);
    return;
  }

  let convertedValue;

  // Same unit: no conversion needed
  if (from === to) {
    convertedValue = temp;
  }
  // Celsius conversions
  else if (from === "celsius" && to === "fahrenheit") {
    convertedValue = (temp * 9) / 5 + 32;
  } else if (from === "celsius" && to === "kelvin") {
    convertedValue = temp + 273.15;
  }
  // Fahrenheit conversions
  else if (from === "fahrenheit" && to === "celsius") {
    convertedValue = ((temp - 32) * 5) / 9;
  } else if (from === "fahrenheit" && to === "kelvin") {
    convertedValue = ((temp - 32) * 5) / 9 + 273.15;
  }
  // Kelvin conversions
  else if (from === "kelvin" && to === "celsius") {
    convertedValue = temp - 273.15;
  } else if (from === "kelvin" && to === "fahrenheit") {
    convertedValue = ((temp - 273.15) * 9) / 5 + 32;
  }

  displayResult(temp, from, convertedValue, to);
}

// ==========================================
// 4. DISPLAY FUNCTIONS
// ==========================================

// Formats a number to 2 decimal places and strips unnecessary trailing zeros
function formatNumber(num) {
  return parseFloat(num.toFixed(2));
}

// Displays the formatted conversion result
function displayResult(originalVal, from, convertedVal, to) {
  errorMessage.classList.add("hidden");
  errorMessage.textContent = "";

  const formattedOriginal = formatNumber(originalVal);
  const formattedConverted = formatNumber(convertedVal);

  const fromSymbol = unitSymbols[from];
  const toSymbol = unitSymbols[to];

  // Example: 25°C = 77°F
  resultText.textContent = `${formattedOriginal}${fromSymbol} = ${formattedConverted}${toSymbol}`;
  resultContainer.classList.remove("hidden");
}

// Displays an error message
function showError(message) {
  resultContainer.classList.add("hidden");
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

// ==========================================
// 5. EVENT LISTENERS
// ==========================================

// Input and change events update button enabled state and reset previous output
tempInput.addEventListener("input", checkInputs);
fromUnit.addEventListener("change", checkInputs);
toUnit.addEventListener("change", checkInputs);

// Form submission handles conversion without page reload
form.addEventListener("submit", convertTemperature);

// Run initial check on load
checkInputs();

