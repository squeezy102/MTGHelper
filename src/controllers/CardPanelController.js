const MAX_CARDS = 10;
const DISPLAYED_FORMATS = [
  'standard', 'pioneer', 'modern', 'legacy', 'vintage',
  'commander', 'pauper', 'historic', 'alchemy', 'explorer', 'brawl'
];

class CardPanelController {
  constructor() {
    this.cards = [];
    this.activeCardId = null;
    this.tabsBar      = document.getElementById('cardTabsBar');
    this.imageSection = document.getElementById('cardImageSection');
    this.infoSection  = document.getElementById('cardInfoSection');
    this.metaSection  = document.getElementById('cardMetaSection');
  }

  addCards(newCards) {
    for (const card of newCards) {
      if (this.cards.find(c => c.id === card.id)) continue;
      if (this.cards.length >= MAX_CARDS) this.cards.shift();
      this.cards.push(card);
    }

    if (!this.activeCardId && this.cards.length > 0) {
      // No card selected yet - select the first one in the list
      this.selectCard(this.cards[0].id);
    } else {
      // A card is already selected - just refresh the tab bar
      this._renderTabs();
    }
  }

  selectCard(cardId) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return;

    this.activeCardId = cardId;
    this._renderTabs();
    this._renderImageSection(card);
    this._renderInfoSection(card);
    this._renderMetaSection(card);
  }

  dismissCard(cardId) {
    const idx = this.cards.findIndex(c => c.id === cardId);
    this.cards.splice(idx, 1);

    if (this.activeCardId === cardId) {
      // Select the card that was adjacent - prefer the one after, fall back to before
      const next = this.cards[idx] || this.cards[idx - 1] || null;
      this.activeCardId = next ? next.id : null;
    }

    this._renderTabs();

    if (this.activeCardId) {
      this.selectCard(this.activeCardId);
    } else {
      this._clearPanels();
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _renderTabs() {
    this.tabsBar.innerHTML = '';

    if (this.cards.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card-tabs-empty';
      empty.textContent = 'No cards loaded';
      this.tabsBar.appendChild(empty);
      return;
    }

    for (const card of this.cards) {
      const tab = document.createElement('div');
      tab.className = 'card-tab' + (card.id === this.activeCardId ? ' card-tab--active' : '');
      tab.dataset.cardId = card.id;

      const label = document.createElement('span');
      label.className = 'card-tab-label';
      label.textContent = card.name;
      label.title = card.name;
      label.addEventListener('click', () => this.selectCard(card.id));

      const dismiss = document.createElement('button');
      dismiss.className = 'card-tab-dismiss';
      dismiss.innerHTML = '&#x2715;';
      dismiss.setAttribute('aria-label', `Dismiss ${card.name}`);
      dismiss.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismissCard(card.id);
      });

      tab.appendChild(label);
      tab.appendChild(dismiss);
      this.tabsBar.appendChild(tab);
    }
  }

  _renderImageSection(card) {
    this.imageSection.innerHTML = card.imageUri
      ? `<img class="card-image" src="${card.imageUri}" alt="${this._esc(card.name)}" />`
      : `<div class="card-image-missing">No image available</div>`;
  }

  _renderInfoSection(card) {
    const pt = card.power ? `<span class="card-pt">${card.power}/${card.toughness}</span>` : '';
    const flavor = card.flavorText
      ? `<div class="card-flavor">${this._esc(card.flavorText)}</div>`
      : '';
    const artist = card.artist
      ? `<div class="card-artist">Illus. ${this._esc(card.artist)}</div>`
      : '';
    const setLine = card.setName
      ? `<div class="card-set">${this._esc(card.setName)}${card.collectorNumber ? ` #${card.collectorNumber}` : ''}</div>`
      : '';

    this.infoSection.innerHTML = `
      <div class="card-info-header">
        <span class="card-info-name">${this._esc(card.name)}</span>
        ${card.manaCost ? `<span class="card-info-mana">${this._esc(card.manaCost)}</span>` : ''}
      </div>
      <div class="card-type">${this._esc(card.typeLine)}</div>
      ${card.oracleText ? `<div class="card-oracle">${this._esc(card.oracleText)}</div>` : ''}
      ${pt}
      ${flavor}
      ${artist}
      ${setLine}
    `;
  }

  _renderMetaSection(card) {
    const legality = this._legalityHtml(card.legalities);
    const pricing  = this._pricingHtml(card.prices);
    const arena    = this._arenaHtml(card);
    const rulings  = this._rulingsHtml(card.rulings);

    this.metaSection.innerHTML = legality + pricing + arena + rulings || '<div class="meta-empty">No additional data.</div>';
  }

  _clearPanels() {
    this.imageSection.innerHTML = `<div class="card-image-missing">No card selected</div>`;
    this.infoSection.innerHTML = '';
    this.metaSection.innerHTML = '';
  }

  _legalityHtml(legalities) {
    if (!legalities) return '';
    const badges = DISPLAYED_FORMATS
      .filter(f => legalities[f] && legalities[f] !== 'not_available')
      .map(f => `<span class="legality-badge legality--${legalities[f]}">${f}</span>`)
      .join('');
    return badges ? `<div class="meta-block"><div class="meta-label">Legality</div><div class="legality-badges">${badges}</div></div>` : '';
  }

  _pricingHtml(prices) {
    if (!prices) return '';
    const rows = [];
    if (prices.usd)      rows.push(`<div class="price-row"><span>Normal</span><span>$${prices.usd}</span></div>`);
    if (prices.usd_foil) rows.push(`<div class="price-row"><span>Foil</span><span>$${prices.usd_foil}</span></div>`);
    return rows.length ? `<div class="meta-block"><div class="meta-label">Price (TCGPlayer)</div>${rows.join('')}</div>` : '';
  }

  _arenaHtml(card) {
    const inArena = card.arenaId !== null;
    const arenaLegality = card.legalities?.historic || card.legalities?.alchemy || card.legalities?.standard;
    if (!inArena && !arenaLegality) return '';
    const status = inArena ? 'Available on MTG Arena' : 'Not on MTG Arena';
    return `<div class="meta-block"><div class="meta-label">MTG Arena</div><div class="arena-status">${status}</div></div>`;
  }

  _rulingsHtml(rulings) {
    if (!rulings || rulings.length === 0) return '';
    const items = rulings.map(r => `<li>${this._esc(r)}</li>`).join('');
    return `<div class="meta-block"><div class="meta-label">Rulings</div><ul class="rulings-list">${items}</ul></div>`;
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
