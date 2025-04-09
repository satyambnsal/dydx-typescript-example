# dYdX v4 Client.js Tutorial

This guide will walk you through setting up and using the `@dydxprotocol/v4-client-js` package to interact with the dYdX v4 protocol. By the end, you'll have a functioning application that can connect to the dYdX network, manage wallets, fetch market data, and execute trades.


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
import { BECH32_PREFIX, LocalWallet, SubaccountInfo} from '@dydxprotocol/v4-client-js';

// For demo purposes - in a real app, handle mnemonics securely!
export async function createWalletFromMnemonic(mnemonic: string) {
  try {
    const wallet = await LocalWallet.fromMnemonic(mnemonic, BECH32_PREFIX);
    console.log('Wallet created successfully');
    return wallet;
  } catch (error) {
    console.error('Failed to create wallet:', error.message);
    throw error;
  }
}

export function createSubaccount(wallet: any, subaccountNumber: number = 0) {
  try {
    const subaccount = new SubaccountInfo(wallet, subaccountNumber);
    console.log('Subaccount created successfully');
    return subaccount;
  } catch (error) {
    console.error('Failed to create subaccount:', error.message);
    throw error;
  }
}
```

Now let's update `index.ts` to use our wallet functions:

```typescript
import { connectToNetwork } from './connection'
import { createWalletFromMnemonic, createSubaccount } from './wallet'

// Example mnemonic - for demo purposes only
// In production, secure your mnemonic and never hardcode it
const EXAMPLE_MNEMONIC =
  'mirror actor skill push coach wait confirm orchard lunch mobile athlete gossip awake miracle matter bus reopen team ladder lazy list timber render wait'

async function main() {
  try {
    const client = await connectToNetwork()
    console.log('Connected to dYdX network')

    const wallet = await createWalletFromMnemonic(EXAMPLE_MNEMONIC)
    console.log('Wallet address:', wallet.address)

    const subaccount = createSubaccount(wallet, 0)
    console.log('Subaccount created')
  } catch (error) {
    console.error('Error in main function:', error.message)
  }
}

main()
```

## Fetching Market Data

Now let's create a module to fetch market data. Create a file called `market-data.ts`:

```typescript
import { IndexerClient } from '@dydxprotocol/v4-client-js'

export async function getPerpetualMarkets(indexerClient: IndexerClient, marketId?: string) {
  try {
    const response = await indexerClient.markets.getPerpetualMarkets(marketId)
    return response.markets
  } catch (error) {
    console.error('Failed to fetch perpetual markets:', error.message)
    throw error
  }
}

export async function getOrderbook(indexerClient: IndexerClient, marketId: string) {
  try {
    const response = await indexerClient.markets.getPerpetualMarketOrderbook(marketId)
    return {
      bids: response.bids,
      asks: response.asks,
    }
  } catch (error) {
    console.error(`Failed to fetch orderbook for ${marketId}:`, error.message)
    throw error
  }
}

export async function getMarketTrades(indexerClient: IndexerClient, marketId: string) {
  try {
    const response = await indexerClient.markets.getPerpetualMarketTrades(marketId)
    return response.trades
  } catch (error) {
    console.error(`Failed to fetch trades for ${marketId}:`, error.message)
    throw error
  }
}

export async function getMarketCandles(
  indexerClient: IndexerClient,
  marketId: string,
  resolution: string = '1MIN'
) {
  try {
    const response = await indexerClient.markets.getPerpetualMarketCandles(marketId, resolution)
    return response.candles
  } catch (error) {
    console.error(`Failed to fetch candles for ${marketId}:`, error.message)
    throw error
  }
}
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
import { IndexerClient } from '@dydxprotocol/v4-client-js'

export async function getSubaccounts(indexerClient: IndexerClient, address: string) {
  try {
    const response = await indexerClient.account.getSubaccounts(address)
    return response.subaccounts
  } catch (error) {
    console.error('Failed to fetch subaccounts:', error.message)
    throw error
  }
}

