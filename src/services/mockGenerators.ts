// ============================================================
// Mock Generators — Story-aware simulation engine.
// Parses the user's actual story text to extract names,
// locations, themes, and generates panels/dialogue that
// clearly reflect the story the user wrote.
// ============================================================

import type {
  CharacterVoiceProfile,
  ComicPanel,
  Genre,
  TargetFormat,
  DeliveryStyle,
} from '../types/comic';
import { generateId, getAvatarColor, getFormatPanelCount } from '../types/comic';

// ── Helpers ──
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Story Text Analysis ──
// These functions parse the user's story to extract meaningful content.

/** Extract likely character names from story text (capitalized multi-word phrases, proper nouns) */
function extractNamesFromStory(story: string): string[] {
  const names: string[] = [];

  // Match capitalized words that look like names (2+ chars, not at sentence start after period)
  // Strategy: find capitalized words/phrases, filter out common non-name words
  const commonWords = new Set([
    'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'and', 'but', 'or',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'must',
    'not', 'no', 'yes', 'it', 'its', 'this', 'that', 'these', 'those', 'he', 'she', 'him',
    'her', 'his', 'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your', 'i', 'my',
    'me', 'who', 'whom', 'which', 'what', 'where', 'when', 'why', 'how', 'if', 'then',
    'than', 'so', 'as', 'by', 'from', 'up', 'out', 'off', 'into', 'over', 'after',
    'before', 'between', 'under', 'about', 'through', 'during', 'each', 'every', 'all',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same',
    'also', 'just', 'because', 'very', 'too', 'quite', 'enough', 'almost', 'already',
    'always', 'never', 'often', 'sometimes', 'still', 'now', 'here', 'there',
    // Common story words that aren't names
    'once', 'upon', 'time', 'story', 'one', 'day', 'night', 'morning', 'evening',
    'two', 'three', 'first', 'last', 'new', 'old', 'young', 'big', 'small', 'great',
    'long', 'little', 'much', 'many', 'good', 'bad', 'right', 'left', 'next', 'back',
    'however', 'although', 'while', 'since', 'until', 'unless', 'whether',
    'suddenly', 'finally', 'meanwhile', 'later', 'earlier', 'soon', 'ago',
  ]);

  // Pattern 1: Multi-word proper names like "Detective Rao", "Dr. Smith", "King Arthur"
  const multiWordPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  let match;
  while ((match = multiWordPattern.exec(story)) !== null) {
    const candidate = match[1];
    const words = candidate.split(/\s+/);
    // At least one word shouldn't be a common word
    if (words.some(w => !commonWords.has(w.toLowerCase()))) {
      names.push(candidate);
    }
  }

  // Pattern 2: Single capitalized words that appear multiple times (likely character names)
  const singleWordPattern = /\b([A-Z][a-z]{2,})\b/g;
  const wordCounts: Record<string, number> = {};
  while ((match = singleWordPattern.exec(story)) !== null) {
    const word = match[1];
    if (!commonWords.has(word.toLowerCase())) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }
  // Words appearing 2+ times are likely names
  for (const [word, count] of Object.entries(wordCounts)) {
    if (count >= 2 && !names.some(n => n.includes(word))) {
      names.push(word);
    }
  }

  // Deduplicate
  const unique = [...new Set(names)];
  return unique.slice(0, 6); // Cap at 6
}

/** Extract key sentences/phrases from story to use as scene descriptions */
function extractStoryBeats(story: string, count: number): string[] {
  const sentences = story
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 15 && s.length < 200);

  if (sentences.length === 0) {
    return Array(count).fill(story.slice(0, 100));
  }

  // Spread sentences evenly across the requested count
  const beats: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor((i / count) * sentences.length);
    beats.push(sentences[idx] || sentences[sentences.length - 1]);
  }
  return beats;
}

/** Extract location/setting keywords from the story */
function extractLocations(story: string): string[] {
  const locationWords: string[] = [];
  const locationPatterns = [
    /(?:in|at|near|inside|outside|across|through|around)\s+(?:the\s+)?([a-zA-Z\s]{3,30}?)(?:[.,;!?]|\s+(?:and|but|where|when|while|as))/gi,
    /(?:city|town|village|forest|mountain|river|ocean|sea|lake|castle|palace|house|room|street|alley|park|garden|school|office|bar|café|restaurant|temple|church|cave|desert|island|bridge|tower|ship|station|market|hospital|library|lab|arena|court|hall|kingdom|empire)/gi,
  ];

  for (const pattern of locationPatterns) {
    let match;
    while ((match = pattern.exec(story)) !== null) {
      const loc = (match[1] || match[0]).trim();
      if (loc.length > 2) locationWords.push(loc);
    }
  }
  return [...new Set(locationWords)].slice(0, 8);
}

