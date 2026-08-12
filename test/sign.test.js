'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildStringToSign, sign, canonicalizeQuery, canonicalizeBody } = require('../src/sign');

test('canonicalizeQuery: Empty object returns an empty string', () => {
  assert.equal(canonicalizeQuery(undefined), '');
  assert.equal(canonicalizeQuery({}), '');
});

test('canonicalizeQuery: Sort by key', () => {
  assert.equal(canonicalizeQuery({ b: '2', a: '1' }), 'a=1&b=2');
});

test('canonicalizeBody: Empty body returns an empty string', () => {
  assert.equal(canonicalizeBody(undefined), '');
  assert.equal(canonicalizeBody(null), '');
  assert.equal(canonicalizeBody({}), '');
});

test('canonicalizeBody: Sort by key and JSON serialize', () => {
  assert.equal(canonicalizeBody({ b: 2, a: 1 }), '{"a":1,"b":2}');
});

test('buildStringToSign: GET requests use query', () => {
  const str = buildStringToSign({
    method: 'get',
    path: '/card/info',
    timestamp: '1700000000000',
    nonce: 'abc-123',
    query: { cardId: '123' },
  });
  assert.equal(str, 'GET\n/card/info\n1700000000000\nabc-123\ncardId=123');
});

test('buildStringToSign: POST requests use body', () => {
  const str = buildStringToSign({
    method: 'POST',
    path: '/card/create',
    timestamp: '1700000000000',
    nonce: 'abc-123',
    body: { productId: 'p1' },
  });
  assert.equal(str, 'POST\n/card/create\n1700000000000\nabc-123\n{"productId":"p1"}');
});

test('sign: Same input produces the same signature (deterministic)', () => {
  const s1 = sign('secret', 'hello');
  const s2 = sign('secret', 'hello');
  assert.equal(s1, s2);
  assert.match(s1, /^[0-9a-f]{64}$/);
});

test('sign: Different secrets produce different signatures', () => {
  const s1 = sign('secret-a', 'hello');
  const s2 = sign('secret-b', 'hello');
  assert.notEqual(s1, s2);
});
