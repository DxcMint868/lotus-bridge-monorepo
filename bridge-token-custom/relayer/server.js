// server/server.js
const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
require("dotenv").config({
	path: require("path").resolve(__dirname, "../.env"),
});

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

// Bridge Mechanism Configuration
const BRIDGE_MECHANISM = process.env.BRIDGE_MECHANISM || "mint-burn"; // 'mint-burn' or 'lock-release'

// Bridge Token Configuration
const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN || "VNST"; // The token used for bridging

// Multi-Token Bridge Configuration (Mint/Burn)
const MINT_BURN_NETWORKS = {
	11155111: {
		// Sepolia
		name: "Sepolia",
		rpc:
			process.env.SEPOLIA_RPC_URL ||
			"https://sepolia.infura.io/v3/f80b521be02b402cb68f29b0f4c91311",
		bridge:
			process.env.SEPOLIA_MULTI_BRIDGE ||
			"0x88A6B192D1349a686E088f428cF7E0037Ea775b0",
		privateKey: process.env.SEPOLIA_PRIVATE_KEY || process.env.PRIVATE_KEY,
	},
	84532: {
		// Base Sepolia
		name: "Base Sepolia",
		rpc: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
		bridge:
			process.env.BASE_SEPOLIA_MULTI_BRIDGE ||
			"0xad1eE286bd3e9682Dc0E21b91A00E575404505a2",
		privateKey:
			process.env.BASE_SEPOLIA_PRIVATE_KEY || process.env.PRIVATE_KEY,
	},
};

// Lock/Release Bridge Configuration
const LOCK_RELEASE_NETWORKS = {
	11155111: {
		// Sepolia (Source Chain)
		name: "Sepolia",
		rpc:
			process.env.SEPOLIA_RPC_URL ||
			"https://sepolia.infura.io/v3/f80b521be02b402cb68f29b0f4c91311",
		bridgeFactory:
			process.env.SEPOLIA_BRIDGE_FACTORY ||
			"0xE8CcfF76c6215af5A75Bd391b5bA3d4A8cacEf0D",
		swapBridge:
			process.env.SEPOLIA_SWAP_BRIDGE ||
			"0x9565f1964ec62A0d7af8a527AcfBAAC159162C9C",
		simpleSwapBridge:
			process.env.SEPOLIA_SIMPLE_SWAP_BRIDGE ||
			"0xf5Fcb378C522d372BD050b4e3D0d65F7Fe72F081",
		privateKey: process.env.SEPOLIA_PRIVATE_KEY || process.env.PRIVATE_KEY,
		role: "source", // Locks tokens
	},
	84532: {
		// Base Sepolia (Destination Chain)
		name: "Base Sepolia",
		rpc: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
		bridgeFactory:
			process.env.BASE_SEPOLIA_BRIDGE_FACTORY ||
			"0xe77aCC776B9a8ff6b2A313330C7b5Ad10abEBB06",
		swapBridge:
			process.env.BASE_SEPOLIA_SWAP_BRIDGE ||
			"0x396aa87BD4afBe1Bc4eebd5F420c45EABD110C0E",
		simpleSwapBridge:
			process.env.BASE_SEPOLIA_SIMPLE_SWAP_BRIDGE ||
			"0xBD1f0aFf88a336765d5C9AA0363Ebd848B668dd6",
		bridge:
			process.env.BASE_SEPOLIA_MULTI_BRIDGE ||
			"0xccB3ABE63fb897142E7c5FB2d090d0983E5Fad89", // Fallback for minting
		privateKey:
			process.env.BASE_SEPOLIA_PRIVATE_KEY || process.env.PRIVATE_KEY,
		role: "destination", // Releases tokens from pool
	},
};

// ABIs for different mechanisms
const BRIDGE_ABI = [
	"function releaseTokens(string tokenSymbol, address recipient, uint256 amount, uint256 sourceChain, bytes32 transactionId)",
	"function processedTransactions(bytes32) view returns (bool)",
	"function owner() view returns (address)",
	"function supportedTokens(string tokenSymbol) view returns (bool)",
	"function getTokenAddress(string tokenSymbol) view returns (address)",
	"event TokensLocked(address indexed sender, address indexed recipient, string tokenSymbol, uint256 amount, uint256 fee, uint256 targetChain, bytes32 indexed transactionId)",
	"event TokensBurned(address indexed sender, address indexed recipient, string tokenSymbol, uint256 amount, uint256 fee, uint256 targetChain, bytes32 indexed transactionId)",
];

const FACTORY_ABI = [
	"function reqBridge(address token, uint256 amount, uint256 targetChain, address recipient)",
	"function getLPAddress(address token) view returns (address)",
	"function isTokenSupported(address token) view returns (bool)",
	"event BridgeRequested(address indexed user, address indexed token, address indexed lpAddress, uint256 amount, uint256 fee, uint256 targetChain, bytes32 transactionId)",
];

const LP_ABI = [
	"function release(address recipient, uint256 amount, bytes32 transactionId, uint256 sourceChain)",
	"function setRelayer(address newRelayer)",
	"function isProcessed(bytes32 transactionId) view returns (bool)",
	"event TokensLocked(address indexed sender, address indexed recipient, uint256 amount, uint256 fee, uint256 targetChain, bytes32 indexed transactionId)",
];

// SwapBridge ABI for swap + bridge operations
const SWAP_BRIDGE_ABI = [
	"function swapAndBridge(address tokenIn, address tokenOut, uint256 amountIn, uint256 targetChain, address recipient, uint256 minAmountOut)",
	"function completeSwapOnDestination(address tokenOut, uint256 vnstAmount, address recipient, uint256 minAmountOut, bytes32 transactionId)",
	"function getSwapBridgeQuote(address tokenIn, address tokenOut, uint256 amountIn, uint256 targetChain) view returns (uint256, uint256, uint256, uint256)",
	"event SwapBridgeRequested(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 targetChain, address recipient, bytes32 transactionId)",
	"event SwapCompleted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, bytes32 transactionId)",
];

// SimpleSwapBridge ABI for simplified mock demo
const SIMPLE_SWAP_BRIDGE_ABI = [
	"function swapAndBridge(address tokenIn, address tokenOut, uint256 amountIn, uint256 targetChain, address recipient, uint256 minAmountOut)",
	"function getSwapBridgeQuote(address tokenIn, address tokenOut, uint256 amountIn, uint256 targetChain) view returns (uint256, uint256, uint256, bool)",
	"function addSupportedToken(address token, string symbol)",
	"function setMockExchangeRate(string fromToken, string toToken, uint256 rate)",
	"function getMockExchangeRate(string fromToken, string toToken) view returns (uint256)",
	"function releaseTokens(address token, address recipient, uint256 amount, bytes32 transactionId)",
	"event SwapBridgeRequested(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 targetChain, address recipient, uint256 minAmountOut, bytes32 transactionId)",
	"event TokensLocked(address indexed user, address indexed token, uint256 amount, bytes32 indexed transactionId)",
];

