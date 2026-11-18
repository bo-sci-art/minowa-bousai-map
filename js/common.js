/* =========================================================
   箕輪小 防災行動マップ（公開版）— 全ページ共通
   - 作品データの読み込み先（読み込みのみ。書き込みの処理はない）
   - 固定5か所＋「その他」の場所・災害・いつの行動か
   - WS（ワークショップ）案内の表示・非表示（config/workshop.json）
   - 手元だけで使うテスト用データ（localhost で ?mock=1 のときだけ）
   ========================================================= */
(function () {
  "use strict";

  // 作品データ（読み込みのみ）：GET /artworks と GET /images/<key>
  var DATA_BASE = "https://minowa-submit.kazuki131214.workers.dev";

  // テスト用データ：手元（localhost / 127.0.0.1）で開き、URL に ?mock=1 があるときだけ dev/fixtures を読む
  //   公開サイトでは ?mock=1 をつけても本番の Worker を読む。dev/ は公開しない（tools/check_site.mjs）
  var LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]", "::1"];
  var MOCK = LOCAL_HOSTS.indexOf(location.hostname) >= 0 && new URLSearchParams(location.search).get("mock") === "1";
  var SOURCE = MOCK ? "dev/fixtures" : DATA_BASE;

  // 固定5か所：箕輪小版アプリ workshop/common/places.js の MINOWA_PLACES と同じ id・座標・色（名前はふりがななし）
  var PLACES = [
    { id: "apita", name: "アピタテラス", short: "アピタテラス", lat: 35.54195, lon: 139.641434, color: "#e8590c" },
    { id: "shintsunashima", name: "新綱島駅", short: "新綱島駅", lat: 35.536551, lon: 139.636642, color: "#2f80ed" },
    { id: "conforte", name: "コンフォール南日吉", short: "コンフォール南日吉", lat: 35.546082, lon: 139.634018, color: "#9333ea" },
    { id: "hiyoshinooka", name: "日吉の丘", short: "日吉の丘", lat: 35.548008, lon: 139.642441, color: "#16a34a" },
    { id: "pump", name: "北綱島ポンプ場", short: "北綱島ポンプ場", lat: 35.53960528, lon: 139.65348008, color: "#0891b2" }
  ];
  // 「その他」：児童が地図にピンを置いた場所。座標は作品ごとにちがう
  var OTHER = { id: "other", name: "その他", short: "その他", color: "#6b7280", isOther: true };
  var CHOICES = PLACES.concat([OTHER]);
  // 箕輪小のまわり（固定5か所のまん中あたり）
  var CENTER = [35.5425, 139.6420];

  var PHASES = [
    { value: "事前", label: "災害の前", key: "prior" },
    { value: "災害時", label: "災害のとき", key: "during" },
    { value: "復旧時", label: "災害のあと", key: "recovery" }
  ];

  // 保存されている災害名 → 画面の言葉
  //   箕輪小版アプリは災害を選ばない（field_24 は空）。値が入っていたときのための表
  //   ふりがな付き（洪水{こうずい}…）で入っていても、{…} を外してから引く
  var HAZARD_LABELS = {
    "洪水（外水氾濫）": "洪水（川があふれる）",
    "高潮": "高潮",
    "内水氾濫": "内水氾濫（水が街からあふれる）",
    "土砂災害（急傾斜地の崩壊）": "土砂災害（がけ崩れ）",
    "地震の揺れ（震度）": "地震の揺れ"
  };

  // 国土地理院「重ねるハザードマップ」のタイル
  var HZ = "https://disaportaldata.gsi.go.jp/raster/";
  var HAZARD_TILES = {
    flood_l2: { re: /洪水/, label: "洪水", url: HZ + "01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png", legend: "shinsui" },
    hightide: { re: /高潮/, label: "高潮", url: HZ + "03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png", legend: "shinsui" },
    kyukei: { re: /土砂|急傾斜/, label: "土砂災害", url: HZ + "05_kyukeishakeikaikuiki/{z}/{x}/{y}.png", legend: "dosha" }
  };

  // 横浜市「わいわい防災マップ」（箕輪小のまわりを中心に開く）
  var WAIWAI_NAISUI = "https://wwwm.city.yokohama.lg.jp/yokohama/Map?mid=65&mpx=139.6420&mpy=35.5425&mps=10000&mtp=dm&gprj=3";
  var WAIWAI_JISHIN = "https://wwwm.city.yokohama.lg.jp/yokohama/Map?mid=6&mpx=139.6420&mpy=35.5425&mps=10000&mtp=dm&gprj=3";

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // 固定5か所・「その他」の id から場所を引く
  function place(id) {
    for (var i = 0; i < CHOICES.length; i++) if (CHOICES[i].id === id) return CHOICES[i];
    return null;
  }
  // 作品の場所：固定5か所の id ならその場所、それ以外（other・空・知らない値）は「その他」
  function placeOf(f) {
    var p = place(f && f.properties && f.properties.place);
    return p && !p.isOther ? p : OTHER;
  }
  function isOther(f) { return placeOf(f).isOther === true; }
  // 地図に置く座標 [lat, lon]：固定5か所はその場所、「その他」は作品の座標（座標がなければ null）
  function latLngOf(f) {
    var p = placeOf(f);
    if (!p.isOther) return [p.lat, p.lon];
    var c = f.geometry && f.geometry.coordinates;
    return c && isFinite(c[0]) && isFinite(c[1]) ? [Number(c[1]), Number(c[0])] : null;
  }
  // 選んでいる場所（all / 固定5か所 / other）に入る作品か
  function inPlace(f, id) {
    if (!id || id === "all") return true;
    return placeOf(f).id === id;
  }
  function splitList(s) {
    return String(s || "").split(/[,、]\s*/).map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function stripRuby(s) { return String(s || "").replace(/\{[^{}]*\}/g, ""); }
  function phaseLabel(v) {
    for (var i = 0; i < PHASES.length; i++) if (PHASES[i].value === v) return PHASES[i].label;
    return v || "";
  }
  function hazardLabel(v) { var k = stripRuby(v); return HAZARD_LABELS[k] || k; }
  function imageUrl(p) {
    return p.images && p.images[0] ? SOURCE + "/" + p.images[0] : "";
  }
  function sortByNumber(a, b) {
    return String(a.properties.field_25 || "9999").localeCompare(String(b.properties.field_25 || "9999")) ||
      (Number(a.properties.id) - Number(b.properties.id));
  }
  // サイトの中のリンク：テスト用データで見ているときは ?mock=1 を引き継ぐ
  function link(href) {
    if (!MOCK) return href;
    return href + (href.indexOf("?") >= 0 ? "&" : "?") + "mock=1";
  }

  var artworksPromise = null;
  function fetchArtworks() {
    if (!artworksPromise) {
      var url = MOCK ? SOURCE + "/artworks.json" : DATA_BASE + "/artworks";
      if (MOCK) console.info("テスト用データ（dev/fixtures）を表示しています");
      artworksPromise = fetch(url, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (gj) {
          return (gj.features || []).filter(function (f) { return f.properties && f.properties.id; }).sort(sortByNumber);
        });
    }
    return artworksPromise;
  }

  // localStorage が使えない環境（プライベートモードなど）でも止まらないように
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  };

  /* ---------- WS案内（config/workshop.json） ---------- */
  // 日本時間の今日（YYYY-MM-DD）
  function todayJST() {
    return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  }
  // テスト用：URL に ?today=2026-12-07 をつけると、その日として判定する
  function today() {
    var q = new URLSearchParams(location.search).get("today");
    return q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : todayJST();
  }
  var wsPromise = null;
  function loadWorkshop() {
    if (!wsPromise) {
      wsPromise = fetch("config/workshop.json", { cache: "no-cache" })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (cfg) {
          var d = today();
          var active = cfg.enabled === true && !!cfg.applyEnd && d <= cfg.applyEnd;
          return { cfg: cfg, active: active, beforeStart: !!cfg.applyStart && d < cfg.applyStart };
        })
        .catch(function (e) {
          console.warn("WSの設定を読み込めませんでした", e);
          return { cfg: null, active: false, beforeStart: false };
        });
    }
    return wsPromise;
  }
  // data-ws のついた要素は、WS案内が有効なときだけ出す（最初は hidden）
  function revealWorkshopLinks() {
    if (MOCK) {
      document.querySelectorAll('a[href="workshop.html"], a[href="index.html"]').forEach(function (a) { a.href = link(a.getAttribute("href")); });
    }
    return loadWorkshop().then(function (ws) {
      if (ws.active) {
        document.querySelectorAll("[data-ws-field]").forEach(function (el) { el.textContent = ws.cfg[el.dataset.wsField] || ""; });
      }
      document.querySelectorAll("[data-ws]").forEach(function (el) { el.hidden = !ws.active; });
      return ws;
    });
  }

  window.BM = {
    DATA_BASE: DATA_BASE, MOCK: MOCK, PLACES: PLACES, OTHER: OTHER, CHOICES: CHOICES, CENTER: CENTER,
    PHASES: PHASES, HAZARD_TILES: HAZARD_TILES, WAIWAI_NAISUI: WAIWAI_NAISUI, WAIWAI_JISHIN: WAIWAI_JISHIN,
    esc: esc, place: place, placeOf: placeOf, isOther: isOther, latLngOf: latLngOf, inPlace: inPlace,
    splitList: splitList, stripRuby: stripRuby, phaseLabel: phaseLabel, hazardLabel: hazardLabel,
    imageUrl: imageUrl, sortByNumber: sortByNumber, link: link, fetchArtworks: fetchArtworks, store: store,
    loadWorkshop: loadWorkshop, revealWorkshopLinks: revealWorkshopLinks, today: today
  };
})();
