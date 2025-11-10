/**
 * useFocusTrap Hook
 * Traps focus within a modal for accessibility
 */

import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean = true) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;

    // Get all focusable elements
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // Handle edge case: no focusable elements
    if (focusableElements.length === 0) {
      console.warn('[useFocusTrap] No focusable elements found in modal');
      return;
    }

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element
    firstElement.focus();

    // Handle edge case: only 1 focusable element
    if (focusableElements.length === 1) {
      // No need to trap focus, just ensure it stays focused
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          firstElement.focus();
        }
      };

      element.addEventListener('keydown', handleTabKey);

      return () => {
        element.removeEventListener('keydown', handleTabKey);
      };
    }

    // Normal case: 2+ focusable elements
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return elementRef;
}