// Uniswap V3 SwapRouter ABI for swap operations
const SWAP_ROUTER_ABI = [
	"function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)",
];

// ERC20 ABI for token operations
const ERC20_ABI = [
	"function approve(address spender, uint256 amount) returns (bool)",
	"function balanceOf(address account) view returns (uint256)",
	"function transfer(address to, uint256 amount) returns (bool)",
];

// Quoter V2 ABI for getting quotes
const QUOTER_V2_ABI = [
	"function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) view returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
];

// Uniswap V3 contract addresses
const UNISWAP_CONTRACTS = {
	11155111: {
		// Sepolia
		swapRouter: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
		quoterV2: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
	},
	84532: {
		// Base Sepolia
		swapRouter: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
		quoterV2: "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997",
	},
};

const providers = {},
	signers = {},
	walletInfo = {},
	processedTxs = new Set();
const KNOWN_TOKENS = [
	"AXS",
	"SLP",
	"VNST",
	"VNDC",
	"A8",
	"SIPHER",
	"C98",
	"KNC",
	"KAI",
];

// Decode events based on bridge mechanism
function decodeEvent(event, mechanism) {
	const [senderTopic, recipientTopic, txIdTopic] = event.topics.slice(1);
	const sender = ethers.getAddress("0x" + senderTopic.slice(-40));
	const recipient = ethers.getAddress("0x" + recipientTopic.slice(-40));
	const transactionId = txIdTopic;

	if (mechanism === "mint-burn") {
		// Mint/Burn event structure
		const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
			["string", "uint256", "uint256", "uint256"],
			event.data
		);
		const [tokenSymbol, amount, fee, targetChain] = decoded;
		return {
			sender,
			recipient,
			tokenSymbol,
			amount,
			fee,
			targetChain,
			transactionId,
		};
	} else {
		// Lock/Release event structure (from Factory or LP)
		const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
			["uint256", "uint256", "uint256"],
			event.data
		);
		const [amount, fee, targetChain] = decoded;
		return { sender, recipient, amount, fee, targetChain, transactionId };
	}
}

async function initializeNetworks() {
	console.log(`🔧 Initializing ${BRIDGE_MECHANISM} bridge networks...`);

	const networks =
		BRIDGE_MECHANISM === "mint-burn"
			? MINT_BURN_NETWORKS
			: LOCK_RELEASE_NETWORKS;

	for (const [chainId, cfg] of Object.entries(networks)) {
		try {
			providers[chainId] = new ethers.JsonRpcProvider(cfg.rpc);

			if (cfg.privateKey) {
				const signer = new ethers.Wallet(
					cfg.privateKey,
					providers[chainId]
				);

				// Different setup based on mechanism
				if (BRIDGE_MECHANISM === "mint-burn") {
					const bridge = new ethers.Contract(
						cfg.bridge,
						BRIDGE_ABI,
						providers[chainId]
					);
					const owner = await bridge.owner();
					const isOwner =
						owner.toLowerCase() === signer.address.toLowerCase();

					signers[chainId] = signer;
					walletInfo[chainId] = {
						address: signer.address,
						balance: ethers.formatEther(
							await providers[chainId].getBalance(signer.address)
						),
						isOwner,
						mechanism: "mint-burn",
					};
					console.log(
						`✅ ${cfg.name}: ${signer.address} ${
							isOwner ? "👑" : "❌"
						} (Mint/Burn)`
					);
				} else {
					// Lock/Release setup
					if (cfg.role === "source") {
						// Source chain: Setup factory
						const factory = new ethers.Contract(
							cfg.bridgeFactory,
							FACTORY_ABI,
							providers[chainId]
						);
						signers[chainId] = signer;
						walletInfo[chainId] = {
							address: signer.address,
							balance: ethers.formatEther(
								await providers[chainId].getBalance(
									signer.address
								)
							),
							role: "source",
							mechanism: "lock-release",
						};
						console.log(
							`✅ ${cfg.name}: ${signer.address} (Lock/Release Source)`
						);
					} else {
						// Destination chain: Use existing MultiBridge for minting
						const bridge = new ethers.Contract(
							cfg.bridge,
							BRIDGE_ABI,
							providers[chainId]
						);
						const owner = await bridge.owner();
						const isOwner =
							owner.toLowerCase() ===
							signer.address.toLowerCase();

						signers[chainId] = signer;
						walletInfo[chainId] = {
							address: signer.address,
							balance: ethers.formatEther(
								await providers[chainId].getBalance(
									signer.address
								)
							),
							isOwner,
							role: "destination",
							mechanism: "lock-release",
						};
						console.log(
							`✅ ${cfg.name}: ${signer.address} ${
								isOwner ? "👑" : "❌"
							} (Lock/Release Destination)`
						);
					}
				}
			} else {
				console.log(`⚠️ ${cfg.name}: No private key`);
			}
		} catch (err) {
			console.error(`❌ ${cfg.name}:`, err.message);
		}
	}
}

