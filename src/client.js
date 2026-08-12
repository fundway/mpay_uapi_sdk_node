'use strict';

const crypto = require('crypto');
const { buildStringToSign, sign } = require('./sign');
const { MpayUapiError } = require('./errors');

const WalletApi = require('./apis/wallet');
const HolderApi = require('./apis/holder');
const CardApi = require('./apis/card');

const SDK_VERSION = require('../package.json').version;

const DEFAULT_API_VERSION = 'v1';
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_RETRIES = 0;
const DEFAULT_RETRY_DELAY_MS = 300;
const DEFAULT_RETRY_ON_5XX = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class MpayUapiClient {
  /**
   * @param {Object} config
   * @param {string} config.baseUrl              API base URL, e.g. https://uapi.mpay.cards
   * @param {string} config.apiKey               API Key
   * @param {string} config.apiSecret            API Secret, used only for local signature generation and never sent over the network
   * @param {string} [config.apiVersion='v1']    API version. Defaults to `v1`
   * @param {number} [config.timeout=10000]      Timeout for a single request (milliseconds)
   * @param {number} [config.maxRetries=0]       Maximum number of retries for network errors, timeouts, or 5xx responses (GET requests only)
   * @param {number} [config.retryDelay=300]     Base retry delay (milliseconds), using exponential backoff
   * @param {boolean} [config.retryOn5xx=false]  Whether to retry requests on HTTP 5xx server errors
   * @param {boolean} [config.debug=false]       Whether to print debug logs (apiSecret is never logged)
   * @param {Object} [config.headers]            Custom headers to be added to every request
   * @param {Function} [config.fetchImpl]        Custom fetch implementation; defaults to the global fetch (Node 18+)
   */
  constructor({
    baseUrl,
    apiKey,
    apiSecret,
    apiVersion = DEFAULT_API_VERSION,
    timeout = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
    retryOn5xx = DEFAULT_RETRY_ON_5XX,
    debug = false,
    headers = {},
    fetchImpl,
  } = {}) {
    if (!baseUrl) throw new TypeError('MpayUapiClient: "baseUrl" is required');
    if (!apiKey) throw new TypeError('MpayUapiClient: "apiKey" is required');
    if (!apiSecret) throw new TypeError('MpayUapiClient: "apiSecret" is required');

    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiVersion = apiVersion;
    this.timeout = timeout;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.retryOn5xx = retryOn5xx;
    this.debug = debug;
    this.extraHeaders = headers;
    this.fetch = fetchImpl || globalThis.fetch;

    if (typeof this.fetch !== 'function') {
      throw new Error(
        'MpayUapiClient: global fetch is not available. Use Node.js >= 18, or pass a custom `fetchImpl`.'
      );
    }

    // Initialize API modules.
    this.wallet = new WalletApi(this);
    this.holder = new HolderApi(this);
    this.card = new CardApi(this);
  }

  _log(...args) {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log('[mpay-uapi-sdk]', ...args);
    }
  }

  _buildHeaders(method, path, query, body) {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomUUID();
    const stringToSign = buildStringToSign({ method, path, timestamp, nonce, query, body });
    const signature = sign(this.apiSecret, stringToSign);

    return {
      'Content-Type': 'application/json',
      'User-Agent': `mpay-uapi-sdk/${SDK_VERSION} node/${process.version}`,
      ...this.extraHeaders,
      'X-Api-Key': this.apiKey,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Signature': signature,
    };
  }

  /**
   * Send a signed request (can be called directly to support future API endpoints)
   * @param {'GET'|'POST'|'PUT'|'DELETE'} method
   * @param {string} path e.g. '/v1/card/list'
   * @param {Object} [opts]
   * @param {Object} [opts.query]  Query parameters (GET)
   * @param {Object} [opts.body]   Request body (POST/PUT)
   * @returns {Promise<Object>} Complete JSON response from the API ({code, message, data})
   */
  async request(method, path, { query, body } = {}) {
    const upperMethod = String(method).toUpperCase();
    const isIdempotent = upperMethod === 'GET';
    const attempts = isIdempotent ? this.maxRetries + 1 : 1;

    // Remove query parameters whose values are null or undefined
    // to prevent them from being serialized into the request URL.
    if (query) {
      query = Object.fromEntries(
          Object.entries(query).filter(([, value]) => value != null)
      );
    }

    let lastError;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await this._doRequest(upperMethod, path, query, body);
      } catch (err) {
        lastError = err;
        const isHttpStatusRetryable = this.retryOn5xx ? err.httpStatus >= 500 : false;
        const retriable =
          err instanceof MpayUapiError && (['NETWORK_ERROR', 'TIMEOUT'].includes(err.code) || isHttpStatusRetryable);
        if (!retriable || attempt === attempts - 1) throw err;
        const delay = this.retryDelay * 2 ** attempt;
        this._log(`request failed (attempt ${attempt + 1}/${attempts}), retrying in ${delay}ms:`, err.message);
        await sleep(delay);
      }
    }
    // Should never reach here
    throw lastError;
  }

  async _doRequest(method, path, query, body) {
    if (this.apiVersion) {
      path = '/' + this.apiVersion + path;
    }

    const headers = this._buildHeaders(method, path, query, body);

    let url = this.baseUrl + path;
    if (query && Object.keys(query).length > 0) {
      const qs = new URLSearchParams(query).toString();
      url += `?${qs}`;
    }

    this._log(`${method} ${url}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    let resp;
    try {
      resp = await this.fetch(url, {
        method,
        headers,
        body: method === 'GET' || body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new MpayUapiError(`Request timed out after ${this.timeout}ms`, { code: 'TIMEOUT', cause: err });
      }
      throw new MpayUapiError(`Network request failed: ${err.message}`, { code: 'NETWORK_ERROR', cause: err });
    } finally {
      clearTimeout(timer);
    }

    let json;
    const text = await resp.text();
    try {
      json = text ? JSON.parse(text) : null;
    } catch (err) {
      throw new MpayUapiError('Response body is not valid JSON', { httpStatus: resp.status, data: text });
    }

    if (!resp.ok) {
      const error = json.error ? json.error : json;
      const data = json.data ?? error.data;
      throw new MpayUapiError(error.message || `HTTP ${resp.status}`, {
        code: error.code,
        data: data,
        httpStatus: resp.status,
      });
    }

    return json;
  }
}

module.exports = { MpayUapiClient, SDK_VERSION };
