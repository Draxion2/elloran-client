console.log("dungeon.js V-09/18/26 dungeon-page-5");

(() => {
 /* =========================================================
     CONFIG
  ========================================================= */
 const API_BASE = "https://xqgu-nq5e-7wvz.n7e.xano.io/api:thFaVU7E";
 const AUTH_KEY = "elloran.authToken";
 const TITLE_URL = "https://draxtesting.forumotion.com/h1-title-page";
 const HUB_URL = "https://draxtesting.forumotion.com/h8-player-hub";
 const ARENA_URL = "https://draxtesting.forumotion.com/h7-battle-arena-modal";
 const AUDIO_BASE_URL =
  "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/";
 /* =========================================================
   DUNGEON AUDIO
========================================================= */

let dungeonAmbience = null;
let dungeonDescentSfx = null;
let dungeonCampSfx = null;
let dungeonAmbientSfx = [];
let dungeonAmbientSfxTimer = null;
let dungeonAudioProfile = null;
let dungeonAudioActive = false;

function getDungeonAudioUrl(path) {
 if (!path) {
  return null;
 }

 if (/^https?:\/\//i.test(path)) {
  return path;
 }

 return AUDIO_BASE_URL + String(path).replace(/^\/+/, "");
}

function configureDungeonAudio(profile) {
 stopDungeonAmbientSfx();

 if (dungeonAmbience) {
  clearInterval(dungeonAmbience._fadeTimer);
  dungeonAmbience.pause();
  dungeonAmbience.currentTime = 0;
 }

 dungeonAmbience = null;
 dungeonDescentSfx = null;
 dungeonCampSfx = null;
 dungeonAmbientSfx = [];
 dungeonAudioProfile = profile || null;
 dungeonAudioActive = false;

 if (!profile) {
  return;
 }

 const backgroundUrl = getDungeonAudioUrl(
  profile.background_audio_url
 );

 if (backgroundUrl) {
  dungeonAmbience = new Audio(backgroundUrl);
  dungeonAmbience.loop = true;
  dungeonAmbience.volume = 0;
  dungeonAmbience.preload = "auto";
 }

 const descentUrl = getDungeonAudioUrl(
  profile.descent_sfx_url
 );

 if (descentUrl) {
  dungeonDescentSfx = new Audio(descentUrl);
  dungeonDescentSfx.preload = "auto";
 }

 const campUrl = getDungeonAudioUrl(
  profile.camp_sfx_url
 );

 if (campUrl) {
  dungeonCampSfx = new Audio(campUrl);
  dungeonCampSfx.preload = "auto";
 }

 const ambientFiles = Array.isArray(profile.ambient_sfx_json)
  ? profile.ambient_sfx_json
  : [];

 dungeonAmbientSfx = ambientFiles
  .map((file) => {
   const url = getDungeonAudioUrl(file);

   if (!url) {
    return null;
   }

   const audio = new Audio(url);

   audio.volume = clamp(
    profile.ambient_volume ?? 0.18,
    0,
    1
   );

   audio.preload = "auto";

   return audio;
  })
  .filter(Boolean);
}

function fadeDungeonAudioIn(audio, targetVolume = 0.35) {
 if (!audio) {
  return;
 }

 audio.volume = 0;

 audio.play().catch(() => {
  console.warn(
   "Dungeon ambience was blocked until user interaction."
  );
 });

 clearInterval(audio._fadeTimer);

 audio._fadeTimer = setInterval(() => {
  audio.volume = Math.min(
   targetVolume,
   audio.volume + 0.03
  );

  if (audio.volume >= targetVolume) {
   clearInterval(audio._fadeTimer);
  }
 }, 80);
}

function startDungeonAmbience() {
 if (dungeonAudioActive || !dungeonAmbience) {
  return;
 }

 dungeonAudioActive = true;

 const targetVolume = clamp(
  dungeonAudioProfile?.background_volume ?? 0.35,
  0,
  1
 );

 fadeDungeonAudioIn(
  dungeonAmbience,
  targetVolume
 );

 unlockDungeonAmbientSfx();

 startDungeonAmbientSfx();
}

function stopDungeonAudio() {
 dungeonAudioActive = false;

 stopDungeonAmbientSfx();

 if (!dungeonAmbience) {
  return;
 }

 clearInterval(dungeonAmbience._fadeTimer);

 dungeonAmbience.pause();
 dungeonAmbience.currentTime = 0;
 dungeonAmbience.volume = 0;
}

 function unlockDungeonAmbientSfx() {
 dungeonAmbientSfx.forEach((audio) => {
  const originalVolume = audio.volume;

  audio.volume = 0;

  const playPromise = audio.play();

  if (playPromise) {
   playPromise
    .then(() => {
     audio.pause();
     audio.currentTime = 0;
     audio.volume = originalVolume;
    })
    .catch(() => {
     audio.volume = originalVolume;
    });
  }
 });
}

function startDungeonAmbientSfx() {
 stopDungeonAmbientSfx();

 if (!dungeonAudioActive) {
  return;
 }

 scheduleNextDungeonAmbientSfx();
}

function stopDungeonAmbientSfx() {
 if (dungeonAmbientSfxTimer) {
  clearTimeout(dungeonAmbientSfxTimer);
  dungeonAmbientSfxTimer = null;
 }
}

function scheduleNextDungeonAmbientSfx() {
 if (
  !dungeonAudioActive ||
  !dungeonAmbientSfx.length
 ) {
  return;
 }

 const minDelay = Number(
  dungeonAudioProfile?.ambient_delay_min ?? 6500
 );

 const maxDelay = Number(
  dungeonAudioProfile?.ambient_delay_max ?? 16000
 );

 const delay = randomBetween(
  Math.min(minDelay, maxDelay),
  Math.max(minDelay, maxDelay)
 );

 dungeonAmbientSfxTimer = setTimeout(() => {
  if (!dungeonAudioActive) {
   return;
  }

  playRandomDungeonAmbientSfx();
  scheduleNextDungeonAmbientSfx();
 }, delay);
}

function playRandomDungeonAmbientSfx() {
 if (
  !dungeonAudioActive ||
  !dungeonAmbientSfx.length
 ) {
  return;
 }

 const sound =
  dungeonAmbientSfx[
   Math.floor(
    Math.random() * dungeonAmbientSfx.length
   )
  ];

 sound.pause();
 sound.currentTime = 0;

 sound.volume = clamp(
  dungeonAudioProfile?.ambient_volume ?? 0.18,
  0,
  1
 );

 sound.play().catch((error) => {
  console.warn(
   "Dungeon ambient SFX could not play:",
   error
  );
 });
}

 function playDungeonDescentSfx() {
 if (!dungeonDescentSfx) {
  return;
 }

 dungeonDescentSfx.pause();
 dungeonDescentSfx.currentTime = 0;

 dungeonDescentSfx.play().catch(() => {
  console.warn(
   "Dungeon descent SFX could not play."
  );
 });
}

 function playDungeonCampSfx() {
 if (!dungeonCampSfx) {
  return;
 }

 dungeonCampSfx.pause();
 dungeonCampSfx.currentTime = 0;

 dungeonCampSfx.play().catch(() => {
  console.warn(
   "Dungeon camp SFX could not play."
  );
 });
}
 async function playDungeonCampTransition() {
 if (!els.campTransition) {
  playDungeonCampSfx();
  await wait(4000);
  return;
 }

 /*
  Reveal the full-screen camp
  overlay.
 */
 els.campTransition.setAttribute(
  "aria-hidden",
  "false"
 );

 els.campTransition.classList.add(
  "is-active"
 );

 /*
  Begin the campfire once the
  camping experience starts.
 */
 playDungeonCampSfx();

 /*
  Give the overlay time to fade
  fully into view, then allow the
  player to rest at the fire.
 */
 await wait(4000);

 /*
  Fade back into the dungeon.
 */
 els.campTransition.classList.remove(
  "is-active"
 );

 els.campTransition.setAttribute(
  "aria-hidden",
  "true"
 );

 /*
  Match the CSS 0.8 second
  fade-out before returning
  control to the player.
 */
 await wait(800);
}
 /* =========================================================
     STATE
  ========================================================= */
 const STATE = {
  busy: false,
  current: null,
  player: null,
  dragon: null,
  inventory: [],
  room: null,
  roomHistory: null,
  unsecuredLoot: [],
  targetRooms: null,
  lastResult: null,
  entranceActive: false,
  descendingActive: false,
  descendingToFloor: null,
  summaryActive: false,
  summaryData: null
 };
 /* =========================================================
     ELEMENTS
  ========================================================= */
 const els = {
  page: document.getElementById("dungeon-page"),
  dungeonName: document.getElementById("dungeon-name"),
  dungeonDescription: document.getElementById("dungeon-description"),
  floorLabel: document.getElementById("dungeon-floor-label"),
  floorProgress: document.getElementById("dungeon-floor-progress"),
  /* Party */
  playerImage: document.getElementById("dungeon-player-image"),
  playerName: document.getElementById("dungeon-player-name"),
  playerHpText: document.getElementById("dungeon-player-hp-text"),
  playerHpBar: document.getElementById("dungeon-player-hp-bar"),
  playerHpFloat: document.getElementById("dungeon-player-hp-float"),
  dragonHpFloat: document.getElementById("dungeon-dragon-hp-float"),
  dragonImage: document.getElementById("dungeon-dragon-image"),
  dragonName: document.getElementById("dungeon-dragon-name"),
  dragonHpText: document.getElementById("dungeon-dragon-hp-text"),
  dragonHpBar: document.getElementById("dungeon-dragon-hp-bar"),
  /* Room */
  roomPanel: document.querySelector(".dungeon-room-panel"),
  roomType: document.getElementById("dungeon-room-type"),
  roomNumber: document.getElementById("dungeon-room-number"),
  roomContext: document.getElementById("dungeon-room-context-text"),
  roomImageWrap: document.getElementById("dungeon-room-image-wrap"),
  roomImage: document.getElementById("dungeon-room-image"),
  roomName: document.getElementById("dungeon-room-name"),
  roomDescription: document.getElementById("dungeon-room-description"),
  roomResult: document.getElementById("dungeon-room-result"),
  roomResultEyebrow: document.getElementById("dungeon-room-result-eyebrow"),
  roomResultHeading: document.getElementById("dungeon-room-result-heading"),
  roomResultEffects: document.getElementById("dungeon-room-result-effects"),
  descentProgress: document.getElementById("dungeon-descent-progress"),

  descentProgressFill: document.getElementById("dungeon-descent-progress-fill"),
  lootResult: document.getElementById("dungeon-loot-result"),
  lootHeading: document.getElementById("dungeon-loot-heading"),
  lootList: document.getElementById("dungeon-loot-list"),
  hazardResult: document.getElementById("dungeon-hazard-result"),
  hazardHeading: document.getElementById("dungeon-hazard-heading"),
  hazardEffects: document.getElementById("dungeon-hazard-effects"),
  /* Actions */
  defaultActions: document.getElementById("dungeon-default-actions"),
  continueBtn: document.getElementById("dungeon-continue-btn"),
  choiceActions: document.getElementById("dungeon-choice-actions"),
  choiceButtons: document.getElementById("dungeon-choice-buttons"),
  puzzleActions: document.getElementById("dungeon-puzzle-actions"),
  puzzleButtons: document.getElementById("dungeon-puzzle-buttons"),
  puzzleGiveupBtn: document.getElementById("dungeon-puzzle-giveup-btn"),
  safeActions: document.getElementById("dungeon-safe-actions"),
  campBtn: document.getElementById("dungeon-camp-btn"),
  safeContinueBtn: document.getElementById("dungeon-safe-continue-btn"),
  floorActions: document.getElementById("dungeon-floor-actions"),
  floorCompleteText: document.getElementById("dungeon-floor-complete-text"),
  descendBtn: document.getElementById("dungeon-descend-btn"),
  /* Expedition Status */
  suppliesFloat: document.getElementById("dungeon-supplies-float"),
  exhaustionFloat: document.getElementById("dungeon-exhaustion-float"),
  riskFloat: document.getElementById("dungeon-risk-float"),
  suppliesText: document.getElementById("dungeon-supplies-text"),
  suppliesBar: document.getElementById("dungeon-supplies-bar"),
  exhaustionText: document.getElementById("dungeon-exhaustion-text"),
  exhaustionBar: document.getElementById("dungeon-exhaustion-bar"),
  riskText: document.getElementById("dungeon-risk-text"),
  riskIndicator: document.getElementById("dungeon-risk-indicator"),
  floorRoomCount: document.getElementById("dungeon-floor-room-count"),
  floorRoomBar: document.getElementById("dungeon-floor-room-bar"),
  campStatus: document.getElementById("dungeon-camp-status"),
  runLootList: document.getElementById("dungeon-run-loot-list"),
  /* Footer */
  inventoryBtn: document.getElementById("dungeon-inventory-btn"),
  returnBtn: document.getElementById("dungeon-return-btn"),
  /* Loading */
  loading: document.getElementById("dungeon-loading"),
  loadingText: document.querySelector(
   "#dungeon-loading .dungeon-loading-content p"
  ),
  /* Camp Transition */
  campTransition: document.getElementById("dungeonCampTransition"),
  /* Modal */
  modal: document.getElementById("dungeon-modal"),
  modalClose: document.getElementById("dungeon-modal-close"),
  modalTitle: document.getElementById("dungeon-modal-title"),
  modalContent: document.getElementById("dungeon-modal-content"),

  /* Expedition Summary */
  summary: document.getElementById("dungeon-summary"),

  summaryTitle: document.getElementById("dungeon-summary-title"),

  summaryMessage: document.getElementById("dungeon-summary-message"),

  summaryDepth: document.getElementById("dungeon-summary-depth"),

  summaryRooms: document.getElementById("dungeon-summary-rooms"),

  summaryRisk: document.getElementById("dungeon-summary-risk"),

  summarySuppliesUsed: document.getElementById("dungeon-summary-supplies-used"),

  summarySuppliesStart: document.getElementById(
   "dungeon-summary-supplies-start"
  ),

  summarySuppliesRemaining: document.getElementById(
   "dungeon-summary-supplies-remaining"
  ),

  summaryLoot: document.getElementById("dungeon-summary-loot"),

  summaryChronicle: document.getElementById("dungeon-summary-chronicle"),

  summaryReturnBtn: document.getElementById("dungeon-summary-return-btn")
 };
 /* =========================================================
     API
  ========================================================= */
 function getToken() {
  return localStorage.getItem(AUTH_KEY) || "";
 }

 function redirectToLogin() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = TITLE_URL;
 }
 async function apiFetch(path, options = {}) {
  const token = getToken();
  if (!token) {
   redirectToLogin();
   throw new Error("No auth token.");
  }
  const config = {
   ...options,
   headers: {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    ...(options.body
     ? {
        "Content-Type": "application/json"
       }
     : {})
   }
  };
  const response = await fetch(API_BASE + path, config);
  let data = null;
  try {
   const text = await response.text();
   data = text ? JSON.parse(text) : {};
  } catch (_) {
   data = {};
  }
  if (response.status === 401 || response.status === 403) {
   redirectToLogin();
   throw new Error("Session expired.");
  }
  if (!response.ok) {
   const message =
    data?.payload?.message ||
    data?.payload ||
    data?.error ||
    data?.message ||
    `Request failed (${response.status}).`;
   const error = new Error(
    typeof message === "string" ? message : JSON.stringify(message)
   );
   error.status = response.status;
   error.data = data;
   throw error;
  }
  return data;
 }
 /* =========================================================
     HELPERS
  ========================================================= */
 function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
 }

 function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
 }

 function percentage(current, max) {
  if (!max || Number(max) <= 0) {
   return 0;
  }
  return clamp((Number(current) / Number(max)) * 100, 0, 100);
 }

 function setBar(el, pct) {
  if (!el) return;
  el.style.width = `${clamp(pct, 0, 100)}%`;
 }

 function setText(el, value) {
  if (!el) return;
  el.textContent = value == null ? "" : String(value);
 }

 function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
 }

 function popStatChange(element, delta, label = "") {
  if (!element) {
   return;
  }

  const amount = Number(delta || 0);

  if (amount === 0) {
   return;
  }

  element.classList.remove("is-positive", "is-negative", "show");

  element.textContent = `${amount > 0 ? "+" : ""}${amount}${
   label ? ` ${label}` : ""
  }`;

  element.classList.add(amount > 0 ? "is-positive" : "is-negative");

  /*
   Force the animation to restart
   even if the same stat changes
   repeatedly.
 */
  void element.offsetWidth;

  element.classList.add("show");
 }

 function popRiskChange(delta) {
  if (!els.riskFloat) {
   return;
  }

  const amount = Number(delta || 0);

  if (amount === 0) {
   return;
  }

  els.riskFloat.classList.remove("is-positive", "is-negative", "show");

  els.riskFloat.textContent = `${amount > 0 ? "+" : ""}${amount} Risk`;

  els.riskFloat.classList.add(amount > 0 ? "is-negative" : "is-positive");

  void els.riskFloat.offsetWidth;

  els.riskFloat.classList.add("show");
 }

 function shouldShowDungeonEntrance(current) {
  const depth = Number(current?.current_depth || 1);
  const totalRoomsExplored = Number(current?.rooms_explored || 0);
  const floorRoomsExplored = Number(current?.floor?.rooms_explored || 0);

  const hasRoom = !!(current?.current_room || current?.latest_room);

  const hasRoomHistory = !!(
   current?.current_room_history || current?.latest_room_history
  );

  return (
   depth === 1 &&
   totalRoomsExplored === 0 &&
   floorRoomsExplored === 0 &&
   !hasRoom &&
   !hasRoomHistory
  );
 }

 function imageUrl(value) {
  if (!value) return "";
  if (typeof value === "object") {
   return value.url || value.path || "";
  }
  return String(value);
 }

 function prettyRoomType(type) {
  if (!type) return "";
  return type.charAt(0).toUpperCase() + type.slice(1);
 }

 function setBusy(busy, text = "Exploring...") {
  STATE.busy = busy;
  if (els.loadingText) {
   els.loadingText.textContent = text;
  }
  if (els.loading) {
   els.loading.hidden = !busy;
  }
  [
   els.continueBtn,
   els.puzzleGiveupBtn,
   els.campBtn,
   els.safeContinueBtn,
   els.descendBtn,
   els.inventoryBtn,
   els.returnBtn
  ].forEach((button) => {
   if (button) {
    button.disabled = busy;
   }
  });
  document
   .querySelectorAll(
    "#dungeon-choice-buttons button, " + "#dungeon-puzzle-buttons button"
   )
   .forEach((button) => {
    button.disabled = busy;
   });
 }

 function hideAllActionGroups() {
  [
   els.defaultActions,
   els.choiceActions,
   els.puzzleActions,
   els.safeActions,
   els.floorActions
  ].forEach((group) => {
   if (group) {
    group.hidden = true;
   }
  });
 }

 function getFloor() {
  return STATE.current?.floor || {};
 }

 function getDungeon() {
  return STATE.current?.dungeon || {};
 }

 function getRunRisk() {
  return Number(STATE.current?.risk ?? 0);
 }

 function setRunRisk(value) {
  if (!STATE.current) return;
  STATE.current.risk = Math.max(0, Number(value) || 0);
 }

 function setRunExhaustion(value) {
  if (!STATE.current) return;
  STATE.current.exhaustion = clamp(value, 0, 100);
 }

 function setSupplies(value) {
  if (!STATE.current) return;
  STATE.current.expedition_supplies = Math.max(0, Number(value) || 0);
 }
 /* =========================================================
     MODAL
  ========================================================= */
 function openModal(title, content) {
  if (!els.modal || !els.modalTitle || !els.modalContent) {
   return;
  }
  setText(els.modalTitle, title);
  els.modalContent.innerHTML = "";
  if (typeof content === "string") {
   const p = document.createElement("p");
   p.textContent = content;
   els.modalContent.appendChild(p);
  } else if (content instanceof Node) {
   els.modalContent.appendChild(content);
  }
  els.modal.hidden = false;
 }

 function closeModal() {
  if (els.modal) {
   els.modal.hidden = true;
  }
 }

 function confirmModal(title, message, confirmText = "Confirm") {
  return new Promise((resolve) => {
   const wrap = document.createElement("div");
   const text = document.createElement("p");
   text.textContent = message;
   const actions = document.createElement("div");
   actions.style.display = "flex";
   actions.style.gap = "10px";
   actions.style.marginTop = "18px";
   actions.style.justifyContent = "flex-end";
   const cancel = document.createElement("button");
   cancel.type = "button";
   cancel.className = "dungeon-action-btn dungeon-secondary-btn";
   cancel.textContent = "Cancel";
   const confirm = document.createElement("button");
   confirm.type = "button";
   confirm.className = "dungeon-action-btn dungeon-primary-btn";
   confirm.textContent = confirmText;
   actions.append(cancel, confirm);
   wrap.append(text, actions);
   const finish = (result) => {
    closeModal();
    resolve(result);
   };
   cancel.onclick = () => finish(false);
   confirm.onclick = () => finish(true);
   openModal(title, wrap);
  });
 }
 /* =========================================================
     PLAYER + DRAGON
  ========================================================= */
 function normalizePlayer(payload) {
  return payload?.player || payload || null;
 }

 function findRunDragon(current, dragonPayload, playerPayload) {
  const id = Number(current?.active_dragon?.id || 0);
  const dragons = dragonPayload?.dragons || [];
  const found = dragons.find((dragon) => Number(dragon.id) === id);
  if (found) {
   return found;
  }
  const player = normalizePlayer(playerPayload);
  const embedded = playerPayload?.active_dragon || player?.active_dragon;
  if (embedded && Number(embedded.id) === id) {
   return embedded;
  }
  return current?.active_dragon || null;
 }

 function renderParty() {
  const player = STATE.player || {};
  const dragon = STATE.dragon || {};
  /* Player */
  const playerName = player.name || "Player";
  const playerHp = Number(player.hp_current ?? player.hp ?? 0);
  const playerHpMax = Number(player.hp_max ?? playerHp ?? 1);
  setText(els.playerName, playerName);
  setText(els.playerHpText, `${playerHp} / ${playerHpMax}`);
  const playerHpPct = percentage(playerHp, playerHpMax);

  setBar(els.playerHpBar, playerHpPct);

  applyHpState(els.playerHpBar, playerHpPct);
  const playerImg = imageUrl(
   player.image_url || player.img_url || player.image
  );
  if (els.playerImage) {
   if (playerImg) {
    els.playerImage.src = playerImg;
    els.playerImage.style.display = "";
   } else {
    els.playerImage.removeAttribute("src");
    els.playerImage.style.display = "none";
   }
  }
  /* Dragon */
  const dragonName =
   dragon.name || STATE.current?.active_dragon?.name || "Companion";
  const dragonHp = Number(dragon.hp_current ?? dragon.hp ?? 0);
  const dragonHpMax = Number(dragon.hp_max ?? dragonHp ?? 1);
  setText(els.dragonName, dragonName);
  setText(els.dragonHpText, `${dragonHp} / ${dragonHpMax}`);
  const dragonHpPct = percentage(dragonHp, dragonHpMax);

  setBar(els.dragonHpBar, dragonHpPct);

  applyHpState(els.dragonHpBar, dragonHpPct);
  const dragonImg = imageUrl(dragon.img_url || dragon.image_url || dragon.img);
  if (els.dragonImage) {
   if (dragonImg) {
    els.dragonImage.src = dragonImg;
    els.dragonImage.style.display = "";
   } else {
    els.dragonImage.removeAttribute("src");
    els.dragonImage.style.display = "none";
   }
  }
 }
 /* =========================================================
     DUNGEON HEADER
  ========================================================= */
 function renderHeader() {
  const dungeon = getDungeon();
  const depth = Number(STATE.current?.current_depth || 1);
  const maxDepth = Number(dungeon.max_depth || 1);
  setText(els.dungeonName, dungeon.name || "Dungeon");
  setText(els.dungeonDescription, dungeon.description || "");
  setText(els.floorLabel, `Floor ${depth}`);
  if (!els.floorProgress) {
   return;
  }
  els.floorProgress.innerHTML = "";
  for (let floor = 1; floor <= maxDepth; floor++) {
   const marker = document.createElement("div");
   marker.className = "dungeon-floor-marker";
   marker.textContent = floor;
   if (floor < depth) {
    marker.classList.add("completed");
   }
   if (floor === depth) {
    marker.classList.add("active");
   }
   els.floorProgress.appendChild(marker);
  }
 }
 /* =========================================================
     EXPEDITION STATUS
  ========================================================= */
 function applyResourceState(element, value) {
  if (!element) {
   return;
  }

  element.classList.remove("is-warning", "is-critical");

  if (value <= 25) {
   element.classList.add("is-critical");
  } else if (value <= 50) {
   element.classList.add("is-warning");
  }
 }

 function applyHpState(element, value) {
  if (!element) {
   return;
  }

  element.classList.remove("is-warning", "is-critical");

  if (value <= 0) {
   element.classList.add("is-critical");
   return;
  }

  if (value < 20) {
   element.classList.add("is-critical");
  } else if (value < 50) {
   element.classList.add("is-warning");
  }
 }

 function renderRisk() {
  const risk = getRunRisk();
  setText(els.riskText, risk);
  if (!els.riskIndicator) {
   return;
  }
  els.riskIndicator.innerHTML = "";
  /*
     Ten markers are only a visual scale.
     Risk itself may exceed 10.
   */
  const markerCount = 10;
  for (let i = 1; i <= markerCount; i++) {
   const marker = document.createElement("span");
   marker.className = "dungeon-risk-marker";
   if (i <= risk) {
    marker.classList.add("active");

    if (risk >= 7) {
     marker.classList.add("critical");
    } else if (risk >= 4) {
     marker.classList.add("warning");
    }
   }
   els.riskIndicator.appendChild(marker);
  }
 }

 function renderStatus() {
  if (!STATE.current) {
   return;
  }
  /* Supplies */
  const supplies = Number(STATE.current.expedition_supplies || 0);
  const suppliesStart = Math.max(
   1,
   Number(STATE.current.supplies_start || supplies || 1)
  );
  const suppliesPct = percentage(supplies, suppliesStart);

  setText(els.suppliesText, supplies);

  setBar(els.suppliesBar, suppliesPct);

  applyResourceState(els.suppliesBar, suppliesPct);
  /* Exhaustion */
  const exhaustion = clamp(STATE.current.exhaustion, 0, 100);
  setText(els.exhaustionText, `${exhaustion}%`);

  setBar(els.exhaustionBar, exhaustion);

  applyResourceState(els.exhaustionBar, exhaustion);
  /* Risk */
  renderRisk();
  /* Floor */
  const floor = getFloor();
  const explored = Number(floor.rooms_explored || 0);
  const target = STATE.targetRooms;
  if (target != null) {
   setText(els.floorRoomCount, `${explored} / ${target} Rooms`);
   setBar(els.floorRoomBar, percentage(explored, target));
  } else {
   setText(els.floorRoomCount, `${explored} Rooms`);
   setBar(els.floorRoomBar, 0);
  }
  /* Camp */
  const campUsed = floor.camp_used === true;
  setText(els.campStatus, campUsed ? "Used" : "Available");
  if (els.campStatus) {
   els.campStatus.classList.toggle("available", !campUsed);
   els.campStatus.classList.toggle("used", campUsed);
  }
  renderRunLoot();
 }
 /* =========================================================
     UNSECURED LOOT
  ========================================================= */
 function addLootToState(entries) {
  if (!Array.isArray(entries)) {
   return;
  }
  entries.forEach((entry) => {
   if (!entry) return;
   const itemId = Number(entry.items_id || 0);
   const existing = STATE.unsecuredLoot.find(
    (loot) => Number(loot.items_id) === itemId
   );
   if (existing) {
    existing.qty = Number(existing.qty || 0) + Number(entry.qty || 0);
    return;
   }
   STATE.unsecuredLoot.push({
    ...entry,
    qty: Number(entry.qty || 0)
   });
  });
 }

 function renderRunLoot() {
  if (!els.runLootList) {
   return;
  }
  els.runLootList.innerHTML = "";
  if (!STATE.unsecuredLoot.length) {
   const empty = document.createElement("p");
   empty.id = "dungeon-no-loot-text";
   empty.textContent = "Nothing recovered yet.";
   els.runLootList.appendChild(empty);
   return;
  }
  STATE.unsecuredLoot.forEach((loot) => {
   const entry = document.createElement("div");
   entry.className = "dungeon-loot-entry";
   const name = document.createElement("span");
   name.textContent =
    loot.name || loot.item_name || loot.item_code || "Unknown Item";
   const qty = document.createElement("strong");
   qty.textContent = `×${Number(loot.qty || 0)}`;
   entry.append(name, qty);
   els.runLootList.appendChild(entry);
  });
 }
 /* =========================================================
     ROOM DISPLAY
  ========================================================= */
 function clearRoomResult() {
  if (els.roomResult) {
   els.roomResult.hidden = true;

   els.roomResult.classList.remove(
    "is-puzzle-success",
    "is-puzzle-failure",
    "is-puzzle-abandoned",
    "is-camp-result"
   );
  }

  if (els.roomResultEffects) {
   els.roomResultEffects.innerHTML = "";
  }

  const oldNote = els.roomResult?.querySelector(".dungeon-result-note");

  if (oldNote) {
   oldNote.remove();
  }

  if (els.lootResult) {
   els.lootResult.hidden = true;
  }

  if (els.lootList) {
   els.lootList.innerHTML = "";
  }

  if (els.hazardResult) {
   els.hazardResult.hidden = true;
  }

  if (els.hazardEffects) {
   els.hazardEffects.innerHTML = "";
  }
 }

 function setRoomResult(text, eyebrow = "Expedition", effects = []) {
  if (!els.roomResult) {
   return;
  }

  els.roomResult.hidden = false;

  setText(els.roomResultEyebrow, eyebrow);

  setText(els.roomResultHeading, text || "");

  if (els.roomResultEffects) {
   els.roomResultEffects.innerHTML = "";

   effects.forEach((effect) => {
    addResultEffect(els.roomResultEffects, effect);
   });
  }

  const oldNote = els.roomResult.querySelector(".dungeon-result-note");

  if (oldNote) {
   oldNote.remove();
  }
 }

 function addResultEffect(container, text) {
  if (!container || !text) {
   return;
  }

  const effect = document.createElement("span");

  effect.className = "dungeon-result-effect";

  effect.textContent = text;

  container.appendChild(effect);
 }

 function applyRoomClass(type) {
  if (!els.roomPanel) {
   return;
  }

  [
   "is-quiet",
   "is-combat",
   "is-treasure",
   "is-choice",
   "is-puzzle",
   "is-hazard",
   "is-safe",
   "is-merchant",
   "is-entrance",
   "is-descending"
  ].forEach((className) => {
   els.roomPanel.classList.remove(className);
  });

  if (type) {
   els.roomPanel.classList.add(`is-${type}`);
  }
 }

 function renderRoomImage(room) {
  if (!els.roomImage || !els.roomImageWrap) {
   return;
  }
  const url = imageUrl(room?.img_url || room?.image_url || room?.image);
  if (!url) {
   els.roomImage.removeAttribute("src");
   els.roomImageWrap.style.display = "none";
   return;
  }
  els.roomImage.src = url;
  els.roomImage.alt = room.name || "Dungeon Room";
  els.roomImageWrap.style.display = "";
 }

 function renderRoom() {
  clearRoomResult();
  if (els.descentProgress) {
   els.descentProgress.hidden = true;
   els.descentProgress.classList.remove("is-active");
  }
  const room = STATE.room;
  setText(
   els.roomContext,
   room ? `${prettyRoomType(room.room_type)} Encounter` : "Exploring"
  );
  if (!room) {
   if (STATE.entranceActive) {
    const dungeon = STATE.current?.dungeon || {};

    setText(els.roomType, "Dungeon Entrance");
    setText(els.roomNumber, "");
    setText(els.roomContext, "At the Threshold");

    setText(els.roomName, dungeon.name || "Into the Depths");

    setText(
     els.roomDescription,
     dungeon.entrance_description ||
      "The passage ahead disappears into darkness. Beyond this point, every step carries the expedition deeper underground."
    );

    renderRoomImage(null);
    applyRoomClass("entrance");
    renderActions();
    return;
   }

   setText(els.roomType, "Expedition");
   setText(els.roomNumber, "");
   setText(els.roomContext, "Exploring");
   setText(els.roomName, "Into the Depths");
   setText(
    els.roomDescription,
    "The unexplored passages of the dungeon stretch ahead."
   );

   renderRoomImage(null);
   applyRoomClass(null);
   renderActions();
   return;
  }
  setText(els.roomType, prettyRoomType(room.room_type));
  const roomNumber =
   STATE.roomHistory?.room_number ?? STATE.current?.rooms_explored ?? "";
  setText(els.roomNumber, roomNumber ? `Room ${roomNumber}` : "");
  setText(els.roomName, room.name || "Unknown Chamber");
  setText(els.roomDescription, room.description || "");
  renderRoomImage(room);
  applyRoomClass(room.room_type);
  renderActions();
 }
 /* =========================================================
     ACTION STATE
  ========================================================= */
 function getPuzzleStatus() {
  return (
   STATE.roomHistory?.outcome_json?.puzzle_status ||
   STATE.roomHistory?.puzzle_status ||
   null
  );
 }

 function floorComplete() {
  if (STATE.targetRooms == null) {
   return false;
  }
  return Number(getFloor().rooms_explored || 0) >= Number(STATE.targetRooms);
 }

 function isFinalFloor() {
  const dungeon = getDungeon();
  return (
   Number(STATE.current?.current_depth || 1) >= Number(dungeon.max_depth || 1)
  );
 }

 function renderActions() {
  hideAllActionGroups();
  const room = STATE.room;
  /*
     No room yet:
     begin exploring.
   */
  if (!room) {
   if (els.defaultActions) {
    els.defaultActions.hidden = false;
   }

   setText(
    els.continueBtn,
    STATE.entranceActive ? "Begin Expedition" : "Continue Exploring"
   );

   return;
  }
  /*
     Unresolved choice.
   */
  const choiceCode = STATE.roomHistory?.choice_code || "";
  if (room.room_type === "choice" && !choiceCode) {
   renderChoiceActions(room);
   return;
  }
  /*
     Unresolved puzzle.
   */
  if (room.room_type === "puzzle") {
   const puzzleStatus = getPuzzleStatus();
   if (puzzleStatus !== "solved" && puzzleStatus !== "gave_up") {
    renderPuzzleActions(room);
    return;
   }
  }
  /*
     Floor target reached.
   */
  if (floorComplete()) {
   if (els.floorActions) {
    els.floorActions.hidden = false;
   }
   if (isFinalFloor()) {
    setText(
     els.floorCompleteText,
     "You have explored enough of the deepest floor to bring this expedition to an end."
    );
    setText(els.descendBtn, "Complete Expedition");
   } else {
    setText(
     els.floorCompleteText,
     "A passage descends deeper into the dungeon."
    );
    setText(
     els.descendBtn,
     `Descend to Floor ${Number(STATE.current?.current_depth || 1) + 1}`
    );
   }
   return;
  }
  /*
     Camp available.

     IMPORTANT:
     Camping is allowed in ANY room.
     Safe rooms simply avoid the
     unsafe-camp Risk penalty.
   */
  if (getFloor().camp_used !== true) {
   if (els.safeActions) {
    els.safeActions.hidden = false;
   }
   const safe = room.is_safe_room === true;
   setText(els.campBtn, safe ? "Make Camp" : "Make Camp — Risk +1");
   setText(els.safeContinueBtn, "Continue Exploring");
   return;
  }
  /*
     Standard resolved room.
   */
  if (els.defaultActions) {
   els.defaultActions.hidden = false;
  }
  setText(els.continueBtn, "Continue Exploring");
 }
 /* =========================================================
     CHOICE ROOMS
  ========================================================= */
 function renderChoiceActions(room) {
  if (!els.choiceActions || !els.choiceButtons) {
   return;
  }
  els.choiceActions.hidden = false;
  els.choiceButtons.innerHTML = "";
  const choices = Array.isArray(room.choices_json)
   ? room.choices_json
   : room.choices_json?.choices || [];
  choices.forEach((choice) => {
   const button = document.createElement("button");
   button.type = "button";
   button.className = "dungeon-action-btn dungeon-secondary-btn";
   button.textContent = choice.label || choice.code || "Choose";
   button.addEventListener("click", () => resolveChoice(choice.code));
   els.choiceButtons.appendChild(button);
  });
  if (!choices.length) {
   const text = document.createElement("p");
   text.textContent = "No choices are available.";
   els.choiceButtons.appendChild(text);
  }
 }
 async function resolveChoice(choiceCode) {
  if (STATE.busy || !choiceCode) {
   return;
  }

  const choices = Array.isArray(STATE.room?.choices_json)
   ? STATE.room.choices_json
   : STATE.room?.choices_json?.choices || [];

  const selectedChoice = choices.find((choice) => choice.code === choiceCode);

  const choiceLabel = selectedChoice?.label || choiceCode || "Your decision";

  try {
   setBusy(true, "Making your decision...");

   const result = await apiFetch("/players/me/dungeons/choice", {
    method: "POST",
    body: JSON.stringify({
     choice_code: choiceCode
    })
   });

   STATE.roomHistory = STATE.roomHistory || {};

   STATE.roomHistory.choice_code = choiceCode;

   STATE.roomHistory.outcome_json = {
    ...(STATE.roomHistory.outcome_json || {}),
    effects: result.effects || {},
    risk_before: result.state?.risk_before,
    risk_after: result.state?.risk_after,
    exhaustion_before: result.state?.exhaustion_before,
    exhaustion_after: result.state?.exhaustion_after,
    player_hp_before: result.state?.player_hp_before,
    player_hp_after: result.state?.player_hp_after
   };

   /*
    Update live dungeon state from
    the choice response.
  */
   if (result.state?.risk_after != null) {
    setRunRisk(result.state.risk_after);
   }

   if (result.state?.exhaustion_after != null) {
    setRunExhaustion(result.state.exhaustion_after);
   }

   if (STATE.player && result.state?.player_hp_after != null) {
    STATE.player.hp_current = result.state.player_hp_after;
   }

   /*
    Build a readable result from
    the applied effects.
  */
   const parts = [];

   const hpDelta = Number(result.effects?.player_hp_delta || 0);

   const riskDelta = Number(result.effects?.risk_delta || 0);

   const exhaustionDelta = Number(result.effects?.exhaustion_delta || 0);

   if (hpDelta !== 0) {
    parts.push(`${hpDelta > 0 ? "+" : ""}${hpDelta} HP`);
   }

   if (riskDelta !== 0) {
    parts.push(`${riskDelta > 0 ? "+" : ""}${riskDelta} Risk`);
   }

   if (exhaustionDelta !== 0) {
    parts.push(
     `${exhaustionDelta > 0 ? "+" : ""}${exhaustionDelta} Exhaustion`
    );
   }

   setRoomResult(choiceLabel, "Decision Made", parts);

   if (!parts.length && els.roomResult) {
    const note = document.createElement("p");

    note.className = "dungeon-result-note";

    note.textContent = "You press onward.";

    els.roomResult.appendChild(note);
   }

   renderParty();
   renderStatus();
   renderActions();
   popStatChange(
    els.playerHpFloat,
    Number(result.state?.player_hp_after ?? 0) -
     Number(result.state?.player_hp_before ?? 0),
    "HP"
   );

   popStatChange(
    els.exhaustionFloat,
    Number(result.state?.exhaustion_after ?? 0) -
     Number(result.state?.exhaustion_before ?? 0),
    "Exhaustion"
   );

   popRiskChange(
    Number(result.state?.risk_after ?? 0) -
     Number(result.state?.risk_before ?? 0)
   );
  } catch (error) {
   showError(error);
  } finally {
   setBusy(false);
  }
 }
 /* =========================================================
     PUZZLES
  ========================================================= */
 function renderPuzzleActions(room) {
  if (!els.puzzleActions || !els.puzzleButtons) {
   return;
  }
  els.puzzleActions.hidden = false;
  els.puzzleButtons.innerHTML = "";
  const choices = Array.isArray(room.choices_json)
   ? room.choices_json
   : room.choices_json?.choices || [];
  choices.forEach((choice) => {
   const button = document.createElement("button");
   button.type = "button";
   button.className = "dungeon-puzzle-answer";
   button.textContent = choice.label || choice.code;
   button.addEventListener("click", () => submitPuzzleAnswer(choice.code));
   els.puzzleButtons.appendChild(button);
  });
 }
 async function submitPuzzleAnswer(answerCode) {
  if (STATE.busy || !answerCode) {
   return;
  }

  const choices = Array.isArray(STATE.room?.choices_json)
   ? STATE.room.choices_json
   : STATE.room?.choices_json?.choices || [];

  const selectedAnswer = choices.find((choice) => choice.code === answerCode);

  const answerLabel = selectedAnswer?.label || answerCode || "Your answer";

  try {
   setBusy(true, "Testing your answer...");

   const result = await apiFetch("/players/me/dungeons/puzzle/action", {
    method: "POST",
    body: JSON.stringify({
     answer_code: answerCode
    })
   });

   STATE.roomHistory = STATE.roomHistory || {};

   STATE.roomHistory.outcome_json = {
    ...(STATE.roomHistory.outcome_json || {}),
    puzzle_status: result.puzzle_status,
    puzzle_attempts: result.attempts,
    puzzle_solved: result.solved,
    puzzle_gave_up: false,
    puzzle_last_answer: answerCode
   };

   const riskBefore = getRunRisk();

   setRunRisk(result.risk_after);

   const riskDelta = Number(result.risk_after ?? 0) - riskBefore;

   const effects = [];

   if (riskDelta !== 0) {
    effects.push(`${riskDelta > 0 ? "+" : ""}${riskDelta} Risk`);
   }

   if (result.correct) {
    setRoomResult(answerLabel, "Puzzle Solved", effects);

    els.roomResult?.classList.add("is-puzzle-success");
   } else {
    setRoomResult(answerLabel, "Incorrect Answer", effects);

    els.roomResult?.classList.add("is-puzzle-failure");
   }

   renderStatus();
   renderActions();

   popRiskChange(riskDelta);
  } catch (error) {
   showError(error);
  } finally {
   setBusy(false);
  }
 }
 async function giveUpPuzzle() {
  if (STATE.busy) {
   return;
  }

  const confirmed = await confirmModal(
   "Give Up?",
   "Abandoning this puzzle carries a greater penalty than an incorrect answer.",
   "Give Up"
  );

  if (!confirmed) {
   return;
  }

  try {
   setBusy(true, "Abandoning puzzle...");

   const riskBefore = getRunRisk();

   const exhaustionBefore = Number(STATE.current?.exhaustion || 0);

   const result = await apiFetch("/players/me/dungeons/puzzle/giveup", {
    method: "POST"
   });

   STATE.roomHistory = STATE.roomHistory || {};

   STATE.roomHistory.outcome_json = {
    ...(STATE.roomHistory.outcome_json || {}),
    puzzle_status: "gave_up",
    puzzle_attempts: result.attempts,
    puzzle_solved: false,
    puzzle_gave_up: true
   };

   setRunRisk(result.risk_after);

   setRunExhaustion(result.exhaustion_after);

   const riskDelta = getRunRisk() - riskBefore;

   const exhaustionDelta =
    Number(STATE.current?.exhaustion || 0) - exhaustionBefore;

   const effects = [];

   if (riskDelta !== 0) {
    effects.push(`${riskDelta > 0 ? "+" : ""}${riskDelta} Risk`);
   }

   if (exhaustionDelta !== 0) {
    effects.push(
     `${exhaustionDelta > 0 ? "+" : ""}${exhaustionDelta} Exhaustion`
    );
   }

   setRoomResult(
    "You abandon the puzzle and press onward.",
    "Puzzle Abandoned",
    effects
   );

   els.roomResult?.classList.add("is-puzzle-abandoned");

   renderStatus();
   renderActions();

   popRiskChange(riskDelta);

   popStatChange(els.exhaustionFloat, exhaustionDelta, "Exhaustion");
  } catch (error) {
   showError(error);
  } finally {
   setBusy(false);
  }
 }
 /* =========================================================
     EXPLORE
  ========================================================= */
 async function exploreDungeon() {
  if (STATE.busy) {
   return;
  }
  startDungeonAmbience();
  const before = {
   supplies: Number(STATE.current?.expedition_supplies || 0),
   exhaustion: Number(STATE.current?.exhaustion || 0),
   risk: getRunRisk(),
   playerHp: Number(STATE.player?.hp_current ?? STATE.player?.hp ?? 0)
  };
  try {
   setBusy(true, "Exploring the darkness...");
   const result = await apiFetch("/players/me/dungeons/explore", {
    method: "POST"
   });
   STATE.entranceActive = false;
   STATE.lastResult = result;
   STATE.room = result.selected_room || null;
   STATE.roomHistory = {
    dungeon_rooms_id: result.selected_room?.id,
    room_number: result.room_number,
    depth: result.current_depth,
    choice_code: "",
    outcome_json: {}
   };
   /*
      Update canonical run values
      from Explore response.
    */
   if (STATE.current) {
    STATE.current.current_depth = result.current_depth;
    STATE.current.rooms_explored = result.rooms_explored;
    STATE.current.exhaustion = result.exhaustion_after;
    STATE.current.expedition_supplies = result.supplies_after;
    STATE.current.floor = STATE.current.floor || {};
    STATE.current.floor.rooms_explored = result.floor_rooms_explored;
   }
   /*
      Hazard can modify Risk beyond
      the normal run update.
    */
   if (result.hazard_result?.triggered) {
    setRunRisk(result.hazard_result.risk_after);
   }
   /*
      Treasure remains unsecured.
    */
   addLootToState(result.loot_awarded || []);
   renderHeader();
   renderStatus();
   renderRoom();
   renderExploreOutcome(result);
   popStatChange(
    els.suppliesFloat,
    Number(STATE.current?.expedition_supplies || 0) - before.supplies,
    "Supplies"
   );

   popStatChange(
    els.exhaustionFloat,
    Number(STATE.current?.exhaustion || 0) - before.exhaustion,
    "Exhaustion"
   );

   popRiskChange(getRunRisk() - before.risk);

   popStatChange(
    els.playerHpFloat,
    Number(STATE.player?.hp_current ?? STATE.player?.hp ?? 0) - before.playerHp,
    "HP"
   );
   /*
      Combat handoff.
    */
   if (result.trigger?.type === "combat") {
    await beginDungeonCombat(result.trigger);
    return;
   }
  } catch (error) {
   showError(error);
  } finally {
   setBusy(false);
  }
 }

 function renderExploreOutcome(result) {
  /*
     Treasure
   */
  if (
   Array.isArray(result.loot_awarded) &&
   result.loot_awarded.length &&
   els.lootResult &&
   els.lootList
  ) {
   els.lootResult.hidden = false;

   els.lootList.innerHTML = "";

   setText(els.lootHeading, "Something valuable catches your eye.");

   result.loot_awarded.forEach((loot) => {
    addResultEffect(
     els.lootList,
     `${loot.name || loot.item_name || loot.item_code || "Item"} ×${Number(
      loot.qty || 1
     )}`
    );
   });
  }
  /*
     Hazard
   */
  const hazard = result.hazard_result;

  if (hazard?.triggered && els.hazardResult) {
   els.hazardResult.hidden = false;

   if (els.hazardEffects) {
    els.hazardEffects.innerHTML = "";
   }

   setText(els.hazardHeading, "The dungeon takes its toll.");

   if (Number(hazard.hp_delta) !== 0) {
    addResultEffect(
     els.hazardEffects,
     `${Number(hazard.hp_delta) > 0 ? "+" : ""}${Number(hazard.hp_delta)} HP`
    );

    if (STATE.player) {
     STATE.player.hp_current = hazard.hp_after;
    }
   }

   if (Number(hazard.risk_delta) !== 0) {
    addResultEffect(
     els.hazardEffects,
     `${Number(hazard.risk_delta) > 0 ? "+" : ""}${Number(
      hazard.risk_delta
     )} Risk`
    );
   }

   renderParty();
  }
 }
 /* =========================================================
     COMBAT
  ========================================================= */
 async function beginDungeonCombat(trigger) {
  try {
   setBusy(true, "Combat begins...");
   await apiFetch("/players/me/combat/start-random", {
    method: "POST",
    body: JSON.stringify({
     source: trigger.source || "dungeon",
     environment: trigger.environment || STATE.room?.environment || "any_land",
     monster_code: trigger.monster_code || ""
    })
   });
   window.location.href = ARENA_URL;
  } catch (error) {
   showError(error);
   setBusy(false);
  }
 }
 async function redirectIfActiveCombat() {
  try {
   const result = await apiFetch("/players/me/combat/active");
   if (result?.has_active_combat === true && result.status === "active") {
    window.location.href = ARENA_URL;
    return true;
   }
  } catch (error) {
   console.warn("Active combat check failed:", error);
  }
  return false;
 }
 /* =========================================================
     CAMP
  ========================================================= */
 async function campDungeon() {
  if (STATE.busy) {
   return;
  }

  const safe = STATE.room?.is_safe_room === true;

  const message = safe
   ? "This room offers a secure place to rest. Camping will restore you and your companion, restore Exhaustion, and consume Expedition Supplies."
   : "Camping here will restore you and your companion, restore Exhaustion, and consume Expedition Supplies. Because this room is not safe, Risk will increase.";

  const confirmed = await confirmModal(
   safe ? "Make Camp?" : "Make Camp Here?",
   message,
   "Make Camp"
  );

  if (!confirmed) {
   return;
  }

  try {
   setBusy(true, "Making camp...");

   const result = await apiFetch("/players/me/dungeons/camp", {
    method: "POST"
   });

   /*
    Camp returns nested state
    objects. Use those values as
    the authoritative result.
  */
   if (result.risk?.after != null) {
    setRunRisk(result.risk.after);
   }

   if (result.exhaustion?.after != null) {
    setRunExhaustion(result.exhaustion.after);
   }

   if (result.supplies?.after != null) {
    setSupplies(result.supplies.after);
   }

   if (STATE.current?.floor) {
    STATE.current.floor.camp_used = true;
   }

   /*
    Refresh player and dragon
    vitals from server truth.
  */
   await refreshVitals();

   /*
    Calculate every visible change
    directly from the Camp response.
  */
   const changes = {
    supplies:
     Number(result.supplies?.after ?? 0) - Number(result.supplies?.before ?? 0),

    exhaustion:
     Number(result.exhaustion?.after ?? 0) -
     Number(result.exhaustion?.before ?? 0),

    risk: Number(result.risk?.after ?? 0) - Number(result.risk?.before ?? 0),

    playerHp:
     Number(result.player?.hp_after ?? 0) -
     Number(result.player?.hp_before ?? 0),

    dragonHp:
     Number(result.dragon?.hp_after ?? 0) -
     Number(result.dragon?.hp_before ?? 0)
   };

   /*
    Build Camp result chips.
  */
   const effects = [];

   if (changes.supplies !== 0) {
    effects.push(
     `${changes.supplies > 0 ? "+" : ""}${changes.supplies} Supplies`
    );
   }

   if (changes.playerHp !== 0) {
    effects.push(`${changes.playerHp > 0 ? "+" : ""}${changes.playerHp} HP`);
   }

   if (changes.dragonHp !== 0) {
    effects.push(
     `${changes.dragonHp > 0 ? "+" : ""}${changes.dragonHp} Dragon HP`
    );
   }

   if (changes.exhaustion !== 0) {
    effects.push(
     `${changes.exhaustion > 0 ? "+" : ""}${changes.exhaustion} Exhaustion`
    );
   }

   if (changes.risk !== 0) {
    effects.push(`${changes.risk > 0 ? "+" : ""}${changes.risk} Risk`);
   }

   /*
 Update the dungeon underneath
 the camp transition.
*/
renderParty();
renderStatus();
renderActions();

/*
 Present the camping experience
 only after the backend has
 successfully committed the rest.
*/
setBusy(false);

await playDungeonCampTransition();

/*
 Reveal the Camp outcome after
 returning to the dungeon.
*/
setRoomResult(
 safe
  ? "You rest safely and recover your strength."
  : "You rest and recover despite the danger around you.",
 "Camp Established",
 effects
);

els.roomResult?.classList.add(
 "is-camp-result"
);

   /*
    Floating stat feedback.
  */
   popStatChange(els.suppliesFloat, changes.supplies, "Supplies");

   popStatChange(els.exhaustionFloat, changes.exhaustion, "Exhaustion");

   popRiskChange(changes.risk);

   popStatChange(els.playerHpFloat, changes.playerHp, "HP");

   popStatChange(els.dragonHpFloat, changes.dragonHp, "HP");
  } catch (error) {
   showError(error);
  } finally {
   setBusy(false);
  }
 }

 function renderDescentTransition() {
  const nextFloor = Number(STATE.descendingToFloor || 1);

  playDungeonDescentSfx();

  clearRoomResult();
  hideAllActionGroups();

  setText(els.roomType, "Descending");

  setText(els.roomNumber, "");

  setText(els.roomContext, `Floor ${nextFloor}`);

  setText(els.roomName, "Descending Deeper");

  setText(
   els.roomDescription,
   "The passage slopes downward into the earth. The light from above fades as you and your companion press deeper into the dungeon."
  );

  if (els.descentProgress) {
   els.descentProgress.hidden = false;

   els.descentProgress.classList.remove("is-active");

   void els.descentProgress.offsetWidth;

   els.descentProgress.classList.add("is-active");
  }
  if (els.page) {
   els.page.classList.remove("is-descending");

   /*
   Force the animation to restart
   for every floor transition.
 */
   void els.page.offsetWidth;

   els.page.classList.add("is-descending");
  }

  renderRoomImage(null);
  applyRoomClass("descending");
 }
 function playExpeditionSummaryReveal() {
  if (!els.summary) {
   return;
  }

  const card = els.summary.querySelector(".dungeon-summary-card");

  if (!card) {
   return;
  }

  /*
   Build the reveal sequence in
   the exact order we want the
   player to experience it.
 */
  const sequence = [];

  const add = (element) => {
   if (element) {
    sequence.push(element);
   }
  };

  /*
   Header
 */
  add(card.querySelector(".dungeon-summary-eyebrow"));

  add(els.summaryTitle);
  add(els.summaryMessage);

  add(card.querySelector(".dungeon-summary-divider"));

  /*
   Main expedition statistics.
   Each statistic appears separately.
 */
  card
   .querySelectorAll(".dungeon-summary-overview .dungeon-summary-stat")
   .forEach(add);

  /*
   Expedition Supplies section.
 */
  const sections = card.querySelectorAll(".dungeon-summary-section");

  if (sections[0]) {
   add(sections[0].querySelector(".dungeon-summary-section-heading"));

   add(sections[0].querySelector(".dungeon-summary-supplies"));
  }

  /*
   Loot Secured section.
 */
  if (sections[1]) {
   add(sections[1].querySelector(".dungeon-summary-section-heading"));

   const lootEntries = sections[1].querySelectorAll(
    ".dungeon-summary-loot-entry, .dungeon-summary-empty"
   );

   lootEntries.forEach(add);
  }

  /*
   Expedition Chronicle section.
 */
  if (sections[2]) {
   add(sections[2].querySelector(".dungeon-summary-section-heading"));

   const chronicleEntries = sections[2].querySelectorAll(
    ".dungeon-summary-chronicle-entry, .dungeon-summary-empty"
   );

   chronicleEntries.forEach(add);
  }

  /*
   Return button is deliberately
   the final reveal.
 */
  add(els.summaryReturnBtn);

  /*
   Reset everything first.
 */
  sequence.forEach((element) => {
   element.classList.add("dungeon-summary-reveal");

   element.classList.remove("is-visible");
  });

  /*
   Reveal from top to bottom.
 */
  sequence.forEach((element, index) => {
   setTimeout(() => {
    element.classList.add("is-visible");
   }, 250 + index * 175);
  });
 }
 /* =========================================================
   EXPEDITION SUMMARY
========================================================= */
 function renderExpeditionSummary(result) {
  if (!result || !els.summary) {
   return;
  }

  STATE.summaryActive = true;
  STATE.summaryData = result;

  const dungeon = result.dungeon || {};

  const supplies = result.supplies || {};

  setText(els.summaryTitle, dungeon.name || "Expedition Complete");

  setText(
   els.summaryMessage,
   result.message ||
    "You emerge from the depths with everything recovered during the expedition."
  );

  setText(els.summaryDepth, `Floor ${Number(result.final_depth || 1)}`);

  setText(els.summaryRooms, Number(result.rooms_explored || 0));

  setText(els.summaryRisk, Number(result.risk || 0));

  setText(els.summarySuppliesUsed, Number(supplies.used || 0));

  setText(els.summarySuppliesStart, `${Number(supplies.start || 0)} Supplies`);

  setText(
   els.summarySuppliesRemaining,
   `${Number(supplies.remaining || 0)} Supplies`
  );

  /*
   Secured Loot
 */
  if (els.summaryLoot) {
   els.summaryLoot.innerHTML = "";

   const loot = Array.isArray(result.secured_loot) ? result.secured_loot : [];

   if (!loot.length) {
    const empty = document.createElement("p");

    empty.className = "dungeon-summary-empty";

    empty.textContent = "No loot was recovered.";

    els.summaryLoot.appendChild(empty);
   } else {
    loot.forEach((entry) => {
     const item = document.createElement("span");

     item.className = "dungeon-summary-loot-entry";

     item.textContent = `${
      entry.name || entry.item_code || "Unknown Item"
     } ×${Number(entry.qty || 0)}`;

     els.summaryLoot.appendChild(item);
    });
   }
  }

  /*
   Chronicle

   For this first pass we only
   prove that the backend history
   reaches the page correctly.
 */
  if (els.summaryChronicle) {
   els.summaryChronicle.innerHTML = "";

   const chronicle = Array.isArray(result.chronicle) ? result.chronicle : [];

   chronicle.forEach((entry) => {
    const row = document.createElement("div");

    row.className = "dungeon-summary-chronicle-entry";

    const location = document.createElement("span");

    location.textContent = `Floor ${Number(entry.depth || 1)} · Room ${Number(
     entry.room_number || 0
    )}`;

    const name = document.createElement("strong");

    name.textContent = entry.room_name || "Unknown Chamber";

    row.append(location, name);

    els.summaryChronicle.appendChild(row);
   });

   if (!chronicle.length) {
    const empty = document.createElement("p");

    empty.className = "dungeon-summary-empty";

    empty.textContent = "No expedition history was recorded.";

    els.summaryChronicle.appendChild(empty);
   }
  }

  els.summary.hidden = false;

  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => {
   playExpeditionSummaryReveal();
  });
 }
 function finishExpeditionSummary() {
  window.location.href = HUB_URL;
 }
 /* =========================================================
     DESCEND / COMPLETE
  ========================================================= */
 async function handleFloorAdvance() {
  if (STATE.busy) {
   return;
  }
  if (isFinalFloor()) {
   await completeDungeon();
   return;
  }
  await descendDungeon();
 }
 async function descendDungeon() {
  try {
   setBusy(true, "Descending deeper...");

   const result = await apiFetch("/players/me/dungeons/descend", {
    method: "POST"
   });

   /*
    The descent is now committed
    on the backend.
  */
   STATE.current.current_depth = result.current_depth;

   STATE.current.risk = result.risk;

   STATE.current.exhaustion = result.exhaustion;

   STATE.current.floor = {
    depth: result.current_depth,
    rooms_explored: result.rooms_explored || 0,
    camp_used: result.camp_used === true,
    safe_room_found: result.safe_room_found === true
   };

   STATE.targetRooms = result.room_target ?? null;

   STATE.room = null;
   STATE.roomHistory = null;
   STATE.entranceActive = false;

   /*
    Begin the frontend descent
    experience.
  */
   STATE.descendingActive = true;
   STATE.descendingToFloor = result.current_depth;

   /*
    The normal loading overlay has
    served its purpose. The center
    panel now owns the transition.
  */
   setBusy(false);

   renderHeader();
   renderStatus();
   renderDescentTransition();

   await wait(4000);

   /*
    Reveal the new floor.
  */
   STATE.descendingActive = false;
   STATE.descendingToFloor = null;

   if (els.page) {
    els.page.classList.remove("is-descending");
   }

   renderRoom();

   setRoomResult(
    result.message || `You arrive on Floor ${result.current_depth}.`,
    "Deeper Into the Dungeon"
   );
  } catch (error) {
   STATE.descendingActive = false;
   STATE.descendingToFloor = null;

   if (els.page) {
    els.page.classList.remove("is-descending");
   }

   showError(error);
  } finally {
   setBusy(false);
  }
 }
 async function completeDungeon() {
  if (STATE.busy) {
   return;
  }

  const confirmed = await confirmModal(
   "Complete Expedition?",
   "You have explored the deepest floor. Completing the dungeon will secure your expedition loot and end this run.",
   "Complete"
  );

  if (!confirmed) {
   return;
  }

  try {
   setBusy(true, "Securing the expedition...");

   const result = await apiFetch("/players/me/dungeons/complete", {
    method: "POST"
   });

   /*
    The run is now completed and
    the loot has been secured.

    Do NOT redirect yet.
  */
   STATE.unsecuredLoot = [];

   setBusy(false);

   renderExpeditionSummary(result);
  } catch (error) {
   showError(error);
  } finally {
   setBusy(false);
  }
 }
 /* =========================================================
     LEAVE DUNGEON
  ========================================================= */
 async function leaveDungeon() {
  if (STATE.busy) {
   return;
  }
  const confirmed = await confirmModal(
   "Return to Surface?",
   "You will end this dungeon expedition and secure everything recovered during the run.",
   "Return to Surface"
  );
  if (!confirmed) {
   return;
  }
  try {
   setBusy(true, "Returning to the surface...");
   await apiFetch("/players/me/dungeons/leave", {
    method: "POST"
   });
   window.location.href = HUB_URL;
  } catch (error) {
   showError(error);
   setBusy(false);
  }
 }
 /* =========================================================
     INVENTORY
  ========================================================= */
 async function openInventory() {
  try {
   setBusy(true, "Checking inventory...");
   const payload = await apiFetch("/players/me/inventory");
   const inventory = Array.isArray(payload.inventory) ? payload.inventory : [];
   STATE.inventory = inventory;
   const backpack = inventory.filter(
    (entry) =>
     (entry.container || "backpack").toLowerCase() === "backpack" &&
     Number(entry.qty || 0) > 0
   );
   const wrap = document.createElement("div");
   if (!backpack.length) {
    const empty = document.createElement("p");
    empty.textContent = "Your backpack is empty.";
    wrap.appendChild(empty);
   }
   backpack.forEach((entry) => {
    const item = entry.item || entry;
    const row = document.createElement("div");
    row.className = "dungeon-loot-entry";
    row.style.marginBottom = "7px";
    const name = document.createElement("span");
    name.textContent =
     item.name || item.item_name || item.item_code || "Unknown Item";
    const qty = document.createElement("strong");
    qty.textContent = `×${entry.qty || 1}`;
    row.append(name, qty);
    wrap.appendChild(row);
   });
   openModal("Backpack", wrap);
  } catch (error) {
   showError(error);
  } finally {
   setBusy(false);
  }
 }
 /* =========================================================
     REFRESH VITALS
  ========================================================= */
 async function refreshVitals() {
  const [playerPayload, dragonPayload] = await Promise.all([
   apiFetch("/players/me"),
   apiFetch("/players/me/dragons").catch(() => ({
    dragons: []
   }))
  ]);
  STATE.player = normalizePlayer(playerPayload);
  STATE.dragon = findRunDragon(STATE.current, dragonPayload, playerPayload);
 }
 /* =========================================================
     INITIAL LOAD
  ========================================================= */
 async function loadDungeon() {
  try {
   setBusy(true, "Entering the dungeon...");
   const redirected = await redirectIfActiveCombat();
   if (redirected) {
    return;
   }
   const [
    current,
    playerPayload,
    dragonPayload,
    inventoryPayload
   ] = await Promise.all([
    apiFetch("/players/me/dungeons/current"),
    apiFetch("/players/me"),
    apiFetch("/players/me/dragons").catch(() => ({
     dragons: []
    })),
    apiFetch("/players/me/inventory").catch(() => ({
     inventory: []
    }))
   ]);
   /*
      Player should only be on this
      page during an active run.
    */
   if (current?.has_active_run !== true) {
    window.location.href = HUB_URL;
    return;
   }
   STATE.current = current;
   STATE.player = normalizePlayer(playerPayload);
   STATE.dragon = findRunDragon(current, dragonPayload, playerPayload);
   STATE.inventory = Array.isArray(inventoryPayload.inventory)
    ? inventoryPayload.inventory
    : [];
   configureDungeonAudio(STATE.current?.audio_profile);
   /*
      These fields are supported
      immediately if we add them
      to GET /dungeons/current.

      Current backend does not yet
      provide all of them.
    */
   STATE.targetRooms =
    current.floor?.target_rooms ??
    current.floor?.metadata_json?.target_rooms ??
    null;
   STATE.room = current.current_room || current.latest_room || null;
   STATE.roomHistory =
    current.current_room_history || current.latest_room_history || null;
   STATE.entranceActive = shouldShowDungeonEntrance(current);
   STATE.unsecuredLoot = Array.isArray(current.unsecured_loot)
    ? current.unsecured_loot
    : [];
   renderAll();
  } catch (error) {
   console.error("Dungeon load failed:", error);
   openModal(
    "Dungeon Error",
    error.message || "The dungeon could not be loaded."
   );
  } finally {
   setBusy(false);
  }
 }
 /* =========================================================
     FULL RENDER
  ========================================================= */
 function renderAll() {
  renderHeader();
  renderParty();
  renderStatus();
  renderRoom();
 }
 /* =========================================================
     ERRORS
  ========================================================= */
 function showError(error) {
  console.error("Dungeon action failed:", error);
  openModal("Unable to Continue", error?.message || "Something went wrong.");
 }
 /* =========================================================
     EVENT BINDINGS
  ========================================================= */
 function bindEvents() {
  if (els.continueBtn) {
   els.continueBtn.addEventListener("click", exploreDungeon);
  }
  if (els.safeContinueBtn) {
   els.safeContinueBtn.addEventListener("click", exploreDungeon);
  }
  if (els.campBtn) {
   els.campBtn.addEventListener("click", campDungeon);
  }
  if (els.puzzleGiveupBtn) {
   els.puzzleGiveupBtn.addEventListener("click", giveUpPuzzle);
  }
  if (els.descendBtn) {
   els.descendBtn.addEventListener("click", handleFloorAdvance);
  }
  if (els.inventoryBtn) {
   els.inventoryBtn.addEventListener("click", openInventory);
  }
  if (els.returnBtn) {
   els.returnBtn.addEventListener("click", leaveDungeon);
  }
  if (els.summaryReturnBtn) {
   els.summaryReturnBtn.addEventListener("click", finishExpeditionSummary);
  }
  if (els.modalClose) {
   els.modalClose.addEventListener("click", closeModal);
  }
  if (els.modal) {
   els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) {
     closeModal();
    }
   });
  }
  document.addEventListener("keydown", (event) => {
   if (event.key === "Escape" && els.modal && !els.modal.hidden) {
    closeModal();
   }
  });
 }
 /* =========================================================
     BOOT
  ========================================================= */
 document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadDungeon();
 });
})();