/** Extract key words and themes from the story for dialogue generation */
function extractThemes(story: string): string[] {
  const themeWords = [
    'love', 'death', 'war', 'peace', 'power', 'freedom', 'revenge', 'justice',
    'betrayal', 'trust', 'family', 'friend', 'enemy', 'secret', 'truth', 'lie',
    'hope', 'fear', 'danger', 'adventure', 'mystery', 'magic', 'fight', 'battle',
    'escape', 'rescue', 'discover', 'destroy', 'protect', 'save', 'steal', 'hunt',
    'kill', 'survive', 'curse', 'treasure', 'quest', 'journey', 'mission', 'plan',
    'money', 'weapon', 'dragon', 'monster', 'ghost', 'alien', 'robot', 'virus',
    'school', 'college', 'exam', 'competition', 'race', 'game', 'match', 'tournament',
  ];
  const storyLower = story.toLowerCase();
  return themeWords.filter(w => storyLower.includes(w));
}


// ── Genre-aware visual settings (enhanced based on story locations) ──
const GENRE_SETTING_TEMPLATES: Record<string, string[]> = {
  noir: [
    '{location}, rain-soaked and dimly lit, neon signs reflecting off wet pavement',
    '{location} at night, shadows stretching across the scene, tension thick in the air',
    'A dark corner of {location}, smoke curling through shafts of pale light',
  ],
  manga: [
    '{location}, cherry blossoms drifting in the wind, dramatic sunset sky',
    '{location}, intensity building, speed lines radiating outward',
    'The entrance to {location}, characters facing each other with fierce determination',
  ],
  cyberpunk: [
    '{location}, neon-drenched and holographic, data streams flickering in the air',
    '{location}, buried deep in the digital underground, screens glowing everywhere',
    'The skyline above {location}, drones and flying vehicles streaking past',
  ],
  'webtoon-romance': [
    '{location}, soft golden-hour light, a moment suspended in time',
    '{location}, fairy lights and warm atmosphere, two figures close together',
    'A quiet corner of {location}, hearts racing, words unspoken',
  ],
  superhero: [
    '{location}, chaos erupting, civilians running, dust and debris in the air',
    '{location} under siege, the hero arriving just in time, dramatic silhouette',
    'The rooftop above {location}, cape billowing, city lights below',
  ],
  fantasy: [
    '{location}, ancient runes glowing, mystical energy crackling in the air',
    '{location}, enchanted and otherworldly, floating crystals and ethereal light',
    'The gates of {location}, a quest beginning, destiny calling',
  ],
  comedy: [
    '{location}, everything going hilariously wrong at the same time',
    '{location}, an awkward silence broken by something ridiculous',
    'The chaos of {location}, slapstick mayhem, exaggerated expressions',
  ],
  horror: [
    '{location}, unnervingly quiet, something lurking just out of sight',
    '{location}, lights flickering, a cold breath on the back of the neck',
    'The depths of {location}, darkness pressing in, no escape visible',
  ],
  'sci-fi': [
    '{location}, advanced technology humming, holographic displays everywhere',
    '{location}, the void of space visible through viewports, stars drifting',
    'The control center of {location}, alarms blaring, a critical moment',
  ],
  'slice-of-life': [
    '{location}, warm morning light streaming through windows, a peaceful moment',
    '{location}, the gentle rhythm of everyday life, laughter in the air',
    'A quiet evening at {location}, reflection and connection',
  ],
  action: [
    '{location}, explosions rocking the ground, adrenaline pumping',
    '{location}, a high-speed chase, obstacles everywhere',
    'The heart of {location}, a final showdown, everything on the line',
  ],
  drama: [
    '{location}, tension thick enough to cut, unspoken words hanging in the air',
    '{location}, two figures facing each other, a difficult conversation ahead',
    'The silence of {location}, a decision that changes everything',
  ],
};

