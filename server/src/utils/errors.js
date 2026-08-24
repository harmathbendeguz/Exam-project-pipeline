// Thrown by services when a lookup by id finds nothing. Kept separate from
// Mongoose's own errors (ValidationError, CastError) so the centralized
// error handler in app.js can tell "you asked for something rules say
// doesn't exist" apart from "the database rejected your input."
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// Thrown when a request is well-formed and the target exists, but a
// business rule blocks it — e.g. activating a stage before the previous
// one is done. Distinct from ValidationError (bad input shape) and
// NotFoundError (nothing there): the resource exists, its current state
// just conflicts with what was asked.
class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

module.exports = { NotFoundError, ConflictError };
