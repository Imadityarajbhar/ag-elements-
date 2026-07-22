import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ViewedEntry {
  id: number;
  viewedAt: number;
}

interface ViewedState {
  viewed: ViewedEntry[];
  addProductView: (id: number) => void;
  clearViewed: () => void;
}

const MAX_VIEWED = 20;
const EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isExpired(entry: ViewedEntry): boolean {
  return Date.now() - entry.viewedAt > EXPIRATION_MS;
}

export const useViewedStore = create<ViewedState>()(
  persist(
    (set) => ({
      viewed: [],
      addProductView: (id: number) =>
        set((state) => {
          // Drop expired entries and any existing entry for this id (so it moves to the front)
          const active = state.viewed.filter((entry) => !isExpired(entry) && entry.id !== id);
          const updated = [{ id, viewedAt: Date.now() }, ...active].slice(0, MAX_VIEWED);
          return { viewed: updated };
        }),
      clearViewed: () => set({ viewed: [] }),
    }),
    {
      name: 'ag-viewed-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // Old shape (v1) stored viewed: number[] directly — expired-away rather than migrated,
      // since there's no reliable "viewed at" timestamp to backfill for those entries.
      migrate: (_persistedState) => ({ viewed: [] }),
    }
  )
);

/** Non-expired viewed product IDs, most recent first. */
export function getActiveViewedIds(viewed: ViewedEntry[]): number[] {
  return viewed.filter((entry) => !isExpired(entry)).map((entry) => entry.id);
}
