import { useEffect, useMemo, useState } from 'react';

export function useRowSelection(rowIds: string[]) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected((current) => current.filter((id) => rowIds.includes(id)));
  }, [rowIds.join('|')]);

  const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));

  return {
    selected,
    allSelected,
    toggle: (id: string) => {
      setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    },
    toggleAll: () => {
      setSelected(allSelected ? [] : rowIds);
    },
    clear: () => setSelected([]),
    isSelected: (id: string) => selected.includes(id),
  };
}
