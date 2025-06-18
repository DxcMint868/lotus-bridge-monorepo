import { ethers } from "hardhat";

async function main() {
	console.log("Deploying SwapBridge contracts...");

	// Get the deployer account
	const [deployer] = await ethers.getSigners();
	console.log("Deploying contracts with account:", deployer.address);

	// Contract addresses for each network
	const networkConfigs = {
		11155111: {
			// Sepolia
			swapRouter: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
			quoterV2: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
			bridgeFactory: "0xE8CcfF76c6215af5A75Bd391b5bA3d4A8cacEf0D",
			vnst: "0xBF00AB3f7C2c15eCA16a2f58d682B92BcBe78e4B",
		},
		84532: {
			// Base Sepolia
			swapRouter: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
			quoterV2: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
			bridgeFactory: "0xe77aCC776B9a8ff6b2A313330C7b5Ad10abEBB06",
			vnst: "0x2d11eE653b8Dae37fBcF7544c0d9576ab6811C36",
		},
	};

	// Get current network
	const network = await ethers.provider.getNetwork();
	const chainId = Number(network.chainId);

	console.log(`Deploying on network: ${chainId}`);

	const config = networkConfigs[chainId as keyof typeof networkConfigs];
	if (!config) {
		throw new Error(`No configuration found for chain ID: ${chainId}`);
	}

	// Deploy SwapBridge
	const SwapBridge = await ethers.getContractFactory("SwapBridge");
	const swapBridge = await SwapBridge.deploy(
		config.swapRouter,
		config.quoterV2,
		config.bridgeFactory,
		config.vnst
	);
	await swapBridge.waitForDeployment();

	const swapBridgeAddress = await swapBridge.target;
	console.log("SwapBridge deployed to:", swapBridgeAddress);

	// Verify configuration
	console.log("\nVerifying configuration...");
	const verifySwapRouter = await swapBridge.swapRouter();
	const verifyQuoter = await swapBridge.quoterV2();
	const verifyBridgeFactory = await swapBridge.bridgeFactory();
	const verifyVNST = await swapBridge.VNST();

	console.log("SwapRouter:", verifySwapRouter);
	console.log("QuoterV2:", verifyQuoter);
	console.log("BridgeFactory:", verifyBridgeFactory);
	console.log("VNST:", verifyVNST);

	// Test quote functionality
	console.log("\nTesting quote functionality...");
	try {
		// Get some test tokens for the current network
		const testTokens = {
			11155111: {
				// Sepolia
				AXS: "0x4faBa27A73DD517db50945c2F02621eba3959B1E",
				SLP: "0x17194dA767007572FCb0fAdB48f9BD3DAd314c19",
			},
			84532: {
				// Base Sepolia
				AXS: "0xA0636375D1a93eB4998aE9a586ACE3CC664461ce",
				SLP: "0x227F7903FF9DA3034B73E4D3a13d2bb91706D095",
			},
		};

		const tokens = testTokens[chainId as keyof typeof testTokens];
		if (tokens) {
			const testAmount = ethers.parseEther("100"); // 100 tokens
			const targetChain = chainId === 11155111 ? 84532 : 11155111;

			const quote = await swapBridge.getSwapBridgeQuote(
				tokens.AXS,
				tokens.SLP,
				testAmount,
				targetChain
			);

			console.log("Test quote results:");
			console.log(
				"  Estimated VNST amount:",
				ethers.formatEther(quote[0])
			);
			console.log(
				"  Estimated final amount:",
				ethers.formatEther(quote[1])
			);
			console.log("  Bridge fee:", ethers.formatEther(quote[2]));
			console.log("  Total fee:", ethers.formatEther(quote[3]));
		}
	} catch (error) {
		console.log(
			"Quote test failed (expected for new deployment):",
			(error as any).message
		);
	}

	console.log("\nDeployment Summary:");
	console.log("===================");
	console.log("SwapBridge:", swapBridgeAddress);
	console.log("Network:", chainId);

	// Generate frontend configuration
	console.log("\n=== Frontend Configuration ===");
	console.log("Add this to your chains.json file:");
	console.log(`
"swapBridgeContract": "${swapBridgeAddress}",
  `);

	// Generate relayer configuration
	console.log("\n=== Relayer Configuration ===");
	console.log("Update your .env file:");
	console.log(`
# SwapBridge Contract
${
	chainId === 11155111 ? "SEPOLIA" : "BASE_SEPOLIA"
}_SWAP_BRIDGE=${swapBridgeAddress}
  `);

	console.log("\n=== Next Steps ===");
	console.log(
		"1. Deploy SwapBridge on the other network (Base Sepolia / Sepolia)"
	);
	console.log("2. Update relayer to handle swap + bridge operations");
	console.log("3. Test the complete swap + bridge flow");
	console.log(
		"4. Update frontend to use SwapBridge for token-to-token operations"
	);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
