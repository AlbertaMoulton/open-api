export type OAuthOptions = {
  app_id: string;
  app_secret: string;
  base_url?: string;
  fetch?: typeof fetch;
};

export type CreateTokenParams = {
  grant_type: "access_token" | "refresh_token";
  code?: string;
  refresh_token?: string;
  redirect_uri?: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expire: number;
};
