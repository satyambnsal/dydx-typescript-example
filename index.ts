import { connectToNetwork } from './connection'

async function main() {
  try {
    const client = await connectToNetwork()
    console.log('Connected to dYdX network')
  } catch (error) {
    console.error('Error in main function:', error.message)
  }
}

main()