export async function getSubaccountById(
  indexerClient: IndexerClient,
  address: string,
  subaccountNumber: number
) {
  try {
    const response = await indexerClient.account.getSubaccount(address, subaccountNumber)
    return response.subaccount
  } catch (error) {
    console.error(`Failed to fetch subaccount ${subaccountNumber}:`, error.message)
    throw error
  }
}

export async function getAssetPositions(
  indexerClient: IndexerClient,
  address: string,
  subaccountNumber: number
) {
  try {
    const response = await indexerClient.account.getSubaccountAssetPositions(
      address,
      subaccountNumber
    )
    return response.positions
  } catch (error) {
    console.error('Failed to fetch asset positions:', error.message)
    throw error
  }
}

export async function getPerpPositions(
  indexerClient: IndexerClient,
  address: string,
  subaccountNumber: number
) {
  try {
    const response = await indexerClient.account.getSubaccountPerpetualPositions(
      address,
      subaccountNumber
    )
    return response.positions
  } catch (error) {
    console.error('Failed to fetch perpetual positions:', error.message)
    throw error
  }
}

export async function getOrders(
  indexerClient: IndexerClient,
  address: string,
  subaccountNumber: number
) {
  try {
    const response = await indexerClient.account.getSubaccountOrders(address, subaccountNumber)
    return response
  } catch (error) {
    console.error('Failed to fetch orders:', error.message)
    throw error
  }
}

export async function getFills(
  indexerClient: IndexerClient,
  address: string,
  subaccountNumber: number
) {
  try {
    const response = await indexerClient.account.getSubaccountFills(address, subaccountNumber)
    return response.fills
  } catch (error) {
    console.error('Failed to fetch fills:', error.message)
    throw error
  }
}

export async function getHistoricalPNL(
  indexerClient: IndexerClient,
  address: string,
  subaccountNumber: number
) {
  try {
    const response = await indexerClient.account.getSubaccountHistoricalPNLs(
      address,
      subaccountNumber
    )
    return response.historicalPnl
  } catch (error) {
    console.error('Failed to fetch historical PNL:', error.message)
    throw error
  }
}
```

Let's update our `index.ts` to use the account information functions.
Now that we’re past basic usage , we won’t include all previous imports and code here. so if you’re following along, make sure to put the previous code in `index.ts` file. As a result, our examples will be a bit more concise, letting us focus on the actual details rather than boilerplate code.

```typescript
import { getPerpPositions, getSubaccounts } from './account-info'

async function main() {
  try {
    // Previous code    
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
import {
  CompositeClient,
  OrderSide,
  OrderTimeInForce,
  OrderType,
  OrderExecution,
  SubaccountInfo,
  Order_TimeInForce,
  OrderFlags,
} from '@dydxprotocol/v4-client-js'

const MAX_CLIENT_ID = 2 ** 32 - 1

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
    const clientId = Math.floor(Math.random() * MAX_CLIENT_ID)
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
      false,
      false
    )
  } catch (error) {
    console.error('Failed to place long-term order:', error.message)
    throw error
  }
}

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
    const clientId = Math.floor(Math.random() * MAX_CLIENT_ID)

    // Get current block height and set goodTilBlock
    const currentBlock = await client.validatorClient.get.latestBlockHeight()
    const goodTilBlock = currentBlock + 10 // Valid for 10 blocks

    const tx = await client.placeShortTermOrder(
      subaccount,
      marketId,
      side,
      price,
      size,
      clientId,
      goodTilBlock,
      postOnly
        ? Order_TimeInForce.TIME_IN_FORCE_POST_ONLY
        : Order_TimeInForce.TIME_IN_FORCE_UNSPECIFIED,
      false // reduceOnly
    )

    console.log('Short-term order placed successfully')
    return {
      clientId,
      transactionHash: tx.hash,
      goodTilBlock,
      response: tx,
    }
  } catch (error) {
    console.error('Failed to place short-term order:', error.message)
    throw error
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
    )

    console.log('Order cancelled successfully')
    return {
      clientId,
      response: tx,
    }
  } catch (error) {
    console.error('Failed to cancel order:', error.message)
    throw error
  }
}

/**
 * Cancel multiple short-term orders in a batch
 */
