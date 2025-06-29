class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
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

// An Sample Example :-
// {
//   "statusCode": 400,
//   "message": "Validation failed",
//   "success": false,
//   "errors": [
//     { "field": "email", "message": "Email is required" },
//     { "field": "password", "message": "Password must be at least 8 characters" }
//   ]
// }

export { ApiError };
