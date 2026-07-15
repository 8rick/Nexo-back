'use strict';

// ============================================================
//  Nexo Back-end — Servidor de Análise Inteligente de Vagas
//  Stack: Express.js + Google Generative AI (Gemini)
// ============================================================

// ── 1. Carrega variáveis de ambiente ANTES de qualquer import ──
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── 2. Validação da chave de API na inicialização ─────────────
const AI_API_KEY = process.env.AI_API_KEY;

if (!AI_API_KEY) {
  console.error('[FATAL] A variável AI_API_KEY não está definida no arquivo .env');
  console.error('[FATAL] Servidor encerrado. Configure o arquivo .env e reinicie.');
  process.exit(1);
}

// ── 3. Inicialização do cliente Gemini ─────────────────────────
const genAI = new GoogleGenerativeAI(AI_API_KEY);
const model  = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',          // modelo rápido e com boa qualidade
  generationConfig: {
    responseMimeType: 'text/plain',   // receberemos texto puro da IA
    temperature: 0.7,                 // balanceia criatividade e coerência
    maxOutputTokens: 2048,
  },
});

// ── 4. Configuração do Express ─────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

// ── 5. Middlewares ─────────────────────────────────────────────

// CORS: permite que o front-end React (Vite) se comunique com este servidor
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server padrão
    'http://localhost:3000', // alternativa comum React CRA
  ],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Parsing de JSON no body das requisições
app.use(express.json({ limit: '10mb' })); // limite generoso para currículos longos

// ── 6. Rota de Health-Check ─────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status:  'online',
    service: 'Nexo Back-end',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 7. Rota Principal: POST /api/analyze ───────────────────────
/**
 * @route   POST /api/analyze
 * @desc    Recebe currículo + descrição da vaga e retorna um
 *          pitch profissional gerado pelo Gemini.
 * @access  Público (restrito por CORS ao front-end)
 *
 * Body esperado:
 *   { resume: string, jobDescription: string }
 *
 * Resposta de sucesso (200):
 *   { pitch: string }
 *
 * Respostas de erro:
 *   400 – campos faltando | 500 – falha na API de IA
 */
app.post('/api/analyze', async (req, res) => {
  const { resume, jobDescription } = req.body;

  // ── 7a. Validação dos campos obrigatórios ─────────────────────
  if (!resume || !jobDescription) {
    const missing = [];
    if (!resume)         missing.push('"resume"');
    if (!jobDescription) missing.push('"jobDescription"');

    return res.status(400).json({
      error:   'Campos obrigatórios ausentes.',
      details: `Os seguintes campos são obrigatórios e não foram enviados: ${missing.join(', ')}.`,
    });
  }

  // ── 7b. Validação básica de conteúdo (evitar strings vazias) ──
  if (resume.trim().length < 20) {
    return res.status(400).json({
      error:   'Currículo inválido.',
      details: 'O campo "resume" deve conter pelo menos 20 caracteres.',
    });
  }
  if (jobDescription.trim().length < 20) {
    return res.status(400).json({
      error:   'Descrição da vaga inválida.',
      details: 'O campo "jobDescription" deve conter pelo menos 20 caracteres.',
    });
  }

  // ── 7c. Construção do Prompt ──────────────────────────────────
  const prompt = `
Você é um especialista em recrutamento e seleção (Tech Recruiter). 
Com base no currículo fornecido abaixo e na descrição da vaga desejada, gere um "Pitch Profissional" de alta conversão para o candidato usar na entrevista ou na candidatura.

CURRÍCULO DO CANDIDATO:
${resume.trim()}

DESCRIÇÃO DA VAGA:
${jobDescription.trim()}

Regras de resposta:
1. Seja extremamente profissional, focado e persuasivo.
2. Destaque os pontos do currículo que dão match perfeito com os requisitos da vaga.
3. Divida a resposta em três seções rápidas: "Apresentação de Impacto", "Pontos de Conexão Forte" e "Por que sou a melhor escolha".
4. Responda em português de forma direta, sem enrolações.
`.trim();

  // ── 7d. Chamada à API Gemini com tratamento de erros ─────────
  try {
    console.log('[INFO] Iniciando geração de pitch com Gemini...');
    const startTime = Date.now();

    const result   = await model.generateContent(prompt);
    const response = await result.response;
    const pitch    = response.text();

    const elapsed = Date.now() - startTime;
    console.log(`[INFO] Pitch gerado com sucesso em ${elapsed}ms.`);

    // ── 7e. Retorna o pitch ao front-end ─────────────────────────
    return res.status(200).json({ pitch });

  } catch (error) {
    // ── 7f. Tratamento granular de erros da API ───────────────────
    console.error('[ERROR] Falha ao chamar a API do Gemini:', error.message);

    // Erro de autenticação (chave inválida ou expirada)
    if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
      return res.status(500).json({
        error:   'Erro de configuração do servidor.',
        details: 'A chave da API de IA é inválida. Contate o suporte.',
      });
    }

    // Erro de cota esgotada
    if (error.status === 429) {
      return res.status(429).json({
        error:   'Limite de requisições atingido.',
        details: 'Muitas requisições simultâneas. Tente novamente em alguns segundos.',
      });
    }

    // Erro genérico / inesperado
    return res.status(500).json({
      error:   'Serviço de IA temporariamente indisponível.',
      details: 'Não foi possível gerar o pitch no momento. Tente novamente mais tarde.',
    });
  }
});

// ── 8. Middleware de Rota Não Encontrada (404) ─────────────────
app.use((_req, res) => {
  res.status(404).json({
    error:   'Rota não encontrada.',
    details: 'Verifique o endpoint e o método HTTP utilizado.',
  });
});

// ── 9. Middleware Global de Erros (500) ───────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR] Erro não tratado:', err.stack);
  res.status(500).json({
    error:   'Erro interno do servidor.',
    details: 'Ocorreu um erro inesperado. Tente novamente.',
  });
});

// ── 10. Inicialização do Servidor ─────────────────────────────
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 Nexo Back-end iniciado com sucesso!');
  console.log(`  📡 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`  🔍 Health-check:        http://localhost:${PORT}/api/health`);
  console.log(`  🤖 API Gemini:          ${AI_API_KEY.slice(0, 8)}...`);
  console.log('═══════════════════════════════════════════');
});

module.exports = app; // exporta para testes
