// Tambahkan logging di awal script
console.clear(); // Clear console
console.log('\x1b[36m%s\x1b[0m', `
╔═══════════════════════════════════════╗
║        Soneium Multi-Tool v1.4        ║
║         By: Aethereal Team            ║
╚═══════════════════════════════════════╝
`);

// Debug imports
console.log('🔄 Initializing...');

// Tambahkan error handling global
process.on('uncaughtException', (error) => {
    console.error('\n❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('\n❌ Unhandled Promise Rejection:', error);
    process.exit(1);
});

// Import dengan try-catch yang lebih detail
let privateKey, Helper, ethers, input, logger, Config;

try {
    console.log('📚 Loading modules...');
    
    try {
        const accounts = await import("./accounts/accounts.js");
        privateKey = accounts.privateKey;
        console.log('✅ Accounts loaded');
    } catch (e) {
        throw new Error(`Failed to load accounts: ${e.message}`);
    }
    
    try {
        const helperModule = await import("./src/utils/helper.js");
        Helper = helperModule.Helper;
        console.log('✅ Helper loaded');
    } catch (e) {
        throw new Error(`Failed to load helper: ${e.message}`);
    }
    
    try {
        ethers = await import("ethers");
        console.log('✅ Ethers loaded');
    } catch (e) {
        throw new Error(`Failed to load ethers: ${e.message}`);
    }
    
    try {
        input = await import("input");
        console.log('✅ Input module loaded');
    } catch (e) {
        throw new Error(`Failed to load input: ${e.message}`);
    }
    
    try {
        logger = await import("./src/utils/logger.js");
        console.log('✅ Logger loaded');
    } catch (e) {
        throw new Error(`Failed to load logger: ${e.message}`);
    }
    
    try {
        const configModule = await import("./config/config.js");
        Config = configModule.Config;
        console.log('✅ Config loaded');
    } catch (e) {
        throw new Error(`Failed to load config: ${e.message}`);
    }

    console.log('\n✅ All modules loaded successfully!\n');
    
    // Validasi modules
    if (!privateKey) throw new Error('🔑 privateKey is undefined after import');
    if (!Helper) throw new Error('🛠️ Helper is undefined after import');
    if (!ethers) throw new Error('📦 ethers is undefined after import');
    if (!input) throw new Error('⌨️ input is undefined after import');
    if (!logger) throw new Error('📝 logger is undefined after import');
    if (!Config) throw new Error('⚙️ Config is undefined after import');

    // Lanjutkan dengan kode utama...
    console.log('🚀 Starting main program...\n');
    
} catch (error) {
    console.error('\n❌ Error during initialization:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}

// Definisikan variabel di scope global
let NETWORKS, ROUTER_ADDRESS, WETH_ADDRESS, USDC_ADDRESS, SONE_ADDRESS, SOE_ADDRESS, POOL_CONFIG, FAUCET_CONFIG;

try {
    // Konfigurasi
    NETWORKS = {
        SEPOLIA: {
            RPC: Config.NETWORKS.SEPOLIA.RPC,
            CHAINID: Config.NETWORKS.SEPOLIA.CHAINID,
            EXPLORER: Config.NETWORKS.SEPOLIA.EXPLORER,
            BRIDGE_CONTRACT: "0x5f5a404A5edabcDD80DB05E8e54A78c9EBF000C2"
        },
        SONEIUM: {
            ...Config.NETWORKS.SONEIUM,
            MESSENGER_CONTRACT: "0x4200000000000000000000000000000000000007",
            IMPLEMENTATION: "0xC0d3c0d3c0D3c0D3C0d3C0D3C0D3c0d3c0d30007",
            BRIDGE_RELAYER: "0x1295245D202724Dc28a2b688952cb56c882c3380"
        }
    };

    // DEX Config dengan nilai default
    ROUTER_ADDRESS = "0xB49f7abF6eB138f93c758DeF85e3C4B88d919385";
    WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
    USDC_ADDRESS = "0xE9A198d38483aD727ABC8b0B1e16B2d338CF0391";
    SONE_ADDRESS = "0xA5D6513082EF1F157A33A066293309E74A8aF6Df";
    SOE_ADDRESS = "0x5bD7A9D2328EFF28ba3261dD81CB3f4e4FDF221e";

    console.log('⚙️ Using default DEX configuration');

    POOL_CONFIG = {
        L2POOL: Config.LENDING?.L2POOL || {},
        TOKENS: Config.FAUCET?.TOKENS || {}
    };

    FAUCET_CONFIG = Config.FAUCET || {};

    console.log('✅ Pool and Faucet configuration loaded');

    // Tambahkan setelah deklarasi POOL_CONFIG dan FAUCET_CONFIG
    const colors = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
        gray: "\x1b[90m"
    };

    function getTimestamp() {
        const jakartaTime = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        // Convert MM/DD/YYYY, HH:MM:SS format to YYYY-MM-DD HH:MM:SS
        const [date, time] = jakartaTime.split(', ');
        const [month, day, year] = date.split('/');
        return `${year}-${month}-${day} ${time}`;
    }

    function formatLog(wallet, message, type = 'info') {
        const accountIndex = privateKey.indexOf(wallet.privateKey) + 1;
        const timestamp = `${colors.gray}[${getTimestamp()}]${colors.reset}`;
        const accountInfo = `${colors.cyan}[Account ${accountIndex} | ${wallet.address.slice(-4)}]${colors.reset}`;
        
        let messageColor;
        let prefix = '';
        switch(type) {
            case 'success':
                messageColor = colors.green;
                prefix = '✅ ';
                break;
            case 'error':
                messageColor = colors.red;
                prefix = '❌ ';
                break;
            case 'warning':
                messageColor = colors.yellow;
                prefix = '⚠️ ';
                break;
            case 'wait':
                messageColor = colors.magenta;
                prefix = '⏳ ';
                break;
            case 'info':
                messageColor = colors.blue;
                prefix = 'ℹ️ ';
                break;
            case 'start':
                messageColor = colors.cyan;
                prefix = '🚀 ';
                break;
            case 'end':
                messageColor = colors.green;
                prefix = '🏁 ';
                break;
            case 'loading':
                messageColor = colors.yellow;
                prefix = '📦 ';
                break;
            case 'bridge':
                messageColor = colors.magenta;
                prefix = '🌉 ';
                break;
            case 'token':
                messageColor = colors.cyan;
                prefix = '🪙 ';
                break;
            default:
                messageColor = colors.white;
                prefix = '➡️ ';
        }
        
        return `${timestamp} ${accountInfo} ${messageColor}${prefix}${message}${colors.reset}`;
    }

    // Tambahkan fungsi withRetry yang baru setelah deklarasi colors
    async function withRetry(operation, wallet, maxRetries = 5, delayMs = 5000) {
        const networkErrors = [
            // Basic Network Errors
            "client network socket disconnected",
            "client network",
            "network socket disconnected",
            "socket disconnected",
            "disconnected",
            "TLS connection",
            "network",
            "connection refused",
            "timeout",
            "etimedout",
            "econnreset",
            "econnrefused",
            "network error",
            
            // Tambahkan error socket hang up
            "socket hang up",
            "socket hang",
            "hang up",
            "socket closed",
            "socket error",
            
            // HTTP Status Errors
            "503",
            "502",
            "500",
            "504",
            "429", // Too Many Requests
            "service unavailable",
            "bad gateway",
            "gateway timeout",
            "server error",
            
            // RPC Specific Errors
            "nonce too low",
            "replacement fee too low",
            "transaction underpriced",
            "insufficient funds",
            "already known",
            "rate limit",
            "rpc error",
            "execution reverted",
            "gas required exceeds allowance",
            
            // Connection Errors
            "connection error",
            "connection timeout",
            "connection refused",
            "connection closed",
            "connection reset",
            
            // JSON-RPC Errors
            "json rpc error",
            "parse error",
            "invalid request",
            "method not found",
            "invalid params",
            "internal error",
            
            // Provider Errors
            "provider error",
            "provider disconnected",
            "provider network error",
            "missing provider",
            "unsupported network",
            
            // Transaction Errors
            "transaction failed",
            "transaction rejected",
            "transaction not found",
            "transaction timeout",
            "pending transaction",
            "transaction underpriced",
            "transaction replaced",
            
            // Block Errors
            "block not found",
            "block range too large",
            "exceeds block gas limit",
            
            // Generic Errors
            "request failed",
            "failed to fetch",
            "bad response",
            "invalid response",
            "unexpected end of json input"
        ];

        const nonRetryableErrors = [
            // Cooldown period errors
            "cooldown",
            "already claimed",
            "try again later",
            "please wait",
            
            // Balance related errors
            "insufficient balance",
            "insufficient funds",
            "balance too low",
            "no balance",
            
            // Known contract errors
            "execution reverted: already claimed",
            "execution reverted: cooldown",
            "execution reverted: insufficient balance",
            "execution reverted: not enough balance",
            "execution reverted: amount exceeds balance",
            "execution reverted",
            "transaction execution reverted",
            "call exception",
            "CALL_EXCEPTION",
            
            // Other known states
            "user rejected",
            "user cancelled",
            "rejected by user",
            "already processed",
            "already exists",
            "already approved",
            "already completed"
        ];

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                const errorMessage = error.message.toLowerCase();
                
                // Cek status transaksi
                if (error?.receipt?.status === 0) {
                    // Ini adalah execution revert, cek reason
                    const txHash = error?.receipt?.hash;
                    try {
                        // Coba dapatkan reason dari transaction receipt
                        const tx = await wallet.provider.getTransaction(txHash);
                        const receipt = await wallet.provider.getTransactionReceipt(txHash);
                        
                        // Deteksi token dari data transaksi
                        let tokenSymbol = "Token";
                        if (tx?.data) {
                            // Cek token dari data transaksi
                            if (tx.data.includes(POOL_CONFIG.TOKENS.ASTR.ADDRESS.toLowerCase().slice(2))) {
                                tokenSymbol = "ASTR";
                            } else if (tx.data.includes(POOL_CONFIG.TOKENS.USDC.ADDRESS.toLowerCase().slice(2))) {
                                tokenSymbol = "USDC.e";
                            } else if (tx.data.includes(POOL_CONFIG.TOKENS.WBTC.ADDRESS.toLowerCase().slice(2))) {
                                tokenSymbol = "WBTC";
                            } else if (tx.data.includes(POOL_CONFIG.TOKENS.SOLVBTC.ADDRESS.toLowerCase().slice(2))) {
                                tokenSymbol = "SOLVBTC";
                            } else if (tx.data.includes(POOL_CONFIG.TOKENS.SOLVBTCBBN.ADDRESS.toLowerCase().slice(2))) {
                                tokenSymbol = "SOLVBTCBBN";
                            } else if (tx.data.includes(POOL_CONFIG.TOKENS.VASTR.ADDRESS.toLowerCase().slice(2))) {
                                tokenSymbol = "VASTR";
                            } else if (tx.data.includes(POOL_CONFIG.TOKENS.STONE.ADDRESS.toLowerCase().slice(2))) {
                                tokenSymbol = "STONE";
                            }
                        }
                        
                        // Tampilkan pesan dengan token yang spesifik
                        if (errorMessage.includes("cooldown") || errorMessage.includes("already claimed")) {
                            console.log(formatLog(wallet, `⏳ Skipping: ${tokenSymbol} still in cooldown period`, 'warning'));
                        } else if (errorMessage.includes("insufficient") || errorMessage.includes("balance")) {
                            console.log(formatLog(wallet, `💰 Skipping: Insufficient ${tokenSymbol} balance`, 'warning'));
                        } else {
                            console.log(formatLog(wallet, `⚠️ Skipping: ${tokenSymbol} still in cooldown period`, 'warning'));
                        }
                    } catch {
                        // Jika gagal mendapatkan detail, tampilkan pesan generic dengan token
                        console.log(formatLog(wallet, `❌ Unable to determine specific reason for ${tokenSymbol} faucet failure`, 'warning'));
                    }
                    return false;
                }

                // Untuk error network/lainnya, lanjutkan dengan retry logic yang ada
                const isNetworkError = networkErrors.some(msg => 
                    errorMessage.includes(msg.toLowerCase())
                );
                
                const isRetryableStatus = [500, 502, 503, 504, 429].includes(error?.status || error?.code);

                if (isNetworkError || isRetryableStatus) {
                    if (attempt === maxRetries) {
                        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
                    }
                    
                    let currentDelay = delayMs;
                    if (error?.status === 429 || errorMessage.includes("rate limit")) {
                        currentDelay = delayMs * 2;
                    }
                    
                    console.log(formatLog(wallet, `🔄 Network/Server error on attempt ${attempt}/${maxRetries}: ${error.message}`, 'error'));
                    console.log(formatLog(wallet, `⏳ Retrying in ${currentDelay/1000} seconds...`, 'wait'));
                    await new Promise(resolve => setTimeout(resolve, currentDelay));
                } else {
                    console.error(formatLog(wallet, `❌ Non-retryable error: ${error.message}`, 'error'));
                    throw error;
                }
            }
        }
    }

    // Import fungsi bridge dari bridge.js
    async function waitForSoneiumBridge(wallet, amount) {
        return await withRetry(async () => {
            try {
                console.log(formatLog(wallet, `🔍 Monitoring bridge status on Soneium...`, 'info'));
                
                let soneiumProvider = new ethers.JsonRpcProvider(
                    NETWORKS.SONEIUM.RPC,
                    {
                        chainId: NETWORKS.SONEIUM.CHAINID,
                        name: 'soneium'
                    }
                );
                await soneiumProvider.getNetwork();

                const initialBalance = await soneiumProvider.getBalance(wallet.address);
                
                let attempts = 0;
                const maxAttempts = 30;
                
                while (attempts < maxAttempts) {
                    attempts++;
                    
                    const currentBalance = await soneiumProvider.getBalance(wallet.address);
                    
                    if (currentBalance > initialBalance) {
                        const blockNumber = await soneiumProvider.getBlockNumber();
                        const block = await soneiumProvider.getBlock(blockNumber, true);
                        
                        const bridgeTx = block.transactions.find(tx => 
                            tx.from?.toLowerCase() === NETWORKS.SONEIUM.BRIDGE_RELAYER.toLowerCase() &&
                            tx.to?.toLowerCase() === NETWORKS.SONEIUM.MESSENGER_CONTRACT.toLowerCase()
                        );

                        console.log(formatLog(wallet, `✅ Bridge completed successfully!`, 'success'));
                        console.log(formatLog(wallet, `Received ${ethers.formatEther(currentBalance - initialBalance)} ETH on Soneium`, 'success'));
                        if (bridgeTx) {
                            console.log(formatLog(wallet, `Soneium Transaction Hash: ${NETWORKS.SONEIUM.EXPLORER}${bridgeTx.hash}`, 'info'));
                        }
                        return true;
                    }
                    
                    const progress = Math.round((attempts / maxAttempts) * 100);
                    console.log(formatLog(wallet, `⏳ Waiting for bridge completion... ${progress}% (${attempts}/${maxAttempts})`, 'wait'));
                    
                    await new Promise(resolve => setTimeout(resolve, 30000));
                }
                
                throw new Error('Bridge monitoring timeout after 15 minutes');
                
            } catch (error) {
                console.error(formatLog(wallet, `❌ Error monitoring bridge: ${error.message}`, 'error'));
                throw error; // Re-throw untuk withRetry
            }
        }, wallet, 10, 7000); // Lebih banyak retry untuk bridge monitoring
    }

    async function bridgeToSoneium(wallet, amount) {
        try {
            // Tambahkan satu delay di sini saja
            await bridgeDelay(wallet, 'Waiting before bridge transaction...');
            
            console.log(formatLog(wallet, `🚀 Starting bridge from Sepolia to Soneium...`, 'info'));
            
            const tx = {
                to: NETWORKS.SEPOLIA.BRIDGE_CONTRACT,
                value: ethers.parseEther(amount),
                data: "0xe11013dd" + 
                    "000000000000000000000000" + wallet.address.slice(2) +
                    "0000000000000000000000000000000000000000000000000000000000030d40" +
                    "0000000000000000000000000000000000000000000000000000000000000060" +
                    "000000000000000000000000000000000000000000000000000000000000000b" +
                    "7375706572627269646765000000000000000000000000000000000000000000"
            };

            console.log(formatLog(wallet, `📦 Estimating gas...`, 'wait'));
            const gasLimit = await wallet.provider.estimateGas(tx);
            tx.gasLimit = gasLimit;

            console.log(formatLog(wallet, `🚀 Sending bridge transaction...`, 'wait'));
            const transaction = await wallet.sendTransaction(tx);
            
            console.log(formatLog(wallet, `✅ Transaction sent! Waiting for confirmation...`, 'wait'));
            console.log(formatLog(wallet, `Sepolia Transaction Hash: ${NETWORKS.SEPOLIA.EXPLORER}${transaction.hash}`, 'info'));
            
            const receipt = await transaction.wait();
            console.log(formatLog(wallet, `🎉 Bridge transaction confirmed!`, 'success'));
            
            return await withRetry(async () => {
                return await waitForSoneiumBridge(wallet, amount);
            }, wallet, 10, 7000);
        } catch (error) {
            console.error(formatLog(wallet, `❌ Error during bridge: ${error.message}`, 'error'));
            return false;
        }
    }

    // Faucet Functions
    async function claimFaucet(wallet, tokenType) {
            let tokenConfig;
            try {
                switch(tokenType) {
                    case "ASTR": tokenConfig = POOL_CONFIG.TOKENS.ASTR; break;
                    case "USDC": tokenConfig = POOL_CONFIG.TOKENS.USDC; break;
                    case "WBTC": tokenConfig = POOL_CONFIG.TOKENS.WBTC; break;
                    case "SOLVBTC": tokenConfig = POOL_CONFIG.TOKENS.SOLVBTC; break;
                    case "SOLVBTCBBN": tokenConfig = POOL_CONFIG.TOKENS.SOLVBTCBBN; break;
                    case "VASTR": tokenConfig = POOL_CONFIG.TOKENS.VASTR; break;
                    case "STONE": tokenConfig = POOL_CONFIG.TOKENS.STONE; break;
                    default: throw new Error(`Token type ${tokenType} not found in config`);
                }

                return await withRetry(async () => {
                    console.log(formatLog(wallet, `🎉 Claiming ${tokenConfig.SYMBOL} faucet...`));
                    const iface = new ethers.Interface([
                        "function drip(address token, address recipient) external returns (uint256)"
                    ]);

                    const data = iface.encodeFunctionData("drip", [
                        tokenConfig.ADDRESS,
                        wallet.address
                    ]);

                    const tx = {
                        to: FAUCET_CONFIG.CONTRACT,
                        data: data,
                        gasLimit: "0x1e8480"
                    };

                    const transaction = await wallet.sendTransaction(tx);
                    console.log(formatLog(wallet, `✅ Transaction sent! Hash: ${NETWORKS.SONEIUM.EXPLORER}${transaction.hash}`, 'wait'));
                    
                    const receipt = await transaction.wait();
                    if (receipt.status === 1) {
                        console.log(formatLog(wallet, `✅ Successfully claimed ${tokenConfig.SYMBOL} faucet!`, 'success'));
                        return true;
                    }
                    return false;
                }, wallet, 3, 5000);

            } catch (error) {
                if (error.message.includes("execution reverted") || 
                    error.message.includes("cooldown") || 
                    error.message.toLowerCase().includes("already claimed")) {
                    console.log(formatLog(wallet, `❌ Skipping ${tokenConfig?.SYMBOL || tokenType} faucet: Still in cooldown period`, 'warning'));
                    return false;
                }
                console.error(formatLog(wallet, `❌ Error claiming ${tokenConfig?.SYMBOL || tokenType} faucet: ${error.message}`, 'error'));
                return false;
            }
    }

    // Tambahkan fungsi approve token
    async function approveToken(wallet, tokenAddress, spenderAddress) {
        try {
            const tokenContract = new ethers.Contract(
                tokenAddress,
                [
                    "function approve(address spender, uint256 amount) external returns (bool)",
                    "function allowance(address owner, address spender) view returns (uint256)"
                ],
                wallet
            );

            const allowance = await tokenContract.allowance(wallet.address, spenderAddress);
            if (allowance > 0n) {
                console.log(formatLog(wallet, `🎉 Token already approved`, 'info'));
                return true;
            }

            console.log(formatLog(wallet, `🎉 Approving token...`, 'info'));
            const tx = await tokenContract.approve(
                spenderAddress,
                ethers.MaxUint256,
                {
                    gasLimit: await tokenContract.approve.estimateGas(spenderAddress, ethers.MaxUint256)
                }
            );
            
            console.log(formatLog(wallet, `✅ Transaction Hash: ${NETWORKS.SONEIUM.EXPLORER}${tx.hash}`, 'wait'));
            await tx.wait();
            console.log(formatLog(wallet, `✅ Token approved successfully!`, 'success'));
            return true;
        } catch (error) {
            console.error(formatLog(wallet, `❌ Error approving token: ${error.message}`, 'error'));
            return false;
        }
    }

    // Fungsi untuk random token dan amount
    function getRandomSwapConfig() {
        const tokens = [
            { symbol: 'USDC.e', address: USDC_ADDRESS, decimals: 6 },
            { symbol: 'SONE', address: SONE_ADDRESS, decimals: 18 },
            { symbol: 'SOE', address: SOE_ADDRESS, decimals: 18 }
        ];

        const swapTypes = [
            { type: 'ETHtoToken', minAmount: 0.001, maxAmount: 0.005 },
            { type: 'TokenToETH', minAmount: 10, maxAmount: 50 }
        ];

        const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
        const randomSwapType = swapTypes[Math.floor(Math.random() * swapTypes.length)];
        const randomAmount = (Math.random() * (randomSwapType.maxAmount - randomSwapType.minAmount) + randomSwapType.minAmount).toFixed(6);

        return { token: randomToken, swapType: randomSwapType.type, amount: randomAmount };
    }

    // Fungsi untuk supply token
    async function supplyToken(wallet, token) {
        try {
            console.log(formatLog(wallet, `\nProcessing supply for ${token.SYMBOL}...`, 'info'));

            // Check token balance
            const tokenContract = new ethers.Contract(
                token.ADDRESS,
                ["function balanceOf(address) view returns (uint256)"],
                wallet
            );
            const balance = await tokenContract.balanceOf(wallet.address);
            
            if (balance <= 0n) {
                console.log(formatLog(wallet, `❌ Skipping ${token.SYMBOL}: No balance`, 'warning'));
                return false;
            }

            // Random percentage between 40-60%
            const percentage = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
            const supplyAmount = (balance * BigInt(percentage)) / 100n;

            // Approve if needed
            await approveToken(wallet, token.ADDRESS, POOL_CONFIG.L2POOL);

            console.log(formatLog(wallet, `🎉 Supplying ${ethers.formatUnits(supplyAmount, token.DECIMALS)} ${token.SYMBOL} (${percentage}%)...`, 'wait'));
            const poolContract = new ethers.Contract(
                POOL_CONFIG.L2POOL,
                ["function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external"],
                wallet
            );

            const tx = await poolContract.supply(token.ADDRESS, supplyAmount, wallet.address, 0);
            console.log(formatLog(wallet, `Supply tx: ${NETWORKS.SONEIUM.EXPLORER}${tx.hash}`, 'info'));
            
            const receipt = await tx.wait();
            console.log(formatLog(wallet, `🎉 Successfully supplied ${token.SYMBOL}!`, 'success'));
            return true;
        } catch (error) {
            console.error(formatLog(wallet, `❌ Error supplying ${token.SYMBOL}: ${error.message}`, 'error'));
            return false;
        }
    }

    // Fungsi untuk borrow token
    async function borrowToken(wallet, token) {
        try {
            return await withRetry(async () => {
                const balance = await getTokenBalance(wallet, token);
                if (balance <= 0n) {
                    console.log(formatLog(wallet, `❌ Skipping ${token.SYMBOL}: No balance to borrow against`, 'warning'));
                    return false; // Return false instead of throwing error
                }

                const percentage = Math.floor(Math.random() * (5 - 2 + 1)) + 2;
                const borrowAmount = (balance * BigInt(percentage)) / 100n;

                console.log(formatLog(wallet, `🎉 Current ${token.SYMBOL} balance: ${ethers.formatUnits(balance, token.DECIMALS)}`, 'info'));
                console.log(formatLog(wallet, `🎉 Will borrow ${ethers.formatUnits(borrowAmount, token.DECIMALS)} ${token.SYMBOL} (${percentage}%)`, 'info'));

                const poolContract = new ethers.Contract(
                    POOL_CONFIG.L2POOL,
                    ["function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external"],
                    wallet
                );

                const tx = await poolContract.borrow(
                    token.ADDRESS,
                    borrowAmount,
                    2,
                    0,
                    wallet.address
                );

                console.log(formatLog(wallet, `✅ Transaction Hash: ${NETWORKS.SONEIUM.EXPLORER}${tx.hash}`, 'info'));
                await tx.wait();
                console.log(formatLog(wallet, `🎉 Successfully borrowed ${token.SYMBOL}!`, 'success'));
                return true;
            }, wallet);
        } catch (error) {
            console.log(formatLog(wallet, `❌ Error borrowing ${token.SYMBOL}: ${error.message}`, 'error'));
            return false; // Return false instead of throwing error
        }
    }

    // Swap Functions
    async function swapETHtoToken(wallet, tokenAddress, amountIn) {
        return await withRetry(async () => {
        try {
            const ethBalance = await wallet.provider.getBalance(wallet.address);
            
            // Random percentage between 40-60%
            const percentage = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
            const swapAmount = (ethBalance * BigInt(percentage)) / 100n;

            const iface = new ethers.Interface([
                "function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external payable returns (uint256[] memory amounts)"
            ]);

            const path = [WETH_ADDRESS, tokenAddress];
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

            const data = iface.encodeFunctionData("swapExactETHForTokens", [
                0, path, wallet.address, deadline
            ]);

            let gasLimit;
            for (let i = 0; i < 3; i++) {
                try {
                    gasLimit = await wallet.provider.estimateGas({
                        to: ROUTER_ADDRESS,
                        data: data,
                        value: swapAmount,
                        from: wallet.address
                    });
                    break;
                } catch (error) {
                    if (i === 2) throw error;
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }

            const tokenSymbol = tokenAddress === SONE_ADDRESS ? "SONE" : 
                               tokenAddress === SOE_ADDRESS ? "SOE" : "USDC.e";

            console.log(formatLog(wallet, `\n🎉 Swapping ${ethers.formatEther(swapAmount)} ETH (${percentage}%) to ${tokenSymbol}...`, 'info'));
            const transaction = await wallet.sendTransaction({
                to: ROUTER_ADDRESS,
                data: data,
                value: swapAmount,
                gasLimit: gasLimit
            });

            console.log(formatLog(wallet, `✅ Transaction Hash: ${NETWORKS.SONEIUM.EXPLORER}${transaction.hash}`, 'wait'));
            await transaction.wait();
            console.log(formatLog(wallet, `🎉 Swap ETH to ${tokenSymbol} successful!`, 'success'));
            return true;
        } catch (error) {
            console.error(formatLog(wallet, `❌ Error swapping ETH to token: ${error.message}`, 'error'));
            throw error;
        }
        }, wallet, 3, 10000);
    }

    async function swapTokensForETH(wallet, tokenAddress, amountIn, decimals = 18) {
        return await withRetry(async () => {
            try {
                const approved = await approveToken(wallet, tokenAddress, ROUTER_ADDRESS);
                if (!approved) return false;

                const iface = new ethers.Interface([
                    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)"
                ]);

                const path = [tokenAddress, WETH_ADDRESS];
                const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

                const data = iface.encodeFunctionData("swapExactTokensForETH", [
                    amountIn, 0, path, wallet.address, deadline
                ]);

                let gasLimit;
                for (let i = 0; i < 3; i++) {
                    try {
                        gasLimit = await wallet.provider.estimateGas({
                            to: ROUTER_ADDRESS,
                            data: data,
                            from: wallet.address
                        });
                        break;
                    } catch (error) {
                        if (i === 2) throw error;
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                }

                const tokenSymbol = tokenAddress === SONE_ADDRESS ? "SONE" : 
                                   tokenAddress === SOE_ADDRESS ? "SOE" : "USDC.e";

                console.log(formatLog(wallet, `\n🎉 Swapping ${ethers.formatUnits(amountIn, decimals)} ${tokenSymbol} to ETH...`, 'info'));
                const transaction = await wallet.sendTransaction({
                    to: ROUTER_ADDRESS,
                    data: data,
                    gasLimit: gasLimit
                });

                console.log(formatLog(wallet, `✅ Transaction Hash: ${NETWORKS.SONEIUM.EXPLORER}${transaction.hash}`, 'wait'));
                await transaction.wait();
                console.log(formatLog(wallet, `🎉 Swap ${tokenSymbol} to ETH successful!`, 'success'));
                return true;
            } catch (error) {
                console.error(formatLog(wallet, `❌ Error swapping tokens to ETH: ${error.message}`, 'error'));
                throw error; // Throw error agar withRetry bisa menangani retry
            }
        }, wallet, 3, 10000);
    }

    // Tambahkan konstanta untuk delay
    const DELAY_RANGE = {
        MIN: 5000, // 30 detik
        MAX: 12000 // 120 detik
    };

    // Modifikasi fungsi customDelay
    async function getRandomDelay() {
        return Helper.random(DELAY_RANGE.MIN, DELAY_RANGE.MAX);
    }

    async function customDelay(wallet, message = 'Waiting') {
        const delay = await getRandomDelay();
        const seconds = Math.floor(delay / 1000);
        console.log(formatLog(wallet, `${message} ${seconds} seconds...`, 'wait'));
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Modifikasi konstanta untuk cycle delay (dalam milidetik)
    const CYCLE_DELAY_RANGE = {
        MIN: 5760000,  // 5760 detik = 96 menit
        MAX: 17280000  // 17280 detik = 288 menit
    };

    // Tambahkan konstanta untuk bridge delay
    const BRIDGE_DELAY_RANGE = {
        MIN: 5000,  // 30 detik
        MAX: 12000   // 60 detik
    };

    // Fungsi delay khusus untuk bridge
    async function bridgeDelay(wallet, message = 'Waiting') {
        const delay = Helper.random(BRIDGE_DELAY_RANGE.MIN, BRIDGE_DELAY_RANGE.MAX);
        const seconds = Math.floor(delay / 1000);
        console.log(formatLog(wallet, `${message} ${seconds} seconds...`, 'wait'));
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    async function processWallet(wallet, action, index) {
        return await withRetry(async () => {
            try {
                if (action === "swap") {
                    console.log(formatLog(wallet, `\n🎉 Memulai swap untuk Wallet ${index + 1}: ${wallet.address}`, 'info'));

                // Tambahkan delay awal
                await customDelay(wallet, '⏳ Menunggu sebelum memulai proses swap...');

                // Setup kontrak token
                const usdcContract = new ethers.Contract(
                    USDC_ADDRESS,
                    ["function balanceOf(address) view returns (uint256)"],
                    wallet
                );
                
                const soneContract = new ethers.Contract(
                    SONE_ADDRESS,
                    ["function balanceOf(address) view returns (uint256)"],
                    wallet
                );
                
                const soeContract = new ethers.Contract(
                    SOE_ADDRESS,
                    ["function balanceOf(address) view returns (uint256)"],
                    wallet
                );

                console.log(formatLog(wallet, `\n🎉=== Memulai Swap Cycle untuk Wallet ${index + 1} ===`, 'info'));
                            
                // Tambahkan delay sebelum swap cycle
                await customDelay(wallet, '⏳ Menunggu sebelum memulai swap cycle...');

                // Generate urutan transaksi acak
                let transactions = [];
                for (let i = 0; i < 5; i++) {
                    const randomType = Math.floor(Math.random() * 6);
                    switch (randomType) {
                        case 0: transactions.push({ from: 'ETH', to: 'SONE' }); break;
                        case 1: transactions.push({ from: 'ETH', to: 'SOE' }); break;
                        case 2: transactions.push({ from: 'ETH', to: 'USDC' }); break;
                        case 3: transactions.push({ from: 'SONE', to: 'ETH' }); break;
                        case 4: transactions.push({ from: 'SOE', to: 'ETH' }); break;
                        case 5: transactions.push({ from: 'USDC', to: 'ETH' }); break;
                    }
                }

                console.log(formatLog(wallet, "\n📋 Transaksi yang direncanakan untuk cycle ini:", 'info'));
                transactions.forEach((tx, index) => {
                    console.log(formatLog(wallet, `${index + 1}. 💱 ${tx.from} → ${tx.to}`, 'info'));
                });

                // Eksekusi setiap transaksi
                for (let i = 0; i < transactions.length; i++) {
                    // Cek saldo
                    const ethBalance = await wallet.provider.getBalance(wallet.address);
                    const usdcBalance = await usdcContract.balanceOf(wallet.address);
                    const soneBalance = await soneContract.balanceOf(wallet.address);
                    const soeBalance = await soeContract.balanceOf(wallet.address);
                                
                    console.log(formatLog(wallet, `\nTransaksi ${i + 1} dari 5`, 'info'));
                    console.log(formatLog(wallet, `💰 Saldo Saat Ini:`, 'info'));
                    console.log(formatLog(wallet, `⚡ ETH: ${ethers.formatEther(ethBalance)} ETH`, 'info'));
                    console.log(formatLog(wallet, `💵 USDC.e: ${ethers.formatUnits(usdcBalance, 6)} USDC.e`, 'info'));
                    console.log(formatLog(wallet, `🪙 SONE: ${ethers.formatEther(soneBalance)} SONE`, 'info'));
                    console.log(formatLog(wallet, `⭐ SOE: ${ethers.formatEther(soeBalance)} SOE`, 'info'));

                    const txDetail = transactions[i];
                    const percentage = Math.floor(Math.random() * (5 - 1 + 1)) + 1; // 1-5%

                    if (txDetail.from === 'ETH') {
                        const amountIn = (ethBalance * BigInt(percentage)) / 100n;
                        switch (txDetail.to) {
                            case 'SONE':
                                await swapETHtoToken(wallet, SONE_ADDRESS, amountIn);
                                break;
                            case 'SOE':
                                await swapETHtoToken(wallet, SOE_ADDRESS, amountIn);
                                break;
                            case 'USDC':
                                await swapETHtoToken(wallet, USDC_ADDRESS, amountIn);
                                break;
                        }
                    } else {
                        // Tangani swap token ke ETH
                        switch (txDetail.from) {
                            case 'SONE':
                                if (soneBalance > 0n) {
                                    await swapTokensForETH(wallet, SONE_ADDRESS, soneBalance);
                                } else {
                                    console.log(formatLog(wallet, `❌ Tidak ada saldo SONE, swap ETH ke SONE sebagai gantinya...`, 'warning'));
                                    const amountIn = (ethBalance * BigInt(percentage)) / 100n;
                                    await swapETHtoToken(wallet, SONE_ADDRESS, amountIn);
                                }
                                break;
                            case 'SOE':
                                if (soeBalance > 0n) {
                                    await swapTokensForETH(wallet, SOE_ADDRESS, soeBalance);
                                } else {
                                    console.log(formatLog(wallet, `❌ Tidak ada saldo SOE, swap ETH ke SOE sebagai gantinya...`, 'warning'));
                                    const amountIn = (ethBalance * BigInt(percentage)) / 100n;
                                    await swapETHtoToken(wallet, SOE_ADDRESS, amountIn);
                                }
                                break;
                            case 'USDC':
                                if (usdcBalance > 0n) {
                                    await swapTokensForETH(wallet, USDC_ADDRESS, usdcBalance, 6);
                                } else {
                                    console.log(formatLog(wallet, `❌ Tidak ada saldo USDC.e, swap ETH ke USDC.e sebagai gantinya...`, 'warning'));
                                    const amountIn = (ethBalance * BigInt(percentage)) / 100n;
                                    await swapETHtoToken(wallet, USDC_ADDRESS, amountIn);
                                }
                                break;
                        }
                    }

                    // Delay acak antara transaksi (5-15 detik)
                    if (i < transactions.length - 1) {
                        await customDelay(wallet, '⏳ Menunggu sebelum transaksi berikutnya...');
                    }
                }

                return true;
            } else if (action === "deploy") {
                console.log(formatLog(wallet, `\n🎉 Starting deploy for Wallet ${index + 1}: ${wallet.address}`, 'info'));
                // Implementasi logika deploy
            } else if (action === "balance") {
                console.log(formatLog(wallet, `\n🎉 Checking balance for Wallet ${index + 1}: ${wallet.address}`, 'info'));
                // Implementasi logika balance
            }
            // Tambahkan else if untuk aksi lain jika diperlukan
        } catch (error) {
            console.error(formatLog(wallet, `❌ Fatal error: ${error.message}`, 'error'));
            throw error;
        }
    }, wallet, 5, 15000);
    }

    async function processBridge(wallet, index, amount) {
        try {
            console.log(formatLog(wallet, `\n🎉 Starting bridge for Wallet ${index + 1}: ${wallet.address}`, 'info'));
            
            // Setup Sepolia provider
            const sepoliaProvider = new ethers.JsonRpcProvider(
                NETWORKS.SEPOLIA.RPC,
                {
                    chainId: NETWORKS.SEPOLIA.CHAINID,
                    name: 'sepolia'
                }
            );
            const sepoliaWallet = new ethers.Wallet(wallet.privateKey, sepoliaProvider);
            
            await bridgeToSoneium(sepoliaWallet, amount);
        } catch (error) {
            console.error(formatLog(wallet, `❌ Bridge error: ${error.message}`, 'error'));
            return false;
        }
    }

    // Fungsi Sake Finance
    async function processSakeFinance(wallet, action) {
        try {
            await customDelay(wallet, '⏳ Waiting before starting Sake Finance action...');
            
            console.log(formatLog(wallet, `\n🎉 Starting Sake Finance ${action}...`, 'info'));
            
            switch(action) {
                case "claim":
                    for (const tokenType of ["ASTR", "USDC", "WBTC", "SOLVBTC", "SOLVBTCBBN", "VASTR", "STONE"]) {
                        await claimFaucet(wallet, tokenType).catch(error => {
                            console.log(formatLog(wallet, `❌ Failed to claim ${tokenType}: ${error.message}`, 'warning'));
                        });
                        await customDelay(wallet, '⏳ Waiting before next token claim...');
                    }
                    break;
                    
                case "supply":
                case "withdraw":
                    for (const token of Object.values(POOL_CONFIG.TOKENS)) {
                        const actionFn = {
                            'supply': supplyToken,
                            'withdraw': withdrawToken
                        }[action];
                        
                        await actionFn(wallet, token).catch(error => {
                            console.log(formatLog(wallet, `❌ Failed to ${action} ${token.SYMBOL}: ${error.message}`, 'warning'));
                        });
                        await customDelay(wallet, `⏳ Waiting before next token ${action}...`);
                    }
                    break;

                case "borrow":
                case "repay":
                    for (const token of Object.values(POOL_CONFIG.TOKENS)) {
                        if (token.SYMBOL === 'USDC' || token.ADDRESS.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
                            console.log(formatLog(wallet, `ℹ️ Skipping ${action} for USDC.e token DEV TERLALU MALAS MEMBUAT CONTRACT, MENDING JOIN DISCORD https://discord.gg/aethereal`, 'info'));
                            continue;
                        }
                        
                        const actionFn = {
                            'borrow': borrowToken,
                            'repay': repayToken
                        }[action];
                        
                        await actionFn(wallet, token).catch(error => {
                            console.log(formatLog(wallet, `❌ Failed to ${action} ${token.SYMBOL}: ${error.message}`, 'warning'));
                        });
                        await customDelay(wallet, `⏳ Waiting before next token ${action}...`);
                    }
                    break;
            }
            return true;
        } catch (error) {
            console.log(formatLog(wallet, `❌ Error in Sake Finance ${action}: ${error.message}`, 'error'));
            return false;
        }
    }

    // Fungsi untuk menjalankan semua task Sake Finance
    async function runAllSakeTasks(wallet) {
        try {
            console.log(formatLog(wallet, `🚀 Starting all Sake Finance tasks...`, 'info'));
            
            // Claim all faucets
            console.log(formatLog(wallet, `🎁 Starting Faucet Claims...`, 'info'));
            await processSakeFinance(wallet, "claim");
            
            // Supply all tokens
            console.log(formatLog(wallet, `📥 Starting Supply process...`, 'info'));
            await processSakeFinance(wallet, "supply");
            
            // Borrow all tokens
            console.log(formatLog(wallet, `💰 Starting Borrow process...`, 'info'));
            await processSakeFinance(wallet, "borrow");
            
            // Repay all tokens
            console.log(formatLog(wallet, `💸 Starting Repay process...`, 'info'));
            await processSakeFinance(wallet, "repay");
            
            // Withdraw all tokens
            console.log(formatLog(wallet, `📤 Starting Withdraw process...`, 'info'));
            await processSakeFinance(wallet, "withdraw");
            
            console.log(formatLog(wallet, `✅ All Sake Finance tasks completed!`, 'success'));
            return true;
        } catch (error) {
            console.error(formatLog(wallet, `❌ Error in Sake Finance tasks: ${error.message}`, 'error'));
            return false;
        }
    }

    async function main() {
        try {
            console.log("\n" + colors.cyan + "Soneium Multi-Tool" + colors.reset);
            console.log(colors.magenta + "By : Aethereal" + colors.reset);
            console.log(colors.blue + "Follow On : https://x.com/aethereal_co" + colors.reset);
            console.log(colors.blue + "Join Discord : https://discord.gg/aethereal" + colors.reset);
            console.log();
            Helper.showSkelLogo();
            console.log();

            if (privateKey.length === 0) {
                throw Error("Please input your accounts in accounts.js file");
            }

            // Setup wallets
            const provider = await withRetry(async () => {
                const provider = new ethers.JsonRpcProvider(NETWORKS.SONEIUM.RPC);
                await provider.getNetwork();
                return provider;
            }, { address: "SETUP" }, 5, 10000);

            const wallets = privateKey.map(pk => new ethers.Wallet(pk, provider));
            console.log(colors.cyan + `\n📱 Loaded ${wallets.length} wallets:` + colors.reset);
            wallets.forEach((wallet) => {
                console.log(formatLog(wallet, `✅ Loaded`));
            });

            while (true) {
                console.log("\n" + colors.cyan + "=== Soneium Multi-Tool Menu ===" + colors.reset);
                console.log(colors.yellow + "1. 🌉 Bridge ETH from Sepolia" + colors.reset);
                console.log(colors.yellow + "2. 🏦 Sake Finance" + colors.reset);
                console.log(colors.yellow + "3. 💱 Swap Tokens" + colors.reset);
                console.log(colors.yellow + "4. 📝 Deploy Token Contract" + colors.reset);
                console.log(colors.yellow + "5. 🚪 Exit" + colors.reset);

                const choice = await input.text("\nSelect option (1-5): ");

                if (choice === "5") { 
                    console.log(colors.green + "\n🎉 Exiting..." + colors.reset);
                    return;
                }

                if (!["1", "2", "3", "4"].includes(choice)) {
                    console.log(colors.red + "\n❌ Invalid option!" + colors.reset);
                    continue;
                }

                if (choice === "1") {
                    const amount = await input.text("Enter amount to bridge (ETH): ");
                    if (isNaN(amount) || parseFloat(amount) <= 0) {
                        console.log(colors.red + "\n❌ Invalid amount!" + colors.reset);
                        continue;
                    }
                    
                    console.log(colors.cyan + `\nProcessing ${wallets.length} wallets sequentially...` + colors.reset);
                    
                    // Proses bridge satu per satu
                    for (let i = 0; i < wallets.length; i++) {
                        console.log(colors.cyan + `\nProcessing wallet ${i + 1} of ${wallets.length}` + colors.reset);
                        await processBridge(wallets[i], i, amount);
                        
                        // Tambahkan delay antar setiap wallet kecuali untuk wallet terakhir
                        if (i < wallets.length - 1) {
                            await bridgeDelay(wallets[i], 'Waiting before processing next wallet...');
                        }
                    }
                    
                    console.log(colors.green + `\nCompleted processing all wallets` + colors.reset);
                    continue;
                }

                if (choice === "2") {
                    console.log("\n" + colors.cyan + "Select action for Sake Finance:" + colors.reset);
                    console.log(colors.yellow + "1. Claim All Faucets" + colors.reset);
                    console.log(colors.yellow + "2. Supply All Tokens" + colors.reset);
                    console.log(colors.yellow + "3. Borrow All Tokens" + colors.reset);
                    console.log(colors.yellow + "4. Repay All Tokens" + colors.reset);
                    console.log(colors.yellow + "5. Withdraw All Tokens" + colors.reset);
                    console.log(colors.yellow + "6. Run All Tasks" + colors.reset);
                    console.log(colors.yellow + "7. Back to Main Menu" + colors.reset);

                    const sakeChoice = await input.text("\nEnter action (1-7): ");
                    
                    if (sakeChoice === "7") continue;

                    if (sakeChoice === "6") {
                        console.log(colors.cyan + "\nRunning all tasks sequentially..." + colors.reset);
                        for (const wallet of wallets) {
                            console.log(formatLog(wallet, "Starting all Sake Finance tasks...", 'info'));
                            for (const action of ["claim", "supply", "borrow", "repay", "withdraw"]) {
                                await processSakeFinance(wallet, action);
                                if (action !== "withdraw") { // Skip delay after last action
                                    await customDelay(wallet, '⏳ Waiting before next task...');
                                }
                            }
                            console.log(formatLog(wallet, "✅ All tasks completed for this wallet!", 'success'));
                        }
                        continue;
                    }

                    let actionType;
                    switch(sakeChoice) {
                        case "1": actionType = "claim"; break;
                        case "2": actionType = "supply"; break;
                        case "3": actionType = "borrow"; break;
                        case "4": actionType = "repay"; break;
                        case "5": actionType = "withdraw"; break;
                        default:
                            console.log(colors.red + "\n❌ Invalid action!" + colors.reset);
                            continue;
                    }

                    console.log(colors.cyan + `\nProcessing ${wallets.length} wallets...` + colors.reset);
                    for (const wallet of wallets) {
                        await processSakeFinance(wallet, actionType);
                    }
                    console.log(colors.green + `\nCompleted processing all wallets` + colors.reset);
                    continue;
                }

                // Handle menu utama lainnya
                let action;
                switch (choice) {
                    case "3":
                        while (true) { // Infinite loop untuk cycle swap
                            console.log(colors.cyan + "\n=== Memulai Cycle Swap Baru ===" + colors.reset);
                            
                            // Proses semua wallet
                            for (let i = 0; i < wallets.length; i++) {
                                await processWallet(wallets[i], "swap", i);
                            }
                            
                            console.log(colors.green + "\n✅ Cycle selesai untuk semua wallet" + colors.reset);
                            
                            // Delay sebelum cycle berikutnya
                            const cycleDelay = Helper.random(CYCLE_DELAY_RANGE.MIN, CYCLE_DELAY_RANGE.MAX);
                            const minutes = Math.floor(cycleDelay / 60000);
                            console.log(colors.yellow + `\n⏳ Menunggu ${minutes} menit sebelum memulai cycle baru...` + colors.reset);
                            await new Promise(resolve => setTimeout(resolve, cycleDelay));
                        }
                        break;
                    case "4":
                        action = "deploy";
                        console.log(colors.cyan + `\nProcessing ${wallets.length} wallets sequentially...` + colors.reset);
                        
                        // Tanya detail token hanya sekali di awal
                        const name = await input.text("Enter token name: ");
                        const symbol = await input.text("Enter token symbol: ");
                        const initialSupply = await input.text("Enter initial supply: ");
                        
                        console.log(colors.cyan + "\nProcessing deploy..." + colors.reset);
                        
                        // Compile contract sekali di awal
                        console.log(formatLog(wallets[0], "Compiling Contract...", 'info'));
                        const { abi, bytecode } = await compileContract(wallets[0]);
                        
                        // Proses wallet satu per satu dengan data token yang sama
                        for (let i = 0; i < wallets.length; i++) {
                            try {
                                console.log(formatLog(wallets[i], `Processing deploy for Wallet ${wallets[i].address.slice(-4)}...`, 'info'));
                                
                                // Deploy contract dengan data yang sama
                                console.log(formatLog(wallets[i], `Deploying Contract...`, 'info'));
                                const factory = new ethers.ContractFactory(abi, bytecode, wallets[i]);
                                const initialSupplyBigNumber = ethers.parseUnits(initialSupply, 18);

                                const contract = await factory.deploy(name, symbol, initialSupplyBigNumber);
                                console.log(formatLog(wallets[i], `Contract Deployment Tx Sent ${NETWORKS.SONEIUM.EXPLORER}tx/${contract.deploymentTransaction().hash}`, 'wait'));
                                console.log(formatLog(wallets[i], `Waiting for Block Confirmation...`, 'wait'));
                                
                                const result = await contract.deploymentTransaction().wait();
                                console.log(formatLog(wallets[i], `Contract Deployed Successfully!`, 'success'));
                                console.log(formatLog(wallets[i], `Contract Hash: ${NETWORKS.SONEIUM.EXPLORER}tx/${result.hash}`, 'info'));
                                console.log(formatLog(wallets[i], `Contract Address: ${result.contractAddress}`, 'info'));
                                
                                // Delay antar wallet
                                if (i < wallets.length - 1) {
                                    await customDelay(wallets[i], '⏳ Waiting before next deployment...');
                                }
                            } catch (error) {
                                console.error(formatLog(wallets[i], `❌ Deployment Failed: ${error.message}`, 'error'));
                            }
                        }
                        console.log(colors.green + "\nAll deployments completed!" + colors.reset);
                        continue; // Kembali ke menu utama
                        break;
                    case "5":
                        action = "balance";
                        break;
                    case "6": 
                        console.log(colors.green + "\n🎉 Exiting..." + colors.reset);
                        return;
                    default:
                        console.log(colors.red + "\n❌ Invalid option!" + colors.reset);
                        continue;
                }

                // Proses untuk menu utama
                console.log(colors.cyan + `\nProcessing ${wallets.length} wallets...` + colors.reset);
                await Promise.all(wallets.map((wallet, index) => processWallet(wallet, action, index)));
                console.log(colors.green + `\nCompleted processing all wallets` + colors.reset);
            }

        } catch (error) {
            console.error("Error during execution:", error.message);
        }
    }

    // Jalankan main function
    main();
    
} catch (error) {
    console.error('\n❌ Error during configuration:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}

async function getTokenBalance(wallet, token) {
    return await withRetry(async () => {
    try {
        const tokenContract = new ethers.Contract(
            token.ADDRESS,
            ["function balanceOf(address) view returns (uint256)"],
            wallet
        );
        return await tokenContract.balanceOf(wallet.address);
    } catch (error) {
        console.error(`❌ Error getting ${token.SYMBOL} balance: ${error.message}`);
        throw error;
    }
    }, wallet, 3, 10000);
}

async function repayToken(wallet, token) {
    try {
        const balance = await getTokenBalance(wallet, token);
        if (balance <= 0n) {
            console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] No ${token.SYMBOL} balance to repay`);
            return false;
        }

        // Random percentage between 1-3%
        const percentage = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
        const repayAmount = (balance * BigInt(percentage)) / 100n;

        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Current ${token.SYMBOL} balance: ${ethers.formatUnits(balance, token.DECIMALS)}`);
        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Will repay ${ethers.formatUnits(repayAmount, token.DECIMALS)} ${token.SYMBOL} (${percentage}%)`);

        // Approve token if needed
        const tokenContract = new ethers.Contract(
            token.ADDRESS,
            ["function approve(address spender, uint256 amount) returns (bool)"],
            wallet
        );

        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Approving token...`);
        const approveTx = await tokenContract.approve(POOL_CONFIG.L2POOL, ethers.MaxUint256);
        await approveTx.wait();

        const poolContract = new ethers.Contract(
            POOL_CONFIG.L2POOL,
            ["function repay(address asset, uint256 amount, uint256 rateMode, address onBehalfOf) external returns (uint256)"],
            wallet
        );

        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Repaying to pool...`);
        const tx = await poolContract.repay(
            token.ADDRESS,
            repayAmount,
            2,
            wallet.address,
            { gasLimit: 0x11e460 }
        );

        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Transaction Hash: ${NETWORKS.SONEIUM.EXPLORER}${tx.hash}`);
        await tx.wait();
        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Successfully repaid ${token.SYMBOL}!`);
        return true;
    } catch (error) {
        console.error(`❌ Error repaying ${token.SYMBOL}: ${error.message}`);
        return false;
    }
}

async function withdrawToken(wallet, token) {
    try {
        const balance = await getTokenBalance(wallet, token);
        if (balance <= 0n) {
            console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] No ${token.SYMBOL} balance to withdraw`);
            return false;
        }

        // Random percentage between 40-60%
        const percentage = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
        const withdrawAmount = (balance * BigInt(percentage)) / 100n;

        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Current ${token.SYMBOL} balance: ${ethers.formatUnits(balance, token.DECIMALS)}`);
        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Will withdraw ${ethers.formatUnits(withdrawAmount, token.DECIMALS)} ${token.SYMBOL} (${percentage}%)`);

        const poolContract = new ethers.Contract(
            POOL_CONFIG.L2POOL,
            ["function withdraw(address asset, uint256 amount, address to) external returns (uint256)"],
            wallet
        );

        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Withdrawing from pool...`);
        const tx = await poolContract.withdraw(
            token.ADDRESS,
            withdrawAmount,
            wallet.address,
            { gasLimit: 0x11e460 }
        );

        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Transaction Hash: ${NETWORKS.SONEIUM.EXPLORER}${tx.hash}`);
        await tx.wait();
        console.log(`[${new Date().toISOString().replace('T', ' ').slice(0, 19)}] [Account 1 | ${wallet.address.slice(-4)}] Successfully withdrawn ${token.SYMBOL}!`);
        return true;
    } catch (error) {
        console.error(`❌ Error withdrawing ${token.SYMBOL}: ${error.message}`);
        return false;
    }
}

