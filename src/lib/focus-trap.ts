/**
 * Keyboard helpers for the hand-rolled overlays (command hub on phones, perk rank inspector).
 * Radix dialogs (mod picker, import modal) bring their own focus management.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Focusable descendants that are actually rendered (skips display:none subtrees). */
export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
  );
}

/**
 * Keeps Tab / Shift+Tab inside `container`. Call from a keydown handler; returns true when
 * the event was consumed.
 */
export function trapTabKey(event: KeyboardEvent | React.KeyboardEvent, container: HTMLElement | null): boolean {
  if (event.key !== "Tab" || !container) return false;
  const focusable = getFocusable(container);
  if (focusable.length === 0) {
    event.preventDefault();
    return true;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;
  const inside = active !== null && container.contains(active);
  if (event.shiftKey) {
    if (!inside || active === first) {
      event.preventDefault();
      last.focus();
      return true;
    }
  } else if (!inside || active === last) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}
