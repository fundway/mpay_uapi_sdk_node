'use strict';

class BaseApi {
  /**
   * Creates a BaseApi instance.
   *
   * @param {MpayUapiClient} client - The main SDK client used to send API requests.
   * @param {string} [version=''] - The API version prefix, such as 'v1'.
   */
  constructor(client, version) {
    this.client = client;
    this.version = version;
  }

  /**
   * Resolves an API URI by applying the configured URI prefix.
   *
   * The original leading slash of the URI is preserved.
   * If no API URI prefix is configured, the original URI is returned unchanged.
   *
   * Examples:
   *   resolveUri('/wallet/balance') with this.version = 'v1' => '/v1/wallet/balance'
   *   resolveUri('wallet/balance') with this.version = 'v1' => 'v1/wallet/balance'
   *   resolveUri('/wallet/balance') with this.version = '' => '/wallet/balance'
   *
   * @param {string} uri - The original API URI.
   * @returns {string} The resolved API URI.
   */
  resolveUri(uri) {
    const hasLeadingSlash = uri.startsWith('/');
    const path = hasLeadingSlash ? uri.slice(1) : uri;

    if (this.version) {
      const prefix = this.version.replace(/^\/|\/$/g, '');
      return `${hasLeadingSlash ? '/' : ''}${prefix}/${path}`;
    }

    return uri;
  }
}

module.exports = BaseApi;
