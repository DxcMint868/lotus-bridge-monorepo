import { useMemo, useCallback } from "react";
import {
	useWriteContract,
	useWaitForTransactionReceipt,
	useAccount,
	useBalance,
	useReadContract,
} from "wagmi";
import { parseUnits, formatUnits, Address } from "viem";
import {
	sepolia,
	baseSepolia,
	mainnet,
	base,
	polygon,
	optimism,
	arbitrum,
} from "wagmi/chains";
import { getChainByKey, getTokenBySymbol, ChainToken } from "@/lib/chains";

// ProxyOFT Contract ABI - only the functions we need
const PROXY_OFT_ABI = [
	{
		inputs: [
			{ internalType: "address", name: "_from", type: "address" },
			{ internalType: "uint16", name: "_dstChainId", type: "uint16" },
			{ internalType: "bytes32", name: "_toAddress", type: "bytes32" },
			{ internalType: "uint256", name: "_amount", type: "uint256" },
			{ internalType: "uint256", name: "_minAmount", type: "uint256" },
			{
				components: [
					{
						internalType: "address",
						name: "refundAddress",
						type: "address",
					},
					{
						internalType: "address",
						name: "zroPaymentAddress",
						type: "address",
					},
					{
						internalType: "bytes",
						name: "adapterParams",
						type: "bytes",
					},
				],
				internalType:
					"struct ILayerZeroUserApplicationConfig.LzCallParams",
				name: "_callParams",
				type: "tuple",
			},
		],
		name: "sendFrom",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint16", name: "_dstChainId", type: "uint16" },
			{ internalType: "bytes32", name: "_toAddress", type: "bytes32" }, // Changed from bytes to bytes32
			{ internalType: "uint256", name: "_amount", type: "uint256" },
			{ internalType: "bool", name: "_useZro", type: "bool" },
			{ internalType: "bytes", name: "_adapterParams", type: "bytes" },
		],
		name: "estimateSendFee",
		outputs: [
			{ internalType: "uint256", name: "nativeFee", type: "uint256" },
			{ internalType: "uint256", name: "zroFee", type: "uint256" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint16", name: "_dstChainId", type: "uint16" },
		],
		name: "minDstGasLookup",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint16", name: "_dstChainId", type: "uint16" },
			{ internalType: "uint16", name: "_type", type: "uint16" },
		],
		name: "minDstGasLookup",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
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

	// Fee estimation
	estimatedFee: bigint | null;
	estimatedFeeFormatted: string;
	isFeeLoading: boolean;
	feeError: Error | null;

	// Allowance checking
	needsApproval: boolean;
	currentAllowance: bigint | null;
	isAllowanceLoading: boolean;
	allowanceError: Error | null;

	// Helper data
	fromChain: any;
	toChain: any;
	token: any;
	isValidParams: boolean;
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

	// Helper function to convert address to bytes32
	const addressToBytes32 = (address: string): `0x${string}` => {
		return `0x${address.slice(2).padStart(64, "0")}` as `0x${string}`;
	};

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

	// Prepare transaction data
	const {
		amount,
		recipientAddress,
		toAddressBytes,
		gasLimit,
		adapterParams,
	} = useMemo(() => {
		if (!isValidParams || !params || !token) {
			return {
				amount: null,
				recipientAddress: null,
				toAddressBytes: null,
				gasLimit: 1000000,
				adapterParams: "0x" as `0x${string}`,
			};
		}

		const amount = parseUnits(params.amount, token.tokenDecimals);
		const recipientAddress = params.recipient || address;
		const toAddressBytes = addressToBytes32(recipientAddress!);
		const gasLimit = 1000000;

		// Create proper adapter params for LayerZero v2
		const gasLimitHex = gasLimit.toString(16).padStart(64, "0");
		const adapterParams = `0x0001${gasLimitHex}` as `0x${string}`;

		return {
			amount,
			recipientAddress,
			toAddressBytes,
			gasLimit,
			adapterParams,
		};
	}, [isValidParams, params, token, address]);

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

	// Fee estimation using wagmi
	const {
		data: feeData,
		isLoading: isFeeLoading,
		error: feeError,
	} = useReadContract({
		address: token.ProxyOFTAddress as Address,
		abi: PROXY_OFT_ABI,
		functionName: "estimateSendFee",
		args:
			toAddressBytes && toChain
				? [
						toChain.lzEndpointID,
						toAddressBytes,
						amount || 0n,
						false, // not use ZRO, use native
						adapterParams,
				  ]
				: undefined,
		query: {
			enabled: isValidParams && !!toAddressBytes && !!toChain && !!amount,
		},
	});

	const estimatedFee = feeData ? feeData[0] : null; // nativeFee
	const estimatedFeeFormatted = estimatedFee
		? formatUnits(estimatedFee, 18)
		: "0";

	// Allowance checking using wagmi
	const {
		data: currentAllowance,
		isLoading: isAllowanceLoading,
		error: allowanceError,
	} = useReadContract({
		address: token?.innerTokenAddress as Address,
		abi: ERC20_ABI,
		functionName: "allowance",
		args:
			address && token?.ProxyOFTAddress
				? [address, token.ProxyOFTAddress as Address]
				: undefined,
		query: {
			enabled:
				isValidParams &&
				!!address &&
				!!token?.innerTokenAddress &&
				!!token?.ProxyOFTAddress,
			refetchInterval: 10000, // Refetch every 10 seconds
		},
	});

	const needsApproval = useMemo(() => {
		if (!currentAllowance || !amount || !isValidParams) return true;
		return currentAllowance < amount;
	}, [currentAllowance, amount, isValidParams]);

	// Approve tokens for the bridge contract
	const approveToken = useCallback(() => {
		if (!isValidParams || !token || !address) {
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
			address: token.innerTokenAddress as Address,
			abi: ERC20_ABI,
			functionName: "approve",
			args: [token.ProxyOFTAddress as Address, maxAllowance],
			chain: wagmiChain,
			account: address,
		});
	}, [isValidParams, token, address, fromChain, writeApproval]);

	// Execute bridge transaction
	const bridge = useCallback(() => {
		if (
			!isValidParams ||
			!params ||
			!token ||
			!address ||
			!amount ||
			!toAddressBytes
		) {
			console.error("Invalid params for bridge");
			return;
		}

		const wagmiChain = getWagmiChain(fromChain!.chainId);
		if (!wagmiChain) {
			console.error("Unsupported chain ID:", fromChain!.chainId);
			return;
		}

		const lzCallParams = {
			refundAddress: address,
			zroPaymentAddress:
				"0x0000000000000000000000000000000000000000" as `0x${string}`,
			adapterParams,
		};

		// Calculate minimum amount (95% of amount to account for slippage)
		const minAmount = (amount * BigInt(95)) / BigInt(100);
		const finalMinAmount = minAmount > 0n ? minAmount : 1n;

		console.log("Bridge transaction details:", {
			tokenAddress: token.innerTokenAddress,
			proxyOFTAddress: token.ProxyOFTAddress,
			amount: amount.toString(),
			minAmount: finalMinAmount.toString(),
			amountFormatted: formatUnits(amount, token.tokenDecimals),
			toChainLzEndpointID: toChain!.lzEndpointID,
			fromChainId: fromChain!.chainId,
			estimatedFee: estimatedFee?.toString(),
			estimatedFeeFormatted,
		});

		console.log("destchain endpoint ID:", toChain!.lzEndpointID);

		writeContract({
			address: token.ProxyOFTAddress as Address,
			abi: PROXY_OFT_ABI,
			functionName: "sendFrom",
			args: [
				address,
				toChain!.lzEndpointID,
				toAddressBytes,
				amount,
				finalMinAmount,
				lzCallParams,
			],
			value: (estimatedFee * 200n) / 100n || parseUnits("0.001", 18), // Use estimated fee or fallback fee
			chain: wagmiChain,
			account: address,
		});
	}, [
		isValidParams,
		params,
		token,
		address,
		amount,
		toAddressBytes,
		adapterParams,
		fromChain,
		toChain,
		estimatedFee,
		estimatedFeeFormatted,
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
	};
};
