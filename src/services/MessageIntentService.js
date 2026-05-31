// Stateless message intent analysis service.
// Parses a user message and returns a rich intent object used by
// KnowledgeBaseService and MCPOrchestrator to decide what context to inject.
//
// MTG term lists are hardcoded here as a baseline.
// REQ-011 (ContentManagerService) will eventually source these from
// Scryfall catalogs and MTGJson so they stay current automatically.

// ── MTG Vocabulary Lists ──────────────────────────────────────────────────

const KEYWORD_ABILITIES = new Set([
  'flying', 'reach', 'trample', 'haste', 'deathtouch', 'lifelink',
  'first strike', 'double strike', 'vigilance', 'menace', 'hexproof',
  'indestructible', 'defender', 'ward', 'flash', 'flashback', 'kicker',
  'cycling', 'equip', 'prowess', 'convoke', 'delve', 'emerge', 'escape',
  'foretell', 'disturb', 'cleave', 'training', 'casualty', 'connive',
  'blitz', 'compleated', 'enlist', 'read ahead', 'prototype', 'unearth',
  'adapt', 'amass', 'proliferate', 'mutate', 'companion', 'undying',
  'persist', 'wither', 'infect', 'miracle', 'overload', 'populate',
  'extort', 'evolve', 'bestow', 'monstrosity', 'outlast', 'dash',
  'exploit', 'rebound', 'fabricate', 'crew', 'embalm', 'eternalize',
  'afflict', 'ascend', 'explore', 'enrage', 'seek', 'conjure',
  'perpetually', 'spellbook', 'protection', 'regenerate', 'shroud',
  'phasing', 'flanking', 'banding', 'echo', 'cumulative upkeep',
  'morph', 'megamorph', 'manifest', 'cipher', 'bloodrush', 'detain',
  'unleash', 'tribute', 'inspired', 'surge', 'awaken', 'renown',
  'living weapon', 'battle cry', 'graft',
]);

const MECHANIC_TERMS = new Set([
  'stack', 'priority', 'trigger', 'triggered', 'etb', 'ltb',
  'enters the battlefield', 'leaves the battlefield',
  'sacrifice', 'exile', 'destroy', 'counter', 'bounce', 'mill',
  'scry', 'surveil', 'combat', 'blocking', 'attacking', 'tap', 'untap',
  'upkeep', 'draw step', 'main phase', 'end step', 'cleanup',
  'mulligan', 'summoning sickness', 'replacement effect',
  'activated ability', 'static ability', 'state-based',
  'resolve', 'cast', 'permanent', 'token', 'copy',
  'power', 'toughness', 'loyalty', 'color identity', 'legend rule',
  'legendary rule', 'mana pool', 'floating mana', 'color pie',
  'split second', 'storm', 'cascade', 'suspend', 'fading', 'vanishing',
]);

const CARD_TYPE_TERMS = new Set([
  'creature', 'instant', 'sorcery', 'artifact', 'enchantment',
  'land', 'planeswalker', 'battle', 'saga', 'aura', 'equipment',
  'vehicle', 'kindred', 'tribal', 'double-faced', 'dfc', 'mdfc',
  'modal', 'transform', 'class enchantment',
]);

const FORMAT_TERMS = new Set([
  'standard', 'historic', 'pioneer', 'alchemy', 'timeless', 'brawl',
  'standard brawl', 'draft', 'sealed', 'limited', 'constructed',
  'rotation', 'rotate', 'ban', 'banned', 'restricted', 'restrict',
  'legal', 'illegal', 'bo1', 'bo3', 'best of one', 'best of three',
  'sideboard', 'sideboarding', 'metagame', 'meta',
]);

const ARCHETYPE_TERMS = new Set([
  'aggro', 'control', 'midrange', 'combo', 'ramp', 'tempo',
  'burn', 'mill deck', 'stompy', 'aristocrats', 'token deck',
  'reanimator', 'prison', 'stax', 'voltron', 'superfriends',
  'mana curve', 'mana base', 'land count', 'card advantage',
  'card draw', 'board wipe', 'wrath', 'finisher', 'win condition',
  'threat', 'two-drop', 'three-drop', 'curve out', 'curving',
]);

// ── Intent Patterns ───────────────────────────────────────────────────────

const QUESTION_STARTERS = /^(what|how|why|when|where|can|could|does|do|is|are|will|would|should|which|who)\b/i;

const DEFINITIONAL_PATTERNS = [
  /\bwhat (is|are|was|were)\b/i,
  /\bwhat does .{0,40}(mean|do)\b/i,
  /\bwhat'?s (a |an |the )?\b/i,
  /\bdefine\b/i,
  /\bexplain\b/i,
  /\b(meaning|definition) of\b/i,
  /\bhow does .{0,40}work\b/i,
  /\btell me (about|what)\b/i,
  /\bwhat do you (mean|call)\b/i,
];

const INTERACTION_PATTERNS = [
  /\binteract(ion|s|s with)?\b/i,
  /\bhow does .{0,60}(with|and|vs\.?)\b/i,
  /\bif .{0,60}(then|does|can|will|would)\b/i,
  /\bdoes .{0,40}(trigger|apply|stack|count|work with|affect)\b/i,
  /\bcan (i|my|a|the) .{0,40}(block|attack|use|activate|target|still)\b/i,
  /\bwhat happens (if|when)\b/i,
  /\b(affect|prevent|stop|override|override)\b/i,
  /\bstill (work|apply|trigger|count|deal)\b/i,
  /\bat the same time\b/i,
  /\bboth .{0,30}and\b/i,
  /\bstack(ed|ing)?\b/i,
  /\brespond(ing|s|ed)?\b/i,
  /\bin response\b/i,
];

