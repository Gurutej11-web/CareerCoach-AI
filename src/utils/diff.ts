export interface DiffToken {
  type: 'same' | 'added' | 'removed';
  text: string;
}

/**
 * Word-level diff using a standard LCS (longest common subsequence) table.
 * Good enough for short-to-medium text (resumes); not optimized for huge
 * documents since it's O(n*m) in tokens.
 */
export function computeWordDiff(original: string, modified: string): DiffToken[] {
  const a = original.split(/(\s+)/).filter((t) => t.length > 0);
  const b = modified.split(/(\s+)/).filter((t) => t.length > 0);

  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const tokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      tokens.push({ type: 'same', text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      tokens.push({ type: 'removed', text: a[i] });
      i++;
    } else {
      tokens.push({ type: 'added', text: b[j] });
      j++;
    }
  }
  while (i < n) {
    tokens.push({ type: 'removed', text: a[i] });
    i++;
  }
  while (j < m) {
    tokens.push({ type: 'added', text: b[j] });
    j++;
  }

  return tokens;
}
