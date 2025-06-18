// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenFactory.sol";

contract MultiBridge is Ownable, ReentrancyGuard {
    TokenFactory public immutable tokenFactory;
    
    // Bridge fee in basis points (100 = 1%)
    uint256 public bridgeFee = 50; // 0.5%
    uint256 public constant MAX_FEE = 1000; // 10%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Minimum bridge amount (can be different per token)
    mapping(string => uint256) public minBridgeAmount;
    uint256 public defaultMinBridgeAmount = 1000 * 10**18; // 1000 tokens
    
    // Chain ID mapping
    mapping(uint256 => bool) public supportedChains;
    mapping(bytes32 => bool) public processedTransactions;
    
    // Token specific settings
    mapping(string => bool) public supportedTokens;
    
    // Events
    event TokensLocked(
        address indexed sender,
        address indexed recipient,
        string tokenSymbol,
        uint256 amount,
        uint256 fee,
        uint256 targetChain,
        bytes32 indexed transactionId
    );
    
    event TokensBurned(
        address indexed sender,
        address indexed recipient,
        string tokenSymbol,
        uint256 amount,
        uint256 fee,
        uint256 targetChain,
        bytes32 indexed transactionId
    );
    
    event TokensMinted(
        address indexed recipient,
        string indexed tokenSymbol,
        uint256 amount,
        uint256 sourceChain,
        bytes32 indexed transactionId
    );
    
    event TokensUnlocked(
        address indexed recipient,
        string indexed tokenSymbol,
        uint256 amount,
        uint256 sourceChain,
        bytes32 indexed transactionId
    );
    
    event BridgeFeeUpdated(uint256 oldFee, uint256 newFee);
    event MinBridgeAmountUpdated(string tokenSymbol, uint256 oldAmount, uint256 newAmount);
    event ChainSupportUpdated(uint256 chainId, bool supported);
    event TokenSupportUpdated(string tokenSymbol, bool supported);
    
    constructor(address _tokenFactory) Ownable(msg.sender) {
        tokenFactory = TokenFactory(_tokenFactory);
        
        // Add supported chains (Sepolia and Base Sepolia)
        supportedChains[11155111] = true; // Sepolia
        supportedChains[84532] = true;    // Base Sepolia
    }
    
    function bridgeTokens(
        string memory tokenSymbol,
        address recipient,
        uint256 amount,
        uint256 targetChain
    ) external nonReentrant {
        require(supportedChains[targetChain], "Target chain not supported");
        require(targetChain != block.chainid, "Cannot bridge to same chain");
        require(supportedTokens[tokenSymbol], "Token not supported");
        require(recipient != address(0), "Invalid recipient");
        
        uint256 minAmount = minBridgeAmount[tokenSymbol];
        if (minAmount == 0) {
            minAmount = defaultMinBridgeAmount;
        }
        require(amount >= minAmount, "Amount below minimum");
        
        address tokenAddress = tokenFactory.getTokenAddress(tokenSymbol);
        require(tokenAddress != address(0), "Token does not exist");
        
        uint256 fee = (amount * bridgeFee) / FEE_DENOMINATOR;
        uint256 amountAfterFee = amount - fee;
        
        bytes32 transactionId = keccak256(
            abi.encodePacked(
                msg.sender,
                recipient,
                tokenSymbol,
                amount,
                targetChain,
                block.chainid,
                block.timestamp
            )
        );
        
        require(!processedTransactions[transactionId], "Transaction already processed");
        processedTransactions[transactionId] = true;
        
        // Transfer tokens from user to bridge
        require(
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Determine if this is the origin chain or destination chain
        if (isOriginChain()) {
            // Lock tokens on origin chain
            emit TokensLocked(
                msg.sender,
                recipient,
                tokenSymbol,
                amountAfterFee,
                fee,
                targetChain,
                transactionId
            );
        } else {
            // Burn tokens on destination chain
            MultiToken(tokenAddress).burn(amount);
            emit TokensBurned(
                msg.sender,
                recipient,
                tokenSymbol,
                amountAfterFee,
                fee,
                targetChain,
                transactionId
            );
        }
    }
    
    function releaseTokens(
        string memory tokenSymbol,
        address recipient,
        uint256 amount,
        uint256 sourceChain,
        bytes32 transactionId
    ) external onlyOwner {
        require(supportedChains[sourceChain], "Source chain not supported");
        require(sourceChain != block.chainid, "Cannot release from same chain");
        require(!processedTransactions[transactionId], "Transaction already processed");
        require(supportedTokens[tokenSymbol], "Token not supported");
        
        address tokenAddress = tokenFactory.getTokenAddress(tokenSymbol);
        require(tokenAddress != address(0), "Token does not exist");
        
        processedTransactions[transactionId] = true;
        
        if (isOriginChain()) {
            // Unlock tokens on origin chain
            require(
                IERC20(tokenAddress).transfer(recipient, amount),
                "Transfer failed"
            );
            emit TokensUnlocked(recipient, tokenSymbol, amount, sourceChain, transactionId);
        } else {
            // Mint tokens on destination chain
            MultiToken(tokenAddress).mint(recipient, amount);
            emit TokensMinted(recipient, tokenSymbol, amount, sourceChain, transactionId);
        }
    }
    
    function estimateFee(uint256 amount) external view returns (uint256) {
        return (amount * bridgeFee) / FEE_DENOMINATOR;
    }
    
    function isOriginChain() public view returns (bool) {
        // Consider Sepolia as the origin chain
        return block.chainid == 11155111;
    }
    
    function setBridgeFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        uint256 oldFee = bridgeFee;
        bridgeFee = newFee;
        emit BridgeFeeUpdated(oldFee, newFee);
    }
    
    function setMinBridgeAmount(string memory tokenSymbol, uint256 newAmount) external onlyOwner {
        uint256 oldAmount = minBridgeAmount[tokenSymbol];
        minBridgeAmount[tokenSymbol] = newAmount;
        emit MinBridgeAmountUpdated(tokenSymbol, oldAmount, newAmount);
    }
    
    function setDefaultMinBridgeAmount(uint256 newAmount) external onlyOwner {
        defaultMinBridgeAmount = newAmount;
    }
    
    function setSupportedChain(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupportUpdated(chainId, supported);
    }
    
    function setSupportedToken(string memory tokenSymbol, bool supported) external onlyOwner {
        supportedTokens[tokenSymbol] = supported;
        emit TokenSupportUpdated(tokenSymbol, supported);
    }
    
    function withdrawFees(string memory tokenSymbol) external onlyOwner {
        address tokenAddress = tokenFactory.getTokenAddress(tokenSymbol);
        require(tokenAddress != address(0), "Token does not exist");
        
        uint256 balance = IERC20(tokenAddress).balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(IERC20(tokenAddress).transfer(owner(), balance), "Transfer failed");
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    function getSupportedTokens() external view returns (string[] memory) {
        return tokenFactory.getActiveTokens();
    }
    
    function getTokenAddress(string memory tokenSymbol) external view returns (address) {
        return tokenFactory.getTokenAddress(tokenSymbol);
    }
    
    function getMinBridgeAmount(string memory tokenSymbol) external view returns (uint256) {
        uint256 amount = minBridgeAmount[tokenSymbol];
        return amount == 0 ? defaultMinBridgeAmount : amount;
    }
}