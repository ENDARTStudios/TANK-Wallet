// Debug GF(256) operations
const GF256_EXP = new Uint8Array(512)
const GF256_LOG = new Uint8Array(256)
;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x
    GF256_LOG[x] = i
    x = x << 1
    if (x & 0x100) x ^= 0x11d
    x = x & 0xff
  }
  for (let i = 255; i < 512; i++) GF256_EXP[i] = GF256_EXP[i - 255]
})()

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return GF256_EXP[GF256_LOG[a] + GF256_LOG[b]]
}
function gfDiv(a: number, b: number): number {
  if (a === 0) return 0
  if (b === 0) throw new Error('div by zero')
  return GF256_EXP[(GF256_LOG[a] - GF256_LOG[b] + 255) % 255]
}
function gfEval(poly: Uint8Array, x: number): number {
  let result = 0
  for (let i = poly.length - 1; i >= 0; i--) {
    result = gfMul(result, x) ^ poly[i]
  }
  return result
}
function gfLagrange(points: Array<[number, number]>, x: number): number {
  let result = 0
  for (let i = 0; i < points.length; i++) {
    let numerator = 1
    let denominator = 1
    for (let j = 0; j < points.length; j++) {
      if (i === j) continue
      numerator = gfMul(numerator, x ^ points[j][0])
      denominator = gfMul(denominator, points[i][0] ^ points[j][0])
    }
    const lagrange = gfDiv(numerator, denominator)
    console.log(`  i=${i}: xi=${points[i][0]}, yi=${points[i][1]}, num=${numerator}, den=${denominator}, L=${lagrange}, L*yi=${gfMul(lagrange, points[i][1])}`)
    result ^= gfMul(points[i][1], lagrange)
  }
  return result
}

// Test: secret=42, k=2, n=3
// f(x) = 42 + a1*x
// We need to know a1. Let's use a1=117 (from previous run)
const a0 = 42
const a1 = 117
const poly = new Uint8Array([a0, a1])

const y1 = gfEval(poly, 1) // f(1)
const y2 = gfEval(poly, 2) // f(2)
const y3 = gfEval(poly, 3) // f(3)
console.log(`f(1)=${y1}, f(2)=${y2}, f(3)=${y3}`)
console.log(`Expected: f(0)=${a0}`)

// Reconstruct with (1, y1) and (2, y2)
console.log('\nLagrange with points (1,y1),(2,y2) at x=0:')
const r1 = gfLagrange([[1, y1], [2, y2]], 0)
console.log(`Result: ${r1}`)

// Reconstruct with (1, y1) and (3, y3)
console.log('\nLagrange with points (1,y1),(3,y3) at x=0:')
const r2 = gfLagrange([[1, y1], [3, y3]], 0)
console.log(`Result: ${r2}`)

// Verify: gfMul(2,3) should equal gfMul(3,2)
console.log(`\ngfMul(2,3)=${gfMul(2,3)}, gfMul(3,2)=${gfMul(3,2)}`)
console.log(`gfDiv(2,3)=${gfDiv(2,3)}`)
console.log(`gfMul(gfDiv(2,3), 3)=${gfMul(gfDiv(2,3), 3)} (should be 2)`)
