
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletConnection = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 lotus-gradient hover:opacity-90 text-white"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {account.displayBalance || '0.00 ETH'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {account.displayName}
                    </div>
                  </div>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="lotus-gradient hover:opacity-90 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    <span className="hidden sm:inline">Connected</span>
                    <span className="sm:hidden">•••</span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnection;
