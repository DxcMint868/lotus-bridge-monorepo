import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Lock/Release Bridge Factory and Liquidity Pools...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy BridgeFactory first
  const BridgeFactory = await ethers.getContractFactory("BridgeFactory");
  const bridgeFactory = await BridgeFactory.deploy();
  await bridgeFactory.waitForDeployment();
  const factoryAddress = await bridgeFactory.getAddress();
  console.log("BridgeFactory deployed to:", factoryAddress);

  // Vietnamese tokens to support (same as before)
  const vietnameseTokens = [
    { name: "Axie Infinity Shard", symbol: "AXS", supply: 1000000 },
    { name: "Smooth Love Potion", symbol: "SLP", supply: 1000000 },
    { name: "VN Stable", symbol: "VNST", supply: 1000000 },
    { name: "VN Digital Coin", symbol: "VNDC", supply: 1000000 },
    { name: "A8 Token", symbol: "A8", supply: 1000000 },
    { name: "Sipher Token", symbol: "SIPHER", supply: 1000000 },
    { name: "Coin98", symbol: "C98", supply: 1000000 },
    { name: "Kyber Network Crystal", symbol: "KNC", supply: 1000000 },
    { name: "KardiaChain", symbol: "KAI", supply: 1000000 }
  ];

  console.log("\nDeploying Vietnamese tokens and creating LPs...");
  const deployedTokens: { [key: string]: string } = {};
  const deployedLPs: { [key: string]: string } = {};

  // Deploy tokens first (using existing MultiToken contract)
  for (const token of vietnameseTokens) {
    console.log(`Deploying ${token.name} (${token.symbol})...`);
    
    const MultiToken = await ethers.getContractFactory("MultiToken");
    const multiToken = await MultiToken.deploy(token.name, token.symbol, token.supply);
    await multiToken.waitForDeployment();
    
    const tokenAddress = await multiToken.getAddress();
    deployedTokens[token.symbol] = tokenAddress;
    
    console.log(`${token.symbol} deployed to:`, tokenAddress);
    
    // Approve factory to spend tokens for initial liquidity
    const totalSupply = ethers.parseEther(token.supply.toString());
    await multiToken.approve(factoryAddress, totalSupply);
    
    // List token in factory (creates LP automatically)
    const tx = await bridgeFactory.listToken(tokenAddress, token.symbol);
    await tx.wait();
    
    // Get LP address
    const lpAddress = await bridgeFactory.getLPAddress(tokenAddress);
    deployedLPs[token.symbol] = lpAddress;
    
    console.log(`${token.symbol} LP created at:`, lpAddress);
    
    // Add initial liquidity to LP (transfer tokens to LP)
    const initialLiquidity = ethers.parseEther("100000"); // 100k tokens per LP
    await multiToken.transfer(lpAddress, initialLiquidity);
    
    console.log(`${token.symbol} LP funded with 100,000 tokens`);
  }

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("BridgeFactory:", factoryAddress);
  console.log("\nTokens:");
  for (const [symbol, address] of Object.entries(deployedTokens)) {
    console.log(`${symbol}: ${address}`);
  }
  console.log("\nLiquidity Pools:");
  for (const [symbol, address] of Object.entries(deployedLPs)) {
    console.log(`${symbol}_LP: ${address}`);
  }

  // Generate frontend configuration for Lock/Release bridge
  console.log("\n=== Frontend Configuration (Lock/Release Bridge) ===");
  console.log("Add this to your frontend bridge.js file:");
  console.log(`
const LOCK_RELEASE_CONFIG = {
  11155111: { // Sepolia (Source Chain)
    bridgeFactory: "${factoryAddress}",
    mechanism: "lock-release",
    tokens: {
${Object.entries(deployedTokens).map(([symbol, address]) => `      "${symbol}": "${address}"`).join(',\n')}
    },
    liquidityPools: {
${Object.entries(deployedLPs).map(([symbol, address]) => `      "${symbol}": "${address}"`).join(',\n')}
    }
  }
};
  `);

  console.log("\n=== Relayer Configuration ===");
  console.log("Update your .env file:");
  console.log(`
# Lock/Release Bridge Configuration
SEPOLIA_BRIDGE_FACTORY=${factoryAddress}
BRIDGE_MECHANISM=lock-release

# LP Addresses for relayer
${Object.entries(deployedLPs).map(([symbol, address]) => `SEPOLIA_${symbol}_LP=${address}`).join('\n')}
  `);

  console.log("\n=== Next Steps ===");
  console.log("1. Set up relayer addresses in each LP contract");
  console.log("2. Update frontend to support both Mint/Burn and Lock/Release modes");
  console.log("3. Update relayer backend to handle Lock/Release events");
  console.log("4. Test token locking and releasing functionality");
  console.log("5. For destination chain: Deploy receiver contract or use existing MultiBridge");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});