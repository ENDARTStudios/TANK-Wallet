import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/threats/token?chain=ethereum&address=0x...
 * Returns the threat record for a token contract, or null if not found.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const chain = searchParams.get('chain')
  const address = searchParams.get('address')?.toLowerCase()
  if (!chain || !address) {
    return NextResponse.json({ error: 'Missing chain or address' }, { status: 400 })
  }
  try {
    const threat = await db.threatToken.findUnique({
      where: { chain_address: { chain, address } },
    })
    return NextResponse.json({ threat }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

/**
 * POST /api/threats/token
 * Submit a new malicious token to the database (community-sourced).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { chain, address, symbol, name, reason, category, source = 'community' } = body
    if (!chain || !address || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const threat = await db.threatToken.upsert({
      where: { chain_address: { chain, address: address.toLowerCase() } },
      create: {
        chain,
        address: address.toLowerCase(),
        symbol: symbol || 'UNKNOWN',
        name: name || 'Unknown',
        reason,
        category: category || 'scam',
        source,
      },
      update: {
        reason,
        category: category || 'scam',
        lastConfirmedAt: new Date(),
      },
    })
    return NextResponse.json({ threat })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
