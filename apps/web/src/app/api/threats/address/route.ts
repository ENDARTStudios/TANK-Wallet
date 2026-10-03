import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/threats/address?chain=ethereum&address=0x...
 * Returns the threat record for a wallet address, or null if not found.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const chain = searchParams.get('chain')
  const address = searchParams.get('address')?.toLowerCase()
  if (!chain || !address) {
    return NextResponse.json({ error: 'Missing chain or address' }, { status: 400 })
  }
  try {
    const threat = await db.threatAddress.findUnique({
      where: { chain_address: { chain, address } },
    })
    return NextResponse.json({ threat }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
