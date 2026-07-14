// Test Shamir Secret Sharing implementation
import { shamirSplit, shamirReconstruct, splitMnemonic, reconstructMnemonic } from '../src/lib/wallet-engines/recovery'

async function main() {
  // Test 1: Basic byte splitting
  const secret = new TextEncoder().encode('hello world')
  const shares = shamirSplit(secret, 3, 5)
  console.log('Test 1: split into 5 shares, k=3')
  console.log('Shares:', shares.slice(0, 2))

  // Reconstruct with first 3
  const reconstructed = shamirReconstruct(shares.slice(0, 3))
  console.log('Reconstructed (first 3):', new TextDecoder().decode(reconstructed))

  // Reconstruct with last 3
  const reconstructed2 = shamirReconstruct(shares.slice(2, 5))
  console.log('Reconstructed (last 3):', new TextDecoder().decode(reconstructed2))

  if (new TextDecoder().decode(reconstructed) === 'hello world' && new TextDecoder().decode(reconstructed2) === 'hello world') {
    console.log('✓ Test 1 passed')
  } else {
    console.log('✗ Test 1 failed')
    process.exit(1)
  }

  // Test 2: Mnemonic splitting
  const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  const mnemonicShares = splitMnemonic(mnemonic, 3, 5)
  console.log('\nTest 2: split mnemonic into 5 shares, k=3')
  console.log('Share 1 (first 5 words):', mnemonicShares[0].words.slice(0, 5))

  // Reconstruct with shares 1, 3, 5
  const selectedShares = [mnemonicShares[0], mnemonicShares[2], mnemonicShares[4]]
  const reconstructedMnemonicStr = reconstructMnemonic(selectedShares)
  console.log('Reconstructed mnemonic:', reconstructedMnemonicStr)

  if (reconstructedMnemonicStr === mnemonic) {
    console.log('✓ Test 2 passed')
  } else {
    console.log('✗ Test 2 failed')
    process.exit(1)
  }

  console.log('\n✓ All Shamir tests passed')
}

main().catch(console.error)
