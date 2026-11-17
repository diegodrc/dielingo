// Pinyin helpers: tone marks <-> tone numbers, and loose comparison for typed answers.

const MARKED: Record<string, string[]> = {
  a: ['ā', 'á', 'ǎ', 'à'],
  e: ['ē', 'é', 'ě', 'è'],
  i: ['ī', 'í', 'ǐ', 'ì'],
  o: ['ō', 'ó', 'ǒ', 'ò'],
  u: ['ū', 'ú', 'ǔ', 'ù'],
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

/** Base vowel and tone (1–4) of every tone-marked vowel. */
const TONE_OF: Record<string, [string, number]> = {};
for (const [vowel, marks] of Object.entries(MARKED)) {
  marks.forEach((mark, i) => {
    TONE_OF[mark] = [vowel, i + 1];
    TONE_OF[mark.toUpperCase()] = [vowel.toUpperCase(), i + 1];
  });
}

/** Index of the vowel that carries the tone mark, by the standard pinyin rule. */
function markIndex(syllable: string): number {
  const lower = syllable.toLowerCase();
  for (const v of ['a', 'e']) {
    const i = lower.indexOf(v);
    if (i !== -1) return i;
  }
  const ou = lower.indexOf('ou');
  if (ou !== -1) return ou;
  for (let i = lower.length - 1; i >= 0; i--) {
    if ('iouü'.includes(lower[i])) return i;
  }
  return -1;
}

/**
 * Puts a tone on a toneless syllable: applyTone('hao', 3) → 'hǎo'.
 * Tone 0 or 5 is the neutral tone (no mark).
 */
export function applyTone(syllable: string, tone: number): string {
  if (tone < 1 || tone > 4) return syllable;
  const i = markIndex(syllable);
  if (i === -1) return syllable;
  const vowel = syllable[i];
  const marked = MARKED[vowel.toLowerCase()][tone - 1];
  return syllable.slice(0, i) + (vowel === vowel.toUpperCase() ? marked.toUpperCase() : marked) + syllable.slice(i + 1);
}

/** Tone of one syllable: 1–4, or 0 for the neutral tone. */
export function toneOf(syllable: string): number {
  for (const char of syllable) {
    const found = TONE_OF[char];
    if (found) return found[1];
  }
  return 0;
}

/** Removes tone marks but keeps ü: 'nǚ hǎo' → 'nü hao'. */
export function stripTones(text: string): string {
  return [...text].map((char) => TONE_OF[char]?.[0] ?? char).join('');
}

/**
 * Turns typed tone numbers into marks: 'ni3 hao3' → 'nǐ hǎo', 'lv4' → 'lǜ'.
 * Text that already has marks is left as it is.
 */
export function numberedToMarks(text: string): string {
  return text
    .replace(/u:/gi, (m) => (m[0] === 'U' ? 'Ü' : 'ü'))
    .replace(/v/g, 'ü')
    .replace(/V/g, 'Ü')
    .replace(/([a-zü]+)([0-5])/gi, (_, syllable: string, tone: string) => applyTone(syllable, Number(tone)));
}

/** Form used to compare pinyin answers: marks, lower case, letters only. */
export function normalizePinyin(text: string, keepTones = true): string {
  const marked = numberedToMarks(text.normalize('NFC')).toLowerCase();
  const letters = marked.replace(/[^\p{L}]/gu, '');
  return keepTones ? letters : stripTones(letters);
}

/** Splits space-separated pinyin into syllables. */
export function syllables(pinyin: string): string[] {
  return pinyin.trim().split(/\s+/).filter(Boolean);
}
