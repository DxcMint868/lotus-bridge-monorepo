import { useState, useEffect, useCallback, useMemo } from "react";
import {
	useAccount,
	useWriteContract,
	useWaitForTransactionReceipt,
	useReadContract,
} from "wagmi";
import { getChainByKey, getTokenBySymbol } from "@/lib/chains";
import { parseUnits, Address } from "viem";
import {
	sepolia,
	baseSepolia,
	mainnet,
	base,
	polygon,
	optimism,
	arbitrum,
} from "wagmi/chains";

interface SimpleBridgeParams {
	fromChainKey: string;
	toChainKey: string;
	fromToken: string;
	toToken: string;
	amount: string;
	recipient?: string;
}

interface SimpleBridgeResult {
	bridge: () => void;
	isLoading: boolean;
	isSuccess: boolean;
	error: any;
	txHash: string | undefined;
	reset: () => void;

	// Approval functions
	approveToken: () => void;
	isApproving: boolean;
	isApprovalSuccess: boolean;
	approvalError: any;
	approvalTxHash: string | undefined;
	needsApproval: boolean;

	// Allowance checking
	currentAllowance: bigint | undefined;
	isAllowanceLoading: boolean;
	allowanceError: any;

	// Chain and token data
	fromChain: any;
	toChain: any;
	fromTokenData: any;
	toTokenData: any;
	isValidParams: boolean;

	// Mock exchange data
	exchangeRate: number;
	estimatedOutput: string;
	mockQuote: any;
}

const MOCK_SERVER_URL = "http://localhost:3001";

