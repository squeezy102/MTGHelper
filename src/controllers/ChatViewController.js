import { marked } from 'marked';

marked.setOptions({ breaks: true });

class ChatViewController {
  constructor(onCardsFound) {
    this.onCardsFound = onCardsFound;
    this.conversationHistory = [];
    this.chatHistory = document.getElementById('chatHistory');
    this.chatInput   = document.getElementById('chatInput');
    this.sendButton  = document.getElementById('sendButton');
    this.llmLabel    = document.getElementById('llmLabel');
    this.llmDisplayName = 'AI';

    this.sendButton.addEventListener('click', () => this.handleSend());
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    this._checkCatalogStatus();
    this._loadLlmLabel();
  }

  async _loadLlmLabel() {
    try {
      const { displayName } = await window.mtgHelper.getLlmInfo();
      this.llmDisplayName = displayName;
      if (this.llmLabel) this.llmLabel.textContent = displayName;
    } catch {
      // non-critical
    }
  }

  async _checkCatalogStatus() {
    try {
      const { status, errorMessage } = await window.mtgHelper.getCatalogStatus();
      if (status === 'failed') {
        this.appendMessage('error', errorMessage);
      }
    } catch {
      // silently ignore - non-critical startup check
    }
  }

  async handleSend() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.chatInput.value = '';
    this.appendMessage('user', message);
    this.setLoading(true);

    try {
      const { response, cards, contextUsed } = await window.mtgHelper.sendMessage(message, this.conversationHistory);
      this.conversationHistory.push({ role: 'user', content: message });
      this.conversationHistory.push({ role: 'assistant', content: response });
      this.appendMessage('assistant', response, contextUsed);

      if (cards && cards.length > 0 && this.onCardsFound) {
        this.onCardsFound(cards);
      }
    } catch (error) {
      this.appendMessage('error', 'Something went wrong. Check the terminal for details.');
    } finally {
      this.setLoading(false);
    }
  }

  appendMessage(role, content, contextUsed = false) {
    const div = document.createElement('div');
    div.classList.add('chat-message', `chat-message--${role}`);

    if (role === 'assistant') {
      div.appendChild(this._buildSourceHeader(contextUsed));
      const body = document.createElement('div');
      body.innerHTML = marked.parse(content);
      div.appendChild(body);
    } else {
      div.textContent = content;
    }

    this.chatHistory.appendChild(div);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }

  _buildSourceHeader(contextUsed) {
    const header = document.createElement('div');
    header.className = 'message-source';

    const llmChip = document.createElement('span');
    llmChip.className = 'source-llm';

    const icon = document.createElement('span');
    icon.className = 'source-llm-icon';
    icon.textContent = this.llmDisplayName[0].toUpperCase();
    llmChip.appendChild(icon);
    llmChip.appendChild(document.createTextNode(this.llmDisplayName));
    header.appendChild(llmChip);

    if (contextUsed) {
      const badge = document.createElement('span');
      badge.className = 'source-mtghelper';
      badge.textContent = '+ MTGHelper';
      header.appendChild(badge);
    }

    return header;
  }

  setLoading(isLoading) {
    this.sendButton.disabled = isLoading;
    this.sendButton.textContent = isLoading ? '...' : 'Send';
  }
}

export default ChatViewController;
