const Anthropic = require('@anthropic-ai/sdk');
const log       = require('./LogService');

function buildSystemPrompt(modelDisplayName) {
  return `You are a Magic: The Gathering assistant for MTG Arena players.

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

class ClaudeService {
  constructor() {
    this.client       = new Anthropic();
    this.model        = 'claude-haiku-4-5-20251001';
    this.displayName  = 'Claude Haiku';
    this.systemPrompt = buildSystemPrompt(this.displayName);
  }

  async sendMessage(message, conversationHistory = [], context = null) {
    const systemContent = context ? `${this.systemPrompt}\n\n${context}` : this.systemPrompt;
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const preview = message.length > 60 ? message.slice(0, 60) + '…' : message;
    log.info('Claude', `→ Sending | model: ${this.model} | history: ${conversationHistory.length} msg(s) | context: ${context ? context.length + ' chars' : 'none'} | "${preview}"`);

    const start = Date.now();
    let response;
    try {
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        system: systemContent,
        messages
      });
    } catch (e) {
      log.error('Claude', `API error: ${e.message}`);
      throw e;
    }

    const text = response.content[0].text;
    log.info('Claude', `← Received | ${text.length} chars | ${Date.now() - start}ms`);
    return text;
  }
}

module.exports = ClaudeService;
