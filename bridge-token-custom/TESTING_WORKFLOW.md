# 🌉 Complete Bridge System Testing Workflow

Based on test results, here's your current system status and how to test both mechanisms:

## 📊 **CURRENT SYSTEM STATUS**

### ✅ **Lock/Release System - READY FOR TESTING**
- **User Balance**: 900,000 AXS tokens ✅
- **LP Liquidity**: 100,000 AXS tokens ✅  
- **Factory Address**: 0xE8CcfF76c6215af5A75Bd391b5bA3d4A8cacEf0D ✅
- **LP Address**: 0x74C343f4f72e77FA6110A10693F2c0F6dBe71a66 ✅

### ❌ **Mint/Burn System - NEEDS TOKENS**
- **Sepolia**: 0 AXS/SLP tokens ❌
- **Base Sepolia**: Contract errors ❌

---

## 🚀 **TESTING WORKFLOW**

### **OPTION 1: Test Lock/Release (Recommended - Ready Now)**

#### **Step 1: Setup Relayer for Lock/Release**
```bash
# Update .env file
echo "BRIDGE_MECHANISM=lock-release" >> .env
echo "SEPOLIA_BRIDGE_FACTORY=0xE8CcfF76c6215af5A75Bd391b5bA3d4A8cacEf0D" >> .env

# Start relayer
cd relayer && npm start
```

#### **Step 2: Frontend Testing Process**
1. **Open**: `frontend/index.html` in browser
2. **Connect**: MetaMask to Sepolia network
3. **Select**: "Lock/Release" mode
4. **Choose**: AXS token (should show 900,000 balance)
5. **Bridge**: 10,000 AXS from Sepolia → Base Sepolia
6. **Watch**: Relayer auto-mint tokens on Base Sepolia

#### **Step 3: Expected Results**
```
Frontend:
- Balance shows: 900,000 AXS ✅
- After bridge: 890,000 AXS (minus fees)

Relayer Logs:
🔒 Bridge Requested on Sepolia
🚀 Minting 9,950 AXS on Base Sepolia
✅ Tokens minted successfully!

Base Sepolia:
- User receives: ~9,950 AXS tokens
```

---

### **OPTION 2: Fix Mint/Burn for Full Testing**

#### **Transfer Tokens for Mint/Burn Testing**
```bash
# Get tokens from deployed contracts
npx hardhat console --network sepolia

# In console - transfer tokens to your wallet:
const axs = await ethers.getContractAt("MultiToken", "0x5bEf3Ad7946C68716Bd80A30a5D3e861E43d5dda");
await axs.transfer("0x286db307079C9C92b55D20b33e4eAB6d2A588E54", ethers.parseEther("100000"));

const slp = await ethers.getContractAt("MultiToken", "0xA978400455556e3a553A001671A8b69951882c0F");
await slp.transfer("0x286db307079C9C92b55D20b33e4eAB6d2A588E54", ethers.parseEther("100000"));
```

#### **Switch Relayer to Mint/Burn**
```bash
# Update .env
echo "BRIDGE_MECHANISM=mint-burn" >> .env

# Restart relayer
cd relayer && npm restart
```

---

## 🔍 **DEBUGGING BALANCE ISSUES**

### **Why Balance Shows "0 tokens":**
- **Normal**: User doesn't have these tokens yet
- **Expected**: Lock/Release tokens are different from Mint/Burn tokens

### **Balance Debug Commands:**
```javascript
// In browser console:
debugBridge()  // Shows complete system state

// Check specific token:
selectedToken = "AXS"
bridgeMode = "lock-release"  // or "mint-burn"
updateBalance()
```

---

## 📋 **COMPLETE TEST CHECKLIST**

### **Lock/Release Testing** ✅ Ready
- [ ] Connect to Sepolia
- [ ] Select Lock/Release mode  
- [ ] Choose AXS token
- [ ] Verify 900K balance shows
- [ ] Bridge 10K tokens
- [ ] Check relayer logs
- [ ] Verify mint on Base Sepolia

### **Mint/Burn Testing** ⏳ Need tokens first
- [ ] Transfer tokens to wallet
- [ ] Connect to Sepolia
- [ ] Select Mint/Burn mode
- [ ] Bridge tokens both ways
- [ ] Test bidirectional functionality

---

## 🎯 **QUICK START - Test Lock/Release Now**

```bash
# 1. Start relayer with Lock/Release
cd /home/hpgbao2204/Downloads/bridge-web
echo "BRIDGE_MECHANISM=lock-release" >> .env
echo "SEPOLIA_BRIDGE_FACTORY=0xE8CcfF76c6215af5A75Bd391b5bA3d4A8cacEf0D" >> .env
cd relayer && npm start

# 2. Open frontend in another terminal
cd /home/hpgbao2204/Downloads/bridge-web
python3 -m http.server 8080 &
# Open http://localhost:8080/frontend/index.html

# 3. Test workflow:
# - Connect MetaMask to Sepolia
# - Select "Lock/Release" mode
# - Choose AXS token (should show 900,000 balance)
# - Bridge some tokens and watch the magic happen! 🚀
```

---

## 🔧 **TROUBLESHOOTING**

### **Balance shows "0"**
- ✅ Normal for Mint/Burn tokens (need to transfer first)
- ✅ Should show 900K for Lock/Release AXS

### **Balance shows "Error"**
- Check network (Sepolia for Lock/Release)
- Check token selection and bridge mode match

### **Bridge fails**
- Verify sufficient balance
- Check approval transaction completed
- Ensure relayer is running

### **Relayer not processing**
- Check BRIDGE_MECHANISM in .env
- Verify SEPOLIA_BRIDGE_FACTORY address
- Check relayer logs for errors

---

Your Lock/Release system is fully ready for testing! The workflow above will let you experience the complete bridge functionality immediately. 🎉