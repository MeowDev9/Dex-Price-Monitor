import dotenv from 'dotenv';
dotenv.config();

export const config = {
  rpcUrl: process.env.RPC_URL || '',
  priceCheckInterval: parseInt(process.env.PRICE_CHECK_INTERVAL || '15000'),
  priceChangeThreshold: parseFloat(process.env.PRICE_CHANGE_THRESHOLD || '2.0'),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
};

// Uniswap V2 Router address
export const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

// Token pairs to monitor
export const TOKEN_PAIRS = [
  {
    name: 'ETH/USDC',
    token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    decimals0: 18,
    decimals1: 6,
  },
  {
    name: 'USDC/USDT',
    token0: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    token1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    decimals0: 6,
    decimals1: 6,
  },
];