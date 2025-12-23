import type { TImmerStore } from '@/lib/zustand/types';
import type { TAppStore } from '@/lib/zustand/store';
import { immer } from 'zustand/middleware/immer';
import type { TAuthorization } from './types/authorization.type';
import type { TUser } from './types/user.type';

type TState = {
  authorization: TAuthorization | null;
  user: TUser | null;
};

type TActions = {
  setAuthorization: (authorization: TAuthorization | null) => void;
  setUser: (user: TUser | null) => void;
  getAccessToken: () => string | null;
};

export type TAuthStore = TState & TActions;

const initialState: TState = {
  authorization: null,
  user: null,
};

export const authStore: TImmerStore<TAuthStore, TAppStore> = immer(
  (set, get) => ({
    ...initialState,
    setAuthorization: (authorization) =>
      set((state) => {
        state.authorization = authorization;
      }),
    setUser: (user) =>
      set((state) => {
        state.user = user;
      }),
    getAccessToken: () => {
      const state = get();
      return state.authorization?.accessToken || null;
    },
  }),
);
