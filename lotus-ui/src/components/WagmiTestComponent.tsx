import React from 'react';
import { useAccount, useChainId, useBalance, useSwitchChain } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const WagmiTestComponent = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { switchChain, chains } = useSwitchChain();
  
  const { data: balance, isLoading: isBalanceLoading, refetch } = useBalance({
    address: address,
  });

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto lotus-card">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Connect your wallet to see blockchain information
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (id: number) => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum Mainnet',
      137: 'Polygon',
      10: 'Optimism',
      42161: 'Arbitrum One',
      8453: 'Base',
      11155111: 'Sepolia Testnet',
    };
    return chainNames[id] || `Chain ${id}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto lotus-card">
      <CardHeader>
        <CardTitle className="text-center lotus-text-gradient flex items-center justify-center gap-2">
          <span>🔗</span>
          Wallet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Badge variant="default" className="bg-green-100 text-green-700">
              {isConnecting ? 'Connecting...' : 'Connected'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Address:</span>
            <span className="text-sm font-mono">{formatAddress(address!)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Network:</span>
            <Badge variant="secondary" className="bg-pink-100 text-pink-700">
              {getChainName(chainId)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Balance:</span>
            <div className="text-right">
              {isBalanceLoading ? (
                <span className="text-sm text-muted-foreground">Loading...</span>
              ) : (
                <span className="text-sm font-semibold">
                  {balance ? 
                    `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 
                    '0.00 ETH'
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Chain ID:</span>
            <span>{chainId}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            size="sm"
            className="flex-1"
          >
            Refresh Balance
          </Button>
        </div>

        {/* Network Switching */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Switch Network:</h4>
          <div className="grid grid-cols-2 gap-2">
            {chains.slice(0, 4).map((chain) => (
              <Button
                key={chain.id}
                onClick={() => switchChain({ chainId: chain.id })}
                variant={chainId === chain.id ? "default" : "outline"}
                size="sm"
                className="text-xs"
                disabled={chainId === chain.id}
              >
                {chain.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WagmiTestComponent;
