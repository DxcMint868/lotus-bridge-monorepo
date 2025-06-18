import { useAccount, useBalance, useChainId, useDisconnect } from 'wagmi';

export const useWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address,
  });

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: typeof balance) => {
    if (!bal) return '0.00';
    return parseFloat(bal.formatted).toFixed(4);
  };

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    balance,
    isBalanceLoading,
    disconnect,
    formatAddress,
    formatBalance,
  };
};
