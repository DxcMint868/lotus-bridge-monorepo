import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import CompactNetworkTokenSelector from './CompactNetworkTokenSelector'
import TransactionDetails from './TransactionDetails'
import AdvancedOptions from './AdvancedOptions'
import AccountSelector from './AccountSelector'
import LotusIcon from './LotusIcon'
import {
	ArrowDown,
	ArrowRight,
	Loader2,
	ExternalLink,
	RefreshCw,
} from 'lucide-react'
import { useSwitchChain, useChainId, useAccount } from 'wagmi'
import {
	getChainByKey,
	getChainEntries,
	getTokenDecimals,
	getTokensForChain,
	getNativeToken,
} from '@/lib/chains'
import { useBridge, BridgeParams } from '@/hooks/useBridge'
import { useSwapBridge, SwapBridgeParams } from '@/hooks/useSwapBridge'
import { useSimpleBridge } from '@/hooks/useSimpleBridge'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useTranslation } from '@/contexts/LanguageContext'
import { useTransactions } from '@/contexts/TransactionContext'
import { useTransactionMonitor } from '@/hooks/useTransactionHistory'

interface BridgeState {
	fromNetwork: string
	toNetwork: string
	fromToken: string
	toToken: string
	amount: string
	recipient: string
	useConnectedWallet: boolean
	slippageTolerance: number
}