const EMOTIONS: Record<string, string[]> = {
  noir: ['tense, guarded', 'melancholic, resigned', 'suspicious, wary', 'grim determination', 'bitter amusement'],
  manga: ['fierce determination', 'shocked disbelief', 'warm camaraderie', 'burning rivalry', 'bittersweet nostalgia'],
  cyberpunk: ['paranoid, hyper-alert', 'cold detachment', 'desperate hope', 'rebellious fury', 'existential dread'],
  'webtoon-romance': ['flutter of butterflies', 'blushing embarrassment', 'tender longing', 'heartbroken silence', 'joyful surprise'],
  superhero: ['heroic resolve', 'inner conflict', 'righteous anger', 'protective urgency', 'weary but unbroken'],
  fantasy: ['awestruck wonder', 'ancient sorrow', 'fierce loyalty', 'dark temptation', 'triumphant defiance'],
  comedy: ['gleeful chaos', 'deadpan confusion', 'dramatic overreaction', 'awkward cringe', 'infectious laughter'],
  horror: ['creeping dread', 'frozen terror', 'morbid fascination', 'desperate panic', 'unsettling calm'],
  'sci-fi': ['clinical curiosity', 'cosmic awe', 'isolated determination', 'moral weight', 'quiet wonder'],
  'slice-of-life': ['gentle contentment', 'bittersweet reflection', 'quiet anxiety', 'warm connection', 'peaceful acceptance'],
  action: ['adrenaline surge', 'focused intensity', 'defiant courage', 'explosive rage', 'grim satisfaction'],
  drama: ['raw vulnerability', 'simmering tension', 'quiet heartbreak', 'reluctant acceptance', 'fierce protectiveness'],
};

const DELIVERIES: DeliveryStyle[] = [
  'normal', 'shout', 'whisper', 'thought', 'sarcastic', 'muttered', 'cold', 'excited',
];

// ── Personality/Speech Banks (used when building character profiles from names) ──
const PERSONALITY_BANK = [
  'brave, impulsive, fiercely loyal to allies',
  'calculating, patient, always three steps ahead',
  'warm-hearted, anxious, tries to see the good in everyone',
  'cynical, sharp-witted, hides pain behind humor',
  'mysterious, quiet, reveals intentions only when necessary',
  'hot-headed, passionate, acts first and thinks later',
  'wise, calm, carries the weight of experience',
  'cheerful, mischievous, uses humor as a weapon and a shield',
  'stoic, disciplined, haunted by past mistakes',
  'ambitious, charismatic, willing to bend rules to win',
];

const SPEECH_STYLE_BANK = [
  'direct and clipped sentences, says what they mean with no frills',
  'flowery and dramatic, loves metaphors and grand statements',
  'casual and peppered with slang, trails off mid-thought',
  'precise and formal, chooses each word carefully',
  'sarcastic with dry delivery, deadpan humor',
  'rapid-fire and enthusiastic, interrupts themselves with new ideas',
  'quiet and measured, speaks only when something needs to be said',
  'warm and encouraging, uses lots of "we" and "us"',
  'nervous stutter under pressure, eloquent when calm',
  'blunt and confrontational, no patience for small talk',
];

const VOCAB_BANK = [
  'street-smart, practical language',
  'scholarly, archaic phrasing',
  'tech-savvy, modern jargon',
  'poetic, nature metaphors',
  'military/tactical precision',
  'casual, everyday vocabulary',
  'artistic, creative terminology',
  'scientific, analytical phrasing',
];

const EMOTIONAL_TENDENCIES_BANK = [
  'wears heart on sleeve, quick to anger and quick to forgive',
  'suppresses emotion until it erupts explosively',
  'channels feelings into action rather than words',
  'expresses emotion through humor and deflection',
  'deeply empathetic, absorbs others\' pain',
  'cold exterior masking genuine vulnerability',
  'optimistic resilience, bounces back from setbacks fast',
  'brooding intensity, emotions simmer beneath the surface',
];

const PHYSICAL_DESC_BANK = [
  'sharp features, intense gaze, always alert',
  'warm smile, kind eyes, slightly disheveled appearance',
  'tall and imposing, carries themselves with quiet authority',
  'youthful energy, bright eyes, expressive face',
  'weathered look, scars telling silent stories, steady hands',
  'elegant and poised, every movement deliberate and graceful',
  'rough around the edges, strong build, calloused hands',
  'unassuming appearance that hides surprising depth',
];

