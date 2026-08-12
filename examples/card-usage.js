'use strict';

/**
 * Basic Usage Example
 * Run: node examples/basic-usage.js
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

// Retrieves the list of available card products.
async function getProducts() {
  try {
    const products = await client.card.getProducts();
    console.log('>>>>> Available card products:\n', products);
    return products;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getProducts failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Retrieves the list of available card statuses.
async function getStatuses() {
  try {
    const statuses = await client.card.getStatuses();
    console.log('>>>>> Available card statuses:\n', statuses);
    return statuses;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getStatuses failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Retrieves the list of cards.
async function getCards() {
  try {
    const cards = await client.card.getCards();
    console.log('>>>>> The list of cards:\n', cards);
    return cards;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getCards failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Retrieves information about a card.
async function getCardInfo() {
  try {
    const cardId = "2078022262790127618";
    const info = await client.card.getCardInfo(cardId);
    console.log('>>>>> Card information:\n', info);
    return info;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getCardInfo failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Retrieves sensitive information for a card.
async function getCardSensitive() {
  try {
    const cardId = "2078022262790127618";
    const info = await client.card.getCardSensitive(cardId);
    console.log('>>>>> Card sensitive information:\n', info);
    return info;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getCardSensitive failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Retrieves the transactions for a card.
async function getCardTransactions() {
  try {
    const cardId = "2078022262790127618";
    const page = 1;
    const limit = 20;
    const transactions = await client.card.getCardTransactions(cardId, page, limit);
    console.log('>>>>> Card transactions:\n', transactions);
    return transactions;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getCardTransactions failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Adds or updates a remark for a card.
async function remarkCard() {
  try {
    const cardId = "2078022262790127618";
    const remark = "Business card";
    const result = await client.card.remarkCard(cardId, remark);
    console.log('>>>>> Remark result:\n', result);
    return result;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('remarkCard failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Retrieves the status of a card operation.
async function getCardOperationStatus() {
  try {
    // const operationId = "a4e1682d-aa75-4aaa-be35-d90543c6da51";
    const operationId = "01ccccb2-63a3-4353-b780-ace9518120d5";
    const result = await client.card.getCardOperationStatus(operationId);
    console.log('>>>>> Operation status query result:\n', result);
    return result;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error('getCardOperationStatus failed: ', err.toJSON());
    } else {
      throw err;
    }
  }
}

// Creates a new card.
async function createCard() {
  let step = 'unknown';
  try {
    // Submit card creation request
    step = 'createCard';
    const productId = "1923750198816256003";
    const createResult = await client.card.createCard(productId);
    console.log('>>>>> Card creation operation result:\n', createResult);

    // Query card creation operation status
    step = 'getCardOperationStatus';
    const operationId = createResult.operation_id;
    const operationStatus = await client.card.getCardOperationStatus(operationId);
    console.log('>>>>> Card creation operation status:\n', operationStatus);

    return operationStatus;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error(`createCard failed at step [${step}]: `, err.toJSON());
    } else {
      throw err;
    }
  }
}

// Recharges a card.
async function rechargeCard() {
  let step = 'unknown';
  try {
    // Submit card recharge request
    step = 'rechargeCard';
    const cardId = "2078021127987625985";
    const amount = 25.0;
    const createResult = await client.card.rechargeCard(cardId, amount);
    console.log('>>>>> Card recharge operation result:\n', createResult);

    // Query card recharge operation status
    step = 'getCardOperationStatus';
    const operationId = createResult.operation_id;
    const operationStatus = await client.card.getCardOperationStatus(operationId);
    console.log('>>>>> Card recharge operation status:\n', operationStatus);

    return operationStatus;
  } catch (err) {
    if (err instanceof MpayUapiError) {
      console.error(`rechargeCard failed at step [${step}]: `, err.toJSON());
    } else {
      throw err;
    }
  }
}

async function main() {
  await getProducts();
  // await getStatuses();
  // await getCards();
  // await getCardInfo();
  // await getCardSensitive();
  // await getCardTransactions();
  // await remarkCard();
  // await getCardOperationStatus();
  // await createCard();
  // await rechargeCard();
}

main();
