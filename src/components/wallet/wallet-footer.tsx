'use client'

/**
 * Footer global da Tank Wallet.
 * Aparece no rodapé de todas as páginas.
 * Princípio de layout: sticky footer — gruda no bottom quando conteúdo é curto,
 * empurra naturalmente para baixo quando conteúdo é longo.
 */
export function WalletFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-card/20 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
        <div className="flex flex-col items-center justify-between gap-1.5 sm:flex-row">
          <div className="flex items-baseline gap-1.5 text-xs">
            <span className="font-black uppercase tracking-tight text-foreground">TANK</span>
            <span className="font-normal text-muted-foreground">Wallet</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-muted-foreground">Secure Multi-Chain Wallet</span>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            Copyright © 2026 END ART
          </p>
        </div>
      </div>
    </footer>
  )
}
