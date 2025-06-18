import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits, Address } from "viem";
import { getChainByKey, getTokenBySymbol } from "@/lib/chains";

// Mock exchange rates (same as server.js)
const MOCK_EXCHANGE_RATES = {
	"VNST->VNDC": 1.0,
	"VNDC->VNST": 1.0,
	"VNST->AXS": 0.1,
	"AXS->VNST": 10.0,
	"VNDC->AXS": 0.1,
	"AXS->VNDC": 10.0,
	"VNST->SLP": 2.0,
	"SLP->VNST": 0.5,
	"VNDC->SLP": 2.0,
	"SLP->VNDC": 0.5,
};

// Simple Bridge Factory ABI for locking tokens
const BRIDGE_FACTORY_ABI = [
	{
		inputs: [
			{ internalType: "address", name: "token", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
			{ internalType: "uint256", name: "targetChain", type: "uint256" },
			{ internalType: "address", name: "recipient", type: "address" },
		],
		name: "reqBridge",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

// ERC20 ABI for approval
const ERC20_ABI = [
	{
		inputs: [
			{ internalType: "address", name: "spender", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "approve",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "owner", type: "address" },
			{ internalType: "address", name: "spender", type: "address" },
		],
		name: "allowance",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

export interface MockSwapBridgeParams {
	fromChainKey: string;
	toChainKey: string;
	fromToken: string;
	toToken: string;
	amountIn: string;
}

export interface MockSwapBridgeResult {
	// Quote data
	exchangeRate: number;
	quotedAmountOut: string | null;
	quotedAmountOutFormatted: string | null;
	
	// Bridge transaction
	bridge: () => void;
	isLoading: boolean;
	isSuccess: boolean;
	error: any;
	txHash: string | undefined;
	reset: () => void;

	// Approval
	approveToken: () => void;
	isApproving: boolean;
	isApprovalSuccess: boolean;
	approvalError: any;
	needsApproval: boolean;

	// Validation
	isValidParams: boolean;
	isReadyToBridge: boolean;

	// Helper data
	fromChain: any;
	toChain: any;
	fromTokenData: any;
	toTokenData: any;
}

function getMockExchangeRate(fromToken: string, toToken: string): number {
	const pair = `${fromToken}->${toToken}`;
	const rate = MOCK_EXCHANGE_RATES[pair as keyof typeof MOCK_EXCHANGE_RATES];
	
	if (!rate) {
		// Try reverse and invert
		const reversePair = `${toToken}->${fromToken}`;
		const reverseRate = MOCK_EXCHANGE_RATES[reversePair as keyof typeof MOCK_EXCHANGE_RATES];
		if (reverseRate) {
			return 1 / reverseRate;
		}
	}
	
	return rate || 1.0;
}

export const useMockSwapBridge = (params: MockSwapBridgeParams): MockSwapBridgeResult => {
	const { address } = useAccount();
	const [currentAllowance, setCurrentAllowance] = useState<bigint>(0n);

	// Memoize derived data
	const fromChain = useMemo(() => {
		return params.fromChainKey ? getChainByKey(params.fromChainKey) : null;
	}, [params.fromChainKey]);

	const toChain = useMemo(() => {
		return params.toChainKey ? getChainByKey(params.toChainKey) : null;
	}, [params.toChainKey]);

	const fromTokenData = useMemo(() => {
		return fromChain && params.fromToken
			? getTokenBySymbol(fromChain.chainId, params.fromToken)
			: null;
	}, [fromChain, params.fromToken]);

	const toTokenData = useMemo(() => {
		return toChain && params.toToken
			? getTokenBySymbol(toChain.chainId, params.toToken)
			: null;
	}, [toChain, params.toToken]);

	// Validation
	const isValidParams = useMemo(() => {
		return !!(
			params &&
			fromChain &&
			toChain &&
			fromTokenData &&
			toTokenData &&
			params.amountIn &&
			parseFloat(params.amountIn) > 0 &&
			address
		);
	}, [params, fromChain, toChain, fromTokenData, toTokenData, address]);

	// Calculate exchange rate and quote
	const { exchangeRate, quotedAmountOut, quotedAmountOutFormatted } = useMemo(() => {
		if (!isValidParams || !params.fromToken || !params.toToken || !params.amountIn) {
			return { exchangeRate: 1.0, quotedAmountOut: null, quotedAmountOutFormatted: null };
		}

		const rate = getMockExchangeRate(params.fromToken, params.toToken);
		const amountIn = parseFloat(params.amountIn);
		const amountOut = amountIn * rate;
		
		return {
			exchangeRate: rate,
			quotedAmountOut: amountOut.toString(),
			quotedAmountOutFormatted: amountOut.toFixed(6)
		};
	}, [isValidParams, params.fromToken, params.toToken, params.amountIn]);

	// Amount calculations
	const amountIn = useMemo(() => {
		if (!isValidParams || !fromTokenData) return null;
		try {
			return parseUnits(params.amountIn, fromTokenData.decimals || 18);
		} catch {
			return null;
		}
	}, [isValidParams, fromTokenData, params.amountIn]);

	// Check if approval is needed
	const needsApproval = useMemo(() => {
		if (!currentAllowance || !amountIn || !isValidParams) return true;
		return currentAllowance < amountIn;
	}, [currentAllowance, amountIn, isValidParams]);

	// Bridge transaction hooks
	const {
		writeContract,
		data: txHash,
		error,
		isPending: isWritePending,
		reset: resetWrite,
	} = useWriteContract();

	// Approval transaction hooks
	const {
		writeContract: writeApproval,
		data: approvalTxHash,
		error: approvalError,
		isPending: isApprovalPending,
		reset: resetApproval,
	} = useWriteContract();

	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
		hash: txHash,
	});

	const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } =
		useWaitForTransactionReceipt({
			hash: approvalTxHash,
		});

	const isLoading = isWritePending || isConfirming;
	const isApproving = isApprovalPending || isApprovalConfirming;

	// Readiness check
	const isReadyToBridge = useMemo(() => {
		return !!(
			isValidParams &&
			quotedAmountOut &&
			fromChain?.bridgeFactoryContract &&
			!needsApproval
		);
	}, [isValidParams, quotedAmountOut, fromChain, needsApproval]);

	// Approve tokens for bridge
	const approveToken = useCallback(() => {
		if (!isValidParams || !fromTokenData || !address || !fromChain?.bridgeFactoryContract) {
			console.error("Invalid params for approval");
			return;
		}

		// Use max allowance for convenience
		const maxAllowance = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

		writeApproval({
			address: fromTokenData.address as Address,
			abi: ERC20_ABI,
			functionName: "approve",
			args: [fromChain.bridgeFactoryContract as Address, maxAllowance],
		});
	}, [isValidParams, fromTokenData, address, fromChain, writeApproval]);

	// Execute bridge transaction
	const bridge = useCallback(() => {
		console.log("🌉 Mock bridge validation:", {
			isValidParams,
			hasFromChain: !!fromChain,
			hasToChain: !!toChain,
			hasFromTokenData: !!fromTokenData,
			hasAmountIn: !!amountIn,
			hasAddress: !!address,
			hasBridgeFactory: !!fromChain?.bridgeFactoryContract,
			needsApproval,
			isReadyToBridge
		});

		if (!isValidParams || !fromChain || !toChain || !fromTokenData || !amountIn || !address) {
			console.error("Invalid params for mock bridge");
			return;
		}

		if (!fromChain.bridgeFactoryContract) {
			console.error("No bridge factory contract for source chain");
			return;
		}

		if (needsApproval) {
			console.error("Token approval needed before bridging");
			return;
		}

		console.log("🌉 Mock bridge transaction:", {
			token: fromTokenData.address,
			amount: amountIn.toString(),
			targetChain: toChain.chainId,
			recipient: address,
			fromToken: params.fromToken,
			toToken: params.toToken,
			exchangeRate,
			quotedAmountOut
		});

		// Call bridge factory to lock tokens (will trigger relayer)
		writeContract({
			address: fromChain.bridgeFactoryContract as Address,
			abi: BRIDGE_FACTORY_ABI,
			functionName: "reqBridge",
			args: [
				fromTokenData.address as Address,
				amountIn,
				BigInt(toChain.chainId),
				address as Address,
			],
		});
	}, [
		isValidParams,
		fromChain,
		toChain,
		fromTokenData,
		amountIn,
		address,
		needsApproval,
		writeContract,
		params.fromToken,
		params.toToken,
		exchangeRate,
		quotedAmountOut
	]);

	const reset = useCallback(() => {
		resetWrite();
		resetApproval();
	}, [resetWrite, resetApproval]);

	// Log the mock operation for debugging
	useEffect(() => {
		if (isValidParams) {
			console.log("🎭 Mock Swap Bridge Setup:", {
				from: `${params.amountIn} ${params.fromToken} on ${fromChain?.chainName}`,
				to: `${quotedAmountOutFormatted} ${params.toToken} on ${toChain?.chainName}`,
				rate: `1 ${params.fromToken} = ${exchangeRate} ${params.toToken}`,
				isReadyToBridge,
				needsApproval
			});
		}
	}, [
		isValidParams,
		params.amountIn,
		params.fromToken,
		params.toToken,
		fromChain?.chainName,
		toChain?.chainName,
		quotedAmountOutFormatted,
		exchangeRate,
		isReadyToBridge,
		needsApproval
	]);

	return {
		// Quote data
		exchangeRate,
		quotedAmountOut,
		quotedAmountOutFormatted,

		// Bridge transaction
		bridge,
		isLoading,
		isSuccess,
		error,
		txHash,
		reset,

		// Approval
		approveToken,
		isApproving,
		isApprovalSuccess,
		approvalError,
		needsApproval,

		// Validation
		isValidParams,
		isReadyToBridge,

		// Helper data
		fromChain,
		toChain,
		fromTokenData,
		toTokenData,
	};
};
