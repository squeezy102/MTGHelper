import CardPanelController from './CardPanelController.js';

class LookupViewController {
  constructor() {
    this.cardPanel = new CardPanelController();
  }

  receiveCards(cards) {
    this.cardPanel.addCards(cards);
  }

  // Called when running in a pop-out window.
  // The main window proactively sends current state via 'cards-from-chat'
  // after the window finishes loading.
  listenForRelayedCards() {
    window.mtgHelper.onCardsFromChat(payload => {
      const cards = Array.isArray(payload) ? payload : payload.cards;
      const activeCardId = payload?.activeCardId || null;

      this.cardPanel.addCards(cards);

      if (activeCardId) {
        this.cardPanel.selectCard(activeCardId);
      }
    });
  }
}

export default LookupViewController;
