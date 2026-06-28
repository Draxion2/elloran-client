console.log("hub.js V-06/27/26 dragon-breeding-4 tidy-v5");

/* ===== Tiny utils ===== */
window.HATCHERY_TEST_MODE = false;
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
    url:
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_hub_faint_wind.mp3",
    volume: 0.2
  },
  {
    url:
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_hub_gulls.mp3",
    volume: 0.2
  },
  {
    url:
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_hub_ocean_waves.mp3",
    volume: 0.2
  },
  {
    url:
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_hub_ship_creak.mp3",
    volume: 0.2
  }
];

const SEA_DESTINATIONS = {
  TREASURE_COVE: {
    name: "Treasure Cove",
    risk: "Low",
    distance: "Nearby",
    desc:
      "A hidden sanctuary where weary crews repair hulls, trade whispers, and prepare for the next voyage."
  },

  OARS_REST: {
    name: "Port of Oar’s Rest",
    risk: "Low",
    distance: "Short Voyage",
    desc:
      "The busiest harbor in the western waters, filled with merchants, sailors, and rumors from across the sea."
  },

  KORIN: {
    name: "Korin",
    risk: "Moderate",
    distance: "Medium Voyage",
    desc:
      "A stern coastal settlement where storms and hardened sailors are equally common."
  },

  TRYN: {
    name: "Tryn",
    risk: "Moderate",
    distance: "Medium Voyage",
    desc: "A distant settlement surrounded by uneasy waters and fading legends."
  },

  AROBUS_ISLE: {
    name: "Arobus Isle",
    risk: "High",
    distance: "Long Voyage",
    desc:
      "An isolated island whispered about in taverns and old pirate journals."
  },

  TETRI: {
    name: "Tetri",
    risk: "High",
    distance: "Long Voyage",
    desc:
      "Dark waters, dangerous reefs, and ambitious captains surround the distant reaches of Tetri."
  }
};

const GROWTH_SFX = {
  buildup:
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_age_buildup.mp3",
  reveal:
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_age_reveal.mp3"
};

const SPECIALIZATION_SFX = {
  choose:
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_special_chosen.mp3",
  reveal:
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_special_reveal.mp3"
};

const HATCH_SFX = {
  buildup:
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_buildup.mp3",
  reveal:
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_reveal.mp3",
  hatchlings: [
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling.mp3",
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling2.mp3",
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling3.mp3",
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling4.mp3",
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling5.mp3",
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling6.mp3",
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling7.mp3",
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling8.mp3",
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling9.mp3",
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_dragon_hatching_hatchling10.mp3"
  ]
};

const RARITY_GLOWS = {
  COMMON: "#999696",
  UNCOMMON: "#FFFFFF",
  RARE: "#99CCFF",
  VERY_RARE: "#D169FA",
  LEGENDARY: "#ffd700"
};

let hatchBuildupAudio = null;

function playHatchBuildupSfx() {
  if (!HATCH_SFX.buildup) return;

  hatchBuildupAudio = new Audio(HATCH_SFX.buildup);
  hatchBuildupAudio.volume = 0.55;
  hatchBuildupAudio.loop = true;
  hatchBuildupAudio.play().catch(() => {});
}

function stopHatchBuildupSfx() {
  if (!hatchBuildupAudio) return;

  hatchBuildupAudio.pause();
  hatchBuildupAudio.currentTime = 0;
  hatchBuildupAudio = null;
}

function playHatchRevealSfx() {
  if (!HATCH_SFX.reveal) return;

  const sfx = new Audio(HATCH_SFX.reveal);
  sfx.volume = 0.75;
  sfx.play().catch(() => {});
}

function playHatchlingSfx() {
  const pool = HATCH_SFX.hatchlings || [];

  if (!pool.length) return;

  const url = pool[Math.floor(Math.random() * pool.length)];

  const sfx = new Audio(url);
  sfx.volume = 0.8;
  sfx.play().catch(() => {});
}


function playSpecializationChooseSfx() {
  if (!SPECIALIZATION_SFX.choose) return;

  const sfx = new Audio(SPECIALIZATION_SFX.choose);
  sfx.volume = 0.65;
  sfx.play().catch(() => {});
}

function playSpecializationRevealSfx() {
  if (!SPECIALIZATION_SFX.reveal) return;

  const sfx = new Audio(SPECIALIZATION_SFX.reveal);
  sfx.volume = 0.7;
  sfx.play().catch(() => {});
}

let growthBuildupAudio = null;

function playGrowthBuildupSfx() {
  if (!GROWTH_SFX.buildup) return;

  growthBuildupAudio = new Audio(GROWTH_SFX.buildup);
  growthBuildupAudio.volume = 0.55;
  growthBuildupAudio.loop = true;
  growthBuildupAudio.play().catch(() => {});
}

function stopGrowthBuildupSfx() {
  if (!growthBuildupAudio) return;
  growthBuildupAudio.pause();
  growthBuildupAudio.currentTime = 0;
  growthBuildupAudio = null;
}

function playGrowthRevealSfx() {
  if (!GROWTH_SFX.reveal) return;

  const sfx = new Audio(GROWTH_SFX.reveal);
  sfx.volume = 0.75;
  sfx.play().catch(() => {});
}

const mapRows = document.querySelectorAll(".map-row");

const voyageName = document.querySelector(".voyage-name");
const voyageDesc = document.querySelector(".voyage-desc");
const voyageRisk = document.getElementById("voyageRisk");
const voyageDistance = document.getElementById("voyageDistance");
const btnSetSail = document.getElementById("btnSetSail");

let selectedDestination = null;

mapRows.forEach((row) => {
  row.addEventListener("click", () => {
    mapRows.forEach((r) => r.classList.remove("active"));
    row.classList.add("active");

    const key = row.dataset.dest;
    const data = SEA_DESTINATIONS[key];

    if (!data) return;

    selectedDestination = key;

    voyageName.textContent = data.name;
    voyageDesc.textContent = data.desc;
    voyageRisk.textContent = `Risk: ${data.risk}`;
    voyageDistance.textContent = `Distance: ${data.distance}`;

    btnSetSail.disabled = false;
  });
});

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

const GROWTH_STAGE_IMAGES = {
  SCYTHE_CLAW_MALE_RED: {
    wyrmling:
      "https://cdn.jsdelivr.net/gh/Draxion2/elloran-client@main/dragon_testing_wyrmling.png",
    juvenile:
      "https://cdn.jsdelivr.net/gh/Draxion2/elloran-client@main/dragon_testing_juvenile.png",
    adult:
      "https://cdn.jsdelivr.net/gh/Draxion2/elloran-client@main/dragon_testing_wyrmling.png",
    elder:
      "https://cdn.jsdelivr.net/gh/Draxion2/elloran-client@main/dragon_testing_elder.png"
  }
};

function getDragonGrowthImage(dragon, stage) {
  const key = dragon.skinCode || dragon.skin_code || dragon.code;

  return (
    GROWTH_STAGE_IMAGES[key]?.[String(stage || "").toLowerCase()] ||
    dragon.img ||
    ""
  );
}

