const { Ollama } = require('ollama');

class OllamaService {
  constructor() {
    this.client = new Ollama({ host: 'http://localhost:11434' });
    this.model = 'llama3.1';
  }

  async sendMessage(message, conversationHistory = [], context = null) {
    const systemContent = context
      ? `You are an expert Magic: The Gathering assistant. You help players look up cards, build decks, understand rules, and discuss strategy and meta. Be concise and accurate.\n\n${context}`
      : `You are an expert Magic: The Gathering assistant. You help players look up cards, build decks, understand rules, and discuss strategy and meta. Be concise and accurate.`;

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