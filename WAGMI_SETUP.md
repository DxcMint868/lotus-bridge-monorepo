# Wagmi + RainbowKit Integration Setup

This guide explains how wagmi and RainbowKit have been integrated into the Lotus Bridge application.

## 🚀 Quick Start

1. **Get a WalletConnect Project ID**
   - Visit [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
   - Create a new project
   - Copy your Project ID

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your project ID:
   ```
   VITE_WALLET_CONNECT_PROJECT_ID=your_actual_project_id_here
   ```

3. **Install Dependencies** (Already done)
   ```bash
   pnpm install
   ```

4. **Run the Application**
   ```bash
   pnpm dev
   ```

## 🔧 What's Been Implemented

### Core Configuration

- **`src/config/wagmi.ts`** - Main wagmi configuration with supported chains
- **`src/main.tsx`** - RainbowKit providers setup with custom theme
- **`src/hooks/useWallet.ts`** - Custom hook for wallet functionality

### Components

- **`src/components/WalletConnection.tsx`** - Updated to use RainbowKit ConnectButton
- **`src/components/WalletInfo.tsx`** - Example component showing wallet data
- **`src/components/WagmiTestComponent.tsx`** - Demo component with various wagmi hooks

### Supported Networks

- Ethereum Mainnet
- Polygon
- Optimism
- Arbitrum One
- Base
- Sepolia (development only)

## 🎨 Custom Styling

The RainbowKit interface has been customized to match the Lotus Bridge design:
- Custom pink gradient theme
- Lotus-inspired color palette
- Consistent border radius and styling

## 📦 Key Features

### Wallet Connection
```tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Use the default button
<ConnectButton />

// Or use our custom styled version
<WalletConnection />
```

### Account Information
```tsx
import { useAccount, useBalance } from 'wagmi';

const { address, isConnected } = useAccount();
const { data: balance } = useBalance({ address });
```

### Network Switching
```tsx
import { useSwitchChain, useChainId } from 'wagmi';

const { switchChain, chains } = useSwitchChain();
const chainId = useChainId();
```

### Custom Hook
```tsx
import { useWallet } from '@/hooks/useWallet';

const { 
  address, 
  isConnected, 
  balance, 
  formatAddress, 
  formatBalance 
} = useWallet();
```

## 🛠️ Development Notes

### Environment Variables
- `VITE_WALLET_CONNECT_PROJECT_ID` - Required for WalletConnect functionality
- Uses Vite's environment variable system (`import.meta.env`)

### TypeScript Support
- Full TypeScript support with proper types for all wagmi hooks
- Environment variable types defined in `src/vite-env.d.ts`

### Error Handling
- Graceful fallbacks when wallet is not connected
- Network unsupported state handling
- Loading states for async operations

## 🔗 Useful Links

- [wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://rainbowkit.com)
- [WalletConnect Cloud](https://cloud.walletconnect.com)
- [Viem Documentation](https://viem.sh)

## 🎯 Next Steps

1. Set up your WalletConnect Project ID
2. Test wallet connections with different wallets
3. Test network switching functionality
4. Integrate real bridge transactions using wagmi hooks
5. Add transaction signing and contract interactions

## 🚨 Important Notes

- Make sure to keep your Project ID secure and never commit it to version control
- Test thoroughly on different networks before production deployment
- Consider implementing additional error boundaries for wallet operations
