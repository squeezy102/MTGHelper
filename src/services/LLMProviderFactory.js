const ClaudeService = require('./ClaudeService');
const OllamaService = require('./OllamaService');

class LLMProviderFactory {
  static create() {
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('[LLMProviderFactory] Provider: Claude API (claude-haiku-4-5-20251001)');
      return new ClaudeService();
    }
    console.log('[LLMProviderFactory] Provider: Ollama (no ANTHROPIC_API_KEY set)');
    return new OllamaService();
  }
}

module.exports = LLMProviderFactory;
