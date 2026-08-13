// Express doesn't catch rejected promises from async route handlers on its
// own — an unhandled rejection would just hang the request. Wrapping every
// controller in this forwards any thrown/rejected error to next(), which
// routes it into the centralized error-handling middleware in app.js.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
