// Game configuration and state variables
const GOAL_CANS = 20;
const MAX_SCORING_CANS = 30;
const GAME_DURATION = 30;
const PENALTY_CANS_PER_SPAWN = 2;
const PERFECT_GAME_MESSAGE = 'Amazing! You collected every single one of the 30 jerry cans!';
const WINNING_MESSAGES = [
  'You did it! The water is clean! You collected {count} jerry cans!',
  'Fantastic work! You collected {count} cans!',
  'Great job! You reached {count} cans!'
];
const LOSING_MESSAGES = [
  'Time is up! Try again to reach 20 cans.',
  'Almost there! Try again for a cleaner shore.',
  'Keep going! You can collect 20 cans next time.'
];
let currentCans = 0;
let timeLeft = GAME_DURATION;
let scoringCansSpawned = 0;
let scoringCansCollected = 0;
let gameActive = false;
let spawnInterval;
let timerInterval;
let confettiTimeout;

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Spawns one scoring can and two penalty cans in random grid cells
function spawnWaterCan() {
  if (!gameActive || scoringCansSpawned >= MAX_SCORING_CANS) return;
  scoringCansSpawned += 1;
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));

  const availableCells = Array.from(cells);
  const totalCans = PENALTY_CANS_PER_SPAWN + 1;

  for (let canIndex = 0; canIndex < totalCans; canIndex += 1) {
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const randomCell = availableCells.splice(randomIndex, 1)[0];
    const penaltyClass = canIndex > 0 ? ' penalty-can' : '';

    randomCell.innerHTML = `
      <div class="water-can-wrapper">
        <div class="water-can${penaltyClass}"></div>
      </div>
    `;
  }
}

function updateStats() {
  document.getElementById('current-cans').textContent = currentCans;
  document.getElementById('timer').textContent = timeLeft;
}

function clearWaterConfetti() {
  clearTimeout(confettiTimeout);
  document.querySelector('.water-confetti')?.remove();
}

function showWaterConfetti() {
  clearWaterConfetti();
  const confetti = document.createElement('div');
  confetti.className = 'water-confetti';
  confetti.setAttribute('aria-hidden', 'true');

  for (let dropIndex = 0; dropIndex < 36; dropIndex += 1) {
    const drop = document.createElement('span');
    drop.className = 'water-droplet';
    drop.style.left = `${Math.random() * 100}%`;
    drop.style.animationDelay = `${Math.random() * 0.5}s`;
    drop.style.animationDuration = `${1.8 + Math.random() * 0.8}s`;
    confetti.appendChild(drop);
  }

  document.body.appendChild(confetti);
  confettiTimeout = setTimeout(() => confetti.remove(), 3200);
}

function handleCanClick(event) {
  const clickedCan = event.target.closest('.water-can');
  if (!gameActive || !clickedCan) return;

  if (clickedCan.classList.contains('penalty-can')) {
    currentCans = Math.max(0, currentCans - 1);
  } else {
    currentCans += 1;
    scoringCansCollected += 1;
  }
  clickedCan.closest('.grid-cell').innerHTML = '';
  updateStats();
}

function resetGame() {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  clearWaterConfetti();
  currentCans = 0;
  timeLeft = GAME_DURATION;
  scoringCansSpawned = 0;
  scoringCansCollected = 0;
  document.getElementById('achievements').textContent = '';
  document.querySelectorAll('.grid-cell').forEach(cell => (cell.innerHTML = ''));
  updateStats();
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return; // Prevent starting a new game if one is already active
  resetGame();
  gameActive = true;
  createGrid(); // Set up the game grid
  spawnWaterCan();
  spawnInterval = setInterval(spawnWaterCan, 1000); // Spawn water cans every second
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateStats();
    if (timeLeft === 0) endGame();
  }, 1000);
}

function endGame() {
  gameActive = false; // Mark the game as inactive
  clearInterval(spawnInterval); // Stop spawning water cans
  clearInterval(timerInterval);
  document.querySelectorAll('.grid-cell').forEach(cell => (cell.innerHTML = ''));

  const isWinner = currentCans >= GOAL_CANS;
  const messages = isWinner ? WINNING_MESSAGES : LOSING_MESSAGES;
  const selectedMessage = messages[Math.floor(Math.random() * messages.length)];
  const message = isWinner && scoringCansCollected === MAX_SCORING_CANS
    ? PERFECT_GAME_MESSAGE
    : isWinner
      ? selectedMessage.replace('{count}', currentCans)
      : selectedMessage;
  document.getElementById('achievements').textContent = message;
  if (isWinner) showWaterConfetti();
}

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('reset-game').addEventListener('click', resetGame);
document.querySelector('.game-grid').addEventListener('click', handleCanClick);