function monitorBridgeEvents() {
	console.log(`🔍 Starting ${BRIDGE_MECHANISM} event monitor...`);

	const networks =
		BRIDGE_MECHANISM === "mint-burn"
			? MINT_BURN_NETWORKS
			: LOCK_RELEASE_NETWORKS;

	for (const chainId of Object.keys(networks)) {
		const cfg = networks[chainId];
		const provider = providers[chainId];

		async function startPolling() {
			let lastBlock = (await provider.getBlockNumber()) - 10;
			console.log(`🔄 Monitoring ${cfg.name} from block ${lastBlock}`);

			const poll = async () => {
				try {
					const currentBlock = await provider.getBlockNumber();
					if (currentBlock > lastBlock) {
						if (BRIDGE_MECHANISM === "mint-burn") {
							// Monitor MultiBridge events
							const bridge = new ethers.Contract(
								cfg.bridge,
								BRIDGE_ABI,
								provider
							);
							const [lockedEvents, burnedEvents] =
								await Promise.all([
									bridge.queryFilter(
										bridge.filters.TokensLocked(),
										lastBlock + 1,
										currentBlock
									),
									bridge.queryFilter(
										bridge.filters.TokensBurned(),
										lastBlock + 1,
										currentBlock
									),
								]);

							[...lockedEvents, ...burnedEvents].forEach(
								async (event) => {
									try {
										const parsed = decodeEvent(
											event,
											"mint-burn"
										);
										console.log(
											`\n🔒 ${event.eventName} on ${cfg.name}:`,
											{
												token: parsed.tokenSymbol,
												amount: ethers.formatEther(
													parsed.amount
												),
												to: parsed.recipient,
											}
										);
										await processEvent(parsed, "mint-burn");
									} catch (err) {
										console.error(
											"❌ Event processing error:",
											err.message
										);
									}
								}
							);
						} else {
							// Monitor Lock/Release events
							if (cfg.role === "source") {
								// Monitor BridgeFactory events
								const factory = new ethers.Contract(
									cfg.bridgeFactory,
									FACTORY_ABI,
									provider
								);
								const bridgeEvents = await factory.queryFilter(
									factory.filters.BridgeRequested(),
									lastBlock + 1,
									currentBlock
								);

								bridgeEvents.forEach(async (event) => {
									try {
										// ✅ FIXED: Correct BridgeRequested event parsing
										console.log("🔍 Raw event data:", {
											topics: event.topics,
											data: event.data,
										});

										// BridgeRequested(address indexed user, address indexed token, address indexed lpAddress, uint256 amount, uint256 fee, uint256 targetChain, bytes32 transactionId)
										const [userTopic, tokenTopic, lpTopic] =
											event.topics.slice(1);
										const user = ethers.getAddress(
											"0x" + userTopic.slice(-40)
										);
										const token = ethers.getAddress(
											"0x" + tokenTopic.slice(-40)
										);
										const lpAddress = ethers.getAddress(
											"0x" + lpTopic.slice(-40)
										);

										// Decode data part (4 non-indexed fields)
										const decoded =
											ethers.AbiCoder.defaultAbiCoder().decode(
												[
													"uint256",
													"uint256",
													"uint256",
													"bytes32",
												],
												event.data
											);
										const [
											amount,
											fee,
											targetChain,
											transactionId,
										] = decoded;

										console.log(
											`\n🔒 Bridge Requested on ${cfg.name}:`,
											{
												user,
												token,
												lpAddress,
												amount: ethers.formatEther(
													amount
												),
												fee: ethers.formatEther(fee),
												targetChain:
													targetChain.toString(),
												transactionId,
											}
										);

										await processLockReleaseEvent({
											user,
											token,
											lpAddress,
											amount,
											fee,
											targetChain,
											transactionId,
										});
									} catch (err) {
										console.error(
											"❌ Lock/Release event processing error:",
											err.message
										);
										console.error("❌ Event details:", {
											blockNumber: event.blockNumber,
											transactionHash:
												event.transactionHash,
											topics: event.topics,
											data: event.data,
										});
									}
								});

								// Monitor SwapBridge events
								if (cfg.swapBridge) {
									const swapBridge = new ethers.Contract(
										cfg.swapBridge,
										SWAP_BRIDGE_ABI,
										provider
									);
									const swapBridgeEvents =
										await swapBridge.queryFilter(
											swapBridge.filters.SwapBridgeRequested(),
											lastBlock + 1,
											currentBlock
										);

									swapBridgeEvents.forEach(async (event) => {
										try {
											console.log(
												"🔄 SwapBridge event data:",
												{
													topics: event.topics,
													data: event.data,
												}
											);

											// SwapBridgeRequested(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 targetChain, address recipient, bytes32 transactionId)
											const [
												userTopic,
												tokenInTopic,
												tokenOutTopic,
											] = event.topics.slice(1);
											const user = ethers.getAddress(
												"0x" + userTopic.slice(-40)
											);
											const tokenIn = ethers.getAddress(
												"0x" + tokenInTopic.slice(-40)
											);
											const tokenOut = ethers.getAddress(
												"0x" + tokenOutTopic.slice(-40)
											);

											// Decode data part (4 non-indexed fields)
											const decoded =
												ethers.AbiCoder.defaultAbiCoder().decode(
													[
														"uint256",
														"uint256",
														"address",
														"bytes32",
													],
													event.data
												);
											const [
												amountIn,
												targetChain,
												recipient,
												transactionId,
											] = decoded;

											console.log(
												`\n🔄 Swap + Bridge Requested on ${cfg.name}:`,
												{
													user,
													tokenIn,
													tokenOut,
													amountIn:
														ethers.formatEther(
															amountIn
														),
													targetChain:
														targetChain.toString(),
													recipient,
													transactionId,
												}
											);

											await processSwapBridgeEvent({
												user,
												tokenIn,
												tokenOut,
												amountIn,
												targetChain,
												recipient,
												transactionId,
											});
										} catch (err) {
											console.error(
												"❌ SwapBridge event processing error:",
												err.message
											);
											console.error("❌ Event details:", {
												blockNumber: event.blockNumber,
												transactionHash:
													event.transactionHash,
												topics: event.topics,
												data: event.data,
											});
										}
									});
								}

								// ✅ Monitor SimpleSwapBridge events for mock demo
								if (
									cfg.simpleSwapBridge &&
									cfg.simpleSwapBridge !== "TO_BE_DEPLOYED"
								) {
									const simpleSwapBridge =
										new ethers.Contract(
											cfg.simpleSwapBridge,
											SIMPLE_SWAP_BRIDGE_ABI,
											provider
										);
									const simpleSwapBridgeEvents =
										await simpleSwapBridge.queryFilter(
											simpleSwapBridge.filters.SwapBridgeRequested(),
											lastBlock + 1,
											currentBlock
										);

									simpleSwapBridgeEvents.forEach(
										async (event) => {
											try {
												console.log(
													"🔄 SimpleSwapBridge event data:",
													{
														topics: event.topics,
														data: event.data,
													}
												);

												// SwapBridgeRequested(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 targetChain, address recipient, uint256 minAmountOut, bytes32 transactionId)
												const [
													userTopic,
													tokenInTopic,
													tokenOutTopic,
												] = event.topics.slice(1);
												const user = ethers.getAddress(
													"0x" + userTopic.slice(-40)
												);
												const tokenIn =
													ethers.getAddress(
														"0x" +
															tokenInTopic.slice(
																-40
															)
													);
												const tokenOut =
													ethers.getAddress(
														"0x" +
															tokenOutTopic.slice(
																-40
															)
													);

												// Decode data part (5 non-indexed fields)
												const decoded =
													ethers.AbiCoder.defaultAbiCoder().decode(
														[
															"uint256", // amountIn
															"uint256", // targetChain
															"address", // recipient
															"uint256", // minAmountOut
															"bytes32", // transactionId
														],
														event.data
													);
												const [
													amountIn,
													targetChain,
													recipient,
													minAmountOut,
													transactionId,
												] = decoded;

												console.log(
													`\n🔄 Simple Swap + Bridge Requested on ${cfg.name}:`,
													{
														user,
														tokenIn,
														tokenOut,
														amountIn:
															ethers.formatEther(
																amountIn
															),
														targetChain:
															targetChain.toString(),
														recipient,
														minAmountOut:
															ethers.formatEther(
																minAmountOut
															),
														transactionId,
													}
												);

												await processSimpleSwapBridgeEvent(
													{
														user,
														tokenIn,
														tokenOut,
														amountIn,
														targetChain,
														recipient,
														minAmountOut,
														transactionId,
													}
												);
											} catch (err) {
												console.error(
													"❌ SimpleSwapBridge event processing error:",
													err.message
												);
												console.error(
													"❌ Event details:",
													{
														blockNumber:
															event.blockNumber,
														transactionHash:
															event.transactionHash,
														topics: event.topics,
														data: event.data,
													}
												);
											}
										}
									);
								}
							}
						}

						lastBlock = currentBlock;
					}
				} catch (error) {
					console.error(
						`❌ Polling error ${cfg.name}:`,
						error.message
					);
				}
				setTimeout(poll, 15000);
			};
			poll();
		}
		startPolling();
	}
}

