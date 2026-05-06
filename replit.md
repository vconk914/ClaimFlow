# Smart Photo Search

A mobile app that lets users describe photos in natural language to find them — powered by OpenAI vision AI to index and semantically search your gallery.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/mobile run dev` — Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks + Zod schemas from OpenAPI spec
- Required env: `SESSION_SECRET` — for session handling; OpenAI key is via Replit AI Integrations (no manual key needed)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, Expo Router 6, React Native 0.81
- API: Express 5, Pino logger
- AI: OpenAI `gpt-4o-mini` vision via `@workspace/integrations-openai-ai-server`
- Storage: AsyncStorage (client-side photo index persistence)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/`)

## Where things live

- `artifacts/mobile/` — Expo app (tabs: Search, Library)
  - `app/(tabs)/index.tsx` — search screen
  - `app/(tabs)/library.tsx` — photo library + indexing UI
  - `context/PhotoIndexContext.tsx` — photo indexing/search state
  - `components/` — SearchBar, PhotoThumbnail
  - `constants/colors.ts` — light/dark color tokens
  - `hooks/useColors.ts` — color scheme hook
- `artifacts/api-server/src/routes/photos.ts` — `/api/photos/analyze` and `/api/photos/search`
- `lib/api-spec/openapi.yaml` — source of truth for API contract
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas

## Architecture decisions

- **Contract-first API**: OpenAPI spec drives code generation for both client hooks (Orval) and server validation (Zod). Never hand-write API types.
- **No database**: Photo index is stored in AsyncStorage on-device. The server is stateless — it only analyzes and ranks.
- **expo-image-picker instead of expo-media-library**: Expo Go no longer supports `expo-media-library` on Android. Users pick photos via the picker; indexed data persists via AsyncStorage.
- **OpenAI vision via Replit AI Integrations**: No user-supplied API key required; the integration proxy handles auth transparently.
- **Server-side semantic search**: The client sends the full indexed photo set with the query; the server asks GPT-4o-mini to rank matches with relevance scores and reasoning.

## Product

- **Search tab**: Natural language search bar, shows "Photos Indexed" count, recent searches, example prompts. Results render as a ranked photo grid.
- **Library tab**: Shows indexed photos in a grid. "Add Photos" button opens the image picker; selected photos are analyzed by AI and saved to the index. Progress bar + cancel support during batch indexing.

## User preferences

- Dark iOS-style aesthetic with light/dark color scheme support.

## Gotchas

- `expo-media-library` is NOT used (incompatible with Expo Go). Use `expo-image-picker` for all gallery access.
- Scan the Expo QR code with the Expo Go app on iOS/Android for the real experience — the web preview is a fallback only.
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`, then restart the API server.
- `pnpm run typecheck:libs` must pass before `typecheck` on leaf packages.

## Pointers

- See `.local/skills/pnpm-workspace` for workspace conventions
- See `.local/skills/expo` for Expo-specific patterns
- See `.local/skills/ai-integrations-openai` for the OpenAI proxy setup
