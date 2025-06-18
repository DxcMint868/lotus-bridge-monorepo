
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface Network {
  id: string;
  name: string;
  logo: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

const networks: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    logo: 'Ξ',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    logo: '⚡',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
  },
  {
    id: 'polygon',
    name: 'Polygon',
    logo: '🔷',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    logo: '🔵',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  },
  {
    id: 'base',
    name: 'Base',
    logo: '🔷',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
  }
];

const NetworkSelector = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(networks[0]);

  const switchNetwork = (network: Network) => {
    setSelectedNetwork(network);
    console.log(`Switching to ${network.name} (Chain ID: ${network.chainId})`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-pink-200 hover:bg-pink-50">
          <span className="mr-2 text-lg">{selectedNetwork.logo}</span>
          <span className="hidden sm:inline">{selectedNetwork.name}</span>
          <span className="sm:hidden">{selectedNetwork.nativeCurrency.symbol}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 lotus-card">
        <div className="p-2">
          <h3 className="font-medium text-gray-900 mb-3">Select Network</h3>
          {networks.map((network) => (
            <DropdownMenuItem
              key={network.id}
              onClick={() => switchNetwork(network)}
              className="flex items-center justify-between p-3 cursor-pointer rounded-md hover:bg-pink-50"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{network.logo}</span>
                <div>
                  <div className="font-medium text-gray-900">{network.name}</div>
                  <div className="text-sm text-gray-500">{network.nativeCurrency.symbol}</div>
                </div>
              </div>
              {selectedNetwork.id === network.id && (
                <Badge className="bg-lotus-green text-white">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NetworkSelector;
