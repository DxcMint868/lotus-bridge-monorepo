import { expect } from "chai";
import { ethers } from "hardhat";
import { VNDToken, VNDBridge } from "../typechain-types";

describe("VND Cross-Chain Bridge", function () {
  let vndToken: VNDToken;
  let bridge: VNDBridge;
  let owner: any;
  let user: any;
  let recipient: any;

  beforeEach(async function () {
    [owner, user, recipient] = await ethers.getSigners();

    // Deploy VND Token
    const VNDToken = await ethers.getContractFactory("VNDToken");
    vndToken = await VNDToken.deploy("Vietnam Dong Token", "VND", 1000000);
    await vndToken.waitForDeployment();

    // Deploy Bridge
    const VNDBridge = await ethers.getContractFactory("VNDBridge");
    bridge = await VNDBridge.deploy(await vndToken.getAddress());
    await bridge.waitForDeployment();

    // Add bridge as authorized minter
    await vndToken.addBridge(await bridge.getAddress());

    // Transfer some tokens to user for testing
    const transferAmount = ethers.parseEther("10000");
    await vndToken.transfer(user.address, transferAmount);
  });

  describe("VND Token", function () {
    it("Should have correct initial supply", async function () {
      const totalSupply = await vndToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("1000000"));
    });

    it("Should allow bridge to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await bridge.releaseTokens(
        recipient.address,
        mintAmount,
        84532, // Base Sepolia
        ethers.keccak256(ethers.toUtf8Bytes("test-tx"))
      );

      const balance = await vndToken.balanceOf(recipient.address);
      expect(balance).to.equal(mintAmount);
    });

    it("Should handle bridge token transfers", async function () {
      const bridgeAmount = ethers.parseEther("1000");
      await vndToken.connect(user).approve(await bridge.getAddress(), bridgeAmount);
      
      const userBalanceBefore = await vndToken.balanceOf(user.address);
      
      await bridge.connect(user).bridgeTokens(
        recipient.address,
        bridgeAmount,
        84532
      );

      const userBalanceAfter = await vndToken.balanceOf(user.address);
      
      // User should have less tokens after bridging
      expect(userBalanceAfter).to.equal(userBalanceBefore - bridgeAmount);
    });
  });

  describe("VND Bridge", function () {
    it("Should estimate fees correctly", async function () {
      const amount = ethers.parseEther("10000");
      const expectedFee = amount * 50n / 10000n; // 0.5%
      
      const fee = await bridge.estimateFee(amount);
      expect(fee).to.equal(expectedFee);
    });

    it("Should reject bridge amount below minimum", async function () {
      const smallAmount = ethers.parseEther("100"); // Below 1000 VND minimum
      
      await vndToken.connect(user).approve(await bridge.getAddress(), smallAmount);
      
      await expect(
        bridge.connect(user).bridgeTokens(recipient.address, smallAmount, 84532)
      ).to.be.revertedWith("Amount below minimum");
    });

    it("Should process bridge transaction correctly", async function () {
      const bridgeAmount = ethers.parseEther("5000");
      
      await vndToken.connect(user).approve(await bridge.getAddress(), bridgeAmount);
      
      const userBalanceBefore = await vndToken.balanceOf(user.address);
      
      const tx = await bridge.connect(user).bridgeTokens(
        recipient.address,
        bridgeAmount,
        84532
      );

      const userBalanceAfter = await vndToken.balanceOf(user.address);
      
      // Check that transaction succeeded and user balance decreased
      expect(tx).to.not.be.reverted;
      expect(userBalanceAfter).to.equal(userBalanceBefore - bridgeAmount);
    });

    it("Should not allow bridging to same chain", async function () {
      const bridgeAmount = ethers.parseEther("5000");
      
      // Add current chain as supported to test the same chain logic
      const currentChainId = (await ethers.provider.getNetwork()).chainId;
      await bridge.setSupportedChain(Number(currentChainId), true);
      
      await vndToken.connect(user).approve(await bridge.getAddress(), bridgeAmount);
      
      await expect(
        bridge.connect(user).bridgeTokens(recipient.address, bridgeAmount, currentChainId)
      ).to.be.revertedWith("Cannot bridge to same chain");
    });

    it("Should only allow owner to release tokens", async function () {
      const releaseAmount = ethers.parseEther("1000");
      
      await expect(
        bridge.connect(user).releaseTokens(
          recipient.address,
          releaseAmount,
          84532,
          ethers.keccak256(ethers.toUtf8Bytes("test-tx"))
        )
      ).to.be.revertedWithCustomError(bridge, "OwnableUnauthorizedAccount");
    });

    it("Should check if chain is origin chain", async function () {
      const isOrigin = await bridge.isOriginChain();
      // On hardhat network (not Sepolia), this should be false
      expect(isOrigin).to.be.false;
    });
  });
});
