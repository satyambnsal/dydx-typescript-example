# dYdX v4 Client.js Tutorial

This tutorial will guide you through setting up and using the `@dydxprotocol/v4-client-js` package to interact with the dYdX v4 protocol. By the end, you'll have a functioning application that can connect to the dYdX network, manage wallets, fetch market data, and execute trades.

## Table of Contents

- [dYdX v4 Client.js Tutorial](#dydx-v4-clientjs-tutorial)
  - [Table of Contents](#table-of-contents)
  - [Project Setup](#project-setup)
  - [Installing Dependencies](#installing-dependencies)
  - [Basic Connection Setup](#basic-connection-setup)
  - [Wallet Management](#wallet-management)
  - [Fetching Market Data](#fetching-market-data)
  - [Account Information](#account-information)
  - [Order Management](#order-management)
  - [Advanced Features](#advanced-features)
    - [Transfers and Deposits](#transfers-and-deposits)
    - [Faucet Interaction (for testnet)](#faucet-interaction-for-testnet)
  - [Websocket Integration](#websocket-integration)

## Project Setup

Let's start by creating a new TypeScript project using Bun:

```bash
# Create a new directory for your project
mkdir dydx-client-app
cd dydx-client-app

# Initialize a new Bun project
bun init

# Answer the prompts to set up your project
# For package name: dydx-client-app
# For entry point: index.ts
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

## Basic Connection Setup

Let's start by creating a basic connection to the dYdX network. Create a file called `connection.ts`:

```typescript
import { Network } from '@dydxprotocol/v4-client-js';
import { CompositeClient } from '@dydxprotocol/v4-client-js';

async function connectToNetwork() {
  try {
    // Connect to testnet
    const network = Network.testnet();
    const client = await CompositeClient.connect(network);
    
    console.log('Successfully connected to dYdX network');
    console.log('Client:', client);
    
    return client;
  } catch (error) {
    console.error('Failed to connect to dYdX network:', error.message);
    throw error;
  }
}

export { connectToNetwork };
```

Let's test our connection by updating `index.ts`:

```typescript
import { connectToNetwork } from './connection';

async function main() {
  try {
    const client = await connectToNetwork();
    console.log('Connected to dYdX network');
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

main();
```

Run the app:

```bash
bun run index.ts
```

If successful, you should see a message indicating that you've connected to the dYdX network.

## Wallet Management

Next, let's add wallet functionality. Create a file called `wallet.ts`:

```typescript
import { BECH32_PREFIX } from '@dydxprotocol/v4-client-js';
import LocalWallet from '@dydxprotocol/v4-client-js/build/src/clients/modules/local-wallet';
import { SubaccountInfo } from '@dydxprotocol/v4-client-js/build/src/clients/subaccount';

// For demo purposes - in a real app, handle mnemonics securely!
async function createWalletFromMnemonic(mnemonic: string) {
  try {
    const wallet = await LocalWallet.fromMnemonic(mnemonic, BECH32_PREFIX);
    console.log('Wallet created successfully');
    return wallet;
  } catch (error) {
    console.error('Failed to create wallet:', error.message);
    throw error;
  }
}

function createSubaccount(wallet: any, subaccountNumber: number = 0) {
  try {
    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    console.log('Subaccount created successfully');
    return subaccount;
  } catch (error) {
    console.error('Failed to create subaccount:', error.message);
    throw error;
  }
}

export { createWalletFromMnemonic, createSubaccount };
```

Now let's update `index.ts` to use our wallet functions:

```typescript
import { connectToNetwork } from './connection';
import { createWalletFromMnemonic, createSubaccount } from './wallet';

// Example mnemonic - for demo purposes only
// In production, secure your mnemonic and never hardcode it
const EXAMPLE_MNEMONIC = 'your test mnemonic here'; // Replace with a test mnemonic

async function main() {
  try {
    const client = await connectToNetwork();
    console.log('Connected to dYdX network');
    
    const wallet = await createWalletFromMnemonic(EXAMPLE_MNEMONIC);
    console.log('Wallet address:', wallet.address);
    
    const subaccount = createSubaccount(wallet, 0);
    console.log('Subaccount created');
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

main();
```

## Fetching Market Data

Now let's create a module to fetch market data. Create a file called `market-data.ts`:

```typescript
import { IndexerClient } from '@dydxprotocol/v4-client-js/build/src/clients/indexer-client';

async function getPerpetualMarkets(indexerClient: IndexerClient, marketId?: string) {
  try {
    const response = await indexerClient.markets.getPerpetualMarkets(marketId);
    return response.markets;
  } catch (error) {
    console.error('Failed to fetch perpetual markets:', error.message);
    throw error;
  }
}

async function getOrderbook(indexerClient: IndexerClient, marketId: string) {
  try {
    const response = await indexerClient.markets.getPerpetualMarketOrderbook(marketId);
    return {
      bids: response.bids,
      asks: response.asks
    };
  } catch (error) {
    console.error(`Failed to fetch orderbook for ${marketId}:`, error.message);
    throw error;
  }
}

async function getMarketTrades(indexerClient: IndexerClient, marketId: string) {
  try {
    const response = await indexerClient.markets.getPerpetualMarketTrades(marketId);
    return response.trades;
  } catch (error) {
    console.error(`Failed to fetch trades for ${marketId}:`, error.message);
    throw error;
  }
}

async function getMarketCandles(indexerClient: IndexerClient, marketId: string, resolution: string = '1MIN') {
  try {
    const response = await indexerClient.markets.getPerpetualMarketCandles(marketId, resolution);
    return response.candles;
  } catch (error) {
    console.error(`Failed to fetch candles for ${marketId}:`, error.message);
    throw error;
  }
}

export { getPerpetualMarkets, getOrderbook, getMarketTrades, getMarketCandles };
```

Let's update our `index.ts` to use the market data functions:

```typescript
import { connectToNetwork } from './connection';
import { createWalletFromMnemonic, createSubaccount } from './wallet';
import { getPerpetualMarkets, getOrderbook } from './market-data';

// Example mnemonic - for demo purposes only
const EXAMPLE_MNEMONIC = 'your test mnemonic here'; // Replace with a test mnemonic

async function main() {
  try {
    const client = await connectToNetwork();
    console.log('Connected to dYdX network');
    
    const wallet = await createWalletFromMnemonic(EXAMPLE_MNEMONIC);
    console.log('Wallet address:', wallet.address);
    
    const subaccount = createSubaccount(wallet, 0);
    console.log('Subaccount created');
    
    // Get market data
    const markets = await getPerpetualMarkets(client.indexerClient);
    console.log('Available markets:', Object.keys(markets));
    
    // Get orderbook for ETH-USD
    const ethOrderbook = await getOrderbook(client.indexerClient, 'ETH-USD');
    console.log('ETH-USD Orderbook:');
    console.log('- Top bid:', ethOrderbook.bids[0]);
    console.log('- Top ask:', ethOrderbook.asks[0]);
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

main();
```

## Account Information

Let's create a module to fetch account information. Create a file called `account-info.ts`:

```typescript
import { IndexerClient } from '@dydxprotocol/v4-client-js/build/src/clients/indexer-client';

async function getSubaccounts(indexerClient: IndexerClient, address: string) {
  try {
    const response = await indexerClient.account.getSubaccounts(address);
    return response.subaccounts;
  } catch (error) {
    console.error('Failed to fetch subaccounts:', error.message);
    throw error;
  }
}

async function getSubaccountById(indexerClient: IndexerClient, address: string, subaccountNumber: number) {
  try {
    const response = await indexerClient.account.getSubaccount(address, subaccountNumber);
    return response.subaccount;
  } catch (error) {
    console.error(`Failed to fetch subaccount ${subaccountNumber}:`, error.message);
    throw error;
  }
}

async function getAssetPositions(indexerClient: IndexerClient, address: string, subaccountNumber: number) {
  try {
    const response = await indexerClient.account.getSubaccountAssetPositions(address, subaccountNumber);
    return response.positions;
  } catch (error) {
    console.error('Failed to fetch asset positions:', error.message);
    throw error;
  }
}

async function getPerpPositions(indexerClient: IndexerClient, address: string, subaccountNumber: number) {
  try {
    const response = await indexerClient.account.getSubaccountPerpetualPositions(address, subaccountNumber);
    return response.positions;
  } catch (error) {
    console.error('Failed to fetch perpetual positions:', error.message);
    throw error;
  }
}

async function getOrders(indexerClient: IndexerClient, address: string, subaccountNumber: number) {
  try {
    const response = await indexerClient.account.getSubaccountOrders(address, subaccountNumber);
    return response;
  } catch (error) {
    console.error('Failed to fetch orders:', error.message);
    throw error;
  }
}

async function getFills(indexerClient: IndexerClient, address: string, subaccountNumber: number) {
  try {
    const response = await indexerClient.account.getSubaccountFills(address, subaccountNumber);
    return response.fills;
  } catch (error) {
    console.error('Failed to fetch fills:', error.message);
    throw error;
  }
}

async function getHistoricalPNL(indexerClient: IndexerClient, address: string, subaccountNumber: number) {
  try {
    const response = await indexerClient.account.getSubaccountHistoricalPNLs(address, subaccountNumber);
    return response.historicalPnl;
  } catch (error) {
    console.error('Failed to fetch historical PNL:', error.message);
    throw error;
  }
}

export {
  getSubaccounts,
  getSubaccountById,
  getAssetPositions,
  getPerpPositions,
  getOrders,
  getFills,
  getHistoricalPNL
};
```

Let's update our `index.ts` to use the account information functions:

```typescript
import { connectToNetwork } from './connection';
import { createWalletFromMnemonic, createSubaccount } from './wallet';
import { getPerpetualMarkets, getOrderbook } from './market-data';
import { getSubaccounts, getPerpPositions } from './account-info';

// Example mnemonic - for demo purposes only
const EXAMPLE_MNEMONIC = 'your test mnemonic here'; // Replace with a test mnemonic

async function main() {
  try {
    const client = await connectToNetwork();
    console.log('Connected to dYdX network');
    
    const wallet = await createWalletFromMnemonic(EXAMPLE_MNEMONIC);
    console.log('Wallet address:', wallet.address);
    
    const subaccount = createSubaccount(wallet, 0);
    console.log('Subaccount created');
    
    // Get market data
    const markets = await getPerpetualMarkets(client.indexerClient);
    console.log('Available markets:', Object.keys(markets));
    
    // Get orderbook for ETH-USD
    const ethOrderbook = await getOrderbook(client.indexerClient, 'ETH-USD');
    console.log('ETH-USD Orderbook:');
    console.log('- Top bid:', ethOrderbook.bids[0]);
    console.log('- Top ask:', ethOrderbook.asks[0]);
    
    // Get account information
    if (wallet.address) {
      const subaccounts = await getSubaccounts(client.indexerClient, wallet.address);
      console.log('Subaccounts:', subaccounts);
      
      if (subaccounts.length > 0) {
        const positions = await getPerpPositions(client.indexerClient, wallet.address, 0);
        console.log('Perpetual positions:', positions);
      }
    }
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

main();
```

## Order Management

Now let's create functions to place and manage orders. Create a file called `order-management.ts`:

```typescript
import { randomInt } from 'crypto';
import { CompositeClient } from '@dydxprotocol/v4-client-js/build/src/clients/composite-client';
import { OrderSide, OrderTimeInForce, OrderType, OrderExecution } from '@dydxprotocol/v4-client-js/build/src/clients/constants';
import { SubaccountInfo } from '@dydxprotocol/v4-client-js/build/src/clients/subaccount';
import { Order_TimeInForce } from '@dydxprotocol/v4-client-js/build/src/codegen/dydxprotocol/clob/order';
import { OrderFlags } from '@dydxprotocol/v4-client-js';

// Maximum client ID (32-bit unsigned integer)
const MAX_CLIENT_ID = 2 ** 32 - 1;

/**
 * Place a long-term (stateful) order
 */
async function placeLongTermOrder(
  client: CompositeClient,
  subaccount: SubaccountInfo,
  marketId: string,
  side: OrderSide,
  price: number,
  size: number,
  timeInForceSeconds: number = 60
) {
  try {
    const clientId = randomInt(MAX_CLIENT_ID);
    
    const tx = await client.placeOrder(
      subaccount,
      marketId,
      OrderType.LIMIT,
      side,
      price,
      size,
      clientId,
      OrderTimeInForce.GTT,
      timeInForceSeconds,
      OrderExecution.DEFAULT,
      false,  // postOnly
      false   // reduceOnly
    );
    
    console.log('Order placed successfully');
    return {
      clientId,
      transactionHash: tx.hash,
      response: tx
    };
  } catch (error) {
    console.error('Failed to place long-term order:', error.message);
    throw error;
  }
}

/**
 * Place a short-term order
 */
async function placeShortTermOrder(
  client: CompositeClient,
  subaccount: SubaccountInfo,
  marketId: string,
  side: OrderSide,
  price: number,
  size: number,
  postOnly: boolean = false
) {
  try {
    const clientId = randomInt(MAX_CLIENT_ID);
    
    // Get current block height and set goodTilBlock
    const currentBlock = await client.validatorClient.get.latestBlockHeight();
    const goodTilBlock = currentBlock + 10; // Valid for 10 blocks
    
    const tx = await client.placeShortTermOrder(
      subaccount,
      marketId,
      side,
      price,
      size,
      clientId,
      goodTilBlock,
      postOnly ? Order_TimeInForce.TIME_IN_FORCE_POST_ONLY : Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
      false  // reduceOnly
    );
    
    console.log('Short-term order placed successfully');
    return {
      clientId,
      transactionHash: tx.hash,
      goodTilBlock,
      response: tx
    };
  } catch (error) {
    console.error('Failed to place short-term order:', error.message);
    throw error;
  }
}

/**
 * Cancel an order
 */
async function cancelOrder(
  client: CompositeClient,
  subaccount: SubaccountInfo,
  clientId: number,
  orderFlags: OrderFlags,
  marketId: string,
  goodTilBlock?: number,
  goodTilBlockTime?: number
) {
  try {
    const tx = await client.cancelOrder(
      subaccount,
      clientId,
      orderFlags,
      marketId,
      goodTilBlock,
      goodTilBlockTime
    );
    
    console.log('Order cancelled successfully');
    return {
      clientId,
      response: tx
    };
  } catch (error) {
    console.error('Failed to cancel order:', error.message);
    throw error;
  }
}

/**
 * Cancel multiple short-term orders in a batch
 */
async function batchCancelShortTermOrders(
  client: CompositeClient,
  subaccount: SubaccountInfo,
  marketOrderPairs: { marketId: string, clientIds: number[] }[]
) {
  try {
    // Get current block height and set goodTilBlock
    const currentBlock = await client.validatorClient.get.latestBlockHeight();
    const goodTilBlock = currentBlock + 10; // Valid for 10 blocks
    
    const tx = await client.batchCancelShortTermOrdersWithMarketId(
      subaccount,
      marketOrderPairs,
      goodTilBlock
    );
    
    console.log('Orders batch cancelled successfully');
    return {
      transactionHash: tx.hash,
      response: tx
    };
  } catch (error) {
    console.error('Failed to batch cancel orders:', error.message);
    throw error;
  }
}

export {
  placeLongTermOrder,
  placeShortTermOrder,
  cancelOrder,
  batchCancelShortTermOrders,
  MAX_CLIENT_ID
};
```

Now let's update our `index.ts` file to include order management:

```typescript
import { connectToNetwork } from './connection';
import { createWalletFromMnemonic, createSubaccount } from './wallet';
import { getPerpetualMarkets, getOrderbook } from './market-data';
import { getSubaccounts, getPerpPositions, getOrders } from './account-info';
import { placeShortTermOrder, cancelOrder } from './order-management';
import { OrderSide, OrderFlags } from '@dydxprotocol/v4-client-js';

// Example mnemonic - for demo purposes only
const EXAMPLE_MNEMONIC = 'your test mnemonic here'; // Replace with a test mnemonic

async function main() {
  try {
    const client = await connectToNetwork();
    console.log('Connected to dYdX network');
    
    const wallet = await createWalletFromMnemonic(EXAMPLE_MNEMONIC);
    console.log('Wallet address:', wallet.address);
    
    const subaccount = createSubaccount(wallet, 0);
    console.log('Subaccount created');
    
    // Get market data
    const markets = await getPerpetualMarkets(client.indexerClient);
    console.log('Available markets:', Object.keys(markets));
    
    // Get orderbook for ETH-USD
    const ethOrderbook = await getOrderbook(client.indexerClient, 'ETH-USD');
    console.log('ETH-USD Orderbook:');
    console.log('- Top bid:', ethOrderbook.bids[0]);
    console.log('- Top ask:', ethOrderbook.asks[0]);
    
    // Get account information
    if (wallet.address) {
      const subaccounts = await getSubaccounts(client.indexerClient, wallet.address);
      console.log('Subaccounts:', subaccounts);
      
      if (subaccounts.length > 0) {
        const positions = await getPerpPositions(client.indexerClient, wallet.address, 0);
        console.log('Perpetual positions:', positions);
        
        // Show existing orders
        const orders = await getOrders(client.indexerClient, wallet.address, 0);
        console.log('Existing orders:', orders);
        
        // Place a short-term order (commented out for safety - uncomment to test)
        /*
        const orderResult = await placeShortTermOrder(
          client,
          subaccount,
          'ETH-USD',
          OrderSide.BUY,
          1000, // Price well below market to avoid execution
          0.01,  // Size
          true   // Post-only
        );
        console.log('Order placed with clientId:', orderResult.clientId);
        
        // Wait for 5 seconds before cancelling
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Cancel the order
        await cancelOrder(
          client,
          subaccount,
          orderResult.clientId,
          OrderFlags.SHORT_TERM,
          'ETH-USD',
          orderResult.goodTilBlock
        );
        */
      }
    }
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

main();
```

## Advanced Features

### Transfers and Deposits

Let's create a module for transfers and deposits. Create a file called `transfer.ts`:

```typescript
import Long from 'long';
import { CompositeClient } from '@dydxprotocol/v4-client-js/build/src/clients/composite-client';
import { SubaccountInfo } from '@dydxprotocol/v4-client-js/build/src/clients/subaccount';

/**
 * Deposit USDC to a subaccount
 */
async function depositToSubaccount(
  client: CompositeClient,
  subaccount: SubaccountInfo,
  amount: number // Amount in USDC
) {
  try {
    // Convert amount to quantum units (USDC has 6 decimals)
    const quantumAmount = new Long(amount * 1_000_000);
    
    const tx = await client.validatorClient.post.deposit(
      subaccount,
      0, // Asset ID 0 is USDC
      quantumAmount
    );
    
    console.log('Deposit successful');
    return {
      transactionHash: tx.hash,
      response: tx
    };
  } catch (error) {
    console.error('Failed to deposit to subaccount:', error.message);
    throw error;
  }
}

/**
 * Withdraw USDC from a subaccount
 */
async function withdrawFromSubaccount(
  client: CompositeClient,
  subaccount: SubaccountInfo,
  amount: number // Amount in USDC
) {
  try {
    // Convert amount to quantum units (USDC has 6 decimals)
    const quantumAmount = new Long(amount * 1_000_000);
    
    const tx = await client.validatorClient.post.withdraw(
      subaccount,
      0, // Asset ID 0 is USDC
      quantumAmount
    );
    
    console.log('Withdrawal successful');
    return {
      transactionHash: tx.hash,
      response: tx
    };
  } catch (error) {
    console.error('Failed to withdraw from subaccount:', error.message);
    throw error;
  }
}

/**
 * Transfer USDC between subaccounts
 */
async function transferBetweenSubaccounts(
  client: CompositeClient,
  fromSubaccount: SubaccountInfo,
  toAddress: string,
  toSubaccountNumber: number,
  amount: number // Amount in USDC
) {
  try {
    // Convert amount to quantum units (USDC has 6 decimals)
    const quantumAmount = new Long(amount * 1_000_000);
    
    const tx = await client.validatorClient.post.transfer(
      fromSubaccount,
      toAddress,
      toSubaccountNumber,
      0, // Asset ID 0 is USDC
      quantumAmount
    );
    
    console.log('Transfer successful');
    return {
      transactionHash: tx.hash,
      response: tx
    };
  } catch (error) {
    console.error('Failed to transfer between subaccounts:', error.message);
    throw error;
  }
}

export {
  depositToSubaccount,
  withdrawFromSubaccount,
  transferBetweenSubaccounts
};
```

### Faucet Interaction (for testnet)

For testnet, let's create a faucet module. Create a file called `faucet.ts`:

```typescript
import { FaucetClient } from '@dydxprotocol/v4-client-js/build/src/clients/faucet-client';
import { FaucetApiHost } from '@dydxprotocol/v4-client-js/build/src/clients/constants';

/**
 * Fill a subaccount with test USDC from the faucet (testnet only)
 */
async function fillFromFaucet(address: string, subaccountNumber: number = 0, amount: number = 2000) {
  try {
    const client = new FaucetClient(FaucetApiHost.TESTNET);
    
    const response = await client.fill(address, subaccountNumber, amount);
    
    console.log('Faucet fill successful');
    return {
      status: response.status,
      response: response
    };
  } catch (error) {
    console.error('Failed to fill from faucet:', error.message);
    throw error;
  }
}

export { fillFromFaucet };
```

## Websocket Integration

Let's create a module for WebSocket interactions. Create a file called `websocket.ts`:

```typescript
import { 
  SocketClient, 
  IncomingMessageTypes, 
  CandlesResolution 
} from '@dydxprotocol/v4-client-js/build/src/clients/socket-client';
import { Network } from '@dydxprotocol/v4-client-js';

class DydxWebsocketManager {
  private socketClient: SocketClient;
  private isConnected: boolean = false;
  
  constructor(network = Network.testnet()) {
    this.socketClient = new SocketClient(
      network.indexerConfig,
      this.onOpen.bind(this),
      this.onClose.bind(this),
      this.onMessage.bind(this),
      this.onError.bind(this)
    );
  }
  
  connect() {
    this.socketClient.connect();
  }
  
  disconnect() {
    this.socketClient.disconnect();
    this.isConnected = false;
  }
  
  private onOpen() {
    console.log('WebSocket connection opened');
    this.isConnected = true;
  }
  
  private onClose() {
    console.log('WebSocket connection closed');
    this.isConnected = false;
  }
  
  private onMessage(message: { data: string | ArrayBuffer }) {
    if (typeof message.data === 'string') {
      try {
        const data = JSON.parse(message.data);
        
        // Handle the connected event by setting up subscriptions
        if (data.type === IncomingMessageTypes.CONNECTED) {
          console.log('WebSocket connected, channel subscriptions can be made now');
        }
        
        // Process other message types
        this.processMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }
  
  private onError(event: { message: string }) {
    console.error('WebSocket error:', event.message);
  }
  
  private processMessage(data: any) {
    // Example message processing
    if (data.type === IncomingMessageTypes.SUBSCRIBED) {
      console.log(`Subscribed to channel: ${data.channel}, id: ${data.id}`);
    } else if (data.type === IncomingMessageTypes.CHANNEL_DATA) {
      console.log(`Received data for channel: ${data.channel}, id: ${data.id}`);
      // Process channel data based on the channel type
      switch (data.channel) {
        case 'v4_markets':
          console.log('Markets update:', data.contents);
          break;
        case 'v4_orderbook':
          console.log('Orderbook update for', data.id);
          break;
        case 'v4_trades':
          console.log('Trades update for', data.id);
          break;
        case 'v4_candles':
          console.log('Candles update for', data.id);
          break;
        case 'v4_subaccounts':
          console.log('Subaccount update for', data.id);
          break;
        default:
          console.log('Unknown channel data:', data);
      }
    }
  }
  
  // Subscription methods
  subscribeToMarkets() {
    if (!this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }
    this.socketClient.subscribeToMarkets();
  }
  
  subscribeToOrderbook(marketId: string) {
    if (!this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }
    this.socketClient.subscribeToOrderbook(marketId);
  }
  
  subscribeToTrades(marketId: string) {
    if (!this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }
    this.socketClient.subscribeToTrades(marketId);
  }
  
  subscribeToCandles(marketId: string, resolution: CandlesResolution = CandlesResolution.ONE_MINUTE) {
    if (!this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }
    this.socketClient.subscribeToCandles(marketId, resolution);
  }
  
  subscribeToSubaccount(address: string, subaccountNumber: number) {
    if (!this.isConnected) {
