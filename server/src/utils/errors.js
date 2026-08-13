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

module.exports = { NotFoundError };
