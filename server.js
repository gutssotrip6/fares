// Entry point for hosts that expect server.js (e.g. Hostinger's Express preset).
// Loads optional env files, then starts the built server from `npm run build:node`.
import { existsSync } from "node:fs";

for (const file of [".env", ".env.local"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

await import("./.output/server/index.mjs");
