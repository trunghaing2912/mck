import { Readable } from "node:stream";

const BUILT_IN_IDS = new Set(
  `
1reQCapHuk6snmGuh-UsLL1zawSAX7qsK,1g4cuEub4D2YI6Sx7Yiy40klszOrQqW4r,1CfH578Cc-HVM_-sZ1vkhH6C5mR1FidsM,1F2wZ7Pr6Tnbs-3l2RsygMtlG7gCI4-sm,1tEMh5fFgtNSVYF6mlCBtqwe9ERMJ9HJ2,1p_F8wIPd8zC6U1SN3sEEIZUN6sESazzD,1U4THD6Nit0L83HUJeI4o33yOpKgZk6nl,1XQzIIkteRgxOVi0MIC57iONtDJAASRFY,1Kuuq4zcDOM3dOw9bRpca-xuz2YPkF6tf,1iewpqjjkV-MCw3lAMqfsjITadOFU0Fai,1B8ovUnhGjGn2oWQdmDyJW15xGvTi8AYF,1lwJ77xEBz3sW2_Q_pl2v7Y0plBLHXVZR,1reMXW2DQ2L7cBDBv8l4uLoZH4muvLFcH,1HgFc6Iq9s5ItZN17AvjxwcVBmeOo50Vx,1LRE3CvLiF1gxikWwhbHGNxR3rwPBul8C,1cWjcrQcRnX_BOykhrbiLiRiKHshqh5oE,10Sn7Vh5Hgf22DO-mqfkWxNZggFvDHcZl,1YA8-K4yZNIUBCWIxob42PHNJLB8S_7ll,1oDLEyuU1VzSiOpIYvW0ZN8C6HEOYrUF7,1D-cedj0JdydUk_PZUOhQMwF3kJoyoO_V,1XYcz8yfRsocHezKnxNN5ZyBrAaR6iJ5J,1_EwdyYj0zzQ1GET39WDdSzUe7SHLkCUt,17qz4-zYF5Nua3Z1-7fnoz0x0n2ot5_Eo,1wLfTMctsfkLvBqsTt2Vobpwo4PglqY5N,1YUJsyNer2Tp840LxryYfkr_ze_-KolQ2,1_Wk2qmDPZEiMzI-J2g3ooT6tgfeJmZCj,12l3zXy3uIQIMrkCYm_3RaWNdKtaHnEw7,1Lye7RRsmEaw6sG4stOTf5okjIuc_s-kY,1_kZXWCfGs93M2hb0hL3b-JKxb0yXTEy4,1yMjUyzfcbMWrExKlPkWSjQITrrIlqGhe,1xok_TDmBCsbisujQ8klAvHA3kDA3WpgU,1zJOPsHCIdgdnqg9yKn4eMK12XwruRXbc,1qfYDLZTITE1MZ4KTHvxvuFT_5Sf_9JxT,1jsK7PkASKSDmkpuUJcrZ_SCmgQfYQLw9,1dAEU4VGt05hqPhR5eRS-3VZfO0_zM3vT,15B29zvDUrzvvqEgmPuT9kErV3n4_KRXY
`
    .trim()
    .split(","),
);

const extraIds = (process.env.EXTRA_MEDIA_IDS || "")
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);
const allowedIds = new Set([...BUILT_IN_IDS, ...extraIds]);
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
