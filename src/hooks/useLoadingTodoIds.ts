import { useCallback, useState } from 'react';

export function useLoadingIds<T extends number | string>() {
  const [loadingIds, setLoadingIds] = useState<T[]>([]);

  const handleAddToLoading = useCallback((idToAdd: T) => {
    setLoadingIds(current => [...current, idToAdd]);
  }, []);

  const handleRemoveFromLoading = useCallback((idToRemove: T) => {
    setLoadingIds(current => current.filter(id => id !== idToRemove));
  }, []);

  const isIdLoading = useCallback(
    (id: T) => loadingIds.includes(id),
    [loadingIds],
  );

  return {
    addToLoading: handleAddToLoading,
    removeFromLoading: handleRemoveFromLoading,
    isIdLoading,
  };
}
