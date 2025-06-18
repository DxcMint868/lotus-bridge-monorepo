import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowRight, Zap } from "lucide-react";
import { useMockSwapBridge } from "@/hooks/useMockSwapBridge";
import { NetworkSelector } from "./NetworkSelector";
import { TokenSelector } from "./TokenSelector";

export const MockSwapBridgeInterface: React.FC = () => {
	const [fromChainKey, setFromChainKey] = useState("ethereum-sepolia");
	const [toChainKey, setToChainKey] = useState("base-sepolia");
	const [fromToken, setFromToken] = useState("VNST");
	const [toToken, setToToken] = useState("VNDC");
	const [amountIn, setAmountIn] = useState("");

	const {
		exchangeRate,
		quotedAmountOut,
		quotedAmountOutFormatted,
		bridge,
		isLoading,
		isSuccess,
		error,
		txHash,
		reset,
		approveToken,
		isApproving,
		isApprovalSuccess,
		approvalError,
		needsApproval,
		isValidParams,
		isReadyToBridge,
		fromChain,
		toChain,
		fromTokenData,
		toTokenData,
	} = useMockSwapBridge({
		fromChainKey,
		toChainKey,
		fromToken,
		toToken,
		amountIn,
	});

	const handleSwapTokens = () => {
		// Swap the from/to tokens and chains
		setFromChainKey(toChainKey);
		setToChainKey(fromChainKey);
		setFromToken(toToken);
		setToToken(fromToken);
		setAmountIn(""); // Clear amount when swapping
	};

	const handleMaxAmount = () => {
		// For demo, set a reasonable amount
		setAmountIn("100");
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<Card className="bg-white/10 backdrop-blur-md border-white/20">
				<CardHeader>
					<CardTitle className="text-center flex items-center justify-center gap-2">
						<Zap className="h-5 w-5 text-yellow-400" />
						Mock Cross-Chain Bridge
						<Badge variant="secondary" className="text-xs">DEMO</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* From Section */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">From</Label>
						<div className="space-y-2">
							<NetworkSelector
								selectedChain={fromChainKey}
								onChainSelect={setFromChainKey}
								label="Source Chain"
							/>
							<div className="flex gap-2">
								<div className="flex-1">
									<TokenSelector
										selectedToken={fromToken}
										onTokenSelect={setFromToken}
										chainKey={fromChainKey}
									/>
								</div>
								<div className="flex-1">
									<Input
										type="number"
										placeholder="0.0"
										value={amountIn}
										onChange={(e) => setAmountIn(e.target.value)}
										className="bg-white/5 border-white/20"
									/>
								</div>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={handleMaxAmount}
								className="w-full text-xs"
							>
								Set Demo Amount (100)
							</Button>
						</div>
					</div>

					{/* Swap Button */}
					<div className="flex justify-center">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleSwapTokens}
							className="rounded-full p-2 hover:bg-white/10"
						>
							<ArrowDown className="h-4 w-4" />
						</Button>
					</div>

					{/* To Section */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">To</Label>
						<div className="space-y-2">
							<NetworkSelector
								selectedChain={toChainKey}
								onChainSelect={setToChainKey}
								label="Destination Chain"
							/>
							<div className="flex gap-2">
								<div className="flex-1">
									<TokenSelector
										selectedToken={toToken}
										onTokenSelect={setToToken}
										chainKey={toChainKey}
									/>
								</div>
								<div className="flex-1">
									<Input
										type="text"
										placeholder="0.0"
										value={quotedAmountOutFormatted || "0.0"}
										readOnly
										className="bg-white/5 border-white/20 text-gray-400"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Exchange Rate Display */}
					{isValidParams && quotedAmountOut && (
						<div className="bg-white/5 rounded-lg p-3 space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-400">Exchange Rate:</span>
								<span className="font-medium">
									1 {fromToken} = {exchangeRate} {toToken}
								</span>
							</div>
							<div className="flex items-center justify-center gap-2 text-xs text-gray-400">
								<Badge variant="outline" className="text-xs">Mock Rate</Badge>
								<span>Hardcoded for demo</span>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="space-y-2">
						{needsApproval && isValidParams && (
							<Button
								onClick={approveToken}
								disabled={isApproving}
								className="w-full bg-blue-600 hover:bg-blue-700"
							>
								{isApproving ? "Approving..." : `Approve ${fromToken}`}
							</Button>
						)}

						<Button
							onClick={bridge}
							disabled={!isReadyToBridge || isLoading}
							className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
						>
							{isLoading ? (
								"Processing..."
							) : (
								<>
									<ArrowRight className="mr-2 h-4 w-4" />
									Bridge {fromToken} → {toToken}
								</>
							)}
						</Button>
					</div>

					{/* Status Messages */}
					{!isValidParams && (
						<div className="text-center text-sm text-gray-400">
							Please fill in all fields to continue
						</div>
					)}

					{error && (
						<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
							<p className="text-red-400 text-sm">Error: {error.message}</p>
						</div>
					)}

					{approvalError && (
						<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
							<p className="text-red-400 text-sm">Approval Error: {approvalError.message}</p>
						</div>
					)}

					{isApprovalSuccess && (
						<div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
							<p className="text-green-400 text-sm">✅ Token approved successfully!</p>
						</div>
					)}

					{isSuccess && txHash && (
						<div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 space-y-2">
							<p className="text-green-400 text-sm">✅ Bridge transaction submitted!</p>
							<p className="text-xs text-gray-400 break-all">TX: {txHash}</p>
							<p className="text-xs text-gray-400">
								The relayer will process your cross-chain conversion...
							</p>
							<Button variant="outline" size="sm" onClick={reset} className="w-full">
								Start New Bridge
							</Button>
						</div>
					)}

					{/* Demo Instructions */}
					<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
						<h4 className="text-sm font-medium text-yellow-400 mb-2">Demo Instructions:</h4>
						<ul className="text-xs text-gray-400 space-y-1">
							<li>• Try VNST ↔ VNDC (1:1 rate)</li>
							<li>• Or VNST ↔ AXS (1:0.1 rate)</li>
							<li>• Relayer converts tokens automatically</li>
							<li>• Check console for processing logs</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
