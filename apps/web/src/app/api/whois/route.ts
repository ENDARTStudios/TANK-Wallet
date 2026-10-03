import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy to fetch domain WHOIS info from RDAP (Registration Data Access Protocol).
 * RDAP is the modern replacement for WHOIS and returns JSON.
 *
 * Public RDAP servers: https://data.iana.org/rdap/dns.json
 * Bootstrap: https://rdap.org/domain/{domain}
 */

interface RdapResponse {
  ldhName?: string
  events?: Array<{ eventAction: string; eventDate: string }>
  status?: string[]
  entities?: Array<{ roles?: string[]; vcardArray?: any[] }>
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawDomain = searchParams.get('domain')
  if (!rawDomain) {
    return NextResponse.json({ error: 'Missing domain' }, { status: 400 })
  }

  // Extract root domain (drop subdomains) — RDAP only works on registrable domains.
  // e.g. app.uniswap.org → uniswap.org
  const parts = rawDomain.toLowerCase().split('.')
  // Heuristic: take last 2 parts unless it's a known multi-part TLD
  const knownMultiTld = ['co.uk', 'com.br', 'com.au', 'co.jp', 'com.cn']
  const last2 = parts.slice(-2).join('.')
  const last3 = parts.slice(-3).join('.')
  const domain = knownMultiTld.includes(last3) ? last3 : last2

  try {
    // Use rdap.org as bootstrap — it redirects to the authoritative RDAP server
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/rdap+json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      return NextResponse.json({
        ageDays: null,
        registeredAt: null,
        queriedDomain: domain,
        error: `RDAP returned ${res.status}`,
      })
    }
    const json = (await res.json()) as RdapResponse

    // Find registration event
    const registration = json.events?.find((e) => e.eventAction === 'registration')
    if (!registration?.eventDate) {
      return NextResponse.json({
        ageDays: null,
        registeredAt: null,
        queriedDomain: domain,
        error: 'No registration date found',
      })
    }

    const registeredAt = new Date(registration.eventDate)
    const ageDays = Math.floor((Date.now() - registeredAt.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      ageDays,
      registeredAt: registeredAt.toISOString(),
      queriedDomain: domain,
      domain: json.ldhName,
      status: json.status,
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (e) {
    return NextResponse.json({
      ageDays: null,
      registeredAt: null,
      queriedDomain: domain,
      error: (e as Error).message,
    })
  }
}
