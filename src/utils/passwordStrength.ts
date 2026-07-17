export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very weak' | 'Weak' | 'Fair' | 'Strong' | 'Very strong';
  color: 'error' | 'warning' | 'info' | 'success';
}

/**
 * Lightweight heuristic strength meter (length + character-class variety).
 * Not a substitute for the backend's real validation (Django's
 * AUTH_PASSWORD_VALIDATORS) — purely a UX signal while typing.
 */
export function estimatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: 'Very weak', color: 'error' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(score, 4);
  const levels: PasswordStrength[] = [
    { score: 0, label: 'Very weak', color: 'error' },
    { score: 1, label: 'Weak', color: 'error' },
    { score: 2, label: 'Fair', color: 'warning' },
    { score: 3, label: 'Strong', color: 'info' },
    { score: 4, label: 'Very strong', color: 'success' },
  ];
  return levels[clamped];
}
