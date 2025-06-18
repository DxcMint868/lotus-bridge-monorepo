import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TokenSelector from './TokenSelector'
import NetworkBridgeSelector from './NetworkBridgeSelector'
import TransactionDetails from './TransactionDetails'
import AdvancedOptions from './AdvancedOptions'
import LotusIcon from './LotusIcon'
import { ArrowDown, Loader2, ExternalLink } from 'lucide-react'
import { useSwitchChain, useChainId, useAccount } from 'wagmi'
import { getChainByKey, getChainEntries } from '@/lib/chains'
import { useBridge, BridgeParams } from '@/hooks/useBridge'
import { useTokenBalance } from '@/hooks/useTokenBalance'

interface BridgeState {
	fromNetwork: string
	toNetwork: string
	fromToken: string
	toToken: string
	amount: string
	recipient: string
	useConnectedWallet: boolean
}

const BridgeInterface = () => {
	const { switchChain } = useSwitchChain()
	const currentChainId = useChainId()
	const { address, isConnected } = useAccount()

	const [bridgeState, setBridgeState] = useState<BridgeState>({
		fromNetwork: '84532', // Base Sepolia
		toNetwork: '11155111', // Ethereum Sepolia
		fromToken: 'VNST',
		toToken: 'VNST',
		amount: '',
		recipient: '',
		useConnectedWallet: true,
	})

	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

	// Create bridge parameters for the hook
	const bridgeParams: BridgeParams = {
		fromChainKey: bridgeState.fromNetwork,
		toChainKey: bridgeState.toNetwork,
		tokenSymbol: bridgeState.fromToken,
		amount: bridgeState.amount,
		recipient: bridgeState.useConnectedWallet ? address : bridgeState.recipient,
	}

	// Bridge functionality using the new hook
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

		// Fee estimation
		estimatedFee,
		estimatedFeeFormatted,
		isFeeLoading,
		feeError,

		// Allowance checking
		needsApproval,
		currentAllowance,
		isAllowanceLoading,
		allowanceError,

		// Helper data
		fromChain,
		toChain,
		token,
		isValidParams,
	} = useBridge(bridgeParams)

	// Token balance for source token
	const {
		balance: fromTokenBalance,
		isLoading: isBalanceLoading,
		refetch: refetchBalance,
	} = useTokenBalance(bridgeState.fromNetwork, bridgeState.fromToken)

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
				// If user changes fromNetwork to match toNetwork, switch toNetwork to the first available different chain
				const availableChains = getChainEntries().filter(
					([chainKey]) => chainKey !== updates.fromNetwork
				)
				if (availableChains.length > 0) {
					newState.toNetwork = availableChains[0][0]
				}
			} else if (updates.toNetwork && updates.toNetwork === prev.fromNetwork) {
				// If user changes toNetwork to match fromNetwork, switch fromNetwork to the first available different chain
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

	// Reset approval status when approval is successful
	useEffect(() => {
		if (isApprovalSuccess) {
			// Refetch balance after successful approval
			refetchBalance()
		}
	}, [isApprovalSuccess, refetchBalance])

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
			alert('Please connect your wallet first')
			return
		}

		approveToken()
	}

	const handleBridge = () => {
		if (!isConnected || !address) {
			alert('Please connect your wallet first')
			return
		}

		if (needsApproval) {
			alert('Please approve the token first')
			return
		}

		bridge()
	}

	// Reset bridge state when transaction is successful
	useEffect(() => {
		if (bridgeSuccess) {
			// Refetch balance after successful bridge
			refetchBalance()
		}
	}, [bridgeSuccess, refetchBalance])

	const canBridge = () => {
		return (
			isConnected &&
			bridgeState.amount &&
			parseFloat(bridgeState.amount) > 0 &&
			parseFloat(fromTokenBalance || '0') >=
				parseFloat(bridgeState.amount || '0') &&
			bridgeState.fromNetwork !== bridgeState.toNetwork
		)
	}

	return (
		<Card className="lotus-card">
			<CardHeader>
				<CardTitle className="flex items-center space-x-3">
					<div className="lotus-float">
						<LotusIcon size={32} />
					</div>
					<span className="lotus-text-gradient">Bridge Assets</span>
				</CardTitle>
				<p className="text-sm text-muted-foreground mt-2">
					Select networks and tokens to bridge between different blockchains
				</p>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* From Section */}
				<div className="space-y-4">
					<Label className="text-base font-medium text-gray-900">From</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<NetworkBridgeSelector
							value={bridgeState.fromNetwork}
							onChange={(network) =>
								updateBridgeState({ fromNetwork: network })
							}
							label="Source Network"
							excludeChain={bridgeState.toNetwork}
						/>
						<TokenSelector
							networkChainId={
								getChainByKey(bridgeState.fromNetwork)?.chainId || 0
							}
							value={bridgeState.fromToken}
							onChange={(token) => updateBridgeState({ fromToken: token })}
							label="Source Token"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between items-center">
							<Label htmlFor="amount">Amount</Label>
							<Button
								variant="ghost"
								size="sm"
								className="text-lotus-pink hover:text-lotus-pink-dark h-auto p-0"
								disabled={isBalanceLoading}
							>
								{isBalanceLoading
									? 'Loading...'
									: `Balance: ${parseFloat(fromTokenBalance).toFixed(6)} ${
											bridgeState.fromToken
									  }`}
							</Button>
						</div>
						<div className="relative">
							<Input
								id="amount"
								type="number"
								placeholder="0.0"
								value={bridgeState.amount}
								onChange={(e) => updateBridgeState({ amount: e.target.value })}
								className="text-2xl font-medium h-14 pr-20 border-pink-200 focus:border-pink-400"
							/>
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-2 top-1/2 transform -translate-y-1/2 text-lotus-pink hover:text-lotus-pink-dark"
								onClick={() => updateBridgeState({ amount: fromTokenBalance })}
							>
								MAX
							</Button>
						</div>
						<div className="text-sm text-gray-500">
							≈ ${(parseFloat(bridgeState.amount) || 0).toLocaleString()} USD
						</div>
					</div>
				</div>

				{/* Swap Button */}
				<div className="flex justify-center">
					<Button
						variant="outline"
						size="icon"
						onClick={swapNetworks}
						className="rounded-full border-pink-200 hover:bg-pink-50 lotus-float"
					>
						<ArrowDown className="h-4 w-4 text-lotus-pink" />
					</Button>
				</div>

				{/* To Section */}
				<div className="space-y-4">
					<Label className="text-base font-medium text-gray-900">To</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<NetworkBridgeSelector
							value={bridgeState.toNetwork}
							onChange={(network) => updateBridgeState({ toNetwork: network })}
							label="Destination Network"
							excludeChain={bridgeState.fromNetwork}
						/>
						<TokenSelector
							networkChainId={
								getChainByKey(bridgeState.toNetwork)?.chainId || 0
							}
							value={bridgeState.toToken}
							onChange={(token) => updateBridgeState({ toToken: token })}
							label="Destination Token"
						/>
					</div>

					<div className="space-y-2">
						<Label>You will receive</Label>
						<div className="h-14 bg-gray-50 border border-gray-200 rounded-md flex items-center px-4">
							<span className="text-2xl font-medium text-gray-900">
								{bridgeState.amount
									? (parseFloat(bridgeState.amount) * 0.998).toFixed(6)
									: '0.0'}
							</span>
							<span className="ml-2 text-gray-500">{bridgeState.toToken}</span>
						</div>
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
								Send to connected wallet
							</Label>
						</div>
						{!bridgeState.useConnectedWallet && (
							<Input
								placeholder="Enter recipient address"
								value={bridgeState.recipient}
								onChange={(e) =>
									updateBridgeState({ recipient: e.target.value })
								}
								className="border-pink-200 focus:border-pink-400"
							/>
						)}
					</div>
				</div>

				{/* Advanced Options */}
				<AdvancedOptions
					isOpen={isAdvancedOpen}
					onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
				/>

				{/* Transaction Details */}
				<TransactionDetails
					amount={bridgeState.amount}
					fromToken={bridgeState.fromToken}
					toToken={bridgeState.toToken}
					fromNetwork={bridgeState.fromNetwork}
					toNetwork={bridgeState.toNetwork}
					bridgeFee={parseFloat(estimatedFeeFormatted).toFixed(6)}
				/>

				{/* Bridge Fee Display */}
				{estimatedFeeFormatted && parseFloat(estimatedFeeFormatted) > 0 && (
					<div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
						<div className="text-sm text-yellow-800">
							<strong>Estimated Bridge Fee:</strong>{' '}
							{parseFloat(estimatedFeeFormatted).toFixed(6)} ETH
							{isFeeLoading && (
								<span className="ml-2 text-xs">
									<Loader2 className="w-3 h-3 inline animate-spin" />
								</span>
							)}
						</div>
					</div>
				)}

				{/* Error Messages */}
				{feeError && (
					<div className="p-4 bg-red-50 rounded-lg border border-red-200">
						<div className="text-sm text-red-800">
							<strong>Fee Estimation Error:</strong> {feeError.message}
						</div>
					</div>
				)}

				{/* Debug Info - Remove in production */}
				{process.env.NODE_ENV === 'development' && (
					<div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
						<div>Valid Params: {isValidParams ? 'Yes' : 'No'}</div>
						<div>Needs Approval: {needsApproval ? 'Yes' : 'No'}</div>
						<div>Allowance Loading: {isAllowanceLoading ? 'Yes' : 'No'}</div>
						<div>Fee Loading: {isFeeLoading ? 'Yes' : 'No'}</div>
					</div>
				)}

				{/* Success/Error Messages */}
				{isApprovalSuccess && approvalTxHash && (
					<div className="p-4 bg-green-50 rounded-lg border border-green-200">
						<div className="text-sm text-green-800">
							<strong>Approval Successful!</strong>
							<a
								href={`https://sepolia.etherscan.io/tx/${approvalTxHash}`}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-2 text-green-600 hover:text-green-800 inline-flex items-center"
							>
								View on Explorer <ExternalLink className="w-3 h-3 ml-1" />
							</a>
						</div>
					</div>
				)}

				{approvalError && (
					<div className="p-4 bg-red-50 rounded-lg border border-red-200">
						<div className="text-sm text-red-800">
							<strong>Approval Failed:</strong> {approvalError.message}
						</div>
					</div>
				)}

				{bridgeSuccess && txHash && (
					<div className="p-4 bg-green-50 rounded-lg border border-green-200">
						<div className="text-sm text-green-800">
							<strong>Bridge Successful!</strong>
							<a
								href={`https://sepolia.etherscan.io/tx/${txHash}`}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-2 text-green-600 hover:text-green-800 inline-flex items-center"
							>
								View on Explorer <ExternalLink className="w-3 h-3 ml-1" />
							</a>
						</div>
					</div>
				)}

				{bridgeError && (
					<div className="p-4 bg-red-50 rounded-lg border border-red-200">
						<div className="text-sm text-red-800">
							<strong>Bridge Failed:</strong> {bridgeError.message}
						</div>
					</div>
				)}

				{/* Approval/Bridge Buttons */}
				{needsApproval && (
					<Button
						onClick={handleApprove}
						disabled={!canBridge() || isApproving || isAllowanceLoading}
						className="w-full h-14 text-lg font-medium bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
					>
						{isApproving ? (
							<div className="flex items-center space-x-2">
								<Loader2 className="w-5 h-5 animate-spin" />
								<span>Approving...</span>
							</div>
						) : isAllowanceLoading ? (
							<div className="flex items-center space-x-2">
								<Loader2 className="w-5 h-5 animate-spin" />
								<span>Checking Allowance...</span>
							</div>
						) : (
							`Approve ${bridgeState.fromToken} for Bridge`
						)}
					</Button>
				)}

				{/* Bridge Button */}
				<Button
					onClick={handleBridge}
					disabled={
						!canBridge() || isBridging || needsApproval || isAllowanceLoading
					}
					className="w-full h-14 text-lg font-medium lotus-gradient hover:opacity-90 text-white disabled:opacity-50"
				>
					{isBridging ? (
						<div className="flex items-center space-x-2">
							<Loader2 className="w-5 h-5 animate-spin" />
							<span>Bridging...</span>
						</div>
					) : !isConnected ? (
						'Connect Wallet to Bridge'
					) : isAllowanceLoading ? (
						<div className="flex items-center space-x-2">
							<Loader2 className="w-5 h-5 animate-spin" />
							<span>Checking Allowance...</span>
						</div>
					) : needsApproval ? (
						'Approve Token First'
					) : !canBridge() ? (
						'Enter Valid Amount'
					) : (
						`Bridge ${bridgeState.fromToken || 'Tokens'}`
					)}
				</Button>
			</CardContent>
		</Card>
	)
}

export default BridgeInterface
