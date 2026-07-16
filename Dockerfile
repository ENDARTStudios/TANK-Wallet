FROM oven/bun:1.3.14-debian AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.14-debian AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN bun run build

FROM oven/bun:1.3.14-debian AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
RUN groupadd --system --gid 1001 tank && useradd --system --uid 1001 --gid tank --create-home --home-dir /app --shell /bin/bash tank
COPY --from=build --chown=tank:tank /app/.next/standalone ./
COPY --from=build --chown=tank:tank /app/.next/static ./.next/static
COPY --from=build --chown=tank:tank /app/public ./public
RUN mkdir -p /app/db && chown tank:tank /app/db
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/api/route || exit 1
USER tank
EXPOSE 3000
CMD ["bun", "server.js"]