// ── Dialogue Generation (story-aware) ──
function generateStoryAwareDialogue(
  _story: string,
  characters: CharacterVoiceProfile[],
  panelCharacters: string[],
  emotion: string,
  _panelBeat: string,
  panelNumber: number,
  themes: string[],
): { speaker: string; line: string; delivery: DeliveryStyle }[] {
  const lines: { speaker: string; line: string; delivery: DeliveryStyle }[] = [];

  // Dialogue templates that incorporate story beats
  const contextualDialogueTemplates = [
    // Reactive to the panel beat / story context
    `We need to talk about what happened...`,
    `I didn't expect things to go this way.`,
    `This changes everything. You know that, right?`,
    `I've been thinking about ${themes[0] || 'what comes next'}... and I don't like where it leads.`,
    `You can't just walk away from ${themes[0] || 'this'}. Not now.`,
    `Look, I know about the ${themes[0] || 'situation'}. What I don't know is why you kept it from me.`,
    `If we don't act now, everything we've worked for... gone.`,
    `Tell me the truth. Just this once.`,
    `This is bigger than ${themes[0] || 'us'}. Much bigger.`,
    `I didn't come here to fight. I came here because I need your help.`,
    `Something doesn't add up. Why would they...?`,
    `We're running out of time.`,
    `I've seen what happens when people ignore the signs. I won't make that mistake.`,
    `You think this is about ${themes[0] || 'winning'}? It's about survival.`,
    `I promised I'd keep you safe. I intend to keep that promise.`,
    `Whatever happens next, we face it together.`,
    `The ${themes[0] || 'truth'} has a way of coming out. Always does.`,
    `I know what you're planning. And I can't let you do it.`,
  ];

  // Character-voice-aware dialogue — incorporate their speech style
  for (let ci = 0; ci < panelCharacters.length; ci++) {
    const charName = panelCharacters[ci];
    const character = characters.find(c => c.name === charName);

    let line: string;
    const templateIdx = (panelNumber * 3 + ci * 7 + charName.length) % contextualDialogueTemplates.length;
    line = contextualDialogueTemplates[templateIdx];

    // Adjust line based on speech style if available
    if (character) {
      if (character.speech_style.toLowerCase().includes('formal') || character.speech_style.toLowerCase().includes('precise')) {
        line = line.replace("can't", "cannot").replace("don't", "do not").replace("won't", "will not");
      }
      if (character.speech_style.toLowerCase().includes('casual') || character.speech_style.toLowerCase().includes('slang')) {
        line = line.replace("I have ", "I've ").replace("do not", "don't").replace("cannot", "can't");
        if (Math.random() > 0.5) line = line.replace('.', '...');
      }
      if (character.speech_style.toLowerCase().includes('dramatic') || character.speech_style.toLowerCase().includes('flowery')) {
        line = line + '!';
      }
    }

    // Pick delivery based on emotion
    let delivery: DeliveryStyle = 'normal';
    if (emotion.includes('tense') || emotion.includes('anger') || emotion.includes('rage')) delivery = pick(['cold', 'muttered', 'shout']);
    else if (emotion.includes('fear') || emotion.includes('dread') || emotion.includes('panic')) delivery = pick(['whisper', 'trembling']);
    else if (emotion.includes('joy') || emotion.includes('excited') || emotion.includes('happy')) delivery = pick(['excited', 'normal']);
    else if (emotion.includes('sad') || emotion.includes('heartbreak') || emotion.includes('sorrow')) delivery = pick(['whisper', 'muttered']);
    else if (emotion.includes('sarcas') || emotion.includes('humor') || emotion.includes('cringe')) delivery = pick(['sarcastic', 'normal']);
    else if (emotion.includes('thought') || emotion.includes('reflect') || emotion.includes('wonder')) delivery = pick(['thought', 'whisper']);
    else delivery = pick(DELIVERIES);

    lines.push({ speaker: charName, line, delivery });
  }

  return lines;
}


// ══════════════════════════════════════════════
// PUBLIC MOCK API
// ══════════════════════════════════════════════

