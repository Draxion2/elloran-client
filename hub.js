console.log("hub.js V-05/20/26 dragon-action-reactions-3");

/* ===== Tiny utils ===== */
  window.HUB = window.HUB || {};
  const $ = (sel) => document.querySelector(sel);
  const panels = {
    map: $("#panel-map"),
    cargo: $("#panel-cargo"),
    roost: $("#panel-roost"),
    quarters: $("#panel-quarters")
  };
  const backdrop = $("#backdrop");

const HUB_AMBIENCE_TRACKS = [
  {
    url: "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_hub_faint_wind.mp3",
    volume: 0.20
  },
  {
    url: "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_hub_gulls.mp3",
    volume: 0.20
  },
  {
    url: "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_hub_ocean_waves.mp3",
    volume: 0.20
  },
  {
    url: "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_hub_ship_creak.mp3",
    volume: 0.20
  }
];

let hubAmbienceStarted = false;
let hubAmbienceAudio = null;

function startHubAmbienceOnce() {
  if (hubAmbienceStarted) return;

  hubAmbienceStarted = true;

  const selected =
    HUB_AMBIENCE_TRACKS[Math.floor(Math.random() * HUB_AMBIENCE_TRACKS.length)];

  hubAmbienceAudio = new Audio(selected.url);

  hubAmbienceAudio.loop = true;
  hubAmbienceAudio.volume = selected.volume;

  hubAmbienceAudio.play().catch((err) => {
    console.warn("Hub ambience failed:", err);
    hubAmbienceStarted = false;
  });
}

  function toast(msg) {
    const t = $("#toast");
    if (!t) {
      console.log("TOAST:", msg);
      return;
    }
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1900);
  }

  function tweenNumber({
    from,
    to,
    duration = 350,
    onUpdate
  }) {
    const start = performance.now();
    const diff = to - from;

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutQuad easing
      const eased = t * (2 - t);
      const value = from + diff * eased;
      if (typeof onUpdate === "function") {
        onUpdate(value);
      }
      if (t < 1) {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  }
  let dragonsRefreshBlockedUntil = 0;
  async function refreshDragonsFromApiSafe() {
    const now = Date.now();
    if (now < dragonsRefreshBlockedUntil) return;
    try {
      await refreshDragonsFromApi();
    } catch (e) {
      // Back off for 60s on network/CORS failure
      dragonsRefreshBlockedUntil = now + 60000;
      console.warn(
        "refreshDragonsFromApi blocked for 60s after fetch failure",
        e
      );
    }
  }
  let restEndTimer = null;

  function scheduleRestEndRefresh(restUntilMs) {
    const endMs = Number(restUntilMs);
    if (!Number.isFinite(endMs) || endMs <= 0) return;
    const ms = Math.max(0, endMs - Date.now());
    if (restEndTimer) clearTimeout(restEndTimer);
    restEndTimer = setTimeout(async () => {
      await refreshDragonsFromApiSafe(); // will fetch, re-render, and apply new DB truth
    }, ms + 300); // small buffer for DB write
  }

  function closeAll() {
    Object.values(panels).forEach((p) => p && p.classList.remove("open"));
    backdrop && backdrop.classList.remove("show");
  }

  function formatRestCountdown(restUntilMs) {
    const left = Math.max(0, restUntilMs - Date.now());
    const totalSec = Math.floor(left / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${String(s).padStart(2, "0")}s`;
  }
  let isTyping = false;

  function speak(text) {
    if (isTyping || !text) return;
    const line = $("#line");
    if (!line) return;
    isTyping = true;
    const buttons = document.querySelectorAll(".btn[data-panel]");
    buttons.forEach((b) => (b.disabled = true));
    line.textContent = "";
    let i = 0;
    (function type() {
      line.textContent += text.charAt(i);
      i++;
      if (i < text.length) {
        const ch = text.charAt(i - 1);
        let d = 24;
        if (ch === "," || ch === ";") d = 70;
        if (ch === "." || ch === "!" || ch === "?") d = 110;
        setTimeout(type, d);
      } else {
        setTimeout(() => {
          isTyping = false;
          buttons.forEach((b) => (b.disabled = false));
        }, 220);
      }
    })();
  }

  function updateRosterRestTimers() {
    document.querySelectorAll(".rest-mini").forEach((el) => {
      const until = parseInt(el.dataset.restUntil, 10);
      const timeEl = el.querySelector(".rest-time");
      if (!Number.isFinite(until) || !timeEl) return;
      const left = until - Date.now();
      if (left <= 0) {
        timeEl.textContent = "Ready";
        el.classList.add("rest-done");
        return;
      }
      timeEl.textContent = formatRestCountdown(until);
    });
  }

  function getStamina(d) {
    const max = 5; // keep in sync with backend
    const cur = Number.isFinite(+d?.action_points_current) ? (+d.action_points_current) : max;
    const resetAt = d?.action_points_reset_at != null ? parseInt(d.action_points_reset_at, 10) : null;
    return {
      cur: Math.max(0, Math.min(max, cur)),
      max,
      resetAt
    };
  }

  function fmtMs(ms) {
    ms = Math.max(0, ms | 0);
    const m = Math.ceil(ms / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.ceil(m / 60);
    return `${h}h`;
  }

  function applyDragonPatch(local, apiDr) {
    if (!local || !apiDr) return;
    // core stats
    if (apiDr.hp != null) local.hp = Number(apiDr.hp);
    if (apiDr.hp_max != null) local.hpMax = Number(apiDr.hp_max);
    if (apiDr.mood != null) local.mood = Number(apiDr.mood);
    if (apiDr.hunger != null) local.hunger = Number(apiDr.hunger);
    if (apiDr.bond != null) local.bond = Number(apiDr.bond);
    // NEW: tier system / stamina truth
    if (apiDr.action_points_current != null) local.action_points_current = Number(apiDr.action_points_current);
    if (apiDr.action_points_reset_at != null) local.action_points_reset_at = Number(apiDr.action_points_reset_at);
    if (apiDr.action_streaks != null) local.action_streaks = apiDr.action_streaks;
    local.happiness = deriveHappiness(local.mood, local.hunger);
  }
  /* ===== Xano API config ===== */
  const API_BASE = "https://xqgu-nq5e-7wvz.n7e.xano.io/api:thFaVU7E";
  // Unified fetch helper with auth + redirect-on-fail
  async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("elloran.authToken");
    // No token → bounce to login
    if (!token) {
      window.location.href =
        "https://draxtesting.forumotion.com/h1-title-page-completed";
      throw new Error("No auth token");
    }
    const cfg = {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    };
    const res = await fetch(API_BASE + path, cfg);
    // Expired/invalid token → clear + redirect
    if (res.status === 401) {
      localStorage.removeItem("elloran.authToken");
      window.location.href =
        "https://draxtesting.forumotion.com/h1-title-page-completed";
      throw new Error("Unauthorized / token expired");
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${path} failed: ${res.status} ${text}`);
    }
    const txt = await res.text();
    return txt ? JSON.parse(txt) : {};
  }

  function getAuthToken() {
    return localStorage.getItem("elloran.authToken");
  }
  /* ===== Inventory save → Xano ===== */
  const SAVE_DEBOUNCE_MS = 600;
  let saveInventoryTimeout = null;
  // Turn STATE.inventory + STATE.cargo into a write payload
  function serializeInventoryForSave() {
    const result = [];
    const add = (grid, containerName) => {
      grid.forEach((slot) => {
        if (!slot) return;
        if (!slot.item || !slot.item.id) return;
        if (slot.qty <= 0) return;
        result.push({
          items_id: slot.item.id,
          qty: slot.qty,
          container: containerName // "backpack" or "cargo"
        });
      });
    };
    // Backpack = INVENTORY / player bag
    add(STATE.inventory, "backpack");
    // Cargo hold grid
    add(STATE.cargo, "cargo");
    return {
      inventory: result
    };
  }
  async function saveInventoryLayout() {
    const payload = serializeInventoryForSave();
    try {
      await apiFetch("/players/me/inventory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      console.log("Inventory layout saved to backend.");
      // optional tiny feedback:
      // toast('Cargo saved.');
    } catch (err) {
      console.error("Failed to save inventory layout:", err);
      toast("Could not save cargo layout.");
    }
  }

  function scheduleInventorySave() {
    if (saveInventoryTimeout) clearTimeout(saveInventoryTimeout);
    saveInventoryTimeout = setTimeout(saveInventoryLayout, SAVE_DEBOUNCE_MS);
  }
  /* ================= Global State ================= */
  // IDs of items currently EQUIPPED (from /players/me/equipment)
  const LOCKED_ITEM_IDS = new Set();
  const STATE = {
    player: {
      id: null,
      name: "Captain",
      class: null,
      level: 1,
      hp_current: 0,
      hp_max: 0,
      gold: 0
    },
    items: [],
    invSize: 12,
    cargoSize: 30,
    inventory: new Array(12).fill(null),
    cargo: new Array(30).fill(null),
    dragons: {
      activeId: null,
      byId: {}
    },
    favorites: new Set(),
    lastUsed: {},
    bond: 0,
    _onInventoryChange: null
  };

  function addToGrid(grid, item, qty) {
    // Stack into existing stacks first
    for (let i = 0; i < grid.length && qty > 0; i++) {
      const s = grid[i];
      if (s && s.item.id === item.id && s.qty < item.stack_size) {
        const can = item.stack_size - s.qty;
        const mv = Math.min(can, qty);
        s.qty += mv;
        qty -= mv;
      }
    }
    // Then fill empty slots
    for (let i = 0; i < grid.length && qty > 0; i++) {
      if (!grid[i]) {
        const mv = Math.min(item.stack_size, qty);
        grid[i] = {
          item,
          qty: mv,
          // mark as locked if this item is currently equipped
          locked: LOCKED_ITEM_IDS.has(item.id)
        };
        qty -= mv;
      }
    }
  }
  // Map Xano item → front-end item
  function normalizeItem(raw) {
    return {
      id: raw.id,
      created_at: raw.created_at,
      collection: raw.collection || "General",
      item_code: raw.item_code,
      name: raw.name,
      category: raw.category,
      subcategory: raw.subcategory,
      rarity: raw.rarity || "Common",
      value: Number(raw.value || 0),
      stack_size: Math.max(1, Number(raw.stack_size || 1)),
      equip_slot: raw.equip_slot || null,
      req_class: raw.req_class || null,
      req_level: Number(raw.req_level || 0),
      description: raw.description || "",
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      effect_json: raw.effect_json || {},
      img_url: (() => {
        if (typeof raw.img_url === "string") return raw.img_url;
        if (raw.img_url && raw.img_url.url) return raw.img_url.url;
        if (raw.img_url && raw.img_url.path) return raw.img_url.path;
        return "";
      })()
    };
  }

  function deriveHappiness(mood, hunger) {
    const raw = 0.7 * (mood || 0) + 0.3 * (100 - (hunger || 0));
    return Math.max(0, Math.min(100, Math.round(raw)));
  }
  /* ================= Xano wiring (players + inventory + active dragon) ================= */
  function applyPlayerDataFromApi(player) {
    if (!player) return;
    STATE.player = Object.assign({}, STATE.player, {
      id: player.id,
      name: player.name || STATE.player.name,
      class: (player.class || STATE.player.class || "").toLowerCase(),
      level: player.level ?? STATE.player.level ?? 1,
      hp_current: player.hp_current ?? player.hp_max ?? STATE.player.hp_current,
      hp_max: player.hp_max ?? player.hp_current ?? STATE.player.hp_max,
      gold: player.celestial_silver ?? player.gold ?? STATE.player.gold
    });
    // Topbar pill (name + level)
    const pill = document.querySelector(".topbar .pill");
    if (pill) {
      const nameEl = pill.querySelector("strong");
      const lvlEl = pill.querySelector("span.pill");
      if (nameEl) nameEl.textContent = STATE.player.name;
      if (lvlEl) lvlEl.textContent = "Lvl " + STATE.player.level;
    }
    // HP bar + text
    const hpIn = $("#hpIn");
    const hpTxt = document.querySelector(".topbar .num");
    if (STATE.player.hp_max && hpIn) {
      const pct = Math.max(
        0,
        Math.min(
          100,
          Math.round((100 * STATE.player.hp_current) / STATE.player.hp_max)
        )
      );
      hpIn.style.width = pct + "%";
    }
    if (hpTxt) {
      hpTxt.textContent = `${STATE.player.hp_current || 0} / ${
      STATE.player.hp_max || 0
    }`;
    }
    // Gold / Celestial Silver
    const goldEl = $("#gold");
    if (goldEl) goldEl.textContent = STATE.player.gold;
  }

  function applyActiveDragonFromApi(activeDragon) {
    if (!activeDragon) return;
    const existing = STATE.dragons.byId[activeDragon.id] || {};
    const speciesObj = activeDragon.species || {};
    const d = {
      id: activeDragon.id,
      code: activeDragon.code || existing.code || speciesObj.code || "DRAGON",
      name: activeDragon.name || existing.name || "Unnamed",
      element: activeDragon.element || existing.element || "Neutral",
      species: speciesObj.name || existing.species || "Dragon",
      img: activeDragon.img_url || existing.img || "",
      rarity: existing.rarity || "Common",
      size: existing.size || "Small",
      trait: existing.trait || "—",
      level: activeDragon.level ?? existing.level ?? 1,
      hp: activeDragon.hp_current ??
        activeDragon.hp ??
        existing.hp ??
        activeDragon.hp_max ??
        1,
      hpMax: activeDragon.hp_max ?? existing.hpMax ?? activeDragon.hp_current ?? 1,
      mood: existing.mood ?? 60,
      hunger: existing.hunger ?? 40,
      bond: existing.bond ?? STATE.bond ?? 0,
      rest_until_at: activeDragon.rest_until_at ?? null
    };
    d.happiness = deriveHappiness(d.mood, d.hunger);
    STATE.dragons.byId[d.id] = d;
    STATE.dragons.activeId = d.id;
    STATE.lastUsed[d.id] = Date.now();
  }

  function applyInventoryFromApi(apiInventory) {
    // Reset
    STATE.items = [];
    STATE.inventory = new Array(STATE.invSize).fill(null);
    STATE.cargo = new Array(STATE.cargoSize).fill(null);
    const itemsById = {};

    function getOrMakeItem(rawItem) {
      if (!rawItem) return null;
      const id = rawItem.id;
      if (itemsById[id]) return itemsById[id];
      const norm = normalizeItem(rawItem);
      itemsById[id] = norm;
      STATE.items.push(norm);
      return norm;
    }
    (apiInventory || []).forEach((entry) => {
      if (!entry) return;
      if (entry.qty <= 0) return; // ignore zero-qty junk
      const rawItem = entry.item || entry;
      const item = getOrMakeItem(rawItem);
      if (!item) return;
      const container = (entry.container || "").toLowerCase();
      if (container === "equipped") {
        return;
      }
      const grid =
        container === "backpack" || !container ? STATE.inventory : STATE.cargo;
      addToGrid(grid, item, entry.qty || 1);
    });
    if (typeof STATE._onInventoryChange === "function") {
      STATE._onInventoryChange();
    }
  }
  async function loadPlayerHubData() {
    try {
      const [
        playerPayload,
        invPayload,
        eqPayload,
        roostPayload
      ] = await Promise.all([
        apiFetch("/players/me"),
        apiFetch("/players/me/inventory"),
        // equipment might fail separately; don't hard-crash hub if it does
        apiFetch("/players/me/equipment").catch((err) => {
          console.warn("players/me/equipment failed:", err);
          return {};
        }),
        // dragons endpoint (can fail without killing the hub)
        apiFetch("/players/me/dragons").catch((err) => {
          console.warn("players/me/dragons failed:", err);
          return null;
        })
      ]);
      const playerObj = playerPayload.player || playerPayload;
      const invList = Array.isArray(invPayload.inventory) ?
        invPayload.inventory : [];
      const eqList = Array.isArray(eqPayload.equipment) ?
        eqPayload.equipment : [];
      // Build set of equipped item IDs so we can lock them in the hub
      LOCKED_ITEM_IDS.clear();
      eqList.forEach((row) => {
        const item = row.item || row;
        if (item && item.id) {
          LOCKED_ITEM_IDS.add(item.id);
        }
      });
      applyPlayerDataFromApi(playerObj);
      // ----- Roost: build dragon roster from backend -----
      // Reset dragons state so we don't keep stale entries between loads
      if (roostPayload && Array.isArray(roostPayload.dragons) && roostPayload.dragons.length) {
        // ✅ Only reset once we actually have good data
        STATE.dragons.byId = {};
        STATE.lastUsed = {};
        STATE.favorites = new Set();
        roostPayload.dragons.forEach((raw) => {
          const speciesObj = raw.species || {};
          const d = {
            id: Number(raw.id),
            code: raw.code || speciesObj.code || "DRAGON",
            name: raw.name || speciesObj.name || "Unnamed",
            element: raw.element || "Neutral",
            species: speciesObj.name || "Dragon",
            img: raw.img_url || "",
            rarity: speciesObj.rarity || "Common",
            size: "Small",
            trait: "—",
            level: raw.level ?? 1,
            hp: raw.hp ?? raw.hp_current ?? raw.hp_max ?? 1,
            hpMax: raw.hp_max ?? raw.hp ?? raw.hp_current ?? 1,
            mood: raw.mood ?? 60,
            hunger: raw.hunger ?? 40,
            bond: raw.bond ?? 0,
            rest_until_at: raw.rest_until_at != null ? parseInt(raw.rest_until_at, 10) : null,
            action_points_current: raw.action_points_current != null ? parseInt(raw.action_points_current, 10) : 5,
            action_points_reset_at: raw.action_points_reset_at != null ? parseInt(raw.action_points_reset_at, 10) : null,
            action_streaks: raw.action_streaks || {}
          };
          d.happiness = deriveHappiness(d.mood, d.hunger);
          STATE.dragons.byId[d.id] = d;
          if (raw.is_favorite) STATE.favorites.add(d.id);
          STATE.lastUsed[d.id] = Date.now();
        });
        if (STATE.dragons.selectedId != null && !STATE.dragons.byId[STATE.dragons.selectedId]) {
          STATE.dragons.selectedId = null;
        }
        // set activeId (same as your existing logic, but cast to Number)
        let activeId = null;
        if (roostPayload.active_id != null) {
          activeId = typeof roostPayload.active_id === "object" ? roostPayload.active_id.id : roostPayload.active_id;
        } else if (playerObj.dragon_active_id != null) {
          activeId = playerObj.dragon_active_id;
        }
        activeId = activeId != null ? Number(activeId) : null;
        STATE.dragons.activeId = (activeId != null && STATE.dragons.byId[activeId]) ? activeId : STATE.dragons.activeId;
      } else {
        // ✅ truly keep existing dragon state
        console.warn("Roost payload missing/empty; keeping existing dragon state.");
      }
      applyInventoryFromApi(invList);
    } catch (err) {
      console.error(err);
      toast("Failed to load live player data.");
      speak(
        "Hm. The message tubes are jammed. Try refreshing or logging in again."
      );
    }
  }
  /* ================= Cargo Hold ================= */
  let cargoMounted = false;

  function initCargoHold() {
    if (cargoMounted) return;
    cargoMounted = true;
    const scope = panels.cargo,
      mount = scope.querySelector("#cargo-app");
    if (!mount) return;
    mount.innerHTML = `
    <div class="wrap">
      <div class="top">
        <div class="stat" id="invStat">Inventory</div>
        <div class="stat" id="cargoStat">Cargo</div>
        <div class="grow"></div>
        <div class="field">
          <input id="search" placeholder="Search name or code" />
          <select id="filterCat"><option value="">All Categories</option></select>
          <select id="sortBy">
            <option value="name">Name A→Z</option>
            <option value="rarity">Rarity</option>
            <option value="value">Value ↓</option>
          </select>
        </div>
        <div class="ctrls">
          <button class="btn" id="actMove" disabled>Move</button>
          <button class="btn" id="actSplit" disabled>Split…</button>
          <button class="btn" id="actQuick" disabled>Quick-move</button>
        </div>
      </div>
      <div class="grids">
        <section class="panelX"><h3>Inventory</h3><div id="invGrid" class="grid" data-kind="inv"></div></section>
        <section class="panelX"><h3>Cargo Hold</h3><div id="cargoGrid" class="grid" data-kind="cargo"></div></section>
      </div>
    </div>`;
    const tip = document.getElementById("cargoTip");
    try {
      if (tip && tip.parentElement !== document.body)
        document.body.appendChild(tip);
    } catch (e) {}
    const invEl = scope.querySelector("#invGrid");
    const cargoEl = scope.querySelector("#cargoGrid");
    const invStat = scope.querySelector("#invStat");
    const cargoStat = scope.querySelector("#cargoStat");
    const searchEl = scope.querySelector("#search");
    const filterCat = scope.querySelector("#filterCat");
    const sortBy = scope.querySelector("#sortBy");
    const actMove = scope.querySelector("#actMove");
    const actSplit = scope.querySelector("#actSplit");
    const actQuick = scope.querySelector("#actQuick");
    let sel = null; // {kind, idx}
    function rarityClass(r) {
      return "rar-" + (r || "Common");
    }

    function cnt(g) {
      return g.filter(Boolean).length;
    }

    function updateStats() {
      if (invStat)
        invStat.textContent = `Inventory ${cnt(STATE.inventory)}/${
        STATE.invSize
      }`;
      if (cargoStat)
        cargoStat.textContent = `Cargo ${cnt(STATE.cargo)}/${STATE.cargoSize}`;
    }

    function buildFilters() {
      const cats = [
        ...new Set(
          [...STATE.inventory, ...STATE.cargo]
          .filter(Boolean)
          .map((s) => s.item.category)
        )
      ].sort();
      const v = filterCat.value;
      filterCat.innerHTML =
        '<option value="">All Categories</option>' +
        cats
        .map((c) => `<option ${c === v ? "selected" : ""}>${c}</option>`)
        .join("");
    }

    function sortItems(a, b) {
      const mode = sortBy.value;
      if (mode === "name") return a.item.name.localeCompare(b.item.name);
      if (mode === "rarity") {
        const order = {
          Mythic: 6,
          Legendary: 5,
          "Very Rare": 4,
          Rare: 3,
          Uncommon: 2,
          Common: 1
        };
        return (
          (order[b.item.rarity] || 0) - (order[a.item.rarity] || 0) ||
          a.item.name.localeCompare(b.item.name)
        );
      }
      if (mode === "value")
        return (
          b.item.value - a.item.value || a.item.name.localeCompare(b.item.name)
        );
      return 0;
    }

    function filterFn(s) {
      if (!s) return false;
      const q = searchEl.value.trim().toLowerCase();
      const cat = filterCat.value;
      const it = s.item;
      if (cat && it.category !== cat) return false;
      if (q) {
        const hay = (it.name + " " + it.item_code).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }

    function canEquip(it) {
      const okC = !it.req_class ||
        it.req_class
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .includes((STATE.player.class || "").toLowerCase());
      const okL = (STATE.player.level || 1) >= (it.req_level || 0);
      return okC && okL && !!it.equip_slot;
    }

    function effectSummary(effect) {
      if (!effect || typeof effect !== "object") return "";
      const out = [];
      const mods = effect.on_equip && effect.on_equip.stat_mods;
      if (mods) {
        for (const [k, v] of Object.entries(mods)) {
          const label = k.charAt(0).toUpperCase() + k.slice(1);
          out.push(`${v >= 0 ? "+" : ""}${v} ${label}`);
        }
      }
      return out.join(", ");
    }
    const cargoTip = document.getElementById("cargoTip");

    function showTip(item, x, y) {
      if (!cargoTip) return;
      const eff = effectSummary(item.effect_json);
      const rarity = item.rarity || "Common";
      const code = item.item_code || "";
      const cat = item.category || "";
      const sub = item.subcategory || "";
      const isMat = cat === "Material" || (item.tags || []).includes("MATERIAL");
      const eq = item.equip_slot ?
        `Equip: ${item.equip_slot}` +
        (item.req_level ? ` • Req Lv ${item.req_level}` : "") +
        (item.req_class ? ` • Class ${item.req_class}` : "") :
        "";
      cargoTip.innerHTML = `<div class="t1">${item.name || code}</div>
      <div class="meta"><span class="rp rp-${rarity}">${rarity}</span>${
      code ? `<span>• ${code}</span>` : ""
    }</div>
      <div class="minor">${cat}${sub ? " • " + sub : ""}</div>
      ${eq ? `<div class="minor">${eq}</div>` : ""}
      ${isMat ? `<div class="minor">Material: ${sub || cat}</div>` : ""}
      <div class="minor">Value: ${
        Number.isFinite(item.value) ? item.value : 0
      } • Stack Size: ${item.stack_size || 1}</div>
      <div style="margin-top:6px;color:#c9bfa9">${item.description || ""}</div>
      ${eff ? `<div style="margin-top:6px;color:#79c879">${eff}</div>` : ""}
      <div class="chips">${(item.tags || [])
        .map((t) => `<span class="chip">${t}</span>`)
        .join("")}</div>`;
      cargoTip.style.display = "block";
      const pad = 12,
        rect = cargoTip.getBoundingClientRect();
      let tx = x + 12,
        ty = y + 12,
        vw = innerWidth,
        vh = innerHeight;
      if (tx + rect.width > vw) tx = Math.max(pad, vw - rect.width - pad);
      if (ty + rect.height > vh) ty = Math.max(pad, vh - rect.height - pad);
      cargoTip.style.left = tx + "px";
      cargoTip.style.top = ty + "px";
    }

    function buildSlot(kind, idx, s) {
      const el = document.createElement("div");
      el.className = "slot";
      el.dataset.kind = kind;
      el.dataset.idx = idx;
      el.ondragover = (e) => {
        e.preventDefault();
        el.classList.add("dragover");
      };
      el.ondragleave = () => {
        el.classList.remove("dragover");
      };
      el.ondrop = (e) => {
        e.preventDefault();
        el.classList.remove("dragover");
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        handleDrop(data, kind, idx, e.shiftKey);
      };
      if (s) {
        const c = document.createElement("div");
        c.className = `card ${rarityClass(s.item.rarity)}`;
        c.draggable = true;
        const img = document.createElement("div");
        img.className = "img";
        img.style.backgroundImage = `url('${s.item.img_url}')`;
        const nm = document.createElement("div");
        nm.className = "nm";
        nm.textContent = s.item.name;
        const qty = document.createElement("div");
        qty.className = "qty";
        qty.textContent = s.qty;
        c.appendChild(img);
        c.appendChild(nm);
        c.appendChild(qty);
        if (!canEquip(s.item) && s.item.equip_slot) {
          const lock = document.createElement("div");
          lock.className = "lock";
          lock.textContent = "LOCK";
          c.appendChild(lock);
        }
        c.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({
              from: kind,
              index: idx
            })
          );
          if (cargoTip) cargoTip.style.display = "none";
        });
        c.addEventListener("mouseenter", (e) =>
          showTip(s.item, e.clientX, e.clientY)
        );
        c.addEventListener("mousemove", (e) =>
          showTip(s.item, e.clientX, e.clientY)
        );
        c.addEventListener("mouseleave", () => {
          if (cargoTip) cargoTip.style.display = "none";
        });
        c.addEventListener("click", () => {
          sel = {
            kind,
            idx
          };
          updateActions();
        });
        el.appendChild(c);
      }
      return el;
    }

    function updateActions() {
      const has = !!sel;
      actMove.disabled = !has;
      actSplit.disabled = !has;
      actQuick.disabled = !has;
    }

    function render() {
      invEl.innerHTML = "";
      cargoEl.innerHTML = "";
      const invList = STATE.inventory
        .map((s, i) => s && {
          slot: i,
          item: s.item,
          qty: s.qty
        })
        .filter(Boolean)
        .filter(filterFn)
        .sort(sortItems);
      const cargoList = STATE.cargo
        .map((s, i) => s && {
          slot: i,
          item: s.item,
          qty: s.qty
        })
        .filter(Boolean)
        .filter(filterFn)
        .sort(sortItems);
      const invSlots = new Array(STATE.invSize).fill(null);
      invList.forEach((x) => {
        invSlots[x.slot] = STATE.inventory[x.slot];
      });
      const cargoSlots = new Array(STATE.cargoSize).fill(null);
      cargoList.forEach((x) => {
        cargoSlots[x.slot] = STATE.cargo[x.slot];
      });
      for (let i = 0; i < STATE.invSize; i++)
        invEl.appendChild(buildSlot("inv", i, invSlots[i]));
      for (let i = 0; i < STATE.cargoSize; i++)
        cargoEl.appendChild(buildSlot("cargo", i, cargoSlots[i]));
      updateStats();
      buildFilters();
      updateActions();
    }

    function moveBetween(fromGrid, toGrid, fromIdx, qty) {
      const src = fromGrid[fromIdx];
      if (!src) return 0;
      const item = src.item;
      let remain = qty;
      for (let i = 0; i < toGrid.length && remain > 0; i++) {
        const s = toGrid[i];
        if (s && s.item.id === item.id && s.qty < item.stack_size) {
          const can = item.stack_size - s.qty;
          const mv = Math.min(can, remain);
          s.qty += mv;
          remain -= mv;
        }
      }
      for (let i = 0; i < toGrid.length && remain > 0; i++) {
        if (!toGrid[i]) {
          const mv = Math.min(item.stack_size, remain);
          toGrid[i] = {
            item,
            qty: mv,
            locked: src.locked === true
          };
          remain -= mv;
        }
      }
      const moved = qty - remain;
      src.qty -= moved;
      if (src.qty <= 0) fromGrid[fromIdx] = null;
      return moved;
    }

    function swapOrMerge(toGrid, toIdx, item, qty, lockedFlag) {
      const dst = toGrid[toIdx];
      if (!dst) {
        const mv = Math.min(item.stack_size, qty);
        toGrid[toIdx] = {
          item,
          qty: mv,
          locked: lockedFlag === true
        };
        return mv;
      }
      if (dst.item.id === item.id && dst.qty < item.stack_size) {
        const can = item.stack_size - dst.qty;
        const mv = Math.min(can, qty);
        dst.qty += mv;
        // if either side is locked, keep it locked
        dst.locked = dst.locked || lockedFlag === true;
        return mv;
      }
      return -1; // swap
    }

    function handleDrop(data, toKind, toIdx, splitKey) {
      const fromKind = data.from,
        fromIdx = data.index;
      if (fromKind === toKind && fromIdx === toIdx) return;
      const fromGrid = fromKind === "inv" ? STATE.inventory : STATE.cargo;
      const toGrid = toKind === "inv" ? STATE.inventory : STATE.cargo;
      const src = fromGrid[fromIdx];
      if (!src) return;
      // Block moving equipped items between inventory & cargo
      if (src.locked && fromKind !== toKind) {
        toast(
          "You can't move equipped gear here. Unequip it first on the Stats & Equipment page."
        );
        return;
      }
      let qty = src.qty;
      if (splitKey && qty > 1) {
        const n = parseInt(
          prompt(`Move how many? (1-${qty})`, Math.floor(qty / 2)),
          10
        );
        if (!isFinite(n) || n <= 0 || n > qty) return;
        qty = n;
      }
      const mv = swapOrMerge(toGrid, toIdx, src.item, qty, src.locked);
      if (mv > 0) {
        src.qty -= mv;
        if (src.qty <= 0) fromGrid[fromIdx] = null;
        render();
        scheduleInventorySave();
        return;
      }
      if (mv === -1) {
        const tmp = toGrid[toIdx];
        toGrid[toIdx] = src;
        fromGrid[fromIdx] = tmp;
        render();
        scheduleInventorySave();
        return;
      }
      moveBetween(fromGrid, toGrid, fromIdx, qty);
      render();
      scheduleInventorySave();
    }
    actMove.onclick = () => doMoveSelected(true);
    actQuick.onclick = () => doMoveSelected(false);
    actSplit.onclick = () => {
      if (!sel) return;
      const grid = sel.kind === "inv" ? STATE.inventory : STATE.cargo;
      const src = grid[sel.idx];
      if (!src || src.qty < 2) return;
      const n = parseInt(
        prompt(
          `Split how many from ${src.qty}? (1-${src.qty - 1})`,
          Math.floor(src.qty / 2)
        ),
        10
      );
      if (!isFinite(n) || n <= 0 || n >= src.qty) return;
      for (let i = 0; i < grid.length; i++) {
        if (!grid[i]) {
          grid[i] = {
            item: src.item,
            qty: n,
            locked: src.locked === true
          };
          src.qty -= n;
          break;
        }
      }
      render();
      scheduleInventorySave();
    };

    function doMoveSelected(askQty) {
      if (!sel) return;
      const fromGrid = sel.kind === "inv" ? STATE.inventory : STATE.cargo;
      const toGrid = sel.kind === "inv" ? STATE.cargo : STATE.inventory;
      const src = fromGrid[sel.idx];
      if (!src) return;
      // Block moving equipped items between inventory & cargo
      if (src.locked) {
        toast(
          "You can't move equipped gear here. Unequip it first on the Stats & Equipment page."
        );
        return;
      }
      let qty = src.qty;
      if (askQty && qty > 1) {
        const n = parseInt(prompt(`Move how many? (1-${qty})`, qty), 10);
        if (!isFinite(n) || n <= 0 || n > qty) return;
        qty = n;
      }
      const mvIndex = swapOrMerge(toGrid, sel.idx, src.item, qty, src.locked);
      if (mvIndex > 0) {
        src.qty -= mvIndex;
        if (src.qty <= 0) fromGrid[sel.idx] = null;
        render();
        sel = null;
        scheduleInventorySave();
        return;
      }
      if (mvIndex === -1) {
        const tmp = toGrid[sel.idx];
        toGrid[sel.idx] = src;
        fromGrid[sel.idx] = tmp;
        render();
        sel = null;
        scheduleInventorySave();
        return;
      }
      const moved = moveBetween(fromGrid, toGrid, sel.idx, qty);
      if (moved <= 0) toast("No space on other side");
      render();
      sel = null;
      scheduleInventorySave();
    }
    // Initial paint (might be empty until API finishes)
    render();
    // Let API updates re-render live
    STATE._onInventoryChange = render;
  }
  /* ================= Roost (Enhanced) ================= */
  let roostMounted = false;
  /* ================= Roost action button gating (GLOBAL SAFE) ================= */
  /* ================= Roost action button gating (GLOBAL SAFE) ================= */
  // Central rule: hunger >= 80 locks everything except Feed.
  // Optional extra: mood >= 100 locks “happy” actions (play/groom) but NOT feed.
  // (Train/Raid/Breed can be whatever you want later; for now they are allowed unless hungry.)
  function getDragonLocks(
    d = STATE?.dragons?.byId?.[STATE?.dragons?.activeId] || null
  ) {
    if (!d) {
      return {
        feed: true,
        play: true,
        groom: true,
        train: true,
        raid: true,
        breed: true,
        reason: "No active dragon."
      };
    }
    const restUntil = parseInt(d.rest_until_at, 10);
    if (Number.isFinite(restUntil) && restUntil > Date.now()) {
      return {
        feed: true,
        play: true,
        groom: true,
        train: true,
        raid: true,
        breed: true,
        rest: true, // ???? IMPORTANT
        reason: "Dragon is resting."
      };
    }
    const tooHungry = (d.hunger ?? 0) >= 80;
    const satisfied = (d.mood ?? 0) >= 100;
    if (tooHungry) {
      return {
        feed: false,
        play: true,
        groom: true,
        train: true,
        raid: true,
        breed: true,
        reason: "Too hungry — feed first."
      };
    }
    if (satisfied) {
      return {
        feed: false,
        play: true,
        groom: true,
        train: false,
        raid: false,
        breed: false,
        reason: "Already satisfied."
      };
    }
    return {
      feed: false,
      play: false,
      groom: false,
      train: false,
      raid: false,
      breed: false,
      reason: ""
    };
  }

  function isDragonResting(d) {
    if (!d) return false;
    const ts = d.rest_until_at;
    if (!ts) return false;
    return Number(ts) > Date.now();
  }
  // Helper that applies disabled + faded styling consistently
  function setDisabledVisual(btn, disabled, title) {
    if (!btn) return;
    btn.disabled = !!disabled;
    btn.title = disabled ? title || "" : "";
    // Use BOTH hooks so it works with your existing CSS
    btn.classList.toggle("disabled", !!disabled);
    btn.classList.toggle("is-disabled", !!disabled);
  }
  // Call this whenever dragon stats change or roost opens
  function applyActionButtonStates() {
    const roostPanel = document.querySelector("#panel-roost");
    if (!roostPanel) return;
    const id = STATE?.dragons?.activeId;
    const d = id != null ? STATE.dragons.byId[id] : null;
    if (!d) {
      // No active dragon — disable all actions
      [
        "#actFeed", "#actPlay", "#actGroom", "#actTrain", "#actRest", "#actRaid", "#actBreed",
        "#btnFeed", "#btnPlay", "#btnGroom", "#btnTrain", "#btnRest", "#btnRaid", "#btnBreed"
      ].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) setDisabledVisual(el, true, "No active dragon selected.");
      });
      return;
    }
    const locks = getDragonLocks(d);
    const reason = locks.reason || "";
    const restUntil = parseInt(d.rest_until_at, 10);
    const isResting = Number.isFinite(restUntil) && restUntil > Date.now();
    const {
      cur: staminaCur
    } = getStamina(d);
    const apMax = 5;
    let apNow = Number.isFinite(Number(d.action_points_current)) ?
      Number(d.action_points_current) :
      apMax;
    const apResetAt = d.action_points_reset_at != null ? parseInt(d.action_points_reset_at, 10) : null;
    // If timer passed, the backend will refill on next action call,
    // but UI should treat it as full once reset time is reached.
    if (apResetAt != null && apResetAt <= Date.now()) apNow = apMax;
    const outOfStamina = apNow < 1;
    const staminaReason = outOfStamina ? "This dragon is exhausted (Stamina 0/5)." : "";
    // Ring buttons
    const actFeed = document.querySelector("#actFeed");
    const actPlay = document.querySelector("#actPlay");
    const actGroom = document.querySelector("#actGroom");
    const actTrain = document.querySelector("#actTrain");
    const actRest = document.querySelector("#actRest");
    const actRaid = document.querySelector("#actRaid");
    const actBreed = document.querySelector("#actBreed");
    // Mirror buttons
    const btnFeed = document.querySelector("#btnFeed");
    const btnPlay = document.querySelector("#btnPlay");
    const btnGroom = document.querySelector("#btnGroom");
    const btnTrain = document.querySelector("#btnTrain");
    const btnRest = document.querySelector("#btnRest");
    const btnRaid = document.querySelector("#btnRaid");
    const btnBreed = document.querySelector("#btnBreed");
    const disFeed = locks.feed || isResting || outOfStamina;
    const disPlay = locks.play || isResting || outOfStamina;
    const disGroom = locks.groom || isResting || outOfStamina;
    const disTrain = locks.train || isResting || outOfStamina;
    // rest stays based on resting only (your call, but this matches your design)
    const disRest = isResting;
    // raid/breed are “empty” right now, but you can still lock them consistently
    const disRaid = locks.raid || isResting || outOfStamina;
    const disBreed = locks.breed || isResting || outOfStamina;
    // pick the best reason to show
    const why = isResting ? "Dragon is resting." : (staminaReason || reason);
    // Apply “lock” state ONLY (cooldowns handled elsewhere, but this is still useful on initial render)
    // If resting OR out of stamina, disable most actions.
    // Rest itself is disabled only if already resting.
    setDisabledVisual(actFeed, locks.feed || outOfStamina || isResting, reason);
    setDisabledVisual(btnFeed, locks.feed || outOfStamina || isResting, reason);
    setDisabledVisual(actPlay, locks.play || outOfStamina || isResting, reason);
    setDisabledVisual(btnPlay, locks.play || outOfStamina || isResting, reason);
    setDisabledVisual(actGroom, locks.groom || outOfStamina || isResting, reason);
    setDisabledVisual(btnGroom, locks.groom || outOfStamina || isResting, reason);
    setDisabledVisual(actTrain, locks.train || outOfStamina || isResting, reason);
    setDisabledVisual(btnTrain, locks.train || outOfStamina || isResting, reason);
    // Rest stays its own thing
    setDisabledVisual(actRest, isResting, reason);
    setDisabledVisual(btnRest, isResting, reason);
  }

