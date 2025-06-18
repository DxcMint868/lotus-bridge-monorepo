// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title SimpleSwapBridge
 * @dev Simplified swap + bridge contract for demo purposes
 * @notice This contract doesn't use real Uniswap - it just locks tokens and emits events
 * The relayer listens to these events and handles the cross-chain swapping logic
 */
contract SimpleSwapBridge is Ownable, ReentrancyGuard {
	// Events
	event SwapBridgeRequested(
		address indexed user,
		address indexed tokenIn,
		address indexed tokenOut,
		uint256 amountIn,
		uint256 targetChain,
		address recipient,
		uint256 minAmountOut,
		bytes32 transactionId
	);

	event TokensLocked(
		address indexed user,
		address indexed token,
		uint256 amount,
		bytes32 indexed transactionId
	);

	// Mock exchange rates for demo (in production this would come from oracles/DEXs)
	mapping(string => mapping(string => uint256)) public mockExchangeRates;

	// Supported tokens
	mapping(address => bool) public supportedTokens;
	mapping(address => string) public tokenSymbols;

	// Transaction tracking
	mapping(bytes32 => bool) public processedTransactions;

	// Constants for rate calculations (using basis points for precision)
	uint256 public constant RATE_PRECISION = 10000; // 10000 = 1.0000 (100%)
	uint256 public constant SLIPPAGE_TOLERANCE = 500; // 5%

	constructor() Ownable(msg.sender) {
		// Initialize mock exchange rates (basis points)
		// VNST <-> VNDC at 1:1 ratio
		mockExchangeRates['VNST']['VNDC'] = 10000; // 1.0000
		mockExchangeRates['VNDC']['VNST'] = 10000; // 1.0000

		// Add more token pairs as needed for demo
		mockExchangeRates['VNST']['USDT'] = 9800; // Slightly less than 1:1
		mockExchangeRates['USDT']['VNST'] = 10204; // Inverse rate
	}

	/**
	 * @dev Add supported token
	 */
	function addSupportedToken(
		address token,
		string memory symbol
	) external onlyOwner {
		supportedTokens[token] = true;
		tokenSymbols[token] = symbol;
	}

	/**
	 * @dev Remove supported token
	 */
	function removeSupportedToken(address token) external onlyOwner {
		supportedTokens[token] = false;
		delete tokenSymbols[token];
	}

	/**
	 * @dev Set mock exchange rate between two tokens
	 */
	function setMockExchangeRate(
		string memory fromToken,
		string memory toToken,
		uint256 rate
	) external onlyOwner {
		require(rate > 0, 'Rate must be greater than 0');
		mockExchangeRates[fromToken][toToken] = rate;
	}

	/**
	 * @dev Perform swap + bridge operation (simplified for demo)
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
		require(supportedTokens[tokenIn], 'Source token not supported');
		require(amountIn > 0, 'Amount must be greater than 0');
		require(recipient != address(0), 'Invalid recipient');
		require(targetChain != block.chainid, 'Cannot bridge to same chain');

		// Generate unique transaction ID
		bytes32 transactionId = keccak256(
			abi.encodePacked(
				msg.sender,
				tokenIn,
				tokenOut,
				amountIn,
				targetChain,
				recipient,
				block.timestamp,
				block.number
			)
		);

		require(
			!processedTransactions[transactionId],
			'Transaction already processed'
		);
		processedTransactions[transactionId] = true;

		// Transfer tokens from user to this contract (locks them)
		IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

		emit TokensLocked(msg.sender, tokenIn, amountIn, transactionId);

		emit SwapBridgeRequested(
			msg.sender,
			tokenIn,
			tokenOut,
			amountIn,
			targetChain,
			recipient,
			minAmountOut,
			transactionId
		);
	}

	/**
	 * @dev Get mock exchange rate for token pair
	 */
	function getMockExchangeRate(
		string memory fromToken,
		string memory toToken
	) external view returns (uint256) {
		return mockExchangeRates[fromToken][toToken];
	}

	/**
	 * @dev Calculate expected output amount for a given input
	 */
	function getExpectedOutput(
		string memory fromToken,
		string memory toToken,
		uint256 amountIn
	) external view returns (uint256 amountOut) {
		uint256 rate = mockExchangeRates[fromToken][toToken];
		if (rate == 0) {
			return 0; // No rate found
		}

		// Apply exchange rate (rate is in basis points)
		amountOut = (amountIn * rate) / RATE_PRECISION;

		// Apply slippage tolerance
		amountOut =
			(amountOut * (RATE_PRECISION - SLIPPAGE_TOLERANCE)) /
			RATE_PRECISION;
	}

	/**
	 * @dev Get quote for swap + bridge operation
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
			uint256 expectedOutput,
			uint256 minimumOutput,
			uint256 exchangeRate,
			bool isSupported
		)
	{
		string memory fromSymbol = tokenSymbols[tokenIn];
		string memory toSymbol = tokenSymbols[tokenOut];

		if (!supportedTokens[tokenIn] || bytes(fromSymbol).length == 0) {
			return (0, 0, 0, false);
		}

		exchangeRate = mockExchangeRates[fromSymbol][toSymbol];
		if (exchangeRate == 0) {
			return (0, 0, 0, false);
		}

		expectedOutput = (amountIn * exchangeRate) / RATE_PRECISION;
		minimumOutput =
			(expectedOutput * (RATE_PRECISION - SLIPPAGE_TOLERANCE)) /
			RATE_PRECISION;
		isSupported = true;
	}

	/**
	 * @dev Emergency withdraw function for owner
	 */
	function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
		if (token == address(0)) {
			// Withdraw ETH
			payable(owner()).transfer(amount);
		} else {
			// Withdraw ERC20 token
			IERC20(token).transfer(owner(), amount);
		}
	}

	/**
	 * @dev Release tokens (called by relayer after processing)
	 * @notice This would typically be called by a relayer on the destination chain
	 */
	function releaseTokens(
		address token,
		address recipient,
		uint256 amount,
		bytes32 transactionId
	) external onlyOwner nonReentrant {
		require(recipient != address(0), 'Invalid recipient');
		require(amount > 0, 'Amount must be greater than 0');
		require(
			!processedTransactions[transactionId],
			'Transaction already processed'
		);

		processedTransactions[transactionId] = true;
		IERC20(token).transfer(recipient, amount);
	}

	/**
	 * @dev Check if a transaction has been processed
	 */
	function isTransactionProcessed(
		bytes32 transactionId
	) external view returns (bool) {
		return processedTransactions[transactionId];
	}

	/**
	 * @dev Get contract balance for a specific token
	 */
	function getTokenBalance(address token) external view returns (uint256) {
		return IERC20(token).balanceOf(address(this));
	}
}
