/**
 * Normalise text for matching:
 * - NFKC folds full-width characters (ＵＳＢ -> USB, １ -> 1)
 * - lower-case for case-insensitive matching
 * - collapse runs of whitespace
 */
export function normalize(text) {
  return String(text ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** All space-separated terms must appear in the name (order-independent). */
export function matchesQuery(name, query) {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (terms.length === 0) return true;
  const target = normalize(name).replace(/\s/g, '');
  return terms.every((t) => target.includes(t));
}

/**
 * Split `text` into [{ text, match }] parts for highlighting.
 * Works on the original string so the displayed characters are unchanged.
 */
export function highlightParts(text, query) {
  const terms = normalize(query).split(' ').filter(Boolean);
  if (terms.length === 0) return [{ text, match: false }];

  const chars = [...text];
  const folded = chars.map((c) => normalize(c));
  const marked = new Array(chars.length).fill(false);

  for (const term of terms) {
    for (let start = 0; start < chars.length; start++) {
      let i = start;
      let built = '';
      while (i < chars.length && built.length < term.length) {
        built += folded[i];
        i++;
      }
      if (built === term) for (let k = start; k < i; k++) marked[k] = true;
    }
  }

  const parts = [];
  chars.forEach((c, idx) => {
    const last = parts[parts.length - 1];
    if (last && last.match === marked[idx]) last.text += c;
    else parts.push({ text: c, match: marked[idx] });
  });
  return parts;
}
