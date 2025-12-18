import type { TImmerStore } from '@/lib/zustand/types';
import type { AppStore } from '@/lib/zustand/store';
import { immer } from 'zustand/middleware/immer';
import type { TAuthorization } from './types/authorization.type';
import type { TUser } from './types/user.type';

type State = {
  authorization: TAuthorization | null;
  user: TUser | null;
};

type Actions = {
  setAuthorization: (authorization: TAuthorization | null) => void;
  setUser: (user: TUser | null) => void;
  getAccessToken: () => string | null;
};

export type AuthStore = State & Actions;

const initialState: State = {
  authorization: null,
  user: null,
};

export const authStore: TImmerStore<AuthStore, AppStore> = immer(
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
