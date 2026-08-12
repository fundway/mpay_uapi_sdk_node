'use strict';

class WalletApi {
  /**
   * Create a Wallet API client.
   *
   * @param {MpayUapiClient} client - The main SDK client used to send API requests.
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Get the user's wallet balance.
   * 
   * @returns {Promise<Object>} The user's current wallet balance.
   * 
   * @example
   * {
   *   "balance": 100,
   *   "avail_balance": 100,
   *   "lock_balance": 0
   * }
   */
  async getWalletBalance() {
    return this.client.request('GET', '/wallet/balance');
  }

  /**
   * Get the user's wallet transaction records.
   * 
   * @param {string} [direction] - Transaction direction. If omitted, transactions in both directions are returned.
   * Supported values:
   * - `in`  : For incoming transactions.
   * - `out` : For outgoing transactions.
   * @param {number} [page=1] - Page number, starting from 1.
   * @param {number} [limit=20] - Number of records to return per page.
   * 
   * @returns {Promise<Object>} A paginated list of wallet transaction records.
   * 
   * @example
   * {
   *   "total": 2,
   *   "per_page": 20,
   *   "last_page": 1,
   *   "current_page": 1,
   *   "items": [
   *     {
   *       "id": 2,
   *       "currency": "USD",
   *       "direction": "out",
   *       "amount": 5,
   *       "balance": 95,
   *       "reason": "Create card",
   *       "created_at": "2026-02-06T01:00:00.000Z"
   *     },
   *     {
   *       "id": 1,
   *       "currency": "USD",
   *       "direction": "in",
   *       "amount": 100,
   *       "balance": 100,
   *       "reason": "Top up the wallet",
   *       "created_at": "2026-02-06T00:00:00.000Z"
   *     }
   *   ]
   * }
   */
  async getWalletTransactions(direction, page, limit) {
    return this.client.request('GET', '/wallet/transactions', { query: { direction, page, limit } });
  }

  /**
   * Get the list of supported blockchain networks for deposits.
   * 
   * @returns {Promise<Object>} Deposit options grouped by the specified type.
   * 
   * @example
   * [
   *   {
   *     "chain_id": 1
   *     "chain_name": "Ethereum"
   *   },
   *   {
   *     "chain_id": 56
   *     "chain_name": "BNB Smart Chain"
   *   },
   *   {
   *     "chain_id": 8453
   *     "chain_name": "Base"
   *   },
   *   {
   *     "chain_id": 728126428
   *     "chain_name": "TRON Mainnet"
   *   }
   * ]
   */
  async getDepositChains() {
    return this.client.request('GET', '/deposit/chains');
  }

  /**
   * Get available deposit options.
   * 
   * @param {string} [groupBy='network'] - Defines how deposit options are grouped. Supported values:
   * - `network` : Group deposit options by blockchain network.
   * - `asset`   : Group deposit options by asset type.
   * 
   * @returns {Promise<Object>}
   * 
   * @example
   * {
   *   "Ethereum": [
   *     {
   *       "chain_id": "1",
   *       "chain_name": "Ethereum",
   *       "chain_icon": "https://static.mpay.cards/icons/deposit/Ethereum.svg",
   *       "token_id": "0xdac17f958d2ee523a2206206994597c13d831ec7",
   *       "token_name": "USDT-ERC20",
   *       "min_deposit_amount": 4.99,
   *       "estimated_arrival_time": "≈ 2 minutes",
   *       "fee": 0,
   *       "token_standard": "ERC20",
   *       "token_symbol": "USDT"
   *     },
   *     {
   *       "chain_id": "1",
   *       "chain_name": "Ethereum",
   *       "chain_icon": "https://static.mpay.cards/icons/deposit/Ethereum.svg",
   *       "token_id": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
   *       "token_name": "USDC-ERC20",
   *       "min_deposit_amount": 4.99,
   *       "estimated_arrival_time": "≈ 2 minutes",
   *       "fee": 0,
   *       "token_standard": "ERC20",
   *       "token_symbol": "USDC"
   *     }
   *   ],
   *   "BNB Smart Chain": [
   *     {
   *       "chain_id": "56",
   *       "chain_name": "BNB Smart Chain",
   *       "chain_icon": "https://static.mpay.cards/icons/deposit/BNB-BSC.svg",
   *       "token_id": "0x55d398326f99059ff775485246999027b3197955",
   *       "token_name": "USDT-BEP20",
   *       "min_deposit_amount": 4.99,
   *       "estimated_arrival_time": "≈ 1 minutes",
   *       "fee": 0.0,
   *       "token_standard": "BEP20",
   *       "token_symbol": "USDT"
   *     },
   *     {
   *       "chain_id": "56",
   *       "chain_name": "BNB Smart Chain",
   *       "chain_icon": "https://static.mpay.cards/icons/deposit/BNB-BSC.svg",
   *       "token_id": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
   *       "token_name": "USDC-BEP20",
   *       "min_deposit_amount": 4.99,
   *       "estimated_arrival_time": "≈ 1 minutes",
   *       "fee": 0.0,
   *       "token_standard": "BEP20",
   *       "token_symbol": "USDC"
   *     }
   *   ],
   *   "Base": [
   *     {
   *       "chain_id": "8453",
   *       "chain_name": "Base",
   *       "chain_icon": "https://static.mpay.cards/icons/deposit/Base.svg",
   *       "token_id": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
   *       "token_name": "USDC-Base",
   *       "min_deposit_amount": 4.99,
   *       "estimated_arrival_time": "≈ 6 minutes",
   *       "fee": 0.0,
   *       "token_standard": "Base",
   *       "token_symbol": "USDC"
   *     }
   *   ],
   *   "TRON Mainnet": [
   *     {
   *       "chain_id": "728126428",
   *       "chain_name": "TRON Mainnet",
   *       "chain_icon": "https://static.mpay.cards/icons/deposit/TRON.svg",
   *       "token_id": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
   *       "token_name": "USDT-TRC20",
   *       "min_deposit_amount": 4.99,
   *       "estimated_arrival_time": "≈ 2 minutes",
   *       "fee": 2.0,
   *       "token_standard": "TRC20",
   *       "token_symbol": "USDT"
   *     }
   *   ]
   * }
   */
  async getDepositOptions(groupBy='network') {
    return this.client.request('GET', '/deposit/options', { query: { group_by: groupBy } });
  }

