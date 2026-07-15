const { Router } = require('express');
const analyzeController = require('../controllers/analyze.controller');

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Health-check do servidor
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    status:  'online',
    service: 'Nexo Back-end',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   POST /api/analyze
 * @desc    Gera o pitch baseado no currículo e vaga
 */
router.post('/analyze', analyzeController.analyze);

module.exports = router;
