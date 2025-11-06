import { PriceMonitor } from './priceMonitor';
import { config } from './config';

async function main() {
  // Validate configuration
  if (!config.rpcUrl) {
    console.error('❌ Error: RPC_URL not set in .env file');
    console.log('Please create a .env file with your Alchemy/Infura RPC URL');
    process.exit(1);
  }

  // Create and start monitor
  const monitor = new PriceMonitor(config.rpcUrl);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    monitor.stop();
    
    // Display final stats
    console.log('\n📊 Final Statistics:\n');
    const stats = monitor.getStats();
    
    Object.entries(stats).forEach(([pair, data]: [string, any]) => {
      console.log(`${pair}:`);
      console.log(`  Current: $${data.current.toFixed(6)}`);
      console.log(`  Min:     $${data.min.toFixed(6)}`);
      console.log(`  Max:     $${data.max.toFixed(6)}`);
      console.log(`  Average: $${data.average.toFixed(6)}`);
      console.log(`  Volatility: ${data.volatility.toFixed(2)}%`);
      console.log(`  Alerts: ${data.alerts}`);
      console.log('');
    });

    console.log('👋 Goodbye!');
    process.exit(0);
  });

  // Start monitoring
  await monitor.start();
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});