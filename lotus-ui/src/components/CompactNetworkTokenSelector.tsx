import React, { useState, useMemo, useEffect, useRef } from 'react'
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
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

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

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect()
		setMousePosition({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		})
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleDialogOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="w-full h-16 p-4 justify-between bg-gradient-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-xl border border-white/60 hover:border-blue-400/50 hover:bg-gradient-to-br hover:from-white/98 hover:via-blue-50/90 hover:to-purple-50/80 transition-all duration-500 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/10"
				>
					<div className="flex items-center space-x-4">
						{/* Network Icon */}
						{selectedChain && (
							<div className="relative">
								<img
									src={selectedChain.chainIcon}
									alt={selectedChain.chainName}
									className="w-9 h-9 rounded-full ring-2 ring-white/50"
									onError={(e) => {
										;(e.target as HTMLImageElement).src = '/placeholder.svg'
									}}
								/>
								{selectedChain.isTestnet && (
									<div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
								)}
							</div>
						)}

						{/* Token Icon and Info */}
						<div className="flex items-center space-x-3">
							{selectedToken && (
								<img
									src={selectedToken.icon}
									alt={selectedToken.tokenSymbol}
									className="w-7 h-7 rounded-full ring-1 ring-gray-200/50"
									onError={(e) => {
										;(e.target as HTMLImageElement).src = '/placeholder.svg'
									}}
								/>
							)}

							<div className="text-left">
								<div className="flex items-center space-x-2">
									<span className="font-semibold text-gray-800 text-base">
										{selectedToken?.tokenSymbol || t('selector.selectToken')}
									</span>
									{selectedChain && (
										<span className="text-xs px-2.5 py-1 bg-gray-100/70 rounded-full text-gray-600 font-medium border border-gray-200/50">
											{selectedChain.chainName}
										</span>
									)}
								</div>
								<div className="text-sm text-gray-500 font-medium">
									{selectedToken?.tokenName ||
										t('selector.chooseNetworkAndToken')}
								</div>
							</div>
						</div>
					</div>
					<ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-300" />
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[85vh] bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl overflow-hidden">
				<DialogHeader className="pb-4 border-b border-gray-100/80">
					<DialogTitle className="text-xl font-bold text-gray-900 text-center tracking-tight">
						{label}
					</DialogTitle>
				</DialogHeader>

				{/* Networks Grid Section */}
				<div className="space-y-4 p-4">
					<div className="flex items-center justify-between">
						<h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
							{t('selector.selectNetwork')}
						</h3>
						<div className="w-8 h-px bg-gradient-to-r from-blue-500/50 to-purple-500/50"></div>
					</div>

					{/* Networks Grid */}
					<div
						className="grid grid-cols-4 gap-2 p-4 rounded-2xl relative overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-white/40 via-white/30 to-white/20 border border-white/60"
						onMouseMove={handleMouseMove}
						style={{
							background: `
								radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 60%, transparent 80%),
								linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.06) 30%, rgba(236, 72, 153, 0.04) 60%, rgba(34, 197, 94, 0.06) 100%),
								rgba(255, 255, 255, 0.25)
							`,
							boxShadow: `
								inset 0 1px 0 rgba(255, 255, 255, 0.8),
								inset 0 -1px 0 rgba(255, 255, 255, 0.1),
								0 20px 60px rgba(0, 0, 0, 0.1),
								0 8px 25px rgba(59, 130, 246, 0.1)
							`,
						}}
					>
						{/* Subtle animated overlay */}
						<div className="absolute inset-0 bg-gradient-to-tr from-blue-400/3 via-transparent to-purple-400/3 animate-pulse opacity-50"></div>

						{displayedNetworks.map((network) => (
							<button
								key={network.chainKey}
								onClick={() => selectNetwork(network.chainKey)}
								className={`group flex flex-col items-center p-2 rounded-xl transition-all duration-300 relative z-10 backdrop-blur-sm ${
									networkValue === network.chainKey
										? 'bg-white/50 border-2 border-blue-400/60 shadow-lg shadow-blue-500/20 scale-105'
										: 'bg-white/30 border border-white/40 hover:border-blue-400/40 hover:bg-white/40 hover:scale-105 hover:shadow-md'
								}`}
								style={{
									boxShadow:
										networkValue === network.chainKey
											? `
											inset 0 1px 0 rgba(255, 255, 255, 0.6),
											0 4px 16px rgba(59, 130, 246, 0.15),
											0 2px 8px rgba(0, 0, 0, 0.1)
										`
											: `
											inset 0 1px 0 rgba(255, 255, 255, 0.3),
											0 1px 4px rgba(0, 0, 0, 0.05)
										`,
								}}
							>
								{/* Testnet Badge */}
								{network.isTestnet && (
									<Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-white/30 backdrop-blur-sm">
										TEST
									</Badge>
								)}

								<img
									src={network.chainIcon}
									alt={network.chainName}
									width="32"
									height="32"
									className="w-8 h-8 rounded-full mb-1 transition-transform duration-300 group-hover:scale-110"
									onError={(e) => {
										;(e.target as HTMLImageElement).src = '/placeholder.svg'
									}}
								/>
								<span className="text-xs text-center font-semibold text-gray-700 leading-tight">
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
							className="w-full h-8 text-xs bg-white/50 backdrop-blur-sm border-white/60 hover:bg-white/70 transition-all duration-300"
						>
							<MoreHorizontal className="w-3 h-3 mr-1" />
							{t('selector.viewMoreNetworks')}
						</Button>
					)}
					{showAllNetworks && hasMoreNetworks && (
						<Button
							variant="outline"
							onClick={() => setShowAllNetworks(false)}
							className="w-full h-8 text-xs bg-white/50 backdrop-blur-sm border-white/60 hover:bg-white/70 transition-all duration-300"
						>
							{t('selector.showLess')}
						</Button>
					)}
				</div>

				{/* Elegant Divider */}
				<div className="relative px-4">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-200"></div>
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-white px-3 text-gray-500 font-semibold tracking-wider">
							Assets
						</span>
					</div>
				</div>

				{/* Tokens Section */}
				<div className="space-y-4 p-4 flex-1 min-h-0">
					<div className="flex items-center justify-between">
						<h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
							{t('selector.selectAsset')}
						</h3>
						{selectedChain && (
							<Badge
								variant="outline"
								className="text-xs font-medium px-2 py-0.5 bg-white/50 backdrop-blur-sm border-white/60"
							>
								{selectedChain.chainName}
							</Badge>
						)}
					</div>

					{!selectedChain ? (
						<div className="text-center py-8 text-gray-500">
							<div className="text-4xl mb-3 opacity-50">🌐</div>
							<p className="font-semibold text-gray-700 text-base mb-1">
								{t('selector.selectNetworkFirst')}
							</p>
							<p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
								{t('selector.chooseNetworkToSeeTokens')}
							</p>
						</div>
					) : (
						<>
							{/* Search */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10 pointer-events-none" />
								<Input
									placeholder={t('selector.searchAsset')}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 h-10 bg-white/50 backdrop-blur-sm border-white/60 rounded-xl focus:bg-white/70 transition-all duration-300"
								/>
							</div>

							{/* Scrollable Token List */}
							<div className="overflow-y-auto max-h-80 space-y-3 pr-2">
								{/* Vietnamese Tokens */}
								{vietnameseTokens.length > 0 && (
									<div className="space-y-2">
										<div className="flex items-center space-x-2">
											<h4 className="font-semibold text-gray-800 text-sm">
												{t('selector.vietnameseTokens')}
											</h4>
											<Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-0.5">
												{t('selector.priority')}
											</Badge>
											<div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent"></div>
										</div>
										<div className="space-y-2">
											{vietnameseTokens.map((token) => (
												<button
													key={token.tokenSymbol}
													onClick={() => selectToken(token)}
													className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 backdrop-blur-sm ${
														tokenValue === token.tokenSymbol
															? 'bg-blue-50/80 border-2 border-blue-200/80 shadow-lg shadow-blue-500/10'
															: 'bg-white/40 border border-white/60 hover:border-blue-200/60 hover:bg-blue-50/60 hover:shadow-md'
													}`}
												>
													<img
														src={token.icon}
														alt={token.tokenSymbol}
														className="w-10 h-10 rounded-full ring-2 ring-white/50"
														onError={(e) => {
															;(e.target as HTMLImageElement).src =
																'/placeholder.svg'
														}}
													/>
													<div className="text-left flex-1">
														<div className="font-bold text-gray-900 text-base">
															{token.tokenSymbol}
														</div>
														<div className="text-sm text-gray-500 font-medium">
															{token.tokenName}
														</div>
													</div>
													{tokenValue === token.tokenSymbol && (
														<Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1">
															{t('selector.selected')}
														</Badge>
													)}
												</button>
											))}
										</div>
									</div>
								)}

								{/* Other Tokens */}
								{otherTokens.length > 0 && (
									<div className="space-y-2">
										<div className="flex items-center space-x-2">
											<h4 className="font-semibold text-gray-800 text-sm">
												{t('selector.otherTokens')}
											</h4>
											<div className="flex-1 h-px bg-gradient-to-r from-gray-300/50 to-transparent"></div>
										</div>
										<div className="space-y-2">
											{otherTokens.map((token) => (
												<button
													key={token.tokenSymbol}
													onClick={() => selectToken(token)}
													className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 backdrop-blur-sm ${
														tokenValue === token.tokenSymbol
															? 'bg-purple-50/80 border-2 border-purple-200/80 shadow-lg shadow-purple-500/10'
															: 'bg-white/40 border border-white/60 hover:border-purple-200/60 hover:bg-purple-50/60 hover:shadow-md'
													}`}
												>
													<img
														src={token.icon}
														alt={token.tokenSymbol}
														className="w-10 h-10 rounded-full ring-2 ring-white/50"
														onError={(e) => {
															;(e.target as HTMLImageElement).src =
																'/placeholder.svg'
														}}
													/>
													<div className="text-left flex-1">
														<div className="font-bold text-gray-900 text-base">
															{token.tokenSymbol}
														</div>
														<div className="text-sm text-gray-500 font-medium">
															{token.tokenName}
														</div>
													</div>
													{tokenValue === token.tokenSymbol && (
														<Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-1">
															{t('selector.selected')}
														</Badge>
													)}
												</button>
											))}
										</div>
									</div>
								)}

								{filteredTokens.length === 0 && (
									<div className="text-center py-8 text-gray-500">
										<div className="text-4xl mb-3 opacity-50">🔍</div>
										<p className="font-semibold text-gray-700 text-base mb-1">
											{t('selector.noTokensFound')}
										</p>
										<p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
											{t('selector.tryDifferentSearch')}
										</p>
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
