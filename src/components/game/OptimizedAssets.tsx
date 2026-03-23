import type { ComponentChildren } from "preact";
import { createContext, useContext } from "preact/compat";

export type OptimizedAssetMap = Record<string, string>;

const OptimizedAssetsContext = createContext<OptimizedAssetMap>({});

export function OptimizedAssetsProvider({
	assets,
	children,
}: {
	assets: OptimizedAssetMap;
	children: ComponentChildren;
}) {
	return <OptimizedAssetsContext.Provider value={assets}>{children}</OptimizedAssetsContext.Provider>;
}

export function useOptimizedAsset(assetKey: string) {
	const assets = useContext(OptimizedAssetsContext);
	return assets[assetKey] ?? assetKey;
}
