const MAX_CARDS = 10;
const DISPLAYED_FORMATS = [
  'standard', 'pioneer', 'modern', 'legacy', 'vintage',
  'commander', 'pauper', 'historic', 'alchemy', 'explorer', 'brawl'
];

class CardPanelController {
  constructor() {
    this.cards = [];
    this.container = document.getElementById('cardPanel');
  }

  addCards(newCards) {
    for (const card of newCards) {
      if (this.cards.find(c => c.id === card.id)) continue;

      if (this.cards.length >= MAX_CARDS) {
        const evicted = this.cards.shift();
        this._removeElement(evicted.id);
      }

      this.cards.push(card);
      this._renderCard(card);
    }

    this._toggleEmptyState();
  }

  dismissCard(cardId) {
    this.cards = this.cards.filter(c => c.id !== cardId);
    this._removeElement(cardId);
    this._toggleEmptyState();
  }

  _renderCard(card) {
    const el = document.createElement('div');
    el.className = 'card-entry';
    el.dataset.cardId = card.id;

    el.innerHTML = `
      <div class="card-entry-header">
        <span class="card-entry-name">${this._esc(card.name)}</span>
        ${card.manaCost ? `<span class="card-entry-mana">${this._esc(card.manaCost)}</span>` : ''}
        <button class="card-entry-dismiss" aria-label="Dismiss">&#x2715;</button>
      </div>
      ${card.imageUri ? `<img class="card-entry-image" src="${card.imageUri}" alt="${this._esc(card.name)}" />` : ''}
      <div class="card-entry-body">
        <div class="card-entry-type">${this._esc(card.typeLine)}</div>
        ${card.oracleText ? `<div class="card-entry-oracle">${this._esc(card.oracleText)}</div>` : ''}
        ${card.power ? `<div class="card-entry-pt">${card.power}/${card.toughness}</div>` : ''}
        ${this._legalityHtml(card.legalities)}
        ${this._pricingHtml(card.prices)}
        ${this._rulingsHtml(card.rulings)}
      </div>
    `;

    el.querySelector('.card-entry-dismiss').addEventListener('click', () => {
      this.dismissCard(card.id);
    });

    this.container.prepend(el);
  }

  _removeElement(cardId) {
    const el = this.container.querySelector(`[data-card-id="${cardId}"]`);
    if (el) el.remove();
  }

  _toggleEmptyState() {
    const empty = this.container.querySelector('.card-panel-empty');
    if (!empty) return;
    empty.style.display = this.cards.length === 0 ? 'flex' : 'none';
  }

  _legalityHtml(legalities) {
    if (!legalities) return '';
    const badges = DISPLAYED_FORMATS
      .filter(f => legalities[f] && legalities[f] !== 'not_available')
      .map(f => `<span class="legality-badge legality--${legalities[f]}">${f}</span>`)
      .join('');
    return badges ? `<div class="card-entry-legality">${badges}</div>` : '';
  }

  _pricingHtml(prices) {
    if (!prices) return '';
    const parts = [];
    if (prices.usd) parts.push(`$${prices.usd}`);
    if (prices.usd_foil) parts.push(`$${prices.usd_foil} foil`);
    return parts.length ? `<div class="card-entry-price">${parts.join(' &nbsp;|&nbsp; ')}</div>` : '';
  }

  _rulingsHtml(rulings) {
    if (!rulings || rulings.length === 0) return '';
    const items = rulings.map(r => `<li>${this._esc(r)}</li>`).join('');
    return `<div class="card-entry-rulings"><div class="rulings-label">Rulings</div><ul>${items}</ul></div>`;
  }

  _esc(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\n/g, '<br>');
  }
}

export default CardPanelController;
