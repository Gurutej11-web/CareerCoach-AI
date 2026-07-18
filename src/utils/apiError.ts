/**
 * Extracts a human-readable message from an axios error response.
 *
 * The backend's custom exception handler (backend/exception_handlers.py)
 * adds a structured `error: {message, status_code}` object alongside DRF's
 * own `detail` string on framework-raised errors (401/403/404/405/429 —
 * e.g. a bad login, an expired token, or hitting a rate limit), while views
 * that build their own `Response({'error': '...'})` for a 400 send `error`
 * as a plain string instead. Reaching into `.error` directly therefore
 * sometimes gets a string and sometimes gets an object depending on which
 * path failed — and rendering an object straight into JSX crashes the page
 * ("Objects are not valid as a React child"). This normalizes both cases.
 */
export function extractApiErrorMessage(err: any, fallback: string): string {
  const data = err?.response?.data;
  if (!data) return fallback;

  if (typeof data.detail === 'string') return data.detail;
  if (typeof data.error === 'string') return data.error;
  if (data.error && typeof data.error === 'object' && typeof data.error.message === 'string') {
    return data.error.message;
  }

  // Fall back to formatting field-specific validation errors, e.g. signup's
  // {"email": ["A user with that email already exists."]}.
  const { error: _error, detail: _detail, ...fieldErrors } = data;
  const formatted = Object.entries(fieldErrors)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join(', ');
  return formatted || fallback;
}
