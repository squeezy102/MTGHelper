import ChatViewController from './ChatViewController.js';
import LookupViewController from './LookupViewController.js';
import DeckBuilderViewController from './DeckBuilderViewController.js';

class AppViewController {
  constructor() {
    this.appShell = document.getElementById('appShell');
    this.navTabs = document.getElementById('navTabs');
    this.poppedOutTabs = new Set();
    this.feedEnabled = false;

    this._init();
  }

  async _init() {
    const viewAssignment = await window.mtgHelper.getViewAssignment();
    if (viewAssignment) {
      this._initPopoutMode(viewAssignment);
    } else {
      this._initFullMode();
    }
  }

  // ── Full window (all tabs) ───────────────────────────────────────────────

  _initFullMode() {
    this.lookupView = new LookupViewController();
    this.deckBuilderView = new DeckBuilderViewController();
    this.chatView = new ChatViewController(cards => this._onCardsFound(cards));

    this._bindFeedToggle();
    this._bindTabClicks();
    this._bindPopoutButtons();
    this._listenForTabReturned();
    this._listenForCurrentCardsRequest();
  }

  _bindFeedToggle() {
    const toggle = document.getElementById('feedToggle');
    if (toggle) {
      toggle.addEventListener('change', () => {
        this.feedEnabled = toggle.checked;
      });
    }
  }

  _bindTabClicks() {
    this.navTabs.querySelectorAll('.nav-tab').forEach(tab => {
      tab.querySelector('.nav-tab-label').addEventListener('click', () => {
        const name = tab.dataset.tab;
        if (!this.poppedOutTabs.has(name)) this._switchTab(name);
      });
    });
  }

  _bindPopoutButtons() {
    this.navTabs.querySelectorAll('.nav-tab-popout').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        this._popoutTab(btn.dataset.tab);
      });
    });
  }

  _switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('nav-tab--active', t.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('tab-panel--active', p.id === `panel-${tabName}`);
    });
  }

  async _popoutTab(tabName) {
    if (this.poppedOutTabs.has(tabName)) return;
    try {
      await window.mtgHelper.popoutTab(tabName);
      this.poppedOutTabs.add(tabName);
      const tab = this.navTabs.querySelector(`[data-tab="${tabName}"]`);
      if (tab) tab.classList.add('nav-tab--popped-out');
      const activePanel = document.querySelector('.tab-panel--active');
      if (activePanel?.id === `panel-${tabName}`) {
        const next = ['assistant', 'lookup', 'deckbuilder'].find(t => !this.poppedOutTabs.has(t));
        if (next) this._switchTab(next);
      }
    } catch {
      // pop-out creation failed silently
    }
  }

  _listenForTabReturned() {
    window.mtgHelper.onTabReturned(tabName => {
      this.poppedOutTabs.delete(tabName);
      const tab = this.navTabs.querySelector(`[data-tab="${tabName}"]`);
      if (tab) tab.classList.remove('nav-tab--popped-out');
    });
  }

  _listenForCurrentCardsRequest() {
    window.mtgHelper.onSendCurrentCards(() => {
      const cards = this.lookupView?.cardPanel?.cards || [];
      const activeCardId = this.lookupView?.cardPanel?.activeCardId || null;
      if (cards.length > 0) {
        window.mtgHelper.relayCardsToLookup({ cards, activeCardId });
      }
    });
  }

  _onCardsFound(cards) {
    if (!this.feedEnabled) return;
    if (this.poppedOutTabs.has('lookup')) {
      window.mtgHelper.relayCardsToLookup(cards);
    } else {
      this.lookupView.receiveCards(cards);
    }
  }

  // ── Pop-out window (single view) ─────────────────────────────────────────

  _initPopoutMode(viewName) {
    this.appShell.classList.add('app-shell--popout');

    // Clear all panels first, then activate only the assigned one
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('tab-panel--active'));
    const panel = document.getElementById(`panel-${viewName}`);
    if (panel) panel.classList.add('tab-panel--active');

    if (viewName === 'lookup') {
      this.lookupView = new LookupViewController();
      this.lookupView.listenForRelayedCards();
    } else if (viewName === 'deckbuilder') {
      this.deckBuilderView = new DeckBuilderViewController();
    } else if (viewName === 'assistant') {
      this.chatView = new ChatViewController(cards => {
        window.mtgHelper.relayCardsToLookup(cards);
      });
    }
  }
}

export default AppViewController;
