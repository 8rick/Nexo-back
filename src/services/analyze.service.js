const openai = require('../config/openai');

class AnalyzeService {
  async generatePitch(resume, jobDescription) {
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

    console.log('[INFO] Iniciando geração de pitch com Groq (Llama 3)...');
    const startTime = Date.now();

    try {
      const response = await openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // 👈 Modelo atualizado da Groq
        messages: [
          {
            role: 'system',
            content: 'Você é um Tech Recruiter experiente.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });

      const pitch = response.choices[0].message.content;

      const elapsed = Date.now() - startTime;
      console.log(`[INFO] Pitch gerado com sucesso em ${elapsed}ms.`);

      return pitch;
    } catch (error) {
      console.error('[ERROR] Falha ao chamar a API da OpenAI:', error.message);
      
      // Vamos lançar o erro para o controller decidir como lidar com ele e formatar o status HTTP
      const err = new Error('Falha na geração do pitch');
      err.originalError = error;
      throw err;
    }
  }
}

module.exports = new AnalyzeService();
