// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

// Uniswap V3 interfaces
interface ISwapRouter {
	struct ExactInputSingleParams {
		address tokenIn;
		address tokenOut;
		uint24 fee;
		address recipient;
		uint256 deadline;
		uint256 amountIn;
		uint256 amountOutMinimum;
		uint160 sqrtPriceLimitX96;
	}

	function exactInputSingle(
		ExactInputSingleParams calldata params
	) external payable returns (uint256 amountOut);
}

interface IQuoterV2 {
	function quoteExactInputSingle(
		address tokenIn,
		address tokenOut,
		uint24 fee,
		uint256 amountIn,
		uint160 sqrtPriceLimitX96
	)
		external
		view
		returns (
			uint256 amountOut,
			uint160 sqrtPriceX96After,
			uint32 initializedTicksCrossed,
			uint256 gasEstimate
		);
}

interface IBridgeFactory {
	function reqBridge(
		address token,
		uint256 amount,
		uint256 targetChain,
		address recipient
	) external;

	function estimateFee(uint256 amount) external view returns (uint256);

	function getLPAddress(address token) external view returns (address);
}

/**
 * @title SwapBridge
 * @dev Handles swap + bridge operations through VNST as intermediate token
 */
contract SwapBridge is Ownable, ReentrancyGuard {
	// Uniswap V3 contracts
	ISwapRouter public immutable swapRouter;
	IQuoterV2 public immutable quoterV2;
	IBridgeFactory public immutable bridgeFactory;

	// VNST token address (bridge token)
	address public immutable VNST;

	// Fee settings
	uint256 public swapFeeRate = 50; // 0.5% (50 basis points)
	uint256 public constant MAX_FEE_RATE = 1000; // 10% max
	uint256 public constant SLIPPAGE_TOLERANCE = 500; // 5% default slippage

	// Events
	event SwapBridgeRequested(
		address indexed user,
		address indexed tokenIn,
		address indexed tokenOut,
		uint256 amountIn,
		uint256 targetChain,
		address recipient,
		bytes32 transactionId
	);

	event SwapCompleted(
		address indexed user,
		address indexed tokenIn,
		address indexed tokenOut,
		uint256 amountIn,
		uint256 amountOut,
		bytes32 transactionId
	);

	constructor(
		address _swapRouter,
		address _quoterV2,
		address _bridgeFactory,
		address _vnst
	) Ownable(msg.sender) {
		swapRouter = ISwapRouter(_swapRouter);
		quoterV2 = IQuoterV2(_quoterV2);
		bridgeFactory = IBridgeFactory(_bridgeFactory);
		VNST = _vnst;
	}

	/**
	 * @dev Perform swap + bridge operation
	 * @param tokenIn Source token address
	 * @param tokenOut Destination token address (on destination chain)
	 * @param amountIn Amount of source token to swap
	 * @param targetChain Target chain ID
	 * @param recipient Recipient address on target chain
	 * @param minAmountOut Minimum amount of destination token expected
	 */
	function swapAndBridge(
		address tokenIn,
		address tokenOut,
		uint256 amountIn,
		uint256 targetChain,
		address recipient,
		uint256 minAmountOut
	) external nonReentrant {
		require(tokenIn != VNST, 'Cannot swap from VNST');
		require(tokenOut != VNST, 'Cannot swap to VNST');
		require(amountIn > 0, 'Amount must be greater than 0');
		require(recipient != address(0), 'Invalid recipient');

		// Generate transaction ID
		bytes32 transactionId = keccak256(
			abi.encodePacked(
				msg.sender,
				tokenIn,
				tokenOut,
				amountIn,
				targetChain,
				recipient,
				block.timestamp
			)
		);

		// Transfer tokens from user
		IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

		// Step 1: Swap tokenIn to VNST
		uint256 vnstAmount = _swapToVNST(tokenIn, amountIn, transactionId);

		// Step 2: Bridge VNST to destination chain
		_bridgeVNST(vnstAmount, targetChain, recipient, transactionId);

		emit SwapBridgeRequested(
			msg.sender,
			tokenIn,
			tokenOut,
			amountIn,
			targetChain,
			recipient,
			transactionId
		);
	}

	/**
	 * @dev Swap token to VNST using Uniswap V3
	 */
	function _swapToVNST(
		address tokenIn,
		uint256 amountIn,
		bytes32 transactionId
	) internal returns (uint256 vnstAmount) {
		// Get quote for swap
		(uint256 quotedAmount, , , ) = quoterV2.quoteExactInputSingle(
			tokenIn,
			VNST,
			3000, // 0.3% fee tier
			amountIn,
			0 // No price limit
		);

		// Calculate minimum amount with slippage
		uint256 minAmountOut = (quotedAmount * (10000 - SLIPPAGE_TOLERANCE)) /
			10000;

		// Approve tokens for swap
		IERC20(tokenIn).approve(address(swapRouter), amountIn);

		// Perform swap
		ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
			.ExactInputSingleParams({
				tokenIn: tokenIn,
				tokenOut: VNST,
				fee: 3000,
				recipient: address(this),
				deadline: block.timestamp + 300, // 5 minutes
				amountIn: amountIn,
				amountOutMinimum: minAmountOut,
				sqrtPriceLimitX96: 0
			});

		vnstAmount = swapRouter.exactInputSingle(params);

		emit SwapCompleted(
			msg.sender,
			tokenIn,
			VNST,
			amountIn,
			vnstAmount,
			transactionId
		);
	}

	/**
	 * @dev Bridge VNST to destination chain
	 */
	function _bridgeVNST(
		uint256 amount,
		uint256 targetChain,
		address recipient,
		bytes32 transactionId
	) internal {
		// Approve VNST for bridge
		IERC20(VNST).approve(address(bridgeFactory), amount);

		// Bridge VNST
		bridgeFactory.reqBridge(VNST, amount, targetChain, recipient);
	}

	/**
	 * @dev Complete swap on destination chain (called by relayer)
	 * @param tokenOut Final destination token
	 * @param vnstAmount Amount of VNST to swap
	 * @param recipient Final recipient
	 * @param minAmountOut Minimum amount of destination token
	 */
	function completeSwapOnDestination(
		address tokenOut,
		uint256 vnstAmount,
		address recipient,
		uint256 minAmountOut,
		bytes32 transactionId
	) external onlyOwner nonReentrant {
		require(tokenOut != VNST, 'Cannot swap to VNST');
		require(vnstAmount > 0, 'Amount must be greater than 0');
		require(recipient != address(0), 'Invalid recipient');

		// Swap VNST to destination token
		uint256 finalAmount = _swapFromVNST(
			tokenOut,
			vnstAmount,
			recipient,
			transactionId
		);
		require(finalAmount >= minAmountOut, 'Insufficient output amount');
	}

	/**
	 * @dev Swap VNST to destination token
	 */
	function _swapFromVNST(
		address tokenOut,
		uint256 vnstAmount,
		address recipient,
		bytes32 transactionId
	) internal returns (uint256 amountOut) {
		// Get quote for swap
		(uint256 quotedAmount, , , ) = quoterV2.quoteExactInputSingle(
			VNST,
			tokenOut,
			3000, // 0.3% fee tier
			vnstAmount,
			0 // No price limit
		);

		// Calculate minimum amount with slippage
		uint256 minAmountOut = (quotedAmount * (10000 - SLIPPAGE_TOLERANCE)) /
			10000;

		// Approve VNST for swap
		IERC20(VNST).approve(address(swapRouter), vnstAmount);

		// Perform swap
		ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
			.ExactInputSingleParams({
				tokenIn: VNST,
				tokenOut: tokenOut,
				fee: 3000,
				recipient: recipient,
				deadline: block.timestamp + 300, // 5 minutes
				amountIn: vnstAmount,
				amountOutMinimum: minAmountOut,
				sqrtPriceLimitX96: 0
			});

		amountOut = swapRouter.exactInputSingle(params);

		emit SwapCompleted(
			recipient,
			VNST,
			tokenOut,
			vnstAmount,
			amountOut,
			transactionId
		);
	}

	/**
	 * @dev Get quote for complete swap + bridge operation
	 */
	function getSwapBridgeQuote(
		address tokenIn,
		address tokenOut,
		uint256 amountIn,
		uint256 targetChain
	)
		external
		view
		returns (
			uint256 estimatedVnstAmount,
			uint256 estimatedFinalAmount,
			uint256 bridgeFee,
			uint256 totalFee
		)
	{
		// Get quote for tokenIn -> VNST
		(estimatedVnstAmount, , , ) = quoterV2.quoteExactInputSingle(
			tokenIn,
			VNST,
			3000,
			amountIn,
			0
		);

		// Get bridge fee
		bridgeFee = bridgeFactory.estimateFee(estimatedVnstAmount);
		uint256 vnstAfterBridge = estimatedVnstAmount - bridgeFee;

		// Get quote for VNST -> tokenOut (simulated on destination chain)
		// Note: This is an approximation since we can't query destination chain
		(estimatedFinalAmount, , , ) = quoterV2.quoteExactInputSingle(
			VNST,
			tokenOut,
			3000,
			vnstAfterBridge,
			0
		);

		// Calculate total fees
		totalFee = (amountIn * swapFeeRate) / 10000 + bridgeFee;
	}

	/**
	 * @dev Emergency withdraw function
	 */
	function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
		IERC20(token).transfer(owner(), amount);
	}

	/**
	 * @dev Update swap fee rate
	 */
	function setSwapFeeRate(uint256 _feeRate) external onlyOwner {
		require(_feeRate <= MAX_FEE_RATE, 'Fee rate too high');
		swapFeeRate = _feeRate;
	}
}
