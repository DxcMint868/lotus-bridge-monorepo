import { ethers, network } from "hardhat";

interface DeployParams {
  simpleSwapBridgeAddress?: string;
}

async function main({ simpleSwapBridgeAddress }: DeployParams) {
  console.log("🚀 Deploying SimpleSwapBridge contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await deployer.provider.getBalance(deployer.address))
  );

  // Deploy SimpleSwapBridge
  let simpleSwapBridge;
  if (simpleSwapBridgeAddress) {
    console.log(
      `Using existing SimpleSwapBridge contract at ${simpleSwapBridgeAddress}`
    );
    simpleSwapBridge = await ethers.getContractAt(
      "SimpleSwapBridge",
      simpleSwapBridgeAddress
    );
  } else {
    simpleSwapBridge = await ethers.getContractFactory("SimpleSwapBridge");
    simpleSwapBridge = await simpleSwapBridge.deploy();
    await simpleSwapBridge.waitForDeployment();
  }

  const contractAddress = await simpleSwapBridge.getAddress();
  console.log("✅ SimpleSwapBridge deployed to:", contractAddress);

  // Get network info
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  console.log("📡 Network:", network.name, "Chain ID:", chainId.toString());

  // For Sepolia (chain ID 11155111)
  const supportedTokens = {
    // These addresses should match your existing token deployments
    VNST: "0xBF00AB3f7C2c15eCA16a2f58d682B92BcBe78e4B", // Sepolia VNST
    VNDC: "0x322D132a837468342Cba668e473497D6B61A6854", // Sepolia VNDC
    KNC: "0x8bAef75f951E789136046e7CBd5eB164D35169D6", // Sepolia KNC
  };

  // Add supported tokens with their symbols
  if (chainId === 11155111n) {
    console.log("\n🪙 Adding supported tokens on Sepolia...");

    for (const [symbol, address] of Object.entries(supportedTokens)) {
      try {
        const tx = await simpleSwapBridge.addSupportedToken(address, symbol);
        await tx.wait();
        console.log(`✅ Added ${symbol} at ${address}`);
      } catch (error) {
        console.log(`❌ Failed to add ${symbol}: ${(error as any).message}`);
      }
    }

    // Set exchange rates
    console.log("\n💱 Setting mock exchange rates...");

    const exchangeRates = [
      { from: "VNST", to: "VNDC", rate: 10000 }, // 1:1 ratio (10000 = 100%)
      { from: "VNDC", to: "VNST", rate: 10000 }, // 1:1 ratio

      { from: "KNC", to: "VNST", rate: 7000 * 10 ** 5 }, // 1 KNC = 7000 VND (5 decimal places)
      { from: "VNST", to: "KNC", rate: Math.round((1 / 7000) * 10 ** 5) },

      { from: "KNC", to: "VNDC", rate: 7000 * 10 ** 5 }, // 1 KNC = 7000 VND (5 decimal places)
      { from: "VNDC", to: "KNC", rate: Math.round((1 / 7000) * 10 ** 5) },
    ];

    for (const { from, to, rate } of exchangeRates) {
      try {
        const tx = await simpleSwapBridge.setMockExchangeRate(from, to, rate);
        await tx.wait();
        console.log(`✅ Set exchange rate ${from} -> ${to}: ${rate / 100}%`);
      } catch (error) {
        console.log(
          `❌ Failed to set rate ${from} -> ${to}: ${(error as any).message}`
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
      KNC: "0xa445BbDF9916bB80eEDFCAE1A698191ef082F3C7", // Base Sepolia KNC
    };

    for (const [symbol, address] of Object.entries(baseTokens)) {
      try {
        const tx = await simpleSwapBridge.addSupportedToken(address, symbol);
        await tx.wait();
        console.log(`✅ Added ${symbol} at ${address}`);
      } catch (error) {
        console.log(`❌ Failed to add ${symbol}: ${(error as any).message}`);
      }
    }

    // Set exchange rates for Base Sepolia
    const exchangeRates = [
      { from: "VNST", to: "VNDC", rate: 1 * 10 ** 5 }, // 1:1 ratio (5 decimal places)
      { from: "VNDC", to: "VNST", rate: 1 * 10 ** 5 }, // 1:1 ratio

      { from: "KNC", to: "VNST", rate: 7000 * 10 ** 5 }, // 1 KNC = 7000 VND (5 decimal places)
      { from: "VNST", to: "KNC", rate: Math.round((1 / 7000) * 10 ** 5) },

      { from: "KNC", to: "VNDC", rate: 7000 * 10 ** 5 }, // 1 KNC = 7000 VND (5 decimal places)
      { from: "VNDC", to: "KNC", rate: Math.round((1 / 7000) * 10 ** 5) },
    ];

    for (const { from, to, rate } of exchangeRates) {
      try {
        const tx = await simpleSwapBridge.setMockExchangeRate(from, to, rate);
        await tx.wait();
        console.log(`✅ Set exchange rate ${from} -> ${to}: ${rate / 100}%`);
      } catch (error) {
        console.log(
          `❌ Failed to set rate ${from} -> ${to}: ${(error as any).message}`
        );
      }
    }
  }

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`SimpleSwapBridge: ${contractAddress}`);
  console.log(`Network: ${network.name} (Chain ID: ${chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  console.log("\n=== FRONTEND CONFIGURATION ===");
  console.log("Add this to your chains.json configuration:");
  console.log(`"swapBridgeContract": "${contractAddress}"`);

  console.log("\n=== RELAYER CONFIGURATION ===");
  console.log("Update your relayer server.js with:");
  console.log(`SIMPLE_SWAP_BRIDGE_ADDRESS="${contractAddress}"`);

  console.log("\n=== VERIFICATION COMMANDS ===");
  if (chainId === 11155111n) {
    console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
  } else if (chainId === 84532n) {
    console.log(`npx hardhat verify --network baseSepolia ${contractAddress}`);
  }
}
const addresses = {
  baseSepolia: "0xBD1f0aFf88a336765d5C9AA0363Ebd848B668dd6",
  sepolia: "0xf5Fcb378C522d372BD050b4e3D0d65F7Fe72F081",
};

console.log("Network name: ", network.name);

main({
  simpleSwapBridgeAddress: addresses[network.name as keyof typeof addresses],
})
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