// Process Mint/Burn events (existing logic)
async function processEvent(eventData, mechanism) {
	if (mechanism === "mint-burn") {
		await autoReleaseTokens(eventData);
	}
}

// Process Lock/Release events with mock token conversion
async function processLockReleaseEvent({
	user,
	token,
	lpAddress,
	amount,
	fee,
	targetChain,
	transactionId,
}) {
	const txKey = `lock-release-${transactionId}`;
	if (processedTxs.has(txKey)) return;

	// Get source token symbol
	const sourceTokenSymbol = await getTokenSymbolFromAddress(token, 11155111);
	if (!sourceTokenSymbol) {
		console.error(`❌ Unknown source token address: ${token}`);
		return;
	}

	console.log(
		`🔒 Processing lock event: ${ethers.formatEther(
			amount
		)} ${sourceTokenSymbol}`
	);

	const destinationNetwork = LOCK_RELEASE_NETWORKS[targetChain];
	const destinationSigner = signers[targetChain];

	if (!destinationNetwork || !destinationSigner) {
		console.error(
			`❌ Cannot process on ${destinationNetwork?.name || targetChain}`
		);
		return;
	}

	try {
		// For demo: Use the SAME token symbol for destination (simple bridge)
		// Later we can implement cross-token conversion
		const destinationTokenSymbol = sourceTokenSymbol;

		// Convert amount using exchange rates from contract
		const convertedAmount = await convertTokenAmount(
			amount,
			sourceTokenSymbol,
			destinationTokenSymbol,
			11155111 // source chain ID
		);

		console.log(
			`💱 Mock conversion: ${ethers.formatEther(
				amount
			)} ${sourceTokenSymbol} -> ${ethers.formatEther(
				convertedAmount
			)} ${destinationTokenSymbol}`
		);

		// Find destination token address
		const destinationTokenAddress = await findTokenBySymbol(
			destinationTokenSymbol,
			targetChain
		);
		if (!destinationTokenAddress) {
			console.error(
				`❌ Token ${destinationTokenSymbol} not found on ${destinationNetwork.name}`
			);
			return;
		}

		// Use True Lock/Release on destination chain
		if (destinationNetwork.bridgeFactory) {
			const factoryContract = new ethers.Contract(
				destinationNetwork.bridgeFactory,
				FACTORY_ABI,
				destinationSigner
			);

			// Get destination LP address for the destination token
			const destinationLPAddress = await factoryContract.getLPAddress(
				destinationTokenAddress
			);
			if (destinationLPAddress === ethers.ZeroAddress) {
				console.error(
					`❌ No LP found for token ${destinationTokenSymbol} on ${destinationNetwork.name}`
				);
				return;
			}

			// Release converted amount from destination LP
			const lpContract = new ethers.Contract(
				destinationLPAddress,
				LP_ABI,
				destinationSigner
			);

			console.log(
				`🚀 Releasing ${ethers.formatEther(
					convertedAmount
				)} ${destinationTokenSymbol} from LP on ${
					destinationNetwork.name
				}`
			);
			console.log(
				`   Source: ${ethers.formatEther(amount)} ${sourceTokenSymbol}`
			);
			console.log(
				`   Destination: ${ethers.formatEther(
					convertedAmount
				)} ${destinationTokenSymbol}`
			);
			console.log(`   LP Address: ${destinationLPAddress}`);

			const tx = await lpContract.release(
				user,
				convertedAmount, // Use converted amount
				transactionId,
				11155111
			);
			console.log(`📝 TX: ${tx.hash}`);

			await tx.wait();
			console.log(`✅ Mock bridge-swap completed successfully!`);
			processedTxs.add(txKey);
		} else {
			// Fallback: Use existing MultiBridge for minting (backward compatibility)
			const bridgeContract = new ethers.Contract(
				destinationNetwork.bridge,
				BRIDGE_ABI,
				destinationSigner
			);

			console.log(
				`🚀 Minting ${ethers.formatEther(
					convertedAmount
				)} ${destinationTokenSymbol} on ${
					destinationNetwork.name
				} (fallback)`
			);

			const tx = await bridgeContract.releaseTokens(
				destinationTokenSymbol,
				user,
				convertedAmount, // Use converted amount
				11155111,
				transactionId
			);
			console.log(`📝 TX: ${tx.hash}`);

			await tx.wait();
			console.log(
				`✅ Mock bridge-swap completed successfully! (fallback)`
			);
			processedTxs.add(txKey);
		}
	} catch (error) {
		console.error(`❌ Mock bridge-swap failed:`, error.message);
	}
}

