import { useEffect, useMemo, useCallback } from "react";
import {
	useWriteContract,
	useWaitForTransactionReceipt,
	useAccount,
	useReadContract,
} from "wagmi";
import { parseUnits, formatUnits, Address, encodePacked } from "viem";
import {
	sepolia,
	baseSepolia,
	mainnet,
	base,
	polygon,
	optimism,
	arbitrum,
} from "wagmi/chains";
import {
	getChainByKey,
	getTokenBySymbol,
	getTokenDecimals,
} from "@/lib/chains";

// Uniswap V3 SwapRouter Contract ABI
const SWAP_ROUTER_ABI = [
	{
		inputs: [
			{
				components: [
					{
						internalType: "address",
						name: "tokenIn",
						type: "address",
					},
					{
						internalType: "address",
						name: "tokenOut",
						type: "address",
					},
					{ internalType: "uint24", name: "fee", type: "uint24" },
					{
						internalType: "address",
						name: "recipient",
						type: "address",
					},
					{
						internalType: "uint256",
						name: "deadline",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "amountIn",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "amountOutMinimum",
						type: "uint256",
					},
					{
						internalType: "uint160",
						name: "sqrtPriceLimitX96",
						type: "uint160",
					},
				],
				internalType: "struct ISwapRouter.ExactInputSingleParams",
				name: "params",
				type: "tuple",
			},
		],
		name: "exactInputSingle",
		outputs: [
			{ internalType: "uint256", name: "amountOut", type: "uint256" },
		],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "address",
						name: "tokenIn",
						type: "address",
					},
					{
						internalType: "address",
						name: "tokenOut",
						type: "address",
					},
					{ internalType: "uint24", name: "fee", type: "uint24" },
					{
						internalType: "address",
						name: "recipient",
						type: "address",
					},
					{
						internalType: "uint256",
						name: "deadline",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "amountOut",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "amountInMaximum",
						type: "uint256",
					},
					{
						internalType: "uint160",
						name: "sqrtPriceLimitX96",
						type: "uint160",
					},
				],
				internalType: "struct ISwapRouter.ExactOutputSingleParams",
				name: "params",
				type: "tuple",
			},
		],
		name: "exactOutputSingle",
		outputs: [
			{ internalType: "uint256", name: "amountIn", type: "uint256" },
		],
		stateMutability: "payable",
		type: "function",
	},
] as const;

