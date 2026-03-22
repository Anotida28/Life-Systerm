export type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export class BackendRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(input: {
    status: number;
    message: string;
    code?: string;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "BackendRequestError";
    this.status = input.status;
    this.code = input.code ?? "BACKEND_REQUEST_ERROR";
    this.fieldErrors = input.fieldErrors;
  }
}

export function getBackendErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof BackendRequestError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
