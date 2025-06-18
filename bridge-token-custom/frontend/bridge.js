// Contract addresses (UPDATE THESE AFTER DEPLOYMENT)
const CONTRACT_ADDRESSES = {
    11155111: { // Sepolia
        // Mint/Burn Bridge (existing)
        tokenFactory: "0x4e64b014136f932FF69cba0736C9fce8e0C2FA44",
        bridge: "0x88A6B192D1349a686E088f428cF7E0037Ea775b0",
        tokens: {
            "AXS": "0x5bEf3Ad7946C68716Bd80A30a5D3e861E43d5dda",
            "SLP": "0xA978400455556e3a553A001671A8b69951882c0F",
            "VNST": "0x4652041bdDCB7b87CBa506313Eea80a66e6C1C1c",
            "VNDC": "0xbF0C89b04246C792705b029Fe8481EDd5275A549",
            "A8": "0x936e4732a3c38557FbeeE753e9594C9739826aFe",
            "SIPHER": "0x4AeEf8cC35C729943C8605D7477C021A11Bf2dDD",
            "C98": "0x2E8363f5adffDC42FE7011252CE917486DcC4896",
            "KNC": "0x8C7a68a26C52b76b189dc8Ef91E4c17582404501",
            "KAI": "0x2Bf1A72C3d8536f17bd54f162163d03Ef92F8B3F"
        }
    },
    84532: { // Base Sepolia
        tokenFactory: "0xf7d258DF179Ad3F97B242A102F8593C3d65e1687",
        bridge: "0xad1eE286bd3e9682Dc0E21b91A00E575404505a2",
        tokens: {
            "AXS": "0x84021914012b91CFbe9F8e5f541b45A7672bE577",
            "SLP": "0x20A161c202c5E9eAE1ED42127FB9EFd7EbAedCc7",
            "VNST": "0x6b6F99AE7D640b39352b4c49dca1f6Bed11EfF39",
            "VNDC": "0xCD7120d18Ae117284723D51555b8F3723abAF398",
            "A8": "0xD975c471550939d30aa0d4591435649E6AB2F5E0",
            "SIPHER": "0x611d9cf77Da7059644B2413e0a0323E47aBFF1d4",
            "C98": "0x7A2Eb6a5CA1E35a4064C137b335d8dA4eD8e519B",
            "KNC": "0x98c5293256f191548cE6B863Acc210717Af9c4c7",
            "KAI": "0xa4870377bA042b6E6D3Faa2ff1D775F8630a8762"
        }
    }
};

