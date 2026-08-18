'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { MpayUapiClient } = require('../src/client');
const { MpayUapiError } = require('../src/errors');
const { buildStringToSign, sign } = require('../src/sign');

const API_KEY = 'ak_demo_apikey';
const API_SECRET = 'sk_demo_apisecret';

/**
 * Start a minimal mock server:
 * - Verify signatures (reuse the same sign.js to ensure the client and "server" use the same signing algorithm)
 * - /card/list, /card/info return responses in the agreed format
 * - /slow is used for timeout testing
 * - /flaky returns 500 for the first two requests and succeeds on the third, used for retry testing
 */
function createMockServer() {
  let flakyCount = 0;

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    const query = Object.fromEntries(url.searchParams.entries());

    let bodyChunks = [];
    req.on('data', (c) => bodyChunks.push(c));
    req.on('end', () => {
      const rawBody = Buffer.concat(bodyChunks).toString('utf8');
      const body = rawBody ? JSON.parse(rawBody) : undefined;

      if (path === '/slow') {
        setTimeout(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: 0, message: '', data: null }));
        }, 500);
        return;
      }

      if (path === '/flaky') {
        flakyCount += 1;
        if (flakyCount < 3) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: -1, message: 'internal error' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 0, message: '', data: { attempt: flakyCount } }));
        return;
      }

      // ---- Signature verification (simplified, for testing only) ----
      const apiKey = req.headers['x-api-key'];
      const timestamp = req.headers['x-timestamp'];
      const nonce = req.headers['x-nonce'];
      const signature = req.headers['x-signature'];

      const expected = sign(
        API_SECRET,
        buildStringToSign({ method: req.method, path, timestamp, nonce, query, body })
      );

      if (apiKey !== API_KEY || expected !== signature) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: -1, message: 'signature mismatch', data: null }));
        return;
      }

      if (path === '/v1/card/list') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 0, message: '', data: [{ card_id: 'card_1' }] }));
        return;
      }

      if (path === '/v1/card/info') {
        if (query.card_id !== 'card_1') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ code: 1002, message: 'card not found', data: null }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ code: 0, message: '', data: { card_id: 'card_1' } }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ code: -1, message: 'not found', data: null }));
    });
  });

  return server;
}

async function withServer(fn) {
  const server = createMockServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('listCards: Returns data when the signature is valid', async () => {
  await withServer(async (baseUrl) => {
    const client = new MpayUapiClient({ baseUrl, apiKey: API_KEY, apiSecret: API_SECRET });
    const res = await client.card.getCards();
    assert.equal(res.code, 0);
    assert.equal(res.data[0].card_id, 'card_1');
  });
});

test('getCardInfo: Returns data for valid cardId, throws MpayUapiError for invalid cardId', async () => {
  await withServer(async (baseUrl) => {
    const client = new MpayUapiClient({ baseUrl, apiKey: API_KEY, apiSecret: API_SECRET });
    const ok = await client.card.getCardInfo({ cardId: 'card_1' });
    assert.equal(ok.data.card_id, 'card_1');

    await assert.rejects(() => client.card.getCardInfo({ cardId: 'not_exist' }), (err) => {
      assert.ok(err instanceof MpayUapiError);
      assert.equal(err.httpStatus, 404);
      assert.equal(err.code, 1002);
      return true;
    });
  });
});

test('An incorrect apiSecret causes a signature mismatch and throws MpayUapiError', async () => {
  await withServer(async (baseUrl) => {
    const client = new MpayUapiClient({ baseUrl, apiKey: API_KEY, apiSecret: 'wrong-secret' });
    await assert.rejects(() => client.card.getCards(), (err) => {
      assert.ok(err instanceof MpayUapiError);
      assert.equal(err.httpStatus, 401);
      return true;
    });
  });
});

test('Timeout: Throws a TIMEOUT error when the timeout setting is too short', async () => {
  await withServer(async (baseUrl) => {
    const client = new MpayUapiClient({ baseUrl, apiKey: API_KEY, apiSecret: API_SECRET, timeout: 100 });
    await assert.rejects(() => client.request('GET', '/slow'), (err) => {
      assert.ok(err instanceof MpayUapiError);
      assert.equal(err.code, 'TIMEOUT');
      return true;
    });
  });
});

test('Retry: GET requests automatically retry on 5xx responses according to maxRetries', async () => {
  await withServer(async (baseUrl) => {
    const client = new MpayUapiClient({
      baseUrl,
      apiKey: API_KEY,
      apiSecret: API_SECRET,
      maxRetries: 3,
      retryDelay: 10,
      retryOn5xx: true,
    });
    const res = await client.request('GET', '/flaky');
    assert.equal(res.data.attempt, 3);
  });
});

test('Constructor: Throws a TypeError when required configuration is missing', () => {
  assert.throws(() => new MpayUapiClient({}), TypeError);
  assert.throws(() => new MpayUapiClient({ baseUrl: 'http://x' }), TypeError);
});
