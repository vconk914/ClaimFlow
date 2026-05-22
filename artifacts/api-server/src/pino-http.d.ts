import type pino from "pino";

// pino-http augments Node's http module to add .log on IncomingMessage and
// ServerResponse. We redeclare this here because we import pino-http via
// require() (to avoid its broken "exports":{} field confusing TypeScript's
// bundler moduleResolution). Without an ESM import, the augmentation from
// pino-http's own index.d.ts is never loaded, so we replicate it ourselves.
declare module "http" {
  interface IncomingMessage {
    id: string | number | object;
    log: pino.Logger;
    allLogs: pino.Logger[];
  }
  interface ServerResponse {
    err?: Error | undefined;
  }
}
