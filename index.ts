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
