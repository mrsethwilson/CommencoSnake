import { changeDirection, createInitialState, nextState, positionsEqual } from './snakeGame.mjs';

const TICK_MS = 140;
const keyDirectionMap = new Map([
  ['ArrowUp', 'up'],
  ['w', 'up'],
  ['W', 'up'],
  ['ArrowDown', 'down'],
  ['s', 'down'],
  ['S', 'down'],
  ['ArrowLeft', 'left'],
  ['a', 'left'],
  ['A', 'left'],
  ['ArrowRight', 'right'],
  ['d', 'right'],
  ['D', 'right'],
]);

const board = document.querySelector('[data-board]');
const score = document.querySelector('[data-score]');
const statusText = document.querySelector('[data-status]');
const pauseButton = document.querySelector('[data-pause]');
const restartButton = document.querySelector('[data-restart]');
const controlButtons = document.querySelectorAll('[data-direction]');

let state = createInitialState();
let timerId = null;

function startGame() {
  if (timerId) {
    return;
  }

  state = {
    ...state,
    status: 'playing',
  };
  timerId = window.setInterval(tick, TICK_MS);
  render();
}

function resetGame() {
  stopGame();
  state = createInitialState();
  render();
  board.focus();
}

function togglePause() {
  if (state.status === 'game-over' || state.status === 'ready') {
    return;
  }

  if (state.status === 'paused') {
    startGame();
    return;
  }

  stopGame();
  state = {
    ...state,
    status: 'paused',
  };
  render();
}

function stopGame() {
  if (timerId) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

function tick() {
  state = nextState(state);

  if (state.status === 'game-over') {
    stopGame();
  }

  render();
}

function requestDirection(direction) {
  if (state.status === 'game-over') {
    return;
  }

  state = changeDirection(state, direction);
  startGame();
}

function render() {
  board.replaceChildren();
  board.classList.toggle('game-over', state.status === 'game-over');
  board.style.setProperty('--grid-size', state.gridSize);
  board.setAttribute('aria-label', state.status === 'game-over' ? 'You Lose' : 'Snake board');

  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      const cell = document.createElement('div');
      const point = { x, y };
      const snakeIndex = state.snake.findIndex((segment) => positionsEqual(segment, point));

      cell.className = 'cell';
      if (state.status === 'game-over') {
        board.append(cell);
        continue;
      }

      if (snakeIndex === 0) {
        cell.classList.add('snake-head');
      } else if (snakeIndex > 0) {
        cell.classList.add('snake-body');
      } else if (positionsEqual(state.food, point)) {
        cell.classList.add('food');
      }

      board.append(cell);
    }
  }

  score.textContent = String(state.score);
  statusText.textContent = getStatusText();
  pauseButton.textContent = state.status === 'paused' ? 'Resume' : 'Pause';
  pauseButton.disabled = state.status === 'ready' || state.status === 'game-over';
}

function getStatusText() {
  if (state.status === 'game-over') {
    return 'You Lose. Press Restart to play again.';
  }

  if (state.status === 'paused') {
    return 'Paused. Press Space to resume.';
  }

  if (state.status === 'ready') {
    return 'Press an arrow key or WASD to start.';
  }

  return 'Playing';
}

window.addEventListener('keydown', (event) => {
  const direction = keyDirectionMap.get(event.key);

  if (direction) {
    event.preventDefault();
    requestDirection(direction);
    return;
  }

  if (event.key === ' ') {
    event.preventDefault();
    if (state.status !== 'game-over') {
      togglePause();
    }
  }
});

pauseButton.addEventListener('click', () => {
  togglePause();
  board.focus();
});
restartButton.addEventListener('click', resetGame);

for (const button of controlButtons) {
  button.addEventListener('click', () => {
    requestDirection(button.dataset.direction);
    board.focus();
  });
}

render();
