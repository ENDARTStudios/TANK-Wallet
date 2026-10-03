'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/provider'
import type { IntentKind, IntentSource } from '@/lib/intent/classifier'

export function IntentBadge({ intent, confidence, source }: { intent: IntentKind; confidence: number; source: IntentSource }) {
  const { t } = useI18n()
  const label = source === 'unavailable' ? t('intent.unavailable') : t(`intent.${intent}`);
  return (
    <span className="flex items-center gap-2">
      <Badge variant="outline" className={cn('text-[9px]', source === 'typesafe' ? 'border-emerald-500/40 text-emerald-400' : 'border-muted-foreground/40 text-muted-foreground')}>
        {label}
      </Badge>
      {source !== 'unavailable' && (
        <span className="text-[10px] text-muted-foreground">{Math.round(confidence * 100)}% · {source}</span>
      )}
    </span>
  )
}
