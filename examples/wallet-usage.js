'use strict';

/**
 * Wallet Usage Example
 * Run: node examples/wallet-usage.js
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

// Get the list of supported blockchain networks for deposits.
async function getDepositChains() {
  try {
    const chains = await client.wallet.getDepositChains();
    console.log('>>>>> Deposit chains:\n', chains);
    return chains;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getDepositChains failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Get available deposit options.
async function getDepositOptions() {
  try {
    const groupBy =  'network'; // 'network' | 'asset'
    const options = await client.wallet.getDepositOptions({ groupBy });
    console.log('>>>>> Deposit options:\n', options);
    return options;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getDepositOptions failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Get the deposit wallet address for the specified blockchain network.
async function getDepositAddress(chainId) {
  try {
    const address = await client.wallet.getDepositAddress({ chainId });
    console.log(`>>>>> Deposit address (chainId=${chainId}):\n`, address);
    return address;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error(`getDepositAddress(${chainId}) failed:`, err.toJSON());
    } else {
      throw err;
    }
  }
}

// Get the user's deposit transaction records.
async function getDepositTransactions(chainId) {
  try {
    const page = 1;
    const limit = 20;
    const transactions = await client.wallet.getDepositTransactions({ chainId, page, limit });
    console.log(`>>>>> Deposit transactions:\n`, transactions);
    return transactions;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error(`getDepositTransactions(${chainId}) failed:`, err.toJSON());
    } else {
      throw err;
    }
  }
}

// Get the user's wallet balance.
async function getWalletBalance() {
  try {
    const balance = await client.wallet.getWalletBalance();
    console.log('>>>>> Wallet balance:\n', balance);
    return balance;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getWalletBalance failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Get the user's wallet transaction records.
async function getWalletTransactions() {
  try {
    const direction = null; // null | 'in' | 'out'
    const page = 1;
    const limit = 20;
    const transactions = await client.wallet.getWalletTransactions({ direction, page, limit });
    console.log(`>>>>> Wallet transactions:\n`, transactions);
    return transactions;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getWalletTransactions failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

async function main() {
  const chains = await getDepositChains();
  const chainId = chains[0]?.chain_id;
  await getDepositOptions();
  await getDepositAddress(chainId);
  await getDepositTransactions(chainId);
  await getWalletBalance();
  await getWalletTransactions();
}

main();
