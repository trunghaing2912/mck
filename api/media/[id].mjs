import { Readable } from "node:stream";
import { AwsClient } from "aws4fetch";
import mediaCatalog from "../../media.json" with { type: "json" };

const mediaById = new Map(mediaCatalog.map((item) => [item.id, item]));
const endpoint = process.env.R2_ENDPOINT?.replace(/\/$/, "");
const bucket = process.env.R2_BUCKET || "mck";
const cacheSeconds = Number.parseInt(process.env.MEDIA_CACHE_SECONDS || "3600", 10);
const credentials = {
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
};
const r2 = credentials.accessKeyId && credentials.secretAccessKey
  ? new AwsClient({ ...credentials, region: "auto", service: "s3" })
  : null;

export const config = { supportsResponseStreaming: true };

const bucketPath = `/${encodeURIComponent(bucket)}`;
const bucketUrl = endpoint?.endsWith(bucketPath) ? endpoint : `${endpoint}${bucketPath}`;
const objectUrl = (file) =>
  `${bucketUrl}/${file.split("/").map(encodeURIComponent).join("/")}`;

export default async function handler(req, res) {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end("Method not allowed");
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const item = mediaById.get(id);
  if (!item) return res.status(404).end("Unknown media");
  if (!endpoint || !r2) return res.status(500).end("R2 is not configured");

  try {
    const headers = {};
    for (const name of ["range", "if-range", "if-none-match", "if-modified-since"]) {
      if (req.headers[name]) headers[name] = req.headers[name];
    }

    const upstream = await r2.fetch(objectUrl(item.file), {
      method: req.method,
      headers,
    });

    for (const name of [
      "content-length",
      "content-range",
      "accept-ranges",
      "last-modified",
      "etag",
    ]) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    res.setHeader("Content-Type", upstream.ok
      ? item.file.toLowerCase().endsWith(".mp4") ? "video/mp4" : "audio/flac"
      : upstream.headers.get("content-type") || "text/plain");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", upstream.ok
      ? `public, s-maxage=${cacheSeconds}, max-age=${cacheSeconds}`
      : "no-store");
    res.status(upstream.status);
    if (req.method === "HEAD" || !upstream.body) return res.end();
    Readable.fromWeb(upstream.body)
      .on("error", () => res.destroy())
      .pipe(res);
  } catch (error) {
    console.error("R2 media proxy failed", error);
    res.status(502).end("Cannot connect to R2");
  }
}
