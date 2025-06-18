import { useAccount, useBalance } from "wagmi";
import { getChainByKey, getTokenBySymbol } from "@/lib/chains";
import { formatUnits, Address } from "viem";

// Hook to get token balance
export const useTokenBalance = (chainKey: string, tokenSymbol: string) => {
	const { address } = useAccount();
	const chain = getChainByKey(chainKey);
	const token = chain ? getTokenBySymbol(chain.chainId, tokenSymbol) : null;

	const {
		data: balance,
		isLoading,
		refetch,
	} = useBalance({
		address,
		token: token?.innerTokenAddress as Address,
		chainId: chain?.chainId,
	});

	return {
		balance: balance ? formatUnits(balance.value, balance.decimals) : "0",
		symbol: balance?.symbol || tokenSymbol,
		decimals: balance?.decimals || token?.tokenDecimals || 18,
		isLoading,
		refetch,
	};
};