async function batchCancelShortTermOrders(
  client: CompositeClient,
  subaccount: SubaccountInfo,
  marketOrderPairs: { marketId: string; clientIds: number[] }[]
) {
  try {
    // Get current block height and set goodTilBlock
    const currentBlock = await client.validatorClient.get.latestBlockHeight()
    const goodTilBlock = currentBlock + 10 // Valid for 10 blocks

    const tx = await client.batchCancelShortTermOrdersWithMarketId(
      subaccount,
      marketOrderPairs,
      goodTilBlock
    )

    console.log('Orders batch cancelled successfully')
    return {
      transactionHash: tx.hash,
      response: tx,
    }
  } catch (error) {
    console.error('Failed to batch cancel orders:', error.message)
    throw error
  }
}

export {
  placeLongTermOrder,
  placeShortTermOrder,
  cancelOrder,
  batchCancelShortTermOrders,
  MAX_CLIENT_ID,
}

```

Now let's update our `index.ts` file to include order management:

```typescript
import { OrderFlags, OrderSide } from '@dydxprotocol/v4-client-js'
import { getOrders, getPerpPositions, getSubaccounts } from './account-info'
import { connectToNetwork } from './connection'
import { getOrderbook, getPerpetualMarkets } from './market-data'
import { cancelOrder, placeShortTermOrder } from './order-management'
import { createWalletFromMnemonic, createSubaccount } from './wallet'

// Example mnemonic - for demo purposes only
// In production, secure your mnemonic and never hardcode it
const EXAMPLE_MNEMONIC =
  'mirror actor skill push coach wait confirm orchard lunch mobile athlete gossip awake miracle matter bus reopen team ladder lazy list timber render wait'

async function main() {
  try {
    const client = await connectToNetwork()
    console.log('Connected to dYdX network')

    const wallet = await createWalletFromMnemonic(EXAMPLE_MNEMONIC)
    console.log('Wallet address:', wallet.address)

    const subaccount = createSubaccount(wallet, 0)
    console.log('Subaccount created')

    // Get market data
    const markets = await getPerpetualMarkets(client.indexerClient)
    console.log('Available markets:', Object.keys(markets))

    // Get orderbook for ETH-USD
    const ethOrderbook = await getOrderbook(client.indexerClient, 'ETH-USD')
    console.log('ETH-USD Orderbook:')
    console.log('- Top bid:', ethOrderbook.bids[0])
    console.log('- Top ask:', ethOrderbook.asks[0])

    // Get account information
    if (wallet.address) {
      const subaccounts = await getSubaccounts(client.indexerClient, wallet.address)
      console.log('Subaccounts:', subaccounts)

      if (subaccounts.length > 0) {
        const positions = await getPerpPositions(client.indexerClient, wallet.address, 0)
        console.log('Perpetual positions:', positions)

        const orders = await getOrders(client.indexerClient, wallet.address, 0)
        console.log('Existing orders:', orders)

        // Place a short-term order
        const orderResult = await placeShortTermOrder(
          client,
          subaccount,
          'ETH-USD',
          OrderSide.BUY,
          1000,
          0.01,
          true
        )

        console.log('Order placed with clientId', orderResult.clientId)
        await new Promise((resolve) => setTimeout(resolve, 5000))

        // Cancel the order

        await cancelOrder(
          client,
          subaccount,
          orderResult.clientId,
          OrderFlags.SHORT_TERM,
          'ETH-USD',
          orderResult.goodTilBlock
        )
      }
    }
  } catch (error) {
    console.error('Error in main function:', error.message)
  }
}
main()
```

## Advanced Features

### Transfers and Deposits

Let's create a module for transfers and deposits. Create a file called `transfer.ts`:

```typescript
import Long from 'long'
import { CompositeClient, SubaccountInfo } from '@dydxprotocol/v4-client-js'

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
    const quantumAmount = new Long(amount * 1_000_000)

    const tx = await client.validatorClient.post.deposit(
      subaccount,
      0, // Asset ID 0 is USDC
      quantumAmount
    )

    console.log('Deposit successful')
    return {
      transactionHash: tx.hash,
      response: tx,
    }
  } catch (error) {
    console.error('Failed to deposit to subaccount:', error.message)
    throw error
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
    const quantumAmount = new Long(amount * 1_000_000)

    const tx = await client.validatorClient.post.withdraw(
      subaccount,
      0, // Asset ID 0 is USDC
      quantumAmount
    )

    console.log('Withdrawal successful')
    return {
      transactionHash: tx.hash,
      response: tx,
    }
  } catch (error) {
    console.error('Failed to withdraw from subaccount:', error.message)
    throw error
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
    const quantumAmount = new Long(amount * 1_000_000)

    const tx = await client.validatorClient.post.transfer(
      fromSubaccount,
      toAddress,
      toSubaccountNumber,
      0, // Asset ID 0 is USDC
      quantumAmount
    )

    console.log('Transfer successful')
    return {
      transactionHash: tx.hash,
      response: tx,
    }
  } catch (error) {
    console.error('Failed to transfer between subaccounts:', error.message)
    throw error
  }
}