import path from "path";
import fs from "fs";
import solc from "solc";

// Definisikan basePath relatif terhadap current working directory
const basePath = "./src/core/deployer";

async function compileContract(wallet) {
    try {
        const contractPath = path.join(process.cwd(), basePath, "YourToken.sol");
        
        // Log untuk debugging
        console.log(`Trying to read contract from: ${contractPath}`);
        
        if (!fs.existsSync(contractPath)) {
            throw new Error(`Contract file not found at: ${contractPath}`);
        }

        const contractSource = fs.readFileSync(contractPath, "utf8");

        const input = {
            language: "Solidity",
            sources: {
                "YourToken.sol": {
                    content: contractSource,
                },
            },
            settings: {
                outputSelection: {
                    "*": {
                        "*": ["abi", "evm.bytecode"],
                    },
                },
            },
        };

        const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
        
        if (compiledContract.errors) {
            throw new Error(`Compilation errors: ${JSON.stringify(compiledContract.errors)}`);
        }

        const contract = compiledContract.contracts["YourToken.sol"];
        const contractName = Object.keys(contract)[0];
        const abi = contract[contractName].abi;
        const bytecode = contract[contractName].evm.bytecode.object;

        console.log(`Contract ${contractName} compiled successfully!`);
        return { abi, bytecode };
    } catch (error) {
        console.error(`❌ Compilation failed: ${error.message}`);
        throw error;
    }
}
