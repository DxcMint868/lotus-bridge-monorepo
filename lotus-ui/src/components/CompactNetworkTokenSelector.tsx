import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Search, ChevronDown, MoreHorizontal } from 'lucide-react'
import {
	getChainByKey,
	getChainEntries,
	getTokensForChain,
	getNativeToken,
	ChainToken,
} from '@/lib/chains'
import { useTranslation } from '@/contexts/LanguageContext'

interface CompactNetworkTokenSelectorProps {
	networkValue: string
	tokenValue: string
	onNetworkChange: (network: string) => void
	onTokenChange: (token: string) => void
	label: string
	excludeChain?: string
	excludeTokens?: string[]
}

const CompactNetworkTokenSelector: React.FC<
	CompactNetworkTokenSelectorProps
> = ({
	networkValue,
	tokenValue,
	onNetworkChange,
	onTokenChange,
	label,
	excludeChain,
	excludeTokens = [],
}) => {
	const { t } = useTranslation()
	const [isOpen, setIsOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [showAllNetworks, setShowAllNetworks] = useState(false)

	// Get current chain and token data
	const selectedChain = useMemo(
		() => getChainByKey(networkValue),
		[networkValue]
	)
	const selectedToken = useMemo(() => {
		if (!selectedChain) return null
		const tokens = getTokensForChain(selectedChain.chainId)
		const nativeToken = getNativeToken(selectedChain.chainId)
		const allTokens = nativeToken ? [nativeToken, ...tokens] : tokens
		return allTokens.find((token) => token.tokenSymbol === tokenValue)
	}, [selectedChain, tokenValue])

	// Get available networks
	const availableNetworks = useMemo(() => {
		return getChainEntries()
			.filter(([chainKey]) => chainKey !== excludeChain)
			.map(([chainKey, chain]) => {
				const nativeToken = getNativeToken(chain.chainId)
				return {
					chainKey,
					...chain,
					nativeCurrency: nativeToken
						? {
								symbol: nativeToken.tokenSymbol,
								name: nativeToken.tokenName,
								decimals: 18,
						  }
						: {
								symbol: 'ETH',
								name: 'Ether',
								decimals: 18,
						  },
				}
			})
	}, [excludeChain])

	// Get available tokens for current network
	const availableTokens = useMemo(() => {
		if (!selectedChain) return []
		const tokens = getTokensForChain(selectedChain.chainId)
		const nativeToken = getNativeToken(selectedChain.chainId)
		const allTokens = nativeToken ? [nativeToken, ...tokens] : tokens
		return allTokens.filter(
			(token) => !excludeTokens.includes(token.tokenSymbol)
		)
	}, [selectedChain, excludeTokens])

	// Filter tokens based on search
	const filteredTokens = useMemo(() => {
		if (!searchQuery.trim()) return availableTokens
		return availableTokens.filter(
			(token) =>
				token.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
				token.tokenName.toLowerCase().includes(searchQuery.toLowerCase())
		)
	}, [availableTokens, searchQuery])

	// Vietnamese tokens for priority display
	const vietnameseTokens = useMemo(() => {
		const vietSymbols = [
			'AXS',
			'SLP',
			'VNST',
			'VNDC',
			'A8',
			'SIPHER',
			'C98',
			'KNC',
			'KAI',
		]
		return filteredTokens.filter(
			(token) =>
				token.tokenSymbol.includes('VN') ||
				vietSymbols.includes(token.tokenSymbol)
		)
	}, [filteredTokens])

	const otherTokens = useMemo(() => {
		return filteredTokens.filter((token) => !vietnameseTokens.includes(token))
	}, [filteredTokens, vietnameseTokens])

	// Networks to show in grid (first 8 or all if showAllNetworks is true)
	const displayedNetworks = useMemo(() => {
		return showAllNetworks ? availableNetworks : availableNetworks.slice(0, 8)
	}, [availableNetworks, showAllNetworks])

	const hasMoreNetworks = availableNetworks.length > 8

	const selectNetwork = (chainKey: string) => {
		onNetworkChange(chainKey)
		// Don't close dialog, let user select token next
	}

	const selectToken = (token: ChainToken) => {
		onTokenChange(token.tokenSymbol)
		setIsOpen(false)
		setSearchQuery('')
		setShowAllNetworks(false)
	}

	const handleDialogOpen = (open: boolean) => {
		setIsOpen(open)
		if (!open) {
			setSearchQuery('')
			setShowAllNetworks(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleDialogOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="w-full h-16 p-4 justify-between bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-pink-300 hover:bg-white/90 transition-all duration-200 rounded-xl"
				>
					<div className="flex items-center space-x-3">
						{/* Network Icon */}
						{selectedChain && (
							<img
								src={selectedChain.chainIcon}
								alt={selectedChain.chainName}
								className="w-8 h-8 rounded-full"
								onError={(e) => {
									;(e.target as HTMLImageElement).src = '/placeholder.svg'
								}}
							/>
						)}

						{/* Token Icon and Info */}
						{selectedToken && (
							<img
								src={selectedToken.icon}
								alt={selectedToken.tokenSymbol}
								className="w-6 h-6 rounded-full"
								onError={(e) => {
									;(e.target as HTMLImageElement).src = '/placeholder.svg'
								}}
							/>
						)}

						<div className="text-left">
							<div className="flex items-center space-x-2">
								<span className="font-semibold text-gray-900">
									{selectedToken?.tokenSymbol || 'Select Token'}
								</span>
								<span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
									{selectedChain?.chainName || 'Network'}
								</span>
							</div>
							<div className="text-sm text-gray-500">
								{selectedToken?.tokenName || 'Choose network and token'}
							</div>
						</div>
					</div>
					<ChevronDown className="h-4 w-4 text-gray-400" />
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[85vh] bg-white/95 backdrop-blur-md border border-white/50 shadow-xl rounded-xl">
				<DialogHeader>
					<DialogTitle className="lotus-text-gradient text-xl font-semibold">
						{label}
					</DialogTitle>
				</DialogHeader>

				{/* Networks Grid Section */}
				<div className="space-y-4">
					<h3 className="text-sm font-medium text-gray-700">Select Network</h3>

					{/* Networks Grid */}
					<div className="grid grid-cols-4 gap-3">
						{displayedNetworks.map((network) => (
							<button
								key={network.chainKey}
								onClick={() => selectNetwork(network.chainKey)}
								className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
									networkValue === network.chainKey
										? 'bg-blue-50 border-blue-300 shadow-sm'
										: 'bg-white/50 border-gray-200 hover:border-pink-300 hover:bg-white/80'
								}`}
							>
								<img
									src={network.chainIcon}
									alt={network.chainName}
									width="40"
									height="40"
									className="w-10 h-10 rounded-full mb-2"
									onError={(e) => {
										;(e.target as HTMLImageElement).src = '/placeholder.svg'
									}}
								/>
								<span className="text-xs text-center font-medium text-gray-900 truncate w-full">
									{network.chainName}
								</span>
							</button>
						))}
					</div>

					{/* View More Button */}
					{hasMoreNetworks && !showAllNetworks && (
						<Button
							variant="outline"
							onClick={() => setShowAllNetworks(true)}
							className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
						>
							<MoreHorizontal className="w-4 h-4 mr-2" />
							View More Networks
						</Button>
					)}

					{showAllNetworks && hasMoreNetworks && (
						<Button
							variant="outline"
							onClick={() => setShowAllNetworks(false)}
							className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
						>
							Show Less
						</Button>
					)}
				</div>

				{/* Divider */}
				<div className="border-t border-gray-200"></div>

				{/* Tokens Section */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-gray-700">Select Token</h3>
						{selectedChain && (
							<Badge variant="outline" className="text-xs">
								{selectedChain.chainName}
							</Badge>
						)}
					</div>

					{!selectedChain ? (
						<div className="text-center py-8 text-gray-600">
							<div className="text-4xl mb-2">🌐</div>
							<p className="font-semibold">Select a network first</p>
							<p className="text-sm">
								Choose a network to see available tokens
							</p>
						</div>
					) : (
						<>
							{/* Search */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									placeholder="Search tokens..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 bg-white/60 backdrop-blur-sm border-pink-200 focus:border-pink-400 focus:bg-white/80 transition-all"
								/>
							</div>

							{/* Scrollable Token List */}
							<div className="overflow-y-auto max-h-64 pr-2 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-white/20">
								{/* Vietnamese Tokens */}
								{vietnameseTokens.length > 0 && (
									<div className="mb-4">
										<div className="flex items-center space-x-2 mb-3">
											<h4 className="font-semibold text-gray-800 text-sm">
												Vietnamese Tokens
											</h4>
											<Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs">
												Priority
											</Badge>
										</div>
										<div className="space-y-2">
											{vietnameseTokens.map((token) => (
												<button
													key={token.tokenSymbol}
													onClick={() => selectToken(token)}
													className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
														tokenValue === token.tokenSymbol
															? 'bg-pink-50 border-pink-300 shadow-sm'
															: 'bg-white/50 border-pink-200 hover:border-pink-400 hover:bg-white/80'
													}`}
												>
													<img
														src={token.icon}
														alt={token.tokenSymbol}
														className="w-8 h-8 rounded-full"
														onError={(e) => {
															;(e.target as HTMLImageElement).src =
																'/placeholder.svg'
														}}
													/>
													<div className="text-left flex-1">
														<div className="font-semibold text-gray-900">
															{token.tokenSymbol}
														</div>
														<div className="text-sm text-gray-600">
															{token.tokenName}
														</div>
													</div>
													{tokenValue === token.tokenSymbol && (
														<Badge className="bg-pink-500 text-white text-xs">
															Selected
														</Badge>
													)}
												</button>
											))}
										</div>
									</div>
								)}

								{/* Other Tokens */}
								{otherTokens.length > 0 && (
									<div>
										<h4 className="font-semibold text-gray-800 mb-3 text-sm">
											Other Tokens
										</h4>
										<div className="space-y-2">
											{otherTokens.map((token) => (
												<button
													key={token.tokenSymbol}
													onClick={() => selectToken(token)}
													className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
														tokenValue === token.tokenSymbol
															? 'bg-gray-50 border-gray-300 shadow-sm'
															: 'bg-white/40 border-gray-200 hover:border-pink-300 hover:bg-white/60'
													}`}
												>
													<img
														src={token.icon}
														alt={token.tokenSymbol}
														className="w-8 h-8 rounded-full"
														onError={(e) => {
															;(e.target as HTMLImageElement).src =
																'/placeholder.svg'
														}}
													/>
													<div className="text-left flex-1">
														<div className="font-semibold text-gray-900">
															{token.tokenSymbol}
														</div>
														<div className="text-sm text-gray-600">
															{token.tokenName}
														</div>
													</div>
													{tokenValue === token.tokenSymbol && (
														<Badge className="bg-gray-500 text-white text-xs">
															Selected
														</Badge>
													)}
												</button>
											))}
										</div>
									</div>
								)}

								{filteredTokens.length === 0 && (
									<div className="text-center py-8 text-gray-600">
										<div className="text-4xl mb-2">🔍</div>
										<p className="font-semibold">No tokens found</p>
										<p className="text-sm">Try a different search term</p>
									</div>
								)}
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default CompactNetworkTokenSelector
