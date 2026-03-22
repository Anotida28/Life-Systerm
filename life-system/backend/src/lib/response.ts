export type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: ApiErrorBody | null;
};

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
  };
}

export function errorResponse(code: string, message: string, fieldErrors?: Record<string, string[]>) {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      fieldErrors,
    },
  };
}
