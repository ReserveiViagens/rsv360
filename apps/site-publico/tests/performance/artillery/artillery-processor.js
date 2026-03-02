/**
 * Processor do Artillery
 * Funções auxiliares para os testes
 */

module.exports = {
  // Gerar token de autenticação
  generateToken: function (context, events, done) {
    // Em produção, fazer login real
    context.vars.apiToken = process.env.API_TOKEN || '';
    return done();
  },

  // Validar resposta
  validateResponse: function (requestParams, response, context, events, done) {
    if (response.statusCode !== 200) {
      events.emit('counter', 'errors', 1);
    }
    return done();
  },
};