export async function mockRefineStory(story: string, genre: Genre): Promise<string> {
  await delay(1200 + Math.random() * 800);

  const genreEnhancements: Record<string, string> = {
    noir: `\n\nThe streets run slick with rain and old grudges. `,
    manga: `\n\nThe stakes have never been higher — a battle that will reshape destinies. `,
    cyberpunk: `\n\nBeneath the neon glow, a rebellion is being compiled in stolen code. `,
    'webtoon-romance': `\n\nTwo paths that were never supposed to cross — until fate rewrote the map. `,
    superhero: `\n\nThe city needs a hero. What it gets is something far more complicated. `,
    fantasy: `\n\nAncient magic stirs in the deep places of the world, answering a call it hasn't heard in millennia. `,
    comedy: `\n\nWhat started as a simple misunderstanding quickly spiraled into the most chaotic day of everyone's lives. `,
    horror: `\n\nSomething watches from the shadows — patient, hungry, and very, very old. `,
    'sci-fi': `\n\nAt the edge of known space, humanity discovers it was never alone — and never truly safe. `,
    'slice-of-life': `\n\nIn the quiet gaps between the big moments, life unfolds in its truest form. `,
    action: `\n\nThe clock is ticking, the odds are impossible, and retreat is not an option. `,
    drama: `\n\nThe truth they've been avoiding is about to demand to be heard. `,
  };

  const enhancement = genreEnhancements[genre] || genreEnhancements.noir;
  const refined = story.trim() + enhancement +
    'The narrative builds through escalating tension, with each scene carefully crafted to ' +
    'deliver maximum visual and emotional impact. Character arcs interweave, creating ' +
    'moments of both intimate connection and explosive confrontation that drive toward ' +
    'a climax that redefines everything the characters thought they knew.';
  return refined;
}


/**
 * Extract characters from the user's story text.
 * Scans for proper nouns / capitalized names and builds profiles around them.
 * Falls back to generic archetypes only if no names are found.
 */
export async function mockExtractCharacters(
  story: string,
  _genre: Genre,
): Promise<CharacterVoiceProfile[]> {
  await delay(1500 + Math.random() * 1000);

  // Step 1: Try to find real names in the story
  let names = extractNamesFromStory(story);

  // Step 2: If no names found, derive names from the story by creating archetypes
  if (names.length === 0) {
    const themes = extractThemes(story);
    // Create 2-3 archetype names based on story themes
    const archetypeNames: string[] = [];
    if (themes.includes('love') || themes.includes('friend')) archetypeNames.push('Protagonist', 'Love Interest');
    else if (themes.includes('fight') || themes.includes('battle') || themes.includes('war')) archetypeNames.push('The Fighter', 'The Rival');
    else if (themes.includes('mystery') || themes.includes('secret') || themes.includes('truth')) archetypeNames.push('The Investigator', 'The Witness');
    else if (themes.includes('magic') || themes.includes('quest') || themes.includes('dragon')) archetypeNames.push('The Mage', 'The Warrior');
    else archetypeNames.push('Protagonist', 'Companion');

    if (themes.includes('enemy') || themes.includes('betrayal') || themes.includes('revenge')) {
      archetypeNames.push('The Antagonist');
    }
    if (archetypeNames.length < 2) archetypeNames.push('Supporting Character');

    names = archetypeNames;
  }

  // Cap at 2-4 based on story length
  const count = Math.min(4, Math.max(2, Math.floor(story.length / 120)));
  names = names.slice(0, count);

  // Step 3: Build full voice profiles for each extracted name
  const characters: CharacterVoiceProfile[] = names.map((name, i) => {
    const relationships: Record<string, string> = {};
    const relTypes = [
      'trusted ally', 'bitter rival', 'reluctant partner', 'old friend',
      'distrustful but drawn to', 'former mentor', 'secret admirer',
      'complicated history with', 'protective of',
    ];
    for (const otherName of names) {
      if (otherName !== name) {
        relationships[otherName] = relTypes[(i + otherName.length) % relTypes.length];
      }
    }

    return {
      id: generateId(),
      name,
      physical_description: PHYSICAL_DESC_BANK[i % PHYSICAL_DESC_BANK.length],
      personality: PERSONALITY_BANK[i % PERSONALITY_BANK.length],
      speech_style: SPEECH_STYLE_BANK[i % SPEECH_STYLE_BANK.length],
      vocabulary_level: VOCAB_BANK[i % VOCAB_BANK.length],
      emotional_tendencies: EMOTIONAL_TENDENCIES_BANK[i % EMOTIONAL_TENDENCIES_BANK.length],
      relationships,
      avatarColor: getAvatarColor(i),
      isAutoGenerated: true,
    };
  });

  return characters;
}


/**
 * Generate panel breakdown from the user's story.
 * Uses the actual story text to create settings, actions, and scene descriptions.
 */
