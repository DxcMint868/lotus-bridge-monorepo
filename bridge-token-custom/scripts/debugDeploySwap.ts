import { ethers } from "hardhat";

async function main() {
	console.log("🔍 Debugging Uniswap V3 Pool...\n");

	const [deployer] = await ethers.getSigners();

	// Pool and token addresses from your deployment
	const poolAddress = "0x67eFB426b2B2aE8be9550adaeBF58512DaBB45B2";
	const vnstAddress = "0x322D132a837468342Cba668e473497D6B61A6854";
	const vndcAddress = "0xBF00AB3f7C2c15eCA16a2f58d682B92BcBe78e4B";

	// Pool ABI for reading state
	const poolABI = [
		"function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
		"function fee() external view returns (uint24)",
		"function token0() external view returns (address)",
		"function token1() external view returns (address)",
		"function tickSpacing() external view returns (int24)",
		"function liquidity() external view returns (uint128)",
	];

	const pool = await ethers.getContractAt(poolABI, poolAddress);

	try {
		// Check pool state
		const slot0 = await pool.slot0();
		const fee = await pool.fee();
		const token0 = await pool.token0();
		const token1 = await pool.token1();
		const tickSpacing = await pool.tickSpacing();
		const liquidity = await pool.liquidity();

		console.log("📊 Pool State:");
		console.log(`- Token0: ${token0}`);
		console.log(`- Token1: ${token1}`);
		console.log(`- Fee: ${fee}`);
		console.log(`- Tick Spacing: ${tickSpacing}`);
		console.log(`- Current Tick: ${slot0.tick}`);
		console.log(`- Current Price (sqrtPriceX96): ${slot0.sqrtPriceX96}`);
		console.log(`- Current Liquidity: ${liquidity}`);
		console.log(`- Pool Unlocked: ${slot0.unlocked}`);

		// Check if tokens match our expectation
		const expectedToken0 =
			vnstAddress.toLowerCase() < vndcAddress.toLowerCase()
				? vnstAddress
				: vndcAddress;
		const expectedToken1 =
			vnstAddress.toLowerCase() < vndcAddress.toLowerCase()
				? vndcAddress
				: vnstAddress;

		console.log("\n🔍 Token Order Analysis:");
		console.log(`- Expected Token0: ${expectedToken0}`);
		console.log(`- Expected Token1: ${expectedToken1}`);
		console.log(`- Actual Token0: ${token0}`);
		console.log(`- Actual Token1: ${token1}`);
		console.log(
			`- Order Correct: ${
				token0.toLowerCase() === expectedToken0.toLowerCase()
			}`
		);

		// Calculate proper tick alignment
		const currentTick = Number(slot0.tick);
		const tickSpacingNum = Number(tickSpacing);

		console.log("\n📐 Tick Analysis:");
		console.log(`- Current Tick: ${currentTick}`);
		console.log(`- Tick Spacing: ${tickSpacingNum}`);

		// Calculate aligned ticks for full range
		const minTick = -887220;
		const maxTick = 887220;

		const alignedMinTick =
			Math.ceil(minTick / tickSpacingNum) * tickSpacingNum;
		const alignedMaxTick =
			Math.floor(maxTick / tickSpacingNum) * tickSpacingNum;

		console.log(`- Aligned Min Tick: ${alignedMinTick}`);
		console.log(`- Aligned Max Tick: ${alignedMaxTick}`);

		// Check if price is zero (uninitialized)
		if (slot0.sqrtPriceX96.toString() === "0") {
			console.log("\n❌ Pool is not initialized!");
		} else {
			console.log("\n✅ Pool is initialized");
		}

		return {
			poolState: slot0,
			alignedMinTick,
			alignedMaxTick,
			token0,
			token1,
			tickSpacing: tickSpacingNum,
		};
	} catch (error) {
		console.error("❌ Failed to read pool state:", error);
		return null;
	}
}

main()
	.then((result) => {
		if (result) {
			console.log("\n💡 Recommendations:");
			console.log("1. Use aligned ticks in your contract");
			console.log(`2. Min Tick: ${result.alignedMinTick}`);
			console.log(`3. Max Tick: ${result.alignedMaxTick}`);
			console.log("4. Ensure token order matches pool's token0/token1");
		}
	})
	.catch((error) => {
		console.error("Debug failed:", error);
	});
