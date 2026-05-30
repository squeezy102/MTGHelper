import CardPanelController from './CardPanelController.js';

class LookupViewController {
  constructor() {
    this.cardPanel = new CardPanelController();

    this.input    = document.getElementById('lookupInput');
    this.button   = document.getElementById('lookupButton');
    this.status   = document.getElementById('lookupStatus');

    if (this.input && this.button) {
      this.button.addEventListener('click', () => this._handleSearch());
      this.input.addEventListener('keydown', e => {
        if (e.key === 'Enter') this._handleSearch();
      });
    }
  }

  receiveCards(cards) {
    this.cardPanel.addCards(cards);
  }

  listenForRelayedCards() {
    window.mtgHelper.onCardsFromChat(payload => {
      const cards = Array.isArray(payload) ? payload : payload.cards;
      const activeCardId = payload?.activeCardId || null;
      this.cardPanel.addCards(cards);
      if (activeCardId) this.cardPanel.selectCard(activeCardId);
    });
  }

  async _handleSearch() {
    const query = this.input.value.trim();
    if (!query) return;

    this.input.value = '';
    this._setLoading(true);
    this._setStatus('');

    try {
      const cards = await window.mtgHelper.lookupCards(query);
      if (cards.length === 0) {
        this._setStatus('No cards found.');
      } else {
        this.cardPanel.addCards(cards);
        this._setStatus('');
      }
    } catch {
      this._setStatus('Search failed. Please try again.');
    } finally {
      this._setLoading(false);
    }
  }

  _setLoading(isLoading) {
    if (this.button) {
      this.button.disabled = isLoading;
      this.button.textContent = isLoading ? '...' : 'Search';
    }
    if (this.input) this.input.disabled = isLoading;
  }

  _setStatus(message) {
    if (this.status) this.status.textContent = message;
  }
}

export default LookupViewController;