// ✅ FIXED: Token address mappings between chains for Lock/Release
async function findTokenBySymbol(tokenSymbol, chainId) {
	const TOKEN_MAPPINGS = {
		11155111: {
			// Sepolia
			AXS: "0x4faBa27A73DD517db50945c2F02621eba3959B1E",
			SLP: "0x17194dA767007572FCb0fAdB48f9BD3DAd314c19",
			VNST: "0xBF00AB3f7C2c15eCA16a2f58d682B92BcBe78e4B",
			VNDC: "0x322D132a837468342Cba668e473497D6B61A6854",
			A8: "0xFd3ACA875894a448c39EE9bBdc5Ea7102De4CFF4",
			SIPHER: "0x3432269A1Effc63390cbe6889c2B5BE23b73eD76",
			C98: "0x10263EB9Bd57266feC38548cCd02D9d656eB83De",
			KNC: "0x8bAef75f951E789136046e7CBd5eB164D35169D6",
			KAI: "0xa15faD49027100a8957463Ac1E29Be724670419f",
		},
		84532: {
			// Base Sepolia
			AXS: "0xA0636375D1a93eB4998aE9a586ACE3CC664461ce",
			SLP: "0x227F7903FF9DA3034B73E4D3a13d2bb91706D095",
			VNST: "0x2d11eE653b8Dae37fBcF7544c0d9576ab6811C36",
			VNDC: "0x4322BCC65D98B0896ebe0Dd2Aff0c570890c22c6",
			A8: "0xD00DcAd45ac6dE6557029771a831df82F6FB1506",
			SIPHER: "0x1C94923e5Dc2c859f0e74BC551E3BF9B56de256c",
			C98: "0xCF8f373E37eAcFb7F7a04F1EC465386c012cA9bD",
			KNC: "0xa445BbDF9916bB80eEDFCAE1A698191ef082F3C7",
			KAI: "0x611E5CFB66505354C793a48e5CDc4dbD89634EC2",
		},
	};

	console.log(`🔍 Finding token ${tokenSymbol} on chain ${chainId}`);
	const tokenAddress = TOKEN_MAPPINGS[chainId]?.[tokenSymbol];
	console.log(`   Found address: ${tokenAddress}`);
	return tokenAddress || null;
}

// Helper function to get token symbol from address
async function getTokenSymbolFromAddress(tokenAddress, chainId) {
	// Token address mappings for both chains
	const TOKEN_ADDRESS_MAPPINGS = {
		11155111: {
			// Sepolia
			"0x4faBa27A73DD517db50945c2F02621eba3959B1E": "AXS",
			"0x17194dA767007572FCb0fAdB48f9BD3DAd314c19": "SLP",
			"0xBF00AB3f7C2c15eCA16a2f58d682B92BcBe78e4B": "VNST",
			"0x322D132a837468342Cba668e473497D6B61A6854": "VNDC",
			"0xFd3ACA875894a448c39EE9bBdc5Ea7102De4CFF4": "A8",
			"0x3432269A1Effc63390cbe6889c2B5BE23b73eD76": "SIPHER",
			"0x10263EB9Bd57266feC38548cCd02D9d656eB83De": "C98",
			"0x8bAef75f951E789136046e7CBd5eB164D35169D6": "KNC",
			"0xa15faD49027100a8957463Ac1E29Be724670419f": "KAI",
		},
		84532: {
			// Base Sepolia
			"0xA0636375D1a93eB4998aE9a586ACE3CC664461ce": "AXS",
			"0x227F7903FF9DA3034B73E4D3a13d2bb91706D095": "SLP",
			"0x2d11eE653b8Dae37fBcF7544c0d9576ab6811C36": "VNST",
			"0x4322BCC65D98B0896ebe0Dd2Aff0c570890c22c6": "VNDC",
			"0xD00DcAd45ac6dE6557029771a831df82F6FB1506": "A8",
			"0x1C94923e5Dc2c859f0e74BC551E3BF9B56de256c": "SIPHER",
			"0xCF8f373E37eAcFb7F7a04F1EC465386c012cA9bD": "C98",
			"0xa445BbDF9916bB80eEDFCAE1A698191ef082F3C7": "KNC",
			"0x611E5CFB66505354C793a48e5CDc4dbD89634EC2": "KAI",
		},
	};

	console.log(
		`🔍 Looking up token symbol for ${tokenAddress} on chain ${chainId}`
	);
	const symbol = TOKEN_ADDRESS_MAPPINGS[chainId]?.[tokenAddress];
	console.log(`   Found symbol: ${symbol}`);
	return symbol || null;
}

// Existing autoReleaseTokens function for Mint/Burn
async function autoReleaseTokens({
	recipient,
	amount,
	tokenSymbol,
	targetChain,
	transactionId,
}) {
	const txKey = `mint-burn-${tokenSymbol}-${transactionId}`;
	if (processedTxs.has(txKey)) return;

	const targetNetwork = MINT_BURN_NETWORKS[targetChain];
	const targetSigner = signers[targetChain];

	if (!targetNetwork || !targetSigner || !walletInfo[targetChain]?.isOwner) {
		console.error(
			`❌ Cannot release on ${targetNetwork?.name || targetChain}`
		);
		return;
	}

	try {
		const bridgeContract = new ethers.Contract(
			targetNetwork.bridge,
			BRIDGE_ABI,
			targetSigner
		);
		const amountWei =
			typeof amount === "string" ? ethers.parseEther(amount) : amount;

		console.log(
			`🚀 Releasing ${ethers.formatEther(amountWei)} ${tokenSymbol} on ${
				targetNetwork.name
			}`
		);

		const tx = await bridgeContract.releaseTokens(
			tokenSymbol,
			recipient,
			amountWei,
			11155111,
			transactionId
		);
		console.log(`📝 TX: ${tx.hash}`);

		await tx.wait();
		console.log(`✅ Released successfully!`);
		processedTxs.add(txKey);
	} catch (error) {
		console.error(`❌ Release failed:`, error.message);
	}
}

// Swap operation handler
async function performSwap(
	chainId,
	tokenIn,
	tokenOut,
	amountIn,
	recipient,
	signer
) {
	const uniswapContracts = UNISWAP_CONTRACTS[chainId];
	if (!uniswapContracts) {
		throw new Error(`Uniswap not supported on chain ${chainId}`);
	}

	console.log(`🔄 Starting swap on chain ${chainId}:`, {
		tokenIn,
		tokenOut,
		amountIn: ethers.formatEther(amountIn),
		recipient,
	});

	try {
		// Get quote first
		const quoterContract = new ethers.Contract(
			uniswapContracts.quoterV2,
			QUOTER_V2_ABI,
			providers[chainId]
		);
		const quoteResult = await quoterContract.quoteExactInputSingle(
			tokenIn,
			tokenOut,
			3000, // 0.3% fee
			amountIn,
			0 // No price limit
		);
		const amountOut = quoteResult[0];
		const minAmountOut = (amountOut * 95n) / 100n; // 5% slippage

		console.log(
			`💰 Swap quote: ${ethers.formatEther(
				amountOut
			)} (min: ${ethers.formatEther(minAmountOut)})`
		);

		// Approve tokens for SwapRouter
		const tokenContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
		const approveTx = await tokenContract.approve(
			uniswapContracts.swapRouter,
			amountIn
		);
		await approveTx.wait();
		console.log(`✅ Tokens approved for swap`);

		// Perform swap
		const swapRouter = new ethers.Contract(
			uniswapContracts.swapRouter,
			SWAP_ROUTER_ABI,
			signer
		);
		const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

		const swapParams = {
			tokenIn,
			tokenOut,
			fee: 3000,
			recipient,
			deadline,
			amountIn,
			amountOutMinimum: minAmountOut,
			sqrtPriceLimitX96: 0,
		};

		const swapTx = await swapRouter.exactInputSingle(swapParams);
		const receipt = await swapTx.wait();

		console.log(`✅ Swap completed: ${swapTx.hash}`);
		return { success: true, txHash: swapTx.hash, amountOut };
	} catch (error) {
		console.error(`❌ Swap failed:`, error.message);
		throw error;
	}
}

