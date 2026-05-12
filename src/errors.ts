export type ApiErrorOptions = {
  status: number;
  code?: number;
  request_id?: string;
  response?: Response;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code?: number;
  readonly request_id?: string;
  readonly response?: Response;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.request_id = options.request_id;
    this.response = options.response;
  }
}
