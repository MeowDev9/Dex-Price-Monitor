import { UniswapHelper } from './uniswapHelper';
import { config, TOKEN_PAIRS } from './config';

interface PriceData {
  price: number;
  timestamp: number;
  change24h?: number;
}

interface TokenPairData {
  name: string;
  currentPrice: number;
  previousPrice: number;
  priceHistory: PriceData[];
  alerts: string[];
}

export class PriceMonitor {
  private uniswapHelper: UniswapHelper;
  private monitoringData: Map<string, TokenPairData>;
  private isRunning: boolean = false;

  constructor(rpcUrl: string) {
    this.uniswapHelper = new UniswapHelper(rpcUrl);
    this.monitoringData = new Map();
    
    // Initialize monitoring data for each pair
    TOKEN_PAIRS.forEach(pair => {
      this.monitoringData.set(pair.name, {
        name: pair.name,
        currentPrice: 0,
        previousPrice: 0,
        priceHistory: [],
        alerts: [],
      });
    });
  }

  /**
   * Start monitoring prices
   */
  async start(): Promise<void> {
    console.log(' Starting DEX Price Monitor...');
    console.log(`Monitoring ${TOKEN_PAIRS.length} token pairs`);
    console.log(`  Check interval: ${config.priceCheckInterval / 1000}s`);
    console.log(` Alert threshold: ${config.priceChangeThreshold}%\n`);

    this.isRunning = true;

    // Initial price fetch
    await this.checkAllPrices();

    // Start monitoring loop
    setInterval(async () => {
      if (this.isRunning) {
        await this.checkAllPrices();
      }
    }, config.priceCheckInterval);
  }

 // Stop monitoring prices
  stop(): void {
    console.log('\n Stopping price monitor...');
    this.isRunning = false;
  }

  // Check prices for all token pairs
  private async checkAllPrices(): Promise<void> {
    const timestamp = Date.now();

    for (const pair of TOKEN_PAIRS) {
      try {
        // Fetch current price
        const price = await this.uniswapHelper.getPriceWithRetry(
          pair.token0,
          pair.token1,
          pair.decimals0,
          pair.decimals1
        );

        // Update monitoring data
        this.updatePriceData(pair.name, price, timestamp);

        // Check for alerts
        this.checkPriceAlerts(pair.name);

      } catch (error) {
        console.error(`Error fetching price for ${pair.name}:`, error);
      }
    }

    // Display current status
    this.displayStatus();
  }

 // Update price data for a token pair
  private updatePriceData(
    pairName: string,
    newPrice: number,
    timestamp: number
  ): void {
    const data = this.monitoringData.get(pairName);
    if (!data) return;

    // Update previous price
    if (data.currentPrice !== 0) {
      data.previousPrice = data.currentPrice;
    }

    // Update current price
    data.currentPrice = newPrice;

    // Add to price history
    data.priceHistory.push({
      price: newPrice,
      timestamp,
    });

    // Keep only last 100 data points
    if (data.priceHistory.length > 100) {
      data.priceHistory.shift();
    }

    // Calculate 24h change (simplified - using first vs last in history)
    if (data.priceHistory.length > 10) {
      const oldPrice = data.priceHistory[0].price;
      const change = ((newPrice - oldPrice) / oldPrice) * 100;
      data.priceHistory[data.priceHistory.length - 1].change24h = change;
    }
  }

  // Check for price change alerts
  private checkPriceAlerts(pairName: string): void {
    const data = this.monitoringData.get(pairName);
    if (!data || data.previousPrice === 0) return;

    const priceChange = 
      ((data.currentPrice - data.previousPrice) / data.previousPrice) * 100;

    // Check if change exceeds threshold
    if (Math.abs(priceChange) >= config.priceChangeThreshold) {
      const direction = priceChange > 0 ? ' UP' : ' DOWN';
      
      // Format price for alerts
      let formattedPrice: string;
      if (data.currentPrice >= 1000) {
        formattedPrice = data.currentPrice.toFixed(2);
      } else if (data.currentPrice >= 1) {
        formattedPrice = data.currentPrice.toFixed(6);
      } else if (data.currentPrice >= 0.001) {
        formattedPrice = data.currentPrice.toFixed(8);
      } else {
        formattedPrice = data.currentPrice.toExponential(3);
      }
      
      const alert = `${direction} ${Math.abs(priceChange).toFixed(2)}% - ${pairName}: $${formattedPrice}`;
      
      data.alerts.push(alert);
      console.log(`\n ALERT: ${alert}\n`);
      
      // Keep only last 10 alerts
      if (data.alerts.length > 10) {
        data.alerts.shift();
      }
    }
  }

  // Display current monitoring status
  private displayStatus(): void {
    console.clear();
    console.log('DEX PRICE MONITOR - LIVE STATUS');

    const now = new Date().toLocaleTimeString();
    console.log(` Last Update: ${now}\n`);

    // Display each pair
    this.monitoringData.forEach((data, pairName) => {
      if (data.currentPrice === 0) return;

      const priceChange = data.previousPrice !== 0
        ? ((data.currentPrice - data.previousPrice) / data.previousPrice) * 100
        : 0;

      const changeSymbol = priceChange > 0 ? '▲' : priceChange < 0 ? '▼' : '▬';
      const changeColor = priceChange > 0 ? '🟢' : priceChange < 0 ? '🔴' : '⚪';

      // Format price based on its magnitude for better readability
      let formattedPrice: string;
      if (data.currentPrice >= 1000) {
        formattedPrice = data.currentPrice.toFixed(2);
      } else if (data.currentPrice >= 1) {
        formattedPrice = data.currentPrice.toFixed(6);
      } else if (data.currentPrice >= 0.001) {
        formattedPrice = data.currentPrice.toFixed(8);
      } else {
        formattedPrice = data.currentPrice.toExponential(3);
      }

      console.log(`${changeColor} ${pairName.padEnd(15)} $${formattedPrice.padEnd(12)} ${changeSymbol} ${priceChange.toFixed(2)}%`);
    });

    // Display recent alerts
    console.log('\n───────────────────────────────────────────────────────');
    console.log('Recent Alerts:');
    
    let alertCount = 0;
    this.monitoringData.forEach(data => {
      data.alerts.slice(-3).forEach(alert => {
        console.log(`  ${alert}`);
        alertCount++;
      });
    });

    if (alertCount === 0) {
      console.log('  No alerts yet');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('Press Ctrl+C to stop monitoring');
  }

  /**
   * Get monitoring statistics
   */
  getStats(): any {
    const stats: any = {};
    
    this.monitoringData.forEach((data, pairName) => {
      const history = data.priceHistory;
      if (history.length === 0) return;

      const prices = history.map(h => h.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      stats[pairName] = {
        current: data.currentPrice,
        min: minPrice,
        max: maxPrice,
        average: avgPrice,
        volatility: ((maxPrice - minPrice) / avgPrice) * 100,
        dataPoints: history.length,
        alerts: data.alerts.length,
      };
    });

    return stats;
  }
}