/**
 * SDK Entry Point
 */

'use strict';

const { MpayUapiClient, SDK_VERSION } = require('./client');
const { MpayUapiError } = require('./errors');

module.exports = {
  MpayUapiClient,
  MpayUapiError,
  SDK_VERSION,
};
