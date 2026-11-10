// ==========================================
// 1. DATA
// ==========================================
const options = [
  "HTML",
  "CSS",
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "PHP",
  "SQL"
];

// ==========================================
// 2. STATE
// ==========================================
let selectedOption = null;

// ==========================================
// 3. DOM ELEMENTS
// ==========================================
const dropdownContainer = document.getElementById("dropdown-container");
const dropdownBtn = document.getElementById("dropdown-btn");
const selectedText = document.getElementById("selected-text");
const dropdownArrow = document.getElementById("dropdown-arrow");
const dropdownMenu = document.getElementById("dropdown-menu");
const currentSelectionValue = document.getElementById("current-selection-value");

// ==========================================
// 4. FUNCTIONS
// ==========================================

// Render all options from the array into the dropdown menu
function renderOptions() {
  dropdownMenu.innerHTML = "";

  options.forEach((option) => {
    const li = document.createElement("li");
    li.className = "dropdown-item px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between transition select-none";
    li.dataset.value = option;
    li.setAttribute("role", "option");
    li.setAttribute("aria-selected", "false");

    li.innerHTML = `
      <span class="option-name">${option}</span>
      <span class="option-check hidden text-blue-600 font-bold text-sm">✓</span>
    `;

    li.addEventListener("click", () => {
      selectOption(option, li);
    });

    dropdownMenu.appendChild(li);
  });
}

// Toggles the dropdown menu between open and closed
function toggleDropdown() {
  const isClosed = dropdownMenu.classList.contains("hidden");

  if (isClosed) {
    openDropdown();
  } else {
    closeDropdown();
  }
}

// Opens the dropdown menu
function openDropdown() {
  dropdownMenu.classList.remove("hidden");
  dropdownArrow.classList.add("rotate-180");
  dropdownBtn.setAttribute("aria-expanded", "true");
}

// Closes the dropdown menu
function closeDropdown() {
  dropdownMenu.classList.add("hidden");
  dropdownArrow.classList.remove("rotate-180");
  dropdownBtn.setAttribute("aria-expanded", "false");
}

// Handles selecting an option
function selectOption(option, itemElement) {
  selectedOption = option;

  // Update button text and style
  selectedText.textContent = option;
  selectedText.className = "text-gray-900 font-medium";

  // Update selection feedback text
  if (currentSelectionValue) {
    currentSelectionValue.textContent = option;
  }

  // Update highlight state across all menu items
  const allItems = dropdownMenu.querySelectorAll(".dropdown-item");
  allItems.forEach((item) => {
    const checkmark = item.querySelector(".option-check");
    if (item === itemElement) {
      // Highlight selected option
      item.className = "dropdown-item px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition select-none bg-blue-50 text-blue-700 font-medium";
      item.setAttribute("aria-selected", "true");
      checkmark.classList.remove("hidden");
    } else {
      // Reset unselected options
      item.className = "dropdown-item px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between transition select-none";
      item.setAttribute("aria-selected", "false");
      checkmark.classList.add("hidden");
    }
  });

  // Close the dropdown after selection
  closeDropdown();
}

// ==========================================
// 5. EVENT LISTENERS
// ==========================================

// Click dropdown button to toggle open/close
dropdownBtn.addEventListener("click", (event) => {
  event.preventDefault();
  toggleDropdown();
});

// Click outside the dropdown to close it
document.addEventListener("click", (event) => {
  if (!dropdownContainer.contains(event.target)) {
    closeDropdown();
  }
});

// Initialize options list on page load
renderOptions();

