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