let dragonReactionTimeout = null;
let dragonReactionActive = false;

const DRAGON_IDLE_LINES = {
  neutral: [
    "{name} watches the distant waves quietly.",
    "{name} shifts comfortably against the wooden deck.",
    "{name} rests near the lantern glow in silence.",
    "{name} listens to the ship creak beneath them.",
    "{name} looks up, their eyes lighting up with curiosity.",
    "{name} is awake and relaxing on the wooden floor.",
    "You hear faint growls coming from within the roost.",
    "{name} emerges into the light."
  ],
  happy: [
    "{name} lets out a soft, content rumble.",
    "{name} curls comfortably near the warm lantern light.",
    "{name} seems unusually relaxed aboard the ship.",
    "{name} appears delighted to see you.",
    "{name} seems happy and content."
  ],
  hungry: [
    "{name} keeps glancing toward the food crates.",
    "{name} sniffs the air, clearly hoping for food.",
    "{name} seems distracted by hunger.",
    "The moment you enter the roost, you hear {name}'s stomach growl."
  ],
  tired: [
    "{name} lets out a slow breath before settling down.",
    "{name} looks ready to rest for a while.",
    "{name} quietly curls against the floorboards."
  ],
  bonded: [
    "{name} seems calmer whenever you're nearby.",
    "{name} watches you with quiet trust.",
    "{name} stays close as the ship gently rocks."
  ]
};

