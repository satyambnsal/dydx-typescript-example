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
