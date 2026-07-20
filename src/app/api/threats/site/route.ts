import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/threats/site?url=metarnask-login.com
 * Returns the threat record for a site, or null if not found.
 * Also matches by URL prefix.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawUrl = searchParams.get('url')
  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }
  const normalized = rawUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
  try {
    // Try exact match first
    let threat = await db.threatSite.findUnique({ where: { url: normalized } })
    // Try partial match (any threat URL contained in the queried URL or vice versa)
    if (!threat) {
      const all = await db.threatSite.findMany({ where: { active: true } })
      threat = all.find(t => normalized.includes(t.url) || t.url.includes(normalized)) || null
    }
    return NextResponse.json({ threat }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, reason, category, source = 'community' } = body
    if (!url || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const normalized = url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
    const threat = await db.threatSite.upsert({
      where: { url: normalized },
      create: { url: normalized, reason, category: category || 'phishing', source },
      update: { reason, category: category || 'phishing', lastConfirmedAt: new Date() },
    })
    return NextResponse.json({ threat })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