export async function mockGenerateBreakdown(
  story: string,
  characters: CharacterVoiceProfile[],
  genre: Genre,
  format: TargetFormat,
): Promise<ComicPanel[]> {
  const panelCount = getFormatPanelCount(format);
  const genreEmotions = EMOTIONS[genre] || EMOTIONS.noir;
  const charNames = characters.map(c => c.name);
  const locations = extractLocations(story);
  const storyBeats = extractStoryBeats(story, panelCount);
  const settingTemplates = GENRE_SETTING_TEMPLATES[genre] || GENRE_SETTING_TEMPLATES.noir;

  const panels: ComicPanel[] = [];

  for (let i = 0; i < panelCount; i++) {
    await delay(300 + Math.random() * 200);

    // Pick 1-3 characters for this panel
    const numChars = Math.min(charNames.length, Math.max(1, Math.floor(Math.random() * 3) + 1));
    const shuffledChars = [...charNames].sort(() => Math.random() - 0.5);
    const panelChars = shuffledChars.slice(0, numChars);

    // Build setting from story locations + genre templates
    const locationHint = locations.length > 0
      ? locations[i % locations.length]
      : storyBeats[i]?.split(/[.,!?]/)[0]?.trim().slice(0, 40) || 'the scene';
    const settingTemplate = settingTemplates[i % settingTemplates.length];
    const setting = settingTemplate.replace('{location}', capitalize(locationHint));

    // Use story beats for the action
    const beat = storyBeats[i] || storyBeats[storyBeats.length - 1];
    const action = `${panelChars[0]} — ${beat}`;

    const emotion = genreEmotions[i % genreEmotions.length];

    // Narration for first, last, and random panels
    let narration = '';
    if (i === 0) {
      narration = beat.length > 30 ? beat.slice(0, 80) + '...' : beat;
    } else if (i === panelCount - 1) {
      narration = storyBeats[storyBeats.length - 1]?.slice(0, 80) || 'And so the story continues...';
    } else if (Math.random() > 0.6) {
      narration = beat.slice(0, 60) + '...';
    }

    panels.push({
      panel_number: i + 1,
      setting,
      characters_present: panelChars,
      action,
      emotion,
      dialogue: [],
      narration,
      image_prompt: '',
    });
  }

  return panels;
}


/**
 * Generate dialogue for a panel using character voice profiles and the story context.
 */
export async function mockGenerateDialogue(
  panel: ComicPanel,
  characters: CharacterVoiceProfile[],
  genre: Genre,
  story?: string,
): Promise<{ dialogue: { speaker: string; line: string; delivery: DeliveryStyle }[]; narration: string; image_prompt: string }> {
  await delay(400 + Math.random() * 300);

  const themes = extractThemes(story || panel.action);

  const dialogue = generateStoryAwareDialogue(
    story || panel.action,
    characters,
    panel.characters_present,
    panel.emotion,
    panel.action,
    panel.panel_number,
    themes,
  );

  // Build image prompt from actual panel content
  const charDescriptions = panel.characters_present.map(name => {
    const c = characters.find(ch => ch.name === name);
    return c ? `${c.name} (${c.physical_description})` : name;
  }).join(', ');

  const image_prompt = `${genre}-style comic panel, ${panel.setting}, ${charDescriptions}, ` +
    `${panel.action}, ${panel.emotion} mood, cinematic lighting, detailed illustration`;

  return {
    dialogue,
    narration: panel.narration || '',
    image_prompt,
  };
}


export async function mockRegeneratePanel(
  panel: ComicPanel,
  characters: CharacterVoiceProfile[],
  genre: Genre,
  mode: 'scene' | 'dialogue' | 'both',
): Promise<Partial<ComicPanel>> {
  await delay(800 + Math.random() * 600);

  const genreEmotions = EMOTIONS[genre] || EMOTIONS.noir;
  const settingTemplates = GENRE_SETTING_TEMPLATES[genre] || GENRE_SETTING_TEMPLATES.noir;

  const result: Partial<ComicPanel> = {};

  if (mode === 'scene' || mode === 'both') {
    const template = pick(settingTemplates);
    const locationHint = panel.setting.split(',')[0] || 'the scene';
    result.setting = template.replace('{location}', locationHint);
    result.emotion = pick(genreEmotions);
    result.action = `${panel.characters_present[0] || 'Character'} faces a new turn of events`;
  }

  if (mode === 'dialogue' || mode === 'both') {
    const dialogueResult = await mockGenerateDialogue(
      { ...panel, ...result },
      characters,
      genre,
    );
    result.dialogue = dialogueResult.dialogue;
    result.narration = dialogueResult.narration;
    result.image_prompt = dialogueResult.image_prompt;
  }

  return result;
}