const BridgeInterface = () => {
	const { t } = useTranslation()
	const { switchChain } = useSwitchChain()
	const currentChainId = useChainId()
	const { address, isConnected } = useAccount()
	const { addTransaction, getUserTransactions, updateTransaction } =
		useTransactions()

	const [bridgeState, setBridgeState] = useState<BridgeState>({
		fromNetwork: '84532', // Base Sepolia
		toNetwork: '11155111', // Ethereum Sepolia
		fromToken: 'VNST',
		toToken: 'VNST',
		amount: '',
		recipient: '',
		useConnectedWallet: true,
		slippageTolerance: 0.5,
	})

	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

	// Determine if this is a swap+bridge operation (different tokens) or regular bridge (same token)
	const isSwapBridgeOperation = bridgeState.fromToken !== bridgeState.toToken

	// Create bridge parameters for regular bridging
	const bridgeParams: BridgeParams = {
		fromChainKey: bridgeState.fromNetwork,
		toChainKey: bridgeState.toNetwork,
		tokenSymbol: bridgeState.fromToken,
		amount: bridgeState.amount,
		recipient: bridgeState.useConnectedWallet ? address : bridgeState.recipient,
	}

	// Create swap bridge parameters for swap+bridge operations
	const swapBridgeParams: SwapBridgeParams = {
		fromChainKey: bridgeState.fromNetwork,
		toChainKey: bridgeState.toNetwork,
		fromToken: bridgeState.fromToken,
		toToken: bridgeState.toToken,
		amount: bridgeState.amount,
		recipient: bridgeState.useConnectedWallet ? address : bridgeState.recipient,
		slippageTolerance: bridgeState.slippageTolerance,
	}

	// Simple bridge parameters for mock cross-token bridging
	const simpleBridgeParams = {
		fromChainKey: bridgeState.fromNetwork,
		toChainKey: bridgeState.toNetwork,
		fromToken: bridgeState.fromToken,
		toToken: bridgeState.toToken,
		amount: bridgeState.amount,
		recipient: bridgeState.useConnectedWallet ? address : bridgeState.recipient,
	}

	// Bridge functionality using the bridge hook (for same token bridging)
	const bridgeHook = useBridge(bridgeParams)

	// Swap bridge functionality using the swap bridge hook (for different token operations)
	const swapBridgeHook = useSwapBridge(swapBridgeParams)

	// Simple mock bridge functionality
	const simpleBridgeHook = useSimpleBridge(simpleBridgeParams)

	// Choose the appropriate hook based on operation type
	const {
		// Bridge transaction
		bridge,
		isLoading: isBridging,
		isSuccess: bridgeSuccess,
		error: bridgeError,
		txHash,
		reset: resetBridge,

		// Approval transaction
		approveToken,
		isApproving,
		isApprovalSuccess,
		approvalError,
		approvalTxHash,

		// Bridge fee
		bridgeFee,
		bridgeFeeFormatted,

		// Allowance checking
		needsApproval,
		currentAllowance,
		isAllowanceLoading,
		allowanceError,

		// Pool statistics
		poolStats,
		isPoolStatsLoading,

		// Minimum bridge amount validation
		minBridgeAmount,
		minBridgeAmountFormatted,
		isMinAmountLoading,
		meetsMinimumAmount,

		// Helper data
		fromChain,
		toChain,
		token,
		isValidParams,
		transactionId,

		// Swap bridge specific data (only available when isSwapBridgeOperation is true)
		currentStep,
		isProcessing,
		isCompleted,
		hasError,
		errorMessage,
		swapToVnstResult,
		bridgeResult,
		swapFromVnstResult,
		startSwapBridge,
		reset: resetSwapBridge,
		estimatedVnstAmount,
		estimatedFinalAmount,
		totalSteps,
		currentStepNumber,
		fromTokenData,
		toTokenData,
	} = isSwapBridgeOperation
		? {
				// Use simple mock bridge hook for cross-token operations
				...simpleBridgeHook,

				// Map required fields for compatibility
				bridgeFee: null,
				bridgeFeeFormatted: null,
				poolStats: null,
				isPoolStatsLoading: false,
				minBridgeAmount: null,
				minBridgeAmountFormatted: null,
				isMinAmountLoading: false,
				meetsMinimumAmount: true,
				transactionId: null,

				// Add mock swap bridge fields
				currentStep: 'idle' as const,
				isProcessing: simpleBridgeHook.isLoading,
				isCompleted: simpleBridgeHook.isSuccess,
				hasError: !!simpleBridgeHook.error,
				errorMessage: simpleBridgeHook.error?.message || null,
				swapToVnstResult: null,
				bridgeResult: null,
				swapFromVnstResult: null,
				startSwapBridge: simpleBridgeHook.bridge,
				estimatedVnstAmount: simpleBridgeHook.estimatedOutput,
				estimatedFinalAmount: simpleBridgeHook.estimatedOutput,
				totalSteps: 1,
				currentStepNumber: 1,
				token: simpleBridgeHook.fromTokenData,
		  }
		: {
				// Use regular bridge hook data
				...bridgeHook,

				// Add empty swap bridge fields
				currentStep: 'idle' as const,
				isProcessing: false,
				isCompleted: false,
				hasError: false,
				errorMessage: null,
				swapToVnstResult: null,
				bridgeResult: null,
				swapFromVnstResult: null,
				startSwapBridge: () => {},
				estimatedVnstAmount: null,
				estimatedFinalAmount: null,
				totalSteps: 1,
				currentStepNumber: 1,
				fromTokenData: null,
				toTokenData: null,
		  }

	// Token balance for source token
	const {
		balance: fromTokenBalance,
		isLoading: isBalanceLoading,
		refetch: refetchBalance,
	} = useTokenBalance(bridgeState.fromNetwork, bridgeState.fromToken)

	// Get selected token data for display
	const selectedToken = useMemo(() => {
		const selectedChain = getChainByKey(bridgeState.fromNetwork)
		if (!selectedChain) return null

		const tokens = getTokensForChain
			? getTokensForChain(selectedChain.chainId)
			: []
		const nativeToken = getNativeToken
			? getNativeToken(selectedChain.chainId)
			: null
		const allTokens = nativeToken ? [nativeToken, ...tokens] : tokens

		return (
			allTokens.find((token) => token.tokenSymbol === bridgeState.fromToken) ||
			null
		)
	}, [bridgeState.fromNetwork, bridgeState.fromToken])

	// Monitor approval transaction
	useTransactionMonitor({
		hash: approvalTxHash as `0x${string}` | undefined,
		onSuccess: () => {
			console.log('Approval transaction confirmed')
			// Note: Don't refetch balance here to avoid loops, useEffect below handles it
		},
		onError: (error) => {
			console.error('Approval transaction failed:', error)
		},
	})

	// Update transactions with hash when available
	useEffect(() => {
		if (approvalTxHash && address) {
			const userTransactions = getUserTransactions(address)
			const pendingApproval = userTransactions.find(
				(tx) =>
					tx.type === 'approval' &&
					tx.status === 'pending' &&
					!tx.hash &&
					tx.fromToken === bridgeState.fromToken
			)
			if (pendingApproval) {
				updateTransaction(pendingApproval.id, { hash: approvalTxHash })
			}
		}
	}, [
		approvalTxHash,
		address,
		bridgeState.fromToken,
		getUserTransactions,
		updateTransaction,
	])

	useEffect(() => {
		if (txHash && address && transactionId) {
			const userTransactions = getUserTransactions(address)
			const pendingBridge = userTransactions.find(
				(tx) =>
					tx.type === 'bridge' &&
					tx.status === 'pending' &&
					!tx.hash &&
					tx.transactionId === transactionId
			)
			if (pendingBridge) {
				updateTransaction(pendingBridge.id, { hash: txHash })
			}
		}
	}, [txHash, address, transactionId, getUserTransactions, updateTransaction])

	// Monitor bridge transaction
	useTransactionMonitor({
		hash: txHash as `0x${string}` | undefined,
		transactionId,
		onSuccess: () => {
			console.log('Bridge transaction confirmed')
			// Note: Don't refetch balance here to avoid loops, useEffect below handles it
			// Reset form after successful bridge
			setBridgeState((prev) => ({
				...prev,
				amount: '',
				recipient: prev.useConnectedWallet ? '' : prev.recipient,
			}))
		},
		onError: (error) => {
			console.error('Bridge transaction failed:', error)
		},
	})

	// Auto-switch wallet to the selected "from" network
	useEffect(() => {
		const fromChain = getChainByKey(bridgeState.fromNetwork)
		if (fromChain && currentChainId !== fromChain.chainId && switchChain) {
			switchChain({ chainId: fromChain.chainId })
		}
	}, [bridgeState.fromNetwork, currentChainId, switchChain])

	const updateBridgeState = (updates: Partial<BridgeState>) => {
		setBridgeState((prev) => {
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

			return newState
		})
	}

	// Reset approval status when approval is successful (with debouncing to prevent loops)
	useEffect(() => {
		if (isApprovalSuccess || bridgeSuccess) {
			const timer = setTimeout(() => {
				refetchBalance()
			}, 2000) // Wait 2 seconds before refetching to avoid loops
			return () => clearTimeout(timer)
		}
	}, [isApprovalSuccess, bridgeSuccess, refetchBalance])

	const swapNetworks = () => {
		setBridgeState((prev) => ({
			...prev,
			fromNetwork: prev.toNetwork,
			toNetwork: prev.fromNetwork,
			fromToken: prev.toToken,
			toToken: prev.fromToken,
		}))
	}

	const handleApprove = () => {
		if (!isConnected || !address) {
			alert(t('messages.pleaseConnectWallet'))
			return
		}

		// Add approval transaction to history
		if (fromChain && toChain && token) {
			addTransaction({
				type: 'approval',
				status: 'pending',
				fromToken: bridgeState.fromToken,
				toToken: bridgeState.fromToken, // Same token for approval
				fromNetwork: fromChain.chainName.toLowerCase(),
				toNetwork: fromChain.chainName.toLowerCase(), // Same network for approval
				amount: bridgeState.amount,
				amountFormatted: bridgeState.amount,
				userAddress: address,
				recipient: address,
				estimatedTime: '2-3 min',
				explorerUrl:
					fromChain.chainId === 11155111
						? 'https://sepolia.etherscan.io'
						: fromChain.chainId === 84532
						? 'https://sepolia.basescan.org'
						: 'https://etherscan.io',
			})
		}

		approveToken()
	}

	const handleBridge = () => {
		if (!isConnected || !address) {
			alert(t('messages.pleaseConnectWallet'))
			return
		}

		if (!isSwapBridgeOperation && needsApproval) {
			alert(t('messages.pleaseApproveToken'))
			return
		}

		if (!isValidParams) {
			alert('Please check your inputs and try again')
			return
		}

		// Add transaction to history based on operation type
		if (fromChain && toChain && (token || fromTokenData)) {
			addTransaction({
				type: isSwapBridgeOperation ? 'swap-bridge' : 'bridge',
				status: 'pending',
				fromToken: bridgeState.fromToken,
				toToken: bridgeState.toToken,
				fromNetwork: fromChain.chainName.toLowerCase(),
				toNetwork: toChain.chainName.toLowerCase(),
				amount: bridgeState.amount,
				amountFormatted: bridgeState.amount,
				userAddress: address,
				recipient: bridgeState.useConnectedWallet
					? address
					: bridgeState.recipient,
				fee: bridgeFeeFormatted,
				transactionId: transactionId || undefined,
				estimatedTime: isSwapBridgeOperation ? '10-15 min' : '5-10 min',
				explorerUrl:
					fromChain.chainId === 11155111
						? 'https://sepolia.etherscan.io'
						: fromChain.chainId === 84532
						? 'https://sepolia.basescan.org'
						: 'https://etherscan.io',
			})
		}

		// Execute the appropriate operation
		bridge()
	}

	const canBridge = () => {
		if (
			!isConnected ||
			!bridgeState.amount ||
			parseFloat(bridgeState.amount) <= 0
		) {
			return false
		}

		if (bridgeState.fromNetwork === bridgeState.toNetwork) {
			return false
		}

		if (isSwapBridgeOperation) {
			// For swap+bridge, use the swap bridge validation
			return isValidParams && !isProcessing
		} else {
			// For regular bridge, use the existing validation
			return (
				parseFloat(fromTokenBalance || '0') >=
					parseFloat(bridgeState.amount || '0') && meetsMinimumAmount
			)
		}
	}

	const getStepDescription = (step: string) => {
		switch (step) {
			case 'swap-to-vnst':
				return `Swapping ${bridgeState.fromToken} to VNST on ${fromChain?.chainName}`
			case 'bridge-vnst':
				return `Bridging VNST from ${fromChain?.chainName} to ${toChain?.chainName}`
			case 'swap-from-vnst':
				return `Swapping VNST to ${bridgeState.toToken} on ${toChain?.chainName}`
			case 'completed':
				return isSwapBridgeOperation
					? 'Swap + Bridge completed successfully!'
					: 'Bridge completed successfully!'
			case 'error':
				return 'Process failed'
			default:
				return isSwapBridgeOperation
					? 'Ready to start swap + bridge'
					: 'Ready to start bridge'
		}
	}

	const progressPercentage = isSwapBridgeOperation
		? (currentStepNumber / totalSteps) * 100
		: 0

	return (
		<Card className="lotus-card">
			<CardHeader>
				<CardTitle className="flex items-center space-x-3">
					<div className="lotus-float">
						<LotusIcon size={100} />
					</div>
					<span className="lotus-text-gradient">
						{isSwapBridgeOperation ? 'Swap + Bridge' : t('bridge.title')}
					</span>
				</CardTitle>
				<p className="text-sm text-muted-foreground mt-2">
					{isSwapBridgeOperation
						? 'Convert tokens across different chains via VNST'
						: t('bridge.selectNetworksAndTokens')}
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Progress Section for Swap+Bridge */}
				{isSwapBridgeOperation && (isProcessing || isCompleted || hasError) && (
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<Label className="text-sm font-medium">Progress</Label>
							<span className="text-sm text-gray-500">
								Step {currentStepNumber} of {totalSteps}
							</span>
						</div>
						<Progress value={progressPercentage} className="h-2" />
						<p className="text-sm text-gray-600">
							{getStepDescription(currentStep)}
						</p>

						{hasError && (
							<div className="p-3 bg-red-50 rounded-lg border border-red-200">
								<p className="text-sm text-red-800">{errorMessage}</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={resetSwapBridge}
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
									Successfully converted {bridgeState.amount}{' '}
									{bridgeState.fromToken} to {bridgeState.toToken}!
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
					<CompactNetworkTokenSelector
						networkValue={bridgeState.fromNetwork}
						tokenValue={bridgeState.fromToken}
						onNetworkChange={(network) =>
							updateBridgeState({ fromNetwork: network })
						}
						onTokenChange={(token) => updateBridgeState({ fromToken: token })}
						label={t('bridge.selectSourceAsset')}
						excludeChain={bridgeState.toNetwork}
					/>

					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label htmlFor="amount">{t('bridge.amount')}</Label>
							<Button
								variant="ghost"
								size="sm"
								className={`text-lotus-pink-dark hover:text-lotus-pink-dark h-auto p-0 ${
									isBalanceLoading ? 'shimmer-effect' : ''
								}`}
								disabled={isBalanceLoading}
							>
								{isBalanceLoading
									? t('bridge.loading')
									: `${t('bridge.balance')}: ${parseFloat(
											fromTokenBalance || '0'
									  ).toFixed(6)} ${bridgeState.fromToken}`}
							</Button>
						</div>
						<div className="relative">
							<Input
								id="amount"
								type="number"
								placeholder="0.0"
								value={bridgeState.amount}
								onChange={(e) => updateBridgeState({ amount: e.target.value })}
								className="text-2xl font-medium h-14 pr-20"
							/>
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-2 top-1/2 transform -translate-y-1/2 text-lotus-pink hover:text-lotus-pink-dark"
								onClick={() =>
									updateBridgeState({ amount: fromTokenBalance || '0' })
								}
							>
								MAX
							</Button>
						</div>
						<div className="text-sm text-gray-500">
							≈ ${(parseFloat(bridgeState.amount) || 0).toLocaleString()} USD
						</div>

						{/* Minimum Bridge Amount Validation */}
						{!isMinAmountLoading &&
							minBridgeAmountFormatted &&
							parseFloat(minBridgeAmountFormatted) > 0 && (
								<div
									className={`text-xs p-2 rounded-md ${
										meetsMinimumAmount
											? 'bg-green-50 text-green-700 border border-green-200'
											: 'bg-red-50 text-red-700 border border-red-200'
									}`}
								>
									{meetsMinimumAmount ? (
										<span>
											✓{' '}
											{t('bridge.meetsMinimumAmount', {
												amount: minBridgeAmountFormatted,
												token: bridgeState.fromToken,
											})}
										</span>
									) : (
										<span>
											⚠{' '}
											{t('bridge.minimumAmountRequired', {
												amount: minBridgeAmountFormatted,
												token: bridgeState.fromToken,
											})}
										</span>
									)}
								</div>
							)}
						{isMinAmountLoading && (
							<div className="text-xs text-gray-500 p-2 rounded-md bg-gray-50 border border-gray-200">
								<Loader2 className="h-3 w-3 animate-spin inline mr-1" />
								{t('bridge.loadingMinimumAmount')}
							</div>
						)}
					</div>
				</div>

				{/* Conversion Flow Visualization for Swap+Bridge */}
				{isSwapBridgeOperation && (
					<div className="flex items-center justify-center space-x-2 py-4">
						<div className="text-center">
							<div className="text-sm font-medium">{bridgeState.fromToken}</div>
							<div className="text-xs text-gray-500">
								{fromChain?.chainName}
							</div>
						</div>
						<ArrowRight className="h-4 w-4 text-gray-400" />
						<div className="text-center">
							<div className="text-sm font-medium text-blue-600">VNST</div>
							<div className="text-xs text-gray-500">Bridge Token</div>
						</div>
						<ArrowRight className="h-4 w-4 text-gray-400" />
						<div className="text-center">
							<div className="text-sm font-medium">{bridgeState.toToken}</div>
							<div className="text-xs text-gray-500">{toChain?.chainName}</div>
						</div>
					</div>
				)}

				{/* Swap Button */}
				<div className="flex justify-center relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-200"></div>
					</div>
					<Button
						variant="outline"
						size="icon"
						onClick={swapNetworks}
						className="relative bg-white border-2 border-pink-300 rounded-full w-12 h-12 hover:bg-pink-50 hover:border-pink-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
					>
						<ArrowDown className="h-5 w-5 text-pink-600" />
					</Button>
				</div>

				{/* To Section */}
				<div className="space-y-4">
					<Label className="text-base font-medium text-gray-900">
						{t('bridge.to')}
					</Label>
					<CompactNetworkTokenSelector
						networkValue={bridgeState.toNetwork}
						tokenValue={bridgeState.toToken}
						onNetworkChange={(network) =>
							updateBridgeState({ toNetwork: network })
						}
						onTokenChange={(token) => updateBridgeState({ toToken: token })}
						label={t('bridge.selectTargetAsset')}
						excludeChain={bridgeState.fromNetwork}
					/>

					<div className="space-y-2">
						<Label>
							{isSwapBridgeOperation
								? t('bridge.youWillReceive') + ' (Estimated)'
								: t('bridge.youWillReceive')}
						</Label>
						<div className="h-14 bg-gray-50 border border-gray-200 rounded-md flex items-center px-4">
							<span className="text-2xl font-medium text-gray-900">
								{isSwapBridgeOperation
									? estimatedFinalAmount || '0.0'
									: bridgeState.amount && bridgeFeeFormatted
									? (
											parseFloat(bridgeState.amount) -
											parseFloat(bridgeFeeFormatted)
									  ).toFixed(6)
									: '0.0'}
							</span>
							<span className="ml-2 text-gray-500">{bridgeState.toToken}</span>
						</div>
						{isSwapBridgeOperation
							? estimatedFinalAmount &&
							  simpleBridgeHook.exchangeRate && (
									<div className="text-xs text-gray-500">
										Exchange Rate: 1 {bridgeState.fromToken} ={' '}
										{simpleBridgeHook.exchangeRate} {bridgeState.toToken}
									</div>
							  )
							: bridgeState.amount &&
							  bridgeFeeFormatted && (
									<div className="text-xs text-gray-500">
										{t('bridge.amountAfterFee', {
											amount: bridgeState.amount,
											fee: bridgeFeeFormatted,
											result: (
												parseFloat(bridgeState.amount) -
												parseFloat(bridgeFeeFormatted)
											).toFixed(6),
										})}
									</div>
							  )}
					</div>

					{/* Recipient Address */}
					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="useConnectedWallet"
								checked={bridgeState.useConnectedWallet}
								onChange={(e) =>
									updateBridgeState({ useConnectedWallet: e.target.checked })
								}
								className="rounded border-pink-300 text-lotus-pink focus:ring-lotus-pink"
							/>
							<Label htmlFor="useConnectedWallet" className="text-sm">
								{t('bridge.sendToConnectedWallet')}
							</Label>
						</div>
						{!bridgeState.useConnectedWallet && (
							<div className="space-y-3">
								<Input
									placeholder={t('bridge.enterRecipientAddress')}
									value={bridgeState.recipient}
									onChange={(e) =>
										updateBridgeState({ recipient: e.target.value })
									}
								/>
								<AccountSelector
									onSelectAccount={(address) =>
										updateBridgeState({ recipient: address })
									}
									selectedAddress={bridgeState.recipient}
									disabled={!isConnected}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Advanced Options */}
				<AdvancedOptions
					isOpen={isAdvancedOpen}
					onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
					slippageTolerance={bridgeState.slippageTolerance}
					onSlippageChange={(slippage) =>
						updateBridgeState({ slippageTolerance: slippage })
					}
					isSwapBridgeOperation={isSwapBridgeOperation}
				/>

				{/* Transaction Details */}
				<TransactionDetails
					amount={bridgeState.amount}
					fromToken={bridgeState.fromToken}
					toToken={bridgeState.toToken}
					fromNetwork={bridgeState.fromNetwork}
					toNetwork={bridgeState.toNetwork}
					bridgeFee={bridgeFeeFormatted || '0'}
					poolStats={poolStats}
					transactionId={transactionId}
				/>

				{/* Bridge Fee Display */}
				{bridgeFeeFormatted && parseFloat(bridgeFeeFormatted) > 0 && (
					<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
						<div className="text-sm text-blue-800">
							<strong>{t('fees.fixedBridgeFee')}:</strong> {bridgeFeeFormatted}{' '}
							{token?.symbol || 'tokens'}
							<div className="text-xs text-blue-600 mt-1">
								{t('fees.lockReleaseInfo')}
							</div>
						</div>
					</div>
				)}

				{/* Pool Statistics */}
				{poolStats && !isPoolStatsLoading && (
					<div className="p-4 bg-green-50 rounded-lg border border-green-200">
						<div className="text-sm text-green-800">
							<strong>{t('fees.poolStatus')}:</strong>
							<div className="grid grid-cols-2 gap-2 mt-2 text-xs">
								{(() => {
									const tokenDecimals =
										getTokenDecimals(
											getChainByKey(bridgeState.fromNetwork)?.chainId || 0,
											bridgeState.fromToken
										) || 18
									const divisor = Math.pow(10, tokenDecimals)
									return (
										<>
											<div>
												{t('common.available')}:{' '}
												{(Number(poolStats.available) / divisor).toFixed(2)}
											</div>
											<div>
												{t('fees.totalBalance')}:{' '}
												{(Number(poolStats.balance) / divisor).toFixed(2)}
											</div>
											<div>
												{t('fees.locked')}:{' '}
												{(Number(poolStats.locked) / divisor).toFixed(2)}
											</div>
											<div>
												{t('fees.feesCollected')}:{' '}
												{(Number(poolStats.fees) / divisor).toFixed(6)}
											</div>
										</>
									)
								})()}
							</div>
						</div>
					</div>
				)}

				{/* Debug Info - Remove in production */}
				{process.env.NODE_ENV === 'development' && (
					<div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
						<div>
							{t('debug.validParams')}:{' '}
							{isValidParams ? t('debug.yes') : t('debug.no')}
						</div>
						<div>
							{t('debug.needsApproval')}:{' '}
							{needsApproval ? t('debug.yes') : t('debug.no')}
						</div>
						<div>
							{t('debug.allowanceLoading')}:{' '}
							{isAllowanceLoading ? t('debug.yes') : t('debug.no')}
						</div>
						<div>
							{t('debug.poolStatsLoading')}:{' '}
							{isPoolStatsLoading ? t('debug.yes') : t('debug.no')}
						</div>
						<div>
							{t('debug.transactionId')}:{' '}
							{transactionId || t('debug.notGenerated')}
						</div>
						<div>
							{t('debug.bridgeFee')}:{' '}
							{bridgeFeeFormatted || t('debug.notCalculated')}
						</div>
					</div>
				)}

				{/* Success/Error Messages */}
				{isApprovalSuccess && approvalTxHash && (
					<div className="p-4 bg-green-50 rounded-lg border border-green-200">
						<div className="text-sm text-green-800">
							<strong>{t('messages.approvalSuccessful')}</strong>
							<a
								href={`https://sepolia.etherscan.io/tx/${approvalTxHash}`}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-2 text-green-600 hover:text-green-800 inline-flex items-center"
							>
								{t('common.viewOnExplorer')}{' '}
								<ExternalLink className="w-3 h-3 ml-1" />
							</a>
						</div>
					</div>
				)}

				{approvalError && (
					<div className="p-4 bg-red-50 rounded-lg border border-red-200">
						<div className="text-sm text-red-800">
							<strong>{t('messages.approvalFailed')}:</strong>{' '}
							{approvalError.message}
						</div>
					</div>
				)}

				{bridgeSuccess && txHash && (
					<div className="p-4 bg-green-50 rounded-lg border border-green-200">
						<div className="text-sm text-green-800">
							<strong>{t('messages.bridgeSuccessful')}</strong>
							<a
								href={`https://sepolia.etherscan.io/tx/${txHash}`}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-2 text-green-600 hover:text-green-800 inline-flex items-center"
							>
								{t('common.viewOnExplorer')}{' '}
								<ExternalLink className="w-3 h-3 ml-1" />
							</a>
						</div>
					</div>
				)}

				{bridgeError && (
					<div className="p-4 bg-red-50 rounded-lg border border-red-200">
						<div className="text-sm text-red-800">
							<strong>{t('messages.bridgeFailed')}:</strong>{' '}
							{bridgeError.message}
						</div>
					</div>
				)}

				{/* Approval/Bridge Buttons */}
				{needsApproval && (
					<Button
						onClick={handleApprove}
						disabled={!canBridge() || isApproving || isAllowanceLoading}
						className="w-full h-14 text-lg font-medium bg-pink-300 hover:bg-pink-400 text-white disabled:opacity-50 backdrop-blur-md"
					>
						{isApproving ? (
							<div className="flex items-center space-x-2">
								<Loader2 className="w-5 h-5 animate-spin" />
								<span>{t('bridge.approvingToken')}</span>
							</div>
						) : isAllowanceLoading ? (
							<div className="flex items-center space-x-2">
								<Loader2 className="w-5 h-5 animate-spin" />
								<span>{t('bridge.checkingAllowance')}</span>
							</div>
						) : (
							t('bridge.approveTokenForBridge', {
								token: bridgeState.fromToken,
							})
						)}
					</Button>
				)}

				{/* Bridge Button */}
				<Button
					onClick={handleBridge}
					disabled={
						!canBridge() || isBridging || needsApproval || isAllowanceLoading
					}
					className="w-full h-14 text-lg font-medium bg-gradient-to-r from-lotus-pink to-lotus-pink-dark hover:from-lotus-pink-dark hover:to-lotus-pink disabled:opacity-50 transition-all duration-300 backdrop-blur-md text-white"
				>
					{isBridging ? (
						<div className="flex items-center space-x-2">
							<Loader2 className="w-5 h-5 animate-spin" />
							<span>
								{isSwapBridgeOperation ? 'Processing...' : t('bridge.bridging')}
							</span>
						</div>
					) : !isConnected ? (
						'Connect Wallet'
					) : isAllowanceLoading ? (
						<div className="flex items-center space-x-2">
							<Loader2 className="w-5 h-5 animate-spin" />
							<span>{t('bridge.checkingAllowance')}</span>
						</div>
					) : needsApproval ? (
						t('bridge.approveTokenFirst')
					) : !canBridge() ? (
						'Enter Valid Parameters'
					) : isSwapBridgeOperation ? (
						'Start Swap + Bridge'
					) : (
						t('bridge.bridgeTokens')
					)}
				</Button>
			</CardContent>
		</Card>
	)
}

export default BridgeInterface
