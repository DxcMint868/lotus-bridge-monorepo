
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { getTokensForChain, ChainToken } from '@/lib/chains';

interface TokenSelectorProps {
  networkChainId: number;
  value: string;
  onChange: (token: string) => void;
  label: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ 
  networkChainId, 
  value, 
  onChange, 
  label 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get available tokens for the selected network
  const availableTokens = useMemo(() => {
    if (!networkChainId) {
      return [];
    }
    return getTokensForChain(networkChainId);
  }, [networkChainId]);

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return availableTokens;
    
    return availableTokens.filter((token: ChainToken) =>
      token.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.tokenName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableTokens, searchQuery]);

  // Get Vietnamese tokens (VNST, VNDC, etc.)
  const vietnameseTokens = useMemo(() => {
    return filteredTokens.filter((token: ChainToken) => 
      token.tokenSymbol.includes('VN') || token.tokenName.toLowerCase().includes('vietnam')
    );
  }, [filteredTokens]);

  // Get other popular tokens
  const otherTokens = useMemo(() => {
    return filteredTokens.filter((token: ChainToken) => 
      !token.tokenSymbol.includes('VN') && !token.tokenName.toLowerCase().includes('vietnam')
    );
  }, [filteredTokens]);

  const selectedToken = availableTokens.find((token: ChainToken) => token.tokenSymbol === value);

  const selectToken = (token: ChainToken) => {
    onChange(token.tokenSymbol);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-14 justify-between border-pink-200 hover:bg-pink-50"
        >
          {selectedToken ? (
            <div className="flex items-center space-x-3">
              <img 
                src={selectedToken.icon} 
                alt={selectedToken.tokenSymbol}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="text-left">
                <div className="font-medium">{selectedToken.tokenSymbol}</div>
                <div className="text-sm text-gray-500">{selectedToken.tokenName}</div>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Select Token</span>
          )}
          <span className="text-gray-400">▼</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border border-pink-100 shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="lotus-text-gradient">Select Token</DialogTitle>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-pink-200 focus:border-pink-400"
          />
        </div>

        {/* Vietnamese Tokens Section */}
        {vietnameseTokens.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-3">
              <h3 className="font-medium text-gray-900">Vietnamese Tokens</h3>
              <Badge className="bg-lotus-pink text-white">Recommended</Badge>
            </div>
            <div className="space-y-2">
              {vietnameseTokens.map((token) => (
                <button
                  key={token.tokenSymbol}
                  onClick={() => selectToken(token)}
                  className="w-full flex items-center justify-between p-3 border border-pink-100 rounded-lg hover:border-pink-300 hover:bg-pink-50/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={token.icon} 
                      alt={token.tokenSymbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{token.tokenSymbol}</div>
                      <div className="text-sm text-gray-500">{token.tokenName}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Other Tokens Section */}
        {otherTokens.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Other Tokens</h3>
            <div className="space-y-2">
              {otherTokens.map((token) => (
                <button
                  key={token.tokenSymbol}
                  onClick={() => selectToken(token)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-pink-300 hover:bg-pink-50/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={token.icon} 
                      alt={token.tokenSymbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{token.tokenSymbol}</div>
                      <div className="text-sm text-gray-500">{token.tokenName}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredTokens.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tokens found matching "{searchQuery}"
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TokenSelector;
