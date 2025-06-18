import React from 'react';
import { useAccount, useChainId, useBalance } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WalletInfo = () => {
  const { address, isConnected, chainId } = useAccount();
  const currentChainId = useChainId();
  const { data: balance } = useBalance({
    address: address,
  });

  if (!isConnected) {
    return null;
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (id: number) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      10: 'Optimism',
      42161: 'Arbitrum',
      8453: 'Base',
      11155111: 'Sepolia',
    };
    return chains[id] || `Chain ${id}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto lotus-card">
      <CardHeader>
        <CardTitle className="text-center lotus-text-gradient">
          Wallet Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Address:</span>
          <span className="text-sm font-mono">{formatAddress(address!)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Network:</span>
          <Badge variant="secondary" className="bg-pink-100 text-pink-700">
            {getChainName(currentChainId)}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Balance:</span>
          <span className="text-sm font-semibold">
            {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.00 ETH'}
          </span>
        </div>
        
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Chain ID:</span>
            <span>{currentChainId}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletInfo;
