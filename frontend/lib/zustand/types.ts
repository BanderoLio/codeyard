import type { StateCreator } from 'zustand';

// TODO: StoreMutatorIdentifier should be used to identify mutators.

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
