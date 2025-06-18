import chainsConfig from "@/config/chains.json";

export interface ChainConfig {
	chainId: number;
	chainName: string;
	isTestnet: boolean;
	chainIcon: string;
	bridgeFee: string;
	bridgeFactoryContract: string;
	// Uniswap V3 contracts
	uniswapV3FactoryContract?: string;
	positionManagerContract?: string;
	swapRouterContract?: string;
	quoterV2Contract?: string;
	swapBridgeContract?: string;
	// Tokens and pools
	tokens: Record<
		string,
		{ address: string; image: string; name: string; decimals: number }
	>; // tokenSymbol -> { address, image, name, decimals }
	liquidityPools: Record<string, string>; // tokenSymbol -> liquidityPoolAddress
}

export interface ChainsData {
	[key: string]: ChainConfig;
}

// Load chains configuration
export const chains: ChainsData = chainsConfig as ChainsData;

// Get all supported chains
export const getSupportedChains = (): ChainConfig[] => {
	return Object.values(chains);
};

// Get chain by chainId
export const getChainById = (chainId: number): ChainConfig | undefined => {
	return Object.values(chains).find((chain) => chain.chainId === chainId);
};

// Get chain by key
export const getChainByKey = (key: string): ChainConfig | undefined => {
	return chains[key];
};

// ChainToken interface for TokenSelector component
export interface ChainToken {
	tokenSymbol: string;
	tokenName: string;
	tokenAddress: string;
	liquidityPoolAddress: string;
	icon: string;
	decimals: number;
}

// Get tokens for a specific chain with full metadata
export const getTokensForChain = (chainId: number): ChainToken[] => {
	const chain = getChainById(chainId);
	if (!chain) return [];

	return Object.entries(chain.tokens).map(([symbol, tokenData]) => ({
		tokenSymbol: symbol,
		tokenName: tokenData.name,
		tokenAddress: tokenData.address,
		liquidityPoolAddress: chain.liquidityPools[symbol] || "",
		icon: tokenData.image.startsWith("/")
			? tokenData.image
			: `/token-icons/${symbol.toLowerCase()}.png`,
		decimals: tokenData.decimals,
	}));
};

// Get token address by symbol for a specific chain
export const getTokenAddress = (
	chainId: number,
	symbol: string
): string | undefined => {
	const chain = getChainById(chainId);
	return chain?.tokens[symbol]?.address;
};

// Get liquidity pool address by token symbol for a specific chain
export const getLiquidityPoolAddress = (
	chainId: number,
	symbol: string
): string | undefined => {
	const chain = getChainById(chainId);
	return chain?.liquidityPools[symbol];
};

// Get token by symbol for a specific chain (backwards compatibility)
export const getTokenBySymbol = (
	chainId: number,
	symbol: string
):
	| {
			tokenAddress: string;
			liquidityPoolAddress: string;
			tokenSymbol: string;
	  }
	| undefined => {
	const tokenAddress = getTokenAddress(chainId, symbol);
	const liquidityPoolAddress = getLiquidityPoolAddress(chainId, symbol);

	if (tokenAddress && liquidityPoolAddress) {
		return {
			tokenAddress,
			liquidityPoolAddress,
			tokenSymbol: symbol,
		};
	}
	return undefined;
};

// Filter chains by network type
export const getMainnetChains = (): ChainConfig[] => {
	return getSupportedChains().filter((chain) => !chain.isTestnet);
};

export const getTestnetChains = (): ChainConfig[] => {
	return getSupportedChains().filter((chain) => chain.isTestnet);
};

// Get chain keys
export const getChainKeys = (): string[] => {
	return Object.keys(chains);
};

// Check if chain is supported
export const isChainSupported = (chainId: number): boolean => {
	return getChainById(chainId) !== undefined;
};

// Get bridge addresses for a specific token on a chain
export const getTokenBridgeAddresses = (
	chainId: number,
	tokenSymbol: string
) => {
	const chain = getChainById(chainId);
	const tokenAddress = chain?.tokens[tokenSymbol]?.address;
	const liquidityPoolAddress = chain?.liquidityPools[tokenSymbol];
	const bridgeFactoryContract = chain?.bridgeFactoryContract;

	return tokenAddress && liquidityPoolAddress && bridgeFactoryContract
		? {
				tokenAddress,
				liquidityPoolAddress,
				bridgeFactoryContract,
		  }
		: null;
};

// Get chain entries with keys
export const getChainEntries = (): [string, ChainConfig][] => {
	return Object.entries(chains);
};

// Get token decimals by symbol for a specific chain
export const getTokenDecimals = (
	chainId: number,
	symbol: string
): number | undefined => {
	const chain = getChainById(chainId);
	return chain?.tokens[symbol]?.decimals;
};