// Lock/Release Bridge Configuration (UPDATED WITH REAL ADDRESSES)
const LOCK_RELEASE_CONFIG = {
    11155111: { // Sepolia (Source Chain)
        bridgeFactory: "0xE8CcfF76c6215af5A75Bd391b5bA3d4A8cacEf0D", 
        mechanism: "lock-release",
        tokens: {
            "AXS": "0x4faBa27A73DD517db50945c2F02621eba3959B1E",
            "SLP": "0x17194dA767007572FCb0fAdB48f9BD3DAd314c19",
            "VNST": "0xBF00AB3f7C2c15eCA16a2f58d682B92BcBe78e4B",
            "VNDC": "0x322D132a837468342Cba668e473497D6B61A6854", 
            "A8": "0xFd3ACA875894a448c39EE9bBdc5Ea7102De4CFF4",
            "SIPHER": "0x3432269A1Effc63390cbe6889c2B5BE23b73eD76",
            "C98": "0x10263EB9Bd57266feC38548cCd02D9d656eB83De",
            "KNC": "0x8bAef75f951E789136046e7CBd5eB164D35169D6",
            "KAI": "DEPLOY_TOKEN_HERE"
        },
        liquidityPools: {
            "AXS": "0x74C343f4f72e77FA6110A10693F2c0F6dBe71a66",
            "SLP": "0xd4e7B95a3a13CAAF384A71d78E1BF17b030aA817",
            "VNST": "0xF5e815eC423b237F81bC8Af4f80A9311F02e8D33",
            "VNDC": "0x9c0d6604e69AABAd833e271074317c790e2DbCFa",
            "A8": "0xda4dBcE5D9ae44AE05F0fF458EE370996cc4105B", 
            "SIPHER": "0x29550Dc7a72A380333c25D8A050e0B96efe965FF",
            "C98": "0xdA1548bbE9e16636025b3b1D44383ebBB46a82B2",
            "KNC": "0x6C8B5795C4bF51E2f32CBc331C7dE0f2C6Cd567E",
            "KAI": "0xa15faD49027100a8957463Ac1E29Be724670419f"
        }
    },
    84532: { // Base Sepolia (Destination Chain) - ✅ NEW
        bridgeFactory: "0xB459C6dB64322288A13d93A08d280E7fC3EcC5e9",
        mechanism: "lock-release",
        tokens: {
            "AXS": "0x1A217B0Fc77c8A850D36AD97E853723e3b0C99e9",
            "SLP": "0x5d6D1c2ae89aA36570e092E46357dE8f475E00Da",
            "VNST": "0x28AB093fe36D78940eB292599268F638E80f5e41",
            "VNDC": "0xB0F301289ddf67e382D8E97100598a97A937a0a0",
            "A8": "0x7d3c77cC5e84436288aED3DeBF255DeC42E9Fd8c",
            "SIPHER": "0xa7257D897d3b5CE76EB763a907ac62807e88FC79",
            "C98": "0x4432cFC6F29C183bE82570eFD6AB3a7Fc9258cFF",
            "KNC": "0xECe52517c6459b34ab6b2CBb7C7C684498B96FB9",
            "KAI": "0xA94A42BFB0b07A7E0BD18e47AC3AE2e02CDe9a6b"
        },
        liquidityPools: {
            "AXS": "0xa4a23e61fA25f4487F46dcbBE98F87a70DF6cE7e",
            "SLP": "0xE5855571f00e0F38a78bFe1EB099d202F3bBEE3D",
            "VNST": "0x3e8c27c90b51ec522D8C6dBB75204f759d4DD29F",
            "VNDC": "0xb1522ad17A5f252ef8a233C912e6b5F001C48A13",
            "A8": "0xa5Fa653c177075e21B935B37bE1bC480caB2592c",
            "SIPHER": "0x3DFBE79233e438012bD37a56074c33AC21e53c68",
            "C98": "0x54B92CBF388E04fD1F90283E65D033c83f6677dB",
            "KNC": "0x76b09E78D6d443B87a79A547ecC32BCA50058ce1",
            "KAI": "0x9f4FdE1f10d7d7ec2724787db7457d4dce53b444"
        }
    }
};

// Token definitions with names and symbols
const TOKENS = {
    "AXS": { name: "Axie Infinity Shard", symbol: "AXS" },
    "SLP": { name: "Smooth Love Potion", symbol: "SLP" },
    "VNST": { name: "VN Stable", symbol: "VNST" },
    "VNDC": { name: "VN Digital Coin", symbol: "VNDC" },
    "A8": { name: "A8 Token", symbol: "A8" },
    "SIPHER": { name: "Sipher Token", symbol: "SIPHER" },
    "C98": { name: "Coin98", symbol: "C98" },
    "KNC": { name: "Kyber Network Crystal", symbol: "KNC" },
    "KAI": { name: "KardiaChain", symbol: "KAI" }
};

// Network configurations
const NETWORKS = {
    11155111: {
        name: "Sepolia Testnet",
        rpcUrl: "https://sepolia.infura.io/v3/f80b521be02b402cb68f29b0f4c91311",
        blockExplorer: "https://sepolia.etherscan.io",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }
    },
    84532: {
        name: "Base Sepolia",
        rpcUrl: "https://sepolia.base.org",
        blockExplorer: "https://sepolia.basescan.org",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }
    }
};

// Contract ABIs (updated for both mechanisms)
const TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
];

const BRIDGE_ABI = [
    "function bridgeTokens(string tokenSymbol, address recipient, uint256 amount, uint256 targetChain)",
    "function estimateFee(uint256 amount) view returns (uint256)",
    "function getTokenAddress(string tokenSymbol) view returns (address)"
];

// Lock/Release Bridge Factory ABI
const FACTORY_ABI = [
    "function reqBridge(address token, uint256 amount, uint256 targetChain, address recipient)",
    "function estimateFee(uint256 amount) view returns (uint256)",
    "function getLPAddress(address token) view returns (address)",
    "function isTokenSupported(address token) view returns (bool)",
    "function getMinBridgeAmount(address token) view returns (uint256)"
];

// Global variables
let provider, signer, currentAccount, currentChainId, selectedToken, bridgeMode = 'mint-burn';

