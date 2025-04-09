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
