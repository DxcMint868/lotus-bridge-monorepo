import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/contexts/LanguageContext'

interface PoolStats {
	balance: bigint
	locked: bigint
	fees: bigint
	available: bigint
}

interface TransactionDetailsProps {
	amount: string
	fromToken: string
	toToken: string
	fromNetwork: string
	toNetwork: string
	bridgeFee: string
	poolStats?: PoolStats
	transactionId?: string
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
	amount,
	fromToken,
	toToken,
	fromNetwork,
	toNetwork,
	bridgeFee,
	poolStats,
	transactionId,
}) => {
	const { t } = useTranslation()
	const bridgeAmount = parseFloat(amount) || 0
	const feeAmount = parseFloat(bridgeFee) || 0
	const receiveAmount = Math.max(0, bridgeAmount - feeAmount)
	const gasFee = 0.005 // Estimated gas fee in ETH
	const estimatedTime = '5-10 min' // Lock/Release is typically faster than LayerZero

	if (!amount || bridgeAmount === 0) {
		return (
			<Card className="bg-white/40 backdrop-blur-sm border-gray-200 shadow-sm">
				<CardContent className="pt-6">
					<div className="text-center text-gray-500">
						{t('transactionDetails.enterAmountToSeeDetails')}
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="bg-white/60 backdrop-blur-sm border-pink-200 shadow-sm">
			<CardHeader>
				<CardTitle className="text-lg lotus-text-gradient font-semibold">
					{t('transactionDetails.title')}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Bridge Type */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">
						{t('transactionDetails.bridgeType')}
					</span>
					<span className="font-medium">
						{t('transactionDetails.lockReleaseBridge')}
					</span>
				</div>

				{/* Bridge Fee */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">
						{t('transactionDetails.bridgeFee')}
					</span>
					<span className="font-medium">
						{feeAmount.toFixed(6)} {fromToken}
					</span>
				</div>

				{/* Amount After Fee */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">
						{t('transactionDetails.amountAfterFee')}
					</span>
					<span className="font-medium">
						{receiveAmount.toFixed(6)} {fromToken}
					</span>
				</div>

				{/* Gas Fee */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">
						{t('transactionDetails.estimatedGas')}
					</span>
					<span className="font-medium">~{gasFee} ETH ($12.00)</span>
				</div>

				{/* Processing Time */}
				<div className="flex justify-between items-center">
					<span className="text-gray-600">
						{t('transactionDetails.processingTime')}
					</span>
					<div className="flex items-center space-x-2">
						<span className="font-medium">{estimatedTime}</span>
						<Badge className="bg-lotus-green text-white">
							{t('transactionDetails.fast')}
						</Badge>
					</div>
				</div>

				{/* Transaction ID */}
				{transactionId && (
					<div className="flex justify-between items-center">
						<span className="text-gray-600">
							{t('transactionDetails.transactionId')}
						</span>
						<span className="font-mono text-xs text-gray-500">
							{transactionId.slice(0, 10)}...{transactionId.slice(-8)}
						</span>
					</div>
				)}

				{/* Pool Liquidity Status */}
				{poolStats && (
					<div className="flex justify-between items-center">
						<span className="text-gray-600">
							{t('transactionDetails.poolLiquidity')}
						</span>
						<div className="text-right">
							<span className="font-medium">
								{(Number(poolStats.available) / 1e18).toFixed(2)}{' '}
								{t('common.available')}
							</span>
							<div className="text-xs text-gray-500">
								{t('transactionDetails.ofPool', {
									percent: (
										(Number(poolStats.available) / Number(poolStats.balance)) *
										100
									).toFixed(1),
								})}
							</div>
						</div>
					</div>
				)}

				{/* Route Information */}
				<div className="pt-4 border-t border-pink-200">
					<div className="text-sm text-gray-600 mb-2">
						{t('transactionDetails.bridgeRoute')}
					</div>
					<div className="flex items-center space-x-2 text-sm">
						<span className="font-medium capitalize">{fromNetwork}</span>
						<span className="text-gray-400">→</span>
						<span className="text-lotus-pink-dark">
							{t('transactionDetails.lockReleasePool')}
						</span>
						<span className="text-gray-400">→</span>
						<span className="font-medium capitalize">{toNetwork}</span>
					</div>
				</div>

				{/* Summary */}
				<div className="pt-4 border-t border-pink-200 bg-white/50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
					<div className="flex justify-between items-center text-lg font-medium">
						<span>{t('transactionDetails.youllReceive')}</span>
						<span className="text-lotus-pink-dark">
							{receiveAmount.toFixed(6)} {toToken}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default TransactionDetails
