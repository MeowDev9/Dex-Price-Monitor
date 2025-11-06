import { ethers } from 'ethers';

// Uniswap V2 Pair ABI (minimal - only what we need)
const PAIR_ABI = [
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
];

// Uniswap V2 Factory ABI
const FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
];

const UNISWAP_V2_FACTORY = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

export class UniswapHelper {
private provider: ethers.JsonRpcProvider;

constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

 
  async getPairAddress(token0: string, token1: string): Promise<string> {
    const factory = new ethers.Contract(
      UNISWAP_V2_FACTORY,
      FACTORY_ABI,
      this.provider
    );

    const pairAddress = await factory.getPair(token0, token1);
    
    if (pairAddress === ethers.ZeroAddress
) {
      throw new Error(`No pair found for ${token0}/${token1}`);
    }

    return pairAddress;
  }

 
async getPrice(
    token0: string,
    token1: string,
    decimals0: number,
    decimals1: number
): Promise<number> {
    try {
        // Get pair address
        const pairAddress = await this.getPairAddress(token0, token1);
        
        // Create pair contract instance
        const pairContract = new ethers.Contract(
            pairAddress,
            PAIR_ABI,
            this.provider
        );

        // Get the actual token addresses to determine order
        const pairToken0 = await pairContract.token0();
        const pairToken1 = await pairContract.token1();
        
        // Fetch reserves
        const reserves = await pairContract.getReserves();
        let reserve0 = reserves.reserve0;
        let reserve1 = reserves.reserve1;
        
        // Determine which reserve corresponds to which input token
        let token0Reserve, token1Reserve, token0Decimals, token1Decimals;
        
        if (pairToken0.toLowerCase() === token0.toLowerCase()) {
            // Our token0 matches pair's token0
            token0Reserve = reserve0;
            token1Reserve = reserve1;
            token0Decimals = decimals0;
            token1Decimals = decimals1;
        } else {
            // Our token0 matches pair's token1, so swap reserves AND decimals
            token0Reserve = reserve1;
            token1Reserve = reserve0;
            token0Decimals = decimals0;  // Keep original token0 decimals
            token1Decimals = decimals1;  // Keep original token1 decimals
        }

        // Convert reserves to human readable amounts
        const token0Amount = parseFloat(ethers.formatUnits(token0Reserve, token0Decimals));
        const token1Amount = parseFloat(ethers.formatUnits(token1Reserve, token1Decimals));
        
        // Calculate price: token1 per token0 (how much token1 you get for 1 token0)
        // For ETH/USDC this would be USDC per ETH
        const price = token1Amount / token0Amount;

        return price;
    } catch (error) {
        console.error('Error fetching price:', error);
        throw error;
    }
}

  async getPriceWithRetry(
    token0: string,
    token1: string,
    decimals0: number,
    decimals1: number,
    maxRetries: number = 3
  ): Promise<number> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.getPrice(token0, token1, decimals0, decimals1);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        console.log(`Retry ${i + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error('Failed after retries');
  }
}