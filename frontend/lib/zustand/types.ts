import type { StateCreator } from 'zustand';

export type TStore<LocalStore, GlobalStore = LocalStore> = StateCreator<
  GlobalStore,
  [],
  [],
  LocalStore
>;

export type TImmerStore<LocalStore, GlobalStore = LocalStore> = StateCreator<
  GlobalStore,
  [],
  [['zustand/immer', never]],
  LocalStore
>;
