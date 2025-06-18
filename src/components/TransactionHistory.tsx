import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
	ExternalLink, 
	Copy, 
	Check, 
	Clock, 
	CheckCircle, 
	XCircle,
	ArrowRightLeft,
	Shield,
	Zap,
	Layers,
	Circle,
	Activity
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { useTransactions, Transaction } from '@/contexts/TransactionContext'
import { useTranslation } from '@/contexts/LanguageContext'

const TransactionHistory = () => {
	const { t } = useTranslation()
	const { address } = useAccount()
	const { getUserTransactions } = useTransactions()
	const [filter, setFilter] = useState<
		'all' | 'pending' | 'completed' | 'failed'
	>('all')
	const [copiedTx, setCopiedTx] = useState<string | null>(null)

	// Get transactions for current user
	const userTransactions = address ? getUserTransactions(address) : []

	const filteredTransactions = userTransactions.filter(
		(tx) => filter === 'all' || tx.status === filter
	)

	const handleCopyTxId = async (txId: string, txHash?: string) => {
		try {
			const textToCopy = txHash || txId
			await navigator.clipboard.writeText(textToCopy)
			setCopiedTx(txId)
			setTimeout(() => setCopiedTx(null), 2000)
		} catch (error) {
			console.error('Failed to copy transaction ID:', error)
		}
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'pending':
				return (
					<Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
						<Clock className="w-3 h-3" />
						{t('transaction.pending')}
					</Badge>
				)
			case 'completed':
				return (
					<Badge className="bg-lotus-green text-white flex items-center gap-1">
						<CheckCircle className="w-3 h-3" />
						{t('transaction.completed')}
					</Badge>
				)
			case 'failed':
				return (
					<Badge className="bg-red-100 text-red-700 flex items-center gap-1">
						<XCircle className="w-3 h-3" />
						{t('transaction.failed')}
					</Badge>
				)
			default:
				return (
					<Badge variant="secondary" className="flex items-center gap-1">
						<Activity className="w-3 h-3" />
						{status}
					</Badge>
				)
		}
	}

	const getNetworkIcon = (network: string) => {
		const networkName = network.toLowerCase()
		
		if (networkName.includes('ethereum') || networkName.includes('sepolia')) {
			return <Layers className="w-5 h-5 text-blue-600" />
		} else if (networkName.includes('bsc')) {
			return <Zap className="w-5 h-5 text-yellow-600" />
		} else if (networkName.includes('polygon')) {
			return <Shield className="w-5 h-5 text-purple-600" />
		} else if (networkName.includes('arbitrum')) {
			return <Circle className="w-5 h-5 text-blue-500" />
		} else if (networkName.includes('base')) {
			return <Circle className="w-5 h-5 text-blue-700" />
		} else {
			return <ArrowRightLeft className="w-5 h-5 text-gray-600" />
		}
	}

	const formatTime = (date: Date) => {
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const minutes = Math.floor(diff / (1000 * 60))
		const hours = Math.floor(diff / (1000 * 60 * 60))
		const days = Math.floor(diff / (1000 * 60 * 60 * 24))

		if (minutes < 1) {
			return t('transaction.justNow')
		} else if (minutes < 60) {
			return t('transaction.minutesAgo', { minutes })
		} else if (hours < 24) {
			return t('transaction.hoursAgo', { hours })
		} else {
			return t('transaction.daysAgo', { days })
		}
	}

	const getExplorerUrl = (transaction: Transaction) => {
		if (!transaction.hash || !transaction.explorerUrl) return null
		return `${transaction.explorerUrl}/tx/${transaction.hash}`
	}

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`
	}

	return (
		<Card className="lotus-card">
			<CardHeader>
				<CardTitle className="lotus-text-gradient">
					{t('transaction.history')}
				</CardTitle>
				<p className="text-sm text-muted-foreground">
					{t('transaction.historyDescription')}
				</p>
			</CardHeader>
			<CardContent>
				<Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
					<TabsList className="grid w-full grid-cols-4 bg-pink-50">
						<TabsTrigger value="all" className="data-[state=active]:bg-white">
							{t('transaction.all')}
						</TabsTrigger>
						<TabsTrigger
							value="pending"
							className="data-[state=active]:bg-white"
						>
							{t('transaction.pending')}
						</TabsTrigger>
						<TabsTrigger
							value="completed"
							className="data-[state=active]:bg-white"
						>
							{t('transaction.completed')}
						</TabsTrigger>
						<TabsTrigger
							value="failed"
							className="data-[state=active]:bg-white"
						>
							{t('transaction.failed')}
						</TabsTrigger>
					</TabsList>

					<TabsContent value={filter} className="mt-6">
						{/* Scrollable container with fixed height */}
						<div className="h-96 overflow-y-auto pr-2 transaction-scroll">
							<div className="space-y-3">
								{!address ? (
									<div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
										<ArrowRightLeft className="w-8 h-8 text-gray-300" />
										{t('transaction.connectWalletToSee')}
									</div>
								) : filteredTransactions.length === 0 ? (
									<div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
										<Activity className="w-8 h-8 text-gray-300" />
										{t('transaction.noTransactions', {
											filter: filter !== 'all' ? t(`transaction.${filter}`) : '',
										})}
									</div>
								) : (
									filteredTransactions.map((transaction) => (
										<div
											key={transaction.id}
											className="p-4 border border-pink-100 rounded-lg hover:border-pink-300 transition-all duration-200 hover:shadow-sm bg-white/50 backdrop-blur-sm"
										>
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center space-x-2">
													{getStatusBadge(transaction.status)}
													<span className="text-sm text-gray-500">
														{formatTime(transaction.timestamp)}
													</span>
													{transaction.type === 'approval' && (
														<Badge variant="outline" className="text-xs flex items-center gap-1">
															<Shield className="w-3 h-3" />
															{t('transaction.approval')}
														</Badge>
													)}
												</div>
												{transaction.status === 'pending' &&
													transaction.estimatedTime && (
														<span className="text-sm text-lotus-pink-light font-medium flex items-center gap-1">
															<Clock className="w-3 h-3" />
															~{transaction.estimatedTime}
														</span>
													)}
											</div>

										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<div className="flex-shrink-0">
													{getNetworkIcon(transaction.fromNetwork)}
												</div>
												<div className="flex-grow">
													<div className="font-medium text-gray-900 flex items-center gap-2">
														<span>{transaction.amountFormatted} {transaction.fromToken}</span>
														{transaction.fee && (
															<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
																{t('transaction.fee')}: {transaction.fee}
															</span>
														)}
													</div>
													<div className="text-sm text-gray-500 capitalize flex items-center gap-1">
														{transaction.type === 'approval' ? (
															<>
																<Shield className="w-3 h-3" />
																{t('transaction.approvalFor', {
																	token: transaction.fromToken,
																})}
															</>
														) : (
															<>
																<ArrowRightLeft className="w-3 h-3" />
																{transaction.fromNetwork} → {transaction.toNetwork}
															</>
														)}
													</div>
													{transaction.recipient &&
														transaction.recipient !==
															transaction.userAddress && (
															<div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
																<ArrowRightLeft className="w-3 h-3" />
																{t('transaction.to')}: {formatAddress(transaction.recipient)}
															</div>
														)}
												</div>
											</div>

											<div className="flex items-center space-x-2">
												{transaction.hash && (
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0 hover:bg-pink-100/50 backdrop-blur-sm transition-all rounded-full"
														onClick={() =>
															handleCopyTxId(transaction.id, transaction.hash)
														}
													>
														{copiedTx === transaction.id ? (
															<Check className="w-4 h-4 text-green-600" />
														) : (
															<Copy className="w-4 h-4 text-gray-500 hover:text-gray-700" />
														)}
													</Button>
												)}
												{getExplorerUrl(transaction) && (
													<Button
														variant="ghost"
														size="sm"
														className="text-lotus-pink-light hover:text-lotus-pink-dark text-xs px-3 h-8 hover:bg-pink-100/50 backdrop-blur-sm transition-all rounded-full"
														onClick={() =>
															window.open(
																getExplorerUrl(transaction)!,
																'_blank'
															)
														}
													>
														<ExternalLink className="w-3 h-3 mr-1" />
														{t('transaction.view')}
													</Button>
												)}
											</div>
										</div>

										{transaction.status === 'pending' && (
											<div className="mt-3">
												<div className="w-full bg-pink-100 rounded-full h-2">
													<div
														className="bg-gradient-to-r from-lotus-pink to-lotus-pink-light h-2 rounded-full animate-pulse transition-all duration-300"
														style={{ width: '65%' }}
													/>
												</div>
											</div>
										)}
									</div>
								))
							)}
						</div>
					</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}

export default TransactionHistory
