import { BECH32_PREFIX, LocalWallet, SubaccountInfo } from '@dydxprotocol/v4-client-js'

async function createWalletFromMnemonic(mnemonic: string): Promise<LocalWallet> {
  try {
    const wallet = await LocalWallet.fromMnemonic(mnemonic, BECH32_PREFIX)
    console.log('Wallet created successfully')
    return wallet
  } catch (error) {
    console.error('Failed to create wallet:', error.message)
    throw error
  }
}

function createSubaccount(wallet: any, subaccountNumber: number = 0) {
  try {
    const subaccount = new SubaccountInfo(wallet, subaccountNumber)
    console.log('Subaccount created successfully')
    return subaccount
  } catch (error) {
    console.error('Failed to create subaccount: ', error.message)
    throw error
  }
}

export { createSubaccount, createWalletFromMnemonic }