// DOM elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletInfo = document.getElementById('walletInfo');
const walletAddress = document.getElementById('walletAddress');
const currentNetwork = document.getElementById('currentNetwork');
const tokenBalance = document.getElementById('tokenBalance');
const selectedTokenSymbol = document.getElementById('selectedTokenSymbol');
const bridgeModeSelect = document.getElementById('bridgeModeSelect');
const bridgeModeInfo = document.getElementById('bridgeModeInfo');
const tokenSelect = document.getElementById('tokenSelect');
const fromNetwork = document.getElementById('fromNetwork');
const toNetwork = document.getElementById('toNetwork');
const recipientAddress = document.getElementById('recipientAddress');
const amount = document.getElementById('amount');
const bridgeFeeElement = document.getElementById('bridgeFee');
const amountAfterFee = document.getElementById('amountAfterFee');
const feeTokenSymbol = document.getElementById('feeTokenSymbol');
const afterFeeTokenSymbol = document.getElementById('afterFeeTokenSymbol');
const approveTokensBtn = document.getElementById('approveTokens');
const bridgeTokensBtn = document.getElementById('bridgeTokens');
const transactionList = document.getElementById('transactionList');

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.ethereum === 'undefined') {
        alert('MetaMask required!');
        return;
    }
    
    setupEventListeners();
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) await connectWallet();
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
});

function setupEventListeners() {
    connectWalletBtn.addEventListener('click', connectWallet);
    bridgeModeSelect.addEventListener('change', updateBridgeMode);
    fromNetwork.addEventListener('change', updateToNetwork);
    amount.addEventListener('input', updateFeeEstimate);
    approveTokensBtn.addEventListener('click', approveTokens);
    bridgeTokensBtn.addEventListener('click', bridgeTokens);
    tokenSelect.addEventListener('change', updateSelectedToken);
    recipientAddress.addEventListener('focus', function() {
        if (!this.value && currentAccount) this.value = currentAccount;
    });
}

function updateBridgeMode() {
    bridgeMode = bridgeModeSelect.value;
    
    if (bridgeMode === 'mint-burn') {
        bridgeModeInfo.textContent = 'Mint/Burn: Creates new tokens on destination chain';
        updateToNetwork(); // Allow both directions
    } else {
        bridgeModeInfo.textContent = 'Lock/Release: Only Sepolia → Base Sepolia (locks original tokens)';
        // For Lock/Release, only allow Sepolia to Base Sepolia
        if (currentChainId === 11155111) {
            fromNetwork.value = '11155111';
            toNetwork.innerHTML = '<option value="84532">Base Sepolia</option>';
        } else {
            showWarning('Lock/Release mode only available from Sepolia. Please switch to Sepolia network.');
        }
    }
    
    updateFeeEstimate();
}

