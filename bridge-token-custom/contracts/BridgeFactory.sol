// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./LiquidityPool.sol";

/**
 * @title BridgeFactory
 * @dev Factory contract for creating and managing Liquidity Pools for cross-chain bridge
 * Uses Lock/Release mechanism instead of Mint/Burn
 */
contract BridgeFactory is Ownable, ReentrancyGuard {
    // Supported tokens: 1 = supported, 0 = not supported
    mapping(address => uint8) public supportedTokens;
    
    // Token address => LP contract address
    mapping(address => address) public tokenToLP;
    
    // LP address => token address (reverse mapping)
    mapping(address => address) public lpToToken;
    
    // Array of all created LP addresses for enumeration
    address[] public allLPs;
    
    // Bridge fee in basis points (100 = 1%)
    uint256 public bridgeFee = 50; // 0.5%
    uint256 public constant MAX_FEE = 1000; // 10%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Minimum bridge amount
    uint256 public defaultMinBridgeAmount = 1000 * 10**18; // 1000 tokens
    mapping(address => uint256) public minBridgeAmount;
    
    // Supported destination chains
    mapping(uint256 => bool) public supportedChains;
    
    // Events
    event TokenListed(address indexed token, address indexed lpAddress, string symbol);
    event BridgeRequested(
        address indexed user,
        address indexed token,
        address indexed lpAddress,
        uint256 amount,
        uint256 fee,
        uint256 targetChain,
        bytes32 transactionId
    );
    event BridgeFeeUpdated(uint256 oldFee, uint256 newFee);
    event MinBridgeAmountUpdated(address indexed token, uint256 oldAmount, uint256 newAmount);
    event ChainSupportUpdated(uint256 chainId, bool supported);
    
    constructor() Ownable(msg.sender) {
        // Add supported destination chains
        supportedChains[84532] = true; // Base Sepolia (destination)
        // Note: This factory is designed for Sepolia (source) to Base Sepolia (destination)
    }
    
    /**
     * @dev List a new token and create LP for it
     * @param token Address of the token to list
     * @param symbol Symbol of the token for events
     */
    function listToken(address token, string memory symbol) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(supportedTokens[token] == 0, "Token already listed");
        require(tokenToLP[token] == address(0), "LP already exists for token");
        
        // Create new LP contract
        LiquidityPool newLP = new LiquidityPool(token, address(this));
        address lpAddress = address(newLP);
        
        // Update mappings
        supportedTokens[token] = 1;
        tokenToLP[token] = lpAddress;
        lpToToken[lpAddress] = token;
        allLPs.push(lpAddress);
        
        emit TokenListed(token, lpAddress, symbol);
    }
    
    /**
     * @dev Request bridge operation - locks tokens in LP
     * @param token Token address to bridge
     * @param amount Amount to bridge
     * @param targetChain Destination chain ID
     * @param recipient Recipient address on destination chain
     */
    function reqBridge(
        address token,
        uint256 amount,
        uint256 targetChain,
        address recipient
    ) external nonReentrant {
        require(supportedTokens[token] == 1, "Token not supported");
        require(supportedChains[targetChain], "Target chain not supported");
        require(targetChain != block.chainid, "Cannot bridge to same chain");
        require(recipient != address(0), "Invalid recipient");
        
        address lpAddress = tokenToLP[token];
        require(lpAddress != address(0), "LP not found for token");
        
        // Check minimum amount
        uint256 minAmount = minBridgeAmount[token];
        if (minAmount == 0) {
            minAmount = defaultMinBridgeAmount;
        }
        require(amount >= minAmount, "Amount below minimum");
        
        // Calculate fee
        uint256 fee = (amount * bridgeFee) / FEE_DENOMINATOR;
        uint256 amountAfterFee = amount - fee;
        
        // Generate unique transaction ID
        bytes32 transactionId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipient,
                token,
                amount,
                targetChain,
                block.chainid,
                block.timestamp,
                block.number
            )
        );
        
        // Transfer tokens from user to LP (this locks the tokens)
        require(
            IERC20(token).transferFrom(msg.sender, lpAddress, amount),
            "Transfer to LP failed"
        );
        
        // Record the lock in LP
        LiquidityPool(lpAddress).recordLock(
            msg.sender,
            recipient,
            amountAfterFee,
            fee,
            targetChain,
            transactionId
        );
        
        emit BridgeRequested(
            msg.sender,
            token,
            lpAddress,
            amountAfterFee,
            fee,
            targetChain,
            transactionId
        );
    }
    
    /**
     * @dev Get LP address for a token
     */
    function getLPAddress(address token) external view returns (address) {
        return tokenToLP[token];
    }
    
    /**
     * @dev Get token address for an LP
     */
    function getTokenAddress(address lp) external view returns (address) {
        return lpToToken[lp];
    }
    
    /**
     * @dev Get all LP addresses
     */
    function getAllLPs() external view returns (address[] memory) {
        return allLPs;
    }
    
    /**
     * @dev Get supported tokens count
     */
    function getSupportedTokensCount() external view returns (uint256) {
        return allLPs.length;
    }
    
    /**
     * @dev Check if token is supported
     */
    function isTokenSupported(address token) external view returns (bool) {
        return supportedTokens[token] == 1;
    }
    
    /**
     * @dev Estimate bridge fee
     */
    function estimateFee(uint256 amount) external view returns (uint256) {
        return (amount * bridgeFee) / FEE_DENOMINATOR;
    }
    
    /**
     * @dev Get minimum bridge amount for token
     */
    function getMinBridgeAmount(address token) external view returns (uint256) {
        uint256 amount = minBridgeAmount[token];
        return amount == 0 ? defaultMinBridgeAmount : amount;
    }
    
    // Admin functions
    function setBridgeFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        uint256 oldFee = bridgeFee;
        bridgeFee = newFee;
        emit BridgeFeeUpdated(oldFee, newFee);
    }
    
    function setMinBridgeAmount(address token, uint256 newAmount) external onlyOwner {
        uint256 oldAmount = minBridgeAmount[token];
        minBridgeAmount[token] = newAmount;
        emit MinBridgeAmountUpdated(token, oldAmount, newAmount);
    }
    
    function setDefaultMinBridgeAmount(uint256 newAmount) external onlyOwner {
        defaultMinBridgeAmount = newAmount;
    }
    
    function setSupportedChain(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupportUpdated(chainId, supported);
    }
    
    /**
     * @dev Emergency function to withdraw fees from LP
     */
    function withdrawFeesFromLP(address lpAddress) external onlyOwner {
        LiquidityPool(lpAddress).withdrawFees();
    }
    
    /**
     * @dev Set relayer address for a specific LP
     * @param lpAddress Address of the LP contract
     * @param relayerAddress Address of the new relayer
     */
    function setRelayerForLP(address lpAddress, address relayerAddress) external onlyOwner {
        require(lpAddress != address(0), "Invalid LP address");
        require(relayerAddress != address(0), "Invalid relayer address");
        require(lpToToken[lpAddress] != address(0), "LP not found");
        
        LiquidityPool(lpAddress).setRelayer(relayerAddress);
    }
    
    /**
     * @dev Set relayer address for multiple LPs at once
     * @param lpAddresses Array of LP addresses
     * @param relayerAddress Address of the new relayer
     */
    function setRelayerForMultipleLPs(address[] calldata lpAddresses, address relayerAddress) external onlyOwner {
        require(relayerAddress != address(0), "Invalid relayer address");
        
        for (uint256 i = 0; i < lpAddresses.length; i++) {
            address lpAddress = lpAddresses[i];
            require(lpAddress != address(0), "Invalid LP address");
            require(lpToToken[lpAddress] != address(0), "LP not found");
            
            LiquidityPool(lpAddress).setRelayer(relayerAddress);
        }
    }
}