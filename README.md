## ⚙️ 2. README.md para o Back-end (`nexo-back`)

Crie este arquivo dentro da pasta ou repositório do seu back-end.

```markdown
# Nexo - Back-end 🧠⚙️

Este é o repositório do back-end da aplicação **Nexo**. Ele atua como um servidor seguro, estruturado em camadas, que consome o modelo de linguagem **Llama 3.3 (via Groq Cloud)** de forma rápida e segura, blindando a chave da API do cliente final.

---

## 🛠️ Tecnologias Utilizadas

* **Node.js**: Plataforma de execução JavaScript do lado do servidor.
* **Express.js**: Framework minimalista e rápido para criação de APIs REST.
* **Groq SDK / OpenAI SDK**: Biblioteca utilizada para comunicação direta com os modelos de IA.
* **Cors**: Middleware para controle de acesso HTTP e segurança entre diferentes domínios.
* **Dotenv**: Gerenciamento de variáveis de ambiente sensíveis.

---

## 📐 Arquitetura em Camadas (Layered Architecture)

O projeto foi construído seguindo boas práticas de design de código, dividido em:

```text
nexo-back/
├── src/
│   ├── config/       # Configuração e inicialização do cliente de IA (Groq)
│   ├── services/     # Lógica de Prompt Engineering e comunicação com o modelo de LLM
│   ├── controllers/  # Recebimento de requisições, envio de respostas e controle de fluxo HTTP
│   ├── routes/       # Definição e exposição dos endpoints da API
│   ├── middlewares/  # Tratamento global de erros, logs e validações de segurança
│   └── server.js     # Ponto de entrada do servidor
🔗 API Endpoint
POST /api/analyze
Recebe as informações do candidato e da vaga desejada para processamento.

Corpo da requisição (JSON):

JSON
{
  "resume": "Texto completo do currículo...",
  "jobDescription": "Requisitos e detalhes da vaga..."
}
Resposta de Sucesso (200 OK):

JSON
{
  "pitch": "Pitch personalizado gerado pela IA..."
}
🚀 Como Executar
Prerrequisitos
Node.js instalado (versão 18 ou superior).

Uma chave de API gerada no console da Groq Cloud.

Acesse a pasta do repositório:

Bash
cd nexo-back
Instale as dependências:

Bash
npm install
Crie um arquivo .env na raiz do projeto seguindo o modelo:

Snippet de código
PORT=3001
AI_API_KEY=sua_chave_da_groq_aqui
Execute em modo de desenvolvimento:

Bash
npm run dev
