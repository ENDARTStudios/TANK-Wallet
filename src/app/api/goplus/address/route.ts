import { NextRequest, NextResponse } from 'next/server'

const GOPLUS_API = 'https://api.gopluslabs.io/api/v1'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const chainId = searchParams.get('chainId')
  const address = searchParams.get('address')
  if (!chainId || !address) {
    return NextResponse.json({ error: 'Missing chainId or address' }, { status: 400 })
  }
  const addr = address.toLowerCase()
  try {
    const res = await fetch(`${GOPLUS_API}/address_security/${addr}?chain_id=${chainId}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })
    const json = await res.json()
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 })
  }
}
