// ==========================================
// 1. QUIZ QUESTIONS DATA
// ==========================================
const questions = [
  {
    question: "What is the capital of Japan?",
    options: ["Seoul", "Tokyo", "Beijing", "Bangkok"],
    answer: "Tokyo"
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    answer: "Mars"
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
    answer: "Leonardo da Vinci"
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    answer: "Pacific Ocean"
  },
  {
    question: "Which chemical element has the symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Iron"],
    answer: "Oxygen"
  },
  {
    question: "In which year did the Titanic sink?",
    options: ["1912", "1905", "1920", "1898"],
    answer: "1912"
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    answer: "Diamond"
  },
  {
    question: "Which country is the natural habitat of the kangaroo?",
    options: ["South Africa", "Australia", "Brazil", "New Zealand"],
    answer: "Australia"
  },
  {
    question: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    answer: "7"
  },
  {
    question: "What is the official currency of the United Kingdom?",
    options: ["Euro", "Pound Sterling", "Dollar", "Yen"],
    answer: "Pound Sterling"
  }
];

// ==========================================
// 2. APPLICATION STATE
// ==========================================
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 60;
let timerInterval = null;
let userAnswers = []; // Stores user result for each question

// ==========================================
// 3. DOM ELEMENTS
// ==========================================
// Screens
const welcomeScreen = document.getElementById("welcome-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultsScreen = document.getElementById("results-screen");

// Quiz Page Elements
const currentQuestionNumEl = document.getElementById("current-question-num");
const totalQuestionsNumEl = document.getElementById("total-questions-num");
const currentScoreEl = document.getElementById("current-score");
const progressBarEl = document.getElementById("progress-bar");
const timerBadgeEl = document.getElementById("timer-badge");
const timerTextEl = document.getElementById("timer-text");
const questionTextEl = document.getElementById("question-text");
const optionsContainerEl = document.getElementById("options-container");
const feedbackContainerEl = document.getElementById("feedback-container");
const feedbackTextEl = document.getElementById("feedback-text");
const nextBtn = document.getElementById("next-btn");

// Results Page Elements
const finalScoreEl = document.getElementById("final-score");
const percentageScoreEl = document.getElementById("percentage-score");
const correctCountEl = document.getElementById("correct-count");
const incorrectCountEl = document.getElementById("incorrect-count");
const unansweredCountEl = document.getElementById("unanswered-count");
const reviewListEl = document.getElementById("review-list");

// Control Buttons
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

// ==========================================
// 4. CORE FUNCTIONS
// ==========================================

// Starts the quiz from question 1
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];

  // Show quiz screen, hide welcome and results screens
  welcomeScreen.classList.add("hidden");
  resultsScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  totalQuestionsNumEl.textContent = questions.length;
  currentScoreEl.textContent = score;

  showQuestion();
}

// Displays the current question and answer options
function showQuestion() {
  // Clear any existing timer
  clearInterval(timerInterval);

  // Reset feedback & next button
  feedbackContainerEl.classList.add("hidden");
  feedbackContainerEl.className = "hidden rounded-lg p-3 text-sm font-medium mb-5";
  feedbackTextEl.textContent = "";
  nextBtn.classList.add("hidden");

  const currentQ = questions[currentQuestionIndex];

  // Update question header info
  currentQuestionNumEl.textContent = currentQuestionIndex + 1;
  currentScoreEl.textContent = score;

  // Update progress bar percentage
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressBarEl.style.width = progressPercent + "%";

  // Display question text
  questionTextEl.textContent = currentQ.question;

  // Render 4 answer options (A, B, C, D)
  optionsContainerEl.innerHTML = "";
  const optionLetters = ["A", "B", "C", "D"];

  currentQ.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "w-full text-left p-3.5 sm:p-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium flex items-center transition cursor-pointer";
    button.dataset.option = option;

    button.innerHTML = `
      <span class="option-letter inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm mr-3 flex-shrink-0">
        ${optionLetters[index]}
      </span>
      <span class="option-text flex-1">${option}</span>
    `;

    button.addEventListener("click", () => selectAnswer(option, button));
    optionsContainerEl.appendChild(button);
  });

  // Start the 60-second countdown timer
  startTimer();
}