export { depositToSubaccount, withdrawFromSubaccount, transferBetweenSubaccounts }
```

Now let's update our `index.ts` file to include USDC deposit to subaccount.
Note that We have installed additional node package `base64-js` to convert byte array to string.

```typescript
import { OrderFlags, OrderSide } from '@dydxprotocol/v4-client-js'
import { getOrders, getPerpPositions, getSubaccounts } from './account-info'
import { connectToNetwork } from './connection'
import { getOrderbook, getPerpetualMarkets } from './market-data'
import { cancelOrder, placeShortTermOrder } from './order-management'
import { createWalletFromMnemonic, createSubaccount } from './wallet'
import { depositToSubaccount } from './transfer'
import { ByteArrayEncoding } from '@dydxprotocol/v4-client-js/build/src/lib/helpers'
import base64 from 'base64-js'

// Example mnemonic - for demo purposes only
// In production, secure your mnemonic and never hardcode it
const EXAMPLE_MNEMONIC =
  'mirror actor skill push coach wait confirm orchard lunch mobile athlete gossip awake miracle matter bus reopen team ladder lazy list timber render wait'

async function main() {
  try {
    const client = await connectToNetwork()
    console.log('Connected to dYdX network')

    const wallet = await createWalletFromMnemonic(EXAMPLE_MNEMONIC)
    console.log('Wallet address:', wallet.address)

    const subaccount = createSubaccount(wallet, 0)
    console.log('Subaccount created')

    // Get market data
    const markets = await getPerpetualMarkets(client.indexerClient)
    console.log('Available markets:', Object.keys(markets))

    // Get orderbook for ETH-USD
    const ethOrderbook = await getOrderbook(client.indexerClient, 'ETH-USD')
    console.log('ETH-USD Orderbook:')
    console.log('- Top bid:', ethOrderbook.bids[0])
    console.log('- Top ask:', ethOrderbook.asks[0])

    // Get account information
    if (wallet.address) {
      const subaccounts = await getSubaccounts(client.indexerClient, wallet.address)
      console.log('Subaccounts:', subaccounts)

      if (subaccounts.length > 0) {
        const positions = await getPerpPositions(client.indexerClient, wallet.address, 0)
        console.log('Perpetual positions:', positions)

        const orders = await getOrders(client.indexerClient, wallet.address, 0)
        console.log('Existing orders:', orders)

        // Place a short-term order
        const orderResult = await placeShortTermOrder(
          client,
          subaccount,
          'ETH-USD',
          OrderSide.BUY,
          1000,
          0.01,
          true
        )

        console.log('Order placed with clientId', orderResult.clientId)
        await new Promise((resolve) => setTimeout(resolve, 5000))

        // Cancel the order

        await cancelOrder(
          client,
          subaccount,
          orderResult.clientId,
          OrderFlags.SHORT_TERM,
          'ETH-USD',
          orderResult.goodTilBlock
        )

        // Deposit USDC to subaccount
        const { transactionHash } = await depositToSubaccount(client, subaccount, 1)
        console.log('Deposit successful', base64.fromByteArray(transactionHash))
      }
    }
  } catch (error) {
    console.error('Error in main function:', error.message)
  }
}

main()
```


For more examples, checkout https://github.com/dydxprotocol/v4-clients/tree/main/v4-client-js/examples
