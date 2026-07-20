'use client'

import { RISK_BG, RISK_DOT, RISK_LABEL } from '@/lib/wallet/security'
import { chainById } from '@/lib/wallet/data'
import type { ChainId, RiskLevel } from '@/lib/wallet/types'
import { cn } from '@/lib/utils'

// ============ Chain badge ============

export function ChainBadge({ chainId, size = 'sm' }: { chainId: ChainId; size?: 'sm' | 'md' }) {
  const chain = chainById(chainId)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      )}
      style={{
        borderColor: `${chain.color}40`,
        backgroundColor: `${chain.color}12`,
        color: chain.color,
      }}
    >
      <span
        className={cn('inline-block rounded-full', size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')}
        style={{ backgroundColor: chain.color }}
      />
      {chain.shortLabel}
    </span>
  )
}

// ============ Risk badge ============

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold',
        RISK_BG[level],
        className
      )}
    >
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', RISK_DOT[level])} />
      {RISK_LABEL[level]}
    </span>
  )
}

// ============ Token avatar ============

export function TokenAvatar({
  symbol,
  color,
  size = 'md',
}: {
  symbol: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm'
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-bold', sizeClass)}
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1.5px solid ${color}40`,
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  )
}

// ============ Score ring ============

export function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#14b8a6' : score >= 45 ? '#f59e0b' : score >= 20 ? '#fb923c' : '#ef4444'
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold" style={{ color }}>
          {score}
        </span>
        {label && <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</span>}
      </div>
    </div>
  )
}
