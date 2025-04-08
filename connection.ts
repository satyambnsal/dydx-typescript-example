// console.log('Hello via Bun!')
// import { FaucetApiHost, FaucetClient } from '@dydxprotocol/v4-client-js'
// import { DYDX_TEST_ADDRESS } from './constants'

// async function test(): Promise<void> {
// const client = new FaucetClient(FaucetApiHost.TESTNET);
// const address = DYDX_TEST_ADDRESS;

// }

import { Network, CompositeClient } from '@dydxprotocol/v4-client-js'

export async function connectToNetwork() {
  try {
    const network = Network.testnet()
    const client = await CompositeClient.connect(network)
    console.log('Successfully connected to dYdX network')
    console.log('Client:', client)
    return client
  } catch (error: unknown) {
    console.error('Failed to connect to dYdX network:', error.message)
    throw error
  }
}
