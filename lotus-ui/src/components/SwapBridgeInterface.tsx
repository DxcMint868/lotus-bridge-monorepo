import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import TokenSelector from './TokenSelector'
import NetworkBridgeSelector from './NetworkBridgeSelector'
import AccountSelector from './AccountSelector'
import LotusIcon from './LotusIcon'
import { ArrowDown, ArrowRight, Loader2, ExternalLink, RefreshCw } from 'lucide-react'
import { useSwitchChain, useChainId, useAccount } from 'wagmi'
import { getChainByKey, getChainEntries } from '@/lib/chains'
import { useSwapBridge, SwapBridgeParams } from '@/hooks/useSwapBridge'
import { useTranslation } from '@/contexts/LanguageContext'
import { useTransactions } from '@/contexts/TransactionContext'

interface SwapBridgeState {
	fromNetwork: string
	toNetwork: string
	fromToken: string
	toToken: string
	amount: string
	recipient: string
	useConnectedWallet: boolean
	slippageTolerance: number
}

const SwapBridgeInterface = () => {
	const { t } = useTranslation()
	const { switchChain } = useSwitchChain()
	const currentChainId = useChainId()
	const { address, isConnected } = useAccount()
	const { addTransaction } = useTransactions()

	const [swapBridgeState, setSwapBridgeState] = useState<SwapBridgeState>({
		fromNetwork: '84532', // Base Sepolia
		toNetwork: '11155111', // Ethereum Sepolia
		fromToken: 'AXS',
		toToken: 'SLP',
		amount: '',
		recipient: '',
		useConnectedWallet: true,
		slippageTolerance: 0.5,
	})

	// Create swap bridge parameters for the hook
	const swapBridgeParams: SwapBridgeParams = {
		fromChainKey: swapBridgeState.fromNetwork,
		toChainKey: swapBridgeState.toNetwork,
		fromToken: swapBridgeState.fromToken,
		toToken: swapBridgeState.toToken,
		amount: swapBridgeState.amount,
		recipient: swapBridgeState.useConnectedWallet ? address : swapBridgeState.recipient,
		slippageTolerance: swapBridgeState.slippageTolerance,
	}

	// Swap bridge functionality using the new hook
	const {
		currentStep,
		isProcessing,
		isCompleted,
		hasError,
		errorMessage,
		swapToVnstResult,
		bridgeResult,
		swapFromVnstResult,
		startSwapBridge,
		reset,
		estimatedVnstAmount,
		estimatedFinalAmount,
		totalSteps,
		currentStepNumber,
		fromChain,
		toChain,
		fromTokenData,
		toTokenData,
		isValidParams,
	} = useSwapBridge(swapBridgeParams)

	// Auto-switch wallet to the selected "from" network
	useEffect(() => {
		const fromChain = getChainByKey(swapBridgeState.fromNetwork)
		if (fromChain && currentChainId !== fromChain.chainId && switchChain) {
			switchChain({ chainId: fromChain.chainId })
		}
	}, [swapBridgeState.fromNetwork, currentChainId, switchChain])

	const updateSwapBridgeState = (updates: Partial<SwapBridgeState>) => {
		setSwapBridgeState((prev) => {
			const newState = { ...prev, ...updates }

			// Prevent setting the same chain for both from and to
			if (updates.fromNetwork && updates.fromNetwork === prev.toNetwork) {
				const availableChains = getChainEntries().filter(
					([chainKey]) => chainKey !== updates.fromNetwork
				)
				if (availableChains.length > 0) {
					newState.toNetwork = availableChains[0][0]
				}
			} else if (updates.toNetwork && updates.toNetwork === prev.fromNetwork) {
				const availableChains = getChainEntries().filter(
					([chainKey]) => chainKey !== updates.toNetwork
				)
				if (availableChains.length > 0) {
					newState.fromNetwork = availableChains[0][0]
				}
			}

			// Don't allow VNST as destination token for swap+bridge (but allow as source)
			if (updates.toToken === 'VNST') {
				newState.toToken = 'SLP' // Default to SLP
			}

			return newState
		})
	}

	const swapNetworks = () => {
		setSwapBridgeState((prev) => ({
			...prev,
			fromNetwork: prev.toNetwork,
			toNetwork: prev.fromNetwork,
			fromToken: prev.toToken,
			toToken: prev.fromToken,
		}))
	}

	const handleStartSwapBridge = () => {
		if (!isConnected || !address) {
			alert(t('messages.pleaseConnectWallet'))
			return
		}

		if (!isValidParams) {
			alert('Please check your inputs and try again')
			return
		}

		// Add transaction to history
		if (fromChain && toChain && fromTokenData && toTokenData) {
			addTransaction({
				type: 'swap-bridge',
				status: 'pending',
				fromToken: swapBridgeState.fromToken,
				toToken: swapBridgeState.toToken,
				fromNetwork: fromChain.chainName.toLowerCase(),
				toNetwork: toChain.chainName.toLowerCase(),
				amount: swapBridgeState.amount,
				amountFormatted: swapBridgeState.amount,
				userAddress: address,
				recipient: swapBridgeState.useConnectedWallet
					? address
					: swapBridgeState.recipient,
				estimatedTime: '10-15 min',
				explorerUrl:
					fromChain.chainId === 11155111
						? 'https://sepolia.etherscan.io'
						: fromChain.chainId === 84532
						? 'https://sepolia.basescan.org'
						: 'https://etherscan.io',
			})
		}

		startSwapBridge()
	}

	const getStepDescription = (step: string) => {
		switch (step) {
			case 'swap-to-vnst':
				return `Swapping ${swapBridgeState.fromToken} to VNST on ${fromChain?.chainName}`
			case 'bridge-vnst':
				return `Bridging VNST from ${fromChain?.chainName} to ${toChain?.chainName}`
			case 'swap-from-vnst':
				return `Swapping VNST to ${swapBridgeState.toToken} on ${toChain?.chainName}`
			case 'completed':
				return 'Swap + Bridge completed successfully!'
			case 'error':
				return 'Process failed'
			default:
				return 'Ready to start'
		}
	}

	const canStartSwapBridge = () => {
		return (
			isConnected &&
			swapBridgeState.amount &&
			parseFloat(swapBridgeState.amount) > 0 &&
			swapBridgeState.fromNetwork !== swapBridgeState.toNetwork &&
			swapBridgeState.toToken !== 'VNST' && // Only exclude VNST as destination
			swapBridgeState.fromToken !== swapBridgeState.toToken &&
			!isProcessing
		)
	}

	const progressPercentage = (currentStepNumber / totalSteps) * 100

	return (
		<Card className="lotus-card">
			<CardHeader>
				<CardTitle className="flex items-center space-x-3">
					<div className="lotus-float">
						<LotusIcon size={100} />
					</div>
					<span className="lotus-text-gradient">Swap + Bridge</span>
				</CardTitle>
				<p className="text-sm text-muted-foreground mt-2">
					Convert tokens across different chains via VNST
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Progress Section */}
				{(isProcessing || isCompleted || hasError) && (
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-sm font-medium">Progress</Label>
							<span className="text-sm text-gray-500">
								Step {currentStepNumber} of {totalSteps}
							</span>
						</div>
						<Progress value={progressPercentage} className="h-2" />
						<p className="text-sm text-gray-600">{getStepDescription(currentStep)}</p>
						
						{hasError && (
							<div className="p-3 bg-red-50 rounded-lg border border-red-200">
								<p className="text-sm text-red-800">{errorMessage}</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={reset}
									className="mt-2 text-red-600 hover:text-red-800"
								>
									<RefreshCw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							</div>
						)}
						
						{isCompleted && (
							<div className="p-3 bg-green-50 rounded-lg border border-green-200">
								<p className="text-sm text-green-800">
									Successfully converted {swapBridgeState.amount} {swapBridgeState.fromToken} to {swapBridgeState.toToken}!
								</p>
							</div>
						)}
					</div>
				)}

				{/* From Section */}
				<div className="space-y-4">
					<Label className="text-base font-medium text-gray-900">
						{t('bridge.from')}
					</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<NetworkBridgeSelector
							value={swapBridgeState.fromNetwork}
							onChange={(network) =>
								updateSwapBridgeState({ fromNetwork: network })
							}
							label={t('bridge.sourceNetwork')}
							excludeChain={swapBridgeState.toNetwork}
						/>
						<TokenSelector
							networkChainId={
								getChainByKey(swapBridgeState.fromNetwork)?.chainId || 0
							}
							value={swapBridgeState.fromToken}
							onChange={(token) => updateSwapBridgeState({ fromToken: token })}
							label={t('bridge.sourceToken')}
							// Allow VNST as source token for swap+bridge
						/>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label htmlFor="amount">{t('bridge.amount')}</Label>
						</div>
						<div className="relative">
							<Input
								id="amount"
								type="number"
								placeholder="0.0"
								value={swapBridgeState.amount}
								onChange={(e) => updateSwapBridgeState({ amount: e.target.value })}
								className="text-2xl font-medium h-14 pr-20 bg-white/60 border-pink-200 focus:border-pink-400 focus:bg-white/80 transition-all backdrop-blur-sm"
								disabled={isProcessing}
							/>
						</div>
					</div>
				</div>

				{/* Conversion Flow Visualization */}
				<div className="flex items-center justify-center space-x-2 py-4">
					<div className="text-center">
						<div className="text-sm font-medium">{swapBridgeState.fromToken}</div>
						<div className="text-xs text-gray-500">{fromChain?.chainName}</div>
					</div>
					<ArrowRight className="h-4 w-4 text-gray-400" />
					<div className="text-center">
						<div className="text-sm font-medium text-blue-600">VNST</div>
						<div className="text-xs text-gray-500">Bridge Token</div>
					</div>
					<ArrowRight className="h-4 w-4 text-gray-400" />
					<div className="text-center">
						<div className="text-sm font-medium">{swapBridgeState.toToken}</div>
						<div className="text-xs text-gray-500">{toChain?.chainName}</div>
					</div>
				</div>

				{/* Swap Button */}
				<div className="flex justify-center">
					<Button
						variant="outline"
						size="icon"
						onClick={swapNetworks}
						className="rounded-full border-pink-200 hover:bg-pink-50 lotus-float"
						disabled={isProcessing}
					>
						<ArrowDown className="h-4 w-4 text-lotus-pink-light" />
					</Button>
				</div>

				{/* To Section */}
				<div className="space-y-4">
					<Label className="text-base font-medium text-gray-900">
						{t('bridge.to')}
					</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<NetworkBridgeSelector
							value={swapBridgeState.toNetwork}
							onChange={(network) => updateSwapBridgeState({ toNetwork: network })}
							label={t('bridge.targetNetwork')}
							excludeChain={swapBridgeState.fromNetwork}
						/>
						<TokenSelector
							networkChainId={
								getChainByKey(swapBridgeState.toNetwork)?.chainId || 0
							}
							value={swapBridgeState.toToken}
							onChange={(token) => updateSwapBridgeState({ toToken: token })}
							label={t('bridge.targetToken')}
							excludeTokens={['VNST']} // Exclude VNST from selection
						/>
					</div>

					<div className="space-y-2">
						<Label>{t('bridge.youWillReceive')} (Estimated)</Label>
						<div className="h-14 bg-gray-50 border border-gray-200 rounded-md flex items-center px-4">
							<span className="text-2xl font-medium text-gray-900">
								{estimatedFinalAmount || '0.0'}
							</span>
							<span className="ml-2 text-gray-500">{swapBridgeState.toToken}</span>
						</div>
						{estimatedVnstAmount && estimatedFinalAmount && (
							<div className="text-xs text-gray-500">
								Via {estimatedVnstAmount} VNST
							</div>
						)}
					</div>
				</div>

				{/* Recipient Address */}
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="useConnectedWallet"
							checked={swapBridgeState.useConnectedWallet}
							onChange={(e) =>
								updateSwapBridgeState({ useConnectedWallet: e.target.checked })
							}
							className="rounded border-pink-300 text-lotus-pink focus:ring-lotus-pink"
							disabled={isProcessing}
						/>
						<Label htmlFor="useConnectedWallet" className="text-sm">
							{t('bridge.sendToConnectedWallet')}
						</Label>
					</div>
					{!swapBridgeState.useConnectedWallet && (
						<div className="space-y-3">
							<Input
								placeholder={t('bridge.enterRecipientAddress')}
								value={swapBridgeState.recipient}
								onChange={(e) =>
									updateSwapBridgeState({ recipient: e.target.value })
								}
								className="bg-white/60 border-pink-200 focus:border-pink-400 focus:bg-white/80 transition-all backdrop-blur-sm"
								disabled={isProcessing}
							/>
							<AccountSelector
								onSelectAccount={(address) =>
									updateSwapBridgeState({ recipient: address })
								}
								selectedAddress={swapBridgeState.recipient}
								disabled={!isConnected || isProcessing}
							/>
						</div>
					)}
				</div>

				{/* Slippage Tolerance */}
				<div className="space-y-2">
					<Label htmlFor="slippage">Slippage Tolerance (%)</Label>
					<Input
						id="slippage"
						type="number"
						placeholder="0.5"
						value={swapBridgeState.slippageTolerance}
						onChange={(e) => 
							updateSwapBridgeState({ slippageTolerance: parseFloat(e.target.value) || 0.5 })
						}
						className="bg-white/60 border-pink-200 focus:border-pink-400 focus:bg-white/80 transition-all backdrop-blur-sm"
						disabled={isProcessing}
						min="0.1"
						max="5"
						step="0.1"
					/>
				</div>

				{/* Start Swap + Bridge Button */}
				<Button
					onClick={handleStartSwapBridge}
					disabled={!canStartSwapBridge()}
					className="w-full h-14 text-lg font-medium bg-gradient-to-r from-lotus-pink to-lotus-pink-dark hover:from-lotus-pink-dark hover:to-lotus-pink disabled:opacity-50 transition-all duration-300 backdrop-blur-md"
				>
					{isProcessing ? (
						<div className="flex items-center space-x-2">
							<Loader2 className="w-5 h-5 animate-spin" />
							<span>Processing...</span>
						</div>
					) : !isConnected ? (
						'Connect Wallet'
					) : !canStartSwapBridge() ? (
						'Enter Valid Parameters'
					) : (
						'Start Swap + Bridge'
					)}
				</Button>
			</CardContent>
		</Card>
	)
}

export default SwapBridgeInterface
