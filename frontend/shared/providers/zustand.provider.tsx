'use client';

import { withSelectors, type WithSelectors } from '@/lib/zustand/selectors';
import { TAppStore, createAppStore } from '@/lib/zustand/store';
import {
  setAccessTokenGetter,
  setTokenRefreshHandler,
  setUnauthorizedHandler,
} from '@/lib/api-client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useStore } from 'zustand/react';
import { authApi } from '@/features/auth/auth.api';

type TAppStoreApi = WithSelectors<typeof createAppStore>;

const ZustandContext = createContext<TAppStoreApi | undefined>(undefined);

export function ZustandProvider({ children }: { children: React.ReactNode }) {
  const [storeApi] = useState<TAppStoreApi>(
    () => withSelectors(createAppStore as never) as TAppStoreApi,
  );

  useEffect(() => {
    setAccessTokenGetter(() => storeApi.getState().getAccessToken());
    setTokenRefreshHandler((accessToken) => {
      storeApi.getState().setAuthorization({ accessToken });
    });
    setUnauthorizedHandler(() => {
      storeApi.getState().setAuthorization(null);
      storeApi.getState().setUser(null);
    });

    const authorization = storeApi.getState().authorization;
    const user = storeApi.getState().user;

    if (authorization && !user) {
      authApi
        .getMe()
        .then((userData) => {
          storeApi.getState().setUser(userData);
        })
        .catch(() => {
          storeApi.getState().setAuthorization(null);
        });
    }
  }, [storeApi]);

  return (
    <ZustandContext.Provider value={storeApi}>
      {children}
    </ZustandContext.Provider>
  );
}

export function useAppStore<T>(selector: (state: TAppStore) => T) {
  return useStore(useAppStoreApi(), selector);
}

export function useAppStoreApi() {
  const storeApi = useContext(ZustandContext);
  if (!storeApi) {
    throw new Error('useAppStoreApi must be used within a ZustandProvider');
  }
  return storeApi;
}
