import { useAccount, useChainId, useBalance, useSwitchChain } from 'wagmi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/contexts/LanguageContext'
import { Wallet, Copy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const WalletStatus = () => {
	const { t } = useTranslation()
	const { address, isConnected, isConnecting } = useAccount()
	const chainId = useChainId()
	const { switchChain, chains } = useSwitchChain()
	const [copied, setCopied] = useState(false)

	const {
		data: balance,
		isLoading: isBalanceLoading,
		refetch,
	} = useBalance({
		address: address,
	})

	if (!isConnected) {
		return (
			<Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-lg">
				<CardContent className="p-6">
					<div className="flex flex-col items-center space-y-4">
						<div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
							<Wallet className="w-6 h-6 text-gray-400" />
						</div>
						<div className="text-center">
							<h3 className="font-semibold text-gray-900 mb-1">
								{t('wallet.status')}
							</h3>
							<p className="text-sm text-gray-500">
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
			1: 'Ethereum',
			137: 'Polygon',
			10: 'Optimism',
			42161: 'Arbitrum',
			8453: 'Base',
			11155111: 'Sepolia',
			84532: 'Base Sepolia',
		}
		return chainNames[id] || `Chain ${id}`
	}

	const copyAddress = async () => {
		if (address) {
			await navigator.clipboard.writeText(address)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	return (
		<Card className="backdrop-blur-md bg-white/80 border-white/20 shadow-lg">
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
							<Wallet className="w-5 h-5 text-green-600" />
						</div>
						<div>
							<h3 className="font-semibold text-gray-900">
								{t('wallet.status')}
							</h3>
							<p className="text-sm text-gray-500">
								{isConnecting ? t('wallet.connecting') : t('wallet.connected')}
							</p>
						</div>
					</div>
					<Badge className="bg-green-100 text-green-700 border-green-200">
						{getChainName(chainId)}
					</Badge>
				</div>

				<div className="space-y-4">
					{/* Address */}
					<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<div>
							<p className="text-xs font-medium text-gray-500 mb-1">
								{t('wallet.address')}
							</p>
							<p className="font-mono text-sm text-gray-900">
								{formatAddress(address!)}
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={copyAddress}
							className="h-8 w-8 p-0"
						>
							<Copy className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-gray-400'}`} />
						</Button>
					</div>

					{/* Balance */}
					<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
						<div className="flex-1">
							<p className="text-xs font-medium text-gray-500 mb-1">
								{t('wallet.balance')}
							</p>
							<p className="font-semibold text-gray-900">
								{isBalanceLoading ? (
									<span className="text-gray-400">Loading...</span>
								) : (
									`${balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} ${balance?.symbol || 'ETH'}`
								)}
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => refetch()}
							className="h-8 w-8 p-0"
							disabled={isBalanceLoading}
						>
							<RefreshCw className={`w-4 h-4 text-gray-400 ${isBalanceLoading ? 'animate-spin' : ''}`} />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default WalletStatus
