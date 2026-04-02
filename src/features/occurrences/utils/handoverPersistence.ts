const getSelectedIdsKey = (userId: string) => `inherited_selected_ids_${userId}`;
const getCompletedKey = (userId: string) => `inherited_selection_completed_${userId}`;
const getCreatedIdsKey = (userId: string) => `created_occurrence_ids_${userId}`;

export const getSelectedInheritedIds = (userId: string): string[] => {
  try {
    const raw = localStorage.getItem(getSelectedIdsKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((id) => String(id));
  } catch {
    return [];
  }
};

export const setSelectedInheritedIds = (userId: string, ids: string[]) => {
  localStorage.setItem(getSelectedIdsKey(userId), JSON.stringify(ids.map((id) => String(id))));
};

export const clearSelectedInheritedIds = (userId: string) => {
  localStorage.removeItem(getSelectedIdsKey(userId));
};

export const hasCompletedInheritedSelection = (userId: string): boolean => {
  return localStorage.getItem(getCompletedKey(userId)) === '1';
};

export const setInheritedSelectionCompleted = (userId: string) => {
  localStorage.setItem(getCompletedKey(userId), '1');
};

export const clearInheritedSelectionCompleted = (userId: string) => {
  localStorage.removeItem(getCompletedKey(userId));
};

export const getCreatedThisShiftOccurrenceIds = (userId: string): string[] => {
  try {
    const raw = localStorage.getItem(getCreatedIdsKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((id) => String(id));
  } catch {
    return [];
  }
};

export const addCreatedThisShiftOccurrenceId = (userId: string, occurrenceId: string) => {
  const current = getCreatedThisShiftOccurrenceIds(userId);
  const normalizedId = String(occurrenceId);
  if (current.includes(normalizedId)) return;

  localStorage.setItem(getCreatedIdsKey(userId), JSON.stringify([...current, normalizedId]));
};

export const clearCreatedThisShiftOccurrenceIds = (userId: string) => {
  localStorage.removeItem(getCreatedIdsKey(userId));
};