// Mock exchange rates for token pairs (hardcoded)
const MOCK_EXCHANGE_RATES = {
	// VNST/VNDC pair (1:1 ratio)
	"VNST->VNDC": 1.0,
	"VNDC->VNST": 1.0,

	// Add more pairs as needed
	"VNST->AXS": 0.1, // 1 VNST = 0.1 AXS
	"AXS->VNST": 10.0, // 1 AXS = 10 VNST
	"VNDC->AXS": 0.1, // 1 VNDC = 0.1 AXS
	"AXS->VNDC": 10.0, // 1 AXS = 10 VNDC

	// SLP rates
	"VNST->SLP": 2.0, // 1 VNST = 2 SLP
	"SLP->VNST": 0.5, // 1 SLP = 0.5 VNST
	"VNDC->SLP": 2.0, // 1 VNDC = 2 SLP
	"SLP->VNDC": 0.5, // 1 SLP = 0.5 VNDC
};

// Get mock exchange rate for token pair from contract
async function getMockExchangeRate(fromToken, toToken, chainId = 11155111) {
	try {
		const network = LOCK_RELEASE_NETWORKS[chainId];
		if (!network || !network.simpleSwapBridge || network.simpleSwapBridge === "TO_BE_DEPLOYED") {
			console.log(`⚠️ No SimpleSwapBridge deployed on chain ${chainId}, using fallback rates`);
			return getFallbackExchangeRate(fromToken, toToken);
		}

		const contract = new ethers.Contract(
			network.simpleSwapBridge,
			SIMPLE_SWAP_BRIDGE_ABI,
			providers[chainId]
		);

		console.log(`📞 Getting exchange rate from contract: ${fromToken} -> ${toToken}`);
		
		// Call the contract's getMockExchangeRate function
		const contractRate = await contract.getMockExchangeRate(fromToken, toToken);
		
		if (contractRate && contractRate > 0) {
			// Convert from contract's 5-decimal precision (e.g., 100000 = 1.0)
			const rate = Number(contractRate) / 100000;
			console.log(`💱 Contract exchange rate ${fromToken} -> ${toToken}: ${rate} (raw: ${contractRate})`);
			return rate;
		} else {
			console.log(`💱 No rate found in contract for ${fromToken} -> ${toToken}, trying reverse`);
			
			// Try reverse direction and invert
			const reverseRate = await contract.getMockExchangeRate(toToken, fromToken);
			if (reverseRate && reverseRate > 0) {
				const rate = 100000 / Number(reverseRate);
				console.log(`💱 Using inverted contract rate ${toToken} -> ${fromToken}: ${rate} (raw reverse: ${reverseRate})`);
				return rate;
			}
		}
		
		console.log(`⚠️ No contract rate found for ${fromToken} -> ${toToken}, using fallback`);
		return getFallbackExchangeRate(fromToken, toToken);
		
	} catch (error) {
		console.error(`❌ Error getting contract exchange rate:`, error.message);
		console.log(`⚠️ Using fallback exchange rate for ${fromToken} -> ${toToken}`);
		return getFallbackExchangeRate(fromToken, toToken);
	}
}

// Fallback function using hard-coded rates
function getFallbackExchangeRate(fromToken, toToken) {
	const pair = `${fromToken}->${toToken}`;
	const rate = MOCK_EXCHANGE_RATES[pair];

	console.log(`💱 Fallback exchange rate ${pair}: ${rate || "NOT_FOUND"}`);

	if (!rate) {
		// If direct pair not found, try reverse and invert
		const reversePair = `${toToken}->${fromToken}`;
		const reverseRate = MOCK_EXCHANGE_RATES[reversePair];
		if (reverseRate) {
			const invertedRate = 1 / reverseRate;
			console.log(
				`💱 Using inverted fallback rate from ${reversePair}: ${invertedRate}`
			);
			return invertedRate;
		}
	}

	return rate || 1.0; // Default to 1:1 if no rate found
}

// Convert token amount using exchange rates from contract
async function convertTokenAmount(amount, fromToken, toToken, chainId = 11155111) {
	const rate = await getMockExchangeRate(fromToken, toToken, chainId);
	const amountBigInt =
		typeof amount === "string" ? ethers.parseEther(amount) : amount;
	const convertedAmount =
		(amountBigInt * BigInt(Math.floor(rate * 1000))) / BigInt(1000);

	console.log(`🔄 Token conversion:`, {
		from: fromToken,
		to: toToken,
		rate,
		originalAmount: ethers.formatEther(amountBigInt),
		convertedAmount: ethers.formatEther(convertedAmount),
	});

	return convertedAmount;
}

