import CardPanelController from './controllers/CardPanelController.js';
import ChatViewController from './controllers/ChatViewController.js';

window.addEventListener('DOMContentLoaded', () => {
  const cardPanelController = new CardPanelController();
  new ChatViewController(cardPanelController);
});
