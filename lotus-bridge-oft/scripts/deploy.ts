// Importing necessary functionalities from the Hardhat package.
import { ethers } from "hardhat";
import hre from "hardhat";

interface DeployParams {
  lzEndpointContract: string; // Optional parameter for the LayerZero endpoint contract address.
  dstChainID: bigint;
  sharedDecimals: bigint;
  innerTokenContract?: string;
}

async function main({
  lzEndpointContract,
  dstChainID,
  sharedDecimals,
  innerTokenContract,
}: DeployParams) {
  // deploy token contract if not provided
  let instanceVNST = null;
  if (!innerTokenContract) {
    const instanceVNST = await ethers.deployContract("MyToken");
    await instanceVNST.waitForDeployment();
    console.log(
      `Token contract is deployed. Token address: ${instanceVNST.target}`
    );
  } else {
    instanceVNST = await ethers.getContractAt("IERC20", innerTokenContract);
  }

  // deploy bridge
  const TokenAddress = instanceVNST!.target;
  const instanceBridge = await ethers.getContractFactory("ProxyOFTWithFee");
  const BridgeContract = await instanceBridge.deploy(
    TokenAddress,
    sharedDecimals,
    lzEndpointContract
  );
  // Waiting for the contract deployment to be confirmed on the blockchain.
  await BridgeContract.waitForDeployment();
  console.log(
    `Bridge contract is deployed. Bridge address: ${BridgeContract.target}`
  );

  // call setMinDstGas() function
  console.log("Setting minimum destination gas...");
  const tx = await BridgeContract.setMinDstGas(
    dstChainID,
    0n, // for SEND operation
    100000,
    { gasLimit: 300000 }
  ); //
  await tx.wait();

  console.log("Verifying contract...");
  await hre.run("verify:verify", {
    address: BridgeContract.target,
    constructorArguments: [TokenAddress, sharedDecimals, lzEndpointContract],
  });
  console.log("Done!!");
}

// This pattern allows the use of async/await throughout and ensures that errors are caught and handled properly.
main({
  //   lzEndpointContract: "0x55370E0fBB5f5b8dAeD978BA1c075a499eB107B8", // for base_sepolia
  lzEndpointContract: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1", // For sepolia

  //   dstChainID: 10161n, // to eth_sepolia
  dstChainID: 10245n, // to base_sepolia

  sharedDecimals: 6n,

  //   innerTokenContract: "0x51119AEF407Dc28e13aFD5e11E93Ae0d29EFbf51", // for base_sepolia
  innerTokenContract: "0xca7ED9Ca8015bbDdd070A83DC78323535004772f", // for sepolia
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
