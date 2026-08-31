export interface OtelAttrs {
  "service.name": string;
  "service.version": string;
  "deployment.environment": string;
  "deployment.id": string;
  "host.name": string;
  "process.pid": number;
}

export function getOtelAttrs(): OtelAttrs {
  return {
    "service.name": "tank-wallet",
    "service.version": process.env.npm_package_version ?? "1.2.1",
    "deployment.environment": process.env.NODE_ENV ?? "development",
    "deployment.id": process.env.DEPLOYMENT_ID ?? `local-${Date.now()}`,
    "host.name": process.env.HOSTNAME ?? "localhost",
    "process.pid": process.pid,
  };
}

export function getOtelResource(): { attributes: OtelAttrs } {
  return { attributes: getOtelAttrs() };
}
