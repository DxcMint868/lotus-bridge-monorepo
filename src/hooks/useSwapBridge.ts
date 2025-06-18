import { useMemo, useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { useUniswapSwap } from "./useUniswapSwap";
import { useBridge } from "./useBridge";
import {
	getChainByKey,
	getTokenBySymbol,
	getTokenDecimals,
} from "@/lib/chains";

export interface SwapBridgeParams {
	fromChainKey: string;
	toChainKey: string;
	fromToken: string;
	toToken: string;
	amount: string;
	recipient?: string;
	slippageTolerance?: number;
}

export interface SwapBridgeResult {
	// Current step in the process
	currentStep:
		| "idle"
		| "swap-to-vnst"
		| "bridge-vnst"
		| "swap-from-vnst"
		| "completed"
		| "error";

	// Overall process state
	isProcessing: boolean;
	isCompleted: boolean;
	hasError: boolean;
	errorMessage: string | null;

	// Step results
	swapToVnstResult: any;
	bridgeResult: any;
	swapFromVnstResult: any;

	// Actions
	startSwapBridge: () => void;
	reset: () => void;

	// Estimated amounts
	estimatedVnstAmount: string | null;
	estimatedFinalAmount: string | null;
	totalSteps: number;
	currentStepNumber: number;

	// Helper data
	fromChain: any;
	toChain: any;
	fromTokenData: any;
	toTokenData: any;
	vnstTokenData: any;
	isValidParams: boolean;
}

export const useSwapBridge = (params: SwapBridgeParams): SwapBridgeResult => {
	const { address } = useAccount();
	const [currentStep, setCurrentStep] = useState<
		| "idle"
		| "swap-to-vnst"
		| "bridge-vnst"
		| "swap-from-vnst"
		| "completed"
		| "error"
	>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [vnstAmount, setVnstAmount] = useState<string>("0");

	// Memoize derived data from params
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

	const vnstTokenData = useMemo(() => {
		return fromChain ? getTokenBySymbol(fromChain.chainId, "VNST") : null;
	}, [fromChain]);

	const vnstTokenDataDestination = useMemo(() => {
		return toChain ? getTokenBySymbol(toChain.chainId, "VNST") : null;
	}, [toChain]);

	const isValidParams = useMemo(() => {
		const validation = {
			hasParams: !!params,
			hasFromChain: !!fromChain,
			hasToChain: !!toChain,
			hasFromTokenData: !!fromTokenData,
			hasToTokenData: !!toTokenData,
			hasVnstTokenData: !!vnstTokenData,
			hasVnstTokenDataDestination: !!vnstTokenDataDestination,
			hasAmount: !!params.amount,
			amountValid: !!(params.amount && parseFloat(params.amount) > 0),
			hasAddress: !!address,
		};

		const isValid = !!(
			params &&
			fromChain &&
			toChain &&
			fromTokenData &&
			toTokenData &&
			vnstTokenData &&
			vnstTokenDataDestination &&
			params.amount &&
			parseFloat(params.amount) > 0 &&
			address
		);

		console.log("🔍 useSwapBridge validation:", {
			...validation,
			fromChainKey: params?.fromChainKey,
			toChainKey: params?.toChainKey,
			fromToken: params?.fromToken,
			toToken: params?.toToken,
			amount: params?.amount,
			fromChainId: fromChain?.chainId,
			toChainId: toChain?.chainId,
			isValid,
		});

		return isValid;
	}, [
		params,
		fromChain,
		toChain,
		fromTokenData,
		toTokenData,
		vnstTokenData,
		vnstTokenDataDestination,
		address,
	]);

	// Step 1: Swap from source token to VNST on source chain
	const swapToVnstParams = useMemo(() => {
		const swapParams = {
			chainKey: params.fromChainKey,
			tokenIn: params.fromToken,
			tokenOut: "VNST",
			amountIn: params.amount,
			slippageTolerance: params.slippageTolerance,
		};

		console.log("🔄 swapToVnstParams:", swapParams);
		return swapParams;
	}, [
		params.fromChainKey,
		params.fromToken,
		params.amount,
		params.slippageTolerance,
	]);

	const swapToVnstResult = useUniswapSwap(swapToVnstParams);

	// Step 2: Bridge VNST from source chain to destination chain
	const bridgeParams = useMemo(
		() => ({
			fromChainKey: params.fromChainKey,
			toChainKey: params.toChainKey,
			tokenSymbol: "VNST",
			amount: vnstAmount,
			recipient: params.recipient,
		}),
		[params.fromChainKey, params.toChainKey, vnstAmount, params.recipient]
	);

	const bridgeResult = useBridge(bridgeParams);

	// Step 3: Swap from VNST to destination token on destination chain
	const swapFromVnstParams = useMemo(() => {
		const swapParams = {
			chainKey: params.toChainKey,
			tokenIn: "VNST",
			tokenOut: params.toToken,
			amountIn: vnstAmount, // Use the amount we got from the bridge
			slippageTolerance: params.slippageTolerance,
		};

		console.log("🔄 swapFromVnstParams:", swapParams);
		return swapParams;
	}, [
		params.toChainKey,
		params.toToken,
		vnstAmount,
		params.slippageTolerance,
	]);

	const swapFromVnstResult = useUniswapSwap(swapFromVnstParams);

	// Calculate step progress
	const totalSteps = 3;
	const currentStepNumber = useMemo(() => {
		switch (currentStep) {
			case "idle":
				return 0;
			case "swap-to-vnst":
				return 1;
			case "bridge-vnst":
				return 2;
			case "swap-from-vnst":
				return 3;
			case "completed":
				return 3;
			case "error":
				return 0;
			default:
				return 0;
		}
	}, [currentStep]);

	// Handle step transitions based on transaction completion
	useMemo(() => {
		if (currentStep === "swap-to-vnst" && swapToVnstResult.isSuccess) {
			// First swap completed, update VNST amount and move to bridge step
			if (swapToVnstResult.quotedAmountOutFormatted) {
				setVnstAmount(swapToVnstResult.quotedAmountOutFormatted);
				setCurrentStep("bridge-vnst");
			}
		}

		if (currentStep === "bridge-vnst" && bridgeResult.isSuccess) {
			// Bridge completed, move to final swap step
			setCurrentStep("swap-from-vnst");
		}

		if (currentStep === "swap-from-vnst" && swapFromVnstResult.isSuccess) {
			// Final swap completed
			setCurrentStep("completed");
		}

		// Handle errors
		if (swapToVnstResult.error) {
			setCurrentStep("error");
			setErrorMessage(
				`Swap to VNST failed: ${swapToVnstResult.error.message}`
			);
		}

		if (bridgeResult.error) {
			setCurrentStep("error");
			setErrorMessage(`Bridge failed: ${bridgeResult.error.message}`);
		}

		if (swapFromVnstResult.error) {
			setCurrentStep("error");
			setErrorMessage(
				`Final swap failed: ${swapFromVnstResult.error.message}`
			);
		}
	}, [
		currentStep,
		swapToVnstResult.isSuccess,
		swapToVnstResult.error,
		swapToVnstResult.quotedAmountOutFormatted,
		bridgeResult.isSuccess,
		bridgeResult.error,
		swapFromVnstResult.isSuccess,
		swapFromVnstResult.error,
	]);

	// Start the swap + bridge process
	const startSwapBridge = useCallback(() => {
		if (!isValidParams) {
			setErrorMessage("Invalid parameters for swap + bridge");
			setCurrentStep("error");
			return;
		}

		console.log("🚀 Starting swap bridge process...");
		console.log("🔍 Swap to VNST validation:", {
			isValidParams: swapToVnstResult.isValidParams,
			hasQuote: !!swapToVnstResult.quotedAmountOut,
			isQuoteLoading: swapToVnstResult.isQuoteLoading,
			isReadyToSwap: swapToVnstResult.isReadyToSwap,
			quoteError: swapToVnstResult.quoteError?.message,
		});

		setCurrentStep("swap-to-vnst");
		setErrorMessage(null);

		// Check if the swap is ready (has valid params and quote)
		if (swapToVnstResult.isReadyToSwap) {
			console.log("✅ Swap ready, starting immediately");
			swapToVnstResult.swap();
		} else {
			console.log("⏳ Waiting for swap to be ready...");
			// Quote will trigger the swap when ready via useEffect below
		}
	}, [isValidParams, swapToVnstResult.swap, swapToVnstResult.isReadyToSwap]);

	// Auto-start swap when quote becomes ready
	useMemo(() => {
		if (
			currentStep === "swap-to-vnst" &&
			swapToVnstResult.isReadyToSwap &&
			!swapToVnstResult.isLoading &&
			!swapToVnstResult.isSuccess
		) {
			console.log("✅ First swap ready, auto-starting swap");
			setTimeout(() => {
				swapToVnstResult.swap();
			}, 100);
		}
	}, [
		currentStep,
		swapToVnstResult.isReadyToSwap,
		swapToVnstResult.isLoading,
		swapToVnstResult.isSuccess,
		swapToVnstResult.swap,
	]);

	// Auto-execute next steps
	useMemo(() => {
		if (
			currentStep === "bridge-vnst" &&
			vnstAmount &&
			parseFloat(vnstAmount) > 0
		) {
			// Auto-start bridge after successful first swap
			setTimeout(() => {
				bridgeResult.bridge();
			}, 1000); // Small delay to ensure state is updated
		}

		if (
			currentStep === "swap-from-vnst" &&
			vnstAmount &&
			parseFloat(vnstAmount) > 0 &&
			swapFromVnstResult.isReadyToSwap &&
			!swapFromVnstResult.isLoading &&
			!swapFromVnstResult.isSuccess
		) {
			// Auto-start final swap after successful bridge (wait for quote)
			console.log("✅ Final swap ready, auto-starting final swap");
			setTimeout(() => {
				swapFromVnstResult.swap();
			}, 1000); // Small delay to ensure state is updated
		}
	}, [
		currentStep,
		vnstAmount,
		bridgeResult.bridge,
		swapFromVnstResult.swap,
		swapFromVnstResult.isReadyToSwap,
		swapFromVnstResult.isLoading,
		swapFromVnstResult.isSuccess,
	]);

	// Reset function
	const reset = useCallback(() => {
		setCurrentStep("idle");
		setErrorMessage(null);
		setVnstAmount("0");
		swapToVnstResult.reset();
		bridgeResult.reset();
		swapFromVnstResult.reset();
	}, [swapToVnstResult.reset, bridgeResult.reset, swapFromVnstResult.reset]);

	// State derivations
	const isProcessing =
		currentStep !== "idle" &&
		currentStep !== "completed" &&
		currentStep !== "error";
	const isCompleted = currentStep === "completed";
	const hasError = currentStep === "error";

	// Estimated amounts
	const estimatedVnstAmount = swapToVnstResult.quotedAmountOutFormatted;
	const estimatedFinalAmount = swapFromVnstResult.quotedAmountOutFormatted;

	return {
		// Current step in the process
		currentStep,

		// Overall process state
		isProcessing,
		isCompleted,
		hasError,
		errorMessage,

		// Step results
		swapToVnstResult,
		bridgeResult,
		swapFromVnstResult,

		// Actions
		startSwapBridge,
		reset,

		// Estimated amounts
		estimatedVnstAmount,
		estimatedFinalAmount,
		totalSteps,
		currentStepNumber,

		// Helper data
		fromChain,
		toChain,
		fromTokenData,
		toTokenData,
		vnstTokenData,
		isValidParams,
	};
};
