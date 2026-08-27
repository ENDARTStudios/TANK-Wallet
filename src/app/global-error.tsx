"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    import("@sentry/nextjs")
      .then((Sentry) => Sentry.captureException(error))
      .catch(() => {});
  }, [error]);

  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight">TANK Wallet</h2>
          <p className="text-sm tracking-widest text-muted-foreground">ZERO TRUST SECURITY</p>
          <div className="w-full max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="font-semibold text-destructive">Erro crítico</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {process.env.NODE_ENV === "development"
                ? error.message
                : "Ocorreu um erro crítico. Recarregue a página."}
            </p>
            {error.digest ? (
              <p className="mt-2 font-mono text-xs text-muted-foreground">ID: {error.digest}</p>
            ) : null}
          </div>
          <button
            onClick={reset}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
