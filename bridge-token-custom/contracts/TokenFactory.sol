// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Generic token contract that can be used for all tokens
contract MultiToken is ERC20, ERC20Burnable, Ownable {
    mapping(address => bool) public bridges;
    
    event BridgeAdded(address indexed bridge);
    event BridgeRemoved(address indexed bridge);
    
    modifier onlyBridge() {
        require(bridges[msg.sender], "MultiToken: caller is not a bridge");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10**decimals());
    }
    
    function mint(address to, uint256 amount) external onlyBridge {
        _mint(to, amount);
    }
    
    function burnFrom(address from, uint256 amount) public override {
        if (bridges[msg.sender]) {
            // Bridge can burn without allowance
            _burn(from, amount);
        } else {
            // Regular burnFrom with allowance check
            super.burnFrom(from, amount);
        }
    }
    
    function addBridge(address bridge) external onlyOwner {
        bridges[bridge] = true;
        emit BridgeAdded(bridge);
    }
    
    function removeBridge(address bridge) external onlyOwner {
        bridges[bridge] = false;
        emit BridgeRemoved(bridge);
    }
    
    function isBridge(address account) external view returns (bool) {
        return bridges[account];
    }
}

// TokenFactory to deploy and manage all tokens
contract TokenFactory is Ownable {
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint256 totalSupply;
        bool isActive;
    }
    
    mapping(string => TokenInfo) public tokens;
    string[] public tokenSymbols;
    
    event TokenDeployed(string indexed symbol, address indexed tokenAddress, string name);
    event TokenStatusUpdated(string indexed symbol, bool isActive);
    
    constructor() Ownable(msg.sender) {}
    
    function deployToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external onlyOwner returns (address) {
        require(tokens[symbol].tokenAddress == address(0), "Token already exists");
        
        MultiToken newToken = new MultiToken(name, symbol, initialSupply);
        
        tokens[symbol] = TokenInfo({
            tokenAddress: address(newToken),
            name: name,
            symbol: symbol,
            totalSupply: initialSupply * 10**18,
            isActive: true
        });
        
        tokenSymbols.push(symbol);
        
        // Transfer all tokens to the owner (deployer account) before transferring ownership
        uint256 totalTokens = initialSupply * 10**18;
        newToken.transfer(owner(), totalTokens);
        
        // Transfer ownership of the token to this factory
        newToken.transferOwnership(address(this));
        
        emit TokenDeployed(symbol, address(newToken), name);
        return address(newToken);
    }
    
    function getTokenAddress(string memory symbol) external view returns (address) {
        return tokens[symbol].tokenAddress;
    }
    
    function getTokenInfo(string memory symbol) external view returns (TokenInfo memory) {
        return tokens[symbol];
    }
    
    function getAllTokens() external view returns (string[] memory) {
        return tokenSymbols;
    }
    
    function setTokenStatus(string memory symbol, bool isActive) external onlyOwner {
        require(tokens[symbol].tokenAddress != address(0), "Token does not exist");
        tokens[symbol].isActive = isActive;
        emit TokenStatusUpdated(symbol, isActive);
    }
    
    function addBridgeToToken(string memory symbol, address bridge) external onlyOwner {
        require(tokens[symbol].tokenAddress != address(0), "Token does not exist");
        MultiToken(tokens[symbol].tokenAddress).addBridge(bridge);
    }
    
    function removeBridgeFromToken(string memory symbol, address bridge) external onlyOwner {
        require(tokens[symbol].tokenAddress != address(0), "Token does not exist");
        MultiToken(tokens[symbol].tokenAddress).removeBridge(bridge);
    }
    
    function getActiveTokens() external view returns (string[] memory) {
        uint256 activeCount = 0;
        
        // Count active tokens
        for (uint256 i = 0; i < tokenSymbols.length; i++) {
            if (tokens[tokenSymbols[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active token symbols
        string[] memory activeTokens = new string[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < tokenSymbols.length; i++) {
            if (tokens[tokenSymbols[i]].isActive) {
                activeTokens[index] = tokenSymbols[i];
                index++;
            }
        }
        
        return activeTokens;
    }
}