import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getChainEntries, getChainByKey } from "@/lib/chains";

interface NetworkBridgeSelectorProps {
  value: string;
  onChange: (network: string) => void;
  label: string;
  excludeChain?: string; // Chain to exclude from selection (to prevent same chain bridging)
}

const NetworkBridgeSelector: React.FC<NetworkBridgeSelectorProps> = ({
  value,
  onChange,
  label,
  excludeChain,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get chains from configuration and filter out excluded chain
  const chainEntries = getChainEntries().filter(([chainKey]) => {
    return chainKey !== excludeChain; // Exclude the specified chain
  });

  const selectedChain = value ? getChainByKey(value) : null;

  const selectNetwork = (chainKey: string) => {
    onChange(chainKey);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-14 justify-between border-pink-200 hover:bg-pink-50"
        >
          {selectedChain ? (
            <div className="flex items-center space-x-3">
              <img 
                src={selectedChain.chainIcon} 
                alt={selectedChain.chainName}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="text-left">
                <div className="font-medium">{selectedChain.chainName}</div>
                <div className="text-sm text-gray-500">
                  {selectedChain.tokenBridges.length} token{selectedChain.tokenBridges.length !== 1 ? 's' : ''}
                  {selectedChain.isTestnet && ' • Testnet'}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Select Network</span>
          )}
          <span className="text-gray-400">▼</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border border-pink-100 shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="lotus-text-gradient">
            Select Network
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          {chainEntries.map(([chainKey, chain]) => (
            <button
              key={chainKey}
              onClick={() => selectNetwork(chainKey)}
              className="w-full flex items-center justify-between p-4 border border-pink-100 rounded-lg hover:border-pink-300 hover:bg-pink-50/50 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <img 
                  src={chain.chainIcon} 
                  alt={chain.chainName}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {chain.chainName}
                    </span>
                    {chain.isTestnet && (
                      <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                        Testnet
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {chain.tokenBridges.length} token{chain.tokenBridges.length !== 1 ? 's' : ''} • Chain ID: {chain.chainId}
                  </div>
                </div>
              </div>
              {value === chainKey && (
                <Badge className="bg-lotus-pink text-white">Selected</Badge>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-pink-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>💡 Bridge Info:</strong> You can only bridge between different networks. 
            {excludeChain && ` The selected ${getChainByKey(excludeChain)?.chainName || 'source'} network is excluded from this list.`}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkBridgeSelector;
