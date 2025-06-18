import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface Transaction {
  id: string;
  type: 'bridge' | 'approval' | 'swap-bridge';
  status: 'pending' | 'completed' | 'failed';
  fromToken: string;
  toToken: string;
  fromNetwork: string;
  toNetwork: string;
  amount: string;
  amountFormatted: string;
  timestamp: Date;
  hash?: string;
  estimatedTime?: string;
  recipient?: string;
  fee?: string;
  userAddress: string;
  transactionId?: string; // Bridge-specific transaction ID
  explorerUrl?: string;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
}

type TransactionAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'REMOVE_TRANSACTION'; payload: string };

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
};

const transactionReducer = (state: TransactionState, action: TransactionAction): TransactionState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.id ? { ...tx, ...action.payload.updates } : tx
        ),
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'REMOVE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(tx => tx.id !== action.payload),
      };
    default:
      return state;
  }
};

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  getUserTransactions: (userAddress: string) => Transaction[];
  getTransactionByHash: (hash: string) => Transaction | undefined;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const { address } = useAccount();

  // Load transactions from localStorage on mount
  useEffect(() => {
    const loadTransactions = () => {
      try {
        const stored = localStorage.getItem('lotus-bridge-transactions');
        if (stored) {
          const transactions = JSON.parse(stored).map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
          }));
          dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
        }
      } catch (error) {
        console.error('Failed to load transactions from localStorage:', error);
      }
    };

    loadTransactions();
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('lotus-bridge-transactions', JSON.stringify(state.transactions));
    } catch (error) {
      console.error('Failed to save transactions to localStorage:', error);
    }
  }, [state.transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
  };

  const removeTransaction = (id: string) => {
    dispatch({ type: 'REMOVE_TRANSACTION', payload: id });
  };

  const getUserTransactions = (userAddress: string) => {
    return state.transactions.filter(tx => 
      tx.userAddress.toLowerCase() === userAddress.toLowerCase()
    );
  };

  const getTransactionByHash = (hash: string) => {
    return state.transactions.find(tx => tx.hash === hash);
  };

  const contextValue: TransactionContextType = {
    transactions: state.transactions,
    isLoading: state.isLoading,
    addTransaction,
    updateTransaction,
    removeTransaction,
    getUserTransactions,
    getTransactionByHash,
  };

  return (
    <TransactionContext.Provider value={contextValue}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
