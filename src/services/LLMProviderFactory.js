const ClaudeService  = require('./ClaudeService');
const GeminiService  = require('./GeminiService');
const OllamaService  = require('./OllamaService');

class LLMProviderFactory {
  static create() {
    const provider = (process.env.LLM_PROVIDER || '').toLowerCase();

    if (provider === 'claude') {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('[LLMProviderFactory] LLM_PROVIDER=claude but ANTHROPIC_API_KEY is not set.');
      }
      console.log('[LLMProviderFactory] Provider: Claude API (claude-haiku-4-5-20251001)');
      return new ClaudeService();
    }

    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('[LLMProviderFactory] LLM_PROVIDER=gemini but GEMINI_API_KEY is not set.');
      }
      console.log('[LLMProviderFactory] Provider: Gemini Flash');
      return new GeminiService();
    }

    if (provider === 'ollama') {
      console.log('[LLMProviderFactory] Provider: Ollama');
      return new OllamaService();
    }

    // Fallback: auto-detect from available keys (no LLM_PROVIDER set)
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('[LLMProviderFactory] Provider: Claude API (auto-detected from ANTHROPIC_API_KEY)');
      return new ClaudeService();
    }
    if (process.env.GEMINI_API_KEY) {
      console.log('[LLMProviderFactory] Provider: Gemini Flash (auto-detected from GEMINI_API_KEY)');
      return new GeminiService();
    }

    console.log('[LLMProviderFactory] Provider: Ollama (fallback - no API keys set)');
    return new OllamaService();
  }
}

module.exports = LLMProviderFactory;
