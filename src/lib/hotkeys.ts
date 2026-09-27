// Drill hotkeys listen on window, so they have to stay out of the way of typing
// (the account panel's inputs) and of the browser's own Enter-activates-button.
export const shouldIgnoreHotkey = (e: KeyboardEvent): boolean => {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return true;
  const el = e.target;
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable || el.closest('input, textarea, select')) return true;
  return e.key === 'Enter' && el instanceof HTMLButtonElement && !el.disabled;
};
