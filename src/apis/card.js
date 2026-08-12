'use strict';

class CardApi {
  /**
   * Create a Wallet API client.
   *
   * @param {MpayUapiClient} client - The main SDK client used to send API requests.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Retrieves the list of available card products.
   * 
   * @returns {Promise<Object>} A list of available card products.
   * 
   * @example
   * [
   *   {
   *     id: 1,
   *     product_id: '1895024505572143106',
   *     mode_type: 'VIRTUAL_CARD',
   *     card_currency: 'USD'
   *   }
   * ]
   */
  async getProducts() {
    return this.client.request('GET', '/card/products');
  }

  /**
   * Retrieves the list of available card statuses.
   * 
   * @returns {Promise<Object>} A list of available card statuses.
   * 
   * @example
   * [
   *   'ACTIVE',
   *   'PROCESSING',
   *   'BLOCKED',
   *   'CANCELLED',
   *   'RESTRICTED'
   * ]
   */
  async getStatuses() {
    return this.client.request('GET', '/card/statuses');
  }

  /**
   * Retrieves the list of cards.
   * 
   * @param {number} [status] - Filters cards by status. Optional.
   * See `getStatuses()` for the available status values are provided.
   * 
   * @returns {Promise<Object>} A list of cards.
   * 
   * @example
   * [
   *   {
   *     id: 1,
   *     card_color: "#1076e9",
   *     card_id: "2078022262790127618",
   *     product_id: "1895024505572143106",
   *     holder_id: "2074759788348018689",
   *     pan: "4565 3608 **** 0382",
   *     currency: "USD",
   *     balance: 100.0,
   *     card_type: "VIRTUAL_CARD",
   *     card_status: "ACTIVE",
   *     firstname: "James",
   *     lastname: "Brown",
   *     email: "zzzzzz@gmail.com",
   *     user_remark: null,
   *     created_at: "2026-07-08T07:38:01.000Z"
   *   },
   *   {
   *     id: 2,
   *     card_color: "#3458f4",
   *     card_id: "2077967326770032622",
   *     product_id: "1895024505572143106",
   *     holder_id: "2074759788348018689",
   *     pan: "4565 3608 **** 2556",
   *     currency: "USD",
   *     balance: 100.0,
   *     card_type: "VIRTUAL_CARD",
   *     card_status: "ACTIVE",
   *     firstname: "James",
   *     lastname: "Brown",
   *     email: "zzzzzz@gmail.com",
   *     user_remark: null,
   *     created_at: "2026-07-08T09:03:31.000Z"
   *   }
   * ]
   */
  async getCards() {
    return this.client.request('GET', '/card/list');
  }

  /**
   * Retrieves information about a card.
   * 
   * @param {string} cardId - Unique identifier of the card. Required.
   * 
   * @returns {Promise<Object>} Card information excluding sensitive data.
   * 
   * @example
   * {
   *   id: 1,
   *   card_color: "#1076e9",
   *   card_id: "2078022262790127618",
   *   product_id: "1895024505572143106",
   *   holder_id: "2074759788348018689",
   *   pan: "4565 3608 **** 0382",
   *   currency: "USD",
   *   balance: 100.0,
   *   card_type: "VIRTUAL_CARD",
   *   card_status: "ACTIVE",
   *   firstname: "James",
   *   lastname: "Brown",
   *   email: "zzzzzz@gmail.com",
   *   user_remark: null,
   *   created_at: "2026-07-08T07:38:01.000Z"
   * }
   */
  async getCardInfo(cardId) {
    return this.client.request('GET', '/card/info', { query: { card_id: cardId } });
  }

  /**
   * Retrieves sensitive information for a card.
   * 
   * @param {string} cardId - Unique identifier of the card. Required.
   * 
   * @returns {Promise<Object>} Sensitive card information, including the card number, 
   * CVV, expiration date, and other sensitive details.
   * 
   * @example
   * {
   *   pan: "4565360879330382",
   *   pin: null,
   *   cvv: "755",
   *   expire: "07/31"
   * }
   */
  async getCardSensitive(cardId) {
    return this.client.request('GET', '/card/sensitive', { query: { card_id: cardId } });
  }

  /**
   * Retrieves the transactions for a card.
   * 
   * @param {string} cardId - Unique identifier of the card. Required.
   * @param {number} [page=1] - Page number, starting from 1. Optional.
   * @param {number} [limit=20] - Number of records to return per page. Optional.
   * 
   * @returns {Promise<Object>} Sensitive card information, including the card number, 
   * CVV, expiration date, and other sensitive details.
   * 
   * @example
   * {
   *   total: 1,
   *   per_page: 20,
   *   last_page: 1,
   *   current_page: 1,
   *   items: [
   *     {
   *       id: '2078022262869819393',
   *       card_id: '2078022262790127618',
   *       pan: '40963608****0749',
   *       trade_no: 'VORD4274089869DAC90000002',
   *       type: 'CREATE',
   *       status: 'SUCCESS',
   *       trade_amount: '0',
   *       trade_currency: 'USD',
   *       billing_amount: '0',
   *       billing_currency: 'USD',
   *       service_fee: 0,
   *       actual_transaction_amount: 0,
   *       merchant_data: null,
   *       direction: 'in',
   *       timestamp: '2026-07-17 15:41:36',
   *       create_time: '2026-07-17 07:41:29',
   *     }
   *   ]
   * }
   */
  async getCardTransactions(cardId, page, limit) {
    return this.client.request(
      'GET',
      '/card/transactions',
      {
        query: {
          card_id: cardId,
          page,
          limit
        }
      }
    );
  }

