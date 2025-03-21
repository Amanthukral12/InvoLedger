class ApiError extends Error {
  statusCode: number;
  message: string;
  errors: string[];
  stack?: string | undefined;
  data: any;
  success: boolean;
  constructor(
    statusCode: number,
    message: string,
    errors: string[],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
