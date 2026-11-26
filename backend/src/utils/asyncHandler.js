// Evita precisar repetir try/catch em todo controller assíncrono.
// Qualquer erro cai automaticamente no errorHandler.
module.exports = function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
