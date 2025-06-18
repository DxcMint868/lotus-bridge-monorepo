import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying True Lock/Release Bridge on Base Sepolia...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy BridgeFactory for Base Sepolia
  const BridgeFactory = await ethers.getContractFactory("BridgeFactory");
  const bridgeFactory = await BridgeFactory.deploy();
  await bridgeFactory.waitForDeployment();
  const factoryAddress = await bridgeFactory.getAddress();
  console.log("✅ BridgeFactory deployed to:", factoryAddress);

  // Vietnamese tokens to create pools for (matching Sepolia)
  const tokens = [
    { name: "Axie Infinity Shard", symbol: "AXS", supply: 1200000 },
    { name: "Smooth Love Potion", symbol: "SLP", supply: 1200000 },
    { name: "VN Stable", symbol: "VNST", supply: 1200000 },
    { name: "VN Digital Coin", symbol: "VNDC", supply: 1200000 },
    { name: "A8 Token", symbol: "A8", supply: 1200000 },
    { name: "Sipher Token", symbol: "SIPHER", supply: 1200000 },
    { name: "Coin98", symbol: "C98", supply: 1200000 },
    { name: "Kyber Network Crystal", symbol: "KNC", supply: 1200000 },
    { name: "KardiaChain", symbol: "KAI", supply: 1200000 }
  ];

  console.log("\n🪙 Deploying tokens and creating pools...");
  const deployedTokens: { [key: string]: string } = {};
  const deployedLPs: { [key: string]: string } = {};

  for (const token of tokens) {
    console.log(`\n📦 Deploying ${token.name} (${token.symbol})...`);
    
    // Deploy token
    const MultiToken = await ethers.getContractFactory("MultiToken");
    const multiToken = await MultiToken.deploy(token.name, token.symbol, token.supply);
    await multiToken.waitForDeployment();
    
    const tokenAddress = await multiToken.getAddress();
    deployedTokens[token.symbol] = tokenAddress;
    console.log(`   Token: ${tokenAddress}`);
    
    // Approve factory to manage tokens
    const totalSupply = ethers.parseEther(token.supply.toString());
    await multiToken.approve(factoryAddress, totalSupply);
    
    // List token in factory (creates LP)
    const tx = await bridgeFactory.listToken(tokenAddress, token.symbol);
    await tx.wait();
    
    // Get LP address
    const lpAddress = await bridgeFactory.getLPAddress(tokenAddress);
    deployedLPs[token.symbol] = lpAddress;
    console.log(`   LP: ${lpAddress}`);
    
    // Fund LP with initial liquidity (50% of total supply)
    const initialLiquidity = ethers.parseEther("500000"); // 500k tokens per LP
    await multiToken.transfer(lpAddress, initialLiquidity);
    console.log(`   ✅ LP funded with 500,000 ${token.symbol}`);
  }

  // Set supported destination chain (Sepolia for reverse bridging)
  await bridgeFactory.setSupportedChain(11155111, true);
  console.log("\n✅ Sepolia set as supported destination chain");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 BASE SEPOLIA LOCK/RELEASE DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  
  console.log("\n📋 DEPLOYMENT SUMMARY:");
  console.log("BridgeFactory:", factoryAddress);
  
  console.log("\n🪙 TOKENS:");
  Object.entries(deployedTokens).forEach(([symbol, address]) => {
    console.log(`${symbol}: ${address}`);
  });
  
  console.log("\n🏊 LIQUIDITY POOLS:");
  Object.entries(deployedLPs).forEach(([symbol, address]) => {
    console.log(`${symbol}_LP: ${address}`);
  });

  // Generate configuration for frontend
  console.log("\n" + "=".repeat(60));
  console.log("📝 FRONTEND CONFIGURATION");
  console.log("=".repeat(60));
  console.log("Add this to bridge.js LOCK_RELEASE_CONFIG:");
  console.log(`
  84532: { // Base Sepolia (Destination Chain)
    bridgeFactory: "${factoryAddress}",
    mechanism: "lock-release",
    tokens: {${Object.entries(deployedTokens).map(([symbol, address]) => `
      "${symbol}": "${address}"`).join(',')}
    },
    liquidityPools: {${Object.entries(deployedLPs).map(([symbol, address]) => `
      "${symbol}": "${address}"`).join(',')}
    }
  }`);

  // Generate relayer configuration  
  console.log("\n" + "=".repeat(60));
  console.log("🤖 RELAYER CONFIGURATION");
  console.log("=".repeat(60));
  console.log("Update .env file:");
  console.log(`
# Base Sepolia Lock/Release
BASE_SEPOLIA_BRIDGE_FACTORY=${factoryAddress}
BASE_SEPOLIA_ROLE=destination

# LP Addresses${Object.entries(deployedLPs).map(([symbol, address]) => `
BASE_SEPOLIA_${symbol}_LP=${address}`).join('')}
  `);

  console.log("\n🔄 NEXT STEPS:");
  console.log("1. Update relayer to use Base LP release instead of mint");
  console.log("2. Add Base Sepolia config to frontend");
  console.log("3. Test bidirectional Lock/Release bridging");
  console.log("4. Set relayer addresses in LP contracts");
  
  console.log("\n🎯 POOLS READY FOR TRUE LOCK/RELEASE!");
  console.log("Total liquidity deployed:", tokens.length * 500000, "tokens per type");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});