async function connectWallet() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        currentAccount = await signer.getAddress();
        
        const network = await provider.getNetwork();
        currentChainId = Number(network.chainId);
        
        // Update UI
        connectWalletBtn.style.display = 'none';
        walletInfo.classList.remove('hidden');
        walletAddress.textContent = `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
        currentNetwork.textContent = NETWORKS[currentChainId]?.name || `Chain ${currentChainId}`;
        
        updateNetworkSelectors();
        await updateBalance();
        enableFormControls();
        
        if (!recipientAddress.value) recipientAddress.value = currentAccount;
    } catch (error) {
        showError('Failed to connect: ' + error.message);
    }
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        resetUI();
    } else if (accounts[0] !== currentAccount) {
        await connectWallet();
    }
}

function updateNetworkSelectors() {
    const chains = Object.keys(NETWORKS).map(Number);
    
    fromNetwork.innerHTML = '';
    toNetwork.innerHTML = '';
    
    chains.forEach(chainId => {
        const option1 = document.createElement('option');
        option1.value = chainId;
        option1.textContent = NETWORKS[chainId].name;
        option1.selected = chainId === currentChainId;
        fromNetwork.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = chainId;
        option2.textContent = NETWORKS[chainId].name;
        option2.selected = chainId !== currentChainId;
        toNetwork.appendChild(option2);
    });
}

function updateToNetwork() {
    const fromChainId = parseInt(fromNetwork.value);
    const otherChains = Object.keys(NETWORKS).map(Number).filter(id => id !== fromChainId);
    
    toNetwork.innerHTML = '';
    otherChains.forEach(chainId => {
        const option = document.createElement('option');
        option.value = chainId;
        option.textContent = NETWORKS[chainId].name;
        toNetwork.appendChild(option);
    });
    updateFeeEstimate();
}

async function updateBalance() {
    if (!currentAccount || !currentChainId || !selectedToken) {
        tokenBalance.textContent = '0';
        return;
    }
    
    try {
        let tokenAddress;
        
        // Determine token address based on bridge mode
        if (bridgeMode === 'mint-burn') {
            // For Mint/Burn: Use CONTRACT_ADDRESSES
            if (!CONTRACT_ADDRESSES[currentChainId]) {
                tokenBalance.textContent = 'Network not supported';
                return;
            }
            
            tokenAddress = CONTRACT_ADDRESSES[currentChainId].tokens[selectedToken];
            
            // Fallback: Query bridge contract for token address
            if (!tokenAddress || tokenAddress === "0x...") {
                try {
                    const bridgeContract = new ethers.Contract(
                        CONTRACT_ADDRESSES[currentChainId].bridge,
                        BRIDGE_ABI,
                        provider
                    );
                    tokenAddress = await bridgeContract.getTokenAddress(selectedToken);
                } catch (error) {
                    console.error('Bridge contract query failed:', error);
                    tokenBalance.textContent = 'Token not found';
                    return;
                }
            }
        } else {
            // For Lock/Release: Use LOCK_RELEASE_CONFIG
            if (currentChainId !== 11155111) {
                tokenBalance.textContent = 'Lock/Release only on Sepolia';
                return;
            }
            
            if (!LOCK_RELEASE_CONFIG[currentChainId]) {
                tokenBalance.textContent = 'Config not found';
                return;
            }
            
            tokenAddress = LOCK_RELEASE_CONFIG[currentChainId].tokens[selectedToken];
            
            if (!tokenAddress || tokenAddress === "DEPLOY_TOKEN_HERE") {
                tokenBalance.textContent = 'Token not deployed';
                return;
            }
        }
        
        // Query token balance
        console.log(`Querying balance for ${selectedToken} at ${tokenAddress}`);
        const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
        const balance = await tokenContract.balanceOf(currentAccount);
        const formattedBalance = parseFloat(ethers.formatEther(balance));
        
        tokenBalance.textContent = formattedBalance.toLocaleString();
        
        // Update fee symbols
        feeTokenSymbol.textContent = selectedToken;
        afterFeeTokenSymbol.textContent = selectedToken;
        
        console.log(`✅ Balance for ${selectedToken}: ${formattedBalance}`);
        
    } catch (error) {
        console.error('Balance query error:', error);
        tokenBalance.textContent = 'Error';
        
        // Show user-friendly error
        if (error.message.includes('call revert')) {
            showError(`Token ${selectedToken} not found on ${NETWORKS[currentChainId]?.name}`);
        } else {
            showError(`Failed to get balance: ${error.message}`);
        }
    }
}

async function updateFeeEstimate() {
    const amountValue = amount.value;
    if (!amountValue || !currentChainId || !selectedToken) {
        bridgeFeeElement.textContent = '0';
        amountAfterFee.textContent = '0';
        return;
    }
    
    try {
        let feeWei;
        
        if (bridgeMode === 'mint-burn') {
            // Use existing MultiBridge contract
            if (!CONTRACT_ADDRESSES[currentChainId]) return;
            
            const bridgeContract = new ethers.Contract(
                CONTRACT_ADDRESSES[currentChainId].bridge,
                BRIDGE_ABI,
                provider
            );
            
            const amountWei = ethers.parseEther(amountValue);
            feeWei = await bridgeContract.estimateFee(amountWei);
        } else {
            // Use Lock/Release BridgeFactory
            if (!LOCK_RELEASE_CONFIG[currentChainId] || currentChainId !== 11155111) {
                bridgeFeeElement.textContent = 'Only available on Sepolia';
                amountAfterFee.textContent = 'N/A';
                return;
            }
            
            const factoryContract = new ethers.Contract(
                LOCK_RELEASE_CONFIG[currentChainId].bridgeFactory,
                FACTORY_ABI,
                provider
            );
            
            const amountWei = ethers.parseEther(amountValue);
            feeWei = await factoryContract.estimateFee(amountWei);
        }
        
        const fee = parseFloat(ethers.formatEther(feeWei));
        const afterFee = parseFloat(amountValue) - fee;
        
        bridgeFeeElement.textContent = fee.toLocaleString();
        amountAfterFee.textContent = afterFee.toLocaleString();
        
        feeTokenSymbol.textContent = selectedToken;
        afterFeeTokenSymbol.textContent = selectedToken;
    } catch (error) {
        console.error('Fee estimation error:', error);
        bridgeFeeElement.textContent = 'Error';
        amountAfterFee.textContent = 'Error';
    }
}

async function approveTokens() {
    const amountValue = amount.value;
    if (!amountValue || !selectedToken) {
        showError('Please select token and enter amount');
        return;
    }
    
    try {
        approveTokensBtn.disabled = true;
        approveTokensBtn.textContent = 'Approving...';
        
        let tokenAddress, spenderAddress;
        
        if (bridgeMode === 'mint-burn') {
            // Use existing Mint/Burn logic
            tokenAddress = CONTRACT_ADDRESSES[currentChainId].tokens[selectedToken];
            if (!tokenAddress || tokenAddress === "0x...") {
                const bridgeContract = new ethers.Contract(
                    CONTRACT_ADDRESSES[currentChainId].bridge,
                    BRIDGE_ABI,
                    provider
                );
                tokenAddress = await bridgeContract.getTokenAddress(selectedToken);
            }
            spenderAddress = CONTRACT_ADDRESSES[currentChainId].bridge;
        } else {
            // Use Lock/Release logic
            if (currentChainId !== 11155111) {
                showError('Lock/Release only available on Sepolia');
                return;
            }
            
            tokenAddress = LOCK_RELEASE_CONFIG[currentChainId].tokens[selectedToken];
            spenderAddress = LOCK_RELEASE_CONFIG[currentChainId].liquidityPools[selectedToken];
            
            if (!tokenAddress || !spenderAddress) {
                showError('Token or LP not found for Lock/Release mode');
                return;
            }
        }
        
        const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
        const amountWei = ethers.parseEther(amountValue);
        const tx = await tokenContract.approve(spenderAddress, amountWei);
        
        addTransaction(`Approve ${selectedToken} (${bridgeMode})`, tx.hash, 'pending');
        showSuccess(`${selectedToken} approval submitted...`);
        
        await tx.wait();
        updateTransaction(tx.hash, 'success');
        showSuccess(`${selectedToken} approved for ${bridgeMode}!`);
        bridgeTokensBtn.disabled = false;
        
    } catch (error) {
        showError(`Approval failed: ${error.message}`);
        updateTransaction('latest', 'failed');
    } finally {
        approveTokensBtn.disabled = false;
        approveTokensBtn.textContent = '1. Approve Tokens';
    }
}

async function bridgeTokens() {
    const amountValue = amount.value;
    const recipient = recipientAddress.value;
    const targetChain = parseInt(toNetwork.value);
    
    if (!amountValue || !recipient || !targetChain || !selectedToken) {
        showError('Please fill all fields');
        return;
    }
    
    if (!ethers.isAddress(recipient)) {
        showError('Invalid recipient address');
        return;
    }
    
    try {
        bridgeTokensBtn.disabled = true;
        bridgeTokensBtn.textContent = 'Bridging...';
        
        let tx;
        
        if (bridgeMode === 'mint-burn') {
            // Use existing MultiBridge contract
            const bridgeContract = new ethers.Contract(
                CONTRACT_ADDRESSES[currentChainId].bridge,
                BRIDGE_ABI,
                signer
            );
            
            const amountWei = ethers.parseEther(amountValue);
            tx = await bridgeContract.bridgeTokens(selectedToken, recipient, amountWei, targetChain);
        } else {
            // Use Lock/Release BridgeFactory
            if (currentChainId !== 11155111) {
                showError('Lock/Release only available on Sepolia');
                return;
            }
            
            const factoryContract = new ethers.Contract(
                LOCK_RELEASE_CONFIG[currentChainId].bridgeFactory,
                FACTORY_ABI,
                signer
            );
            
            const tokenAddress = LOCK_RELEASE_CONFIG[currentChainId].tokens[selectedToken];
            const amountWei = ethers.parseEther(amountValue);
            
            tx = await factoryContract.reqBridge(tokenAddress, amountWei, targetChain, recipient);
        }
        
        addTransaction(`Bridge ${bridgeMode}`, tx.hash, 'pending');
        showSuccess(`Bridge transaction submitted (${bridgeMode})...`);
        
        await tx.wait();
        updateTransaction(tx.hash, 'success');
        showSuccess(`Successfully bridged ${amountValue} ${selectedToken} using ${bridgeMode}!`);
        
        await updateBalance();
        amount.value = '';
        recipientAddress.value = '';
        updateFeeEstimate();
        
    } catch (error) {
        showError(`Bridge failed: ${error.message}`);
        updateTransaction('latest', 'failed');
    } finally {
        bridgeTokensBtn.disabled = false;
        bridgeTokensBtn.textContent = '2. Bridge Tokens';
    }
}

function updateSelectedToken() {
    const tokenSymbol = tokenSelect.value;
    selectedToken = tokenSymbol;
    selectedTokenSymbol.textContent = tokenSymbol || '-';
    
    if (tokenSymbol) {
        updateBalance();
        updateFeeEstimate();
        if (currentAccount) approveTokensBtn.disabled = false;
    } else {
        tokenBalance.textContent = '0';
        selectedTokenSymbol.textContent = '-';
        feeTokenSymbol.textContent = 'tokens';
        afterFeeTokenSymbol.textContent = 'tokens';
        bridgeFeeElement.textContent = '0';
        amountAfterFee.textContent = '0';
        approveTokensBtn.disabled = true;
        bridgeTokensBtn.disabled = true;
    }
}

function addTransaction(type, hash, status) {
    const noTxMsg = transactionList.querySelector('.no-transactions');
    if (noTxMsg) noTxMsg.remove();
    
    const txItem = document.createElement('div');
    txItem.className = 'transaction-item';
    txItem.dataset.hash = hash;
    
    const explorerUrl = `${NETWORKS[currentChainId].blockExplorer}/tx/${hash}`;
    
    txItem.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <strong>${type} Transaction</strong>
            <span class="transaction-status status-${status}">${status}</span>
        </div>
        <div class="transaction-hash">
            <a href="${explorerUrl}" target="_blank">${hash.slice(0, 10)}...${hash.slice(-8)}</a>
        </div>
        <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
            ${new Date().toLocaleTimeString()}
        </div>
    `;
    
    transactionList.insertBefore(txItem, transactionList.firstChild);
}

