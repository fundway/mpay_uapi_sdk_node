# mpay-uapi-sdk

[![npm version](https://img.shields.io/npm/v/@mpaycards/uapi-sdk.svg)](https://www.npmjs.com/package/@mpaycards/uapi-sdk)
[![license](https://img.shields.io/npm/l/@mpaycards/uapi-sdk.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/@mpaycards/uapi-sdk.svg)](package.json)

Official Node.js SDK for the Mpay Credit Card User API. Automatically performs **HMAC-SHA256** request signing (API Key + Secret), eliminating the need to manually handle authentication details.

- Zero third-party runtime dependencies, built on the native `fetch` available in Node.js 18+
- Built-in timeout control and configurable automatic retries (exponential backoff)
- Includes TypeScript type declarations for IDE autocompletion
- Supports both CommonJS `require` and ESM `import`

## Installation

```bash
npm install @mpaycards/uapi-sdk
# or
yarn add @mpaycards/uapi-sdk
# or
pnpm add @mpaycards/uapi-sdk
```

Requires Node.js >= 18.

## Quick Start

```js
const { MpayUapiClient } = require('@mpaycards/uapi-sdk');

const client = new MpayUapiClient({
  baseUrl: 'https://uapi.mpay.cards',
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});

try {
  const products = await client.card.getProducts();
  console.log('Available card products:\n', products);
  return products;
} catch (err) {
  if (err instanceof MpayUapiError) {
    console.error('getProducts failed: ', err.toJSON());
  } else {
    throw err;
  }
}
```

ESM / TypeScript:

```ts
import { MpayUapiClient } from 'mpay-uapi-sdk';

const client = new MpayUapiClient({
  baseUrl: 'https://uapi.mpay.cards',
  apiKey: process.env.MPAY_UAPI_KEY!,
  apiSecret: process.env.MPAY_UAPI_SECRET!,
});
```

> **Note:** `apiSecret` is used only locally to generate request signatures and is never sent over the network. Treat it like a password—do not bundle it into frontend code or commit it to your Git repository. It is recommended to provide it through environment variables.

## API

### `new MpayUapiClient(config)`

| Parameter | Type | Required | Description |
|---|---|---|---|
| `baseUrl` | `string` | Yes | API base URL, e.g. https://uapi.mpay.cards |
| `apiKey` | `string` | Yes | API Key |
| `apiSecret` | `string` | Yes | API Secret, used only for local signature generation and never sent over the network |
| `timeout` | `number` | No | Timeout for a single request (milliseconds), default: `10000` |
| `maxRetries` | `number` | No | Maximum number of retries for GET requests on network errors, timeouts, or 5xx responses, default: `0` |
| `retryDelay` | `number` | No | Base retry delay (milliseconds), using exponential backoff, default: `300` |
| `retryOn5xx` | `boolean` | No | Whether to retry requests on HTTP 5xx server errors, default: `false` |
| `debug` | `boolean` | No | Print debug logs (excluding secrets), default: `false` |
| `headers` | `object` | No | Custom headers to be added to every request |
| `fetchImpl` | `function` | No | Custom fetch implementation; defaults to the global `fetch` |

### Original Request
#### `client.request(method, path, opts)`

Generic signed request method, allowing you to call newly added API endpoints before the SDK is updated.

```js
const res = await client.request('GET', '/v1/card/info', { query: { card_id: '2078022262790127618' } });
// or
const res = await client.request('POST', '/v1/card/remark', { body: { card_id: '2078022262790127618', remark: 'main card' } });
```
### Wallet

#### `client.wallet.getWalletBalance()`
Get the user's wallet balance.
```js
const res = await client.wallet.getWalletBalance();
// res: WalletBalance
```
#### `client.wallet.getWalletTransactions({ direction, page, limit })`
Get the user's wallet transaction records.
```js
const res = await client.wallet.getWalletTransactions({ direction: 'in', page: 1, limit: 20 });
// res: WalletTransaction[]
```
#### `client.wallet.getDepositChains()`
Get the list of supported blockchain networks for deposits.
```js
const res = await client.wallet.getDepositChains();
// res: SupportedChain[]
```
#### `client.wallet.getDepositOptions({ groupBy })`
Get available deposit options.
```js
const res = await client.wallet.getDepositOptions({ groupBy: 'network' });
// res: DepositOption[]
```
#### `client.wallet.getDepositAddress({ chainId })`
Get the deposit wallet address for the specified blockchain network.
```js
const res = await client.wallet.getDepositAddress({ chainId: 1 });
// res: DepositAddress
```
#### `client.wallet.getDepositTransactions({ chainId, page, limit })`
Get the user's deposit transaction records.
```js
const res = await client.wallet.getDepositTransactions({ chainId: 1, page: 1, limit: 20 });
// res: DepositTransaction[]
```

### Cardholder

#### `client.holder.getHolderInfo()`
Retrieves cardholder information.
```js
const res = await client.holder.getHolderInfo();
// res: HolderInfo
```
#### `client.holder.setHolderInfo({ firstName, lastName })`
Updates the cardholder information.
```js
const res = await client.holder.setHolderInfo({ firstName: 'John', lastName: 'Doe' });
// res: HolderInfo
```

### Card

#### `client.card.getProducts()`
Retrieves the list of available card products.
```js
const res = await client.card.getProducts();
// res: Product[]
```
#### `client.card.getStatuses()`
Retrieves the list of available card statuses.
```js
const res = await client.card.getStatuses();
// res: Status[]
```
#### `client.card.getCards()`
Retrieves the list of cards.
```js
const res = await client.card.getCards();
// res: CardInfo[]
```
#### `client.card.getCardInfo({ cardId })`
Retrieves information about a card.
```js
const res = await client.card.getCardInfo({ cardId: '2078022262790127618' });
// res: CardInfo
```
#### `client.card.getCardSensitive({ cardId })`
Retrieves sensitive information for a card.
```js
const res = await client.card.getCardSensitive({ cardId: '2078022262790127618' });
// res: CardSensitiveInfo
```
#### `client.card.getCardTransactions({ cardId, page, limit })`
Retrieves the transactions for a card.
```js
const res = await client.card.getCardTransactions({ cardId: '2078022262790127618', page: 1, limit: 20 });
// res: CardTransaction[]
```
#### `client.card.remarkCard({ cardId, remark })`
Adds or updates a remark for a card.
```js
const res = await client.card.remarkCard({ cardId: '2078022262790127618', remark: 'Main card' });
// res: CardInfo
```
#### `client.card.createCard({ productId })`
Creates a new card (asynchronous process; returns a processing status).
```js
const res = await client.card.createCard({ productId: '1923750198816256003' });
// res: { operation_id, operation_type, status, message }
```
#### `client.card.rechargeCard({ cardId, amount })`
Recharges a card (asynchronous process; returns a processing status).
```js
const res = await client.card.rechargeCard({ cardId: '2078022262790127618', amount: 25.0 });
// res: { operation_id, operation_type, status, message }
```
#### `client.card.getCardOperationStatus({ operationId })`
Retrieves the status of a card operation (e.g. create or recharge).
```js
const res = await client.card.getCardOperationStatus({ operationId: 'operation_id' });
// res: { operation_id, operation_type, status, message, card: { ... } }
```

## Error Handling

All failed requests throw a `MpayUapiError`:

```js
const { MpayUapiClient, MpayUapiError } = require('mpay-uapi-sdk');

try {
  await client.card.getCardInfo({ cardId: 'not-exist' });
} catch (err) {
  if (err instanceof MpayUapiError) {
    console.error(err.message);     // Error message
    console.error(err.code);        // Business error code / 'NETWORK_ERROR' / 'TIMEOUT'
    console.error(err.httpStatus);  // HTTP status code
    console.error(err.data);        // The `data` field returned by the API (if any)
  }
}
```

## Signature Mechanism

The SDK automatically generates the following headers for every request, which the server uses to verify the request:

| Header | Decription |
|---|---|
| `X-Api-Key` | Your API Key |
| `X-Timestamp` | Request timestamp in milliseconds |
| `X-Nonce` | A one-time random string used to prevent replay attacks |
| `X-Signature` | Hex-encoded `HMAC_SHA256(apiSecret, stringToSign)` |

Where:

```
stringToSign = METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + NONCE + "\n" + PAYLOAD
```

- For GET requests, `PAYLOAD` is the query string (`k=v&k=v`) with parameters sorted by name.
- For POST requests, `PAYLOAD` is the JSON body string with keys sorted alphabetically.

The server typically allows a timestamp skew of ±5 minutes. Ensure that the system clock of the server running the SDK is accurate (NTP time synchronization is recommended).

## Retry Strategy

`maxRetries` applies only to **GET (idempotent)** requests and uses exponential backoff under the following conditions:

- Network errors (such as connection failures)
- Request timeouts
- Server returns a 5xx response

Non-idempotent requests such as POST/PUT/DELETE are **not** retried automatically to avoid creating or modifying resources multiple times.

## Example

For complete runnable examples, see the following files:

- [`examples/wallet-usage.js`](./examples/wallet-usage.js)
- [`examples/holder-usage.js`](./examples/holder-usage.js)
- [`examples/card-usage.js`](./examples/card-usage.js)

## License

[MIT](./LICENSE)
