
# dYdX v4 Client.js Compact Guide

This guide will walk you through setting up and using the `@dydxprotocol/v4-client-js` package to interact with the dYdX v4 protocol. By the end, you'll have a functioning application that can connect to the dYdX network, manage wallets, fetch market data, and execute trades.


## Project Setup
Let's start by creating a new TypeScript project using Bun:

```bash
mkdir dydx-client-app && cd dydx-client-app
bun init
```
This will generate a basic TypeScript project structure, including a `package.json` file and an `index.ts` entry point.

## Installing Dependencies

Now let's install the required dependencies:

```bash
bun add @dydxprotocol/v4-client-js
```

You also need additional dependencies for certain features:

```bash
bun add protobufjs long lodash
```

## Create an `index.ts` File

```typescript
import { 
  Network, 
  CompositeClient, 
  BECH32_PREFIX, 
  LocalWallet, 
  SubaccountInfo,
  OrderSide,
  OrderFlags,
  Order_TimeInForce
} from '@dydxprotocol/v4-client-js';
import Long from 'long';

// Example mnemonic - for demo purposes only
// In production, secure your mnemonic and never hardcode it
const EXAMPLE_MNEMONIC = "mirror actor skill push coach wait confirm orchard lunch mobile athlete gossip awake miracle matter bus reopen team ladder lazy list timber render wait";
const MAX_CLIENT_ID = 2 ** 32 - 1;

async function main() {
  try {
    //==========================================================================
    // 1. Connect to dYdX network
    //==========================================================================
    const network = Network.testnet();
    const client = await CompositeClient.connect(network);
    console.log('Connected to dYdX network');
    
    //==========================================================================
    // 2. Create wallet and subaccount
    //==========================================================================
    const wallet = await LocalWallet.fromMnemonic(EXAMPLE_MNEMONIC, BECH32_PREFIX);
    console.log('Wallet address:', wallet.address);
    
    const subaccount = new SubaccountInfo(wallet, 0);
    console.log('Subaccount created');
    
    //==========================================================================
    // 3. Get market data
    //==========================================================================
    
    // Get all available markets
    const marketsResponse = await client.indexerClient.markets.getPerpetualMarkets();
    console.log('Available markets:', Object.keys(marketsResponse.markets));
    
    // Get ETH-USD orderbook
    const orderbook = await client.indexerClient.markets.getPerpetualMarketOrderbook('ETH-USD');
    console.log('ETH-USD Orderbook:');
    console.log('- Top bid:', orderbook.bids[0]);
    console.log('- Top ask:', orderbook.asks[0]);
    
    // Get market candles
    const candlesResponse = await client.indexerClient.markets.getPerpetualMarketCandles('ETH-USD', '1MIN');
    console.log('Latest candle:', candlesResponse.candles[0]);
    
    // Get recent trades
    const tradesResponse = await client.indexerClient.markets.getPerpetualMarketTrades('ETH-USD');
    console.log('Recent trades:', tradesResponse.trades.slice(0, 3));
    
    if (!wallet.address) {
      console.log('Wallet address not available');
      return;
    }

    //==========================================================================
    // 4. Get account information
    //==========================================================================
    
    // Get user's subaccounts
    const subaccountsResponse = await client.indexerClient.account.getSubaccounts(wallet.address);
    console.log('User subaccounts:', subaccountsResponse.subaccounts);
    
    if (subaccountsResponse.subaccounts.length > 0) {
      // Get perpetual positions
      const positionsResponse = await client.indexerClient.account.getSubaccountPerpetualPositions(
        wallet.address, 
        0
      );
      console.log('Current positions:', positionsResponse.positions);
      
      // Get open orders
      const orders = await client.indexerClient.account.getSubaccountOrders(wallet.address, 0);
      console.log('Open orders:', orders);

      //==========================================================================
      // 5. Place a short-term order
      //==========================================================================
      
      // Generate a random client ID
      const clientId = Math.floor(Math.random() * MAX_CLIENT_ID);
      console.log('Using client ID:', clientId);
      
      // Get current block height and set goodTilBlock
      const currentBlock = await client.validatorClient.get.latestBlockHeight();
      const goodTilBlock = currentBlock + 10; // Valid for next 10 blocks
      
      console.log('Placing a short-term limit order to buy ETH at $1000');
      const placeTx = await client.placeShortTermOrder(
        subaccount,
        'ETH-USD',  // Market
        OrderSide.BUY,  // Side
        1000,  // Price in USD
        0.01,  // Size in ETH
        clientId,
        goodTilBlock,
        Order_TimeInForce.TIME_IN_FORCE_POST_ONLY,  // Post-only order
        false  // Not reduce-only
      );
      
      console.log('Order placed successfully, transaction hash:', Buffer.from(placeTx.hash).toString('hex'));
      
      // Wait for 5 seconds
      console.log('Waiting 5 seconds before canceling the order...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      //==========================================================================
      // 6. Cancel the order
      //==========================================================================
      
      console.log('Canceling order with client ID:', clientId);
      const cancelTx = await client.cancelOrder(
        subaccount,
        clientId,
        OrderFlags.SHORT_TERM,
        'ETH-USD',
        goodTilBlock
      );
      
      console.log('Order canceled successfully');
      
      //==========================================================================
      // 7. Deposit USDC to subaccount
      //==========================================================================
      
      // Deposit 1 USDC (USDC has 6 decimals)
      console.log('Depositing 1 USDC to subaccount');
      const depositTx = await client.validatorClient.post.deposit(
        subaccount,
        0,  // Asset ID 0 is USDC
        new Long(1_000_000)  // 1 USDC in quantum units
      );
      
      console.log('Deposit successful, transaction hash:', Buffer.from(depositTx.hash).toString('hex'));
    }
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

main();
```

## Running the Application

```bash
bun run index.ts
```

This example demonstrates:
1. Connecting to the dYdX testnet
2. Creating a wallet and subaccount
3. Fetching market data (markets, orderbook, candles, trades)
4. Getting account information (subaccounts, positions, orders)
5. Placing a short-term order
6. Canceling the order
7. Depositing USDC to a subaccount

For more examples, check https://github.com/dydxprotocol/v4-clients/tree/main/v4-client-js/examples
