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
