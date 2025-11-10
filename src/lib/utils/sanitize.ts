/**
 * Sanitization Utilities
 * Prevents XSS attacks
 */

/**
 * Sanitize HTML string to prevent XSS
 * Escapes HTML special characters to their entity equivalents
 * Note: This function is redundant with escapeHTML - use escapeHTML instead
 * @deprecated Use escapeHTML for consistency
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';

  // This actually escapes HTML, not removes tags
  // Delegates to escapeHTML for consistency
  return escapeHTML(input);
}

/**
 * Sanitize input for display (escape special characters)
 */
export function escapeHTML(input: string): string {
  if (!input) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Sanitize number input (remove non-numeric characters)
 */
export function sanitizeNumber(input: string): string {
  if (!input) return '';
  return input.replace(/[^0-9]/g, '');
}

/**
 * Validate and sanitize task title
 */
export function sanitizeTaskTitle(title: string): string {
  if (!title) return '';

  // Trim and limit length
  return title.trim().slice(0, 200);
}

/**
 * Validate and sanitize task description
 */
export function sanitizeTaskDescription(description: string): string {
  if (!description) return '';

  // Trim and limit length
  return description.trim().slice(0, 1000);
}
