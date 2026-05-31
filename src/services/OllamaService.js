const { Ollama } = require('ollama');
const log        = require('./LogService');

class OllamaService {
  constructor() {
    this.client      = new Ollama({ host: 'http://localhost:11434' });
    this.model       = 'qwen2.5:14b';
    this.displayName = 'Qwen 2.5 14B';
    this.systemPrompt = `You are a Magic: The Gathering assistant for MTG Arena players.

RULES FOR USING PROVIDED CONTEXT:
- When [MTG Knowledge Base] or [MTG Reference Data] is provided below, treat it as your authoritative source of truth. Use it. Do not override it with your training knowledge.
- If the answer to a rules question is in the provided context, base your response on that content. Do not supplement it with information from your training.
- If you are not certain about a rule or interaction and no context has been provided, say so clearly. Never invent rules, interactions, or card text.
- MTG rules are precise. Vague or approximate answers cause real confusion. Be exact or say you don't know.

FORMATTING:
- Use **bold** for card names.
- Use bullet points for lists, headings for sections, clear paragraph breaks for readability.
- Be concise.`;
  }

  async sendMessage(message, conversationHistory = [], context = null) {
    const systemContent = context ? `${this.systemPrompt}\n\n${context}` : this.systemPrompt;

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

    const preview = message.length > 60 ? message.slice(0, 60) + '…' : message;
    log.info('Ollama', `→ Sending | model: ${this.model} | history: ${conversationHistory.length} msg(s) | context: ${context ? context.length + ' chars' : 'none'} | "${preview}"`);

    const start = Date.now();
    let response;
    try {
      response = await this.client.chat({ model: this.model, messages });
    } catch (e) {
      log.error('Ollama', `Chat error: ${e.message}`);
      throw e;
    }

    const text = response.message.content;
    log.info('Ollama', `← Received | ${text.length} chars | ${Date.now() - start}ms`);
    return text;
  }
}

module.exports = OllamaService;