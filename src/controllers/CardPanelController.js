const MAX_CARDS = 10;

const PHYSICAL_FORMATS = {
  standard:  'Standard',
  pioneer:   'Pioneer',
  modern:    'Modern',
  legacy:    'Legacy',
  vintage:   'Vintage',
  commander: 'Commander',
  pauper:    'Pauper',
};

const ARENA_FORMATS = {
  standard:      'Standard',
  alchemy:       'Alchemy',
  explorer:      'Explorer',
  historic:      'Historic',
  historic_brawl:'Hist. Brawl',
  brawl:         'Brawl',
  timeless:      'Timeless',
};

class CardPanelController {
  constructor(symbolMap = {}) {
    this.cards = [];
    this.activeCardId = null;
    this.symbolMap    = symbolMap;
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
        ${card.manaCost ? `<span class="card-info-mana">${this._renderSymbols(card.manaCost)}</span>` : ''}
      </div>
      <div class="card-type">${this._esc(card.typeLine)}</div>
      ${card.oracleText ? `<div class="card-oracle">${this._renderSymbols(card.oracleText)}</div>` : ''}
      ${pt}
      ${flavor}
      ${artist}
      ${setLine}
    `;
  }

  _renderMetaSection(card) {
    const parts = [
      this._pricingHtml(card.prices),
      this._physicalLegalityHtml(card.legalities),
      this._arenaAvailabilityHtml(card),
      this._arenaLegalityHtml(card),
      this._rulingsHtml(card.rulings),
    ].filter(Boolean);

    this.metaSection.innerHTML = parts.length
      ? parts.join('')
      : '<div class="meta-empty">No additional data.</div>';
  }

  _clearPanels() {
    this.imageSection.innerHTML = `<div class="card-image-missing">No card selected</div>`;
    this.infoSection.innerHTML = '';
    this.metaSection.innerHTML = '';
  }

  _physicalLegalityHtml(legalities) {
    if (!legalities) return '';
    const badges = Object.entries(PHYSICAL_FORMATS)
      .filter(([key]) => legalities[key] && legalities[key] !== 'not_available')
      .map(([key, label]) => `<span class="legality-badge legality--${legalities[key]}">${label}</span>`)
      .join('');
    return badges
      ? `<div class="meta-block"><div class="meta-label">Physical Legality</div><div class="legality-badges">${badges}</div></div>`
      : '';
  }

  _arenaAvailabilityHtml(card) {
    const inArena = card.arenaId !== null;
    const hasArenaData = Object.keys(ARENA_FORMATS).some(
      f => card.legalities?.[f] && card.legalities[f] !== 'not_available'
    );
    if (!inArena && !hasArenaData) return '';

    const symbol   = inArena ? '&#x2713;' : '&#x2717;';
    const cssClass = inArena ? 'arena-available' : 'arena-unavailable';
    const text     = inArena ? 'Available on MTG Arena' : 'Not available on MTG Arena';
    return `<div class="meta-block">
      <div class="meta-label arena-label">
        <img class="arena-logo" src="../resources/images/MTG_Arena_Logo.png" alt="MTG Arena" />
        Availability
      </div>
      <div class="meta-inline"><span class="${cssClass}">${symbol}</span><span>${text}</span></div>
    </div>`;
  }

  _arenaLegalityHtml(card) {
    const badges = Object.entries(ARENA_FORMATS)
      .filter(([key]) => card.legalities?.[key] && card.legalities[key] !== 'not_available')
      .map(([key, label]) => `<span class="legality-badge legality--${card.legalities[key]}">${label}</span>`)
      .join('');
    return badges
      ? `<div class="meta-block">
          <div class="meta-label arena-label">
            <img class="arena-logo" src="../resources/images/MTG_Arena_Logo.png" alt="MTG Arena" />
            Legality
          </div>
          <div class="legality-badges">${badges}</div>
        </div>`
      : '';
  }

  _pricingHtml(prices) {
    if (!prices) return '';
    const rows = [];
    if (prices.usd)      rows.push(`<div class="price-row"><span>Normal</span><span>$${prices.usd}</span></div>`);
    if (prices.usd_foil) rows.push(`<div class="price-row"><span>Foil</span><span>$${prices.usd_foil}</span></div>`);
    const content = rows.length
      ? rows.join('')
      : `<div class="meta-empty">No pricing data available</div>`;
    return `<div class="meta-block"><div class="meta-label">Price (TCGPlayer)</div>${content}</div>`;
  }

  _rulingsHtml(rulings) {
    if (!rulings || rulings.length === 0) return '';
    const items = rulings.map(r => `<li>${this._esc(r)}</li>`).join('');
    return `<div class="meta-block meta-block--full"><div class="meta-label">Rulings</div><ul class="rulings-list">${items}</ul></div>`;
  }

  _renderSymbols(text) {
    if (!text) return '';
    const symbolRegex = /\{[^}]+\}/g;
    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = symbolRegex.exec(text)) !== null) {
      result += this._escNoNewline(text.slice(lastIndex, match.index));
      const symbol = match[0];
      if (this.symbolMap[symbol]) {
        result += `<img class="mana-symbol" src="${this.symbolMap[symbol]}" alt="${symbol}" title="${symbol}" />`;
      } else {
        result += this._escNoNewline(symbol);
      }
      lastIndex = match.index + match[0].length;
    }

    result += this._escNoNewline(text.slice(lastIndex));
    return result.replace(/\n/g, '<br>');
  }

  _escNoNewline(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
