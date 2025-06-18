// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LiquidityPool
 * @dev Individual LP contract for each token in Lock/Release bridge
 * Handles locking tokens on source chain and releasing on backend call
 */
contract LiquidityPool is Ownable, ReentrancyGuard {
    // The token this LP manages
    IERC20 public immutable token;
    
    // Factory contract address
    address public immutable factory;
    
    // Backend relayer address (can call release function)
    address public relayer;
    
    // Lock tracking
    struct LockInfo {
        address sender;
        address recipient;
        uint256 amount;
        uint256 fee;
        uint256 targetChain;
        bytes32 transactionId;
        uint256 timestamp;
        bool released;
    }
    
    // Transaction ID => Lock info
    mapping(bytes32 => LockInfo) public locks;
    
    // Processed transaction IDs to prevent double release
    mapping(bytes32 => bool) public processedReleases;
    
    // Total locked amount (excluding fees)
    uint256 public totalLocked;
    
    // Total fees collected
    uint256 public totalFees;
    
    // Events
    event TokensLocked(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 fee,
        uint256 targetChain,
        bytes32 indexed transactionId
    );
    
    event TokensReleased(
        address indexed recipient,
        uint256 amount,
        bytes32 indexed transactionId,
        uint256 sourceChain
    );
    
    event RelayerUpdated(address oldRelayer, address newRelayer);
    event FeesWithdrawn(address indexed to, uint256 amount);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call");
        _;
    }
    
    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can call");
        _;
    }
    
    constructor(address _token, address _factory) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        require(_factory != address(0), "Invalid factory address");
        
        token = IERC20(_token);
        factory = _factory;
    }
    
    /**
     * @dev Record a lock operation (called by factory)
     * @param sender Original sender on source chain
     * @param recipient Recipient on destination chain
     * @param amount Amount after fee
     * @param fee Fee amount
     * @param targetChain Destination chain ID
     * @param transactionId Unique transaction identifier
     */
    function recordLock(
        address sender,
        address recipient,
        uint256 amount,
        uint256 fee,
        uint256 targetChain,
        bytes32 transactionId
    ) external onlyFactory {
        require(locks[transactionId].sender == address(0), "Transaction ID already exists");
        
        // Record lock information
        locks[transactionId] = LockInfo({
            sender: sender,
            recipient: recipient,
            amount: amount,
            fee: fee,
            targetChain: targetChain,
            transactionId: transactionId,
            timestamp: block.timestamp,
            released: false
        });
        
        // Update totals
        totalLocked += amount;
        totalFees += fee;
        
        emit TokensLocked(sender, recipient, amount, fee, targetChain, transactionId);
    }
    
    /**
     * @dev Release tokens back to user (called by relayer for failed bridges or source chain release)
     * @param recipient Address to receive tokens
     * @param amount Amount to release
     * @param transactionId Original transaction ID from source chain
     * @param sourceChain Chain ID where original lock happened
     */
    function release(
        address recipient,
        uint256 amount,
        bytes32 transactionId,
        uint256 sourceChain
    ) external onlyRelayer nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        require(!processedReleases[transactionId], "Transaction already processed");
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance in LP");
        
        // Mark as processed to prevent double release
        processedReleases[transactionId] = true;
        
        // Transfer tokens to recipient
        require(token.transfer(recipient, amount), "Transfer failed");
        
        emit TokensReleased(recipient, amount, transactionId, sourceChain);
    }
    
    /**
     * @dev Emergency release for specific lock (in case of issues)
     * @param transactionId Transaction ID to release
     */
    function emergencyRelease(bytes32 transactionId) external onlyOwner nonReentrant {
        LockInfo storage lockInfo = locks[transactionId];
        require(lockInfo.sender != address(0), "Lock not found");
        require(!lockInfo.released, "Already released");
        require(!processedReleases[transactionId], "Already processed");
        
        uint256 totalAmount = lockInfo.amount + lockInfo.fee;
        require(token.balanceOf(address(this)) >= totalAmount, "Insufficient balance");
        
        // Mark as released and processed
        lockInfo.released = true;
        processedReleases[transactionId] = true;
        
        // Update totals
        totalLocked -= lockInfo.amount;
        totalFees -= lockInfo.fee;
        
        // Return full amount (including fee) to original sender
        require(token.transfer(lockInfo.sender, totalAmount), "Transfer failed");
        
        emit TokensReleased(lockInfo.sender, totalAmount, transactionId, block.chainid);
    }
    
    /**
     * @dev Set relayer address (only owner)
     */
    function setRelayer(address newRelayer) external onlyOwner {
        require(newRelayer != address(0), "Invalid relayer address");
        address oldRelayer = relayer;
        relayer = newRelayer;
        emit RelayerUpdated(oldRelayer, newRelayer);
    }
    
    /**
     * @dev Withdraw collected fees (only factory owner)
     */
    function withdrawFees() external {
        require(msg.sender == owner() || msg.sender == factory, "Unauthorized");
        require(totalFees > 0, "No fees to withdraw");
        
        uint256 feeAmount = totalFees;
        totalFees = 0;
        
        require(token.transfer(owner(), feeAmount), "Fee transfer failed");
        
        emit FeesWithdrawn(owner(), feeAmount);
    }
    
    /**
     * @dev Get lock information
     */
    function getLockInfo(bytes32 transactionId) external view returns (LockInfo memory) {
        return locks[transactionId];
    }
    
    /**
     * @dev Get LP statistics
     */
    function getStats() external view returns (
        uint256 balance,
        uint256 locked,
        uint256 fees,
        uint256 available
    ) {
        balance = token.balanceOf(address(this));
        locked = totalLocked;
        fees = totalFees;
        available = balance - locked - fees;
    }
    
    /**
     * @dev Check if transaction was processed
     */
    function isProcessed(bytes32 transactionId) external view returns (bool) {
        return processedReleases[transactionId];
    }
    
    /**
     * @dev Emergency function to recover stuck tokens (only owner)
     */
    function emergencyWithdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(token.balanceOf(address(this)) >= amount, "Insufficient balance");
        
        require(token.transfer(to, amount), "Transfer failed");
    }
}