function pickDragonIdleLine(d){
  if(!d) return "No dragon is currently resting in the roost.";

  let pool = DRAGON_IDLE_LINES.neutral;

  if(Number(d.hunger || 0) >= 70) pool = DRAGON_IDLE_LINES.hungry;
  else if(Number(d.hp || 0) < Number(d.hpMax || 1) * 0.4) pool = DRAGON_IDLE_LINES.tired;
  else if(Number(d.bond || 0) >= 60) pool = DRAGON_IDLE_LINES.bonded;
  else if(Number(d.mood || 0) >= 75) pool = DRAGON_IDLE_LINES.happy;

  return pool[Math.floor(Math.random() * pool.length)].replaceAll("{name}", d.name || "Your dragon");
}

function updateDragonIdleText(d){
  const el = document.getElementById("dragonIdleText");
  if(!el) return;

  if(dragonReactionActive){
    return;
  }

  el.style.opacity = "0";

  setTimeout(() => {

    // IMPORTANT:
    // Check AGAIN after timeout.
    if(dragonReactionActive) return;

    el.textContent = pickDragonIdleLine(d);
    el.style.opacity = ".92";

  }, 220);
}

function setTemporaryDragonReaction(text, duration = 12000){
  const el = document.getElementById("dragonIdleText");
  if(!el) return;

  dragonReactionActive = true;

  if(dragonReactionTimeout){
    clearTimeout(dragonReactionTimeout);
  }

  el.style.opacity = "0";

  setTimeout(() => {
    el.textContent = text;
    el.style.opacity = ".92";
  }, 180);

  dragonReactionTimeout = setTimeout(() => {
    dragonReactionActive = false;

    const id = STATE.dragons.selectedId ?? STATE.dragons.activeId;
    const d = id != null ? STATE.dragons.byId[id] : null;
    updateDragonIdleText(d);
  }, duration);
}

  function initRoost() {
    if (roostMounted) {
      HUB.renderActive?.();
      HUB.renderCollection?.();
    }
    roostMounted = true;
    const root = $("#roostRoot"),
      diorama = root;
    if (!root) return;

    function ensureRosterTimer() {
      if (rosterTimerInterval) return;
      rosterTimerInterval = setInterval(updateRosterRestTimers, 1000);
    }
    const ring = $("#actionRing"),
      portrait = $("#dPortrait"),
      drop = $("#portraitDrop");
    const dName = $("#dName"),
      chipEl = $("#chipElement"),
      badgeR = $("#badgeRarity"),
      badgeS = $("#badgeSize");
    const kvId = $("#kvId"),
      kvSpecies = $("#kvSpecies"),
      kvType = $("#kvType"),
      kvTrait = $("#kvTrait");
    const barHP = $("#barHP"),
      barHappy = $("#barHappy"),
      barHunger = $("#barHunger");
    const hpPct = $("#hpPct"),
      happyPct = $("#happyPct"),
      hungerPct = $("#hungerPct");
    const moodletsEl = $("#moodlets");
    const btnSetActive = $("#btnSetActive"),
      btnFavorite = $("#btnFavorite");
    const btnFeed = $("#btnFeed"),
      btnPlay = $("#btnPlay"),
      btnGroom = $("#btnGroom"),
      btnTrain = $("#btnTrain");
    const viewList = $("#viewList"),
      viewGrid = $("#viewGrid"),
      dSearch = $("#dSearch"),
      dSort = $("#dSort"),
      collection = $("#collection");
    const filterChips = [...document.querySelectorAll(".filterchip")];
    const CD = {
      feed: 0,
      play: 0,
      groom: 0,
      train: 0,
      rest: 0
    };
    const CDdur = {
      feed: 5000,
      play: 4000,
      groom: 3000,
      train: 7000,
      rest: 1000
    };

    function now() {
      return Date.now();
    }

    function setCD(key, ms) {
      CD[key] = now() + ms;
    }

    function cdPct(key) {
      const t = CD[key] - now();
      if (t <= 0) return 0;
      const d = CDdur[key];
      return Math.max(0, Math.min(1, t / d));
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function pct(x, max) {
      return clamp(Math.round((x / max) * 100), 0, 100);
    }

    function active() {
      let id = (STATE.dragons.selectedId != null) ? STATE.dragons.selectedId : null;
      if (id != null && !STATE.dragons.byId[id]) id = null;
      if (id == null) id = STATE.dragons.activeId;
      return (id != null) ? STATE.dragons.byId[id] : null;
    }
    // place ring buttons
    (function placeRing() {
      const radius = 150,
        center = 180;
      const map = [{
          el: $("#actFeed"),
          ang: -90
        },
        {
          el: $("#actPlay"),
          ang: 0
        },
        {
          el: $("#actGroom"),
          ang: 180
        },
        {
          el: $("#actTrain"),
          ang: 90
        }
      ];
      map.forEach(({
        el,
        ang
      }) => {
        if (!el) return;
        const rad = (ang * Math.PI) / 180;
        const x = center + radius * Math.cos(rad) - 36;
        const y = center + radius * Math.sin(rad) - 36;
        el.style.left = x + "px";
        el.style.top = y + "px";
      });
    })();
    const THEME = {
      Air: "Air",
      Wind: "Air",
      Fire: "Fire",
      Magma: "Fire",
      Toxic: "Toxic",
      Earth: "Earth",
      Light: "Light",
      Dark: "Dark",
      Water: "Water",
      Ice: "Ice",
      Lightning: "Lightning",
      Blood: "Blood",
      Neutral: "Neutral",
      Unique: "Unique"
    };

    function applyRoostTheme(element) {
      const name = THEME[element] || "Neutral";
      root.className = "diorama roost-theme-" + name;
    }
    diorama.addEventListener("mousemove", (e) => {
      const r = diorama.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const back = diorama.querySelector(".di-back"),
        mid = diorama.querySelector(".di-mid"),
        front = diorama.querySelector(".di-front");
      if (back) back.style.transform = `translate(${px * 6}px, ${py * 4}px)`;
      if (mid) mid.style.transform = `translate(${px * 12}px, ${py * 8}px)`;
      if (front) front.style.transform = `translate(${px * 18}px, ${py * 12}px)`;
    });

    function computeMoodlets(d) {
      const out = [];
      if (d.hunger > 70) out.push("Peckish");
      if (d.mood < 35) out.push("Irritable");
      if (d.mood > 70) out.push("Playful");
      if (d.hp < d.hpMax * 0.4) out.push("Weary");
      return out.slice(0, 3);
    }

    function renderMoodlets(d) {
      if (!moodletsEl) return;
      const chips = computeMoodlets(d)
        .map((t) => `<span class="mchip">${t}</span>`)
        .join("");
      moodletsEl.innerHTML =
        chips ||
        `<span class="mchip" style="opacity:.7">No active moodlets</span>`;
    }

    function recomputeHappiness(d) {
      d.happiness = deriveHappiness(d.mood, d.hunger);
    }
    HUB.renderActive = function() {
      const a = active();
      // ✅ EMPTY STATE: no active dragon selected
      if (!a) {
        // Cap still updates
        const cap = $("#roostCap");
        if (cap) cap.textContent = `Roost: ${Object.keys(STATE.dragons.byId).length} / 12`;
        // Clear portrait + labels
        if (portrait) portrait.style.backgroundImage = "";
        if (dName) dName.textContent = "No active dragon";
        if (chipEl) chipEl.textContent = "—";
        if (badgeR) badgeR.textContent = "—";
        if (badgeS) badgeS.textContent = "—";
        if (kvId) kvId.textContent = "—";
        if (kvSpecies) kvSpecies.textContent = "—";
        if (kvType) kvType.textContent = "—";
        if (kvTrait) kvTrait.textContent = "—";
        // Clear bars + percents
        if (barHP) barHP.style.width = "0%";
        if (barHappy) barHappy.style.width = "0%";
        if (barHunger) barHunger.style.width = "0%";
        if (hpPct) hpPct.textContent = "0%";
        if (happyPct) happyPct.textContent = "0%";
        if (hungerPct) hungerPct.textContent = "0%";
        // Clear moodlets
        if (typeof renderMoodlets === "function") {
          renderMoodlets({
            hunger: 0,
            mood: 0,
            hp: 0,
            hpMax: 1
          });
        }
        const moodlets = $("#moodlets");
        if (moodlets) moodlets.innerHTML = `<span class="mchip" style="opacity:.7">No active dragon selected</span>`;
        // Hide rest timer (and stop ticking)
        if (typeof stopRestTimer === "function") stopRestTimer();
        const restTimerEl = $("#restTimer");
        if (restTimerEl) {
          restTimerEl.textContent = "";
          restTimerEl.style.display = "none";
        }
        // Neutral theme
        if (typeof applyRoostTheme === "function") applyRoostTheme("Neutral");
        // Disable all action buttons (your lock system handles this nicely)
        if (typeof applyActionButtonStates === "function") applyActionButtonStates();
        // Hide set-active button (no dragon to set active from the portrait)
        if (btnSetActive) btnSetActive.style.display = "none";
        updateDragonIdleText(null);
        return;
      }
      // --- Stamina line (JS-only, no HTML edits) ---
      (function renderStaminaLine() {
        const d = a;
        const {
          cur,
          max,
          resetAt
        } = getStamina(d);
        // choose an anchor that definitely exists; dName is in your code
        const anchor = (typeof dName !== "undefined" && dName) ? dName : document.querySelector("#activeName");
        if (!anchor) return;
        // create once
        let line = document.querySelector("#staminaLine");
        if (!line) {
          line = document.createElement("div");
          line.id = "staminaLine";
          line.style.marginTop = "6px";
          line.style.fontSize = "12px";
          line.style.opacity = "0.9";
          // insert right under the name
          anchor.insertAdjacentElement("afterend", line);
        }
        (function renderTierLine(d) {
          const anchor = dName;
          if (!anchor) return;
          let line = document.querySelector("#tierLine");
          if (!line) {
            line = document.createElement("div");
            line.id = "tierLine";
            line.style.marginTop = "2px";
            line.style.fontSize = "12px";
            line.style.opacity = "0.85";
            anchor.insertAdjacentElement("afterend", line);
          }
          const key = "play"; // or computed action_key if you want dynamic
          const streaks = d.action_streaks || {};
          const cur = Number(streaks[key] || 0);
          // if your backend tiers are 0-4 idx, show 1-5 tier
          const tier = Math.min(5, Math.max(1, cur + 1));
          line.textContent = `Play Tier: ${tier}/5`;
        })(a);
        // text
        let extra = "";
        if (cur <= 0 && resetAt) {
          extra = ` • refills in ${fmtMs(resetAt - Date.now())}`;
        }
        line.textContent = `Stamina: ${cur}/${max}${extra}`;
      })();
      // Track last shown percents for smooth tweening
      STATE.ui = STATE.ui || {
        hpPct: 0,
        happyPct: 0,
        hungerPct: 0
      };
      const isActive = a.id === STATE.dragons.activeId;
      const isResting = Number(a.rest_until_at || 0) > Date.now();
      if (isResting) scheduleRestEndRefresh(a.rest_until_at);
      if (btnSetActive) btnSetActive.style.display = (isActive || isResting) ? "none" : "inline-block";
      const cap = $("#roostCap");
      if (cap) cap.textContent = `Roost: ${Object.keys(STATE.dragons.byId).length} / 12`;
      if (portrait) portrait.style.backgroundImage = `url('${a.img}')`;
      if (dName) dName.textContent = a.name;
      if (chipEl) chipEl.textContent = a.element;
      if (badgeR) badgeR.textContent = a.rarity;
      if (badgeS) badgeS.textContent = a.size;
      if (kvId) kvId.textContent = a.id;
      if (kvSpecies) kvSpecies.textContent = a.species;
      if (kvType) kvType.textContent = a.element;
      if (kvTrait) kvTrait.textContent = a.trait || "—";
      const hpTarget = pct(a.hp, a.hpMax);
      const happyTarget = clamp(a.happiness, 0, 100);
      const hungerTarget = clamp(a.hunger, 0, 100);
      if (barHP) barHP.style.width = hpTarget + "%";
      if (barHappy) barHappy.style.width = happyTarget + "%";
      if (barHunger) barHunger.style.width = hungerTarget + "%";
      if (hpPct) {
        const from = STATE.ui.hpPct ?? hpTarget;
        tweenNumber({
          from,
          to: hpTarget,
          duration: 350,
          onUpdate: (v) => {
            STATE.ui.hpPct = v;
            hpPct.textContent = `${Math.round(v)}%`;
          }
        });
      }
      if (happyPct) {
        const from = STATE.ui.happyPct ?? happyTarget;
        tweenNumber({
          from,
          to: happyTarget,
          duration: 350,
          onUpdate: (v) => {
            STATE.ui.happyPct = v;
            happyPct.textContent = `${Math.round(v)}%`;
          }
        });
      }
      if (hungerPct) {
        const from = STATE.ui.hungerPct ?? hungerTarget;
        tweenNumber({
          from,
          to: hungerTarget,
          duration: 350,
          onUpdate: (v) => {
            STATE.ui.hungerPct = v;
            hungerPct.textContent = `${Math.round(v)}%`;
          }
        });
      }
      renderMoodlets(a);
      updateDragonIdleText(a);
      applyRoostTheme(a.element);
      applyActionButtonStates();
      startRestTimer();
    };
    const restTimerEl = $("#restTimer");
    let restTimerRAF = null;

    function fmtTime(ms) {
      ms = Math.max(0, ms);
      const totalSec = Math.ceil(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}:${String(s).padStart(2, "0")}`;
    }
    let restTimerKey = null; // prevents restart loops
    function stopRestTimer() {
      if (restTimerRAF) cancelAnimationFrame(restTimerRAF);
      restTimerRAF = null;
      restTimerKey = null;
    }

    function startRestTimer() {
  const d = active();
  if (!d) {
    stopRestTimer();
    return;
  }

  const until = Number(d.rest_until_at || 0);

  // Not resting — do nothing.
  if (!until || until <= Date.now()) {
    stopRestTimer();
    if (restTimerEl) {
      restTimerEl.textContent = "";
      restTimerEl.style.display = "none";
    }
    return;
  }

  const newKey = `${d.id}:${until}`;

  if (restTimerRAF && restTimerKey === newKey) return;

  if (restTimerRAF) cancelAnimationFrame(restTimerRAF);
  restTimerKey = newKey;

  const tick = () => {
    const d2 = active();
    if (!restTimerEl || !d2) return;

    const until2 = Number(d2.rest_until_at || 0);
    const msLeft = until2 - Date.now();

    if (until2 > Date.now()) {
      restTimerEl.style.display = "block";
      restTimerEl.textContent = `Resting… ${fmtTime(msLeft)} remaining`;
      restTimerRAF = requestAnimationFrame(tick);
      return;
    }

    restTimerEl.textContent = "";
    restTimerEl.style.display = "none";
    stopRestTimer();
    applyActionButtonStates();
    refreshDragonsFromApiSafe();
  };

  tick();
}
    let view = "list";
    let rosterTimerInterval = null;

    function searchFilter(dr) {
      const q = ((dSearch && dSearch.value) || "").trim().toLowerCase();
      if (q) {
        const hay = (
          dr.name +
          " " +
          dr.species +
          " " +
          (dr.code || "") +
          " " +
          dr.element
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      let ok = true;
      for (const chip of filterChips.filter((c) =>
          c.classList.contains("active")
        )) {
        const el = chip.dataset.el,
          filt = chip.dataset.filter;
        if (el && dr.element !== el) ok = false;
        if (filt === "hungry" && !(dr.hunger > 60)) ok = false;
        if (filt === "lowhp" && !(dr.hp / dr.hpMax < 0.4)) ok = false;
      }
      return ok;
    }

    function sorters(key) {
      const recent = (a, b) =>
        (STATE.lastUsed[b.id] || 0) - (STATE.lastUsed[a.id] || 0);
      const hp = (a, b) =>
        b.hp / b.hpMax - a.hp / a.hpMax || a.name.localeCompare(b.name);
      const happy = (a, b) =>
        b.happiness - a.happiness || a.name.localeCompare(b.name);
      const el = (a, b) =>
        a.element === b.element ?
        a.name.localeCompare(b.name) :
        a.element.localeCompare(b.element);
      const bond = (a, b) => 0;
      const name = (a, b) => a.name.localeCompare(b.name);
      return {
        recent,
        hp,
        happy,
        element: el,
        bond,
        name
      } [key] || name;
    }
    HUB.renderCollection = function() {
      if (!collection) return;
      let list = Object.values(STATE.dragons.byId).filter(searchFilter);
      const sKey = ((dSort && dSort.value) || "name")
        .replace("Sort: ", "")
        .toLowerCase();
      list.sort(sorters(sKey));
      list.sort(
        (a, b) =>
        (STATE.favorites.has(b.id) ? 1 : 0) -
        (STATE.favorites.has(a.id) ? 1 : 0)
      );
      collection.className = view === "grid" ? "col-grid" : "col-list";
      if (view === "grid") {
        collection.innerHTML = "";
        list.forEach((dr) => {
          const card = document.createElement("div");
          card.className =
            "dcard" + (dr.id === STATE.dragons.activeId ? " active" : "");
          const ph = document.createElement("div");
          ph.className = "ph";
          ph.style.backgroundImage = `url('${dr.img}')`;
          const name = document.createElement("div");
          name.innerHTML = `<strong>${dr.name}</strong> ${
          dr.id === STATE.dragons.activeId
            ? '<span class="mark">⚓ Active</span>'
            : ""
        }`;
          const meta = document.createElement("div");
          meta.className = "meta";
          meta.textContent = `${dr.species} • ${dr.element}`;
          const bars = document.createElement("div");
          const isResting = isDragonResting(dr);
          if (isResting) {
            bars.innerHTML = `
          <div class="rest-mini" data-rest-until="${dr.rest_until_at}">
            <div class="rest-title">Resting</div>
            <div class="rest-time">—</div>
          </div>
        `;
          } else {
            bars.innerHTML = `
          <div class="bar hp"><div class="in" style="width:${pct(
            dr.hp,
            dr.hpMax
          )}%"></div></div>
          <div class="bar happy"><div class="in" style="width:${clamp(
            dr.happiness,
            0,
            100
          )}%"></div></div>
          <div class="bar hunger"><div class="in" style="width:${clamp(
            dr.hunger,
            0,
            100
          )}%"></div></div>
        `;
          }
          card.appendChild(ph);
          card.appendChild(name);
          card.appendChild(meta);
          card.appendChild(bars);
          card.ondblclick = () => setActive(dr.id);
          card.onclick = (e) => {
            if (e.detail === 1) preview(dr.id);
          };
          card.ondragover = (e) => e.preventDefault();
          card.ondrop = (e) => {
            e.preventDefault();
            handleFeedDropOnDragon(dr.id, e).then((ok) => {
              if (ok) toast(`Fed ${dr.name}.`);
            });
          };
          collection.appendChild(card);
        });
        // ✅ one-time interval setup (doesn't duplicate)
        updateRosterRestTimers();
        ensureRosterTimer();
        if (!rosterTimerInterval) {
          rosterTimerInterval = setInterval(updateRosterRestTimers, 1000);
        }
        return;
      }
      // list view
      collection.innerHTML = "";
      list.forEach((dr) => {
        const row = document.createElement("div");
        row.className = "row";
        const img = document.createElement("div");
        img.className = "thumb";
        img.style.backgroundImage = `url('${dr.img}')`;
        const mid = document.createElement("div");
        mid.innerHTML = `
  <div style="display:flex; align-items:center; gap:8px">
    <strong>${dr.name}</strong>
    ${
      dr.id === STATE.dragons.activeId
        ? '<span class="mark">⚓ Active</span>'
        : ""
    }
    ${STATE.favorites.has(dr.id) ? '<span class="mark">⭐ Fav</span>' : ""}
    <span class="badge">${dr.element}</span>
    <span class="badge">${dr.rarity}</span>
  </div>

  ${
    isDragonResting(dr)
      ? `<div class="rest-mini" data-rest-until="${dr.rest_until_at}">
           <div class="rest-title">Resting</div>
           <div class="rest-time">—</div>
         </div>`
      : `<div class="mini-bars" style="margin-top:6px">
           <div class="bar hp"><div class="in" style="width:${pct(
             dr.hp,
             dr.hpMax
           )}%"></div></div>
           <div class="bar happy"><div class="in" style="width:${clamp(
             dr.happiness,
             0,
             100
           )}%"></div></div>
           <div class="bar hunger"><div class="in" style="width:${clamp(
             dr.hunger,
             0,
             100
           )}%"></div></div>
         </div>`
  }