const ADVICE_PATTERNS = [
  /\bshould i\b/i,
  /\bwould you\b/i,
  /\bwhat would\b/i,
  /\brecommend\b/i,
  /\bbetter (choice|option|pick|card)\b/i,
  /\bwhich (is|would|should|do)\b/i,
  /\bhelp me\b/i,
  /\badvice\b/i,
  /\bsuggestion\b/i,
];

// ── Helpers ───────────────────────────────────────────────────────────────

function matchesAny(lower, patterns) {
  return patterns.some(p => p.test(lower));
}

function findMTGTerms(lower, termSet) {
  return [...termSet].filter(t => lower.includes(t));
}

// ── MessageIntentService ──────────────────────────────────────────────────

class MessageIntentService {
  analyze(message) {
    const lower = message.toLowerCase().trim();

    // ── Syntactic signals ────────────────────────────────────────────────

    const hasQuestionMark   = lower.includes('?');
    const startsAsQuestion  = QUESTION_STARTERS.test(lower);
    const isQuestion        = hasQuestionMark || startsAsQuestion;

    const isDefinitional    = matchesAny(lower, DEFINITIONAL_PATTERNS);
    const isRulesInteraction = matchesAny(lower, INTERACTION_PATTERNS);
    const isSeekingAdvice   = matchesAny(lower, ADVICE_PATTERNS);
    const isConversational  = !isQuestion && !isDefinitional && !isRulesInteraction;

    // ── MTG vocabulary ───────────────────────────────────────────────────

    const mentionedKeywords  = findMTGTerms(lower, KEYWORD_ABILITIES);
    const mentionedMechanics = findMTGTerms(lower, MECHANIC_TERMS);
    const mentionedCardTypes = findMTGTerms(lower, CARD_TYPE_TERMS);
    const mentionedFormats   = findMTGTerms(lower, FORMAT_TERMS);
    const mentionedArchetypes = findMTGTerms(lower, ARCHETYPE_TERMS);

    const hasMTGVocab = mentionedKeywords.length > 0 || mentionedMechanics.length > 0;

    // ── Term context ─────────────────────────────────────────────────────
    // How is the user engaging with MTG terms?

    let termContext = 'conversational';
    if (hasMTGVocab) {
      if (isDefinitional)       termContext = 'definition';
      else if (isRulesInteraction) termContext = 'interaction';
    }

    // ── KB topic routing ─────────────────────────────────────────────────

    // Inject glossary when asking for a definition, OR when asking how keyword
    // abilities interact - you can't reason about deathtouch + indestructible
    // without first knowing what those words mean.
    const injectGlossary = hasMTGVocab && (
      isDefinitional ||
      termContext === 'definition' ||
      (isRulesInteraction && mentionedKeywords.length > 0)
    );

    const injectRules =
      isRulesInteraction ||
      (isQuestion && mentionedMechanics.length > 0) ||
      (isDefinitional && mentionedMechanics.length > 0);

    const injectCardTypes =
      (isQuestion || isRulesInteraction) &&
      (mentionedCardTypes.length > 0 || mentionedMechanics.some(t =>
        ['etb', 'enters the battlefield', 'sacrifice', 'token', 'ltb',
         'leaves the battlefield', 'triggered'].includes(t)
      ));

    const injectFormats =
      mentionedFormats.length > 0 &&
      (isQuestion || isDefinitional || isSeekingAdvice);

    const injectDeckBuilding =
      mentionedArchetypes.length > 0 &&
      (isQuestion || isDefinitional || isSeekingAdvice);

    // ── Scryfall provider flags (backward-compatible) ─────────────────────

    const isRulesQuestion = isRulesInteraction || (isQuestion && (
      mentionedMechanics.length > 0 || mentionedKeywords.length > 0
    ));

    const isPricingQuestion = /\b(price|worth|buy|sell|cheap|expensive|value|cost)\b/i.test(lower);

    const isLegalityQuestion =
      mentionedFormats.length > 0 ||
      /\b(legal|illegal|ban|banned|restrict|format)\b/i.test(lower);

    const isArenaQuestion =
      /\b(arena|mtga|digital|bo1|bo3|alchemy|wildcard)\b/i.test(lower);

    return {
      // Syntactic
      isQuestion,
      isDefinitional,
      isRulesInteraction,
      isSeekingAdvice,
      isConversational,

      // MTG vocabulary found
      mentionedKeywords,
      mentionedMechanics,
      mentionedCardTypes,
      mentionedFormats,
      mentionedArchetypes,
      hasMTGVocab,
      termContext,

      // KB topic routing
      injectGlossary,
      injectRules,
      injectCardTypes,
      injectFormats,
      injectDeckBuilding,

      // Scryfall provider routing (replaces old _detectIntent flags)
      isRulesQuestion,
      isPricingQuestion,
      isLegalityQuestion,
      isArenaQuestion,
    };
  }
}

module.exports = MessageIntentService;
