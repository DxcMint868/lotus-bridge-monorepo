import { ethers, network } from "hardhat";
import { Address } from "viem";

interface DeployParams {
	tokenA: Address;
	tokenB: Address;
	poolSetupContract?: Address;
}

const getUniswapContractsFromChainID = (chainID: number) => {
	switch (chainID) {
		case 11155111: // Sepolia
			return {
				factory: "0x0227628f3F023bb0B980b67D528571c95c6DaC1c",
				positionManager: "0x1238536071E1c677A632429e3655c799b22cDA52",
			};

		case 84532: // Base Sepolia
			return {
				factory: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
				positionManager: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
			};

		default:
			return {
				factory: "0x",
				positionManager: "0x",
			};
	}
};

async function main({ tokenA, tokenB, poolSetupContract }: DeployParams) {
	console.log("🦄 Setting up Uniswap V3 Pool...\n");

	const [deployer] = await ethers.getSigners();
	console.log("Deploying with account:", deployer.address);

	const chainID = network.config.chainId;
	console.log("Current chain ID:", chainID);
	if (!chainID) {
		throw new Error(
			"Chain ID not found. Please set up your network configuration."
		);
	}

	// Deploy the pool setup contract
	let poolSetup;
	if (!poolSetupContract) {
		const UniswapV3PoolSetup = await ethers.getContractFactory(
			"UniswapV3PoolSetup"
		);
		console.log("📦 Deploying UniswapV3PoolSetup contract...");

		const { factory, positionManager } =
			getUniswapContractsFromChainID(chainID);
		poolSetup = await UniswapV3PoolSetup.deploy(
			tokenA,
			tokenB,
			factory,
			positionManager
		);
		await poolSetup.waitForDeployment();
	} else {
		console.log("poolSetupContract param:", poolSetupContract);
		if (
			!poolSetupContract ||
			poolSetupContract === "0x" ||
			poolSetupContract === "0x0000000000000000000000000000000000000000"
		) {
			throw new Error("Invalid poolSetupContract address provided.");
		}
		poolSetup = await ethers.getContractAt(
			"UniswapV3PoolSetup",
			poolSetupContract
		);
	}

	console.log("✅ Pool Setup Contract deployed to:", poolSetup!.target);

	// Get token addresses from contract
	const [readTokenA, readTokenB] = await poolSetup!.getTokenAddresses();
	console.log("🪙 Pool Token A:", readTokenA);
	console.log("🪙 Pool Token B:", readTokenB);

	// Check if pool already exists
	const existingPool = await poolSetup!.getPool();
	if (existingPool === "0x0000000000000000000000000000000000000000") {
		console.log("🏊 Creating new Uniswap Liquidity Pool...");
		try {
			const createTx = await poolSetup!.createPool();
			console.log("⏳ Transaction submitted:", createTx.hash);
			await createTx.wait();
			console.log("✅ Pool created successfully!");
		} catch (error) {
			console.error("❌ Failed to create pool:", error);
			// Pool might already exist, continue
		}
	} else {
		console.log("✅ Pool already exists at:", existingPool);
	}

	const poolAddress = await poolSetup!.getPool();
	console.log("🏊 Pool Address:", poolAddress);

	// Check token balances
	const tokenAContract = await ethers.getContractAt("IERC20", readTokenA);
	const tokenBContract = await ethers.getContractAt("IERC20", readTokenB);

	const tokenABalance = await tokenAContract.balanceOf(deployer.address);
	const tokenBBalance = await tokenBContract.balanceOf(deployer.address);

	console.log("\n💰 Current Token Balances:");
	console.log(`- VNST: ${ethers.formatEther(tokenABalance)}`);
	console.log(`- VNDC: ${ethers.formatEther(tokenBBalance)}`);

	// Prepare liquidity amounts
	const tokenAAmount = ethers.parseEther("200000"); // 200,000 VNST
	const tokenBAmount = ethers.parseEther("200000"); // 200,000 VNDC (1:1 ratio)

	console.log("\n💧 Liquidity Setup:");
	console.log(`- Will add ${ethers.formatEther(tokenAAmount)} VNST`);
	console.log(`- Will add ${ethers.formatEther(tokenBAmount)} VNDC`);

	// Check if we have enough tokens
	const hasEnoughTokenA = tokenABalance >= tokenAAmount;
	const hasEnoughTokenB = tokenBBalance >= tokenBAmount;

	if (!hasEnoughTokenA || !hasEnoughTokenB) {
		console.log("\n⚠️  Insufficient token balances for adding liquidity:");
		if (!hasEnoughTokenA)
			console.log(
				`- Need ${ethers.formatEther(
					tokenAAmount - tokenABalance
				)} more VNST`
			);
		if (!hasEnoughTokenB)
			console.log(
				`- Need ${ethers.formatEther(
					tokenBAmount - tokenBBalance
				)} more VNDC`
			);
		console.log("- Please obtain tokens before adding liquidity");
	} else {
		console.log("✅ Sufficient token balances available");

		// Check allowances
		const tokenAAllowance = await tokenAContract.allowance(
			deployer.address,
			poolSetup!.target
		);
		const tokenBAllowance = await tokenBContract.allowance(
			deployer.address,
			poolSetup!.target
		);

		console.log("\n🔐 Token Allowances:");
		console.log(`- VNST: ${ethers.formatEther(tokenAAllowance)}`);
		console.log(`- VNDC: ${ethers.formatEther(tokenBAllowance)}`);

		// Approve tokens if needed
		if (tokenAAllowance < tokenAAmount) {
			console.log("📝 Approving TokenA...");
			const approveTx = await tokenAContract.approve(
				poolSetup!.target,
				tokenAAmount
			);
			await approveTx.wait();
			console.log("✅ TokenA approved");
		}

		if (tokenBAllowance < tokenBAmount) {
			console.log("📝 Approving TokenB...");
			const approveTx = await tokenBContract.approve(
				poolSetup!.target,
				tokenBAmount
			);
			await approveTx.wait();
			console.log("✅ TokenB approved");
		}

		// Add liquidity
		console.log("\n💧 Adding liquidity...");
		try {
			const addLiquidityTx = await poolSetup!.addLiquidity(
				tokenAAmount,
				tokenBAmount,
				deployer.address
			);
			console.log("⏳ Transaction submitted:", addLiquidityTx.hash);
			const receipt = await addLiquidityTx.wait();
			console.log("✅ Liquidity added successfully!");

			// Parse events to get liquidity position info
			const liquidityEvent = receipt.events?.find(
				(e: any) => e.event === "LiquidityAdded"
			);
			if (liquidityEvent) {
				console.log(
					"🎫 Position Token ID:",
					liquidityEvent.args.tokenId.toString()
				);
				console.log(
					"💧 Liquidity Amount:",
					liquidityEvent.args.liquidity.toString()
				);
			}
		} catch (error: any) {
			// Try to print tx hash if available
			if (error?.transaction?.hash) {
				console.log(
					"⏳ Transaction submitted (error):",
					error.transaction.hash
				);
			}
			console.error("❌ Failed to add liquidity:", error);
		}
	}

	return {
		poolSetupContract: poolSetup!.target,
		poolAddress: poolAddress,
		vnstToken: readTokenA,
		vndcToken: readTokenB,
		uniswapFactory: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
		positionManager: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
		swapRouter: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
	};
}

