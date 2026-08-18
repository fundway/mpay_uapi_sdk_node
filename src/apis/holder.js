'use strict';

const BaseApi = require('./base.js');

class HolderApi extends BaseApi {
  /**
   * Create a Wallet API client.
   *
   * @param {MpayUapiClient} client - The main SDK client used to send API requests.
   */
  constructor(client) {
    super(client, 'v1');
  }

  /**
   * Retrieves cardholder information.
   * 
   * @returns {Promise<Object>} The cardholder information.
   * 
   * @example
   * {
   *   "id": 1,
   *   "email": "zzzzzz@gmail.com",
   *   "first_name": "James",
   *   "last_name": "Brown",
   *   "birth_date": "1990-09-05",
   *   "country_code": "US",
   *   "phone_number": "3013504496",
   *   "delivery_address": {
   *     "country": "US",
   *     "state": "AL",
   *     "city": "West Conor",
   *     "street": "333 Vada Estate",
   *     "zip": "Suite 992",
   *     "postalCode": "40758",
   *     "district": "West Conor"
   *   },
   *   "proof_file": null
   * }
   */
  async getHolderInfo() {
    return this.client.request('GET', this.resolveUri('/holder/info'));
  }

  /**
   * Updates the cardholder information.
   * 
   * @param {string} firstName - Cardholder's first name. Required.
   * @param {string} lastName - Cardholder's last name. Required.
   * 
   * @returns {Promise<Object>} The latest cardholder information.
   * 
   * @example
   * {
   *   "id": 1,
   *   "email": "zzzzzz@gmail.com",
   *   "first_name": "James",
   *   "last_name": "Brown",
   *   "birth_date": "1990-09-05",
   *   "country_code": "US",
   *   "phone_number": "3013504496",
   *   "delivery_address": {
   *     "country": "US",
   *     "state": "AL",
   *     "city": "West Conor",
   *     "street": "333 Vada Estate",
   *     "zip": "Suite 992",
   *     "postalCode": "40758",
   *     "district": "West Conor"
   *   },
   *   "proof_file": null
   * }
   */
  async setHolderInfo({ firstName, lastName } = {}) {
    return this.client.request(
      'POST',
      this.resolveUri('/holder/set'),
      {
        body: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    );
  }
}

module.exports = HolderApi;
