/**
 * asyncHandler - A utility function to handle async errors in Express routes.
 *
 * This function wraps an async route handler and ensures that any
 * rejected Promise (i.e., thrown error) is automatically caught
 * and passed to the Express `next()` function.
 *
 * Usage:
 * router.get("/example", asyncHandler(async (req, res) => {
 *    // Your async code here...
 * }));
 *
 * This prevents the need for explicit try-catch blocks in every route.
 */

function asyncHandler(requestHandler) {
  return function (req, res, next) {
    Promise.resolve(requestHandler(req, res, next)).catch(function (err) {
      next(err); // Passes the error to Express error handling middleware
    });
  };
}

export { asyncHandler };
