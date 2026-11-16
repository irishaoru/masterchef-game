const { test } = require('node:test');
const assert = require('node:assert/strict');
const { quality, methodsOf, scoreDish } = require('../quality.js');

// Each case supplies cooking progress directly, without waiting for the game timer.
for (const [description, name, done, sear, expected] of [
  ['chicken at 0.85 is perfect', 'Chicken', 0.85, 0, 'perfect'],
  ['sear exactly 1.9 does not count as burnt', 'Chicken', 1, 1.9, 'perfect'],
]) {
  test(description, () => {
    assert.equal(quality({ name, done, sear }), expected);
  });
}

test('a heat method counts at exactly two exposure units, not below', () => {
  assert.deepEqual(methodsOf({ form: 'whole', exposure: { saute: 1.999, boil: 2, bake: 3 } }), ['boil', 'bake']);
});
test('blending counts only after food becomes puree', () => {
  assert.deepEqual(methodsOf({ form: 'whole', exposure: { blend: 10 } }), []);
  assert.deepEqual(methodsOf({ form: 'puree', exposure: {} }), ['blend']);
});

function basket() {
  return ['Chicken', 'Carrot', 'Pasta', 'Tomato', 'Strawberry', 'Egg'].map((name, id) => ({
    id, name, where: 'table', form: 'whole', done: 0, sear: 0, exposure: {}, partners: [],
  }));
}

test('an empty plate gets minimum judge scores and total cannot go negative', () => {
  const result = scoreDish(basket(), []);
  assert.deepEqual(result.scores, [1, 1, 1]);
  assert.equal(result.subtotal, 3);
  assert.equal(result.waste, 12);
  assert.equal(result.total, 0);
});
test('one unplated ingredient costs exactly two points', () => {
  const food = basket();
  food.forEach(item => Object.assign(item, { where: 'plate', form: 'prepped', done: 1, exposure: { boil: 2 } }));
  food[0].where = 'table';
  const result = scoreDish(food, ['Salt']);
  assert.equal(result.waste, 2);
  assert.deepEqual(result.unused, ['Chicken']);
  assert.equal(result.total, result.subtotal - 2);
});
test('changing unplated food does not change the judges scores', () => {
  const food = basket();
  food[1].where = 'plate';
  const before = scoreDish(food, []);
  food[0].done = 1;
  food[0].form = 'prepped';
  food[0].exposure = { saute: 4 };
  assert.deepEqual(scoreDish(food, []), before);
});
