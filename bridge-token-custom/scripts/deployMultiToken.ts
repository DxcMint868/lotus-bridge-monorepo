import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TokenFactory and MultiBridge contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy TokenFactory first
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy();
  await tokenFactory.waitForDeployment();
  const tokenFactoryAddress = await tokenFactory.getAddress();
  console.log("TokenFactory deployed to:", tokenFactoryAddress);

  // Deploy MultiBridge
  const MultiBridge = await ethers.getContractFactory("MultiBridge");
  const multiBridge = await MultiBridge.deploy(tokenFactoryAddress);
  await multiBridge.waitForDeployment();
  const multiBridgeAddress = await multiBridge.getAddress();
  console.log("MultiBridge deployed to:", multiBridgeAddress);

  // Define tokens to deploy
  const tokens = [
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

  console.log("\nDeploying tokens...");
  const deployedTokens: { [key: string]: string } = {};

  for (const token of tokens) {
    console.log(`Deploying ${token.name} (${token.symbol})...`);
    
    const tx = await tokenFactory.deployToken(token.name, token.symbol, token.supply);
    await tx.wait();
    
    const tokenAddress = await tokenFactory.getTokenAddress(token.symbol);
    deployedTokens[token.symbol] = tokenAddress;
    
    console.log(`${token.symbol} deployed to:`, tokenAddress);
    console.log(`Initial supply of ${token.supply * 1000000} ${token.symbol} tokens transferred to:`, deployer.address);
    
    // Add bridge to token
    await tokenFactory.addBridgeToToken(token.symbol, multiBridgeAddress);
    
    // Set token as supported in bridge
    await multiBridge.setSupportedToken(token.symbol, true);
    
    console.log(`${token.symbol} configured for bridge`);
  }

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("TokenFactory:", tokenFactoryAddress);
  console.log("MultiBridge:", multiBridgeAddress);
  console.log("\nTokens:");
  for (const [symbol, address] of Object.entries(deployedTokens)) {
    console.log(`${symbol}: ${address}`);
  }

  // Generate frontend configuration
  console.log("\n=== Frontend Configuration ===");
  console.log("Add this to your frontend bridge.js file:");
  console.log(`
const CONTRACT_ADDRESSES = {
  11155111: { // Sepolia
    tokenFactory: "${tokenFactoryAddress}",
    bridge: "${multiBridgeAddress}",
    tokens: {
${Object.entries(deployedTokens).map(([symbol, address]) => `      "${symbol}": "${address}"`).join(',\n')}
    }
  },
  84532: { // Base Sepolia - Deploy separately
    tokenFactory: "DEPLOY_ON_BASE_SEPOLIA",
    bridge: "DEPLOY_ON_BASE_SEPOLIA", 
    tokens: {
${Object.entries(deployedTokens).map(([symbol]) => `      "${symbol}": "DEPLOY_ON_BASE_SEPOLIA"`).join(',\n')}
    }
  }
};
  `);

  console.log("\n=== Next Steps ===");
  console.log("1. Deploy the same contracts on Base Sepolia");
  console.log("2. Update frontend with both contract addresses");
  console.log("3. Update relayer with new bridge addresses");
  console.log("4. Test token bridging functionality");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});