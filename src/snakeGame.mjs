export const DIRECTIONS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 }),
});

const DEFAULT_GRID_SIZE = 16;
const DEFAULT_SNAKE = Object.freeze([
  Object.freeze({ x: 7, y: 8 }),
  Object.freeze({ x: 6, y: 8 }),
  Object.freeze({ x: 5, y: 8 }),
]);
const DEFAULT_FOOD = Object.freeze({ x: 11, y: 8 });

export function createInitialState({ gridSize = DEFAULT_GRID_SIZE, snake = DEFAULT_SNAKE, food = DEFAULT_FOOD } = {}) {
  return {
    gridSize,
    snake: cloneCells(snake),
    direction: 'right',
    pendingDirection: 'right',
    food: { ...food },
    score: 0,
    status: 'ready',
  };
}

export function changeDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection] || isOpposite(state.direction, nextDirection)) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

export function nextState(state, random = Math.random) {
  if (state.status === 'game-over') {
    return state;
  }

  const direction = DIRECTIONS[state.pendingDirection];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };
  const willEat = positionsEqual(nextHead, state.food);
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

  if (isOutsideGrid(nextHead, state.gridSize) || containsCell(bodyToCheck, nextHead)) {
    return {
      ...state,
      direction: state.pendingDirection,
      status: 'game-over',
    };
  }

  const snake = [nextHead, ...state.snake];
  if (!willEat) {
    snake.pop();
  }
  const nextFood = willEat ? spawnFood(state.gridSize, snake, random) : state.food;

  return {
    ...state,
    snake,
    direction: state.pendingDirection,
    food: nextFood,
    score: willEat ? state.score + 1 : state.score,
    status: nextFood === null ? 'game-over' : 'playing',
  };
}

export function spawnFood(gridSize, snake, random = Math.random) {
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = { x, y };
      if (!containsCell(snake, cell)) {
        openCells.push(cell);
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * openCells.length) % openCells.length;
  return openCells[index];
}

export function isOpposite(currentDirection, nextDirection) {
  const current = DIRECTIONS[currentDirection];
  const next = DIRECTIONS[nextDirection];

  return current.x + next.x === 0 && current.y + next.y === 0;
}

export function containsCell(cells, target) {
  return cells.some((cell) => positionsEqual(cell, target));
}

export function positionsEqual(a, b) {
  return Boolean(a && b && a.x === b.x && a.y === b.y);
}

function isOutsideGrid(cell, gridSize) {
  return cell.x < 0 || cell.y < 0 || cell.x >= gridSize || cell.y >= gridSize;
}

function cloneCells(cells) {
  return cells.map((cell) => ({ ...cell }));
}
