// 手元だけで使うテスト用データを dev/fixtures/ に作る（本番の Worker・データベースには何も送らない）
//   dev/fixtures/artworks.json  … GET /artworks と同じ形（GeoJSON）。目印として "_fixture": true を入れる
//   dev/fixtures/images/mock-XX.svg … 仮の作品画像（ここで描いた図形。実在の児童作品ではない）
// 使い方：node tools/make_fixtures.mjs → node tools/check_site.mjs → node tools/serve.mjs
//         → http://localhost:5600/minowa-bousai-map/?mock=1
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "dev", "fixtures");
rmSync(join(OUT, "images"), { recursive: true, force: true });
mkdirSync(join(OUT, "images"), { recursive: true });

// 固定5か所の座標（js/common.js の PLACES と同じ）
const P = {
  apita: [35.54195, 139.641434],
  shintsunashima: [35.536551, 139.636642],
  conforte: [35.546082, 139.634018],
  hiyoshinooka: [35.548008, 139.642441],
  pump: [35.53960528, 139.65348008]
};
const LONG_TITLE = "大雨の日に川の水があふれそうになったら、まよわずに高いところへにげて、家族みんなで声をかけあいながら安全な場所で待とう";
const LONG_BODY = [
  "わたしは、大雨がふったときに鶴見川の水があふれると、このあたりは2階くらいまで水につかるかもしれないことを、ハザードマップを読んで知りました。",
  "だから、雨がつよくなる前に、家族で「どこへにげるか」「だれに連絡するか」を話し合っておくことが大切だと思いました。",
  "作品の青いもようは、川の水がまちに広がっていくようすを表しています。上にはった足あとのスタンプは、高いところへ向かって歩いていく人たちです。",
  "とちゅうで小さい子やお年よりがいたら、声をかけていっしょににげてほしいという気持ちをこめて、手をつなぐスタンプもはりました。",
  "この作品を見た人が、自分の家のまわりのハザードマップを一度見てみようと思ってくれたらうれしいです。",
  "（テスト用の長い本文です。改行や長い文章で表示がくずれないかを確かめるために使います。）"
].join("\n");

// [place, 座標(otherのみ), 番号, いつの行動か, 災害（field_24。本番は空）, タイトル, 本文]
const rows = [
  ["apita", null, "4601", "事前", null, "ひなん場所をたしかめよう", "アピタテラスのまわりは川に近いので、ひなんする場所を家族でたしかめておきたいです。"],
  ["apita", null, "4612", "災害時", "洪水（外水氾濫）", "高いところへいそいで", "水があふれたら、建物の上の階へにげることを表しました。"],
  ["apita", null, "4627", "復旧時", null, "みんなでかたづけ", "水がひいたあと、近所の人と協力してかたづける様子です。"],
  ["shintsunashima", null, "4603", "災害時", "地震の揺れ（震度）", "駅でゆれたら", "駅にいるときに地震がきたら、頭を守ってその場でしゃがみます。"],
  ["shintsunashima", null, "4618", "事前", "内水氾濫", LONG_TITLE, LONG_BODY],
  ["conforte", null, "4605", "事前", null, "非常持ち出しぶくろ", "団地の階段は停電で暗くなるので、ライトを入れておきます。"],
  ["hiyoshinooka", null, "4609", "災害時", "土砂災害（急傾斜地の崩壊）", "がけからはなれる", "雨がつよいときは、がけの近くを通らないようにします。"],
  ["hiyoshinooka", null, "4633", "復旧時", "土砂災害{どしゃさいがい}（急傾斜地{きゅうけいしゃち}の崩壊{ほうかい}）", "公園でたすけあい", "日吉の丘の公園に集まって、水や食べ物を分け合います。"],
  ["pump", null, "4621", "事前", "洪水（外水氾濫）, 内水氾濫", "ポンプ場のひみつ", "ポンプ場がまちの水を川へ出してくれていることを知りました。"],
  ["other", [35.544500, 139.647500], "4607", "災害時", null, "通学路のマンホール", "大雨のときは、マンホールから水があふれることがあるので近づきません。"],
  ["other", [35.538500, 139.629000], "4614", "事前", "高潮", "おじいちゃんの家", "おじいちゃんの家の近くの、にげる道を地図で調べました。"],
  ["other", [35.558000, 139.655000], "4630", "復旧時", null, "学校にあつまる", "学校がひなん所になったとき、自分にできることを考えました。"],
  ["other", [35.526200, 139.621200], "4640", "災害時", null, "まちのはしっこ", "地図のはしの方にも、低い土地があることに気づきました。"]
];

const PALETTES = [["#2f80ed", "#9ad0f5", "#fff4d6"], ["#e8590c", "#ffc078", "#fff9db"], ["#16a34a", "#a9e34b", "#f4fce3"], ["#9333ea", "#d0bfff", "#f8f0fc"], ["#0891b2", "#99e9f2", "#e3fafc"], ["#6b7280", "#ced4da", "#f8f9fa"]];
function svg(i, num) {
  const [a, b, c] = PALETTES[i % PALETTES.length];
  const waves = Array.from({ length: 6 }, (_, k) => {
    const y = 60 + k * 85 + (i * 17) % 40;
    return `<path d="M0 ${y} C 200 ${y - 70 + k * 9}, 400 ${y + 80}, 800 ${y - 20}" stroke="${k % 2 ? a : b}" stroke-width="${26 - k * 2}" fill="none" opacity=".75"/>`;
  }).join("");
  const dots = Array.from({ length: 7 }, (_, k) => `<circle cx="${90 + ((k * 113 + i * 41) % 620)}" cy="${80 + ((k * 71 + i * 29) % 430)}" r="${18 + (k * 7) % 22}" fill="#fff" stroke="${a}" stroke-width="6"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
<rect width="800" height="600" fill="${c}"/>${waves}${dots}
<rect x="20" y="520" width="360" height="60" rx="12" fill="#fff" opacity=".9"/>
<text x="40" y="561" font-family="sans-serif" font-size="30" font-weight="bold" fill="#333">テスト用の仮画像 ${num}</text>
</svg>`;
}

const features = rows.map((r, i) => {
  const [place, ll, num, phase, hazard, title, body] = r;
  const [lat, lon] = ll || P[place];
  const key = `mock-${String(i + 1).padStart(2, "0")}.svg`;
  writeFileSync(join(OUT, "images", key), svg(i, num));
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lon, lat] },
    properties: {
      id: String(101 + i), field_23: phase, field_24: hazard, field_25: num, Message: title, Body: body, place,
      collage: null, Mabling: null, creationDate: "2026-11-27", images: ["images/" + key], status: "approved"
    }
  };
});
writeFileSync(join(OUT, "artworks.json"), JSON.stringify({ _fixture: true, type: "FeatureCollection", features }, null, 2) + "\n");
console.log(`dev/fixtures/ に ${features.length} 点のテスト用データを作りました`);
