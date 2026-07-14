import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ViewedState {
  viewedIds: number[];
  addProductView: (id: number) => void;
  clearViewed: () => void;
}

const MAX_VIEWED = 12;

export const useViewedStore = create<ViewedState>()(
  persist(
    (set) => ({
      viewedIds: [],
      addProductView: (id: number) =>
        set((state) => {
          // Remove if it already exists to move it to the front
          const filtered = state.viewedIds.filter((existingId) => existingId !== id);
          const updated = [id, ...filtered].slice(0, MAX_VIEWED);
          return { viewedIds: updated };
        }),
      clearViewed: () => set({ viewedIds: [] }),
    }),
    {
      name: 'ag-viewed-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
