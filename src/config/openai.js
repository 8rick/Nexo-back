const OpenAI = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('suachaveaqui')) {
  console.error('[FATAL] A variável OPENAI_API_KEY não está configurada corretamente no arquivo .env');
  console.error('[FATAL] Servidor encerrado. Configure o arquivo .env e reinicie.');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

module.exports = openai;
