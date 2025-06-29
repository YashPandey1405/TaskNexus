class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode; // HTTP status code
    this.data = data; // Response data (payload)
    this.message = message; // Default success message
    this.success = statusCode < 400; // Success is true for status codes < 400
  }
}

// An Sample Example....
// {
//   "statusCode": 200,
//   "data": { "message": "Server is running" },
//   "message": "Success",
//   "success": true
// }

export { ApiResponse };