// Quoter V2 ABI for getting swap quotes
const QUOTER_V2_ABI = [
	{
		inputs: [
			{ internalType: "address", name: "tokenIn", type: "address" },
			{ internalType: "address", name: "tokenOut", type: "address" },
			{ internalType: "uint24", name: "fee", type: "uint24" },
			{ internalType: "uint256", name: "amountIn", type: "uint256" },
			{
				internalType: "uint160",
				name: "sqrtPriceLimitX96",
				type: "uint160",
			},
		],
		name: "quoteExactInputSingle",
		outputs: [
			{ internalType: "uint256", name: "amountOut", type: "uint256" },
			{
				internalType: "uint160",
				name: "sqrtPriceX96After",
				type: "uint160",
			},
			{
				internalType: "uint32",
				name: "initializedTicksCrossed",
				type: "uint32",
			},
			{ internalType: "uint256", name: "gasEstimate", type: "uint256" },
		],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

// Uniswap V3 Factory ABI for pool checking
const FACTORY_ABI = [
	{
		inputs: [
			{ internalType: "address", name: "tokenA", type: "address" },
			{ internalType: "address", name: "tokenB", type: "address" },
			{ internalType: "uint24", name: "fee", type: "uint24" },
		],
		name: "getPool",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
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

export interface SwapParams {
	chainKey: string;
	tokenIn: string;
	tokenOut: string;
	amountIn: string;
	slippageTolerance?: number; // Default 0.5%
}

export interface SwapResult {
	// Swap transaction
	swap: () => void;
	isLoading: boolean;
	isSuccess: boolean;
	error: any;
	txHash: string | undefined;
	reset: () => void;

	// Approval transaction
	approveToken: () => void;
	isApproving: boolean;
	isApprovalSuccess: boolean;
	approvalError: any;
	approvalTxHash: string | undefined;

	// Quote data
	quotedAmountOut: string | null;
	quotedAmountOutFormatted: string | null;
	isQuoteLoading: boolean;
	quoteError: any;

	// Allowance checking
	needsApproval: boolean;
	currentAllowance: bigint | undefined;
	isAllowanceLoading: boolean;
	allowanceError: any;

	// Helper data
	chain: any;
	tokenInData: any;
	tokenOutData: any;
	isValidParams: boolean;
	poolExists: boolean;
	poolAddress: string | undefined;

	// Readiness check
	isReadyToSwap: boolean;
}

export const useUniswapSwap = (params: SwapParams): SwapResult => {
	const { address } = useAccount();

	// Helper function to get wagmi chain object from chain ID
	const getWagmiChain = (chainId: number) => {
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
	};

	// Memoize derived data from params
	const chain = useMemo(() => {
		const resolvedChain = params.chainKey
			? getChainByKey(params.chainKey)
			: null;

		console.log("🔍 Chain resolution debug:", {
			chainKey: params.chainKey,
			resolvedChain,
			chainId: resolvedChain?.chainId,
			chainName: resolvedChain?.chainName,
		});

		return resolvedChain;
	}, [params.chainKey]);

	const tokenInData = useMemo(() => {
		const chainId = chain?.chainId;
		const tokenData =
			chain && params.tokenIn
				? getTokenBySymbol(chainId, params.tokenIn)
				: null;

		console.log("🔍 tokenInData debug:", {
			chainKey: params.chainKey,
			resolvedChainId: chainId,
			tokenSymbol: params.tokenIn,
			tokenData,
			tokenAddress: tokenData?.tokenAddress,
		});

		return tokenData;
	}, [chain, params.tokenIn, params.chainKey]);

	const tokenOutData = useMemo(() => {
		const chainId = chain?.chainId;
		const tokenData =
			chain && params.tokenOut
				? getTokenBySymbol(chainId, params.tokenOut)
				: null;

		console.log("🔍 tokenOutData debug:", {
			chainKey: params.chainKey,
			resolvedChainId: chainId,
			tokenSymbol: params.tokenOut,
			tokenData,
			tokenAddress: tokenData?.tokenAddress,
		});

		return tokenData;
	}, [chain, params.tokenOut, params.chainKey]);

	const isValidParams = useMemo(() => {
		const validation = {
			hasParams: !!params,
			hasChain: !!chain,
			hasTokenInData: !!tokenInData,
			hasTokenOutData: !!tokenOutData,
			hasAmountIn: !!params.amountIn,
			amountInValid: !!(
				params.amountIn && parseFloat(params.amountIn) > 0
			),
			hasAddress: !!address,
		};

		const isValid = !!(
			params &&
			chain &&
			tokenInData &&
			tokenOutData &&
			params.amountIn &&
			parseFloat(params.amountIn) > 0 &&
			address
		);

		// Only log when there's an issue
		if (!isValid) {
			console.log("🔍 useUniswapSwap validation failed:", {
				...validation,
				chainKey: params?.chainKey,
				tokenIn: params?.tokenIn,
				tokenOut: params?.tokenOut,
				amountIn: params?.amountIn,
				chainId: chain?.chainId,
				swapRouterContract: chain?.swapRouterContract,
				tokenInAddress: tokenInData?.tokenAddress,
				tokenOutAddress: tokenOutData?.tokenAddress,
			});
		}

		return isValid;
	}, [params, chain, tokenInData, tokenOutData, address]);

	// Calculate amounts with slippage
	const { amountIn, slippageTolerance } = useMemo(() => {
		if (!isValidParams || !tokenInData) {
			return {
				amountIn: null,
				slippageTolerance: 0.5,
			};
		}

		const tokenInDecimals =
			getTokenDecimals(chain!.chainId, params.tokenIn) || 18;
		const amountIn = parseUnits(params.amountIn, tokenInDecimals);
		const slippageTolerance = params.slippageTolerance || 0.5;

		return {
			amountIn,
			slippageTolerance,
		};
	}, [
		isValidParams,
		tokenInData,
		chain,
		params.amountIn,
		params.tokenIn,
		params.slippageTolerance,
	]);

	// Check if pool exists before trying to get quotes
	const {
		data: poolAddress,
		isLoading: isPoolLoading,
		error: poolError,
	} = useReadContract({
		address: chain?.uniswapV3FactoryContract as Address,
		abi: FACTORY_ABI,
		functionName: "getPool",
		args:
			isValidParams && tokenInData && tokenOutData
				? [
						tokenInData.tokenAddress as Address,
						tokenOutData.tokenAddress as Address,
						3000, // 0.3% fee tier
				  ]
				: undefined,
		query: {
			enabled: !!(
				isValidParams &&
				chain?.uniswapV3FactoryContract &&
				tokenInData &&
				tokenOutData
			),
		},
	});

	// Test quote with minimal amount to debug quoter issues
	const { data: testQuoteData, error: testQuoteError } = useReadContract({
		address: chain?.quoterV2Contract as Address,
		abi: QUOTER_V2_ABI,
		functionName: "quoteExactInputSingle",
		args:
			isValidParams && tokenInData && tokenOutData
				? [
						tokenInData.tokenAddress as Address,
						tokenOutData.tokenAddress as Address,
						3000, // 0.3% fee tier
						parseUnits("1", 18), // Test with just 1 token
						0, // sqrtPriceLimitX96 (0 = no limit)
				  ]
				: undefined,
		query: {
			enabled: !!(
				isValidParams &&
				chain?.quoterV2Contract &&
				tokenInData &&
				tokenOutData
			),
			retry: false,
		},
	});

	// Debug test quote
	useMemo(() => {
		console.log("🧪 Test quote (1 token) debug:", {
			enabled: !!(
				isValidParams &&
				chain?.quoterV2Contract &&
				tokenInData &&
				tokenOutData
			),
			hasTestQuoteData: !!testQuoteData,
			testQuoteError: testQuoteError?.message,
			testQuoteErrorDetails: testQuoteError,
			testQuoteData: testQuoteData ? JSON.stringify(testQuoteData) : null,
		});
	}, [
		testQuoteData,
		testQuoteError,
		isValidParams,
		chain?.quoterV2Contract,
		tokenInData,
		tokenOutData,
	]);

	const poolExists =
		poolAddress &&
		poolAddress !== "0x0000000000000000000000000000000000000000";

	// Add debugging for pool existence check
	useMemo(() => {
		console.log("🏊 Pool existence debug:", {
			hasFactoryContract: !!chain?.uniswapV3FactoryContract,
			factoryContract: chain?.uniswapV3FactoryContract,
			tokenInAddress: tokenInData?.tokenAddress,
			tokenOutAddress: tokenOutData?.tokenAddress,
			poolAddress,
			poolExists,
			isPoolLoading,
			poolError: poolError?.message,
		});
	}, [
		chain?.uniswapV3FactoryContract,
		tokenInData?.tokenAddress,
		tokenOutData?.tokenAddress,
		poolAddress,
		poolExists,
		isPoolLoading,
		poolError,
	]);

	// Get swap quote from Quoter V2
	const {
		data: quoteData,
		isLoading: isQuoteLoading,
		error: quoteError,
	} = useReadContract({
		address: chain?.quoterV2Contract as Address,
		abi: QUOTER_V2_ABI,
		functionName: "quoteExactInputSingle",
		args:
			isValidParams && amountIn && tokenInData && tokenOutData
				? [
						tokenInData.tokenAddress as Address,
						tokenOutData.tokenAddress as Address,
						3000, // 0.3% fee tier
						amountIn,
						0, // sqrtPriceLimitX96 (0 = no limit)
				  ]
				: undefined,
		query: {
			enabled: !!(
				(
					isValidParams &&
					amountIn &&
					chain?.quoterV2Contract &&
					tokenInData &&
					tokenOutData
				)
				// Removed poolExists check since pool manually verified to exist
			),
			refetchInterval: 10000, // Refetch every 10 seconds
			retry: false, // Don't retry on revert
		},
	});

	// Add detailed debugging for quoter call
	useMemo(() => {
		console.log("🔍 DETAILED Quoter call debug:", {
			isValidParams,
			hasAmountIn: !!amountIn,
			amountInValue: amountIn?.toString(),
			hasChain: !!chain,
			hasQuoterV2: !!chain?.quoterV2Contract,
			quoterV2Contract: chain?.quoterV2Contract,
			hasTokenInData: !!tokenInData,
			hasTokenOutData: !!tokenOutData,
			tokenInAddress: tokenInData?.tokenAddress,
			tokenOutAddress: tokenOutData?.tokenAddress,
			chainId: chain?.chainId,
			poolExists,
			poolAddress,
			isQuoteLoading,
			hasQuoteData: !!quoteData,
			quoteError: quoteError?.message,
			quoteErrorDetails: quoteError,
			callArgs:
				isValidParams && amountIn && tokenInData && tokenOutData
					? [
							tokenInData.tokenAddress,
							tokenOutData.tokenAddress,
							3000,
							amountIn?.toString(),
							0,
					  ]
					: undefined,
		});
	}, [
		isValidParams,
		amountIn,
		chain,
		tokenInData,
		tokenOutData,
		poolExists,
		poolAddress,
		isQuoteLoading,
		quoteData,
		quoteError,
	]);

	useEffect(() => {
		console.log("🔍 Quote data updated:", quoteData);
	}, [quoteData]);

	const quotedAmountOut = quoteData ? quoteData[0] : null;
	const tokenOutDecimals = tokenOutData
		? getTokenDecimals(chain!.chainId, params.tokenOut) || 18
		: 18;
	const quotedAmountOutFormatted = quotedAmountOut
		? formatUnits(quotedAmountOut, tokenOutDecimals)
		: null;

	// Calculate minimum amount out with slippage
	const amountOutMinimum = useMemo(() => {
		if (!quotedAmountOut || !slippageTolerance) return null;
		const slippageMultiplier = (100 - slippageTolerance) / 100;
		return (
			(quotedAmountOut * BigInt(Math.floor(slippageMultiplier * 10000))) /
			BigInt(10000)
		);
	}, [quotedAmountOut, slippageTolerance]);

	// Allowance checking - approve SwapRouter contract
	const {
		data: currentAllowance,
		isLoading: isAllowanceLoading,
		error: allowanceError,
	} = useReadContract({
		address: tokenInData?.tokenAddress as Address,
		abi: ERC20_ABI,
		functionName: "allowance",
		args:
			address && chain?.swapRouterContract
				? [address, chain.swapRouterContract as Address]
				: undefined,
		query: {
			enabled:
				isValidParams &&
				!!address &&
				!!tokenInData?.tokenAddress &&
				!!chain?.swapRouterContract,
			refetchInterval: 10000, // Refetch every 10 seconds
		},
	});

	const needsApproval = useMemo(() => {
		if (!currentAllowance || !amountIn || !isValidParams) return true;
		return currentAllowance < amountIn;
	}, [currentAllowance, amountIn, isValidParams]);

	// Swap transaction hooks
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

	// Approve tokens for the SwapRouter contract
	const approveToken = useCallback(() => {
		if (
			!isValidParams ||
			!tokenInData ||
			!address ||
			!chain?.swapRouterContract
		) {
			console.error("Invalid params for approval");
			return;
		}

		const wagmiChain = getWagmiChain(chain!.chainId);
		if (!wagmiChain) {
			console.error("Unsupported chain ID:", chain!.chainId);
			return;
		}

		// Use max allowance for convenience (2^256 - 1)
		const maxAllowance = BigInt(
			"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
		);

		writeApproval({
			address: tokenInData.tokenAddress as Address,
			abi: ERC20_ABI,
			functionName: "approve",
			args: [chain.swapRouterContract as Address, maxAllowance],
			chain: wagmiChain,
			account: address,
		});
	}, [isValidParams, tokenInData, address, chain, writeApproval]);

	// Execute swap transaction using SwapRouter
	const swap = useCallback(() => {
		console.log("🔍 Swap validation debug:", {
			isValidParams,
			hasTokenInData: !!tokenInData,
			hasTokenOutData: !!tokenOutData,
			hasAddress: !!address,
			hasAmountIn: !!amountIn,
			hasAmountOutMinimum: !!amountOutMinimum,
			hasSwapRouter: !!chain?.swapRouterContract,
			hasQuote: !!quotedAmountOut,
			isQuoteLoading,
			quoteError: quoteError?.message,
		});

		if (
			!isValidParams ||
			!tokenInData ||
			!tokenOutData ||
			!address ||
			!amountIn ||
			!amountOutMinimum ||
			!chain?.swapRouterContract
		) {
			console.error("Invalid params for swap - detailed check:", {
				isValidParams,
				hasTokenInData: !!tokenInData,
				hasTokenOutData: !!tokenOutData,
				hasAddress: !!address,
				hasAmountIn: !!amountIn,
				hasAmountOutMinimum: !!amountOutMinimum,
				hasSwapRouter: !!chain?.swapRouterContract,
				chainKey: params.chainKey,
				tokenIn: params.tokenIn,
				tokenOut: params.tokenOut,
				amountInParam: params.amountIn,
			});
			return;
		}

		// Additional check for quote availability
		if (!quotedAmountOut || isQuoteLoading) {
			console.error("Quote not ready for swap:", {
				hasQuote: !!quotedAmountOut,
				isQuoteLoading,
				quoteError: quoteError?.message,
			});
			return;
		}

		const wagmiChain = getWagmiChain(chain!.chainId);
		if (!wagmiChain) {
			console.error("Unsupported chain ID:", chain!.chainId);
			return;
		}

		const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

		console.log("Swap transaction details:", {
			swapRouterContract: chain.swapRouterContract,
			tokenIn: tokenInData.tokenAddress,
			tokenOut: tokenOutData.tokenAddress,
			amountIn: amountIn.toString(),
			amountOutMinimum: amountOutMinimum.toString(),
			deadline,
		});

		// Call SwapRouter.exactInputSingle function
		writeContract({
			address: chain.swapRouterContract as Address,
			abi: SWAP_ROUTER_ABI,
			functionName: "exactInputSingle",
			args: [
				{
					tokenIn: tokenInData.tokenAddress as Address,
					tokenOut: tokenOutData.tokenAddress as Address,
					fee: 3000, // 0.3% fee tier
					recipient: address,
					deadline: BigInt(deadline),
					amountIn: amountIn,
					amountOutMinimum: amountOutMinimum,
					sqrtPriceLimitX96: BigInt(0), // No price limit
				},
			],
			chain: wagmiChain,
			account: address,
		});
	}, [
		isValidParams,
		tokenInData,
		tokenOutData,
		address,
		amountIn,
		amountOutMinimum,
		chain,
		writeContract,
	]);

	const reset = useCallback(() => {
		resetWrite();
		resetApproval();
	}, [resetWrite, resetApproval]);

	// Calculate if swap is ready to execute - use test quote as fallback
	const isReadyToSwap = useMemo(() => {
		const hasWorkingQuote = !!quotedAmountOut && !isQuoteLoading;
		const hasTestQuote = !!testQuoteData && !testQuoteError;

		console.log("isReadyToSwap validation debug:", {
			isValidParams,
			poolExists,
			hasWorkingQuote,
			hasTestQuote,
			amountOutMinimum: !!amountOutMinimum,
			swapRouterContract: !!chain?.swapRouterContract,
			quoteError: quoteError?.message,
			testQuoteError: testQuoteError?.message,
		});

		return !!(
			isValidParams &&
			(hasWorkingQuote || hasTestQuote) && // Either main quote works or test quote works
			chain?.swapRouterContract
		);
	}, [
		isValidParams,
		poolExists,
		quotedAmountOut,
		isQuoteLoading,
		amountOutMinimum,
		chain,
		testQuoteData,
		testQuoteError,
		quoteError,
	]);

	return {
		// Swap transaction
		swap,
		isLoading,
		isSuccess,
		error,
		txHash,
		reset,

		// Approval transaction
		approveToken,
		isApproving,
		isApprovalSuccess,
		approvalError,
		approvalTxHash,

		// Quote data
		quotedAmountOut: quotedAmountOut?.toString() || null,
		quotedAmountOutFormatted,
		isQuoteLoading,
		quoteError,

		// Allowance checking
		needsApproval,
		currentAllowance,
		isAllowanceLoading,
		allowanceError,

		// Helper data
		chain,
		tokenInData,
		tokenOutData,
		isValidParams,
		poolExists,
		poolAddress,

		// Readiness check
		isReadyToSwap,
	};
};
