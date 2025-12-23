import { authStore, type TAuthStore } from '@/features/auth/auth.store';
import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type TAppStore = TAuthStore;

export const createAppStore = createStore<TAppStore>()(
  immer(
    persist(
      (...args) => ({
        ...authStore(...args),
      }),

      {
        storage: createJSONStorage(() => localStorage),
        name: 'zustand-store',
        partialize: (state): Partial<TAppStore> => ({
          authorization: state.authorization,
        }),
      },
    ),
  ),
);
