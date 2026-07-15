const analyzeService = require('../services/analyze.service');

class AnalyzeController {
  async analyze(req, res, next) {
    try {
      const { resume, jobDescription } = req.body;

      // ── Validação dos campos obrigatórios ─────────────────────
      if (!resume || !jobDescription) {
        const missing = [];
        if (!resume)         missing.push('"resume"');
        if (!jobDescription) missing.push('"jobDescription"');

        return res.status(400).json({
          error:   'Campos obrigatórios ausentes.',
          details: `Os seguintes campos são obrigatórios e não foram enviados: ${missing.join(', ')}.`,
        });
      }

      // ── Validação básica de conteúdo (evitar strings vazias) ──
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

      // Chama a camada de serviço
      const pitch = await analyzeService.generatePitch(resume, jobDescription);

      // Retorna sucesso
      return res.status(200).json({ pitch });
    } catch (error) {
      // Repassa o erro para o middleware global de tratamento de erros
      next(error);
    }
  }
}

module.exports = new AnalyzeController();
