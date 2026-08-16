import assert from "node:assert/strict";
import { once } from "node:events";
import { Writable } from "node:stream";
import test from "node:test";

process.env.R2_ENDPOINT = "https://example.r2.cloudflarestorage.com";
process.env.R2_BUCKET = "mck";
process.env.R2_ACCESS_KEY_ID = "test-access-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";

const { default: handler } = await import("../api/media/[id].mjs");

class MockResponse extends Writable {
  constructor() {
    super();
    this.headers = {};
    this.statusCode = 200;
    this.chunks = [];
  }

  _write(chunk, _encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = String(value);
  }

  status(code) {
    this.statusCode = code;
    return this;
  }
}

test("signs and streams an R2 range request", async (context) => {
  let signedRequest;
  context.mock.method(globalThis, "fetch", async (request) => {
    signedRequest = request;
    return new Response("x", {
      status: 206,
      headers: {
        "accept-ranges": "bytes",
        "content-length": "1",
        "content-range": "bytes 0-0/10",
      },
    });
  });

  const response = new MockResponse();
  const finished = once(response, "finish");
  await handler({
    method: "GET",
    query: { id: "1reQCapHuk6snmGuh-UsLL1zawSAX7qsK" },
    headers: { range: "bytes=0-0" },
  }, response);
  await finished;

  assert.equal(signedRequest.url, "https://example.r2.cloudflarestorage.com/mck/01.%20Elegie.flac");
  assert.equal(signedRequest.headers.get("range"), "bytes=0-0");
  assert.match(signedRequest.headers.get("authorization"), /^AWS4-HMAC-SHA256 /);
  assert.equal(response.statusCode, 206);
  assert.equal(response.headers["content-type"], "audio/flac");
  assert.equal(Buffer.concat(response.chunks).toString(), "x");
});
