import chainsConfig from "@/config/chains.json";

export interface ChainToken {
	innerTokenAddress: string;
	ProxyOFTAddress: string;
	tokenName: string;
	tokenSymbol: string;
	tokenDecimals: number;
	icon: string;
}

export interface ChainConfig {
	chainId: number;
	chainName: string;
	isTestnet: boolean;
	chainIcon: string;
	lzEndpointID: number;
	lzEndpointContract: string;
	tokenBridges: ChainToken[];
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

// Get tokens for a specific chain
export const getTokensForChain = (chainId: number): ChainToken[] => {
	const chain = getChainById(chainId);
	return chain?.tokenBridges || [];
};

// Get token by symbol for a specific chain
export const getTokenBySymbol = (
	chainId: number,
	symbol: string
): ChainToken | undefined => {
	const tokens = getTokensForChain(chainId);
	return tokens.find((token) => token.tokenSymbol === symbol);
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
	const token = getTokenBySymbol(chainId, tokenSymbol);
	return token
		? {
				innerTokenAddress: token.innerTokenAddress,
				proxyOFTAddress: token.ProxyOFTAddress,
		  }
		: null;
};

// Get chain entries with keys
export const getChainEntries = (): [string, ChainConfig][] => {
	return Object.entries(chains);
};
