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
          className="w-full h-14 justify-between bg-white/70 backdrop-blur-sm border-pink-200 hover:bg-white/80 hover:border-pink-300 transition-all"
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
                  {Object.keys(selectedChain.tokens).length} token{Object.keys(selectedChain.tokens).length !== 1 ? 's' : ''}
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
      <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-md border border-white/50 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="lotus-text-gradient text-xl font-semibold">
            Select Network
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          {chainEntries.map(([chainKey, chain]) => (
            <button
              key={chainKey}
              onClick={() => selectNetwork(chainKey)}
              className="w-full flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border border-pink-200 rounded-lg hover:border-pink-400 hover:bg-white/70 transition-all duration-200"
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
                    <span className="font-semibold text-gray-800">
                      {chain.chainName}
                    </span>
                    {chain.isTestnet && (
                      <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                        Testnet
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Object.keys(chain.tokens).length} token{Object.keys(chain.tokens).length !== 1 ? 's' : ''} • Chain ID: {chain.chainId}
                  </div>
                </div>
              </div>
              {value === chainKey && (
                <Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">Selected</Badge>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 glass-button-enhanced rounded-xl relative z-10">
          <div className="text-sm text-gray-700 font-medium">
            <strong>💡 Bridge Info:</strong> You can only bridge between different networks. 
            {excludeChain && ` The selected ${getChainByKey(excludeChain)?.chainName || 'source'} network is excluded from this list.`}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NetworkBridgeSelector;