function swapGrowthCeremonyImage(dragon, stage) {
  const img = document.getElementById("growthCeremonyDragon");
  if (!img) return;

  const url = getDragonGrowthImage(dragon, stage);
  if (!url) return;

  img.classList.remove(
    "show",
    "flash",
    "growth-awakening",
    "growth-transforming",
    "growth-reveal"
  );

  setTimeout(() => {
    img.src = url;
    img.classList.add("flash", "growth-reveal");

    setTimeout(() => {
      img.classList.add("show");
    }, 120);
  }, 120);
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

function tweenNumber({ from, to, duration = 350, onUpdate }) {
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
function normalizeHatcheryState(payload) {
  if (!payload?.has_egg || !payload.incubation) return payload;

  const inc = payload.incubation;
  const startedAt = Number(inc.incubation_started_at || 0);
  const readyAt = Number(inc.hatch_ready_at || 0);
  const now = Date.now();

  if (!startedAt || !readyAt) return payload;

  if (readyAt <= startedAt) {
    return {
      ...payload,
      can_hatch: true,
      incubation: {
        ...inc,
        seconds_remaining: 0,
        percent_complete: 100,
        stage: "ready"
      }
    };
  }

  const durationSeconds = Math.max(1, Math.floor((readyAt - startedAt) / 1000));
  const elapsedSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const secondsRemaining = Math.max(0, Math.floor((readyAt - now) / 1000));

  const percentComplete = Math.max(
    0,
    Math.min(100, Math.floor((elapsedSeconds / durationSeconds) * 100))
  );

  let stage = "warm";

  if (percentComplete >= 100) {
    stage = "ready";
  } else if (percentComplete >= 66) {
    stage = "cracking";
  } else if (percentComplete >= 33) {
    stage = "restless";
  }

  return {
    ...payload,
    can_hatch: secondsRemaining <= 0,
    incubation: {
      ...inc,
      seconds_remaining: secondsRemaining,
      percent_complete: percentComplete,
      stage
    }
  };
}
let dragonsRefreshBlockedUntil = 0;
async function refreshHubLiveDataSafe() {
  if (window.HATCHERY_TEST_MODE === true) {
    return;
  }

  await refreshDragonsFromApiSafe();

  if (hatcheryMounted) {
    await fetchHatcheryState();
  }
}
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
  const cur = Number.isFinite(+d?.action_points_current)
    ? +d.action_points_current
    : max;
  const resetAt =
    d?.action_points_reset_at != null
      ? parseInt(d.action_points_reset_at, 10)
      : null;
  return {
    cur: Math.max(0, Math.min(max, cur)),
    max,
    resetAt
  };
}

function getBondStage(bond) {
  bond = Number(bond || 0);
  if (bond >= 100) return "devoted";
  if (bond >= 75) return "loyal";
  if (bond >= 50) return "trusted";
  if (bond >= 25) return "familiar";
  return "wary";
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
  if (apiDr.action_points_current != null)
    local.action_points_current = Number(apiDr.action_points_current);
  if (apiDr.action_points_reset_at != null)
    local.action_points_reset_at = Number(apiDr.action_points_reset_at);
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
    window.location.href = "https://draxtesting.forumotion.com/h1-title-page";
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
    window.location.href = "https://draxtesting.forumotion.com/h1-title-page";
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
    hp:
      activeDragon.hp_current ??
      activeDragon.hp ??
      existing.hp ??
      activeDragon.hp_max ??
      1,
    hpMax:
      activeDragon.hp_max ?? existing.hpMax ?? activeDragon.hp_current ?? 1,
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
    const invList = Array.isArray(invPayload.inventory)
      ? invPayload.inventory
      : [];
    const eqList = Array.isArray(eqPayload.equipment)
      ? eqPayload.equipment
      : [];
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
    if (
      roostPayload &&
      Array.isArray(roostPayload.dragons) &&
      roostPayload.dragons.length
    ) {
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
          gender: raw.gender || null,
          growthStage: raw.growth_stage || "wyrmling",
          canGrow: !!raw.can_grow,
          growthBlockReason: raw.growth_block_reason || null,
          nextGrowthStage: raw.next_growth_stage || null,
          specialization: raw.specialization || null,
          dragonSpecializationsId: raw.dragon_specializations_id || null,
          specializationChosenAt: raw.specialization_chosen_at || null,
          requiredDays: raw.required_days ?? 0,
          requiredBond: raw.required_bond ?? 0,
          daysSinceObtained: raw.days_since_obtained ?? 0,
          element: raw.element || "Neutral",
          species: speciesObj.name || "Dragon",
          personality: raw.personality || speciesObj.personality || null,
          favoriteActivity: raw.favorite_activity || null,
          img: raw.img_url || "",
          rarity: speciesObj.rarity || "Common",
          size: "Small",
          trait: raw.trait || null,
          level: raw.level ?? 1,
          hp: raw.hp ?? raw.hp_current ?? raw.hp_max ?? 1,
          hpMax: raw.hp_max ?? raw.hp ?? raw.hp_current ?? 1,
          mood: raw.mood ?? 60,
          hunger: raw.hunger ?? 40,
          bond: raw.bond ?? 0,
          relationships: raw.relationships || [],
          rest_until_at:
            raw.rest_until_at != null ? parseInt(raw.rest_until_at, 10) : null,
          action_points_current:
            raw.action_points_current != null
              ? parseInt(raw.action_points_current, 10)
              : 5,
          action_points_reset_at:
            raw.action_points_reset_at != null
              ? parseInt(raw.action_points_reset_at, 10)
              : null,
          action_streaks: raw.action_streaks || {}
        };
        d.happiness = deriveHappiness(d.mood, d.hunger);
        STATE.dragons.byId[d.id] = d;
        if (raw.is_favorite) STATE.favorites.add(d.id);
        STATE.lastUsed[d.id] = Date.now();
      });
      if (
        STATE.dragons.selectedId != null &&
        !STATE.dragons.byId[STATE.dragons.selectedId]
      ) {
        STATE.dragons.selectedId = null;
      }
      // set activeId (same as your existing logic, but cast to Number)
      let activeId = null;
      if (roostPayload.active_id != null) {
        activeId =
          typeof roostPayload.active_id === "object"
            ? roostPayload.active_id.id
            : roostPayload.active_id;
      } else if (playerObj.dragon_active_id != null) {
        activeId = playerObj.dragon_active_id;
      }
      activeId = activeId != null ? Number(activeId) : null;
      STATE.dragons.activeId =
        activeId != null && STATE.dragons.byId[activeId]
          ? activeId
          : STATE.dragons.activeId;
    } else {
      // ✅ truly keep existing dragon state
      console.warn(
        "Roost payload missing/empty; keeping existing dragon state."
      );
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
    const okC =
      !it.req_class ||
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
    const eq = item.equip_slot
      ? `Equip: ${item.equip_slot}` +
        (item.req_level ? ` • Req Lv ${item.req_level}` : "") +
        (item.req_class ? ` • Class ${item.req_class}` : "")
      : "";
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
      .map(
        (s, i) =>
          s && {
            slot: i,
            item: s.item,
            qty: s.qty
          }
      )
      .filter(Boolean)
      .filter(filterFn)
      .sort(sortItems);
    const cargoList = STATE.cargo
      .map(
        (s, i) =>
          s && {
            slot: i,
            item: s.item,
            qty: s.qty
          }
      )
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
      "#actFeed",
      "#actPlay",
      "#actGroom",
      "#actTrain",
      "#actRest",
      "#actRaid",
      "#actBreed",
      "#btnFeed",
      "#btnPlay",
      "#btnGroom",
      "#btnTrain",
      "#btnRest",
      "#btnRaid",
      "#btnBreed"
    ].forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) setDisabledVisual(el, true, "No active dragon selected.");
    });
    return;
  }
  const locks = getDragonLocks(d);
  const reason = locks.reason || "";
  const restUntil = parseInt(d.rest_until_at, 10);
  const isResting = Number.isFinite(restUntil) && restUntil > Date.now();
  const { cur: staminaCur } = getStamina(d);
  const apMax = 5;
  let apNow = Number.isFinite(Number(d.action_points_current))
    ? Number(d.action_points_current)
    : apMax;
  const apResetAt =
    d.action_points_reset_at != null
      ? parseInt(d.action_points_reset_at, 10)
      : null;
  // If timer passed, the backend will refill on next action call,
  // but UI should treat it as full once reset time is reached.
  if (apResetAt != null && apResetAt <= Date.now()) apNow = apMax;
  const outOfStamina = apNow < 1;
  const staminaReason = outOfStamina
    ? "This dragon is exhausted (Stamina 0/5)."
    : "";
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
  const why = isResting ? "Dragon is resting." : staminaReason || reason;
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
let lastIdleDragonId = null;
let dragonIdleTimer = null;

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
    "{name} lets out a soft, contented rumble.",
    "{name} curls comfortably near the warm lantern light.",
    "{name} seems unusually relaxed aboard the ship.",
    "{name} appears delighted to see you.",
    "{name} seems happy and content."
  ],
  hungry: [
    "{name} keeps glancing toward the food crates.",
    "{name} sniffs the air, clearly hoping for food.",
    "{name} seems distracted by hunger.",
    "The moment you enter the roost, you hear {name}'s stomach growl.",
    "{name} watches every passing crewmember as if they might be carrying a meal.",
    "{name} paws impatiently at the feeding area.",
    "{name}'s attention immediately shifts whenever food is mentioned.",
    "{name} looks more interested in supplies than conversation today.",
    "{name} lets out a low, hungry rumble.",
    "{name} keeps checking the same empty bowl, just in case something changed."
  ],
  tired: [
    "{name} lets out a slow breath before settling down.",
    "{name} looks ready to rest for a while.",
    "{name} quietly curls against the floorboards.",
    "{name}'s eyes seem heavier than usual today.",
    "{name} stretches before searching for a comfortable place to lie down.",
    "{name} barely reacts to the usual sounds around the ship.",
    "{name} looks content to simply rest and watch the lantern light.",
    "{name} suppresses a yawn and lowers their head.",
    "{name} seems far more interested in sleep than activity.",
    "{name} shifts into a comfortable position and relaxes."
  ],
  bonded: [
    "{name} seems calmer whenever you're nearby.",
    "{name} watches you with quiet trust.",
    "{name} stays close as the ship gently rocks.",
    "{name} visibly relaxes when you enter the roost.",
    "{name} seems content simply sharing the space with you.",
    "{name} greets your arrival with a familiar rumble.",
    "{name}'s eyes follow you wherever you move.",
    "{name} appears happiest when you're close by.",
    "{name} settles nearby as though your presence is reassuring.",
    "{name} briefly nudges you before returning to rest."
  ]
};

const DRAGON_TRAIT_IDLE_LINES = {
  PROTECTIVE: [
    "{name} positions themselves between you and the door.",
    "{name} watches the room carefully, staying close to your side.",
    "{name} lets out a low rumble when footsteps pass outside the roost.",
    "{name} subtly positions themselves where they can watch over you.",
    "{name} remains alert, ready to react to the slightest threat."
  ],

  PLAYFUL: [
    "{name} nudges your hand, clearly wanting attention.",
    "{name} flicks their tail with mischief in their eyes.",
    "{name} bounces lightly, waiting for you to play along.",
    "{name} bats at an imaginary target before looking pleased with themselves.",
    "{name} seems determined to turn even a quiet moment into a game."
  ],

  CURIOUS: [
    "{name} sniffs at nearby crates with bright, curious eyes.",
    "{name} tilts their head, studying every movement you make.",
    "{name} paws gently at something shiny on the floorboards.",
    "{name} investigates a loose plank as though it hides a great mystery.",
    "{name} studies a passing shadow with intense fascination."
  ],

  INDEPENDENT: [
    "{name} keeps their distance, but their eyes still follow you.",
    "{name} rests alone, clearly comfortable doing things their own way.",
    "{name} gives you a brief glance before settling back down.",
    "{name} appears perfectly content occupying their own corner of the roost.",
    "{name} values your company, but clearly enjoys their personal space."
  ],

  STUBBORN: [
    "{name} huffs and refuses to move from their chosen spot.",
    "{name} digs their claws into the floorboards with quiet defiance.",
    "{name} gives you a look that says they heard you... and disagree.",
    "{name} ignores a perfectly good resting spot in favor of their chosen one.",
    "{name} seems determined to do things on their own terms."
  ],

  CALM: [
    "{name} breathes slowly, completely at ease.",
    "{name} rests peacefully despite the creaking ship around them.",
    "{name} watches the lantern light with steady, patient eyes.",
    "{name} remains unbothered by the noise and motion of the ship.",
    "{name} looks completely at peace with the world around them."
  ],

  MYSTERIOUS: [
    "{name} stares into the shadows as if listening to something unseen.",
    "{name} grows still, their eyes reflecting the lantern flame.",
    "{name} seems distant, as though their thoughts are far beyond the ship.",
    "{name} seems to notice things that escape everyone else.",
    "{name} watches the horizon with a distant, unreadable expression."
  ],

  FOOD_LOVING: [
    "{name} keeps glancing toward the food crates.",
    "{name} perks up the moment anything edible is nearby.",
    "{name} sniffs the air hopefully, searching for a snack.",
    "{name} perks up immediately at the faintest smell of food.",
    "{name} appears convinced that another meal should arrive any minute now."
  ],

  AFFECTIONATE: [
    "{name} leans gently against your side.",
    "{name} seems happiest when staying close to you.",
    "{name} watches you with quiet, trusting eyes.",
    "{name} nudges your shoulder before settling down nearby.",
    "{name} follows your movements around the roost."
  ],

  WATCHFUL: [
    "{name} keeps a careful eye on everything around them.",
    "{name} scans the room without ever fully relaxing.",
    "{name}'s gaze follows every creak and distant sound.",
    "{name} watches the doorway with unwavering focus.",
    "{name} notices movement long before you do."
  ],
  PICKY_EATER: [
    "{name} sniffs the food bowl and seems unimpressed.",
    "{name} eyes the provisions suspiciously before looking away.",
    "{name} appears to be hoping for something better to eat.",
    "{name} gives the offered meal a doubtful glance.",
    "{name} seems unusually selective about what goes into their stomach."
  ],
  ENERGETIC: [
    "{name} struggles to stay still for more than a few moments.",
    "{name} paces excitedly around the roost.",
    "{name} flicks their tail with restless enthusiasm.",
    "{name} looks ready to sprint across the deck at any moment.",
    "{name} seems eager for something to happen."
  ],
  COMPETITIVE: [
    "{name} watches other dragons with quiet determination.",
    "{name} carries themselves as though they have something to prove.",
    "{name} seems unwilling to be outdone by anyone.",
    "{name} stands a little taller whenever another dragon is nearby.",
    "{name} looks ready to turn almost anything into a challenge."
  ],
  RESTLESS: [
    "{name} shifts position again despite only just getting comfortable.",
    "{name} seems unable to settle on a single spot.",
    "{name} glances toward the exit more than once.",
    "{name} fidgets with growing impatience.",
    "{name} looks as though they would rather be somewhere else right now."
  ],
  GENTLE: [
    "{name} moves with remarkable care despite their size.",
    "{name}'s calm presence makes the roost feel quieter.",
    "{name} watches the world with patient eyes.",
    "{name} carefully avoids disturbing anything around them.",
    "{name} rests peacefully beside you."
  ]
};

