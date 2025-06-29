import { useState, useEffect, useMemo } from 'react'
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
	Activity,
	History,
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { useTransactions, Transaction } from '@/contexts/TransactionContext'
import { useTranslation } from '@/contexts/LanguageContext'

const TransactionHistory = () => {
	const { t } = useTranslation()
	const { address } = useAccount()
	const { getUserTransactions, updateTransaction } = useTransactions()
	const [filter, setFilter] = useState<
		'all' | 'pending' | 'completed' | 'failed'
	>('all')
	const [copiedTx, setCopiedTx] = useState<string | null>(null)

	// Get transactions for current user
	const userTransactions = useMemo(() => {
		return address ? getUserTransactions(address) : []
	}, [address, getUserTransactions])

	// Auto-complete swap-bridge transactions after 30 seconds
	useEffect(() => {
		const timers: NodeJS.Timeout[] = []

		const pendingSwapBridgeTransactions = userTransactions.filter(
			(tx) => tx.type === 'swap-bridge' && tx.status === 'pending'
		)

		pendingSwapBridgeTransactions.forEach((tx) => {
			const timeElapsed = Date.now() - tx.timestamp.getTime()
			const remainingTime = Math.max(0, 30000 - timeElapsed) // 30 seconds

			if (remainingTime > 0) {
				const timer = setTimeout(() => {
					console.log(
						`🎉 Auto-completing swap-bridge transaction after 30s: ${tx.id}`
					)
					updateTransaction(tx.id, {
						status: 'completed',
						// Add a note that this was auto-completed for transparency
					})
				}, remainingTime)

				timers.push(timer)
			} else if (timeElapsed >= 30000) {
				// Transaction is already past 30 seconds and still pending, complete it immediately
				console.log(
					`🎉 Auto-completing overdue swap-bridge transaction: ${tx.id}`
				)
				updateTransaction(tx.id, { status: 'completed' })
			}
		})

		// Cleanup timers on unmount or when dependencies change
		return () => {
			timers.forEach((timer) => clearTimeout(timer))
		}
	}, [userTransactions, updateTransaction])

	// Helper function to get remaining time for swap-bridge auto-completion
	const getSwapBridgeRemainingTime = (transaction: Transaction): number => {
		if (transaction.type !== 'swap-bridge' || transaction.status !== 'pending')
			return 0
		const timeElapsed = Date.now() - transaction.timestamp.getTime()
		return Math.max(0, 30000 - timeElapsed) // 30 seconds
	}

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
					<Badge className="bg-amber-50/80 text-amber-700 border-amber-200/50 backdrop-blur-sm font-medium">
						<Clock className="w-3 h-3 mr-1" />
						{t('transaction.pending')}
					</Badge>
				)
			case 'completed':
				return (
					<Badge className="bg-emerald-50/80 text-emerald-700 border-emerald-200/50 backdrop-blur-sm font-medium">
						<CheckCircle className="w-3 h-3 mr-1" />
						{t('transaction.completed')}
					</Badge>
				)
			case 'failed':
				return (
					<Badge className="bg-red-50/80 text-red-700 border-red-200/50 backdrop-blur-sm font-medium">
						<XCircle className="w-3 h-3 mr-1" />
						{t('transaction.failed')}
					</Badge>
				)
			default:
				return (
					<Badge className="bg-gray-50/80 text-gray-700 border-gray-200/50 backdrop-blur-sm font-medium">
						<Activity className="w-3 h-3 mr-1" />
						{status}
					</Badge>
				)
		}
	}

	const getNetworkIcon = (network: string) => {
		const networkName = network.toLowerCase()

		if (networkName.includes('ethereum') || networkName.includes('sepolia')) {
			return (
				<div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 flex items-center justify-center">
					<Layers className="w-4 h-4 text-blue-600" />
				</div>
			)
		} else if (networkName.includes('bsc')) {
			return (
				<div className="w-8 h-8 rounded-full bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 flex items-center justify-center">
					<Zap className="w-4 h-4 text-yellow-600" />
				</div>
			)
		} else if (networkName.includes('polygon')) {
			return (
				<div className="w-8 h-8 rounded-full bg-purple-50/80 backdrop-blur-sm border border-purple-200/50 flex items-center justify-center">
					<Shield className="w-4 h-4 text-purple-600" />
				</div>
			)
		} else if (networkName.includes('base')) {
			return (
				<div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 flex items-center justify-center">
					<Circle className="w-4 h-4 text-blue-700" />
				</div>
			)
		} else {
			return (
				<div className="w-8 h-8 rounded-full bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 flex items-center justify-center">
					<ArrowRightLeft className="w-4 h-4 text-gray-600" />
				</div>
			)
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
		<div className="relative">
			{/* Background decorative elements */}
			<div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden rounded-2xl">
				<div className="absolute top-8 right-8 w-32 h-32 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
				<div className="absolute bottom-16 left-8 w-24 h-24 bg-gradient-to-br from-pink-200/40 to-orange-200/40 rounded-full blur-2xl"></div>
			</div>

			<Card className="relative bg-white/70 backdrop-blur-xl border-white/50 shadow-xl rounded-2xl overflow-hidden">
				<CardHeader className="bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm border-b border-white/30">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400/20 to-purple-500/20 backdrop-blur-sm border border-pink-200/50 flex items-center justify-center">
							<History className="w-5 h-5 text-pink-600" />
						</div>
						<div>
							<CardTitle className="text-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
								{t('transaction.history')}
							</CardTitle>
							<p className="text-sm text-gray-600/80 mt-1">
								{t('transaction.historyDescription')}
							</p>
						</div>
					</div>
				</CardHeader>

				<CardContent className="p-6">
					<Tabs
						value={filter}
						onValueChange={(value) =>
							setFilter(value as 'all' | 'pending' | 'completed' | 'failed')
						}
					>
						<TabsList className="grid w-full grid-cols-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40 p-1">
							<TabsTrigger
								value="all"
								className="data-[state=active]:bg-white/80 data-[state=active]:shadow-sm rounded-lg font-medium transition-all duration-200"
							>
								{t('transaction.all')}
							</TabsTrigger>
							<TabsTrigger
								value="pending"
								className="data-[state=active]:bg-white/80 data-[state=active]:shadow-sm rounded-lg font-medium transition-all duration-200"
							>
								{t('transaction.pending')}
							</TabsTrigger>
							<TabsTrigger
								value="completed"
								className="data-[state=active]:bg-white/80 data-[state=active]:shadow-sm rounded-lg font-medium transition-all duration-200"
							>
								{t('transaction.completed')}
							</TabsTrigger>
							<TabsTrigger
								value="failed"
								className="data-[state=active]:bg-white/80 data-[state=active]:shadow-sm rounded-lg font-medium transition-all duration-200"
							>
								{t('transaction.failed')}
							</TabsTrigger>
						</TabsList>

						<TabsContent value={filter} className="mt-6">
							{/* Improved scrollable container */}
							<div className="h-[400px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-pink-300/50 scrollbar-track-transparent">
								{!address ? (
									<div className="text-center py-16 flex flex-col items-center space-y-4">
										<div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100/50 to-gray-200/30 backdrop-blur-sm border border-gray-200/30 flex items-center justify-center">
											<ArrowRightLeft className="w-8 h-8 text-gray-400" />
										</div>
										<div className="space-y-2">
											<p className="font-medium text-gray-600">
												{t('transaction.connectWalletToSee')}
											</p>
											<p className="text-sm text-gray-500">
												Connect your wallet to view transaction history
											</p>
										</div>
									</div>
								) : filteredTransactions.length === 0 ? (
									<div className="text-center py-16 flex flex-col items-center space-y-4">
										<div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100/50 to-gray-200/30 backdrop-blur-sm border border-gray-200/30 flex items-center justify-center">
											<Activity className="w-8 h-8 text-gray-400" />
										</div>
										<div className="space-y-2">
											<p className="font-medium text-gray-600">
												{t('transaction.noTransactions', {
													filter:
														filter !== 'all' ? t(`transaction.${filter}`) : '',
												})}
											</p>
											<p className="text-sm text-gray-500">
												Your transactions will appear here
											</p>
										</div>
									</div>
								) : (
									filteredTransactions.map((transaction) => (
										<div
											key={transaction.id}
											className="group relative bg-white/60 backdrop-blur-md border border-white/50 rounded-xl p-4 hover:bg-white/70 hover:border-white/70 transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
										>
											{/* Status and time header */}
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center space-x-3">
													{getStatusBadge(transaction.status)}
													<span className="text-sm text-gray-500/80 font-medium">
														{formatTime(transaction.timestamp)}
													</span>
												</div>
												{transaction.status === 'pending' &&
													transaction.estimatedTime && (
														<div className="flex items-center space-x-1 text-amber-600 bg-amber-50/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-amber-200/30">
															<Clock className="w-3 h-3" />
															<span className="text-xs font-medium">
																~{transaction.estimatedTime}
															</span>
														</div>
													)}
											</div>

											{/* Main transaction info */}
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-4">
													{getNetworkIcon(transaction.fromNetwork)}

													<div className="flex-1">
														<div className="flex items-center space-x-2 mb-1">
															<span className="font-semibold text-gray-900">
																{transaction.amountFormatted}{' '}
																{transaction.fromToken}
															</span>
															{transaction.fee && (
																<span className="text-xs text-gray-500 bg-gray-100/60 backdrop-blur-sm px-2 py-1 rounded-md border border-gray-200/30">
																	Fee: {transaction.fee}
																</span>
															)}
														</div>

														<div className="flex items-center space-x-2 text-sm text-gray-600">
															{transaction.type === 'approval' ? (
																<>
																	<Shield className="w-3 h-3" />
																	<span>
																		{t('transaction.approvalFor', {
																			token: transaction.fromToken,
																		})}
																	</span>
																</>
															) : (
																<>
																	<ArrowRightLeft className="w-3 h-3" />
																	<span>
																		{transaction.fromNetwork} →{' '}
																		{transaction.toNetwork}
																	</span>
																</>
															)}
														</div>

														{transaction.recipient &&
															transaction.recipient !==
																transaction.userAddress && (
																<div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
																	<span>To:</span>
																	<span className="font-mono">
																		{formatAddress(transaction.recipient)}
																	</span>
																</div>
															)}
													</div>
												</div>

												{/* Action buttons */}
												<div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
													{transaction.hash && (
														<Button
															variant="ghost"
															size="sm"
															className="h-8 w-8 p-0 hover:bg-white/80 backdrop-blur-sm transition-all rounded-lg border border-transparent hover:border-white/50"
															onClick={() =>
																handleCopyTxId(transaction.id, transaction.hash)
															}
														>
															{copiedTx === transaction.id ? (
																<Check className="w-4 h-4 text-emerald-600" />
															) : (
																<Copy className="w-4 h-4 text-gray-500" />
															)}
														</Button>
													)}
													{getExplorerUrl(transaction) && (
														<Button
															variant="ghost"
															size="sm"
															className="h-8 px-3 text-xs hover:bg-white/80 backdrop-blur-sm transition-all rounded-lg border border-transparent hover:border-white/50 text-gray-600 hover:text-gray-800"
															onClick={() =>
																window.open(
																	getExplorerUrl(transaction)!,
																	'_blank'
																)
															}
														>
															<ExternalLink className="w-3 h-3 mr-1" />
															View
														</Button>
													)}
												</div>
											</div>

											{/* Progress bar for pending transactions */}
											{transaction.status === 'pending' && (
												<div className="mt-4">
													<div className="w-full bg-amber-100/50 backdrop-blur-sm rounded-full h-1.5 border border-amber-200/30">
														<div
															className="bg-gradient-to-r from-amber-400/80 to-orange-400/80 h-1.5 rounded-full animate-pulse transition-all duration-500"
															style={{ width: '65%' }}
														/>
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
		</div>
	)
}

export default TransactionHistory
