import { useMemo, useCallback } from "react";
import {
	useWriteContract,
	useWaitForTransactionReceipt,
	useAccount,
	useBalance,
	useReadContract,
} from "wagmi";
import {
	parseUnits,
	formatUnits,
	Address,
	keccak256,
	encodePacked,
} from "viem";
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
	getTokenBridgeAddresses,
	getTokenDecimals,
} from "@/lib/chains";

// BridgeFactory Contract ABI - for Lock/Release bridge
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
	{
		inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
		name: "estimateFee",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "token", type: "address" }],
		name: "getLPAddress",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "token", type: "address" }],
		name: "isTokenSupported",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "token", type: "address" }],
		name: "getMinBridgeAmount",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

// LiquidityPool Contract ABI - for getting stats only
const LIQUIDITY_POOL_ABI = [
	{
		inputs: [],
		name: "getStats",
		outputs: [
			{ internalType: "uint256", name: "balance", type: "uint256" },
			{ internalType: "uint256", name: "locked", type: "uint256" },
			{ internalType: "uint256", name: "fees", type: "uint256" },
			{ internalType: "uint256", name: "available", type: "uint256" },
		],
		stateMutability: "view",
		type: "function",
	},
] as const;

// ERC20 ABI for approval and transfers
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
	{
		inputs: [
			{ internalType: "address", name: "to", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ internalType: "bool", name: "", type: "bool" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "account", type: "address" }],
		name: "balanceOf",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
] as const;

export interface BridgeParams {
	fromChainKey: string;
	toChainKey: string;
	tokenSymbol: string;
	amount: string;
	recipient?: string;
}

export interface BridgeResult {
	// Bridge transaction
	bridge: () => void;
	isLoading: boolean;
	isSuccess: boolean;
	error: Error | null;
	txHash: string | undefined;
	reset: () => void;

	// Approval transaction
	approveToken: () => void;
	isApproving: boolean;
	isApprovalSuccess: boolean;
	approvalError: Error | null;
	approvalTxHash: string | undefined;

	// Bridge fee (simple fixed fee for Lock/Release bridge)
	bridgeFee: bigint;
	bridgeFeeFormatted: string;

	// Allowance checking
	needsApproval: boolean;
	currentAllowance: bigint | null;
	isAllowanceLoading: boolean;
	allowanceError: Error | null;

	// Pool statistics
	poolStats: {
		balance: bigint;
		locked: bigint;
		fees: bigint;
		available: bigint;
	} | null;
	isPoolStatsLoading: boolean;

	// Minimum bridge amount validation
	minBridgeAmount: bigint | null;
	minBridgeAmountFormatted: string;
	isMinAmountLoading: boolean;
	meetsMinimumAmount: boolean;

	// Helper data
	fromChain: any;
	toChain: any;
	token: any;
	isValidParams: boolean;
	transactionId: string | null;
}