const DRAGON_BOND_IDLE_LINES = {
  wary: [
    "{name} keeps a careful distance.",
    "{name} watches you cautiously.",
    "{name} seems unsure what to make of you.",
    "{name} shifts slightly away when you move too quickly.",
    "{name} studies you as though still deciding if you can be trusted."
  ],

  familiar: [
    "{name} seems more comfortable around you than before.",
    "{name} no longer watches every movement with suspicion.",
    "{name} appears to recognize your routines.",
    "{name} allows you closer than they once did.",
    "{name} relaxes slightly when you enter the roost."
  ],

  trusted: [
    "{name} settles nearby without hesitation.",
    "{name} seems comfortable in your presence.",
    "{name} watches you with growing confidence.",
    "{name} lets their guard down when you are close.",
    "{name} rests nearby as though your presence feels safe."
  ],

  loyal: [
    "{name} visibly relaxes when you arrive.",
    "{name} seems happiest when close to you.",
    "{name} follows your movements around the roost.",
    "{name} stays near you even when the ship grows noisy.",
    "{name} greets you with a familiar, content rumble."
  ],

  devoted: [
    "{name} looks at you with complete trust.",
    "{name} seems unwilling to let you out of sight for long.",
    "{name} settles beside you as though there is nowhere else they would rather be.",
    "{name} responds to your presence before you even speak.",
    "{name} rests close enough that you can feel their warmth."
  ]
};

const DRAGON_RELATIONSHIP_IDLE_LINES = {
  friend: [
    "{name} seems more relaxed while {other} is nearby.",
    "{name} glances toward {other} with growing comfort.",
    "{name} settles close enough to {other} to share the lantern warmth.",
    "{name} gives {other} a quiet, familiar rumble.",
    "{name} appears curious whenever {other} moves through the roost."
  ],

  rival: [
    "{name} keeps a wary eye on {other}.",
    "{name} watches {other} from across the roost.",
    "A low tension lingers between {name} and {other}.",
    "{name} stiffens slightly whenever {other} gets too close.",
    "{name} seems unwilling to turn their back on {other}."
  ]
};

const DRAGON_FAVORITE_ACTIVITY_REACTIONS = {
  feed: [
    "{name} seems especially pleased with today's meal.",
    "{name} eagerly settles in for their favorite part of the day.",
    "{name} accepts the food with unmistakable enthusiasm."
  ],

  play: [
    "{name} perks up immediately.",
    "{name} clearly loves spending time this way.",
    "{name} throws themselves into the moment with rare excitement."
  ],

  groom: [
    "{name} relaxes almost instantly.",
    "{name} seems unusually content during the grooming session.",
    "{name} settles into the attention as though waiting for this."
  ],

  train: [
    "{name} approaches the exercise with unusual enthusiasm.",
    "{name} looks excited before the session even begins.",
    "{name} gives the training their full attention."
  ]
};

const DRAGON_ACTION_REACTIONS = {
  feed: {
    AFFECTIONATE: "{name} happily accepts the food and stays close afterward.",
    PLAYFUL: "{name} devours the meal before nudging you for more attention.",
    PROTECTIVE: "{name} eats quickly but never stops watching the room.",
    WATCHFUL: "{name} keeps an eye on their surroundings between bites.",
    CURIOUS: "{name} investigates the meal carefully before eating.",
    INDEPENDENT: "{name} accepts the food with quiet self-assurance.",
    FOOD_LOVING: "{name} eagerly devours every scrap offered.",
    PICKY_EATER:
      "{name} sniffs the meal suspiciously before finally taking a bite.",
    ENERGETIC:
      "{name} finishes eating so quickly you wonder if they even tasted it.",
    STUBBORN:
      "{name} eventually eats, though only after inspecting everything first.",
    COMPETITIVE: "{name} attacks the meal as if trying to set a record.",
    CALM: "{name} eats slowly and appears completely content.",
    RESTLESS: "{name} struggles to stay focused on the meal.",
    GENTLE: "{name} accepts the food carefully from your hand.",
    MYSTERIOUS:
      "{name} studies the meal quietly before taking a deliberate bite."
  },

  play: {
    AFFECTIONATE:
      "{name} stays close throughout the play session, clearly enjoying your attention.",
    PLAYFUL: "{name} immediately joins in with obvious excitement.",
    PROTECTIVE: "{name} enjoys the activity while staying close to your side.",
    WATCHFUL:
      "{name} plays along, though their eyes still track every sound nearby.",
    CURIOUS:
      "{name} turns the game into an excuse to investigate everything around them.",
    INDEPENDENT:
      "{name} participates, though only after deciding it was worthwhile.",
    FOOD_LOVING:
      "{name} plays for a while, though their attention drifts toward the food crates.",
    PICKY_EATER:
      "{name} seems more interested in choosing the game than playing it.",
    ENERGETIC:
      "{name} throws themselves into the activity with almost too much excitement.",
    STUBBORN:
      "{name} joins in eventually, but only after pretending not to care.",
    COMPETITIVE: "{name} quickly turns the activity into a challenge.",
    CALM: "{name} enjoys the game without getting overly excited.",
    RESTLESS:
      "{name} moves from one playful motion to the next without slowing down.",
    GENTLE: "{name} plays carefully, never rougher than they need to be.",
    MYSTERIOUS:
      "{name} plays in a strange, quiet way that feels almost ritualistic."
  },

  groom: {
    AFFECTIONATE: "{name} leans into the attention appreciatively.",
    PLAYFUL: "{name} keeps trying to turn grooming into a game.",
    PROTECTIVE: "{name} allows the grooming but keeps watching the entrance.",
    WATCHFUL: "{name} remains alert even while you tend to them.",
    CURIOUS:
      "{name} inspects every brush and cloth before letting you continue.",
    INDEPENDENT: "{name} tolerates the grooming with dignified patience.",
    FOOD_LOVING:
      "{name} behaves better once food is clearly not off the table later.",
    PICKY_EATER:
      "{name} seems very particular about how their scales are cleaned.",
    ENERGETIC: "{name} makes grooming difficult by constantly shifting around.",
    STUBBORN: "{name} resists at first, then finally allows you to continue.",
    COMPETITIVE: "{name} holds still as if determined to prove they can.",
    CALM: "{name} appears completely at ease during grooming.",
    RESTLESS: "{name} struggles to remain still while you work.",
    GENTLE: "{name} closes their eyes and relaxes during the grooming session.",
    MYSTERIOUS: "{name} grows strangely still as you brush away dust and salt."
  },

  train: {
    AFFECTIONATE: "{name} works hard, seeming eager to please you.",
    PLAYFUL:
      "{name} treats the training like a game but still gives it effort.",
    PROTECTIVE: "{name} approaches every exercise with focused discipline.",
    WATCHFUL: "{name} studies each command carefully before acting.",
    CURIOUS: "{name} seems fascinated by every new movement and command.",
    INDEPENDENT:
      "{name} follows the routine, though clearly on their own terms.",
    FOOD_LOVING: "{name} trains harder once they suspect food may follow.",
    PICKY_EATER:
      "{name} performs well enough, though they seem unimpressed by the reward.",
    ENERGETIC: "{name} seems disappointed when the training session ends.",
    STUBBORN: "{name} cooperates eventually, though not without resistance.",
    COMPETITIVE: "{name} attacks the training session with determination.",
    CALM: "{name} works steadily through the training routine.",
    RESTLESS: "{name} throws too much energy into the drills but keeps going.",
    GENTLE: "{name} follows each command with careful control.",
    MYSTERIOUS: "{name} moves through the exercises with eerie focus."
  }
};

function getDragonActionReaction(actionKey, d, fallbackText) {
  if (!d) return fallbackText || "";

  const isFavoriteActivity = d.favoriteActivity === actionKey;

  if (isFavoriteActivity) {
    const favoritePool = DRAGON_FAVORITE_ACTIVITY_REACTIONS[actionKey];

    if (favoritePool && favoritePool.length) {
      const favoriteReaction =
        favoritePool[Math.floor(Math.random() * favoritePool.length)];

      return favoriteReaction.replaceAll("{name}", d.name || "Your dragon");
    }
  }

  const traitCode = d.trait?.code;
  const traitReaction = DRAGON_ACTION_REACTIONS[actionKey]?.[traitCode];

  return (traitReaction || fallbackText || "").replaceAll(
    "{name}",
    d.name || "Your dragon"
  );
}

function getDragonRelationshipIdleLine(d) {
  const relationships = Array.isArray(d.relationships) ? d.relationships : [];

  if (!relationships.length) return null;

  const valid = relationships.filter((rel) =>
    rel &&
    rel.relationship_type &&
    rel.dragon_name &&
    DRAGON_RELATIONSHIP_IDLE_LINES[rel.relationship_type]
  );

  if (!valid.length) return null;

  const rel = valid[Math.floor(Math.random() * valid.length)];
  const pool = DRAGON_RELATIONSHIP_IDLE_LINES[rel.relationship_type];

  const line = pool[Math.floor(Math.random() * pool.length)];

  return line
    .replaceAll("{name}", d.name || "Your dragon")
    .replaceAll("{other}", rel.dragon_name || "another dragon");
}

function pickDragonIdleLine(d) {
  if (!d) return "No dragon is currently resting in the roost.";

  let pool = DRAGON_IDLE_LINES.neutral;

  const traitCode = d.trait?.code;

  if (traitCode && DRAGON_TRAIT_IDLE_LINES[traitCode]) {
    const traitPool = DRAGON_TRAIT_IDLE_LINES[traitCode];

    // 60% chance to use trait-specific flavor
    if (Math.random() < 0.6) {
      return traitPool[Math.floor(Math.random() * traitPool.length)].replaceAll(
        "{name}",
        d.name || "Your dragon"
      );
    }
  }

  if (Number(d.hunger || 0) >= 70) {
    pool = DRAGON_IDLE_LINES.hungry;
  } else if (Number(d.hp || 0) < Number(d.hpMax || 1) * 0.4) {
    pool = DRAGON_IDLE_LINES.tired;
  } else {
    const relationshipLine = getDragonRelationshipIdleLine(d);
    if (relationshipLine && Math.random() < 0.35) {
      return relationshipLine;
    }
    const bondStage = getBondStage(d.bond);
    const bondPool = DRAGON_BOND_IDLE_LINES[bondStage];

    // 35% chance to show relationship behavior when not hungry/tired.
    if (bondPool && Math.random() < 0.6) {
      return bondPool[Math.floor(Math.random() * bondPool.length)].replaceAll(
        "{name}",
        d.name || "Your dragon"
      );
    }

    if (Number(d.mood || 0) >= 75) {
      pool = DRAGON_IDLE_LINES.happy;
    }
  }

  return pool[Math.floor(Math.random() * pool.length)].replaceAll(
    "{name}",
    d.name || "Your dragon"
  );
}

function updateDragonIdleText(d, force = false) {
  const el = document.getElementById("dragonIdleText");
  if (!el) return;

  if (dragonReactionActive) {
    return;
  }

  const dragonId = d?.id ?? null;

  // Cosmetic text should not reroll on normal API refreshes.
  // Only reroll when forced or when the viewed dragon changes.
  if (!force && dragonId === lastIdleDragonId) {
    return;
  }

  lastIdleDragonId = dragonId;

  el.style.opacity = "0";

  setTimeout(() => {
    if (dragonReactionActive) return;

    el.textContent = pickDragonIdleLine(d);
    el.style.opacity = ".92";

    el.classList.remove("idle-line-pulse");
    void el.offsetWidth;
    el.classList.add("idle-line-pulse");
  }, 220);
}