// Starts the 60-second countdown for the current question
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 60;
  timerTextEl.textContent = timeLeft;

  // Normal timer badge appearance
  timerBadgeEl.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200";

  timerInterval = setInterval(() => {
    timeLeft--;
    timerTextEl.textContent = timeLeft;

    // Highlight timer in red when 10 seconds or less remain
    if (timeLeft <= 10) {
      timerBadgeEl.className = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200";
    }

    // When timer reaches zero
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}

// Handles when the countdown timer reaches zero
function handleTimeout() {
  clearInterval(timerInterval);

  // Decrease score by 1 for timeout
  score--;
  currentScoreEl.textContent = score;

  const currentQ = questions[currentQuestionIndex];

  // Record unanswered / skipped answer
  userAnswers.push({
    question: currentQ.question,
    selectedAnswer: "Skipped (Time's up)",
    correctAnswer: currentQ.answer,
    status: "skipped"
  });

  // Disable all answer buttons and highlight the correct one
  const allButtons = optionsContainerEl.querySelectorAll("button");
  allButtons.forEach((btn) => {
    btn.disabled = true;
    const letterSpan = btn.querySelector(".option-letter");

    if (btn.dataset.option === currentQ.answer) {
      // Highlight correct answer in green
      btn.className = "w-full text-left p-3.5 sm:p-4 rounded-lg border-2 border-green-500 bg-green-50 text-green-900 font-semibold flex items-center transition cursor-not-allowed";
      letterSpan.className = "option-letter inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white font-semibold text-sm mr-3 flex-shrink-0";
    } else {
      btn.className = "w-full text-left p-3.5 sm:p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 font-medium flex items-center transition cursor-not-allowed opacity-60";
    }
  });

  // Show time's up feedback message
  feedbackContainerEl.className = "rounded-lg p-3 text-sm font-medium mb-5 bg-amber-50 border border-amber-200 text-amber-900";
  feedbackTextEl.textContent = "Time is up! The correct answer is " + currentQ.answer + ".";
  feedbackContainerEl.classList.remove("hidden");

  // Display Next Question button
  nextBtn.classList.remove("hidden");
  nextBtn.textContent = (currentQuestionIndex === questions.length - 1) ? "View Results" : "Next Question";
}

// Handles selection of an answer by user
function selectAnswer(selectedOption, selectedButton) {
  // Stop the countdown timer immediately
  clearInterval(timerInterval);

  const currentQ = questions[currentQuestionIndex];
  const allButtons = optionsContainerEl.querySelectorAll("button");

  // Disable all buttons to prevent multiple answers
  allButtons.forEach((btn) => {
    btn.disabled = true;
  });

  const isCorrect = selectedOption === currentQ.answer;

  if (isCorrect) {
    // Increase score by 1
    score++;
    currentScoreEl.textContent = score;

    // Highlight selected button in green
    selectedButton.className = "w-full text-left p-3.5 sm:p-4 rounded-lg border-2 border-green-500 bg-green-50 text-green-900 font-semibold flex items-center transition cursor-not-allowed";
    const selectedLetter = selectedButton.querySelector(".option-letter");
    selectedLetter.className = "option-letter inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white font-semibold text-sm mr-3 flex-shrink-0";

    // Mute remaining buttons
    allButtons.forEach((btn) => {
      if (btn !== selectedButton) {
        btn.className = "w-full text-left p-3.5 sm:p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 font-medium flex items-center transition cursor-not-allowed opacity-60";
      }
    });

    // Display positive feedback message
    feedbackContainerEl.className = "rounded-lg p-3 text-sm font-medium mb-5 bg-green-50 border border-green-200 text-green-800";
    feedbackTextEl.textContent = "Correct! Well done.";

    // Record answer result
    userAnswers.push({
      question: currentQ.question,
      selectedAnswer: selectedOption,
      correctAnswer: currentQ.answer,
      status: "correct"
    });
  } else {
    // Incorrect answer: 0 points (score does not change)
    // Highlight selected button in red
    selectedButton.className = "w-full text-left p-3.5 sm:p-4 rounded-lg border-2 border-red-500 bg-red-50 text-red-900 font-semibold flex items-center transition cursor-not-allowed";
    const selectedLetter = selectedButton.querySelector(".option-letter");
    selectedLetter.className = "option-letter inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white font-semibold text-sm mr-3 flex-shrink-0";

    // Reveal correct answer in green and mute other options
    allButtons.forEach((btn) => {
      if (btn.dataset.option === currentQ.answer) {
        btn.className = "w-full text-left p-3.5 sm:p-4 rounded-lg border-2 border-green-500 bg-green-50 text-green-900 font-semibold flex items-center transition cursor-not-allowed";
        const correctLetter = btn.querySelector(".option-letter");
        correctLetter.className = "option-letter inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white font-semibold text-sm mr-3 flex-shrink-0";
      } else if (btn !== selectedButton) {
        btn.className = "w-full text-left p-3.5 sm:p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 font-medium flex items-center transition cursor-not-allowed opacity-60";
      }
    });

    // Display incorrect feedback message
    feedbackContainerEl.className = "rounded-lg p-3 text-sm font-medium mb-5 bg-red-50 border border-red-200 text-red-800";
    feedbackTextEl.textContent = "Incorrect! The correct answer is " + currentQ.answer + ".";

    // Record answer result
    userAnswers.push({
      question: currentQ.question,
      selectedAnswer: selectedOption,
      correctAnswer: currentQ.answer,
      status: "incorrect"
    });
  }

  feedbackContainerEl.classList.remove("hidden");

  // Display Next Question button
  nextBtn.classList.remove("hidden");
  nextBtn.textContent = (currentQuestionIndex === questions.length - 1) ? "View Results" : "Next Question";
}

// Navigates to the next question or shows results
function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// Displays the final results screen with statistics and answer review
function showResults() {
  clearInterval(timerInterval);

  // Switch screens
  quizScreen.classList.add("hidden");
  resultsScreen.classList.remove("hidden");

  // Calculate statistics
  const correctCount = userAnswers.filter((a) => a.status === "correct").length;
  const incorrectCount = userAnswers.filter((a) => a.status === "incorrect").length;
  const unansweredCount = userAnswers.filter((a) => a.status === "skipped").length;
  const percentage = Math.round((correctCount / questions.length) * 100);

  // Update summary numbers
  finalScoreEl.textContent = score + " / " + questions.length;
  percentageScoreEl.textContent = percentage + "%";
  correctCountEl.textContent = correctCount;
  incorrectCountEl.textContent = incorrectCount;
  unansweredCountEl.textContent = unansweredCount;

  // Render review list of all 10 questions
  reviewListEl.innerHTML = "";

  userAnswers.forEach((item, index) => {
    const reviewItem = document.createElement("div");
    reviewItem.className = "bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm";

    // Determine badge and styling according to answer status
    let statusBadge = "";
    let userText = "";

    if (item.status === "correct") {
      statusBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">Correct (+1)</span>';
      userText = `<span class="font-medium text-green-700">${item.selectedAnswer}</span>`;
    } else if (item.status === "incorrect") {
      statusBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">Incorrect (0)</span>';
      userText = `<span class="font-medium text-red-600">${item.selectedAnswer}</span>`;
    } else {
      statusBadge = '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">Skipped (-1)</span>';
      userText = `<span class="font-medium text-amber-700 italic">None (Time ran out)</span>`;
    }

    reviewItem.innerHTML = `
      <div class="flex justify-between items-start gap-2 mb-2">
        <p class="font-semibold text-gray-800">${index + 1}. ${item.question}</p>
        <div class="flex-shrink-0">${statusBadge}</div>
      </div>
      <div class="space-y-1 text-xs text-gray-600">
        <p>Your Answer: ${userText}</p>
        <p>Correct Answer: <span class="font-semibold text-gray-800">${item.correctAnswer}</span></p>
      </div>
    `;

    reviewListEl.appendChild(reviewItem);
  });
}

// Resets all state and returns to the welcome page
function restartQuiz() {
  clearInterval(timerInterval);

  currentQuestionIndex = 0;
  score = 0;
  timeLeft = 60;
  userAnswers = [];

  // Switch screens back to welcome page
  resultsScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  welcomeScreen.classList.remove("hidden");
}

// ==========================================
// 5. EVENT LISTENERS
// ==========================================
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restartQuiz);