  /**
   * Adds or updates a remark for a card.
   * 
   * @param {string} cardId - Unique identifier of the card. Required.
   * @param {string} remark - Remark associated with the card. Required.
   * 
   * @returns {Promise<Object>} The updated card information.
   * 
   * @example
   * {
   *   id: 1,
   *   card_color: "#1076e9",
   *   card_id: "2078022262790127618",
   *   product_id: "1895024505572143106",
   *   holder_id: "2074759788348018689",
   *   pan: "4565 3608 **** 0382",
   *   currency: "USD",
   *   balance: 100.0,
   *   card_type: "VIRTUAL_CARD",
   *   card_status: "ACTIVE",
   *   firstname: "James",
   *   lastname: "Brown",
   *   email: "zzzzzz@gmail.com",
   *   user_remark: "Business card",
   *   created_at: "2026-07-08T07:38:01.000Z"
   * }
   */
  async remarkCard(cardId, remark) {
    return this.client.request(
      'POST',
      '/card/remark',
      {
        body: {
          card_id: cardId,
          remark: remark
        }
      }
    );
  }

  /**
   * Retrieves the status of a card operation.
   * 
   * This API is used to query the result status of operations such as card creation,
   * card top-up, and other card-related actions.
   * 
   * @param {string} operationId - Unique identifier of the operation.
   * This value is returned by the corresponding operation API, such as card creation
   * or card top-up.
   * 
   * @returns {Promise<Object>} The operation result status and related information.
   * 
   * @example
   * {
   *   operation_id: "a4e1682d-aa75-4aaa-be35-d90543c6da51",
   *   operation_type: "create_card",
   *   status: "SUCCESS",
   *   message: "",
   *   card: {
   *     id: 1,
   *     card_color: "#1076e9",
   *     card_id: "2078022262790127618",
   *     product_id: "1895024505572143106",
   *     holder_id: "2074759788348018689",
   *     pan: "4565 3608 **** 0382",
   *     currency: "USD",
   *     balance: 0.0,
   *     card_type: "VIRTUAL_CARD",
   *     card_status: "ACTIVE",
   *     user_remark: null,
   *     firstname: "James",
   *     lastname: "Brown",
   *     email: "zzzzzz@gmail.com",
   *     created_at: "2026-07-08T03:57:07.000Z"
   *   }
   * }
   */
  async getCardOperationStatus(operationId) {
    return this.client.request(
      'GET',
      '/card/operation/status',
      {
        query: {
          operation_id: operationId
        }
      }
    );
  }

  /**
   * Creates a new card.
   * 
   * This API initiates a card creation operation. Upon successful submission,
   * it returns an operation ID and the current operation status.
   * 
   * When the operation status is `PROCESSING`, call the `/v1/card/operation/status` 
   * endpoint with the returned operation ID to query the latest operation result.
   * 
   * @param {string} productId - ID of the card product to create. Required.
   * 
   * @returns {Promise<Object>} The created operation information, including the operation ID
   * and operation status.
   * 
   * @example
   * {
   *   operation_id: "a4e1682d-aa75-4aaa-be35-d90543c6da51",
   *   operation_type: "create_card",
   *   status: "PROCESSING",
   *   message: ""
   * }
   */
  async createCard(productId) {
    return this.client.request(
      'POST',
      '/card/create',
      {
        body: {
          product_id: productId
        }
      }
    );
  }

  /**
   * Recharges a card.
   * 
   * This API initiates a card recharge operation. Upon successful submission,
   * it returns an operation ID and the current operation status.
   * 
   * When the operation status is `PROCESSING`, call the `/v1/card/operation/status` 
   * endpoint with the returned operation ID to query the latest operation result.
   * 
   * @param {string} cardId - Identifier of the card to be recharged. Required.
   * @param {number} amount - Recharge amount. Must be greater than the minimum
   * allowed amount and can contain up to 2 decimal places. Required.
   * 
   * @returns {Promise<Object>} The card recharge operation informationn, including the operation ID
   * and operation status.
   * 
   * @example
   * {
   *   operation_id: "2ae348e6-b5eb-4751-92ed-aa8d7b1de6a2",
   *   operation_type: "recharge_card",
   *   status: "PROCESSING",
   *   message: ""
   * }
   */
  async rechargeCard(cardId, amount) {
    return this.client.request(
      'POST',
      '/card/recharge',
      {
        body: {
          card_id: cardId,
          amount: amount
        }
      }
    );
  }
}

module.exports = CardApi;
