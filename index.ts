import { getPerpPositions, getSubaccounts } from './account-info'
import { connectToNetwork } from './connection'
import { getOrderbook, getPerpetualMarkets } from './market-data'
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
      }
    }
  } catch (error) {
    console.error('Error in main function:', error.message)
  }
}

main()
