const STORAGE_KEY = "simple_notes_v1";

// PUBLIC_INTERFACE
export function loadNotes() {
  /**
   * Load notes array from localStorage.
   * Returns [] if nothing stored or parsing fails.
   */
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveNotes(notes) {
  /**
   * Persist notes array to localStorage.
   */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
