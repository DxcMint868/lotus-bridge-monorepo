import { useAccount, useChainId, useBalance, useSwitchChain } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/contexts/LanguageContext'
import { Wallet } from 'lucide-react'

const WalletStatus = () => {
	const { t } = useTranslation()
	const { address, isConnected, isConnecting } = useAccount()
	const chainId = useChainId()
	const { switchChain, chains } = useSwitchChain()

	const {
		data: balance,
		isLoading: isBalanceLoading,
		refetch,
	} = useBalance({
		address: address,
	})

	if (!isConnected) {
		return (
			<Card className="w-full lotus-card h-fit">
				<CardContent className="pt-6">
					<div className="text-center space-y-3">
						<div>
							<h3 className="font-medium text-gray-900 mb-2">
								{t('wallet.status')}
							</h3>
							<p className="text-sm text-muted-foreground">
								{t('wallet.connectToSeeInfo')}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	const formatAddress = (addr: string) => {
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`
	}

	const getChainName = (id: number) => {
		const chainNames: Record<number, string> = {
			1: 'Ethereum Mainnet',
			137: 'Polygon',
			10: 'Optimism',
			42161: 'Arbitrum One',
			8453: 'Base',
			11155111: 'Sepolia Testnet',
		}
		return chainNames[id] || `Chain ${id}`
	}

	return (
		<Card className="w-full lotus-card h-fit">
			<CardHeader className="pb-4">
				<Wallet size={15} />
				<CardTitle className="text-center lotus-text-gradient flex items-center justify-center gap-2 text-lg">
					{t('wallet.status')}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-xs font-medium text-muted-foreground">
							{t('wallet.connectionStatus')}:
						</span>
						<Badge
							variant="default"
							className="bg-green-100 text-green-700 text-xs"
						>
							{isConnecting ? t('wallet.connecting') : t('wallet.connected')}
						</Badge>
					</div>

					<div className="space-y-1">
						<span className="text-xs font-medium text-muted-foreground">
							{t('wallet.address')}:
						</span>
						<div className="text-xs font-mono bg-gray-50 p-2 rounded border">
							{formatAddress(address!)}
						</div>
					</div>

					<div className="flex justify-between items-center">
						<span className="text-xs font-medium text-muted-foreground">
							{t('wallet.network')}:
						</span>
						<Badge
							variant="secondary"
							className="bg-pink-100 text-pink-700 text-xs"
						>
							{getChainName(chainId)}
						</Badge>
					</div>

					<div className="space-y-1">
						<span className="text-xs font-medium text-muted-foreground">
							{t('wallet.balance')}:
						</span>
						<div className="text-xs font-semibold bg-gray-50 p-2 rounded border">
							{isBalanceLoading ? (
								<span className="text-muted-foreground">
									{t('bridge.loading')}...
								</span>
							) : (
								<span>
									{balance
										? `${parseFloat(balance.formatted).toFixed(4)} ${
												balance.symbol
										  }`
										: '0.00 ETH'}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* <Separator /> */}

				{/* <div className="space-y-2">
					<div className="flex justify-between items-center text-xs text-muted-foreground">
						<span>Chain ID:</span>
						<span>{chainId}</span>
					</div>
				</div>

				<Button
					onClick={() => refetch()}
					variant="outline"
					size="sm"
					className="w-full text-xs"
				>
					{t('wallet.refreshBalance')}
				</Button> */}

				{/* Network Switching */}
				{/* <div className="space-y-2">
					<h4 className="text-xs font-medium">{t('wallet.switchNetwork')}:</h4>
					<div className="grid grid-cols-1 gap-1">
						{chains.slice(0, 4).map((chain) => (
							<Button
								key={chain.id}
								onClick={() => switchChain({ chainId: chain.id })}
								variant={chainId === chain.id ? 'default' : 'outline'}
								size="sm"
								className="text-xs h-8 justify-start"
								disabled={chainId === chain.id}
							>
								{chain.name}
							</Button>
						))}
					</div>
				</div> */}
			</CardContent>
		</Card>
	)
}

export default WalletStatus
