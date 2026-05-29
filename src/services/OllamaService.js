const { Ollama } = require('ollama');

class OllamaService {
  constructor() {
    this.client = new Ollama({ host: 'http://localhost:11434' });
    this.model = 'llama3.1';
  }

  async sendMessage(message, conversationHistory = [], context = null) {
    const base = `You are an expert Magic: The Gathering assistant. You help players look up cards, build decks, understand rules, and discuss strategy and meta. Be concise and accurate. Format all responses in markdown: use **bold** for card names, bullet points for lists, headings for sections, and clear paragraph breaks for readability.`;
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