// 手元で確かめるためのサーバー。公開と同じく /minowa-bousai-map/ の下で配信する
// 使い方：node tools/check_site.mjs のあとに node tools/serve.mjs → http://localhost:5600/minowa-bousai-map/
//   テスト用データで見るとき：http://localhost:5600/minowa-bousai-map/?mock=1
//   /minowa-bousai-map/dev/ だけは _site/ ではなくリポジトリの dev/ から配信する（dev/ は公開しない）
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(REPO, "_site");
const DEV = join(REPO, "dev");
const BASE = "/minowa-bousai-map/";
const PORT = Number(process.argv[2] || 5600);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (url === "/" || url === "/minowa-bousai-map") { res.writeHead(302, { Location: BASE }); return res.end(); }
  if (!url.startsWith(BASE)) { res.writeHead(404); return res.end("404 (サブパスの外)"); }
  const rel = url.slice(BASE.length);
  const top = rel.startsWith("dev/") ? DEV : ROOT;
  let p = normalize(join(top === DEV ? REPO : ROOT, rel));
  if (!p.startsWith(top)) { res.writeHead(403); return res.end(); }
  try { if ((await stat(p)).isDirectory()) p = join(p, "index.html"); const body = await readFile(p);
    res.writeHead(200, { "Content-Type": TYPES[extname(p)] || "application/octet-stream", "Cache-Control": "no-store" }); res.end(body);
  } catch { res.writeHead(404); res.end("404"); }
}).listen(PORT, () => console.log(`http://localhost:${PORT}${BASE}  （テスト用データ：${BASE}?mock=1）`));
