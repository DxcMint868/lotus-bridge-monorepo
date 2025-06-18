import { ethers } from "hardhat";

type OFTBridge = {
  chain1: {
    chainID: number;
    lzEndpointID: bigint;
    address: string;
  };
  chain2: {
    chainID: number;
    lzEndpointID: bigint;
    address: string;
  };
};

async function setTrustedRemoteAddress(bridges: OFTBridge[], chainID: number) {
  for (const bridge of bridges) {
    let srcChain, destChain;
    if (bridge.chain1.chainID == chainID) {
      srcChain = bridge.chain1;
      destChain = bridge.chain2;
    } else if (bridge.chain2.chainID == chainID) {
      srcChain = bridge.chain2;
      destChain = bridge.chain1;
    }
    if (!srcChain || !destChain) {
      console.warn(`Chain ID ${chainID} not found in bridge:`, bridge);
      continue;
    }

    const srcOFTInstance = await ethers.getContractAt(
      "ProxyOFTWithFee",
      srcChain.address
    );

    console.log(
      `Setting trusted remote for ${srcChain.chainID} to ${destChain.chainID}...`
    );
    const tx = await srcOFTInstance.setTrustedRemoteAddress(
      destChain.lzEndpointID,
      destChain.address
    );
    await tx.wait();

    console.log("Trusted remote address set successfully.");
  }
}

async function main() {
  const network = await ethers.provider.getNetwork();
  const chainID = network.chainId;
  console.log(`Current chain ID: ${chainID}`);

  const bridges = [
    {
      chain1: {
        chainID: 84532, // base_sepolia
        lzEndpointID: 10245n, // base_sepolia (lz-specific)
        address: "0xf5C7d595B59c010D15A10EeB56fE3697d2475566",
      },
      chain2: {
        chainID: 11155111, // eth_sepolia
        lzEndpointID: 10161n, // eth_sepolia (lz-specific)
        address: "0x63B0df23C87305483748FF85fDf7EfE16b017739",
      },
    },
  ];

  await setTrustedRemoteAddress(bridges, chainID);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
