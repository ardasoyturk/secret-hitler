import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type OptimizedAssetMap = Record<string, string>;

const OptimizedAssetsContext = createContext<OptimizedAssetMap>({});

export function OptimizedAssetsProvider({
  assets,
  children,
}: {
  assets: OptimizedAssetMap;
  children: ReactNode;
}) {
  return (
    <OptimizedAssetsContext.Provider value={assets}>
      {children}
    </OptimizedAssetsContext.Provider>
  );
}

export function useOptimizedAsset(assetKey: string, fallbackSrc: string) {
  const assets = useContext(OptimizedAssetsContext);
  return assets[assetKey] ?? fallbackSrc;
}
