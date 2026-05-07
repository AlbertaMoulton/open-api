export type OAuthOptions = {
  appId: string;
  appSecret: string;
  baseUrl?: string;
  fetch?: typeof fetch;
};

export type CreateTokenParams = {
  grantType: "access_token" | "refresh_token";
  code?: string;
  refreshToken?: string;
  redirectUri?: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expire: number;
};
