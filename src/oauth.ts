import { Client } from "./client";
import type { CreateTokenParams, OAuthOptions, TokenResponse } from "./types/oauth";
import type { ApiUserInfo, Community } from "./types/models";

export class OAuth {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly baseUrl?: string;
  private readonly fetchImpl?: typeof fetch;

  constructor(options: OAuthOptions) {
    this.appId = options.appId;
    this.appSecret = options.appSecret;
    this.baseUrl = options.baseUrl;
    this.fetchImpl = options.fetch;
  }

  createToken(params: CreateTokenParams): Promise<TokenResponse> {
    return this.baseClient().request("/v1/oauth/token", {
      method: "POST",
      body: {
        grant_type: params.grantType,
        code: params.code,
        refresh_token: params.refreshToken,
        redirect_uri: params.redirectUri,
      },
    });
  }

  getUser(accessToken: string): Promise<ApiUserInfo> {
    return this.accessClient(accessToken).request("/v1/oauth/users", { method: "GET" });
  }

  getCommunities(accessToken: string): Promise<Community[]> {
    return this.accessClient(accessToken).request("/v1/oauth/communities", { method: "GET" });
  }

  private baseClient(): Client {
    return new Client({
      token: base64(`${this.appId}:${this.appSecret}`),
      auth: "Oauth",
      baseUrl: this.baseUrl,
      fetch: this.fetchImpl,
    });
  }

  private accessClient(accessToken: string): Client {
    return new Client({
      token: accessToken,
      auth: "Access",
      baseUrl: this.baseUrl,
      fetch: this.fetchImpl,
    });
  }
}

function base64(value: string): string {
  if (typeof btoa === "function") {
    return btoa(value);
  }

  return Buffer.from(value).toString("base64");
}