  /**
   * Get the deposit wallet address for the specified blockchain network.
   * 
   * @param {number} chainId - Blockchain network chain ID.
   * See `getDepositChains()` for the list of supported blockchain networks.
   * 
   * @returns {Promise<Object>} The deposit wallet address for the specified blockchain network.
   * 
   * @example
   * {
   *   "id": 1,
   *   "chain_id": "1",
   *   "chain_name": "Ethereum",
   *   "address": "0xf042e44d784f286e686322670B32670BeE807A68"
   * }
   */
  async getDepositAddress(chainId) {
    return this.client.request('GET', '/deposit/address', { query: { chain_id: chainId } });
  }

  /**
   * Get the user's deposit transaction records.
   * 
   * @param {number} [chainId] - Blockchain network chain ID.
   * See `getDepositChains()` for the list of supported blockchain networks.
   * If omitted, returns records from all networks.
   * @param {number} [page=1] - Page number, starting from 1.
   * @param {number} [limit=20] - Number of records to return per page.
   * 
   * @returns {Promise<Object>} A paginated list of deposit transaction records.
   * 
   * @example
   * {
   *   "total": 2,
   *   "per_page": 20,
   *   "last_page": 1,
   *   "current_page": 1,
   *   "items": [
   *     {
   *       id: 2,
   *       chain_id: 56,
   *       chain_name: 'BNB Smart Chain',
   *       tx_hash: '0xc3fdc7e4ccd0b71150928e726c00ec71c757655f6625c2eed5dc49f96a3d4ebb',
   *       block_number: 79449837,
   *       block_timestamp: 1770297983,
   *       from_address: '0xFB113fec9677961c272E44766484625192070ca1',
   *       to_address: '0xbA2f17bCF98eA4e839471BF57d514661E0CB5db1',
   *       token_symbol: 'USDT',
   *       token_name: 'Tether USD',
   *       service_fee: 0,
   *       amount: 67.0,
   *       status: 2,
   *       created_at: '2026-02-05T13:27:06.000Z'
   *     },
   *     {
   *       id: 1,
   *       chain_id: 1,
   *       chain_name: 'Ethereum',
   *       tx_hash: '0x6e816cd9e357a6c4c671a213dfd1a5b99625b9e006d27b5422556e52274526c8',
   *       block_number: 24390498,
   *       block_timestamp: 1770292895,
   *       from_address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
   *       to_address: '0x7109D0424634d39e802e156057b58c2b88d7c8E8',
   *       token_symbol: 'USDT',
   *       token_name: 'Tether USD',
   *       service_fee: 0,
   *       amount: 51.0,
   *       status: 2,
   *       created_at: '2026-02-05T12:05:17.000Z'
   *     }
   *   ]
   * }
   */
  async getDepositTransactions(chainId, page, limit) {
    return this.client.request('GET', '/deposit/transactions', { query: { chain_id: chainId, page, limit } });
  }
}

module.exports = WalletApi;
