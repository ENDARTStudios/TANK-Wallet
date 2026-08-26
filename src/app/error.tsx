"use client";

import { useEffect } from "react";

export default function Error({
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

  const isDev = process.env.NODE_ENV === "development";
  const message = isDev ? error.message || error.toString() : "Algo deu errado. Tente novamente.";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-black uppercase tracking-tight">TANK Wallet</h2>
        <p className="text-sm tracking-widest text-muted-foreground">ZERO TRUST SECURITY</p>
      </div>

      <div className="w-full max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive">Erro inesperado</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground">ID: {error.digest}</p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Tentar novamente
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
