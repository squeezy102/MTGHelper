import { marked } from 'marked';

marked.setOptions({ breaks: true });

class ChatViewController {
  constructor(cardPanelController) {
    this.cardPanelController = cardPanelController;
    this.conversationHistory = [];
    this.chatHistory = document.getElementById('chatHistory');
    this.chatInput = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendButton');

    this.sendButton.addEventListener('click', () => this.handleSend());
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    this._checkCatalogStatus();
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
      const result = await window.mtgHelper.sendMessage(message, this.conversationHistory);
      console.log('[Chat] IPC result:', result);
      const { response, cards } = result;
      this.conversationHistory.push({ role: 'user', content: message });
      this.conversationHistory.push({ role: 'assistant', content: response });
      this.appendMessage('assistant', response);

      if (cards && cards.length > 0) {
        this.cardPanelController.addCards(cards);
      }
    } catch (error) {
      this.appendMessage('error', 'Something went wrong. Is Ollama running?');
    } finally {
      this.setLoading(false);
    }
  }

  appendMessage(role, content) {
    const div = document.createElement('div');
    div.classList.add('chat-message', `chat-message--${role}`);

    if (role === 'assistant') {
      div.innerHTML = marked.parse(content);
    } else {
      div.textContent = content;
    }

    this.chatHistory.appendChild(div);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }

  setLoading(isLoading) {
    this.sendButton.disabled = isLoading;
    this.sendButton.textContent = isLoading ? '...' : 'Send';
  }
}

export default ChatViewController;
