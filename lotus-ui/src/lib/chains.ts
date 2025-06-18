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
	simpleSwapBridgeContract?: string;
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

// Get native token information for a chain
export const getNativeToken = (chainId: number): ChainToken | null => {
	const chain = getChainById(chainId);
	if (!chain) return null;

	// Define native tokens for each chain
	const nativeTokens: Record<number, { symbol: string; name: string; icon: string }> = {
		1: { symbol: 'ETH', name: 'Ethereum', icon: '/chain-icons/ethereum.png' },
		11155111: { symbol: 'ETH', name: 'Ethereum', icon: '/chain-icons/ethereum.png' }, // Sepolia
		8453: { symbol: 'ETH', name: 'Ethereum', icon: '/chain-icons/base.png' },
		84532: { symbol: 'ETH', name: 'Ethereum', icon: '/chain-icons/base.png' }, // Base Sepolia
		137: { symbol: 'MATIC', name: 'Polygon', icon: '/placeholder.svg' },
		80001: { symbol: 'MATIC', name: 'Polygon', icon: '/placeholder.svg' }, // Mumbai
		56: { symbol: 'BNB', name: 'BNB Smart Chain', icon: '/placeholder.svg' },
		97: { symbol: 'BNB', name: 'BNB Smart Chain', icon: '/placeholder.svg' }, // BSC Testnet
		42161: { symbol: 'ETH', name: 'Ethereum', icon: '/placeholder.svg' }, // Arbitrum
		421614: { symbol: 'ETH', name: 'Ethereum', icon: '/placeholder.svg' }, // Arbitrum Sepolia
		10: { symbol: 'ETH', name: 'Ethereum', icon: '/placeholder.svg' }, // Optimism
		11155420: { symbol: 'ETH', name: 'Ethereum', icon: '/placeholder.svg' }, // Optimism Sepolia
	};

	const nativeToken = nativeTokens[chainId];
	if (!nativeToken) return null;

	return {
		tokenSymbol: nativeToken.symbol,
		tokenName: nativeToken.name,
		tokenAddress: '0x0000000000000000000000000000000000000000', // Native token address
		liquidityPoolAddress: '', // Native tokens don't have liquidity pools in our bridge
		icon: nativeToken.icon,
		decimals: 18, // Most native tokens are 18 decimals
	};
};

// Get all tokens including native token for a specific chain
export const getAllTokensForChain = (chainId: number): ChainToken[] => {
	const nativeToken = getNativeToken(chainId);
	const erc20Tokens = getTokensForChain(chainId);
	
	return nativeToken ? [nativeToken, ...erc20Tokens] : erc20Tokens;
};

// Get token decimals by symbol for a specific chain
export const getTokenDecimals = (
	chainId: number,
	symbol: string
): number | undefined => {
	const chain = getChainById(chainId);
	return chain?.tokens[symbol]?.decimals;
};
