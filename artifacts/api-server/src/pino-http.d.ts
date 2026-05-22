// export {} makes this a module file so declare module "http" below is treated
// as a module augmentation (additive) rather than an ambient module declaration
// (which would replace the entire http module and break Express/cors types).
export {};

//
// pino-http augments http.IncomingMessage/.ServerResponse at runtime, but we
// import pino-http via require() in app.ts to avoid its broken "exports": {}
// confusing TypeScript's bundler moduleResolution. Without an ESM import,
// pino-http's own index.d.ts augmentation is never loaded. We replicate it
// here with a minimal interface that covers all usages in this codebase
// (req.log.error, req.log.info, etc.) without depending on pino's own types.
declare module "http" {
  interface IncomingMessage {
    id?: string | number | object;
    log: {
      fatal(obj: object, msg?: string, ...args: unknown[]): void;
      fatal(msg: string, ...args: unknown[]): void;
      error(obj: object, msg?: string, ...args: unknown[]): void;
      error(msg: string, ...args: unknown[]): void;
      warn(obj: object, msg?: string, ...args: unknown[]): void;
      warn(msg: string, ...args: unknown[]): void;
      info(obj: object, msg?: string, ...args: unknown[]): void;
      info(msg: string, ...args: unknown[]): void;
      debug(obj: object, msg?: string, ...args: unknown[]): void;
      debug(msg: string, ...args: unknown[]): void;
      trace(obj: object, msg?: string, ...args: unknown[]): void;
      trace(msg: string, ...args: unknown[]): void;
    };
    allLogs: unknown[];
  }
  interface ServerResponse {
    err?: Error | undefined;
  }
}
