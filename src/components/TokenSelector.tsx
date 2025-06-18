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
import { Search } from 'lucide-react'
import { getTokensForChain, getNativeToken, ChainToken } from '@/lib/chains'
import { useTranslation } from '@/contexts/LanguageContext'

interface TokenSelectorProps {
	networkChainId: number
	value: string
	onChange: (token: string) => void
	label: string
	excludeTokens?: string[]
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
	networkChainId,
	value,
	onChange,
	label,
	excludeTokens = [],
}) => {
	const { t } = useTranslation()
	const [isOpen, setIsOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')

	// Get native token for the selected network
	const nativeToken = useMemo(() => {
		if (!networkChainId) return null
		return getNativeToken(networkChainId)
	}, [networkChainId])

	// Get available ERC20 tokens for the selected network
	const availableTokens = useMemo(() => {
		if (!networkChainId) {
			return []
		}
		const tokens = getTokensForChain(networkChainId)
		// Filter out excluded tokens
		return tokens.filter(token => !excludeTokens.includes(token.tokenSymbol))
	}, [networkChainId, excludeTokens])

	// Combine native token with ERC20 tokens
	const allTokens = useMemo(() => {
		const tokens = [...availableTokens]
		if (nativeToken && !excludeTokens.includes(nativeToken.tokenSymbol)) {
			tokens.unshift(nativeToken) // Add native token at the beginning
		}
		return tokens
	}, [nativeToken, availableTokens, excludeTokens])

	// Filter tokens based on search query
	const filteredTokens = useMemo(() => {
		if (!searchQuery.trim()) return allTokens

		return allTokens.filter(
			(token: ChainToken) =>
				token.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
				token.tokenName.toLowerCase().includes(searchQuery.toLowerCase())
		)
	}, [allTokens, searchQuery])

	// Get native token from filtered results
	const filteredNativeToken = useMemo(() => {
		return filteredTokens.find(token => 
			nativeToken && token.tokenSymbol === nativeToken.tokenSymbol
		)
	}, [filteredTokens, nativeToken])

	// Get Vietnamese tokens (VNST, VNDC, etc.)
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
			(token: ChainToken) =>
				token !== filteredNativeToken && // Exclude native token
				(token.tokenSymbol.includes('VN') ||
				vietSymbols.includes(token.tokenSymbol))
		)
	}, [filteredTokens, filteredNativeToken])

	// Get other popular tokens
	const otherTokens = useMemo(() => {
		return filteredTokens.filter(
			(token: ChainToken) => 
				token !== filteredNativeToken && 
				!vietnameseTokens.includes(token)
		)
	}, [filteredTokens, filteredNativeToken, vietnameseTokens])

	const selectedToken = allTokens.find(
		(token: ChainToken) => token.tokenSymbol === value
	)

	const selectToken = (token: ChainToken) => {
		onChange(token.tokenSymbol)
		setIsOpen(false)
		setSearchQuery('')
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="w-full h-14 justify-between bg-white/70 backdrop-blur-sm border-pink-200 hover:bg-white/80 hover:border-pink-300 transition-all"
				>
					{selectedToken ? (
						<div className="flex items-center space-x-3">
							<img
								src={selectedToken.icon}
								alt={selectedToken.tokenSymbol}
								className="w-8 h-8 rounded-full"
								onError={(e) => {
									;(e.target as HTMLImageElement).src = '/placeholder.svg'
								}}
							/>
							<div className="text-left">
								<div className="font-medium">{selectedToken.tokenSymbol}</div>
								<div className="text-sm text-gray-500">
									{selectedToken.tokenName}
								</div>
							</div>
						</div>
					) : (
						<span className="text-gray-500">{t('bridge.selectToken')}</span>
					)}
					<span className="text-gray-400">▼</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md max-w-[95vw] max-h-[85vh] bg-white/90 backdrop-blur-md border border-white/50 shadow-xl rounded-xl">
				<DialogHeader>
					<DialogTitle className="lotus-text-gradient text-xl font-semibold">
						{t('bridge.selectToken')}
					</DialogTitle>
				</DialogHeader>

				{/* Search */}
				<div className="relative mt-4">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
					<Input
						placeholder={t('bridge.selectToken')}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 bg-white/60 backdrop-blur-sm border-pink-200 focus:border-pink-400 focus:bg-white/80 transition-all"
					/>
				</div>

				{/* Scrollable Content */}
				<div className="overflow-y-auto max-h-[calc(85vh-140px)] sm:max-h-[55vh] pr-2 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-white/20 mt-4">
					{/* Native Token Section */}
					{filteredNativeToken && (
						<div className="mb-6">
							<div className="flex items-center space-x-2 mb-3 px-1">
								<h3 className="font-semibold text-gray-800">{t('bridge.nativeToken')}</h3>
								<Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1">
									{t('bridge.nativeToken')}
								</Badge>
							</div>
							<div className="space-y-2">
								<button
									onClick={() => selectToken(filteredNativeToken)}
									className="w-full flex items-center justify-between p-3 bg-blue-50/70 backdrop-blur-sm border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/90 transition-all duration-200"
								>
									<div className="flex items-center space-x-3">
										<img
											src={filteredNativeToken.icon}
											alt={filteredNativeToken.tokenSymbol}
											className="w-8 h-8 rounded-full flex-shrink-0"
											onError={(e) => {
												;(e.target as HTMLImageElement).src = '/placeholder.svg'
											}}
										/>
										<div className="text-left min-w-0 flex-1">
											<div className="font-semibold text-gray-800 truncate">
												{filteredNativeToken.tokenSymbol}
											</div>
											<div className="text-sm text-gray-600 truncate">
												{t('bridge.nativeTokenDescription')}
											</div>
										</div>
									</div>
								</button>
							</div>
						</div>
					)}

					{/* Vietnamese Tokens Section */}
					{vietnameseTokens.length > 0 && (
						<div className="mb-6">
							<div className="flex items-center space-x-2 mb-3 px-1">
								<h3 className="font-semibold text-gray-800">{t('bridge.vietnameseTokens')}</h3>
								<Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs px-2 py-1">
									{t('bridge.recommended')}
								</Badge>
							</div>
							<div className="space-y-2">
								{vietnameseTokens.map((token) => (
									<button
										key={token.tokenSymbol}
										onClick={() => selectToken(token)}
										className="w-full flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm border border-pink-200 rounded-lg hover:border-pink-400 hover:bg-white/70 transition-all duration-200"
									>
										<div className="flex items-center space-x-3">
											<img
												src={token.icon}
												alt={token.tokenSymbol}
												className="w-8 h-8 rounded-full flex-shrink-0"
												onError={(e) => {
													;(e.target as HTMLImageElement).src =
														'/placeholder.svg'
												}}
											/>
											<div className="text-left min-w-0 flex-1">
												<div className="font-semibold text-gray-800 truncate">
													{token.tokenSymbol}
												</div>
												<div className="text-sm text-gray-600 truncate">
													{token.tokenName}
												</div>
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					)}

					{/* Other Tokens Section */}
					{otherTokens.length > 0 && (
						<div className="mb-6">
							<h3 className="font-semibold text-gray-800 mb-3 px-1">{t('bridge.otherTokens')}</h3>
							<div className="space-y-2">
								{otherTokens.map((token) => (
									<button
										key={token.tokenSymbol}
										onClick={() => selectToken(token)}
										className="w-full flex items-center justify-between p-3 bg-white/40 backdrop-blur-sm border border-gray-200 rounded-lg hover:border-pink-400 hover:bg-white/60 transition-all duration-200"
									>
										<div className="flex items-center space-x-3">
											<img
												src={token.icon}
												alt={token.tokenSymbol}
												className="w-8 h-8 rounded-full flex-shrink-0"
												onError={(e) => {
													;(e.target as HTMLImageElement).src =
														'/placeholder.svg'
												}}
											/>
											<div className="text-left min-w-0 flex-1">
												<div className="font-semibold text-gray-800 truncate">
													{token.tokenSymbol}
												</div>
												<div className="text-sm text-gray-600 truncate">
													{token.tokenName}
												</div>
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					)}

					{filteredTokens.length === 0 && (
						<div className="text-center py-8 text-gray-600 bg-white/50 backdrop-blur-sm rounded-lg border border-pink-100 mx-1">
							<div className="text-4xl mb-2">🔍</div>
							<p className="font-semibold text-gray-700">No tokens found</p>
							<p className="text-sm text-gray-500">Try searching with a different term</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default TokenSelector