`;
        const {
          cur,
          max,
          resetAt
        } = getStamina(dr);
        row.classList.add("dragon-card");
        row.dataset.id = dr.id;
        const cardEl = row; // <-- use the row we’re building right now
        let badge = cardEl.querySelector(".stamina-badge");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "stamina-badge";
          badge.style.position = "absolute";
          badge.style.top = "6px";
          badge.style.right = "6px";
          badge.style.fontSize = "11px";
          badge.style.padding = "2px 6px";
          badge.style.borderRadius = "999px";
          badge.style.background = "rgba(0,0,0,0.35)";
          badge.style.backdropFilter = "blur(2px)";
          badge.style.pointerEvents = "none";
          // make sure card is position:relative
          cardEl.style.position = cardEl.style.position || "relative";
          cardEl.appendChild(badge);
        }
        badge.textContent = (cur <= 0 && resetAt) ?
          `0/${max} ⏳` :
          `${cur}/${max}`;
        const right = document.createElement("div");
        right.style.display = "grid";
        right.style.gap = "6px";
        const sbtn = document.createElement("button");
        sbtn.className = "btn-sm";
        sbtn.textContent =
          dr.id === STATE.dragons.activeId ? "Active ✓" : "Set Active";
        sbtn.onclick = () => setActive(dr.id);
        const fbtn = document.createElement("button");
        fbtn.className = "btn-sm";
        fbtn.textContent = STATE.favorites.has(dr.id) ?
          "★ Unfavorite" :
          "☆ Favorite";
        fbtn.onclick = () => {
          toggleFavorite(dr.id);
          HUB.renderCollection();
        };
        right.appendChild(sbtn);
        right.appendChild(fbtn);
        row.appendChild(img);
        row.appendChild(mid);
        row.appendChild(right);
        row.ondblclick = () => setActive(dr.id);
        row.ondragover = (e) => {
          e.preventDefault();
        };
        row.ondrop = (e) => {
          e.preventDefault();
          handleFeedDropOnDragon(dr.id, e).then((ok) => {
            if (ok) toast(`Fed ${dr.name}.`);
          });
        };
        collection.appendChild(row);
      });
      applyActionButtonStates();
      updateRosterRestTimers();
      ensureRosterTimer();
    };

    function preview(id) {
      STATE.dragons.selectedId = id;
      HUB.renderActive();
      HUB.renderCollection();
    }
    async function setActive(id) {
      const d = STATE.dragons.byId[id];
      if (!d) return;
      const until = Number(d.rest_until_at || 0);
      if (until > Date.now()) {
        toast(`${d.name} is resting — can't be set active yet.`);
        return;
      }
      // Remember previous active in case we have to roll back
      const prevId = STATE.dragons.activeId;
      // Optimistic UI update
      STATE.dragons.activeId = id;
      STATE.lastUsed[id] = Date.now();
      HUB.renderActive();
      HUB.renderCollection();
      try {
        await apiFetch("/players/me/dragons/set-active", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            dragon_id: id
          })
        });
        // Keep local player state consistent with DB
        STATE.player = STATE.player || {};
        STATE.player.dragon_active_id = id;
        toast("Active dragon set.");
      } catch (err) {
        console.error("Failed to set active dragon:", err);
        // Roll back to previous active if server rejected it
        STATE.dragons.activeId = prevId;
        renderActive();
        renderCollection();
        toast("Could not update active dragon.");
      }
    }
    async function toggleFavorite(id) {
      const d = STATE.dragons.byId[id];
      if (!d) return;
      try {
        const payload = await apiFetch(
          `/players/me/dragons/${id}/favorite`, {
            method: "POST"
          }
        );
        const updated = payload?.dragon;
        if (!updated) return;
        // ✅ Update authoritative state
        d.is_favorite = !!updated.is_favorite;
        // ✅ Rebuild favorites Set from truth
        if (d.is_favorite) STATE.favorites.add(id);
        else STATE.favorites.delete(id);
        HUB.renderCollection();
        HUB.renderActive();
      } catch (err) {
        console.error("toggleFavorite failed", err);
        const msg = extractApiPayloadMessage(err);
        toast(msg || "Could not update favorite.");
      }
    }

    function consumeFromInventoryById(id) {
      for (let i = 0; i < STATE.inventory.length; i++) {
        const s = STATE.inventory[i];
        if (s && s.item.id === id) {
          s.qty--;
          if (s.qty <= 0) STATE.inventory[i] = null;
          return true;
        }
      }
      return false;
    }
    async function feedItemToDragon(drId, itemId) {
      const d = STATE.dragons.byId[drId];
      const it = STATE.items.find((x) => x.id === itemId);
      if (!d || !it) return false;
      // don’t even hit the API if they’re full
      if (d.hunger <= 0) {
        toast(`${d.name} isn’t hungry right now.`);
        return false;
      }
      const isFood = (it.tags || []).some(
        (t) => t === "FOOD" || t === "MEDICINE"
      );
      if (!isFood) {
        toast("That isn’t edible.");
        return false;
      }
      try {
        const payload = await apiFetch(`/players/me/dragons/${drId}/action`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: "feed",
            items_id: itemId
          })
        });
        if (!payload || !payload.dragon) {
          toast("Could not feed dragon.");
          return false;
        }
        const apiDr = payload.dragon;
        const local = STATE.dragons.byId[apiDr.id] || d;
        if (local) {
          if (typeof apiDr.hp === "number") local.hp = apiDr.hp;
          if (typeof apiDr.hp_max === "number") local.hpMax = apiDr.hp_max;
          if (typeof apiDr.mood === "number") local.mood = apiDr.mood;
          if (typeof apiDr.hunger === "number") local.hunger = apiDr.hunger;
          if (typeof apiDr.bond === "number") local.bond = apiDr.bond;
          local.happiness = deriveHappiness(local.mood, local.hunger);
        }
        // Mirror server-side consumption in the UI
        consumeFromInventoryById(itemId);
        if (drId === STATE.dragons.activeId && portrait) {
          portrait.classList.add("flash");
          setTimeout(() => portrait.classList.remove("flash"), 320);
        }
        HUB.renderActive();
        HUB.renderCollection();
        if (typeof STATE._onInventoryChange === "function")
          STATE._onInventoryChange();
        scheduleInventorySave();
        setTemporaryDragonReaction(`${d.name} eagerly snaps up the offered food.`);
        return true;
      } catch (err) {
        console.error("feedItemToDragon failed", err);
        toast("Feeding failed. Try again.");
        return false;
      }
    }
    async function handleFeedDropOnDragon(drId, e) {
      try {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        if (!data || data.from !== "inv") return false;
        const slot = STATE.inventory[data.index];
        if (!slot) return false;
        const ok = (slot.item.tags || []).some(
          (t) => t === "FOOD" || t === "MEDICINE"
        );
        if (!ok) return false;
        return await feedItemToDragon(drId, slot.item.id);
      } catch (_) {
        return false;
      }
    }
    if (drop) {
      drop.ondragover = (e) => {
        e.preventDefault();
        drop.classList.add("dragover");
      };
      drop.ondragleave = () => drop.classList.remove("dragover");
      drop.ondrop = (e) => {
        e.preventDefault();
        drop.classList.remove("dragover");
        handleFeedDropOnDragon(STATE.dragons.activeId, e).then((ok) => {
          if (ok) {
            const a = STATE.dragons.byId[STATE.dragons.activeId];
            if (a) toast(`Fed ${a.name}.`);
          }
        });
      };
    }

    function tickCooldowns() {
      const d = active();
      const locks = getDragonLocks(d);
      // --- NEW: stamina + resting flags ---
      const apMax = 5;
      let apNow = Number.isFinite(Number(d?.action_points_current)) ? Number(d.action_points_current) : apMax;
      const apResetAt = d?.action_points_reset_at != null ? parseInt(d.action_points_reset_at, 10) : null;
      if (apResetAt != null && apResetAt <= Date.now()) apNow = apMax;
      const outOfStamina = apNow < 1;
      const isResting = d && Number(d.rest_until_at || 0) > Date.now();
      const staminaReason = outOfStamina ? "This dragon is exhausted (Stamina 0/5)." : "";
      const pairs = [
        ["feed", $("#actFeed"), btnFeed],
        ["play", $("#actPlay"), btnPlay],
        ["groom", $("#actGroom"), btnGroom],
        ["train", $("#actTrain"), btnTrain],
        ["rest", $("#actRest"), $("#btnRest")],
        ["raid", $("#actRaid"), $("#btnRaid")],
        ["breed", $("#actBreed"), $("#btnBreed")]
      ];
      pairs.forEach(([key, ringBtn, mirBtn]) => {
        const p = typeof cdPct === "function" ? (cdPct(key) || 0) : 0;
        const onCooldown = p > 0;
        const locked = !!locks[key];
        // --- NEW: final disabled rules ---
        const restBlocksThis = (key !== "rest") && isResting;
        const staminaBlocksThis = (key !== "rest") && outOfStamina;
        const disabled = locked || onCooldown || restBlocksThis || staminaBlocksThis;
        // choose best tooltip reason
        const title = locked ?
          (locks.reason || "Unavailable.") :
          (restBlocksThis ? "Dragon is resting." : (staminaBlocksThis ? staminaReason : ""));
        [ringBtn, mirBtn].forEach((btn) => {
          if (!btn) return;
          if (onCooldown) {
            btn.classList.add("cooling");
            btn.style.setProperty("--pct", String(p));
          } else {
            btn.classList.remove("cooling");
            btn.style.removeProperty("--pct");
          }
          btn.disabled = disabled;
          btn.classList.toggle("disabled", disabled);
          btn.classList.toggle("is-disabled", disabled);
          btn.title = title;
        });
      });
      requestAnimationFrame(tickCooldowns);
    }
    tickCooldowns();

    function extractApiPayloadMessage(err) {
      const msg = (err && err.message) ? err.message : "";
      const i = msg.indexOf("{");
      if (i === -1) return "";
      try {
        const obj = JSON.parse(msg.slice(i));
        return obj?.payload?.message || obj?.payload || obj?.error || obj?.message || "";
      } catch (_) {
        return "";
      }
    }
    async function actFeed() {
      if (cdPct("feed") > 0) return;
      const inv = STATE.inventory.find(
        (s) =>
        s && (s.item.tags || []).some((t) => t === "FOOD" || t === "MEDICINE")
      );
      if (!inv) return toast("No FOOD in inventory.");
      const ok = await feedItemToDragon(STATE.dragons.activeId, inv.item.id);
      if (ok) setCD("feed", CDdur.feed);
    }
    async function actPlay() {
      // Use the same cooldown slot you already use for "play"
      if (cdPct("play") > 0) return;
      const id = STATE.dragons.activeId;
      const d = STATE.dragons.byId[id];
      if (!d) return;
      if (typeof d.action_points_current === "number") {
        d.action_points_current = Math.max(0, d.action_points_current - 1);
      } else {
        d.action_points_current = 4; // fallback if missing
      }
      // If happiness is maxed, reject instantly
      const locks = getDragonLocks(d);
      if (locks.play) {
        toast(locks.reason || "Can't play right now.");
        return;
      }
      try {
        const payload = await apiFetch(`/players/me/dragons/${id}/action`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: "play"
          })
        });
        if (!payload || !payload.dragon) {
          toast("Could not interact with your dragon.");
          return;
        }
        const apiDr = payload.dragon;
        const local = STATE.dragons.byId[apiDr.id] || d;
        if (local) {
          if (typeof apiDr.hp === "number") local.hp = apiDr.hp;
          if (typeof apiDr.hp_max === "number") local.hpMax = apiDr.hp_max;
          if (typeof apiDr.mood === "number") local.mood = apiDr.mood;
          if (typeof apiDr.hunger === "number") local.hunger = apiDr.hunger;
          if (typeof apiDr.bond === "number") local.bond = apiDr.bond;
          local.happiness = deriveHappiness(local.mood, local.hunger);
        }
        // Little feedback: the dragon feels loved
        if (portrait) {
          portrait.classList.add("pulse");
          setTimeout(() => portrait.classList.remove("pulse"), 400);
        }
        HUB.renderActive();
        HUB.renderCollection();
        setCD("play", CDdur.play);
        toast(`${d.name} seems happier.`);
        applyDragonPatch(local, payload.dragon);
      } catch (err) {
        const serverMsg = extractApiPayloadMessage(err);
        // If it's the expected stamina gate, don't console.error
        if (/out of action points/i.test(serverMsg)) {
          toast(serverMsg);
          // force UI into correct locked state
          refreshDragonsFromApiSafe();
          setTemporaryDragonReaction(`${d.name} perks up, clearly enjoying the attention.`);
          return;
        }
        console.error("actPlay (pet) failed", err);
        toast("Your dragon didn’t respond. Try again.");
      }
    }
    async function actGroom() {
      // Cooldown slot for grooming
      if (cdPct("groom") > 0) return;
      const id = STATE.dragons.activeId;
      const d = STATE.dragons.byId[id];
      if (!d) return;
      if (typeof d.action_points_current === "number") {
        d.action_points_current = Math.max(0, d.action_points_current - 1);
      } else {
        d.action_points_current = 4; // fallback if missing
      }
      // Client-side guard so we don’t even hit the API if they’re maxed
      const locks = getDragonLocks(d);
      if (locks.groom) {
        toast(locks.reason || "Can't groom right now.");
        return;
      }
      try {
        const payload = await apiFetch(`/players/me/dragons/${id}/action`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: "groom"
          })
        });
        if (!payload || !payload.dragon) {
          toast("Could not groom your dragon.");
          return;
        }
        const apiDr = payload.dragon;
        const local = STATE.dragons.byId[apiDr.id] || d;
        if (local) {
          if (typeof apiDr.hp === "number") local.hp = apiDr.hp;
          if (typeof apiDr.hp_max === "number") local.hpMax = apiDr.hp_max;
          if (typeof apiDr.mood === "number") local.mood = apiDr.mood;
          if (typeof apiDr.hunger === "number") local.hunger = apiDr.hunger;
          if (typeof apiDr.bond === "number") local.bond = apiDr.bond;
          local.happiness = deriveHappiness(local.mood, local.hunger);
        }
        HUB.renderActive();
        HUB.renderCollection();
        setCD("groom", CDdur.groom);
        toast(`${d.name} looks cleaner and more relaxed.`);
        applyDragonPatch(local, payload.dragon);
      } catch (err) {
        const serverMsg = extractApiPayloadMessage(err);
        // If it's the expected stamina gate, don't console.error
        if (/out of action points/i.test(serverMsg)) {
          toast(serverMsg);
          // force UI into correct locked state
          refreshDragonsFromApiSafe();
          setTemporaryDragonReaction(`${d.name} relaxes as you tend to them.`);
          return;
        }
        console.error("actGroom failed", err);
        toast("Grooming failed. Try again.");
      }
    }
    async function actTrain() {
      if (cdPct("train") > 0) return;
      const id = STATE.dragons.activeId;
      const d = STATE.dragons.byId[id];
      if (!d) {
        toast("No active dragon.");
        return;
      }
      if (typeof d.action_points_current === "number") {
        d.action_points_current = Math.max(0, d.action_points_current - 1);
      } else {
        d.action_points_current = 4; // fallback if missing
      }
      const locks = getDragonLocks();
      if (locks.train) {
        toast(locks.reason || "Can't train right now.");
        return;
      }
      try {
        const payload = await apiFetch(`/players/me/dragons/${id}/action`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: "train"
          })
        });
        if (!payload || !payload.dragon) {
          toast("Could not train your dragon.");
          return;
        }
        const apiDr = payload.dragon;
        const local = STATE.dragons.byId[apiDr.id] || d;
        // Update only what server returns
        if (local) {
          if (typeof apiDr.hp === "number") local.hp = apiDr.hp;
          if (typeof apiDr.hp_max === "number") local.hpMax = apiDr.hp_max;
          if (typeof apiDr.mood === "number") local.mood = apiDr.mood;
          if (typeof apiDr.hunger === "number") local.hunger = apiDr.hunger;
          if (typeof apiDr.bond === "number") local.bond = apiDr.bond;
          local.happiness = deriveHappiness(local.mood, local.hunger);
        }
        if (portrait) {
          portrait.style.transform = "scale(1.04)";
          setTimeout(() => (portrait.style.transform = ""), 180);
        }
        HUB.renderActive();
        HUB.renderCollection();
        setCD("train", CDdur.train);
        toast(`${local.name} trains hard.`);
        applyDragonPatch(local, payload.dragon);
      } catch (err) {
        const serverMsg = extractApiPayloadMessage(err);
        // If it's the expected stamina gate, don't console.error
        if (/out of action points/i.test(serverMsg)) {
          toast(serverMsg);
          // force UI into correct locked state
          refreshDragonsFromApiSafe();
          setTemporaryDragonReaction(`${local.name} steadies themselves after training.`);
          return;
        }
        console.error("actTrain failed", err);
        toast(serverMsg || "Training failed. Try again.");
      }
    }
    async function actRest() {
      if (cdPct("rest") > 0) return;
      const id = STATE.dragons.activeId;
      const d = STATE.dragons.byId[id];
      if (!id || !d) return;
      // ✅ If already resting, don't hit API
      const restUntil = Number(d.rest_until_at || 0);
      if (restUntil > Date.now()) {
        // Silent fail — no toast spam, no API hit
        return;
      }
      if (cdPct("rest") > 0) return;
      try {
        const payload = await apiFetch(`/players/me/dragons/${id}/action`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            type: "rest"
          })
        });
        if (payload && payload.result) {
          d.rest_until_at = parseInt(payload.result, 10);
          scheduleRestEndRefresh(d.rest_until_at);
          // ✅ Backend will return active_id:null, so mirror it immediately
          STATE.dragons.activeId = null;
          // Repaint immediately to blank the portrait/stats
          HUB.renderActive();
          HUB.renderCollection();
          applyActionButtonStates();
          // Then refresh from server (optional but good)
          refreshDragonsFromApiSafe();
          toast(`${d.name} is resting.`);
        } else {
          toast("Rest started.");
        }
        const until = parseInt(payload.result, 10);
        d.rest_until_at = until;
        // mirror server truth
        STATE.dragons.activeId = null;
        STATE.dragons.selectedId = null; // optional: only if you want it to fully clear
        STATE.player = STATE.player || {};
        STATE.player.dragon_active_id = null;
        // immediate UI clear
        HUB.renderActive();
        HUB.renderCollection();
        applyActionButtonStates();
        scheduleRestEndRefresh(until);
        // authoritative resync (also picks up AP/streaks etc.)
        await refreshDragonsFromApiSafe();
        toast(`${d.name} is resting.`);
        setCD("rest", CDdur.rest);
      } catch (err) {
        console.error("actRest failed", err);
        const serverMsg = extractApiPayloadMessage(err);
        toast(serverMsg?.message || serverMsg || "Rest failed. Try again.");
      }
    }
    const actFeedBtn = $("#actFeed");
    const actPlayBtn = $("#actPlay");
    const actGroomBtn = $("#actGroom");
    const actTrainBtn = $("#actTrain");
    const actRestBtn = $("#actRest");
    if (actFeedBtn) actFeedBtn.onclick = actFeed;
    if (actPlayBtn) actPlayBtn.onclick = actPlay;
    if (actGroomBtn) actGroomBtn.onclick = actGroom;
    if (actTrainBtn) actTrainBtn.onclick = actTrain;
    if (actRestBtn) actRestBtn.onclick = actRest;
    if (btnFeed) btnFeed.onclick = actFeed;
    if (btnPlay) btnPlay.onclick = actPlay;
    if (btnGroom) btnGroom.onclick = actGroom;
    if (btnTrain) btnTrain.onclick = actTrain;
    if (btnRest) btnRest.onclick = actRest;
    if (btnSetActive)
      btnSetActive.onclick = () => {
        const a = active();
        if (!a) return;
        const until = Number(a.rest_until_at || 0);
        if (until > Date.now()) {
          toast(`${a.name} is resting — can't be set active yet.`);
          return;
        }
        setActive(a.id);
      };
    if (btnFavorite)
      btnFavorite.onclick = () => {
        const a = active();
        if (!a) return;
        toggleFavorite(a.id);
        HUB.renderCollection();
        toast(STATE.favorites.has(a.id) ? "Favorited." : "Unfavorited.");
      };
    const btnEdit = $("#btnEdit");
    if (btnEdit)
      btnEdit.onclick = async () => {
        const a = active();
        if (!a) return;
        // Don’t allow rename while resting (optional but consistent)
        const until = Number(a.rest_until_at || 0);
        if (until > Date.now()) {
          toast("That dragon is resting. Rename it after it wakes up.");
          return;
        }
        const nRaw = prompt("Rename dragon:", a.name);
        if (nRaw == null) return; // user hit Cancel
        const name = String(nRaw).trim().slice(0, 24);
        if (!name) {
          toast("A valid name is required.");
          return;
        }
        try {
          const payload = await apiFetch(`/players/me/dragons/${a.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name
            })
          });
          // Expecting: { dragon: {...} }
          const apiDr = payload?.dragon || payload;
          // Update local state from server
          const local = STATE.dragons.byId[a.id];
          if (local) local.name = apiDr.name || name;
          toast("Name updated.");
          HUB.renderActive();
          HUB.renderCollection();
          // Optional: refresh from API to stay 100% synced
          // refreshDragonsFromApiSafe();
        } catch (err) {
          console.error("Rename failed:", err);
          // Try to show server payload message if present
          const serverMsg = extractApiPayloadMessage(err);
          toast(serverMsg || "Rename failed. Try again.");
        }
      };
    if (viewList)
      viewList.onclick = () => {
        view = "list";
        viewList.classList.add("active");
        viewGrid && viewGrid.classList.remove("active");
        HUB.renderCollection();
      };
    if (viewGrid)
      viewGrid.onclick = () => {
        view = "grid";
        viewGrid.classList.add("active");
        viewList && viewList.classList.remove("active");
        HUB.renderCollection();
      };
    if (dSearch) dSearch.oninput = () => HUB.renderCollection();
    if (dSort) dSort.onchange = () => HUB.renderCollection();
    filterChips.forEach(
      (ch) =>
      (ch.onclick = () => {
        ch.classList.toggle("active");
        HUB.renderCollection();
      })
    );
    HUB.renderActive();
    HUB.renderCollection();
  }
  /* ================= Buttons & Backdrop ================= */
  document.querySelectorAll(".btn[data-panel]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      startHubAmbienceOnce();
      const key = btn.getAttribute("data-panel");
      const p = panels[key];
      if (!p) return;
      const already = p.classList.contains("open");
      closeAll();
      if (!already) {
        // Reload live data when opening Cargo
        if (key === "cargo") {
          try {
            await loadPlayerHubData(); // re-fetch /players/me + /players/me/inventory
          } catch (err) {
            console.error("Failed to reload hub data:", err);
            toast("Could not refresh cargo.");
          }
        }
        p.classList.add("open");
        backdrop && backdrop.classList.add("show");
        if (key === "cargo") initCargoHold();
        if (key === "roost") initRoost();
        speak({
          map: "Chart yer course with purpose — driftin’s for jellyfish and fools.",
          cargo: "Mind yer stores. Kingdoms fall for lack of grain, not steel.",
          roost: "Treat a dragon as kin, not a weapon.",
          quarters: "Rest now; steel later."
        } [key] || "What’s the agenda today?");
      } else {
        speak("What’s the agenda today?");
      }
    });
  });
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      closeAll();
      speak("What’s the agenda today?");
    });
  }
  async function refreshDragonsFromApi() {
    try {
      const roostPayload = await apiFetch("/players/me/dragons");
      if (!roostPayload || !Array.isArray(roostPayload.dragons)) return;
      STATE.favorites = new Set();
      // Build/merge roster from API (do NOT rely on existing STATE)
      roostPayload.dragons.forEach((raw) => {
        const speciesObj = raw.species || {};
        const existing = STATE.dragons.byId[raw.id] || {};
        const d = {
          id: raw.id,
          code: raw.code || existing.code || speciesObj.code || "DRAGON",
          name: raw.name || existing.name || speciesObj.name || "Unnamed",
          element: raw.element || existing.element || "Neutral",
          species: speciesObj.name || existing.species || "Dragon",
          img: raw.img_url || existing.img || "",
          rarity: speciesObj.rarity || existing.rarity || "Common",
          size: existing.size || "Small",
          trait: existing.trait || "—",
          level: raw.level ?? existing.level ?? 1,
          hp: raw.hp ?? raw.hp_current ?? existing.hp ?? raw.hp_max ?? 1,
          hpMax: raw.hp_max ?? existing.hpMax ?? raw.hp ?? raw.hp_current ?? 1,
          mood: raw.mood ?? existing.mood ?? 60,
          hunger: raw.hunger ?? existing.hunger ?? 40,
          bond: raw.bond ?? existing.bond ?? 0,
          rest_until_at: raw.rest_until_at != null ?
            parseInt(raw.rest_until_at, 10) : existing.rest_until_at ?? null,
          action_points_current: raw.action_points_current != null ?
            parseInt(raw.action_points_current, 10) : (existing.action_points_current ?? 5),
          action_points_reset_at: raw.action_points_reset_at != null ?
            parseInt(raw.action_points_reset_at, 10) : (existing.action_points_reset_at ?? null),
          action_streaks: raw.action_streaks || existing.action_streaks || {}
        };
        d.happiness = deriveHappiness(d.mood, d.hunger);
        STATE.dragons.byId[d.id] = d;
        if (raw.is_favorite) STATE.favorites.add(d.id);
        STATE.lastUsed[d.id] = Date.now();
      });
      // Accept active id whether it's an object or a plain number
      let newActive = null;
      if (roostPayload.active_id != null) {
        newActive = (typeof roostPayload.active_id === "object") ?
          roostPayload.active_id.id :
          roostPayload.active_id;
      }
      newActive = (newActive != null) ? Number(newActive) : null;
      // If server explicitly gives an active dragon and we have it, use it.
      if (newActive != null && STATE.dragons.byId[newActive]) {
        STATE.dragons.activeId = newActive;
      }
      // If server gives null/undefined active_id, DO NOT pick a random one.
      // Keep whatever the user has selected for preview, otherwise allow it to be null.
      if (newActive == null) {
        if (STATE.dragons.activeId != null && !STATE.dragons.byId[STATE.dragons.activeId]) {
          STATE.dragons.activeId = null;
        }
      }
      if (STATE.dragons.selectedId != null && !STATE.dragons.byId[STATE.dragons.selectedId]) {
        STATE.dragons.selectedId = null;
      }
      if (typeof HUB.renderActive === "function") HUB.renderActive();
      if (typeof HUB.renderCollection === "function") HUB.renderCollection();
      if (typeof applyActionButtonStates === "function") applyActionButtonStates();
    } catch (err) {
      console.error("refreshDragonsFromApi failed", err);
    }
  }
  /* ================= Kick off API load ================= */
  loadPlayerHubData();
  window.addEventListener("focus", () => refreshDragonsFromApiSafe());
  window.addEventListener("pageshow", () => refreshDragonsFromApiSafe());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshDragonsFromApiSafe();
  });
