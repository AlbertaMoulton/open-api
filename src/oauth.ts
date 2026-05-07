import { ApiClient } from "./client";
import type { CreateTokenParams, OAuthOptions, TokenResponse } from "./types/oauth";
import type { ApiUserInfo, Community } from "./types/models";

export class OAuth {
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly baseUrl?: string;
  private readonly fetchImpl?: typeof fetch;

  constructor(options: OAuthOptions) {
    this.appId = options.app_id;
    this.appSecret = options.app_secret;
    this.baseUrl = options.base_url;
    this.fetchImpl = options.fetch;
  }

  createToken(params: CreateTokenParams): Promise<TokenResponse> {
    return this.baseClient().request("/v1/oauth/token", {
      method: "POST",
      body: {
        grant_type: params.grant_type,
        code: params.code,
        refresh_token: params.refresh_token,
        redirect_uri: params.redirect_uri,
      },
    });
  }

  getUser(accessToken: string): Promise<ApiUserInfo> {
    return this.accessClient(accessToken).request("/v1/oauth/users", { method: "GET" });
  }

  getCommunities(accessToken: string): Promise<Community[]> {
    return this.accessClient(accessToken).request("/v1/oauth/communities", { method: "GET" });
  }

  private baseClient(): ApiClient {
    return new ApiClient({
      token: base64(`${this.appId}:${this.appSecret}`),
      auth: "Oauth",
      base_url: this.baseUrl,
      fetch: this.fetchImpl,
    });
  }

  private accessClient(accessToken: string): ApiClient {
    return new ApiClient({
      token: accessToken,
      auth: "Access",
      base_url: this.baseUrl,
      fetch: this.fetchImpl,
    });
  }
}

function base64(value: string): string {
  return btoa(value);
}
