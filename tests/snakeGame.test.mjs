import assert from 'node:assert/strict';
import test from 'node:test';

import { changeDirection, createInitialState, nextState, spawnFood } from '../src/snakeGame.mjs';

test('moves the snake one cell in the current direction', () => {
  const state = createInitialState({
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    food: { x: 9, y: 9 },
  });

  const next = nextState(state);

  assert.deepEqual(next.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
  ]);
  assert.equal(next.score, 0);
  assert.equal(next.status, 'playing');
});

test('grows and increments score when eating food', () => {
  const state = createInitialState({
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    food: { x: 3, y: 2 },
  });

  const next = nextState(state, () => 0);

  assert.deepEqual(next.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
  ]);
  assert.equal(next.score, 1);
});

test('does not allow reversing into the current direction', () => {
  const state = createInitialState();
  const changed = changeDirection(state, 'left');

  assert.equal(changed.pendingDirection, 'right');
});

test('detects wall collisions', () => {
  const state = createInitialState({
    gridSize: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
    ],
    food: { x: 0, y: 0 },
  });

  const next = nextState(state);

  assert.equal(next.status, 'game-over');
});

test('detects self collisions', () => {
  const state = {
    ...createInitialState({
      gridSize: 6,
      snake: [
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 2, y: 4 },
        { x: 2, y: 3 },
        { x: 1, y: 3 },
      ],
      food: { x: 0, y: 0 },
    }),
    direction: 'up',
    pendingDirection: 'left',
  };

  const next = nextState(state);

  assert.equal(next.status, 'game-over');
});

test('spawns food in an open cell using deterministic random input', () => {
  const food = spawnFood(
    2,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    () => 0.75,
  );

  assert.deepEqual(food, { x: 1, y: 1 });
});

test('ends the game when no food cells remain after growth', () => {
  const state = createInitialState({
    gridSize: 2,
    snake: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    food: { x: 1, y: 0 },
  });

  const next = nextState(state);

  assert.equal(next.food, null);
  assert.equal(next.status, 'game-over');
  assert.equal(next.score, 1);
});
