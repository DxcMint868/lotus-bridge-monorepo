import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TransactionDetailsProps {
	amount: string
	fromToken: string
	toToken: string
	fromNetwork: string
	toNetwork: string
	bridgeFee: string
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
	amount,
	fromToken,
	toToken,
	fromNetwork,
	toNetwork,
	bridgeFee,
}) => {
	const bridgeAmount = parseFloat(amount) || 0
	// const bridgeFee = bridgeAmount * 0.001 // 0.1% bridge fee
	const gasFee = 0.005 // Estimated gas fee in ETH
	const exchangeRate = 0.998 // Slight slippage
	const estimatedTime = fromNetwork === 'ethereum' ? '15-30 min' : '5-10 min'

	if (!amount || bridgeAmount === 0) {
		return (
			<Card className="bg-gray-50 border-gray-200">
				<CardContent className="pt-6">
					<div className="text-center text-gray-500">
						Enter an amount to see transaction details
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="bg-gradient-to-r from-pink-50 to-green-50 border-pink-200">
			<CardHeader>
				<CardTitle className="text-lg lotus-text-gradient">
					Transaction Details
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Exchange Rate */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">Exchange Rate</span>
					<span className="font-medium">
						1 {fromToken} = {exchangeRate} {toToken}
					</span>
				</div>

				{/* Bridge Fee */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">Bridge Fee</span>
					<span className="font-medium">{bridgeFee} ETH</span>
				</div>

				{/* Gas Fee */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">Estimated Gas</span>
					<span className="font-medium">~{gasFee} ETH ($12.00)</span>
				</div>

				{/* Processing Time */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">Processing Time</span>
					<div className="flex items-center space-x-2">
						<span className="font-medium">{estimatedTime}</span>
						<Badge className="bg-lotus-green text-white">Fast</Badge>
					</div>
				</div>

				{/* Route Information */}
				<div className="pt-4 border-t border-pink-200">
					<div className="text-sm text-gray-600 mb-2">Bridge Route</div>
					<div className="flex items-center space-x-2 text-sm">
						<span className="font-medium capitalize">{fromNetwork}</span>
						<span className="text-gray-400">→</span>
						<span className="text-lotus-pink">Lotus Bridge</span>
						<span className="text-gray-400">→</span>
						<span className="font-medium capitalize">{toNetwork}</span>
					</div>
				</div>

				{/* Summary */}
				<div className="pt-4 border-t border-pink-200 bg-white/50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
					<div className="flex justify-between items-center text-lg font-medium">
						<span>You'll Receive</span>
						<span className="lotus-text-gradient">
							{(bridgeAmount * exchangeRate).toFixed(6)} {toToken}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default TransactionDetails
