
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Transaction {
  id: string;
  type: 'bridge' | 'swap';
  status: 'pending' | 'completed' | 'failed';
  fromToken: string;
  toToken: string;
  fromNetwork: string;
  toNetwork: string;
  amount: string;
  timestamp: Date;
  hash?: string;
  estimatedTime?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'bridge',
    status: 'completed',
    fromToken: 'VNST',
    toToken: 'VNST',
    fromNetwork: 'ethereum',
    toNetwork: 'bsc',
    amount: '1,000.00',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    hash: '0x1234...5678'
  },
  {
    id: '2',
    type: 'bridge',
    status: 'pending',
    fromToken: 'USDT',
    toToken: 'USDT',
    fromNetwork: 'bsc',
    toNetwork: 'polygon',
    amount: '500.00',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    estimatedTime: '5 min'
  },
  {
    id: '3',
    type: 'bridge',
    status: 'completed',
    fromToken: 'VNDC',
    toToken: 'VNDC',
    fromNetwork: 'polygon',
    toNetwork: 'arbitrum',
    amount: '2,500.00',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    hash: '0xabcd...efgh'
  }
];

const TransactionHistory = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  const filteredTransactions = mockTransactions.filter(tx => 
    filter === 'all' || tx.status === filter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-lotus-green text-white">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getNetworkIcon = (network: string) => {
    const icons: { [key: string]: string } = {
      ethereum: 'Ξ',
      bsc: '⚡',
      polygon: '🔷',
      arbitrum: '🔵',
      base: '🔷'
    };
    return icons[network] || '🔗';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return `${hours}h ago`;
    }
  };

  return (
    <Card className="lotus-card">
      <CardHeader>
        <CardTitle className="lotus-text-gradient">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
          <TabsList className="grid w-full grid-cols-4 bg-pink-50">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">All</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white">Pending</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white">Done</TabsTrigger>
            <TabsTrigger value="failed" className="data-[state=active]:bg-white">Failed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="mt-6">
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {filter !== 'all' ? filter : ''} transactions found
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 border border-pink-100 rounded-lg hover:border-pink-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(transaction.status)}
                        <span className="text-sm text-gray-500">
                          {formatTime(transaction.timestamp)}
                        </span>
                      </div>
                      {transaction.status === 'pending' && transaction.estimatedTime && (
                        <span className="text-sm text-lotus-pink font-medium">
                          ~{transaction.estimatedTime}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getNetworkIcon(transaction.fromNetwork)}</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.amount} {transaction.fromToken}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {transaction.fromNetwork} → {transaction.toNetwork}
                          </div>
                        </div>
                      </div>
                      
                      {transaction.hash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-lotus-pink hover:text-lotus-pink-dark"
                          onClick={() => window.open(`https://etherscan.io/tx/${transaction.hash}`, '_blank')}
                        >
                          View
                        </Button>
                      )}
                    </div>
                    
                    {transaction.status === 'pending' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-lotus-pink h-1.5 rounded-full animate-pulse" style={{ width: '65%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
