// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

// Uniswap V3 interfaces
interface IUniswapV3Factory {
	function createPool(
		address tokenA,
		address tokenB,
		uint24 fee
	) external returns (address pool);

	function getPool(
		address tokenA,
		address tokenB,
		uint24 fee
	) external view returns (address pool);
}

interface IUniswapV3Pool {
	function initialize(uint160 sqrtPriceX96) external;

	function token0() external view returns (address);

	function token1() external view returns (address);

	function tickSpacing() external view returns (int24);
}

interface INonfungiblePositionManager {
	struct MintParams {
		address token0;
		address token1;
		uint24 fee;
		int24 tickLower;
		int24 tickUpper;
		uint256 amount0Desired;
		uint256 amount1Desired;
		uint256 amount0Min;
		uint256 amount1Min;
		address recipient;
		uint256 deadline;
	}

	function mint(
		MintParams calldata params
	)
		external
		payable
		returns (
			uint256 tokenId,
			uint128 liquidity,
			uint256 amount0,
			uint256 amount1
		);
}

contract UniswapV3PoolSetup is Ownable {
	address public immutable tokenA;
	address public immutable tokenB;
	IUniswapV3Factory public immutable factory;
	INonfungiblePositionManager public immutable positionManager;

	uint24 public constant POOL_FEE = 3000; // 0.3%

	event PoolCreated(
		address indexed pool,
		address token0,
		address token1,
		uint24 fee
	);
	event LiquidityAdded(
		uint256 tokenId,
		uint128 liquidity,
		uint256 amount0,
		uint256 amount1
	);

	constructor(
		address _tokenA,
		address _tokenB,
		address _factory,
		address _positionManager
	) Ownable(msg.sender) {
		tokenA = _tokenA;
		tokenB = _tokenB;
		factory = IUniswapV3Factory(_factory);
		positionManager = INonfungiblePositionManager(_positionManager);
	}

	function createPool() external returns (address pool) {
		pool = factory.createPool(tokenA, tokenB, POOL_FEE);
		uint160 sqrtPriceX96 = 79228162514264337593543950336; // 1:1 price
		IUniswapV3Pool(pool).initialize(sqrtPriceX96);
		emit PoolCreated(pool, tokenA, tokenB, POOL_FEE);
		return pool;
	}

	function addLiquidity(
		uint256 tokenAAmount,
		uint256 tokenBAmount,
		address recipient
	)
		external
		returns (
			uint256 tokenId,
			uint128 liquidity,
			uint256 amount0,
			uint256 amount1
		)
	{
		address poolAddress = factory.getPool(tokenA, tokenB, POOL_FEE);
		require(poolAddress != address(0), 'Pool does not exist');

		IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
		address token0 = pool.token0();
		address token1 = pool.token1();
		int24 tickSpacing = pool.tickSpacing();

		int24 tickLower = int24(
			(int256(-887220) / int256(tickSpacing)) * int256(tickSpacing)
		);
		int24 tickUpper = int24(
			(int256(887220) / int256(tickSpacing)) * int256(tickSpacing)
		);

		// Determine amounts based on token order
		(uint256 amount0Desired, uint256 amount1Desired) = token0 == tokenA
			? (tokenAAmount, tokenBAmount)
			: (tokenBAmount, tokenAAmount);

		// Transfer tokens
		IERC20(tokenA).transferFrom(msg.sender, address(this), tokenAAmount);
		IERC20(tokenB).transferFrom(msg.sender, address(this), tokenBAmount);

		// Approve position manager
		IERC20(token0).approve(address(positionManager), amount0Desired);
		IERC20(token1).approve(address(positionManager), amount1Desired);

		INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager
			.MintParams({
				token0: token0,
				token1: token1,
				fee: POOL_FEE,
				tickLower: tickLower,
				tickUpper: tickUpper,
				amount0Desired: amount0Desired,
				amount1Desired: amount1Desired,
				amount0Min: 0, // Accept any amount of tokens
				amount1Min: 0, // Accept any amount of tokens
				recipient: recipient,
				deadline: block.timestamp + 1200 // 20 minutes
			});

		(tokenId, liquidity, amount0, amount1) = positionManager.mint(params);

		// Return leftover tokens
		uint256 leftoverToken0 = IERC20(token0).balanceOf(address(this));
		uint256 leftoverToken1 = IERC20(token1).balanceOf(address(this));

		if (leftoverToken0 > 0) {
			IERC20(token0).transfer(recipient, leftoverToken0);
		}
		if (leftoverToken1 > 0) {
			IERC20(token1).transfer(recipient, leftoverToken1);
		}

		emit LiquidityAdded(tokenId, liquidity, amount0, amount1);
	}

	function getPool() external view returns (address) {
		return factory.getPool(tokenA, tokenB, POOL_FEE);
	}

	function getTokenAddresses() external view returns (address, address) {
		return (tokenA, tokenB);
	}

	// Emergency function
	function withdrawToken(
		address token,
		uint256 amount,
		address to
	) external onlyOwner {
		IERC20(token).transfer(to, amount);
	}
}
