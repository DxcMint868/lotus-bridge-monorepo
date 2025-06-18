import { useEffect } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useTransactions } from '@/contexts/TransactionContext';

interface UseTransactionMonitorProps {
  hash?: `0x${string}`;
  transactionId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useTransactionMonitor = ({ 
  hash, 
  transactionId, 
  onSuccess, 
  onError 
}: UseTransactionMonitorProps) => {
  const { updateTransaction, getTransactionByHash } = useTransactions();
  
  const { 
    data: receipt, 
    isLoading, 
    isSuccess, 
    isError, 
    error 
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  useEffect(() => {
    if (!hash) return;

    const transaction = getTransactionByHash(hash);
    if (!transaction) return;

    if (isSuccess && receipt) {
      updateTransaction(transaction.id, {
        status: 'completed',
        hash,
      });
      onSuccess?.();
    } else if (isError && error) {
      updateTransaction(transaction.id, {
        status: 'failed',
        hash,
      });
      onError?.(error);
    }
  }, [hash, isSuccess, isError, receipt, error, updateTransaction, getTransactionByHash, onSuccess, onError]);

  return {
    receipt,
    isLoading,
    isSuccess,
    isError,
    error,
  };
};

export const useTransactionHistory = () => {
  const { transactions, getUserTransactions } = useTransactions();
  
  return {
    allTransactions: transactions,
    getUserTransactions,
  };
};
