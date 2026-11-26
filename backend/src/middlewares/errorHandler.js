// Middleware central de tratamento de erros.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[Erro]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erro interno do servidor.',
  });
}

module.exports = errorHandler;
