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
  }

  async handleSend() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.chatInput.value = '';
    this.appendMessage('user', message);
    this.setLoading(true);

    try {
      const { response, cards } = await window.mtgHelper.sendMessage(message, this.conversationHistory);
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
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', `chat-message--${role}`);
    messageDiv.textContent = content;
    this.chatHistory.appendChild(messageDiv);
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }

  setLoading(isLoading) {
    this.sendButton.disabled = isLoading;
    this.sendButton.textContent = isLoading ? '...' : 'Send';
  }
}

export default ChatViewController;
