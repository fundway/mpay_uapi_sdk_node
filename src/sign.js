/**
 * Core HMAC-SHA256 signing logic.
 * Note: The rules here must remain fully consistent with the server-side verification logic.
 * Do not modify them arbitrarily.
 */

'use strict';

const crypto = require('crypto');

/**
 * Sort object keys in lexicographical order (one level only; keep the body structure flat whenever possible)
 * @param {Object} obj
 * @returns {Object}
 */
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys); // preserve array order, recurse into elements
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObjectKeys(obj[key]); // recurse into nested objects
      return acc;
    }, {});
}

/**
 * Canonicalize the query parameter object into a string for signing
 * @param {Object} [query]
 * @returns {string}
 */
function canonicalizeQuery(query) {
  if (!query || Object.keys(query).length === 0) return '';
  return Object.keys(query)
    .sort()
    .map((k) => `${k}=${query[k]}`)
    .join('&');
}

/**
 * Canonicalize the request body into a string for signing
 * @param {*} [body]
 * @returns {string}
 */
function canonicalizeBody(body) {
  if (body === undefined || body === null) return '';
  if (typeof body === 'object' && Object.keys(body).length === 0) return '';
  return JSON.stringify(sortObjectKeys(body));
}

/**
 * Build the string to sign
 * @param {Object} params
 * @param {string} params.method
 * @param {string} params.path
 * @param {string} params.timestamp
 * @param {string} params.nonce
 * @param {Object} [params.query]
 * @param {*} [params.body]
 * @returns {string}
 */
function buildStringToSign({ method, path, timestamp, nonce, query, body }) {
  const upperMethod = String(method).toUpperCase();
  const payload = upperMethod === 'GET' ? canonicalizeQuery(query) : canonicalizeBody(body);
  return [upperMethod, path, timestamp, nonce, payload].join('\n');
}

/**
 * Calculate the HMAC-SHA256 signature (hex encoded)
 * @param {string} secret
 * @param {string} stringToSign
 * @returns {string}
 */
function sign(secret, stringToSign) {
  return crypto.createHmac('sha256', secret).update(stringToSign, 'utf8').digest('hex');
}

module.exports = {
  sortObjectKeys,
  canonicalizeQuery,
  canonicalizeBody,
  buildStringToSign,
  sign,
};
