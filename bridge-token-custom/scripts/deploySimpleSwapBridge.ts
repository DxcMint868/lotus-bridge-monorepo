import { ethers } from "hardhat";

async function main() {
	console.log("🚀 Deploying SimpleSwapBridge contracts...");

	const [deployer] = await ethers.getSigners();
	console.log("Deploying with account:", deployer.address);
	console.log(
		"Account balance:",
		ethers.formatEther(await deployer.provider.getBalance(deployer.address))
	);

	// Deploy SimpleSwapBridge
	const SimpleSwapBridge = await ethers.getContractFactory(
		"SimpleSwapBridge"
	);
	const simpleSwapBridge = await SimpleSwapBridge.deploy();
	await simpleSwapBridge.waitForDeployment();

	const simpleSwapBridgeAddress = await simpleSwapBridge.getAddress();
	console.log("✅ SimpleSwapBridge deployed to:", simpleSwapBridgeAddress);

	// Get network info
	const network = await ethers.provider.getNetwork();
	const chainId = network.chainId;
	console.log("📡 Network:", network.name, "Chain ID:", chainId.toString());

	// Add supported tokens with their symbols
	const supportedTokens = {
		// These addresses should match your existing token deployments
		VNST: "0xBF00AB3f7C2c15eCA16a2f58d682B92BcBe78e4B", // Sepolia VNST
		VNDC: "0x322D132a837468342Cba668e473497D6B61A6854", // Sepolia VNDC
	};

	// Add tokens if we're on Sepolia (chain ID 11155111)
	if (chainId === 11155111n) {
		console.log("\n🪙 Adding supported tokens on Sepolia...");

		for (const [symbol, address] of Object.entries(supportedTokens)) {
			try {
				const tx = await simpleSwapBridge.addSupportedToken(
					address,
					symbol
				);
				await tx.wait();
				console.log(`✅ Added ${symbol} at ${address}`);
			} catch (error) {
				console.log(`❌ Failed to add ${symbol}: ${error.message}`);
			}
		}

		// Set exchange rates
		console.log("\n💱 Setting mock exchange rates...");

		const exchangeRates = [
			{ from: "VNST", to: "VNDC", rate: 10000 }, // 1:1 ratio (10000 = 100%)
			{ from: "VNDC", to: "VNST", rate: 10000 }, // 1:1 ratio
		];

		for (const { from, to, rate } of exchangeRates) {
			try {
				const tx = await simpleSwapBridge.setMockExchangeRate(
					from,
					to,
					rate
				);
				await tx.wait();
				console.log(
					`✅ Set exchange rate ${from} -> ${to}: ${rate / 100}%`
				);
			} catch (error) {
				console.log(
					`❌ Failed to set rate ${from} -> ${to}: ${error.message}`
				);
			}
		}
	}

	// For Base Sepolia (chain ID 84532)
	if (chainId === 84532n) {
		console.log("\n🪙 Adding supported tokens on Base Sepolia...");

		const baseTokens = {
			VNST: "0x2d11eE653b8Dae37fBcF7544c0d9576ab6811C36", // Base Sepolia VNST
			VNDC: "0x4322BCC65D98B0896ebe0Dd2Aff0c570890c22c6", // Base Sepolia VNDC
		};

		for (const [symbol, address] of Object.entries(baseTokens)) {
			try {
				const tx = await simpleSwapBridge.addSupportedToken(
					address,
					symbol
				);
				await tx.wait();
				console.log(`✅ Added ${symbol} at ${address}`);
			} catch (error) {
				console.log(`❌ Failed to add ${symbol}: ${error.message}`);
			}
		}

		// Set exchange rates for Base Sepolia
		const exchangeRates = [
			{ from: "VNST", to: "VNDC", rate: 10000 }, // 1:1 ratio
			{ from: "VNDC", to: "VNST", rate: 10000 }, // 1:1 ratio
		];

		for (const { from, to, rate } of exchangeRates) {
			try {
				const tx = await simpleSwapBridge.setMockExchangeRate(
					from,
					to,
					rate
				);
				await tx.wait();
				console.log(
					`✅ Set exchange rate ${from} -> ${to}: ${rate / 100}%`
				);
			} catch (error) {
				console.log(
					`❌ Failed to set rate ${from} -> ${to}: ${error.message}`
				);
			}
		}
	}

	console.log("\n=== DEPLOYMENT SUMMARY ===");
	console.log(`SimpleSwapBridge: ${simpleSwapBridgeAddress}`);
	console.log(`Network: ${network.name} (Chain ID: ${chainId})`);
	console.log(`Deployer: ${deployer.address}`);

	console.log("\n=== FRONTEND CONFIGURATION ===");
	console.log("Add this to your chains.json configuration:");
	console.log(`"swapBridgeContract": "${simpleSwapBridgeAddress}"`);

	console.log("\n=== RELAYER CONFIGURATION ===");
	console.log("Update your relayer server.js with:");
	console.log(`SIMPLE_SWAP_BRIDGE_ADDRESS="${simpleSwapBridgeAddress}"`);

	console.log("\n=== VERIFICATION COMMANDS ===");
	if (chainId === 11155111n) {
		console.log(
			`npx hardhat verify --network sepolia ${simpleSwapBridgeAddress}`
		);
	} else if (chainId === 84532n) {
		console.log(
			`npx hardhat verify --network baseSepolia ${simpleSwapBridgeAddress}`
		);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("❌ Deployment failed:", error);
		process.exit(1);
	});