main({
	// tokenA: "0xBF00AB3f7C2c15eCA16a2f58d682B92BcBe78e4B", // VNST on Sepolia
	// tokenB: "0x322D132a837468342Cba668e473497D6B61A6854", // VNDC on Sepolia
	tokenA: "0x2d11eE653b8Dae37fBcF7544c0d9576ab6811C36", // VNST on Base Sepolia
	tokenB: "0x4322BCC65D98B0896ebe0Dd2Aff0c570890c22c6", // VNDC on Base Sepolia

	// poolSetupContract: "0x19A0636645cda0aecEA2Cb779b39661657d21878", // Re-use deployed address if available
})
	.then((result) => {
		console.log("\n🎉 Deployment Summary:");
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("Pool Setup Contract:", result.poolSetupContract);
		console.log("VNST/VNDC Pool:", result.poolAddress);
		console.log("VNST Token:", result.vnstToken);
		console.log("VNDC Token:", result.vndcToken);
		console.log("Uniswap Factory:", result.uniswapFactory);
		console.log("Position Manager:", result.positionManager);
		console.log("Swap Router:", result.swapRouter);
		console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
		console.log("🚀 Ready to bridge and swap tokens!");
	})
	.catch((error) => {
		console.error("❌ Deployment failed:", error);
		process.exitCode = 1;
	});
