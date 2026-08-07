
import { Readable } from "node:stream";
import mediaCatalog from "../../media.json" with { type: "json" };

// Catalog IDs come from the same JSON consumed by the frontend.
const extraIds = (process.env.EXTRA_MEDIA_IDS || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);
const allowedIds = new Set([...mediaCatalog.map((item) => item.id), ...extraIds]);
const origin = (
  process.env.GOOGLE_DRIVE_DOWNLOAD_ORIGIN ||
  "https://drive.usercontent.google.com"
).replace(/\/$/, "");
const cacheSeconds = Number.parseInt(
  process.env.MEDIA_CACHE_SECONDS || "3600",
  10,
);

export const config = { supportsResponseStreaming: true };

export default async function handler(req, res) {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end("Method not allowed");
  }
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!allowedIds.has(id)) return res.status(404).end("Unknown media");

  try {
    const headers = { "user-agent": "Mozilla/5.0 MCK-Vercel-Player/1.0" };
    if (req.headers.range) headers.range = req.headers.range;
    const upstream = await fetch(
      `${origin}/download?export=download&confirm=t&id=${encodeURIComponent(id)}`,
      { headers, redirect: "follow" },
    );
    for (const name of [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "content-disposition",
      "last-modified",
      "etag",
    ]) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${cacheSeconds}, max-age=${cacheSeconds}`,
    );
    res.status(upstream.status);
    if (req.method === "HEAD" || !upstream.body) return res.end();
    Readable.fromWeb(upstream.body)
      .on("error", () => res.destroy())
      .pipe(res);
  } catch {
    res.status(502).end("Cannot connect to Google Drive");
  }
}

