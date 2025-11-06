DEX Price Monitor

A real-time price monitoring bot for Uniswap V2 with alerting and volatility tracking.

Features

Real-time price tracking from Uniswap V2

Automatic alerts for significant price changes

Historical price tracking and volatility analysis

Configurable monitoring intervals and thresholds

Support for multiple token pairs

Tech Stack

TypeScript

Ethers.js (Uniswap V2 integration)

Node.js

Installation
# Clone repository
git clone https://github.com/MeowDev9/dex-price-monitor.git
cd dex-price-monitor

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your RPC URL (Alchemy, Infura, etc.)

Configuration

Edit the .env file:

# Ethereum RPC URL (required)
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Price check interval in milliseconds (default: 15 seconds)
PRICE_CHECK_INTERVAL=15000

# Alert threshold percentage (default: 2%)
PRICE_CHANGE_THRESHOLD=2.0

Usage
# Start monitoring
npm start

# Or run via ts-node
npm run monitor

How It Works

Fetches reserves from Uniswap V2 pairs

Calculates prices from reserve ratios

Monitors prices at defined intervals

Triggers alerts when changes exceed thresholds

Stores history for volatility analysis

Default Monitored Pairs

ETH/USDC

USDC/USDT

To add more pairs, edit src/config.ts:

export const TOKEN_PAIRS = [
  {
    name: 'ETH/USDC',
    token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    decimals0: 18,
    decimals1: 6,
  },
];

Example Output
DEX PRICE MONITOR - LIVE STATUS
----------------------------------------------
Last Update: 3:45:23 PM

ETH/USDC        $2,245.34   ▲ 0.15%
USDC/USDT       $1.0001     ▬ 0.01%

Recent Alerts:
UP 2.34% - ETH/USDC: $2245.34
----------------------------------------------

Project Structure
dex-price-monitor/
├── src/
│   ├── index.ts           # Entry point
│   ├── priceMonitor.ts    # Monitoring logic
│   ├── uniswapHelper.ts   # Uniswap V2 integration
│   └── config.ts          # Configuration
├── .env.example
├── package.json
├── tsconfig.json
└── README.md

Future Enhancements

Telegram and Discord notifications

Uniswap V3 and multi-DEX support

Price chart generation

Database for historical data

Web dashboard

Arbitrage detection

Security

Do not commit .env files

Use environment variables for sensitive data

Adjust intervals to avoid RPC rate limits

License

MIT License

Author

Syed Hatim Bilal