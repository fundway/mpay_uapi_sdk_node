'use strict';

/**
 * Unified SDK error type.
 * - Business errors (API returns code !== 0): code / httpStatus / data are all available
 * - Network errors: code is 'NETWORK_ERROR'
 * - Timeout: code is 'TIMEOUT'
 */
class MpayUapiError extends Error {
  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {string|number} [options.code]
   * @param {number} [options.httpStatus]
   * @param {*} [options.data]
   * @param {Error} [options.cause]
   */
  constructor(message, { code, httpStatus, data, cause } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'MpayUapiError';
    this.httpStatus = httpStatus;
    this.code = code;
    this.data = data;
  }

  /**
   * Returns a JSON-serializable representation of the error.
   *
   * @returns {Object} A plain object containing the error details.
   */
  toJSON() {
    return {
      httpStatus: this.httpStatus,
      code: this.code,
      message: this.message,
      data: this.data,
    };
  }
}

module.exports = { MpayUapiError };