// Mock SwapBridge event processing - handles cross-token bridge with conversion
async function processSwapBridgeEvent({
	user,
	tokenIn,
	tokenOut,
	amountIn,
	targetChain,
	recipient,
	transactionId,
}) {
	const txKey = `mock-swap-bridge-${transactionId}`;
	if (processedTxs.has(txKey)) return;

	console.log(`\n🔄 Processing Mock Swap + Bridge:`, {
		user,
		tokenIn,
		tokenOut,
		amountIn: ethers.formatEther(amountIn),
		targetChain: targetChain.toString(),
		recipient,
	});

	try {
		const sourceChainId = parseInt(
			process.env.SOURCE_CHAIN_ID || "11155111"
		);
		const destinationNetwork = LOCK_RELEASE_NETWORKS[targetChain];
		const destinationSigner = signers[targetChain];

		if (!destinationNetwork || !destinationSigner) {
			throw new Error(`No destination setup for chain ${targetChain}`);
		}

		// Get token symbols for both source and destination tokens
		const sourceTokenSymbol = await getTokenSymbolFromAddress(
			tokenIn,
			sourceChainId
		);
		const destinationTokenSymbol = await getTokenSymbolFromAddress(
			tokenOut,
			sourceChainId
		);

		if (!sourceTokenSymbol || !destinationTokenSymbol) {
			throw new Error(
				`Cannot determine token symbols: ${sourceTokenSymbol} -> ${destinationTokenSymbol}`
			);
		}

		console.log(
			`💱 Mock cross-token bridge: ${sourceTokenSymbol} -> ${destinationTokenSymbol}`
		);

		// Convert token amount using exchange rates from contract
		const convertedAmount = await convertTokenAmount(
			amountIn,
			sourceTokenSymbol,
			destinationTokenSymbol,
			11155111 // source chain ID
		);

		// Find destination token address
		const destinationTokenAddress = await findTokenBySymbol(
			destinationTokenSymbol,
			targetChain
		);

		if (!destinationTokenAddress) {
			throw new Error(
				`Token ${destinationTokenSymbol} not found on chain ${targetChain}`
			);
		}

		console.log(`🎯 Destination token details:`, {
			symbol: destinationTokenSymbol,
			address: destinationTokenAddress,
			chain: destinationNetwork.name,
			convertedAmount: ethers.formatEther(convertedAmount),
		});

		// Release converted tokens on destination chain
		if (destinationNetwork.bridgeFactory) {
			// Use Lock/Release mechanism
			const factoryContract = new ethers.Contract(
				destinationNetwork.bridgeFactory,
				FACTORY_ABI,
				destinationSigner
			);

			const destinationLPAddress = await factoryContract.getLPAddress(
				destinationTokenAddress
			);

			if (destinationLPAddress === ethers.ZeroAddress) {
				throw new Error(
					`No LP found for token ${destinationTokenSymbol} on ${destinationNetwork.name}`
				);
			}

			const lpContract = new ethers.Contract(
				destinationLPAddress,
				LP_ABI,
				destinationSigner
			);

			console.log(
				`🚀 Releasing ${ethers.formatEther(
					convertedAmount
				)} ${destinationTokenSymbol} from LP`
			);

			const tx = await lpContract.release(
				recipient,
				convertedAmount,
				transactionId,
				sourceChainId
			);

			console.log(`📝 Release TX: ${tx.hash}`);
			await tx.wait();
			console.log(`✅ Mock cross-token bridge completed!`);
		} else {
			// Fallback: Use MultiBridge for minting
			const bridgeContract = new ethers.Contract(
				destinationNetwork.bridge,
				BRIDGE_ABI,
				destinationSigner
			);

			console.log(
				`🚀 Minting ${ethers.formatEther(
					convertedAmount
				)} ${destinationTokenSymbol} (fallback)`
			);

			const tx = await bridgeContract.releaseTokens(
				destinationTokenSymbol,
				recipient,
				convertedAmount,
				sourceChainId,
				transactionId
			);

			console.log(`📝 Mint TX: ${tx.hash}`);
			await tx.wait();
			console.log(`✅ Mock cross-token bridge completed! (fallback)`);
		}

		processedTxs.add(txKey);
	} catch (error) {
		console.error(
			`❌ Mock swap + bridge processing failed:`,
			error.message
		);
		console.error(`❌ Full error:`, error);
	}
}

// Process SimpleSwapBridge events - simplified version without real Uniswap
async function processSimpleSwapBridgeEvent({
	user,
	tokenIn,
	tokenOut,
	amountIn,
	targetChain,
	recipient,
	minAmountOut,
	transactionId,
}) {
	const txKey = `simple-swap-bridge-${transactionId}`;
	if (processedTxs.has(txKey)) return;

	console.log(`\n🔄 Processing Simple Swap + Bridge:`, {
		user,
		tokenIn,
		tokenOut,
		amountIn: ethers.formatEther(amountIn),
		targetChain: targetChain.toString(),
		recipient,
		minAmountOut: ethers.formatEther(minAmountOut),
	});

	try {
		const sourceChainId = parseInt(
			process.env.SOURCE_CHAIN_ID || "11155111"
		);
		const destinationNetwork = LOCK_RELEASE_NETWORKS[targetChain];
		const destinationSigner = signers[targetChain];

		if (!destinationNetwork || !destinationSigner) {
			throw new Error(`No destination setup for chain ${targetChain}`);
		}

		// Get token symbols for both source and destination tokens
		const sourceTokenSymbol = await getTokenSymbolFromAddress(
			tokenIn,
			sourceChainId
		);
		const destinationTokenSymbol = await getTokenSymbolFromAddress(
			tokenOut,
			targetChain // this is chainID
		);

		if (!sourceTokenSymbol || !destinationTokenSymbol) {
			throw new Error(
				`Cannot determine token symbols: ${sourceTokenSymbol} -> ${destinationTokenSymbol}`
			);
		}

		console.log(
			`💱 Simple cross-token bridge: ${sourceTokenSymbol} -> ${destinationTokenSymbol}`
		);

		// Convert token amount using exchange rates from contract (1:1 for VNST <-> VNDC)
		const convertedAmount =
			sourceTokenSymbol === "VNST" && destinationTokenSymbol === "VNDC"
				? amountIn // 1:1 rate for VNST to VNDC
				: destinationTokenSymbol === "VNST" &&
				  sourceTokenSymbol === "VNDC"
				? amountIn // 1:1 rate for VNDC to VNST
				: await convertTokenAmount(
						amountIn,
						sourceTokenSymbol,
						destinationTokenSymbol,
						sourceChainId
				  );

		// Find destination token address
		const destinationTokenAddress = await findTokenBySymbol(
			destinationTokenSymbol,
			targetChain
		);

		if (!destinationTokenAddress) {
			throw new Error(
				`Token ${destinationTokenSymbol} not found on chain ${targetChain}`
			);
		}

		console.log(`🎯 Destination token details:`, {
			symbol: destinationTokenSymbol,
			address: destinationTokenAddress,
			chain: destinationNetwork.name,
			convertedAmount: ethers.formatEther(convertedAmount),
		});

		// Release tokens on destination chain using the bridge factory
		if (destinationNetwork.bridgeFactory) {
			// Use Lock/Release mechanism
			const factoryContract = new ethers.Contract(
				destinationNetwork.bridgeFactory,
				FACTORY_ABI,
				destinationSigner
			);

			const destinationLPAddress = await factoryContract.getLPAddress(
				destinationTokenAddress
			);

			if (destinationLPAddress === ethers.ZeroAddress) {
				throw new Error(
					`No LP found for token ${destinationTokenSymbol} on ${destinationNetwork.name}`
				);
			}

			const lpContract = new ethers.Contract(
				destinationLPAddress,
				LP_ABI,
				destinationSigner
			);

			console.log(
				`🚀 Releasing ${ethers.formatEther(
					convertedAmount
				)} ${destinationTokenSymbol} from LP`
			);

			const tx = await lpContract.release(
				recipient,
				convertedAmount,
				transactionId,
				sourceChainId
			);

			console.log(`📝 Simple Release TX: ${tx.hash}`);
			await tx.wait();
			console.log(`✅ Simple cross-token bridge completed!`);
		} else {
			// Fallback: Use MultiBridge for minting
			const bridgeContract = new ethers.Contract(
				destinationNetwork.bridge,
				BRIDGE_ABI,
				destinationSigner
			);

			console.log(
				`🚀 Minting ${ethers.formatEther(
					convertedAmount
				)} ${destinationTokenSymbol} (fallback)`
			);

			const tx = await bridgeContract.releaseTokens(
				destinationTokenSymbol,
				recipient,
				convertedAmount,
				sourceChainId,
				transactionId
			);

			console.log(`📝 Simple Mint TX: ${tx.hash}`);
			await tx.wait();
			console.log(`✅ Simple cross-token bridge completed! (fallback)`);
		}

		processedTxs.add(txKey);
	} catch (error) {
		console.error(
			`❌ Simple swap + bridge processing failed:`,
			error.message
		);
		console.error(`❌ Full error:`, error);
	}
}

