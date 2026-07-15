'use strict';

// ============================================================
//  Nexo Back-end — Servidor de Análise Inteligente de Vagas
//  Stack: Express.js + Google Generative AI (Gemini)
//  Arquitetura: MVC / Camadas
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Importação das rotas e middlewares
const analyzeRoutes = require('./src/routes/analyze.routes');
const { notFoundHandler, globalErrorHandler } = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares Globais ───────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ── Rotas ─────────────────────────────────────────────────────
app.use('/api', analyzeRoutes);

// ── Tratamento de Erros ───────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ── Inicialização ─────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log('  🚀 Nexo Back-end iniciado com sucesso!');
    console.log(`  📡 Servidor rodando em: http://localhost:${PORT}`);
    console.log(`  🔍 Health-check:        http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════');
  });
}

module.exports = app;
