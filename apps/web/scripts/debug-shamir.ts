// Debug Shamir implementation
import { shamirSplit, shamirReconstruct } from '../src/lib/wallet-engines/recovery'

// Test with k=2, n=3, single byte
const secret = new Uint8Array([42]) // single byte: 42
console.log('Secret:', secret[0])

const shares = shamirSplit(secret, 2, 3)
console.log('Shares:')
for (const s of shares) {
  const bytes = s.data.match(/.{2}/g)!.map(h => parseInt(h, 16))
  console.log(`  index=${s.index}, byte=${bytes[0]}`)
}

// Try reconstruct with different pairs
console.log('\nReconstruct with shares 1,2:')
const r1 = shamirReconstruct([shares[0], shares[1]])
console.log('  result:', r1[0])

console.log('Reconstruct with shares 1,3:')
const r2 = shamirReconstruct([shares[0], shares[2]])
console.log('  result:', r2[0])

console.log('Reconstruct with shares 2,3:')
const r3 = shamirReconstruct([shares[1], shares[2]])
console.log('  result:', r3[0])

if (r1[0] === 42 && r2[0] === 42 && r3[0] === 42) {
  console.log('\n✓ Single byte test passed')
} else {
  console.log('\n✗ Single byte test failed')
}

// Test with multi-byte
const secret2 = new TextEncoder().decode(new Uint8Array([1,2,3,4,5,6,7,8,9,10]))
console.log('\nMulti-byte secret:', secret2)
const shares2 = shamirSplit(new Uint8Array([1,2,3,4,5,6,7,8,9,10]), 3, 5)
const r4 = shamirReconstruct([shares2[0], shares2[2], shares2[4]])
console.log('Reconstructed:', Array.from(r4).join(','))
if (Array.from(r4).join(',') === '1,2,3,4,5,6,7,8,9,10') {
  console.log('✓ Multi-byte test passed')
} else {
  console.log('✗ Multi-byte test failed')
}
