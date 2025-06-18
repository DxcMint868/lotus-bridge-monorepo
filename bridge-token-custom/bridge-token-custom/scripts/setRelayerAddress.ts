import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Setting Relayer Address in Base Sepolia LP Contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // ✅ REAL LP addresses from actual deployment (from README.md)
  const LP_ADDRESSES = {
    "AXS": "0x03F6320ebb5510F420946393bbC58a34Ea17c69B",
    "SLP": "0xaC64802940141D74AA6a6977D3F499f9d3be6003",
    "VNST": "0x68d8D106c592Fb98885bB2Ed23d5cb4a912e5AA1",
    "VNDC": "0x9f9189D41c9923A8B16A7602fA80e66116019579",
    "A8": "0x322eF90D4D9b704Ac10a481345A3fCAAEcE3B8C1",
    "SIPHER": "0x1d84CffFA7C65F3919D15af26dB896250Eb65960",
    "C98": "0xA979eD3F88Fe69b30f7955b157F3300bC0015c78",
    "KNC": "0x884391bF910644DC70e32355C876c1AB0c41E6bd",
    "KAI": "0x284270ebc6Aa664ae79d3dC817aF0342D1f8BDEA"
  };

  // ✅ REAL BridgeFactory address (from latest deployment)
  const FACTORY_ADDRESS = "0xe77aCC776B9a8ff6b2A313330C7b5Ad10abEBB06";

  // Relayer address (from relayer logs)
  const RELAYER_ADDRESS = "0xbcBF5C8651903679f8c49f5A0193e2CF38af7f63";

  console.log(`\n🤖 Setting relayer: ${RELAYER_ADDRESS}`);
  console.log(`🏭 Using factory: ${FACTORY_ADDRESS}`);

  // Check factory owner first
  const factoryContract = await ethers.getContractAt("BridgeFactory", FACTORY_ADDRESS);
  const factoryOwner = await factoryContract.owner();
  console.log(`\n🏭 Factory owner: ${factoryOwner}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Is deployer factory owner: ${factoryOwner.toLowerCase() === deployer.address.toLowerCase()}`);

  // Get all LP addresses for batch operation
  const lpAddresses = Object.values(LP_ADDRESSES);
  
  try {
    console.log(`\n🚀 Setting relayer for all ${lpAddresses.length} LPs in one transaction...`);
    
    // Use the new setRelayerForMultipleLPs function
    const tx = await factoryContract.setRelayerForMultipleLPs(lpAddresses, RELAYER_ADDRESS);
    console.log(`📝 TX: ${tx.hash}`);
    
    await tx.wait();
    console.log(`✅ Relayer set for all LPs successfully!`);
    
    // Verify all LPs have correct relayer
    console.log(`\n🔍 Verifying relayer settings...`);
    for (const [symbol, lpAddress] of Object.entries(LP_ADDRESSES)) {
      const lpContract = await ethers.getContractAt("LiquidityPool", lpAddress);
      const currentRelayer = await lpContract.relayer();
      const isCorrect = currentRelayer.toLowerCase() === RELAYER_ADDRESS.toLowerCase();
      console.log(`   ${symbol}: ${isCorrect ? '✅' : '❌'} ${currentRelayer}`);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Batch relayer setting failed:`, errorMessage);
    
    // Fallback: Try individual LP setting
    console.log(`\n🔄 Trying individual LP settings...`);
    for (const [symbol, lpAddress] of Object.entries(LP_ADDRESSES)) {
      try {
        console.log(`\n📝 Setting relayer for ${symbol} LP: ${lpAddress}`);
        
        const lpContract = await ethers.getContractAt("LiquidityPool", lpAddress);
        
        // Check LP owner
        const lpOwner = await lpContract.owner();
        console.log(`   LP owner: ${lpOwner}`);
        console.log(`   Deployer: ${deployer.address}`);
        console.log(`   Is deployer owner: ${lpOwner.toLowerCase() === deployer.address.toLowerCase()}`);
        
        // Check current relayer
        const currentRelayer = await lpContract.relayer();
        console.log(`   Current relayer: ${currentRelayer}`);
        
        if (currentRelayer.toLowerCase() === RELAYER_ADDRESS.toLowerCase()) {
          console.log(`   ✅ Relayer already set correctly`);
          continue;
        }
        
        // Set new relayer
        const tx = await lpContract.setRelayer(RELAYER_ADDRESS);
        console.log(`   📝 TX: ${tx.hash}`);
        
        await tx.wait();
        console.log(`   ✅ Relayer set successfully`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`   ❌ Failed to set relayer for ${symbol}:`, errorMessage);
      }
    }
  }

  console.log("\n🎉 Relayer setup complete!");
  console.log("\n🧪 Test commands:");
  console.log("1. Restart relayer: cd relayer && npm start");
  console.log("2. Bridge tokens from Sepolia → Base Sepolia");
  console.log("3. Check relayer logs for successful release");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});