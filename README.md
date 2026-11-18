# 箕輪小 防災行動マップ（公開版）

箕輪小学校4年6組の子どもたちがつくった防災アートを、保護者の方がスマホで見るためのサイトです。
12月12日のワークショップ（WS）の案内も出します。

- 公開URL：https://bo-sci-art.github.io/minowa-bousai-map/
- QRコード：[`qr/minowa-bousai-map-qr.png`](qr/minowa-bousai-map-qr.png)（印刷用 2400×2400px）、[`qr/minowa-bousai-map-qr.svg`](qr/minowa-bousai-map-qr.svg)（拡大しても荒れない版）
- 見るだけのサイトです。作品の登録・削除・非公開などの管理機能・管理画面はありません。作品を隠したり消したりするときは、授業用リポジトリ [WSsupportApp_minowa_2026](https://github.com/bo-sci-art/WSsupportApp_minowa_2026) で対応します（下の「2. 作品データを更新する」）

---

## 0. はじめて公開するとき（1回だけ）

1. https://github.com/bo-sci-art/minowa-bousai-map の「Settings」→ 左の「Pages」を開く
2. 「Build and deployment」の「Source」で **GitHub Actions** を選ぶ（「Deploy from a branch」ではない）
3. 「Actions」タブ → 「Deploy to GitHub Pages」→「Run workflow」を押す（または `main` に push する）
4. 緑のチェックになったら https://bo-sci-art.github.io/minowa-bousai-map/ を開いて確かめる

> 公開前に、授業用アプリの動作確認で登録したテスト作品が Worker に残っていないか確かめてください。
> 残っていると、そのまま保護者に見えます（消し方は「2. 作品データを更新する」）。

---

## 1. WSの情報を変える（コードは触りません）

WSの情報は、すべて [`config/workshop.json`](config/workshop.json) の1つのファイルにあります。

### GitHub のサイト上で変える手順
1. https://github.com/bo-sci-art/minowa-bousai-map を開き、`config` → `workshop.json` を押す
2. 右上の鉛筆マーク（Edit this file）を押す
3. `"` で囲まれた文字を書きかえる（`"` や `,` は消さない）
4. 右上の「Commit changes...」→ もう一度「Commit changes」を押す
5. 1〜2分で公開サイトに反映されます（「Actions」タブで緑のチェックになれば完了。赤い×のときは下の「困ったとき」）

### 項目の意味
| 項目 | 意味 | 書き方の例 |
|---|---|---|
| `enabled` | WSの案内を出すか。`false` にすると、すぐにすべて消える | `true` / `false`（`"` はつけない） |
| `title` | WS名 | `"防災力を育むデジタルアート制作ワークショップ"` |
| `summary` | 概要 | |
| `date` | 開催日（そのまま表示） | `"2026年12月12日（土）"` |
| `sessions` | 回ごとの名前・時間・会場。`{ ... }` を増やす・減らすと回の数が変わる | |
| `sessionNote` | 回の下に出す注意書き | |
| `target` / `capacity` / `childcare` / `bring` | 対象・定員・保育・持ち物。`""`（空）にするとその行は出ない | |
| `applyStart` | 申込開始日。この日より前は「〇月〇日から申し込めます」と出て、申込ボタンは出ない | `"2026-11-15"` |
| `applyEnd` | 申込締切日。**この日の23:59（日本時間）まで**案内を出し、次の日から自動ですべて消える | `"2026-12-06"` |
| `formUrl` | 「申し込む」ボタンで開くGoogleフォーム。forms.gle の短縮URLでもよい | `"https://forms.gle/xxxx"` |
| `flyerImage` | チラシ画像の場所。`""` にするとチラシは出ない | `"assets/ws-flyer-202612.jpg"` |

日付は必ず `"2026-12-06"` の形（年4けた-月2けた-日2けた）で書きます。

### WSの案内が出る場所（3つの導線）
1. 画面上のヘッダー右の「WSに参加する」ボタン（地図・作品のページ）
2. はじめてサイトを開いたときのお知らせ（2回目からは出ない）
3. 作品のページのいちばん下の「親子で一緒につくってみませんか？」

どれも「WS案内画面」（`workshop.html`）につながり、そこの「申し込む」でGoogleフォームが新しいタブで開きます。
`applyEnd` を過ぎるか `enabled` を `false` にすると、3つとも消えます。WS案内画面を直接開いた人には「申し込みは終了しました」と出ます。

### 次のWSに差し替えるとき
1. チラシ画像（JPG、横1500px くらい）を `assets/` に入れる
   - GitHub のサイト上なら `assets` フォルダを開き、「Add file」→「Upload files」
   - ファイル名は英数字にする（例 `ws-flyer-202703.jpg`）
2. `config/workshop.json` の全項目を新しいWSの内容に書きかえる
   - `applyStart` / `applyEnd` / `formUrl` / `flyerImage` を忘れずに
   - `enabled` を `true` にする
3. 「Commit changes」で保存
4. 初回のお知らせを、前のWSで見た人にももう一度出したいときは、`js/map.js` の `minowaMap.introSeen.v1` の `v1` を `v2` に変える（ここだけはコードです）

### 公開前に試したいとき（任意）
URLの最後に `?today=2026-12-07` をつけると、その日として表示を確かめられます（例：https://bo-sci-art.github.io/minowa-bousai-map/?today=2026-12-07 で締切後の表示）。設定は変わりません。

---

## 2. 作品データを更新する

作品の文章と画像は、このリポジトリには入っていません。
授業で使った Cloudflare Worker（`minowa-submit`）から、ページを開くたびに読み込んでいます（`status` が `approved` の作品だけ）。

- **作品を追加したとき**：何もしなくてよい。次にページを開いたときに反映されます
- **作品を直したいとき**：作品を直す手段（修正の API）はありません。授業用アプリで登録し直して、古い作品を下の方法で削除します
- **作品をマップから消したいとき**：授業用リポジトリの `worker/` フォルダで、管理用の合言葉（`ADMIN_KEY`。`worker/.admin_key` にあり、git には入っていない）を使って削除します。画像もいっしょに消え、元に戻せません

  ```bash
  curl -X DELETE -H "Authorization: Bearer $(cat .admin_key)" https://minowa-submit.kazuki131214.workers.dev/artworks/<id>
  ```

  `<id>` は作品のページのURL（`detail.html?id=123` の `123`）の番号です。
- **消す前に全作品を保存しておきたいとき**：同じく `worker/` フォルダで

  ```bash
  curl -H "Authorization: Bearer $(cat .admin_key)" -o minowa_artworks.geojson https://minowa-submit.kazuki131214.workers.dev/export
  ```

- **消さずに一時的に隠したいとき**：専用のボタンや API はありません。授業用リポジトリの `worker/` で、データベースの `status` を `approved` 以外に書きかえると、このサイトには出なくなります（`approved` に戻すとまた出ます）

  ```bash
  npx wrangler d1 execute minowa-artworks --remote --command "UPDATE artworks SET status='pending' WHERE id=<id>"
  ```

- くわしくは授業用リポジトリの `docs/cloudflare_setup.md` を見てください
- 授業用アプリの防災行動マップ（`workshop/present/script.js`）にある `HIDDEN_IDS` は、**授業用アプリの中の表示だけ**に効きます。このサイトには効きません
- **場所（固定5か所）の名前・座標を変えるとき**：[`js/common.js`](js/common.js) の `PLACES`（授業用アプリの `workshop/common/places.js` と同じにする。コードなので、エンジニアのメンバーに頼んでください）

> 注意：Worker を止めたり消したりすると、このサイトの作品も表示されなくなります。

---

## 3. QRコードを作り直す

URLが同じなら、作り直す必要はありません（`qr/` の画像をそのまま使えます）。

URLが変わったときなど、作り直す手順（パソコンに Node.js が入っていること）：

```bash
npm install
```

```bash
npm run qr
```

`qr/minowa-bousai-map-qr.png` と `.svg` が新しくなります。別のURLで作るときは：

```bash
node tools/make_qr.mjs https://example.com/ ファイル名
```

印刷するときは、QRコードのまわりの白い余白を切らないでください（読み取れなくなることがあります）。2cm角以上の大きさにしてください。

---

## 4. しくみ（エンジニア向け）

- ビルドなしの静的サイト：`index.html`（地図＋一覧）、`detail.html`（作品）、`workshop.html`（WS案内）、`css/`、`js/`、`assets/`、`config/`
- 地図：Leaflet 1.9.4（`assets/vendor/leaflet/` に同梱）＋ 国土地理院タイル・重ねるハザードマップ
- 作品データ：`GET https://minowa-submit.kazuki131214.workers.dev/artworks` と `/images/<key>`（読み込みのみ）。Worker 側の CORS で `https://bo-sci-art.github.io` を許可済み
- 場所：固定5か所（アピタテラス／新綱島駅／コンフォール南日吉／日吉の丘／北綱島ポンプ場）と「その他」
  - 固定5か所は、場所ごとに1つのピン（名前と作品の数）
  - 「その他」（`place` が `other`。子どもが地図にピンを置いた場所）は、作品ごとに丸い灰色のピン。押すと小さな表示が開き、「作品を見る」で作品のページへ
  - 場所の絞り込みで「その他」を選ぶと、「その他」の作品だけが一覧と地図に出る。作品のページの「前の作品／次の作品」は、一覧で選んでいた場所の中で動く
- 災害：授業用アプリは災害を選ばない（`field_24` は空）。そのため作品のページの「災害」の行は出さず、ハザードマップは洪水・高潮・土砂災害をまとめて重ねる。絞り込みの「災害の種類」は、災害が入った作品があるときだけ出る
- パスはすべて相対パスなので、`/minowa-bousai-map/` のサブパスでそのまま動く
- 公開：`main` に push すると [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) が動き、`tools/check_site.mjs` で
  1. 公開するファイルだけを `_site/` に集める（`dev/` は集めない）
  2. 管理機能・合言葉・書き込みの処理（`admin`、`ADMIN_KEY`、`Authorization`、`POST/DELETE/PATCH` など）がないか検索する
  3. テスト用データ（`dev/` フォルダ、`"_fixture"` の目印が入った JSON、`mock-` で始まる画像）が紛れ込んでいないか確かめる
  4. HTML・CSS の参照先がすべてあるか（リンク切れ・絶対パスがないか）確かめる

  問題があれば公開を止めます（Pages の公開元は「GitHub Actions」）

### 手元で確かめる

```bash
node tools/check_site.mjs
```

```bash
node tools/serve.mjs
```

http://localhost:5600/minowa-bousai-map/ を開く（公開と同じサブパスで配信します）。

### テスト用データで確かめる（手元だけ）

本番の作品がまだないときや、表示を確かめたいときは、手元だけで使うテスト用データを使います。
本番の Worker・データベースには何も送りません。

1. テスト用データを作る（`dev/fixtures/artworks.json` と仮の画像 `dev/fixtures/images/mock-XX.svg`）

   ```bash
   node tools/make_fixtures.mjs
   ```

2. 上の「手元で確かめる」と同じように `check_site.mjs` → `serve.mjs` を動かす
3. http://localhost:5600/minowa-bousai-map/?mock=1 を開く

- テスト用データを読むのは、**localhost / 127.0.0.1 で開き、かつ URL に `?mock=1` がついているときだけ**です。公開サイトでは `?mock=1` をつけても本番の Worker を読みます
- `?mock=1` で開いた画面から作品のページ・WS案内に進むと、リンクに `mock=1` を引き継ぎます
- 中身：13点（固定5か所に3・2・1・2・1点、「その他」に4点。うち1点は範囲の南西の端の近く）。番号は 4601〜4640、長いタイトル・長い本文の作品を1点含みます。本番では空の「災害」も、表示を確かめるために一部の作品に入れています
- 中身を変えるときは [`tools/make_fixtures.mjs`](tools/make_fixtures.mjs) の `rows` を書きかえて、もう一度動かします
- 画像は `make_fixtures.mjs` が描いた仮の図形です（実在の児童作品は使っていません）
- `dev/` は公開しません。`_site/` に紛れ込むと `check_site.mjs` が `NG` を出して公開を止めます
- 初回のお知らせをもう一度出したいときは、ブラウザの開発者ツールで localStorage の `minowaMap.introSeen.v1` を消します

## 困ったとき
- Actions が赤い×になった：Actions タブ → 失敗した実行 → 「公開するファイルを集めて確かめる」のログを見る。`NG ...` の行に理由が出ます。`config/workshop.json` の `"` や `,` の抜けが多いです
- Actions の「deploy」だけが失敗する：Settings → Pages の Source が「GitHub Actions」になっているか確かめる（「0. はじめて公開するとき」）
- 作品が出ない：「作品を読み込めませんでした」と出るときは Worker が止まっている可能性があります。「まだ作品はありません」と出るときは、公開中（`approved`）の作品が0件です
- 手元で `?mock=1` をつけても作品が出ない：`node tools/make_fixtures.mjs` を動かしたか、`localhost` か `127.0.0.1` で開いているか確かめる
