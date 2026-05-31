const { Ollama } = require('ollama');

class OllamaService {
  constructor() {
    this.client = new Ollama({ host: 'http://localhost:11434' });
    this.model = 'qwen2.5:14b';
  }

  async sendMessage(message, conversationHistory = [], context = null) {
    const base = `You are a Magic: The Gathering assistant for MTG Arena players.

RULES FOR USING PROVIDED CONTEXT:
- When [MTG Knowledge Base] or [MTG Reference Data] is provided below, treat it as your authoritative source of truth. Use it. Do not override it with your training knowledge.
- If the answer to a rules question is in the provided context, base your response on that content. Do not supplement it with information from your training.
- If you are not certain about a rule or interaction and no context has been provided, say so clearly. Never invent rules, interactions, or card text.
- MTG rules are precise. Vague or approximate answers cause real confusion. Be exact or say you don't know.

FORMATTING:
- Use **bold** for card names.
- Use bullet points for lists, headings for sections, clear paragraph breaks for readability.
- Be concise.`;

    const systemContent = context ? `${base}\n\n${context}` : base;

    const messages = [
      {
        role: 'system',
        content: systemContent
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await this.client.chat({
      model: this.model,
      messages: messages
    });

    return response.message.content;
  }
}

module.exports = OllamaService;