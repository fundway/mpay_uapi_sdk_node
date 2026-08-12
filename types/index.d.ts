export interface MpayUapiClientConfig {
  /** API base URL, e.g. https://uapi.mpay.cards */
  baseUrl: string;
  /** API Key */
  apiKey: string;
  /** API Secret, used only for local signature generation and never sent over the network */
  apiSecret: string;
  /** Timeout for a single request (milliseconds), default: 10000 */
  timeout?: number;
  /** Maximum number of retries for network errors, timeouts, or 5xx responses (GET requests only), default: 0 */
  maxRetries?: number;
  /** Base retry delay (milliseconds), using exponential backoff, default: 300 */
  retryDelay?: number;
  /** Whether to print debug logs, default: false */
  debug?: boolean;
  /** Custom headers to be added to every request */
  headers?: Record<string, string>;
  /** Custom fetch implementation; defaults to the global fetch */
  fetchImpl?: typeof fetch;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface CardInfo {
  id: number;
  user_id: number;
  card_color: string;
  card_id: string;
  product_id: string;
  holder_id: string;
  pan: string;
  currency: string;
  balance: number;
  card_type: string;
  card_status: string;
  user_remark: string | null;
  firstname: string;
  lastname: string;
  email: string;
  created_at: string;
  updated_at: string | null;
}

export interface CreateCardResult {
  requestId: string;
  productId: string;
  status: string;
  step: string;
}

export class MpayUapiError extends Error {
  code?: string | number;
  httpStatus?: number;
  data?: unknown;
  constructor(message: string, options?: { code?: string | number; httpStatus?: number; data?: unknown; cause?: Error });
}

export class MpayUapiClient {
  constructor(config: MpayUapiClientConfig);

  /** Send a custom signed request, allowing calls to future API endpoints */
  request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    opts?: { query?: Record<string, string | number>; body?: Record<string, unknown> }
  ): Promise<ApiResponse<T>>;

  /** Get card list */
  listCards(): Promise<ApiResponse<CardInfo[]>>;

  /** Get card information */
  getCardInfo(cardId: string): Promise<ApiResponse<CardInfo>>;

  /** Create a new card */
  createCard(productId: string): Promise<ApiResponse<CreateCardResult>>;
}

export const SDK_VERSION: string;
