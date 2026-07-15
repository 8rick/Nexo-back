const { GoogleGenerativeAI } = require('@google/generative-ai');

const AI_API_KEY = process.env.AI_API_KEY;

if (!AI_API_KEY) {
  console.error('[FATAL] A variável AI_API_KEY não está definida no arquivo .env');
  console.error('[FATAL] Servidor encerrado. Configure o arquivo .env e reinicie.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(AI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    responseMimeType: 'text/plain',
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});

module.exports = model;
