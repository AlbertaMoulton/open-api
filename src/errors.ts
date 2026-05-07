export type TeamGagaApiErrorOptions = {
  status: number;
  code?: number;
  requestId?: string;
  response?: Response;
};

export class TeamGagaApiError extends Error {
  readonly status: number;
  readonly code?: number;
  readonly requestId?: string;
  readonly response?: Response;

  constructor(message: string, options: TeamGagaApiErrorOptions) {
    super(message);
    this.name = "TeamGagaApiError";
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.response = options.response;
  }
}
