import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { logger } from "./lib/logger";

// pino-http has `"exports": {}` (empty exports map) which causes TypeScript's
// bundler moduleResolution to synthesize a namespace type instead of extracting
// the default export — making it appear non-callable in some environments.
// We import it via require so the type is `any`, then cast to a minimal local
// interface. This is safe: pino-http IS a callable factory at runtime.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pinoHttp = require("pino-http") as (opts: {
  logger: unknown;
  serializers?: Record<string, (val: Record<string, unknown>) => unknown>;
}) => express.RequestHandler;

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: Record<string, unknown>) {
        return {
          id: req["id"],
          method: req["method"],
          url: typeof req["url"] === "string"
            ? req["url"].split("?")[0]
            : undefined,
        };
      },
      res(res: Record<string, unknown>) {
        return {
          statusCode: res["statusCode"],
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
