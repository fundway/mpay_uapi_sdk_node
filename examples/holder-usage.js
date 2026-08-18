'use strict';

/**
 * Cardholder Usage Example
 * Run: node examples/holder-usage.js
 *
 * Environment Variables:
 *   MPAY_UAPI_BASE_URL  API Base URL
 *   MPAY_UAPI_KEY       API Key
 *   MPAY_UAPI_SECRET    API Secret
 */

const { MpayUapiClient, MpayUapiError } = require('../src/index');

const client = new MpayUapiClient({
  baseUrl: process.env.MPAY_UAPI_BASE_URL || 'https://uapidev.mpay.cards',
  apiKey: process.env.MPAY_UAPI_KEY || 'ak_demo_apikey',
  apiSecret: process.env.MPAY_UAPI_SECRET || 'sk_demo_apisecret',
  timeout: 10000,
  maxRetries: 2, // GET requests automatically retry on network errors/timeout/5xx
  debug: false,
});

// Retrieves cardholder information.
async function getHolderInfo() {
  try {
    const info = await client.holder.getHolderInfo();
    console.log('>>>>> Cardholder information:\n', info);
    return info;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getHolderInfo failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Updates the cardholder information.
async function setHolderInfo() {
  try {
    const firstName = 'James';
    const lastName = 'Brown';
    const info = await client.holder.setHolderInfo({ firstName, lastName });
    console.log('>>>>> Latest cardholder information:\n', info);
    return info;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('setHolderInfo failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

async function main() {
  await getHolderInfo();
  await setHolderInfo();
}

main();
