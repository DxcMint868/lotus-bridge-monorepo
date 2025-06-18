import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface AdvancedOptionsProps {
	isOpen: boolean
	onToggle: () => void
	slippageTolerance?: number
	onSlippageChange?: (slippage: number) => void
	isSwapBridgeOperation?: boolean
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
	isOpen,
	onToggle,
	slippageTolerance = 0.5,
	onSlippageChange,
	isSwapBridgeOperation = false,
}) => {
	const [localSlippage, setLocalSlippage] = useState(slippageTolerance.toString())
	const [deadline, setDeadline] = useState('20')
	const [gasBridging, setGasBridging] = useState(false)
	const [customRecipient, setCustomRecipient] = useState(false)

	// Update local slippage when prop changes
	React.useEffect(() => {
		setLocalSlippage(slippageTolerance.toString())
	}, [slippageTolerance])

	const handleSlippageChange = (newSlippage: string) => {
		setLocalSlippage(newSlippage)
		const numericSlippage = parseFloat(newSlippage) || 0.5
		onSlippageChange?.(numericSlippage)
	}

	const slippagePresets = ['0.1', '0.5', '1.0', '3.0']

	return (
		<Collapsible open={isOpen} onOpenChange={onToggle}>
			<CollapsibleTrigger asChild>
				<Button
					variant="ghost"
					className="w-full justify-between text-lotus-pink-light hover:text-lotus-pink-dark hover:bg-white/20 backdrop-blur-sm transition-all"
				>
					<span>Advanced Options</span>
					<span
						className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
					>
						▼
					</span>
				</Button>
			</CollapsibleTrigger>

			<CollapsibleContent className="mt-4">
				<Card className="bg-white/60 backdrop-blur-sm border-pink-200 shadow-sm">
					<CardContent className="pt-6 space-y-6">
						{/* Slippage Tolerance - Show for swap+bridge or always */}
						{(isSwapBridgeOperation || true) && (
							<div className="space-y-3">
								<Label className="text-base font-medium">
									Slippage Tolerance
									{isSwapBridgeOperation && (
										<span className="text-xs text-blue-600 ml-2">
											(Required for Swap + Bridge)
										</span>
									)}
								</Label>
								<div className="flex space-x-2">
									{slippagePresets.map((preset) => (
										<Button
											key={preset}
											variant={localSlippage === preset ? 'default' : 'outline'}
											size="sm"
											onClick={() => handleSlippageChange(preset)}
											className={
												localSlippage === preset
													? 'lotus-gradient text-white'
													: 'border-pink-200 hover:bg-pink-50'
											}
										>
											{preset}%
										</Button>
									))}
									<div className="relative flex-1">
										<Input
											type="number"
											value={localSlippage}
											onChange={(e) => handleSlippageChange(e.target.value)}
											className="border-pink-200 focus:border-pink-400"
											step="0.1"
											min="0"
											max="50"
										/>
										<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
											%
										</span>
									</div>
								</div>
								<p className="text-sm text-gray-600">
									Your transaction will revert if the price changes unfavorably by
									more than this percentage.
								</p>
							</div>
						)}

						{/* Transaction Deadline */}
						<div className="space-y-3">
							<Label className="text-base font-medium">
								Transaction Deadline
							</Label>
							<div className="relative">
								<Input
									type="number"
									value={deadline}
									onChange={(e) => setDeadline(e.target.value)}
									className="border-pink-200 focus:border-pink-400 pr-20"
									min="1"
									max="180"
								/>
								<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
									minutes
								</span>
							</div>
							<p className="text-sm text-gray-600">
								Your transaction will revert if it is pending for more than this
								long.
							</p>
						</div>

						{/* Gas Token Bridging */}
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label className="text-base font-medium">
									Bridge Gas Token
								</Label>
								<p className="text-sm text-gray-600">
									Automatically bridge some ETH for gas on the destination chain
								</p>
							</div>
							<Switch
								checked={gasBridging}
								onCheckedChange={setGasBridging}
								className="data-[state=checked]:bg-lotus-pink"
							/>
						</div>

						{gasBridging && (
							<div className="ml-4 space-y-2">
								<Label>Gas Amount</Label>
								<div className="relative">
									<Input
										type="number"
										placeholder="0.01"
										className="border-pink-200 focus:border-pink-400 pr-12"
										step="0.001"
									/>
									<span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
										ETH
									</span>
								</div>
							</div>
						)}

						{/* Custom Recipient */}
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label className="text-base font-medium">
									Custom Recipient
								</Label>
								<p className="text-sm text-gray-600">
									Send tokens to a different address than your connected wallet
								</p>
							</div>
							<Switch
								checked={customRecipient}
								onCheckedChange={setCustomRecipient}
								className="data-[state=checked]:bg-lotus-pink"
							/>
						</div>

						{customRecipient && (
							<div className="ml-4 space-y-2">
								<Label>Recipient Address</Label>
								<Input
									placeholder="0x..."
									className="border-pink-200 focus:border-pink-400"
								/>
							</div>
						)}
					</CardContent>
				</Card>
			</CollapsibleContent>
		</Collapsible>
	)
}

export default AdvancedOptions