// API Routes
app.get("/api/status", (req, res) =>
	res.json({
		status: "active",
		mechanism: BRIDGE_MECHANISM,
		walletInfo,
		processed: processedTxs.size,
	})
);

// Get exchange rates (both contract and fallback)
app.get("/api/exchange-rates", async (req, res) => {
	try {
		// Try to get some common rates from contract
		const contractRates = {};
		const commonPairs = [
			["VNST", "VNDC"],
			["VNDC", "VNST"],
			["VNST", "AXS"],
			["AXS", "VNST"],
			["VNST", "SLP"],
			["SLP", "VNST"],
		];

		for (const [from, to] of commonPairs) {
			try {
				const rate = await getMockExchangeRate(from, to);
				contractRates[`${from}->${to}`] = rate;
			} catch (err) {
				console.error(`Failed to get rate ${from}->${to}:`, err.message);
			}
		}

		res.json({
			contractRates,
			fallbackRates: MOCK_EXCHANGE_RATES,
			description: "Exchange rates from contract with fallback rates for demo",
		});
	} catch (error) {
		res.status(500).json({ 
			error: error.message,
			fallbackRates: MOCK_EXCHANGE_RATES 
		});
	}
});

// Get mock quote for token conversion
app.get("/api/quote/:fromToken/:toToken/:amount", async (req, res) => {
	try {
		const { fromToken, toToken, amount } = req.params;

		if (!fromToken || !toToken || !amount) {
			return res
				.status(400)
				.json({ error: "Missing required parameters" });
		}

		const rate = await getMockExchangeRate(fromToken, toToken);
		const amountIn = ethers.parseEther(amount);
		const amountOut = await convertTokenAmount(amountIn, fromToken, toToken);

		res.json({
			fromToken,
			toToken,
			amountIn: amount,
			amountOut: ethers.formatEther(amountOut),
			exchangeRate: rate,
			mockQuote: true,
			timestamp: Date.now(),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Simulate bridge transaction for demo
app.post("/api/simulate-bridge", async (req, res) => {
	try {
		const { fromToken, toToken, amount, fromChain, toChain, recipient } =
			req.body;

		if (
			!fromToken ||
			!toToken ||
			!amount ||
			!fromChain ||
			!toChain ||
			!recipient
		) {
			return res
				.status(400)
				.json({ error: "Missing required parameters" });
		}

		const rate = await getMockExchangeRate(fromToken, toToken);
		const amountIn = ethers.parseEther(amount);
		const amountOut = await convertTokenAmount(amountIn, fromToken, toToken);
		const mockTxId = ethers.keccak256(
			ethers.toUtf8Bytes(`${Date.now()}-${Math.random()}`)
		);

		// Simulate processing delay
		setTimeout(async () => {
			console.log(
				`🎭 Simulating bridge: ${amount} ${fromToken} -> ${ethers.formatEther(
					amountOut
				)} ${toToken}`
			);

			// Mock the swap bridge event processing
			await processSwapBridgeEvent({
				user: recipient,
				tokenIn: await findTokenBySymbol(fromToken, fromChain),
				tokenOut: await findTokenBySymbol(toToken, fromChain), // Use same chain for lookup
				amountIn: amountIn,
				targetChain: toChain,
				recipient: recipient,
				transactionId: mockTxId,
			});
		}, 2000); // 2 second delay

		res.json({
			success: true,
			fromToken,
			toToken,
			amountIn: amount,
			amountOut: ethers.formatEther(amountOut),
			exchangeRate: rate,
			fromChain,
			toChain,
			recipient,
			transactionId: mockTxId,
			status: "processing",
			estimatedTime: "2-3 seconds",
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post("/api/release", async (req, res) => {
	const {
		recipient,
		amount,
		tokenSymbol,
		sourceChain,
		targetChain,
		transactionId,
	} = req.body;
	try {
		await autoReleaseTokens({
			recipient,
			amount,
			tokenSymbol,
			targetChain,
			transactionId,
		});
		res.json({ success: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.get("/api/tokens/:chainId", async (req, res) => {
	const { chainId } = req.params;
	const network = NETWORKS[chainId];
	if (!network || !providers[chainId]) {
		return res.status(404).json({ error: "Network not found" });
	}

	try {
		const bridge = new ethers.Contract(
			network.bridge,
			BRIDGE_ABI,
			providers[chainId]
		);
		const supportedTokens = [];

		for (const token of KNOWN_TOKENS) {
			try {
				if (await bridge.supportedTokens(token)) {
					const address = await bridge.getTokenAddress(token);
					supportedTokens.push({ symbol: token, address });
				}
			} catch {}
		}

		res.json({
			chainId: parseInt(chainId),
			network: network.name,
			supportedTokens,
		});
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.listen(PORT, async () => {
	console.log(
		`\n🌉 Multi-Token Bridge Relayer (${BRIDGE_MECHANISM.toUpperCase()}) - Port ${PORT}`
	);
	await initializeNetworks();
	if (Object.keys(signers).length > 0) {
		monitorBridgeEvents();
		console.log(
			`\n🚀 Monitoring ${
				Object.keys(signers).length
			} networks with ${BRIDGE_MECHANISM} mechanism...`
		);
	} else {
		console.warn("\n⚠️ No signers - read-only mode");
	}
});
