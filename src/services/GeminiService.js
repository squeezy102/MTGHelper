const { GoogleGenerativeAI } = require('@google/generative-ai');
const log = require('./LogService');

const SYSTEM_PROMPT = `You are a Magic: The Gathering assistant for MTG Arena players.

RULES FOR USING PROVIDED CONTEXT:
- When [MTG Knowledge Base] or [MTG Reference Data] is provided below, treat it as your authoritative source of truth. Use it. Do not override it with your training knowledge.
- If the answer to a rules question is in the provided context, base your response on that content. Do not supplement it with information from your training.
- If you are not certain about a rule or interaction and no context has been provided, say so clearly. Never invent rules, interactions, or card text.
- MTG rules are precise. Vague or approximate answers cause real confusion. Be exact or say you don't know.

FORMATTING:
- Use **bold** for card names.
- Use bullet points for lists, headings for sections, clear paragraph breaks for readability.
- Be concise.`;

class GeminiService {
  constructor() {
    this.client      = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.modelName   = 'gemini-2.0-flash';
    this.displayName = 'Gemini Flash';
  }

  async sendMessage(message, conversationHistory = [], context = null) {
    const systemInstruction = context ? `${SYSTEM_PROMPT}\n\n${context}` : SYSTEM_PROMPT;

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
    });

    // Gemini uses 'user'/'model' roles (not 'assistant')
    const history = conversationHistory.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });

    const preview = message.length > 60 ? message.slice(0, 60) + '…' : message;
    log.info('Gemini', `→ Sending | model: ${this.modelName} | history: ${conversationHistory.length} msg(s) | context: ${context ? context.length + ' chars' : 'none'} | "${preview}"`);

    const start = Date.now();
    let result;
    try {
      result = await chat.sendMessage(message);
    } catch (e) {
      log.error('Gemini', `API error: ${e.message}`);
      throw e;
    }

    const text = result.response.text();
    log.info('Gemini', `← Received | ${text.length} chars | ${Date.now() - start}ms`);
    return text;
  }
}

module.exports = GeminiService;