export const useBridge = (params: BridgeParams): BridgeResult => {
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

	// Generate unique transaction ID
	const generateTransactionId = useCallback(
		(
			fromChainId: number,
			toChainId: number,
			sender: string,
			recipient: string,
			amount: bigint,
			timestamp: number
		): `0x${string}` => {
			return keccak256(
				encodePacked(
					[
						"uint256",
						"uint256",
						"address",
						"address",
						"uint256",
						"uint256",
					],
					[
						BigInt(fromChainId),
						BigInt(toChainId),
						sender as Address,
						recipient as Address,
						amount,
						BigInt(timestamp),
					]
				)
			);
		},
		[]
	);

	// Memoize derived data from params
	const fromChain = useMemo(() => {
		return params.fromChainKey ? getChainByKey(params.fromChainKey) : null;
	}, [params.fromChainKey]);

	const toChain = useMemo(() => {
		return params.toChainKey ? getChainByKey(params.toChainKey) : null;
	}, [params.toChainKey]);

	const token = useMemo(() => {
		return fromChain && params.tokenSymbol
			? getTokenBySymbol(fromChain.chainId, params.tokenSymbol)
			: null;
	}, [fromChain, params.tokenSymbol]);

	const isValidParams = useMemo(() => {
		return !!(
			params &&
			fromChain &&
			toChain &&
			token &&
			params.amount &&
			parseFloat(params.amount) > 0 &&
			address
		);
	}, [params, fromChain, toChain, token, address]);

	// Calculate bridge fee and amounts - using BridgeFactory estimated fee
	const { totalAmount, recipientAddress, transactionId } = useMemo(() => {
		if (!isValidParams || !token || !fromChain || !toChain) {
			return {
				totalAmount: null,
				recipientAddress: null,
				transactionId: null,
			};
		}

		// Get token decimals from configuration, fallback to 18
		const tokenDecimals =
			getTokenDecimals(fromChain.chainId, params.tokenSymbol) || 18;

		// For BridgeFactory, we pass the total amount and let the contract handle fee calculation
		const totalAmount = parseUnits(params.amount, tokenDecimals);
		const recipientAddress = params.recipient || address;
		const timestamp = Math.floor(Date.now() / 1000);

		const transactionId = generateTransactionId(
			fromChain.chainId,
			toChain.chainId,
			address!,
			recipientAddress!,
			totalAmount,
			timestamp
		);

		return {
			totalAmount,
			recipientAddress,
			transactionId,
		};
	}, [
		isValidParams,
		token,
		fromChain,
		toChain,
		params.amount,
		params.recipient,
		address,
		generateTransactionId,
	]);

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

	// Estimated bridge fee from BridgeFactory
	const { data: estimatedFeeData } = useReadContract({
		address: fromChain?.bridgeFactoryContract as Address,
		abi: BRIDGE_FACTORY_ABI,
		functionName: "estimateFee",
		args: totalAmount ? [totalAmount] : undefined,
		query: {
			enabled: !!fromChain?.bridgeFactoryContract && !!totalAmount,
			refetchInterval: 30000, // Refetch every 30 seconds
		},
	});

	// Pool statistics from LiquidityPool
	const { data: poolStatsData, isLoading: isPoolStatsLoading } =
		useReadContract({
			address: token?.liquidityPoolAddress as Address,
			abi: LIQUIDITY_POOL_ABI,
			functionName: "getStats",
			query: {
				enabled: !!token?.liquidityPoolAddress,
				refetchInterval: 30000, // Refetch every 30 seconds
			},
		});

	const poolStats = poolStatsData
		? {
				balance: poolStatsData[0],
				locked: poolStatsData[1],
				fees: poolStatsData[2],
				available: poolStatsData[3],
		  }
		: null;

	// Token decimals calculation
	const tokenDecimals =
		fromChain && params.tokenSymbol
			? getTokenDecimals(fromChain.chainId, params.tokenSymbol) || 18
			: 18;

	// Minimum bridge amount from BridgeFactory
	const { data: minBridgeAmountData, isLoading: isMinAmountLoading } =
		useReadContract({
			address: fromChain?.bridgeFactoryContract as Address,
			abi: BRIDGE_FACTORY_ABI,
			functionName: "getMinBridgeAmount",
			args: token?.tokenAddress
				? [token.tokenAddress as Address]
				: undefined,
			query: {
				enabled:
					!!fromChain?.bridgeFactoryContract && !!token?.tokenAddress,
				refetchInterval: 30000, // Refetch every 30 seconds
			},
		});

	const minBridgeAmount = minBridgeAmountData || null;
	const minBridgeAmountFormatted = minBridgeAmount
		? formatUnits(minBridgeAmount, tokenDecimals)
		: "0";

	// Check if current amount meets minimum requirement
	const meetsMinimumAmount = useMemo(() => {
		if (!minBridgeAmount || !totalAmount || !isValidParams) return false; // Default to true if no minimum set
		return totalAmount >= minBridgeAmount;
	}, [minBridgeAmount, totalAmount, isValidParams]);

	// Allowance checking - approve BridgeFactory contract
	const {
		data: currentAllowance,
		isLoading: isAllowanceLoading,
		error: allowanceError,
	} = useReadContract({
		address: token?.tokenAddress as Address,
		abi: ERC20_ABI,
		functionName: "allowance",
		args:
			address && fromChain?.bridgeFactoryContract
				? [address, fromChain.bridgeFactoryContract as Address]
				: undefined,
		query: {
			enabled:
				isValidParams &&
				!!address &&
				!!token?.tokenAddress &&
				!!fromChain?.bridgeFactoryContract,
			refetchInterval: 10000, // Refetch every 10 seconds
		},
	});

	const needsApproval = useMemo(() => {
		if (!currentAllowance || !totalAmount || !isValidParams) return true;
		console.log("Current allowance:", currentAllowance.toString());
		console.log("Total amount:", totalAmount.toString());
		return currentAllowance < totalAmount;
	}, [currentAllowance, totalAmount, isValidParams]);

	// Bridge fee calculation
	const bridgeFee = estimatedFeeData || BigInt(0);
	const bridgeFeeFormatted = bridgeFee
		? formatUnits(bridgeFee, tokenDecimals)
		: "0";

	// Approve tokens for the BridgeFactory contract
	const approveToken = useCallback(() => {
		if (
			!isValidParams ||
			!token ||
			!address ||
			!fromChain?.bridgeFactoryContract
		) {
			console.error("Invalid params for approval");
			return;
		}

		const wagmiChain = getWagmiChain(fromChain!.chainId);
		if (!wagmiChain) {
			console.error("Unsupported chain ID:", fromChain!.chainId);
			return;
		}

		// Use max allowance for convenience (2^256 - 1)
		const maxAllowance = BigInt(
			"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
		);

		writeApproval({
			address: token.tokenAddress as Address,
			abi: ERC20_ABI,
			functionName: "approve",
			args: [fromChain.bridgeFactoryContract as Address, maxAllowance],
			chain: wagmiChain,
			account: address,
		});
	}, [isValidParams, token, address, fromChain, writeApproval]);

	// Execute bridge transaction using BridgeFactory
	const bridge = useCallback(() => {
		if (
			!isValidParams ||
			!token ||
			!address ||
			!totalAmount ||
			!fromChain?.bridgeFactoryContract
		) {
			console.error("Invalid params for bridge");
			return;
		}

		const wagmiChain = getWagmiChain(fromChain!.chainId);
		if (!wagmiChain) {
			console.error("Unsupported chain ID:", fromChain!.chainId);
			return;
		}

		const tokenDecimals =
			getTokenDecimals(fromChain.chainId, params.tokenSymbol) || 18;

		console.log("Bridge transaction details:", {
			bridgeFactoryContract: fromChain.bridgeFactoryContract,
			tokenAddress: token.tokenAddress,
			liquidityPoolAddress: token.liquidityPoolAddress,
			sender: address,
			recipient: recipientAddress,
			totalAmount: totalAmount.toString(),
			targetChain: toChain!.chainId,
			amountFormatted: formatUnits(totalAmount, tokenDecimals),
			tokenDecimals,
		});

		// Call BridgeFactory.reqBridge function
		writeContract({
			address: fromChain.bridgeFactoryContract as Address,
			abi: BRIDGE_FACTORY_ABI,
			functionName: "reqBridge",
			args: [
				token.tokenAddress as Address, // token
				totalAmount, // amount (total amount including fee)
				BigInt(toChain!.chainId), // targetChain
				recipientAddress as Address, // recipient
			],
			chain: wagmiChain,
			account: address,
		});
	}, [
		isValidParams,
		token,
		address,
		totalAmount,
		fromChain,
		toChain,
		recipientAddress,
		writeContract,
	]);

	const reset = useCallback(() => {
		resetWrite();
		resetApproval();
	}, [resetWrite, resetApproval]);

	return {
		// Bridge transaction
		bridge,
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
	};
};
