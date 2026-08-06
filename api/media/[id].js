// Vercel discovers JavaScript functions from .js/.ts entrypoints in /api.
// Keep the streaming implementation separate and re-export it here.
export { config } from "./[id].mjs";
export { default } from "./[id].mjs";