// SwapBridge ABI for the contract interaction
const SWAP_BRIDGE_ABI = [
	{
		inputs: [
			{ name: "tokenIn", type: "address" },
			{ name: "tokenOut", type: "address" },
			{ name: "amountIn", type: "uint256" },
			{ name: "targetChain", type: "uint256" },
			{ name: "recipient", type: "address" },
			{ name: "minAmountOut", type: "uint256" },
		],
		name: "swapAndBridge",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

// ERC20 ABI for token approval
const ERC20_ABI = [
	{
		inputs: [
			{ name: "spender", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		name: "approve",
		outputs: [{ name: "", type: "bool" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "spender", type: "address" },
		],
		name: "allowance",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

export const useSimpleBridge = (
	params: SimpleBridgeParams
): SimpleBridgeResult => {
	const { address } = useAccount();
	const [mockQuote, setMockQuote] = useState<any>(null);
	const [exchangeRate, setExchangeRate] = useState(1);
	const [estimatedOutput, setEstimatedOutput] = useState("0");

	// Helper function to get wagmi chain object from chain ID
	const getWagmiChain = useCallback((chainId: number) => {
		switch (chainId) {
			case 1:
				return mainnet;
			case 8453:
				return base;
			case 137:
				return polygon;
			case 10:
				return optimism;
			case 42161:
				return arbitrum;
			case 11155111:
				return sepolia;
			case 84532:
				return baseSepolia;
			default:
				return undefined;
		}
	}, []);

	// Get chain and token data
	const fromChain = getChainByKey(params.fromChainKey);
	const toChain = getChainByKey(params.toChainKey);
	const fromTokenData = fromChain
		? getTokenBySymbol(fromChain.chainId, params.fromToken)
		: null;
	const toTokenData = toChain
		? getTokenBySymbol(toChain.chainId, params.toToken)
		: null;

	// Memoize derived values to prevent unnecessary re-calculations
	const isValidParams = useMemo(() => !!(
		params.fromChainKey &&
		params.toChainKey &&
		params.fromToken &&
		params.toToken &&
		params.amount &&
		parseFloat(params.amount) > 0 &&
		address &&
		fromTokenData &&
		toTokenData &&
		fromChain
	), [
		params.fromChainKey,
		params.toChainKey,
		params.fromToken,
		params.toToken,
		params.amount,
		address,
		fromTokenData,
		toTokenData,
		fromChain
	]);

	const amountIn = useMemo(() => 
		isValidParams ? parseUnits(params.amount, 18) : BigInt(0),
		[isValidParams, params.amount]
	);
	
	const recipient = params.recipient || address;
	const simpleSwapBridgeContract = fromChain?.simpleSwapBridgeContract;

	// Contract write hooks
	const {
		writeContract: writeBridge,
		data: txHash,
		error,
		isPending: isWritePending,
		reset: resetWrite,
	} = useWriteContract();

	const {
		writeContract: writeApproval,
		data: approvalTxHash,
		error: approvalError,
		isPending: isApprovalPending,
		reset: resetApproval,
	} = useWriteContract();

	// Transaction confirmation hooks
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt(
		{
			hash: txHash,
		}
	);

	const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } =
		useWaitForTransactionReceipt({
			hash: approvalTxHash,
		});

	const isLoading = isWritePending || isConfirming;
	const isApproving = isApprovalPending || isApprovalConfirming;

	// Check allowance
	const {
		data: currentAllowance,
		isLoading: isAllowanceLoading,
		error: allowanceError,
		refetch: refetchAllowance,
	} = useReadContract({
		address: fromTokenData?.tokenAddress as Address,
		abi: ERC20_ABI,
		functionName: "allowance",
		args:
			address && simpleSwapBridgeContract
				? [address, simpleSwapBridgeContract as Address]
				: undefined,
		query: {
			enabled: !!(
				address &&
				fromTokenData?.tokenAddress &&
				simpleSwapBridgeContract
			),
		},
	});

	const needsApproval = useMemo(() => !!(
		isValidParams &&
		currentAllowance !== undefined &&
		amountIn > 0 &&
		currentAllowance < amountIn
	), [isValidParams, currentAllowance, amountIn]);

	const fetchMockQuote = useCallback(async () => {
		// Only fetch if we have valid parameters to prevent infinite loops
		if (!params.fromToken || !params.toToken || !params.amount || parseFloat(params.amount) <= 0) {
			return;
		}
		
		try {
			const response = await fetch(
				`${MOCK_SERVER_URL}/api/quote/${params.fromToken}/${params.toToken}/${params.amount}`
			);
			if (response.ok) {
				const quote = await response.json();
				setMockQuote(quote);
				setExchangeRate(quote.exchangeRate);
				setEstimatedOutput(quote.amountOut);
			}
		} catch (err) {
			console.error("Failed to fetch mock quote:", err);
		}
	}, [params.fromToken, params.toToken, params.amount]);

	// Get mock quote when params change (with strict validation to prevent loops)
	useEffect(() => {
		// Only fetch if we have valid params AND the amount is actually different
		if (
			isValidParams && 
			params.amount && 
			parseFloat(params.amount) > 0 &&
			params.fromToken &&
			params.toToken &&
			params.fromToken !== params.toToken // Don't fetch for same token
		) {
			// Throttle API calls to prevent rapid requests
			const timer = setTimeout(() => {
				fetchMockQuote();
			}, 1000); // Wait 1 second before making API call
			return () => clearTimeout(timer);
		}
	}, [params.fromToken, params.toToken, params.amount, isValidParams]); // More specific dependencies

	// Refetch allowance after approval (with debouncing)
	useEffect(() => {
		if (isApprovalSuccess) {
			const timer = setTimeout(() => {
				refetchAllowance();
			}, 1000); // Wait 1 second before refetching
			return () => clearTimeout(timer);
		}
	}, [isApprovalSuccess]);

	const approveToken = useCallback(() => {
		if (
			!isValidParams ||
			!fromTokenData?.tokenAddress ||
			!simpleSwapBridgeContract
		) {
			console.error("Invalid params for approval");
			return;
		}

		const wagmiChain = getWagmiChain(fromChain!.chainId);
		if (!wagmiChain) {
			console.error("Unsupported chain ID:", fromChain!.chainId);
			return;
		}

		console.log("Approving tokens for SwapBridge contract:", {
			token: fromTokenData.tokenAddress,
			spender: simpleSwapBridgeContract,
			amount: amountIn.toString(),
		});

		// Approve a large amount for convenience
		const maxAllowance = BigInt(
			"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
		);

		writeApproval({
			address: fromTokenData.tokenAddress as Address,
			abi: ERC20_ABI,
			functionName: "approve",
			args: [simpleSwapBridgeContract as Address, maxAllowance],
			chain: wagmiChain,
			account: address,
		});
	}, [
		isValidParams,
		fromTokenData?.tokenAddress,
		simpleSwapBridgeContract,
		amountIn,
		writeApproval,
		fromChain,
		address,
	]);

	const bridge = useCallback(() => {
		if (
			!isValidParams ||
			!simpleSwapBridgeContract ||
			!fromTokenData ||
			!toTokenData
		) {
			console.error("Invalid params for bridge");
			return;
		}

		if (needsApproval) {
			console.error("Need approval first");
			return;
		}

		const wagmiChain = getWagmiChain(fromChain!.chainId);
		if (!wagmiChain) {
			console.error("Unsupported chain ID:", fromChain!.chainId);
			return;
		}

		const minAmountOut = parseUnits(
			(parseFloat(estimatedOutput) * 0.95).toString(),
			18
		); // 5% slippage

		console.log("Executing SwapBridge transaction:", {
			contract: simpleSwapBridgeContract,
			tokenIn: fromTokenData.tokenAddress,
			tokenOut: toTokenData.tokenAddress,
			amountIn: amountIn.toString(),
			targetChain: parseInt(params.toChainKey),
			recipient,
			minAmountOut: minAmountOut.toString(),
		});

		writeBridge({
			address: simpleSwapBridgeContract as Address,
			abi: SWAP_BRIDGE_ABI,
			functionName: "swapAndBridge",
			args: [
				fromTokenData.tokenAddress as Address,
				toTokenData.tokenAddress as Address,
				amountIn,
				BigInt(parseInt(params.toChainKey)),
				recipient as Address,
				minAmountOut,
			],
			chain: wagmiChain,
			account: address,
		});
	}, [
		isValidParams,
		simpleSwapBridgeContract,
		fromTokenData,
		toTokenData,
		needsApproval,
		estimatedOutput,
		amountIn,
		params.toChainKey,
		recipient,
		writeBridge,
		fromChain,
		address,
	]);

	const reset = useCallback(() => {
		resetWrite();
		resetApproval();
	}, [resetWrite, resetApproval]);

	return {
		bridge,
		isLoading,
		isSuccess,
		error,
		txHash,
		reset,

		// Approval functions
		approveToken,
		isApproving,
		isApprovalSuccess,
		approvalError,
		approvalTxHash,
		needsApproval,

		// Allowance checking
		currentAllowance,
		isAllowanceLoading,
		allowanceError,

		// Chain and token data
		fromChain,
		toChain,
		fromTokenData,
		toTokenData,
		isValidParams,

		// Mock exchange data
		exchangeRate,
		estimatedOutput,
		mockQuote,
	};
};