function startDragonIdleRotation() {
  if (dragonIdleTimer) {
    clearTimeout(dragonIdleTimer);
  }

  const delay = 30000 + Math.floor(Math.random() * 15000);

  dragonIdleTimer = setTimeout(() => {
    const roostPanel = document.querySelector("#panel-roost");

    if (
      roostPanel &&
      roostPanel.classList.contains("open") &&
      !dragonReactionActive
    ) {
      const id = STATE.dragons.selectedId ?? STATE.dragons.activeId;
      const d = id != null ? STATE.dragons.byId[id] : null;

      updateDragonIdleText(d, true);
    }

    startDragonIdleRotation();
  }, delay);
}

function setTemporaryDragonReaction(text, duration = 12000) {
  const el = document.getElementById("dragonIdleText");
  if (!el) return;

  dragonReactionActive = true;

  if (dragonReactionTimeout) {
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

/* ================= Hatchery Placeholder Wiring ================= */

let hatcheryMounted = false;

const HATCHERY_PLACEHOLDER = {
  activeEgg: null,
  storage: []
};

/*
Expected future API shape:

GET /players/me/dragon-eggs

{
  active_egg: {
    id: 1,
    egg_name: "Shadow Egg",
    egg_color: "shadow",
    stage: "stirring",
    incubation_started_at: 1780000000000,
    hatch_ready_at: 1780259200000,
    hatch_duration_ms: 259200000
  },
  storage: [
    {
      id: 2,
      egg_name: "Azure Egg",
      egg_color: "azure",
      source: "discovery"
    }
  ]
}
*/

function formatHatcheryTime(ms) {
  ms = Math.max(0, Number(ms || 0));

  const totalMinutes = Math.ceil(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getEggStageFromProgress(progressPct) {
  if (progressPct >= 100) return "Ready to Hatch";
  if (progressPct >= 66) return "Cracking";
  if (progressPct >= 33) return "Stirring";
  return "Dormant";
}

let hatcheryState = null;
let hatcheryTimer = null;

async function fetchHatcheryState() {
  try {
    const payload = await apiFetch("/players/me/dragons/hatchery");
    hatcheryState = normalizeHatcheryState(payload);
    renderHatchery(hatcheryState);
    startHatcheryTimer();
  } catch (err) {
    console.error("fetchHatcheryState failed", err);
    toast("Could not load hatchery.");
  }
}

async function hatchActiveEgg() {
  const btn = document.getElementById("hatchEggBtn");
  if (btn) btn.disabled = true;

  const eggSnapshot = hatcheryState?.egg || null;

  try {
    const payload = await apiFetch("/players/me/dragons/hatchery/hatch", {
      method: "POST"
    });

    startHatchCeremony(payload, eggSnapshot);
  } catch (err) {
    console.error("hatchActiveEgg failed", err);
    toast(extractApiPayloadMessage(err) || "Could not hatch egg.");
    await fetchHatcheryState();
  }
}

function startHatchCeremony(payload, eggSnapshot) {
  const overlay = document.getElementById("hatchCeremonyOverlay");
  const eggEl = document.getElementById("ceremonyEgg");
  const dragonEl = document.getElementById("ceremonyDragon");
  const textEl = document.getElementById("hatchCeremonyText");
  const btnContinue = document.getElementById("hatchCeremonyContinue");
  const flashEl = document.getElementById("hatchFlash");
  const rarityGlow = document.getElementById("dragonRarityGlow");
  const namePrompt = document.getElementById("hatchNamePrompt");
  const nameInput = document.getElementById("hatchNameInput");
  const nameSubmit = document.getElementById("hatchNameSubmit");
  const nameSkip = document.getElementById("hatchNameSkip");

  window.HATCH_CEREMONY_ACTIVE = true;
  document.body.classList.add("ceremony-lock");

  if (!overlay || !eggEl || !dragonEl || !textEl || !btnContinue) {
    toast(`${payload.dragon?.name || "A dragon"} has hatched!`);
    refreshDragonsFromApiSafe();
    fetchHatcheryState();
    return;
  }

  const dragon = payload.dragon || {};
  const hatch = payload.hatch || {};
  console.log("HATCH PAYLOAD", payload);
  console.log("DRAGON IMG", dragon.img_url);
  const eggImg = eggSnapshot?.img_url || "";
  const rarity = (hatch.rarity || dragon.rarity || "COMMON").toUpperCase();
  const glowColor = RARITY_GLOWS[rarity] || RARITY_GLOWS.COMMON;

  if (rarityGlow) {
    rarityGlow.style.background = glowColor;
  }

  overlay.classList.add("active");
  playHatchBuildupSfx();

  eggEl.style.background = eggImg
    ? `transparent url("${eggImg}") center / contain no-repeat`
    : "";

  eggEl.className = "";
  eggEl.classList.add("hatching");

  dragonEl.src = "";
  dragonEl.style.display = "none";
  dragonEl.classList.remove("reveal");

  textEl.classList.remove("show");
  btnContinue.classList.remove("show");

  namePrompt?.classList.remove("show");
  if (nameInput) nameInput.value = "";
  if (nameSubmit) nameSubmit.disabled = false;
  if (nameSkip) nameSkip.disabled = false;

  setTimeout(() => {
    textEl.textContent = "The egg trembles beneath the lantern light...";
    textEl.classList.add("show");
  }, 600);

  setTimeout(() => {
    textEl.classList.remove("show");
    setTimeout(() => {
      textEl.textContent = "Thin cracks race across the shell.";
      textEl.classList.add("show");
    }, 500);
  }, 4200);

  setTimeout(() => {
    textEl.classList.remove("show");
    setTimeout(() => {
      textEl.textContent = "A brilliant warmth spills from within.";
      textEl.classList.add("show");
    }, 500);
  }, 8200);

  setTimeout(() => {
    eggEl.classList.remove("hatching");
    eggEl.classList.add("hatching-hard");
  }, 9400);

  setTimeout(() => {
    eggEl.classList.remove("hatching-hard");
    eggEl.classList.add("fade-out");

    if (flashEl) {
      flashEl.classList.remove("burst");
      stopHatchBuildupSfx();
      playHatchRevealSfx();
      void flashEl.offsetWidth;
      flashEl.classList.add("burst");
    }
  }, 10600);

  setTimeout(() => {
    eggEl.style.display = "none";

    if (dragon.img_url) {
      dragonEl.src = dragon.img_url;
    }

    if (rarityGlow) {
      rarityGlow.classList.add("active");
    }
    dragonEl.style.display = "block";
    dragonEl.classList.add("reveal");
    playHatchlingSfx();

    textEl.classList.remove("show");

    setTimeout(() => {
      textEl.textContent = `${
        hatch.species_name || dragon.species_name || dragon.name || "A dragon"
      } has hatched.`;
      textEl.classList.add("show");
    }, 600);
  }, 11600);

  setTimeout(() => {
    textEl.classList.remove("show");
    setTimeout(() => {
      textEl.innerHTML = `
        <div
          class="hatch-rarity"
          style="color:${glowColor}"
        >
          ${rarity.replaceAll("_", " ")}
        </div>
        <strong>
          ${
            hatch.species_name ||
            dragon.species_name ||
            dragon.name ||
            "Unknown Dragon"
          }
        </strong><br>
        ${hatch.gender || "Unknown"} • ${
        hatch.trait_name || "Unknown Trait"
        }<br>

        Favorite Activity:
        ${dragon.favorite_activity || "Unknown"}
      `;
      textEl.classList.add("show");
    }, 500);
  }, 14500);

  setTimeout(() => {
  document.body.classList.remove("ceremony-lock");

  if (namePrompt && nameInput && nameSubmit && nameSkip) {
    namePrompt.classList.add("show");
    nameInput.focus();

    const finishNaming = () => {
      namePrompt.classList.remove("show");
      btnContinue.classList.add("show");
    };

    nameSubmit.onclick = async () => {
      const newName = nameInput.value.trim().slice(0, 24);

      if (!newName) {
        toast("Enter a name or keep the default.");
        return;
      }

      nameSubmit.disabled = true;
      nameSkip.disabled = true;

      try {
        const renamePayload = await apiFetch(`/players/me/dragons/${dragon.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: newName
          })
        });

        const updatedDragon = renamePayload?.dragon || renamePayload;
        dragon.name = updatedDragon.name || newName;

        textEl.innerHTML = `
          <div
            class="hatch-rarity"
            style="color:${glowColor}"
          >
            ${rarity.replaceAll("_", " ")}
          </div>
          <strong>${dragon.name}</strong><br>
          ${hatch.gender || "Unknown"} • ${
          hatch.trait_name || "Unknown Trait"
        }<br>

          Favorite Activity:
          ${dragon.favorite_activity || "Unknown"}
        `;

        finishNaming();
      } catch (err) {
        console.error("Hatch rename failed", err);
        toast(extractApiPayloadMessage(err) || "Could not rename dragon.");
        nameSubmit.disabled = false;
        nameSkip.disabled = false;
      }
    };

    nameSkip.onclick = () => {
      finishNaming();
    };

    nameInput.onkeydown = (e) => {
      if (e.key === "Enter") {
        nameSubmit.click();
      }
    };
  } else {
    btnContinue.classList.add("show");
  }
}, 18000);

  btnContinue.onclick = async () => {
    overlay.classList.remove("active");
    btnContinue.classList.remove("show");
    textEl.classList.remove("show");

    eggEl.style.display = "";
    eggEl.className = "";
    eggEl.style.background = "";

    dragonEl.src = "";
    dragonEl.style.display = "none";
    dragonEl.classList.remove("reveal");

    window.HATCH_CEREMONY_ACTIVE = false;
    document.body.classList.remove("ceremony-lock");
    rarityGlow?.classList.remove("active");
    stopHatchBuildupSfx();
    await refreshDragonsFromApiSafe();
    await fetchHatcheryState();
  };
}

function startHatcheryTimer() {
  if (hatcheryTimer) clearInterval(hatcheryTimer);

  hatcheryTimer = setInterval(() => {
    if (!hatcheryState || !hatcheryState.has_egg) return;

    hatcheryState = normalizeHatcheryState(hatcheryState);
    renderHatchery(hatcheryState);
  }, 1000);
}

function renderHatchery(payload = hatcheryState) {
  const activeEgg = payload?.has_egg ? payload : null;
  const storage = payload?.storage || [];

  const badge = document.getElementById("hatcheryTabBadge");
  const eggName = document.getElementById("hatcheryEggName");
  const eggImg = document.querySelector(".hatchery-egg-img");
  const eggFlavor = document.getElementById("hatcheryEggFlavor");
  const eggStageText = document.getElementById("hatcheryEggStageText");
  const eggTimer = document.getElementById("hatcheryEggTimer");
  const progressFill = document.getElementById("hatcheryProgressFill");
  const hatchBtn = document.getElementById("hatchEggBtn");
  const eggStorageCount = document.getElementById("eggStorageCount");
  const eggList = document.getElementById("hatcheryEggList");

  const egg = activeEgg?.egg || null;
  const incubation = activeEgg?.incubation || null;

  if (badge) {
    const totalEggs = storage.length + (activeEgg ? 1 : 0);
    badge.textContent = totalEggs;
  }

  if (eggStorageCount) {
    eggStorageCount.textContent =
      storage.length === 1 ? "1 Egg" : `${storage.length} Eggs`;
  }

  if (!egg || !incubation) {
    if (eggName) eggName.textContent = "No Egg Incubating";
    if (eggFlavor) {
      eggFlavor.textContent =
        "The chamber is quiet. No egg rests beneath the warming lanterns.";
    }
    if (eggStageText) eggStageText.textContent = "—";
    if (eggImg) {
      eggImg.style.background = "";
      eggImg.classList.remove(
        "has-real-egg",
        "egg-stage-warm",
        "egg-stage-restless",
        "egg-stage-cracking",
        "egg-stage-ready"
      );
      eggImg.removeAttribute("aria-label");
    }
    if (eggTimer) eggTimer.textContent = "—";
    if (progressFill) progressFill.style.width = "0%";
    if (hatchBtn) hatchBtn.disabled = true;
  } else {
    const secondsLeft = Math.max(0, Number(incubation.seconds_remaining || 0));
    const msLeft = secondsLeft * 1000;
    const progress = Math.max(
      0,
      Math.min(100, Number(incubation.percent_complete || 0))
    );
    const ready = !!activeEgg.can_hatch;

    if (eggName) eggName.textContent = egg.egg_name || "Unknown Egg";
    if (eggImg) {
      eggImg.style.background = egg.img_url
        ? `transparent url("${egg.img_url}") center / contain no-repeat`
        : "";

      eggImg.classList.toggle("has-real-egg", !!egg.img_url);

      eggImg.classList.remove(
        "egg-stage-warm",
        "egg-stage-restless",
        "egg-stage-cracking",
        "egg-stage-ready"
      );

      eggImg.classList.add(`egg-stage-${incubation.stage || "warm"}`);

      eggImg.setAttribute("aria-label", egg.egg_name || "Dragon egg");
    }
    if (eggStageText) eggStageText.textContent = incubation.stage || "warm";
    if (eggTimer)
      eggTimer.textContent = ready ? "Ready" : formatHatcheryTime(msLeft);
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (hatchBtn) hatchBtn.disabled = !ready;

    if (eggFlavor) {
      if (ready) {
        eggFlavor.textContent =
          "The egg trembles beneath the lantern glow. Something inside is ready to meet the world.";
      } else if (progress >= 66) {
        eggFlavor.textContent =
          "Thin cracks spread across the shell as faint movement stirs within.";
      } else if (progress >= 33) {
        eggFlavor.textContent =
          "The egg shifts now and then, warmed by the chamber's steady light.";
      } else {
        eggFlavor.textContent =
          "The shell remains warm and still beneath the hatchery lanterns.";
      }
    }
  }

  if (eggList) {
    if (!storage.length) {
      eggList.innerHTML = `
        <div class="hatchery-empty">
          No eggs have been discovered yet.
        </div>
      `;
    } else {
      eggList.innerHTML = storage
        .map(
          (egg) => `
            <div class="hatchery-egg-row" data-egg-id="${egg.id}">
              <div class="hatchery-egg-thumb"></div>

              <div class="hatchery-egg-meta">
                <strong>${egg.egg_name || "Unknown Egg"}</strong>
                <span>${egg.source || "Discovery"} • Waiting in storage</span>
              </div>

              <button class="btn-sm hatchery-incubate-btn" data-egg-id="${
                egg.id
              }">
                Incubate
              </button>
            </div>
          `
        )
        .join("");
    }
  }
}

async function fetchDragonHistory(dragonId) {
  return await apiFetch(`/players/me/dragons/${dragonId}/history`);
}

function getChronicleIcon(eventCode) {
  const icons = {
    HATCHED: "🥚",
    NAMED: "✒️",
    GREW_JUVENILE: "🌱",
    GREW_ADULT: "🔥",
    GREW_ELDER: "👑",
    SPECIALIZATION_CHOSEN: "🧭",
    FRIENDSHIP_FORMED: "🤝",
    RIVALRY_FORMED: "⚔️",
    RIVALRY_RESOLVED: "🕊️",
    CRUSH_DEVELOPED: "💛",
    COURTSHIP_STARTED: "🌙",
    DEVOTED: "💞",
    BONDED_PAIR: "💍",
    CLOSE_FRIENDS: "🤝",
    LIFELONG_FRIENDS: "⭐"
  };

  return icons[eventCode] || "📜";
}

function formatChronicleDate(ts) {
  if (!ts) return "Unknown date";

  const date = new Date(Number(ts));
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatGrowthStage(stage) {
    if (!stage) return "—";

    switch (String(stage).toLowerCase()) {
      case "wyrmling":
        return "Wyrmling";
      case "juvenile":
        return "Juvenile";
      case "adult":
        return "Adult";
      case "elder":
        return "Elder";
      default:
        return stage;
    }
  }

function getChronicleDescription(entry, dragon) {
  const selfName = dragon?.name || "This dragon";

  const relatedId = Number(entry.related_player_dragon_id || 0);
  const related = relatedId ? STATE.dragons.byId[relatedId] : null;
  const otherName = related?.name || "another dragon";

  const eventCode = entry.event_code;

  const descriptions = {
    HATCHED: `${selfName} hatched beneath the warm lanterns of the Black Raven.`,
    NAMED: `${selfName} was given a new name.`,

    FRIENDSHIP_FORMED: `${selfName} became friends with ${otherName}.`,
    RIVALRY_FORMED: `Tensions rise as ${selfName} began a rivalry with ${otherName}.`,
    RIVALRY_RESOLVED: `${selfName} and ${otherName} put their rivalry behind them and settle a truce... for now.`,

    CRUSH_DEVELOPED: `After trial-and-error, ${selfName} developed a crush on ${otherName}.`,
    COURTSHIP_STARTED: `${selfName} and ${otherName} began courting.`,
    DEVOTED: `${selfName} and ${otherName} became devoted companions.`,
    BONDED_PAIR: `${selfName} formed a lifelong bond with ${otherName}.`,

    CLOSE_FRIENDS: `${selfName} and ${otherName} became close friends.`,
    LIFELONG_FRIENDS: `${selfName} and ${otherName} became lifelong companions.`,

    GREW_JUVENILE: `${selfName} matured into a Juvenile.`,
    GREW_ADULT: `${selfName} matured into an Adult.`,
    GREW_ELDER: `${selfName} reached the Elder stage.`,

    SPECIALIZATION_CHOSEN: `${selfName} chose a specialization.`
  };

  return descriptions[eventCode] || entry.description || "";
}

function initChronicleFilters() {
  const filters = document.getElementById("chronicleFilters");
  if (!filters) return;

  filters.querySelectorAll(".chronicle-filter").forEach((btn) => {
    btn.onclick = () => {
      currentChronicleFilter = btn.dataset.chronicleFilter || "all";

      filters
        .querySelectorAll(".chronicle-filter")
        .forEach((el) => el.classList.remove("active"));

      btn.classList.add("active");

      renderChronicleTimeline();
    };
  });
}

async function renderChronicleDragonHeader(dragonId) {
  const d = STATE.dragons.byId[dragonId];

  const header = document.getElementById("chronicleDragonHeader");
  const portrait = document.getElementById("chronicleDragonPortrait");
  const name = document.getElementById("chronicleDragonName");
  const meta = document.getElementById("chronicleDragonMeta");
  const timeline = document.getElementById("chronicleTimeline");

  if (!header || !portrait || !name || !meta || !timeline) return;

  if (!d) {
    header.style.display = "none";
    timeline.innerHTML = `<div class="chronicle-empty">No dragon selected.</div>`;
    return;
  }

  header.style.display = "flex";
  portrait.style.backgroundImage = `url('${d.img}')`;
  name.textContent = d.name;
  meta.textContent = `${d.species} • ${d.element} • ${formatGrowthStage(d.growthStage)}`;

  timeline.innerHTML = `<div class="chronicle-empty">Loading chronicle...</div>`;

  try {
    const payload = await fetchDragonHistory(dragonId);
    const history = payload.history || [];

    if (!history.length) {
      timeline.innerHTML = `
        <div class="chronicle-empty">
          No chronicle entries have been recorded for this dragon yet.
        </div>
      `;
      return;
    }

    currentChronicleDragonId = dragonId;
    currentChronicleHistory = history;
    renderChronicleTimeline();
  } catch (err) {
    console.error("fetchDragonHistory failed", err);
    timeline.innerHTML = `
      <div class="chronicle-empty">
        Could not load this dragon's chronicle.
      </div>
    `;
  }
}

let currentChronicleDragonId = null;
let currentChronicleHistory = [];
let currentChronicleFilter = "all";

function getChronicleCategory(eventCode) {
  const life = ["HATCHED", "NAMED"];
  const growth = ["GREW_JUVENILE", "GREW_ADULT", "GREW_ELDER"];
  const relationships = [
    "FRIENDSHIP_FORMED",
    "CRUSH_DEVELOPED",
    "COURTSHIP_STARTED",
    "DEVOTED",
    "BONDED_PAIR",
    "CLOSE_FRIENDS",
    "LIFELONG_FRIENDS"
  ];
  const rivalries = ["RIVALRY_FORMED", "RIVALRY_RESOLVED"];
  const specialization = ["SPECIALIZATION_CHOSEN"];

  if (life.includes(eventCode)) return "life";
  if (growth.includes(eventCode)) return "growth";
  if (relationships.includes(eventCode)) return "relationships";
  if (rivalries.includes(eventCode)) return "rivalries";
  if (specialization.includes(eventCode)) return "specialization";

  return "other";
}

function renderChronicleTimeline() {
  const timeline = document.getElementById("chronicleTimeline");
  const d = STATE.dragons.byId[currentChronicleDragonId];

  if (!timeline || !d) return;

  const filtered =
    currentChronicleFilter === "all"
      ? currentChronicleHistory
      : currentChronicleHistory.filter(
          (entry) =>
            getChronicleCategory(entry.event_code) === currentChronicleFilter
        );

  if (!filtered.length) {
    timeline.innerHTML = `
      <div class="chronicle-empty">
        No chronicle entries match this filter.
      </div>
    `;
    return;
  }

  timeline.innerHTML = filtered
    .map((entry) => {
      const category = getChronicleCategory(entry.event_code);

      return `
        <div class="chronicle-entry chronicle-entry-${category}">
          <div class="chronicle-icon">${getChronicleIcon(entry.event_code)}</div>

          <div>
            <div class="chronicle-title">${entry.title || "Chronicle Entry"}</div>
            <div class="chronicle-date">${formatChronicleDate(entry.created_at)}</div>
            <div class="chronicle-description">
              ${getChronicleDescription(entry, d)}
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderChronicleDragonSelect() {
  const listEl = document.getElementById("chronicleDragonList");
  if (!listEl) return;

  const dragons = Object.values(STATE.dragons.byId || {}).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (!dragons.length) {
    listEl.innerHTML = `
      <div class="chronicle-empty">
        No dragons are currently in your roost.
      </div>
    `;
    return;
  }

  const selectedId = Number(listEl.dataset.selectedDragonId || 0);

  listEl.innerHTML = dragons
    .map((d) => {
      const genderSymbol =
        d.gender === "Male" ? "♂" :
        d.gender === "Female" ? "♀" : "";

      const isSelected = Number(d.id) === selectedId;

      return `
        <button
          type="button"
          class="chronicle-dragon-card ${isSelected ? "active" : ""}"
          data-dragon-id="${d.id}"
        >
          <div
            class="chronicle-dragon-thumb"
            style="background-image:url('${d.img || ""}')"
          ></div>

          <div class="chronicle-dragon-info">
            <div class="chronicle-picker-name">
              ${d.name}
              ${genderSymbol ? `<span class="dragon-gender-symbol">${genderSymbol}</span>` : ""}
            </div>

            <div class="chronicle-picker-meta">
              ${d.species} • ${formatGrowthStage(d.growthStage)}
            </div>
          </div>
        </button>
      `;
    })
    .join("");

  listEl.querySelectorAll(".chronicle-dragon-card").forEach((card) => {
    card.onclick = () => {
      const id = Number(card.dataset.dragonId);

      listEl.dataset.selectedDragonId = String(id);

      listEl
        .querySelectorAll(".chronicle-dragon-card")
        .forEach((el) => el.classList.remove("active"));

      card.classList.add("active");

      renderChronicleDragonHeader(id);
    };
  });
}

function initHatcheryTabs() {
  const tabRoost = document.getElementById("roostTabRoost");
  const tabHatchery = document.getElementById("roostTabHatchery");
  const tabChronicles = document.getElementById("roostTabChronicles");

  const roostView = document.getElementById("roostView");
  const hatcheryView = document.getElementById("hatcheryView");
  const chroniclesView = document.getElementById("chroniclesView");

  if (!tabRoost || !tabHatchery || !tabChronicles || !roostView || !hatcheryView || !chroniclesView) return;

  function setRoostTab(tab) {
    tabRoost.classList.toggle("active", tab === "roost");
    tabHatchery.classList.toggle("active", tab === "hatchery");
    tabChronicles.classList.toggle("active", tab === "chronicles");

    roostView.classList.toggle("active", tab === "roost");
    hatcheryView.classList.toggle("active", tab === "hatchery");
    chroniclesView.classList.toggle("active", tab === "chronicles");

    if (tab === "chronicles") {
      renderChronicleDragonSelect();
      initChronicleFilters();
    }
  }

  tabRoost.onclick = () => setRoostTab("roost");
  tabHatchery.onclick = () => setRoostTab("hatchery");
  tabChronicles.onclick = () => setRoostTab("chronicles");
}

function initHatchery() {
  if (hatcheryMounted) {
    fetchHatcheryState();
    return;
  }

  hatcheryMounted = true;

  initHatcheryTabs();
  fetchHatcheryState();

  const hatchBtn = document.getElementById("hatchEggBtn");

  if (hatchBtn) {
    hatchBtn.onclick = hatchActiveEgg;
  }
}

function initRoost() {
  if (roostMounted) {
    HUB.renderActive?.();
    HUB.renderCollection?.();
    startDragonIdleRotation();
  }
  roostMounted = true;
  const root = $("#roostRoot"),
    diorama = root;
  if (!root) return;
  initHatchery();

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
  const kvSpecies = $("#kvSpecies"),
    kvType = $("#kvType"),
    kvTrait = $("#kvTrait"),
    kvPersonality = $("#kvPersonality"),
    kvSpecialization = $("#kvSpecialization"),
    kvGrowthStage = $("#kvGrowthStage");
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

  const actionPreview = $("#dragonActionPreview");
  const growthPanel = $("#growthPanel");
  const btnGrowDragon = $("#btnGrowDragon");
  const growthText = growthPanel
    ? growthPanel.querySelector(".growth-text")
    : null;

  const ACTION_PREVIEWS = {
    feed: {
      title: "Feed Dragon",
      desc: "Offer food to ease hunger and lift your dragon's spirits.",
      mood: [
        "Mood greatly improves.",
        "Mood improves.",
        "Mood improves slightly.",
        "Mood improves a little.",
        "Mood barely improves."
      ],
      hunger: [
        "Hunger greatly decreases.",
        "Hunger decreases.",
        "Hunger decreases moderately.",
        "Hunger decreases slightly.",
        "Hunger decreases a little."
      ]
    },
    play: {
      title: "Play With Dragon",
      desc: "Spend time playing together and keeping your dragon cheerful.",
      mood: [
        "Mood greatly improves.",
        "Mood improves.",
        "Mood improves moderately.",
        "Mood improves slightly.",
        "Mood improves a little."
      ]
    },
    groom: {
      title: "Groom Dragon",
      desc: "Clean scales, claws, wings, and wounds from the day's wear.",
      mood: [
        "Mood greatly improves.",
        "Mood improves.",
        "Mood improves moderately.",
        "Mood improves slightly.",
        "Mood improves a little."
      ]
    },
    train: {
      title: "Train Dragon",
      desc: "Practice discipline and commands.",
      mood: [
        "Mood slightly drops.",
        "Mood drops.",
        "Mood drops moderately.",
        "Mood drops sharply.",
        "Mood drops heavily."
      ],
      hunger: [
        "Hunger slightly increases.",
        "Hunger increases.",
        "Hunger increases moderately.",
        "Hunger increases sharply.",
        "Hunger increases heavily."
      ]
    },
    rest: {
      title: "Rest Dragon",
      desc:
        "Send your dragon to rest and recover. Resting removes them from active duty for a while."
    }
  };

  function showDragonActionPreview(actionKey) {
    if (!actionPreview) return;

    const d = active();
    const info = ACTION_PREVIEWS[actionKey];

    if (!d || !info) {
      actionPreview.textContent = "Select an active dragon to preview actions.";
      return;
    }

    const stamina = getStamina(d);
    const streaks = d.action_streaks || {};
    const tier = Math.max(0, Math.min(4, Number(streaks[actionKey] || 0)));

    const lines = [];

    lines.push(`<strong>${info.title}</strong>`);
    lines.push(info.desc);

    if (info.mood) lines.push(info.mood[tier]);
    if (info.hunger) lines.push(info.hunger[tier]);

    if (actionKey !== "rest") {
      lines.push(
        `Uses 1 Stamina. Current stamina: ${stamina.cur}/${stamina.max}.`
      );
    }

    if (tier >= 2 && actionKey !== "rest") {
      lines.push(
        `<span class="preview-note">Repeating this action is becoming less effective.</span>`
      );
    }

    actionPreview.innerHTML = lines.join("<br>");
  }

  function clearDragonActionPreview() {
    if (!actionPreview) return;
    actionPreview.textContent =
      "Hover over a dragon action to see what it may do.";
  }

  [
    ["feed", "#actFeed", "#btnFeed"],
    ["play", "#actPlay", "#btnPlay"],
    ["groom", "#actGroom", "#btnGroom"],
    ["train", "#actTrain", "#btnTrain"],
    ["rest", "#actRest", "#btnRest"]
  ].forEach(([key, ringSel, mirrorSel]) => {
    [$(ringSel), $(mirrorSel)].forEach((btn) => {
      if (!btn) return;

      btn.addEventListener("mouseenter", () => showDragonActionPreview(key));
      btn.addEventListener("focus", () => showDragonActionPreview(key));
    });
  });

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
    let id = STATE.dragons.selectedId != null ? STATE.dragons.selectedId : null;
    if (id != null && !STATE.dragons.byId[id]) id = null;
    if (id == null) id = STATE.dragons.activeId;
    return id != null ? STATE.dragons.byId[id] : null;
  }
  // place ring buttons
  (function placeRing() {
    const radius = 150,
      center = 180;
    const map = [
      {
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
    map.forEach(({ el, ang }) => {
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

  function formatSpecEffect(effect) {
    if (!effect || typeof effect !== "object") return "";

    const labels = {
      bond_gain_pct: "Bond gain",
      dragon_crit_pct: "Dragon crit chance",
      dragon_damage_pct: "Dragon damage",
      dragon_defense_pct: "Dragon defense",
      dragon_hp_pct: "Dragon max HP",
      encounter_chance_pct: "Encounter chance",
      explore_success_pct: "Explore success",
      flee_success_pct: "Flee success",
      harvest_success_pct: "Harvest success",
      healing_effect_pct: "Healing effects",
      hunt_success_pct: "Hunt success",
      rest_bonus_pct: "Rest recovery",
      travel_progress_pct: "Travel progress",
      travel_risk_reduction_pct: "Travel risk reduction"
    };

    const parts = Object.entries(effect).map(([key, value]) => {
      const label = labels[key] || key;
      const sign = Number(value) > 0 ? "+" : "";
      return `${sign}${value}% ${label}`;
    });

    return parts.join(", ");
  }

  async function openSpecializationModal() {
    const a = active();
    if (!a) return toast("No dragon selected.");

    const modal = document.getElementById("specializationModal");
    const choicesEl = document.getElementById("specializationChoices");
    const btnCancel = document.getElementById("btnSpecCancel");

    if (!modal || !choicesEl || !btnCancel) {
      toast("Specialization modal missing.");
      return;
    }

    choicesEl.innerHTML = `<div class="growth-confirm-text">Loading paths...</div>`;
    modal.classList.add("show");

    btnCancel.onclick = () => {
      modal.classList.remove("show");
    };

    try {
      const payload = await apiFetch(
        `/players/me/dragons/${a.id}/specializations`
      );
      const specs = payload.specializations || [];

      choicesEl.innerHTML = specs
        .map(
          (s) => `
      <button class="spec-choice" data-spec-id="${s.id}">
        <strong>${s.name}</strong>
        <span>${s.description || ""}</span>
        <em>${formatSpecEffect(s.effect_json)}</em>
      </button>
    `
        )
        .join("");

      choicesEl.querySelectorAll(".spec-choice").forEach((btn) => {
        btn.onclick = async () => {
          const specId = Number(btn.dataset.specId);
          const spec = specs.find((s) => Number(s.id) === specId);
          const confirmed = await showSpecConfirmModal(spec);
          if (!confirmed) return;

          await chooseSpecialization(spec.id);
          modal.classList.remove("show");
        };
      });
    } catch (err) {
      console.error("openSpecializationModal failed", err);
      choicesEl.innerHTML = `<div class="growth-confirm-text">Could not load specializations.</div>`;
    }
  }

  function showSpecCeremony(payload) {
    const a = active();
    const spec = payload?.specialization;

    const ceremony = document.getElementById("specCeremony");
    const img = document.getElementById("specCeremonyDragon");
    const small = document.getElementById("specCeremonySmall");
    const title = document.getElementById("specCeremonyTitle");
    const text = document.getElementById("specCeremonyText");
    const btnContinue = document.getElementById("btnSpecContinue");

    if (!ceremony || !small || !title || !text || !btnContinue) {
      toast("Specialization ceremony missing.");
      return;
    }

    if (img && a?.img) {
      img.src = a.img;
      img.classList.remove("show", "flash", "growth-reveal");

      setTimeout(() => {
        img.classList.add("flash", "growth-reveal");

        setTimeout(() => {
          img.classList.add("show");
        }, 120);
      }, 120);
    }

    small.textContent = `${(
      a?.name || "Your dragon"
    ).toUpperCase()} HAS CHOSEN A PATH`;
    title.textContent = (spec?.name || "Specialization").toUpperCase();
    text.textContent =
      spec?.description || "A new purpose settles into your dragon’s heart.";

    title.classList.remove("show");
    text.classList.remove("show");
    btnContinue.style.display = "none";

    ceremony.classList.add("show");
    playSpecializationChooseSfx();

    setTimeout(() => {
      playSpecializationRevealSfx();
      title.classList.add("show");
    }, 1600);

    setTimeout(() => {
      text.classList.add("show");
      btnContinue.style.display = "inline-block";
    }, 2800);

    btnContinue.onclick = () => {
      ceremony.classList.remove("show");
      btnContinue.style.display = "none";
      title.classList.remove("show");
      text.classList.remove("show");
    };
  }

  async function chooseSpecialization(specId) {
    const a = active();
    if (!a) return;

    try {
      const payload = await apiFetch(`/players/me/dragons/${a.id}/specialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dragon_specializations_id: specId
        })
      });

      showSpecCeremony(payload);
      await refreshDragonsFromApiSafe();
    } catch (err) {
      console.error("chooseSpecialization failed", err);
      toast(
        extractApiPayloadMessage(err) || "Could not choose specialization."
      );
    }
  }
  const btnChooseSpecialization = $("#btnChooseSpecialization");

  if (btnChooseSpecialization) {
    btnChooseSpecialization.onclick = openSpecializationModal;
  }

  function showSpecConfirmModal(spec) {
    return new Promise((resolve) => {
      const modal = document.getElementById("specConfirmModal");
      const title = document.getElementById("specConfirmTitle");
      const text = document.getElementById("specConfirmText");
      const btnCancel = document.getElementById("btnSpecConfirmCancel");
      const btnChoose = document.getElementById("btnSpecConfirmChoose");

      if (!modal || !title || !text || !btnCancel || !btnChoose) {
        resolve(false);
        return;
      }

      title.textContent = `Choose ${spec.name}?`;
      text.textContent = `${
        spec.description || "This path will shape your dragon."
      } This choice is permanent.`;

      modal.classList.add("show");

      const cleanup = (result) => {
        modal.classList.remove("show");
        btnCancel.onclick = null;
        btnChoose.onclick = null;
        modal.onclick = null;
        resolve(result);
      };

      btnCancel.onclick = () => cleanup(false);
      btnChoose.onclick = () => cleanup(true);
      modal.onclick = (e) => {
        if (e.target === modal) cleanup(false);
      };
    });
  }

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
  HUB.renderActive = function () {
    const a = active();
    // ✅ EMPTY STATE: no active dragon selected
    if (!a) {
      // Cap still updates
      const cap = $("#roostCap");
      if (cap)
        cap.textContent = `Roost: ${
          Object.keys(STATE.dragons.byId).length
        } / 12`;
      // Clear portrait + labels
      if (portrait) portrait.style.backgroundImage = "";
      if (dName) dName.textContent = "No active dragon";
      if (chipEl) chipEl.textContent = "—";
      if (badgeR) badgeR.textContent = "—";
      if (badgeS) badgeS.textContent = "—";
      if (kvSpecies) kvSpecies.textContent = "—";
      if (kvType) kvType.textContent = "—";
      if (kvTrait) kvTrait.textContent = "—";
      if (kvPersonality) kvPersonality.textContent = "—";
      if (kvGrowthStage) kvGrowthStage.textContent = "—";
      if (kvSpecialization) kvSpecialization.textContent = "—";
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
      if (moodlets)
        moodlets.innerHTML = `<span class="mchip" style="opacity:.7">No active dragon selected</span>`;
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
      if (typeof applyActionButtonStates === "function")
        applyActionButtonStates();
      // Hide set-active button (no dragon to set active from the portrait)
      if (btnSetActive) btnSetActive.style.display = "none";
      updateDragonIdleText(null, true);
      return;
    }
    // --- Stamina line (JS-only, no HTML edits) ---
    (function renderStaminaLine() {
      const d = a;
      const { cur, max, resetAt } = getStamina(d);
      // choose an anchor that definitely exists; dName is in your code
      const anchor =
        typeof dName !== "undefined" && dName
          ? dName
          : document.querySelector("#activeName");
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
    if (btnSetActive)
      btnSetActive.style.display =
        isActive || isResting ? "none" : "inline-block";
    const cap = $("#roostCap");
    if (cap)
      cap.textContent = `Roost: ${Object.keys(STATE.dragons.byId).length} / 12`;
    if (portrait) portrait.style.backgroundImage = `url('${a.img}')`;
    if (dName) {
      const genderSymbol =
        a.gender === "Male" ? "♂" :
        a.gender === "Female" ? "♀" : "";
      dName.innerHTML = `
        ${a.name}
        ${genderSymbol ? `<span class="dragon-gender-symbol">${genderSymbol}</span>` : ""}
      `;
    }
    if (chipEl) chipEl.textContent = a.element;
    if (badgeR) badgeR.textContent = a.rarity;
    if (badgeS) badgeS.textContent = a.size;
    if (kvSpecies) kvSpecies.textContent = a.species;
    if (kvType) kvType.textContent = a.element;
    if (kvTrait) kvTrait.textContent = a.trait?.name || "—";
    if (kvPersonality) {
      const primary = a.personality?.primary?.name || "Unknown";
      const secondary = a.personality?.secondary?.name || "";

      kvPersonality.textContent = secondary
        ? `${primary} / ${secondary}`
        : primary;
    }
    if (kvGrowthStage) {
      const daysOld = Number(a.daysSinceObtained ?? 0);
      const ageName = formatGrowthStage(a.growthStage);
      kvGrowthStage.textContent =
        daysOld === 1
          ? `${ageName} — 1 day old`
          : `${ageName} — ${daysOld} days old`;
    }
    if (growthPanel) {
      growthPanel.style.display = a.canGrow ? "flex" : "none";
      growthPanel.classList.toggle("ready", !!a.canGrow);
    }
    const specializationPanel = $("#specializationPanel");

    if (specializationPanel) {
      const canSpecialize =
        (a.growthStage === "adult" || a.growthStage === "elder") &&
        !a.dragonSpecializationsId;

      specializationPanel.style.display = canSpecialize ? "flex" : "none";
    }
    if (kvSpecialization) {
      const specBlock = kvSpecialization.closest(".kvblock");

      if (a.specialization?.name) {
        kvSpecialization.textContent = a.specialization.name;
        if (specBlock) specBlock.style.display = "";
      } else {
        kvSpecialization.textContent = "";
        if (specBlock) specBlock.style.display = "none";
      }
    }
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
      a.element === b.element
        ? a.name.localeCompare(b.name)
        : a.element.localeCompare(b.element);
    const bond = (a, b) => 0;
    const name = (a, b) => a.name.localeCompare(b.name);
    return (
      {
        recent,
        hp,
        happy,
        element: el,
        bond,
        name
      }[key] || name
    );
  }
  HUB.renderCollection = function () {
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
        const genderSymbol =
          dr.gender === "Male" ? "♂" :
          dr.gender === "Female" ? "♀" : "";
        name.innerHTML = `
          <strong>${dr.name}</strong>
          ${genderSymbol ? `<span class="dragon-gender-symbol">${genderSymbol}</span>` : ""}
          ${
            dr.id === STATE.dragons.activeId
              ? '<span class="mark">⚓ Active</span>'
              : ""
          }
        `;
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
            dr.gender === "Male"
              ? '<span class="dragon-gender-symbol">♂</span>'
              : dr.gender === "Female"
              ? '<span class="dragon-gender-symbol">♀</span>'
              : ""
          }
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
      const { cur, max, resetAt } = getStamina(dr);
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
      badge.textContent = cur <= 0 && resetAt ? `0/${max} ⏳` : `${cur}/${max}`;
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
      fbtn.textContent = STATE.favorites.has(dr.id)
        ? "★ Unfavorite"
        : "☆ Favorite";
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
    updateDragonIdleText(STATE.dragons.byId[id], true);
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
      const payload = await apiFetch(`/players/me/dragons/${id}/favorite`, {
        method: "POST"
      });
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
    if (!d) return false;
    // don’t even hit the API if they’re full
    if (d.hunger <= 0) {
      toast(`${d.name} isn’t hungry right now.`);
      return false;
    }
    const isFood =
      it.category === "Consumable" &&
      it.subcategory === "Dragon Food";
    if (!isFood) {
      toast("That isn't dragon food.");
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
      setTemporaryDragonReaction(
        getDragonActionReaction(
          "feed",
          d,
          "{name} eagerly snaps up the offered food."
        )
      );
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
    let apNow = Number.isFinite(Number(d?.action_points_current))
      ? Number(d.action_points_current)
      : apMax;
    const apResetAt =
      d?.action_points_reset_at != null
        ? parseInt(d.action_points_reset_at, 10)
        : null;
    if (apResetAt != null && apResetAt <= Date.now()) apNow = apMax;
    const outOfStamina = apNow < 1;
    const isResting = d && Number(d.rest_until_at || 0) > Date.now();
    const staminaReason = outOfStamina
      ? "This dragon is exhausted (Stamina 0/5)."
      : "";
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
      const p = typeof cdPct === "function" ? cdPct(key) || 0 : 0;
      const onCooldown = p > 0;
      const locked = !!locks[key];
      // --- NEW: final disabled rules ---
      const restBlocksThis = key !== "rest" && isResting;
      const staminaBlocksThis = key !== "rest" && outOfStamina;
      const disabled =
        locked || onCooldown || restBlocksThis || staminaBlocksThis;
      // choose best tooltip reason
      const title = locked
        ? locks.reason || "Unavailable."
        : restBlocksThis
        ? "Dragon is resting."
        : staminaBlocksThis
        ? staminaReason
        : "";
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
    const msg = err && err.message ? err.message : "";
    const i = msg.indexOf("{");
    if (i === -1) return "";
    try {
      const obj = JSON.parse(msg.slice(i));
      return (
        obj?.payload?.message ||
        obj?.payload ||
        obj?.error ||
        obj?.message ||
        ""
      );
    } catch (_) {
      return "";
    }
  }
  function showGrowthConfirmModal(dragon) {
    return new Promise((resolve) => {
      const modal = document.getElementById("growthConfirmModal");
      const btnCancel = document.getElementById("btnGrowthCancel");
      const btnConfirm = document.getElementById("btnGrowthConfirm");

      if (!modal || !btnCancel || !btnConfirm) {
        resolve(false);
        return;
      }

      modal.classList.add("show");

      const cleanup = (result) => {
        modal.classList.remove("show");

        btnCancel.onclick = null;
        btnConfirm.onclick = null;
        modal.onclick = null;

        resolve(result);
      };

      btnCancel.onclick = () => cleanup(false);
      btnConfirm.onclick = () => cleanup(true);

      modal.onclick = (e) => {
        if (e.target === modal) cleanup(false);
      };
    });
  }
  async function growActiveDragon() {
    const a = active();

    if (!a) {
      toast("No dragon selected.");
      return;
    }

    if (!a.canGrow) {
      toast("This dragon is not ready to grow yet.");
      return;
    }

    const confirmed = await showGrowthConfirmModal(a);
    if (!confirmed) return;

    const ceremony = document.getElementById("growthCeremony");
    const small = document.getElementById("growthCeremonySmall");
    const title = document.getElementById("growthCeremonyTitle");
    const text = document.getElementById("growthCeremonyText");
    const btnContinue = document.getElementById("btnGrowthContinue");

    if (!ceremony || !small || !title || !text || !btnContinue) {
      toast("Growth ceremony missing.");
      return;
    }

    btnContinue.style.display = "none";
    title.classList.remove("show");
    text.classList.remove("show");

    small.textContent = "Your dragon is changing...";
    title.textContent = "";
    text.textContent = "Something ancient stirs within your dragon.";

    ceremony.classList.add("show");
    playGrowthBuildupSfx();
    swapGrowthCeremonyImage(a, a.growthStage);
    const growthImg = document.getElementById("growthCeremonyDragon");

    setTimeout(() => {
      growthImg?.classList.add("growth-awakening");
    }, 350);

    setTimeout(() => {
      text.classList.add("show");
    }, 800);

    setTimeout(() => {
      text.classList.remove("show");

      setTimeout(() => {
        text.textContent = `${a.name} rises, trembling with new strength.`;
        text.classList.add("show");
      }, 500);
    }, 2600);

    let payload = null;

    setTimeout(async () => {
      try {
        payload = await apiFetch(`/players/me/dragons/${a.id}/grow`, {
          method: "POST"
        });

        const after = formatGrowthStage(
          payload.growth_stage_after ||
            payload.growth_stage ||
            a.nextGrowthStage
        );

        const afterRaw =
          payload.growth_stage_after ||
          payload.growth_stage ||
          a.nextGrowthStage;

        growthImg?.classList.remove("growth-awakening");
        growthImg?.classList.add("growth-transforming");
        setTimeout(() => {
          swapGrowthCeremonyImage(a, afterRaw);
        }, 450);

        stopGrowthBuildupSfx();
        playGrowthRevealSfx();
        title.textContent = after;
        title.classList.add("show");

        text.classList.remove("show");

        setTimeout(() => {
          text.textContent = `${a.name} has matured into a ${after}.`;
          text.classList.add("show");
          btnContinue.style.display = "inline-block";

          growthImg?.classList.remove("growth-transforming");
          growthImg?.classList.add("growth-reveal");
        }, 500);

        await refreshDragonsFromApiSafe();
      } catch (err) {
        console.error("growActiveDragon failed", err);
        const serverMsg = extractApiPayloadMessage(err);

        text.classList.remove("show");

        setTimeout(() => {
          stopGrowthBuildupSfx();
          title.textContent = "Growth Failed";
          title.classList.add("show");
          text.textContent = serverMsg || "Growth failed. Try again.";
          text.classList.add("show");
          btnContinue.style.display = "inline-block";
        }, 500);
      }
    }, 7200);

    btnContinue.onclick = () => {
      const growthImg = document.getElementById("growthCeremonyDragon");
      growthImg?.classList.remove(
        "show",
        "flash",
        "growth-awakening",
        "growth-transforming",
        "growth-reveal"
      );
      ceremony.classList.remove("show");
      btnContinue.style.display = "none";
      title.classList.remove("show");
      text.classList.remove("show");
    };
  }
  async function openDragonFoodModal() {
  const d = active();

  if (!d) return toast("No dragon selected.");
  if (d.hunger <= 0) return toast(`${d.name} isn't hungry right now.`);

  const modal = document.getElementById("dragonFoodModal");
  const list = document.getElementById("dragonFoodList");
  const cancel = document.getElementById("btnDragonFoodCancel");

  if (!modal || !list || !cancel) {
    toast("Dragon food picker missing.");
    return;
  }

  list.innerHTML = `<div class="dragon-food-empty">Loading dragon food...</div>`;
  modal.classList.add("show");

  cancel.onclick = () => {
    modal.classList.remove("show");
  };

  try {
    const payload = await apiFetch("/players/me/dragon-food");
    const foods = payload.items || [];

    if (!foods.length) {
      list.innerHTML = `
        <div class="dragon-food-empty">
          You have no dragon food available.
        </div>
      `;
      return;
    }

    list.innerHTML = foods
      .map((food) => {
        const feed = food.effect_json?.on_feed_dragon || {};
        const hungerReduce = feed.hunger_reduce ?? 25;
        const moodBonus = feed.mood_bonus ?? 0;
        const img = food.img_url
          ? `style="background-image:url('${food.img_url}')"`
          : "";

        return `
          <div class="dragon-food-item">
            <div class="dragon-food-thumb" ${img}></div>

            <div class="dragon-food-info">
              <strong>${food.name}</strong>
              <div class="dragon-food-meta">
                ${food.rarity || "Common"} • Qty: ${food.qty}
              </div>
              <div class="dragon-food-effects">
                Hunger -${hungerReduce} • Mood +${moodBonus}
              </div>
            </div>

            <button
              class="btn-sm dragon-food-feed-btn"
              data-item-id="${food.items_id}"
            >
              Feed
            </button>
          </div>
        `;
      })
      .join("");

    list.querySelectorAll(".dragon-food-feed-btn").forEach((btn) => {
      btn.onclick = async () => {
        const itemId = Number(btn.dataset.itemId);
        btn.disabled = true;

        const ok = await feedItemToDragon(d.id, itemId);

        if (ok) {
          modal.classList.remove("show");
          setCD("feed", CDdur.feed);
        } else {
          btn.disabled = false;
        }
      };
    });
  } catch (err) {
    console.error("openDragonFoodModal failed", err);
    list.innerHTML = `
      <div class="dragon-food-empty">
        Could not load dragon food.
      </div>
    `;
  }
}
  async function actFeed() {
  if (cdPct("feed") > 0) return;

  const d = active();
  if (!d) return toast("No active dragon.");

  const locks = getDragonLocks(d);
  if (locks.feed) {
    toast(locks.reason || "Can't feed right now.");
    return;
  }

  await openDragonFoodModal();
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
      setTemporaryDragonReaction(
        getDragonActionReaction(
          "play",
          d,
          "{name} perks up, clearly enjoying the attention."
        )
      );
    } catch (err) {
      const serverMsg = extractApiPayloadMessage(err);
      // If it's the expected stamina gate, don't console.error
      if (/out of action points/i.test(serverMsg)) {
        toast(serverMsg);
        // force UI into correct locked state
        refreshDragonsFromApiSafe();
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
      setTemporaryDragonReaction(
        getDragonActionReaction(
          "groom",
          d,
          "{name} relaxes as you tend to them."
        )
      );
    } catch (err) {
      const serverMsg = extractApiPayloadMessage(err);
      // If it's the expected stamina gate, don't console.error
      if (/out of action points/i.test(serverMsg)) {
        toast(serverMsg);
        // force UI into correct locked state
        refreshDragonsFromApiSafe();
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
      setTemporaryDragonReaction(
        getDragonActionReaction(
          "train",
          local,
          "{name} steadies themselves after training."
        )
      );
    } catch (err) {
      const serverMsg = extractApiPayloadMessage(err);
      // If it's the expected stamina gate, don't console.error
      if (/out of action points/i.test(serverMsg)) {
        toast(serverMsg);
        // force UI into correct locked state
        refreshDragonsFromApiSafe();
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
  if (btnGrowDragon) btnGrowDragon.onclick = growActiveDragon;
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
  startDragonIdleRotation();
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
      speak(
        {
          map:
            "Chart yer course with purpose — driftin’s for jellyfish and fools.",
          cargo: "Mind yer stores. Kingdoms fall for lack of grain, not steel.",
          roost: "Treat a dragon as kin, not a weapon.",
          quarters: "Rest now; steel later."
        }[key] || "What’s the agenda today?"
      );
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
        gender: raw.gender || existing.gender || null,
        element: raw.element || existing.element || "Neutral",
        species: speciesObj.name || existing.species || "Dragon",
        favoriteActivity:
          raw.favorite_activity || existing.favoriteActivity || null,
        personality: raw.personality || speciesObj.personality || null,
        growthStage: raw.growth_stage || existing.growthStage || "wyrmling",
        canGrow: !!raw.can_grow,
        growthBlockReason: raw.growth_block_reason || null,
        nextGrowthStage: raw.next_growth_stage || null,
        specialization: raw.hasOwnProperty("specialization")
          ? raw.specialization
          : existing.specialization || null,

        dragonSpecializationsId: raw.hasOwnProperty("dragon_specializations_id")
          ? raw.dragon_specializations_id
          : existing.dragonSpecializationsId || null,

        specializationChosenAt: raw.hasOwnProperty("specialization_chosen_at")
          ? raw.specialization_chosen_at
          : existing.specializationChosenAt || null,
        requiredDays: raw.required_days ?? 0,
        requiredBond: raw.required_bond ?? 0,
        daysSinceObtained: raw.days_since_obtained ?? 0,
        img: raw.img_url || existing.img || "",
        rarity: speciesObj.rarity || existing.rarity || "Common",
        size: existing.size || "Small",
        trait: raw.trait || existing.trait || null,
        level: raw.level ?? existing.level ?? 1,
        hp: raw.hp ?? raw.hp_current ?? existing.hp ?? raw.hp_max ?? 1,
        hpMax: raw.hp_max ?? existing.hpMax ?? raw.hp ?? raw.hp_current ?? 1,
        mood: raw.mood ?? existing.mood ?? 60,
        hunger: raw.hunger ?? existing.hunger ?? 40,
        bond: raw.bond ?? existing.bond ?? 0,
        relationships: raw.relationships || existing.relationships || [],
        rest_until_at:
          raw.rest_until_at != null
            ? parseInt(raw.rest_until_at, 10)
            : existing.rest_until_at ?? null,
        action_points_current:
          raw.action_points_current != null
            ? parseInt(raw.action_points_current, 10)
            : existing.action_points_current ?? 5,
        action_points_reset_at:
          raw.action_points_reset_at != null
            ? parseInt(raw.action_points_reset_at, 10)
            : existing.action_points_reset_at ?? null,
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
      newActive =
        typeof roostPayload.active_id === "object"
          ? roostPayload.active_id.id
          : roostPayload.active_id;
    }
    newActive = newActive != null ? Number(newActive) : null;
    // If server explicitly gives an active dragon and we have it, use it.
    if (newActive != null && STATE.dragons.byId[newActive]) {
      STATE.dragons.activeId = newActive;
    }
    // If server gives null/undefined active_id, DO NOT pick a random one.
    // Keep whatever the user has selected for preview, otherwise allow it to be null.
    if (newActive == null) {
      if (
        STATE.dragons.activeId != null &&
        !STATE.dragons.byId[STATE.dragons.activeId]
      ) {
        STATE.dragons.activeId = null;
      }
    }
    if (
      STATE.dragons.selectedId != null &&
      !STATE.dragons.byId[STATE.dragons.selectedId]
    ) {
      STATE.dragons.selectedId = null;
    }
    if (typeof HUB.renderActive === "function") HUB.renderActive();
    if (typeof HUB.renderCollection === "function") HUB.renderCollection();
    if (typeof applyActionButtonStates === "function")
      applyActionButtonStates();
  } catch (err) {
    console.error("refreshDragonsFromApi failed", err);
  }
}
/* ================= Kick off API load ================= */
loadPlayerHubData();
window.addEventListener("focus", () => refreshHubLiveDataSafe());
window.addEventListener("pageshow", () => refreshHubLiveDataSafe());

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshHubLiveDataSafe();
});
