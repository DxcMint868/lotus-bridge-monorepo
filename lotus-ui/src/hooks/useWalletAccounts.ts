import { useEffect, useState } from 'react';
import { useAccount, useConnections, useConnectors } from 'wagmi';

interface WalletAccount {
  address: string;
  isConnected: boolean;
}

export const useWalletAccounts = () => {
  const { address: currentAddress, isConnected } = useAccount();
  const connections = useConnections();
  const connectors = useConnectors();
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!isConnected) {
        setAccounts([]);
        return;
      }

      setIsLoading(true);
      try {
        const allAccounts: WalletAccount[] = [];

        // Method 1: Get accounts from active connections
        if (connections && connections.length > 0) {
          for (const connection of connections) {
            if (connection.connector && connection.accounts) {
              for (const accountAddress of connection.accounts) {
                // Avoid duplicates
                if (!allAccounts.find(acc => acc.address.toLowerCase() === accountAddress.toLowerCase())) {
                  allAccounts.push({
                    address: accountAddress,
                    isConnected: accountAddress.toLowerCase() === currentAddress?.toLowerCase(),
                  });
                }
              }
            }
          }
        }

        // Method 2: Try to get accounts from connectors directly
        for (const connector of connectors) {
          if (connector.getAccounts) {
            try {
              const connectorAccounts = await connector.getAccounts();
              for (const accountAddress of connectorAccounts) {
                // Avoid duplicates
                if (!allAccounts.find(acc => acc.address.toLowerCase() === accountAddress.toLowerCase())) {
                  allAccounts.push({
                    address: accountAddress,
                    isConnected: accountAddress.toLowerCase() === currentAddress?.toLowerCase(),
                  });
                }
              }
            } catch (error) {
              // Silently ignore errors from individual connectors
              console.debug('Could not get accounts from connector:', connector.name, error);
            }
          }
        }

        // Fallback: If we have a current address but it's not in the list, add it
        if (currentAddress && !allAccounts.find(acc => acc.address.toLowerCase() === currentAddress.toLowerCase())) {
          allAccounts.unshift({
            address: currentAddress,
            isConnected: true,
          });
        }

        // Sort accounts to put connected account first
        allAccounts.sort((a, b) => {
          if (a.isConnected && !b.isConnected) return -1;
          if (!a.isConnected && b.isConnected) return 1;
          return 0;
        });

        setAccounts(allAccounts);
      } catch (error) {
        console.error('Error fetching wallet accounts:', error);
        // Fallback to current address if available
        if (currentAddress) {
          setAccounts([{
            address: currentAddress,
            isConnected: true,
          }]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [isConnected, currentAddress, connections, connectors]);

  return {
    accounts,
    isLoading,
    currentAddress,
  };
};
