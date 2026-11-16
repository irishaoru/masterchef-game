const { quality } = require('../quality.js');
const assert = require('node:assert/strict');
const { test } = require('node:test');

test('chicken at done 1 with no sear is perfect', () => {

const item = {
  name: 'Chicken',
  done: 1,
  sear: 0
};

const result = quality(item);
assert.equal(result, "perfect");

});