import { NextRequest, NextResponse } from 'next/server'

const GOPLUS_API = 'https://api.gopluslabs.io/api/v1'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const chainId = searchParams.get('chainId')
  const contractAddress = searchParams.get('address')
  if (!chainId || !contractAddress) {
    return NextResponse.json({ error: 'Missing chainId or address' }, { status: 400 })
  }
  const addr = contractAddress.toLowerCase()
  const url = `${GOPLUS_API}/token_security/${chainId}?contract_addresses=${addr}`
  try {
    const res = await fetch(url, {
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
