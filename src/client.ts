import { ApiError } from "./errors";

const DEFAULT_BASE_URL = "https://open.teamgaga.com";

export type AuthScheme = "Bot" | "Oauth" | "Access";

export type QueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type ApiClientOptions = {
  token: string;
  auth: AuthScheme;
  base_url?: string;
  fetch?: typeof fetch;
};

export type ApiClientRequestOptions = {
  method: string;
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

type ApiEnvelope<T> = {
  status: boolean;
  code: number;
  message: string;
  data: T;
  request_id?: string;
};

export class ApiClient {
  private readonly token: string;
  private readonly auth: AuthScheme;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions) {
    this.token = options.token;
    this.auth = options.auth;
    this.baseUrl = options.base_url ?? DEFAULT_BASE_URL;
    this.fetchImpl = options.fetch ?? fetch;
  }

  async request<T>(path: string | URL, options: ApiClientRequestOptions): Promise<T> {
    const url = path instanceof URL ? path : new URL(path, this.baseUrl);
    appendQuery(url, options.query);

    const headers = new Headers(options.headers);
    headers.set("Authorization", `${this.auth} ${this.token}`);

    const init: RequestInit = {
      method: options.method,
      headers,
      signal: options.signal,
    };

    if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      init.body = JSON.stringify(options.body);
    }

    const response = await this.fetchImpl(url, init);
    const envelope = await parseEnvelope<T>(response);

    if (!response.ok) {
      throw new ApiError(envelope.message ?? `TeamGaga API error: ${response.status}`, {
        status: response.status,
        code: envelope.code,
        request_id: envelope.request_id,
        response,
      });
    }

    if (envelope.status !== true) {
      throw new ApiError(envelope.message ?? "TeamGaga API error", {
        status: response.status,
        code: envelope.code,
        request_id: envelope.request_id,
        response,
      });
    }

    return envelope.data as T;
  }
}

function appendQuery(url: URL, query: QueryParams | undefined): void {
  if (!query) return;

  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item === undefined || item === null) continue;
      url.searchParams.append(key, String(item));
    }
  }
}

async function parseEnvelope<T>(response: Response): Promise<Partial<ApiEnvelope<T>>> {
  const text = await response.text();

  try {
    return JSON.parse(text) as Partial<ApiEnvelope<T>>;
  } catch {
    throw new ApiError(`TeamGaga API returned non-JSON response: ${preview(text)}`, {
      status: response.status,
      response,
    });
  }
}

function preview(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > 200 ? `${trimmed.slice(0, 200)}...` : trimmed;
}
