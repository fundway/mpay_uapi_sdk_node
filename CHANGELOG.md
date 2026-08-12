# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-08-01

### Added
- Initial release.
- `MpayUapiClient.wallet` with `getWalletBalance()`, `getWalletTransactions()`, `getDepositChains()`, `getDepositOptions()`, `getDepositAddress()`, `getDepositTransactions()`.
- `MpayUapiClient.holder` with `getHolderInfo()`, `setHolderInfo()`.
- `MpayUapiClient.card` with `getProducts()`, `getStatuses()`, `getCards()`, `getCardInfo()`, `getCardSensitive()`, `getCardTransactions()`, `remarkCard()`, `createCard()`, `rechargeCard()`, `getCardOperationStatus()`.
- Automatic HMAC-SHA256 request signing (API Key + Secret).
- Configurable timeout, retry (with exponential backoff) for idempotent GET requests.
- TypeScript type declarations.
- Generic `request(method, path, opts)` for calling future endpoints without waiting for an SDK update.
