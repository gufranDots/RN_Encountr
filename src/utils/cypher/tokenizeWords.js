/**
 * Shared word tokenization for Cypher TTS highlight and response UI.
 * Uses /\S+/g so indices align with buildWordRanges / charIndexToWordIndex.
 */
export function tokenizeWords(text) {
  if (!text?.trim()) {
    return [];
  }
  return text.match(/\S+/g) || [];
}

export function buildWordRanges(text) {
  const ranges = [];
  const regex = /\S+/g;
  let match = regex.exec(text);
  while (match) {
    ranges.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
    match = regex.exec(text);
  }
  return ranges;
}

export function charIndexToWordIndex(text, charIndex) {
  const ranges = buildWordRanges(text);
  if (!ranges.length) {
    return -1;
  }

  for (let i = 0; i < ranges.length; i += 1) {
    const {start, end} = ranges[i];
    if (charIndex >= start && charIndex < end) {
      return i;
    }
    if (charIndex < start) {
      return Math.max(0, i - 1);
    }
  }

  return ranges.length - 1;
}
