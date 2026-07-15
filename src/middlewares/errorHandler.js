// Middleware de rota não encontrada (404)
const notFoundHandler = (_req, res) => {
  res.status(404).json({
    error:   'Rota não encontrada.',
    details: 'Verifique o endpoint e o método HTTP utilizado.',
  });
};

// Middleware global de tratamento de erros (500, etc)
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, _req, res, _next) => {
  // Vamos extrair o erro original se veio da OpenAI (Service)
  const originalError = err.originalError || err;

  console.error('[ERROR] Erro capturado pelo middleware global:', originalError.message);

  // Tratamento específico de erros da API da OpenAI
  if (originalError.status === 401) {
    return res.status(500).json({
      error:   'Erro de configuração do servidor.',
      details: 'A chave da API da OpenAI é inválida ou incorreta. Contate o suporte.',
    });
  }

  if (originalError.status === 429) {
    return res.status(429).json({
      error:   'Limite de requisições ou saldo atingido.',
      details: 'A conta da OpenAI pode estar sem saldo ou recebendo muitas requisições simultâneas.',
    });
  }

  // Erro genérico
  return res.status(500).json({
    error:   err.message || 'Erro interno do servidor.',
    details: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
