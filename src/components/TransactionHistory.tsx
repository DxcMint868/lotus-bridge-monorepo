import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink, Copy, Check } from 'lucide-react'
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
					<Badge className="bg-yellow-100 text-yellow-700">
						{t('transaction.pending')}
					</Badge>
				)
			case 'completed':
				return (
					<Badge className="bg-lotus-green text-white">
						{t('transaction.completed')}
					</Badge>
				)
			case 'failed':
				return (
					<Badge className="bg-red-100 text-red-700">
						{t('transaction.failed')}
					</Badge>
				)
			default:
				return <Badge variant="secondary">{status}</Badge>
		}
	}

	const getNetworkIcon = (network: string) => {
		const icons: { [key: string]: string } = {
			ethereum: 'Ξ',
			'ethereum sepolia': 'Ξ',
			sepolia: 'Ξ',
			bsc: '⚡',
			'bsc testnet': '⚡',
			polygon: '🔷',
			arbitrum: '🔵',
			base: '🔷',
			'base sepolia': '🔷',
		}
		return icons[network.toLowerCase()] || '🔗'
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
						<div className="space-y-4">
							{!address ? (
								<div className="text-center py-8 text-gray-500">
									{t('transaction.connectWalletToSee')}
								</div>
							) : filteredTransactions.length === 0 ? (
								<div className="text-center py-8 text-gray-500">
									{t('transaction.noTransactions', {
										filter: filter !== 'all' ? t(`transaction.${filter}`) : '',
									})}
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
												{transaction.type === 'approval' && (
													<Badge variant="outline" className="text-xs">
														{t('transaction.approval')}
													</Badge>
												)}
											</div>
											{transaction.status === 'pending' &&
												transaction.estimatedTime && (
													<span className="text-sm text-lotus-pink-light font-medium">
														~{transaction.estimatedTime}
													</span>
												)}
										</div>

										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<span className="text-lg">
													{getNetworkIcon(transaction.fromNetwork)}
												</span>
												<div>
													<div className="font-medium text-gray-900">
														{transaction.amountFormatted}{' '}
														{transaction.fromToken}
														{transaction.fee && (
															<span className="text-xs text-gray-500 ml-2">
																({t('transaction.fee')}: {transaction.fee})
															</span>
														)}
													</div>
													<div className="text-sm text-gray-500 capitalize">
														{transaction.type === 'approval'
															? t('transaction.approvalFor', {
																	token: transaction.fromToken,
															  })
															: `${transaction.fromNetwork} → ${transaction.toNetwork}`}
													</div>
													{transaction.recipient &&
														transaction.recipient !==
															transaction.userAddress && (
															<div className="text-xs text-gray-400">
																{t('transaction.to')}:{' '}
																{formatAddress(transaction.recipient)}
															</div>
														)}
												</div>
											</div>

											<div className="flex items-center space-x-2">
												{transaction.hash && (
													<Button
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0 hover:bg-white/20 backdrop-blur-sm transition-all"
														onClick={() =>
															handleCopyTxId(transaction.id, transaction.hash)
														}
													>
														{copiedTx === transaction.id ? (
															<Check className="w-3 h-3 text-green-600" />
														) : (
															<Copy className="w-3 h-3 text-gray-400" />
														)}
													</Button>
												)}
												{getExplorerUrl(transaction) && (
													<Button
														variant="ghost"
														size="sm"
														className="text-lotus-pink-light hover:text-lotus-pink-dark text-xs px-2 h-7 hover:bg-white/20 backdrop-blur-sm transition-all"
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
												<div className="w-full bg-gray-200 rounded-full h-1.5">
													<div
														className="bg-lotus-pink h-1.5 rounded-full animate-pulse"
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
	)
}

export default TransactionHistory
