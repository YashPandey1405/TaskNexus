import { ApiResponse } from "../utils/api-response.js";

// The healthCheck function is a simple API controller that checks if 
// the server is running and responds with a success message. 
// It uses the ApiResponse class to structure the response.

const healthCheck = (req, res) => {
  res.status(200).json(new ApiResponse(200, { message: "Server is running" }));
};

// An Sample Example....
// {
//   "statusCode": 200,
//   "data": { "message": "Server is running" },
//   "message": "Success",
//   "success": true
// }


export { healthCheck };