function updateTransaction(hash, status) {
    const txItem = transactionList.querySelector(`[data-hash="${hash}"]`) || 
                transactionList.querySelector('.transaction-item:first-child');
    
    if (txItem) {
        const statusElement = txItem.querySelector('.transaction-status');
        if (statusElement) {
            statusElement.className = `transaction-status status-${status}`;
            statusElement.textContent = status;
        }
    }
}

function enableFormControls() {
    fromNetwork.disabled = false;
    toNetwork.disabled = false;
    recipientAddress.disabled = false;
    amount.disabled = false;
    approveTokensBtn.disabled = false;
}

function resetUI() {
    connectWalletBtn.style.display = 'block';
    walletInfo.classList.add('hidden');
    currentAccount = null;
    currentChainId = null;
    provider = null;
    signer = null;
    
    [fromNetwork, toNetwork, recipientAddress, amount, approveTokensBtn, bridgeTokensBtn].forEach(el => el.disabled = true);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    document.querySelector('.bridge-section').insertBefore(errorDiv, document.querySelector('.bridge-section').firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    document.querySelector('.bridge-section').insertBefore(successDiv, document.querySelector('.bridge-section').firstChild);
    setTimeout(() => successDiv.remove(), 5000);
}

function showWarning(message) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'warning';
    warningDiv.textContent = message;
    document.querySelector('.bridge-section').insertBefore(warningDiv, document.querySelector('.bridge-section').firstChild);
    setTimeout(() => warningDiv.remove(), 8000);
}

// Test Helper Functions - Add to console for debugging
function debugBridgeSystem() {
    console.log('🔍 Bridge System Debug Info');
    console.log('Current Account:', currentAccount);
    console.log('Current Chain ID:', currentChainId);
    console.log('Selected Token:', selectedToken);
    console.log('Bridge Mode:', bridgeMode);
    
    if (bridgeMode === 'mint-burn') {
        console.log('Mint/Burn Addresses:', CONTRACT_ADDRESSES[currentChainId]);
    } else {
        console.log('Lock/Release Addresses:', LOCK_RELEASE_CONFIG[currentChainId]);
    }
}

// Add debug button functionality
function addDebugInfo() {
    console.log('=== BRIDGE SYSTEM DEBUG ===');
    debugBridgeSystem();
    
    if (selectedToken && currentAccount && currentChainId) {
        updateBalance().then(() => {
            console.log('Balance updated');
        }).catch(err => {
            console.error('Balance update failed:', err);
        });
    }
}

// Expose debug function globally
window.debugBridge = addDebugInfo;