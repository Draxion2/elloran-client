// 06/03/26 UPDATE HUD v-4

const API_BASE = "https://xqgu-nq5e-7wvz.n7e.xano.io/api:thFaVU7E";
const AUTH_TOKEN_KEY = "elloran.authToken";
const REQUIRED_REGION_ID = 15;

const hudHpText = document.getElementById("hudHpText");
const hudDragonText = document.getElementById("hudDragonText");
const hudCsText = document.getElementById("hudCsText");

const hudHpFill = document.getElementById("hudHpFill");
const hudDragonFill = document.getElementById("hudDragonFill");

const hudHpCard = document.getElementById("hudHpCard");
const hudDragonCard = document.getElementById("hudDragonCard");
const hudCsCard = document.getElementById("hudCsCard");

const loadingVeil = document.getElementById("loadingVeil");
const enterLocationBtn = document.getElementById("enterLocationBtn");
const startOverlay = document.getElementById("startOverlay");
const sceneFade = document.getElementById("sceneFade");
const sceneIntro = document.getElementById("sceneIntro");
const sceneIntroTitle = document.getElementById("sceneIntroTitle");

const locationTitle = document.querySelector(".location-title strong");
const locationSubtitle = document.querySelector(".location-title span");

const actionPanel = document.getElementById("actionPanel");
const actionTitle = document.getElementById("actionTitle");
const actionText = document.getElementById("actionText");
const actionOptions = document.getElementById("actionOptions");
const closeActionPanel = document.getElementById("closeActionPanel");

// const debugHotspotsBtn = document.getElementById("debugHotspotsBtn");

let interactionLocked = false;
let currentVoice = null;
let currentAmbientScene = null;
let ambientSfxTimer = null;
let typingTimer = null;
let governorIntroStage = 0;

const SCENE_INFO = {
  port: {
    title: "Port of Oar’s Rest",
    subtitle: "A warm harbor carved into the edge of Elloran Sea.",
    intro: "Lanterns glow along the docks as gulls wheel above the rooftops."
  },
  tavern: {
    title: "Rusted Lantern Tavern",
    subtitle: "Warm light, rough voices, and the smell of salt-soaked ale.",
    intro:
      "Warm light spills across warped wooden floors as sailors trade stories over chipped mugs."
  },
  market: {
    title: "Oar’s Rest Market",
    subtitle: "Canvas stalls, loud merchants, and the steady clink of coin."
  },
  docks: {
    title: "Oar’s Rest Docks",
    subtitle:
      "Salt-stained planks, creaking ropes, and ships waiting for open water."
  },
  post: {
    title: "Harbor Records Office",
    subtitle:
      "Ink-stained ledgers, missing notices, and whispers pinned to old wood."
  },
  governor: {
    title: "Governor Hall",
    subtitle: "Polished wood, sealed documents, and authority dressed in brass."
  },
  underground: {
    title: "The Underground",
    subtitle:
      "A hidden passage beneath Oar’s Rest, where whispers carry more weight than coin."
  }
};

const AUDIO = {
  port: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_location_oars_rest.mp3"
  ),
  tavern: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_location_oars_rest_tavern.mp3"
  ),
  market: new Audio(
    "https://raw.githubusercontent.com/Draxion2/elloran-client/cfd5fdc/background_location_oars_rest_market.mp3"
  ),
  docks: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_location_oars_rest_docks.mp3"
  ),
  post: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_location_oars_rest_post.wav"
  ),
  governor: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_location_oars_rest_governor_hall.mp3"
  ),
  underground: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/background_location_oars_rest_underground.mp3"
  )
};

const SFX = {
  click: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_soft_click.mp3"
  ),
  rest: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_tavern_resting.mp3"
  )
};

const AMBIENT_SFX = {
  port: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_distant_gulls.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_ship_bell.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_ship_hull_groan.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_distant_sailor_voices.mp3"
    )
  ],
  tavern: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_mugs_cling.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_distant_laughter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_chair_scrape.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_ship_fireplace_cracking.mp3"
    )
  ],
  market: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_cargo_activity.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_market_gulls.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_merchant_chatter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_coin_sounds.mp3"
    )
  ],
  docks: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_cargo_movement.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_distant_harbor_bell.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_harbor_gulls.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_rope_rigging_creak.mp3"
    )
  ],
  post: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_paper_rustling.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_quill_writing.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_page_turning.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_window_breeze.mp3"
    )
  ],
  governor: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_distant_bell.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_distant_footsteps.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_ledger_close.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_wax_stamp.mp3"
    )
  ],
  underground: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_distant_voices.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_cargo_movement.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_water_drips.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sfx_chain_rattle.mp3"
    )
  ]
};

const VOICE = {
  alwenWelcomeHealthy: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_welcome.mp3"
  ),
  alwenWelcomeWounded: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_welcome_wounded.mp3"
  ),
  alwenWelcomeCritical: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_welcome_critical.mp3"
  ),

  alwenCounter: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_counter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_counter2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_counter3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_counter4.mp3"
    )
  ],
  alwenRumors: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_tables.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_tables2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_tables3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_tables4.mp3"
    )
  ],
  alwenBoard: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_board.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_board2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_board3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_board4.mp3"
    )
  ],
  alwenRooms: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_stairs.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_stairs2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_stairs3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_stairs4.mp3"
    )
  ],
  alwenReturn: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_welcomeAfter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_welcomeAfter2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_welcomeAfter3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/alwen_welcomeAfter4.mp3"
    )
  ],

  brandonWelcomeHealthy: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_welcome.mp3"
  ),
  brandonWelcomeWounded: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_welcome_wounded.mp3"
  ),
  brandonWelcomeCritical: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_welcome_critical.mp3"
  ),
  brandonRoutes: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_routes.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_routes2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_routes3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_routes4.mp3"
    )
  ],

  brandonShip: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_pier.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_pier2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_pier3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_pier4.mp3"
    )
  ],

  brandonCargo: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_cargo.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_cargo2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_cargo3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_cargo4.mp3"
    )
  ],
  brandonHarborMaster: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_hm.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_hm2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_hm3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_hm4.mp3"
    )
  ],
  brandonReturn: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_welcomeAfter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_welcomeAfter2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_welcomeAfter3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/brandon_welcomeAfter4.mp3"
    )
  ],
  lysaWelcomeHealthy: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_welcome.mp3"
  ),
  lysaWelcomeWounded: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_welcome_wounded.mp3"
  ),
  lysaWelcomeCritical: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_welcome_critical.mp3"
  ),

  lysaReturn: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_welcomeAfter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_welcomeAfter2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_welcomeAfter3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_welcomeAfter4.mp3"
    )
  ],

  lysaProvisioners: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_provisioners.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_provisioners2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_provisioners3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_provisioners4.mp3"
    )
  ],

  lysaArmsArmor: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_arms.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_arms2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_arms3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_arms4.mp3"
    )
  ],

  lysaRareGoods: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_rare.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_rare2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_rare3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/lysa_rare4.mp3"
    )
  ],
  cedricWelcomeHealthy: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_welcome.mp3"
  ),
  cedricWelcomeWounded: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_welcome_wounded.mp3"
  ),
  cedricWelcomeCritical: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_welcome_critical.mp3"
  ),

  cedricReturn: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_welcomeAfter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_welcomeAfter2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_welcomeAfter3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_welcomeAfter4.mp3"
    )
  ],

  cedricBounties: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_bounty.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_bounty2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_bounty3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_bounty4.mp3"
    )
  ],

  cedricMissing: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_missing.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_missing2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_missing3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_missing4.mp3"
    )
  ],

  cedricRecords: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_shipping.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_shipping2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_shipping3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_shipping4.mp3"
    )
  ],

  cedricPostmaster: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_postmaster.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_postmaster2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_postmaster3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/cedric_postmaster4.mp3"
    )
  ],
  governorWelcomeHealthy: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_welcome.mp3"
  ),
  governorWelcomeWounded: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_welcome_wounded.mp3"
  ),
  governorWelcomeCritical: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_welcome_critical.mp3"
  ),
  governorGuardWelcomeHealthy: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_welcome.mp3"
  ),
  governorGuardWelcomeWounded: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_welcome_wounded.mp3"
  ),
  governorGuardWelcomeCritical: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_welcome_critical.mp3"
  ),

  governorReturn: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_welcomeAfter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_welcomeAfter2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_welcomeAfter3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_welcomeAfter4.mp3"
    )
  ],

  governorGuardReturn: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_welcomeAfter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_welcomeAfter2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_welcomeAfter3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_welcomeAfter4.mp3"
    )
  ],

  governorDesk: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_governor.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_governor2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_governor3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_governor4.mp3"
    )
  ],

  governorGuard: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_guard.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_guard2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_guard3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/garrick_guard4.mp3"
    )
  ],

  governorNotices: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_official.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_official2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_official3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_official4.mp3"
    )
  ],

  governorMap: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_map.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_map2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_map3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/edmund_map4.mp3"
    )
  ],
  sashaWelcomeHealthy: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_welcome.mp3"
  ),
  sashaWelcomeWounded: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_welcome_wounded.mp3"
  ),
  sashaWelcomeCritical: new Audio(
    "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_welcome_critical.mp3"
  ),

  sashaReturn: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_welcomeAfter.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_welcomeAfter2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_welcomeAfter3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_welcomeAfter4.mp3"
    )
  ],

  sashaContact: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_contact.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_contact2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_contact3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_contact4.mp3"
    )
  ],

  sashaDoor: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_door.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_door2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_door3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_door4.mp3"
    )
  ],

  sashaCrates: [
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_crates.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_crates2.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_crates3.mp3"
    ),
    new Audio(
      "https://github.com/Draxion2/elloran-client/raw/refs/heads/main/sasha_crates4.mp3"
    )
  ]
};

Object.values(AUDIO).forEach((audio) => {
  audio.loop = true;
  audio.volume = 0;
});

Object.values(AMBIENT_SFX)
  .flat()
  .forEach((audio) => {
    audio.volume = 0.18;
  });

Object.values(VOICE).forEach((entry) => {
  if (Array.isArray(entry)) {
    entry.forEach((audio) => (audio.volume = 0.85));
  } else {
    entry.volume = 0.85;
  }
});

SFX.click.volume = 0.22;
SFX.rest.volume = 0.45;

const GOVERNOR_NPCS = {
  clerk: {
    name: "Edmund Hawthorne",
    portrait:
      "https://cdn.jsdelivr.net/gh/Draxion2/elloran-client@main/npc_location_oars_rest_edmund_hawthorne.webp"
  },
  guardCaptain: {
    name: "Garrick Stone",
    portrait:
      "https://cdn.jsdelivr.net/gh/Draxion2/elloran-client@main/npc_location_oars_rest_garrick_stone.webp"
  }
};

const RUMOR_POOL = [
  "A sailor swears strange lights have been drifting beyond Blackwake Reef at night.",
  "Three ships vanished east of the fogbanks this month. No wreckage. No survivors.",
  "Dockhands claim a pale dragon was seen circling the northern cliffs before dawn.",
  "The sea’s been calmer than usual lately. Old sailors say that’s never a good sign.",
  "Someone in the harbor claims they heard singing beneath the water during the storm.",
  "A merchant ship arrived yesterday missing half its crew and refusing to speak.",
  "People have started avoiding the western piers after sunset.",
  "The harbor master’s been quietly warning captains away from the southern routes.",
  "Some sailors say the reefs near Hollow Tide move when the fog rolls in.",
  "A fisherman claims he saw glowing eyes beneath his boat two nights ago."
];

const NOTICE_BOARD_POSTINGS = [
  {
    category: "Local Work",
    title: "Missing Cargo",
    text:
      "Reward offered for recovery of two missing supply crates last seen near the eastern docks."
  },
  {
    category: "Local Work",
    title: "Dock Repairs Needed",
    text:
      "Carpenters and strong backs needed for pier reinforcement after recent storm damage."
  },
  {
    category: "Dangerous Notice",
    title: "Unsafe Waters",
    text:
      "Ships are advised to avoid the southern fogbanks until further notice."
  },
  {
    category: "Dangerous Notice",
    title: "Dragon Sightings",
    text:
      "Multiple sailors report large winged shadows near Blackwake Reef after sunset."
  },
  {
    category: "Dangerous Notice",
    title: "Vanished Crew",
    text:
      "The fishing vessel Dawn Mire failed to return three nights ago. Last known heading: western shoals."
  },
  {
    category: "Personal Request",
    title: "Missing Brother",
    text:
      "Seeking information regarding Tomas Vale, last seen departing Oar’s Rest aboard a merchant brig."
  },
  {
    category: "Personal Request",
    title: "Lost Keepsake",
    text:
      "Family heirloom lost somewhere near the harbor market during last week's storm."
  }
];

const MISSING_PERSONS_POSTINGS = [
  {
    title: "Missing Fisherman",
    text:
      "Marek Hollow failed to return from the western shoals three nights ago. His boat was later found drifting empty."
  },
  {
    title: "Lost Deckhand",
    text:
      "Young deckhand named Perrin Vale vanished shortly after arriving in Oar’s Rest aboard the merchant vessel Graywake."
  },
  {
    title: "Missing Child",
    text:
      "A local family seeks any information regarding their daughter Elsi, last seen near the lower harbor market."
  },
  {
    title: "Overdue Expedition",
    text:
      "A pair of mapmakers departed north toward the cliffs and never returned. Their supplies remain untouched at the docks."
  }
];

const BOUNTY_POSTINGS = [
  {
    title: "Wanted Smuggler",
    text:
      "Reward offered for information leading to the capture of the smuggler known as Red Knife."
  },
  {
    title: "Pirate Captain",
    text:
      "The corsair Vey Marrow is wanted for raids along the southern routes. Armed and dangerous."
  },
  {
    title: "Dock Thieves",
    text:
      "Several thefts near the eastern piers have drawn the attention of the harbor watch."
  },
  {
    title: "Sea Beast Hunt",
    text:
      "Hunters are sought for a dangerous creature reportedly attacking fishing boats beyond Blackwake Reef."
  }
];

const TAVERN_FOOD = [
  {
    title: "Sailor’s Stew",
    text:
      "Thick, salty, and warm enough to make a rough voyage feel further away."
  },
  {
    title: "Black Pepper Fish",
    text:
      "Fresh enough to still taste of the sea, drowned beneath cracked pepper and butter."
  },
  {
    title: "Dockhand Bread Plate",
    text:
      "Hard bread, smoked meat, and sharp cheese served on a scarred wooden tray."
  },
  {
    title: "Harbor Chowder",
    text:
      "Creamy chowder packed with shellfish and enough garlic to wake the dead."
  }
];

const TAVERN_DRINKS = [
  {
    title: "Spiced Harbor Cider",
    text:
      "Sweet at first, sharp at the end, and served in a mug older than some ships."
  },
  {
    title: "Blackwake Rum",
    text:
      "Dark, smoky, and strong enough to make the room sway before the sea does."
  },
  {
    title: "Saltfire Ale",
    text:
      "A bitter local brew that sailors swear tastes better after surviving storms."
  },
  {
    title: "Warm Ember Mead",
    text:
      "Honey-sweet with a faint cinnamon burn lingering at the back of the throat."
  }
];

const AVAILABLE_ROUTES = [
  {
    title: "Blackwake Reef",
    text:
      "A dangerous route marked with reef warnings, strange lights, and several missing vessels."
  },
  {
    title: "Southern Trade Line",
    text:
      "A safer merchant route, though recent pirate sightings have made captains nervous."
  },
  {
    title: "Eastern Fogbanks",
    text:
      "A mist-heavy passage where compasses drift and ships sometimes lose their bearings."
  },
  {
    title: "Stormwatch Cay",
    text: "An open route, but sudden wind shifts make timing important."
  }
];

const SEA_WARNINGS = [
  "Fog reported beyond the eastern banks. Captains are advised to keep lanterns lit and bells ready.",
  "Several crews report unusual currents near Blackwake Reef.",
  "Dragon shadows have been sighted offshore after sundown.",
  "Southern waters remain passable, but pirate activity is increasing."
];

const SHIP_INSPECTIONS = [
  "The hull looks sound enough, though salt has begun crusting along the lower boards.",
  "The ropes are tight, the mast holds steady, and the deck smells of tar and sea wind.",
  "The ship creaks softly beneath your boots, ready but never truly safe.",
  "A few worn boards could use attention, but she still looks seaworthy."
];

const DEPARTURE_PREP = [
  "The crew checks ropes, barrels, sails, and provisions. Departure always feels easier before the sea gets involved.",
  "Supplies are counted, knots are checked, and the harbor wind begins tugging at the sails.",
  "The ship is nearly ready. One more good check may save trouble later.",
  "Dockhands clear space along the pier as the vessel waits for command."
];

const CARGO_INSPECTIONS = [
  "Crates of dried fish, rope, sailcloth, and sealed goods are stacked beneath weathered canvas.",
  "Several barrels carry merchant stamps, though one has been scratched nearly clean.",
  "The cargo smells of salt, spice, tar, and coin.",
  "Most of the cargo looks ordinary. That usually means someone is hiding the interesting part well."
];

const SUPPLY_NOTICES = [
  "Fresh water, salted meat, rope, and spare sailcloth are in high demand this week.",
  "Ship timber is running low after recent storm repairs.",
  "Merchants are charging more for preserved food after several late arrivals.",
  "Barrels of clean water arrived this morning, guarded like treasure."
];

const HARBOR_ROUTE_TALK = [
  "Brandon taps the ledger. “Routes are easy to write down. Surviving them is the trick.”",
  "“Blackwake Reef has been eating ships again. I’d give it distance if I were you.”",
  "“Southern waters are open, but open doesn’t mean safe.”",
  "“Every route has a cost. Some just wait longer to collect.”"
];

const HARBOR_WEATHER_TALK = [
  "“Wind’s calm for now. That usually means it’s thinking.”",
  "“Fog’s been crawling east before dawn. I don’t trust it.”",
  "“Skies look kind enough. Seas rarely are.”",
  "“Storms don’t always announce themselves. Watch the water, not just the clouds.”"
];

const HARBOR_TROUBLE_TALK = [
  "“Missing ships, nervous merchants, and sailors lying badly. That’s the usual shape of trouble.”",
  "“Something’s stirring past the reefs. Don’t ask me what unless you want guesses.”",
  "“Pirates are loud trouble. The quiet kind worries me more.”",
  "“If the harbor feels calm, check who’s trying too hard to look innocent.”"
];
const MARKET_FOOD_INSPECTIONS = [
  "Fresh citrus, hard bread, dried fish, and wrapped cheese sit in neat piles. Some look voyage-ready. Some look like they already survived one.",
  "A vendor offers you a sample of salted fish with far too much confidence.",
  "Barrels of apples, onions, and travel biscuits line the stall, each marked with chalk prices.",
  "The morning catch has already drawn a crowd, though one basket smells suspiciously ambitious."
];

const MARKET_PRICE_TALK = [
  "Prices are higher near the docks, lower near the back stalls, and suspiciously cheap wherever someone smiles too much.",
  "Lysa leans in. “If they call it a captain’s discount, it usually means they raised the price first.”",
  "A merchant argues loudly that everything costs more after a storm. Another merchant argues storms are good for business.",
  "The price boards are written in chalk, which means they change whenever the seller thinks they can get away with it."
];

const MARKET_WEAPON_INSPECTIONS = [
  "Cutlasses, pistols, powder horns, knives, and dented breastplates crowd the racks in organized chaos.",
  "A sailor tests the weight of a blade while the merchant insists it once belonged to someone famous.",
  "One pistol looks well cared for. Another looks like it might explode out of spite.",
  "The armor here is battered, patched, and practical—the kind worn by people who survived long enough to sell it."
];

const MARKET_REPAIR_TALK = [
  "A smith grumbles over a cracked cutlass, muttering that half the damage came from stupidity, not battle.",
  "Repair prices are posted beside the stall, though every line has tiny exceptions scratched beneath it.",
  "A merchant claims anything can be fixed with enough iron, leather, and Celestial Silver.",
  "You hear hammering from behind the stall, followed by someone yelling, “That was supposed to bend!”"
];

const MARKET_RELIC_INSPECTIONS = [
  "Old maps, cloudy bottles, dragon teeth, cracked charms, and strange shells clutter the table.",
  "A compass spins lazily even though it lies flat and untouched.",
  "One faded map shows waters that do not appear on any official chart.",
  "A tiny carved dragon charm catches the light, warm to the touch despite the morning air."
];

const MARKET_DRAGON_ITEM_TALK = [
  "A velvet-lined case holds shed dragon scales, harness buckles, roost charms, and polishing oils.",
  "Lysa grins. “Half of this is useful. The other half is sold to people who like saying they own dragon things.”",
  "A merchant claims a cracked scale came from a storm dragon. Nobody nearby believes him, but everyone looks anyway.",
  "Small dragon-care trinkets hang from hooks: feed charms, scale brushes, and tiny bells meant for young hatchlings."
];

const POST_BOUNTY_INSPECTIONS = [
  "A fresh bounty has been pinned over three older notices. The ink is still dark, and the reward is written larger than the warning.",
  "Several bounty notices are crossed out in red. Cedric’s handwriting beside one reads: “Claimed. Body not recovered.”",
  "One notice names a pirate scout last seen near the southern routes. The sketch is poor, but the reward is not.",
  "A sea beast contract hangs beside criminal warrants, which says plenty about Oar’s Rest priorities."
];

const POST_FRESH_POSTINGS = [
  "A newly posted warrant warns captains of a smuggler using false cargo seals near the eastern docks.",
  "A bounty has been issued for dock thieves stealing medicine crates before voyage departures.",
  "A fresh notice asks for hunters willing to investigate attacks near Blackwake Reef.",
  "The latest posting names a deserter from a merchant vessel. Someone has scratched out part of the reward."
];

const POST_MISSING_NOTICES = [
  "A faded sketch shows a young sailor last seen buying rope near the docks. The note beneath it has been rewritten several times.",
  "One missing notice has a pressed flower pinned to the corner. Someone still visits this board often.",
  "A family’s letter asks for news of a brother who sailed out under clear skies and never returned.",
  "Several notices mention the same region of water, though none of them say it directly."
];

const POST_MISSING_PATTERNS = [
  "Many disappearances cluster around fog-heavy routes. Cedric has circled three names in the same careful hand.",
  "The dates do not line up neatly, but the ships do. Too many vanished after taking cheap cargo contracts.",
  "Several missing sailors were last seen speaking with the same unnamed broker near the market.",
  "The older reports are messier, but one detail repeats: strange lights seen before dawn."
];

const POST_RECORD_INSPECTIONS = [
  "The shipping ledger lists arrivals, departures, cargo claims, and damage reports in Cedric’s precise handwriting.",
  "A merchant brig is marked late by six days. Beside the entry, someone has added a small question mark.",
  "Several cargo manifests have been corrected after filing. Cedric clearly noticed, because every correction is underlined.",
  "One record mentions storm damage, missing crew, and sealed cargo. Somehow, the ship still paid its docking fee."
];

const POST_LOST_SHIP_TALK = [
  "The records show more overdue vessels than Cedric seems comfortable admitting aloud.",
  "Three ships vanished along different routes, but all carried supplies from the same warehouse.",
  "A vessel called the Dawn Mire appears twice: once as departed, once as never arrived.",
  "Cedric has marked a few names with black ink dots. Not official symbols. Personal reminders."
];

const POSTMASTER_MISSING_TALK = [
  "Cedric lowers his voice. “Missing people are rarely just missing. Someone saw something. Someone always does.”",
  "“The board tells you who vanished. The records tell you where the lies begin.”",
  "“Most families want hope. My job is to give them facts. Unfortunately, facts are less kind.”",
  "“If you start looking into the missing, do it carefully. Some questions make people nervous.”"
];

const POSTMASTER_BOUNTY_TALK = [
  "“Bounties attract brave fools and desperate fools. The trick is knowing which one you are before accepting.”",
  "“The larger the reward, the more likely someone has already failed to collect it.”",
  "“I file the notices. I do not recommend them. Important distinction.”",
  "“A bounty is just paperwork wrapped around violence.”"
];

const POSTMASTER_TROUBLE_TALK = [
  "“Recent trouble? That depends whether you mean legal trouble, maritime trouble, or the kind everyone pretends not to notice.”",
  "“Cargo delays, missing sailors, forged seals, nervous captains. Choose a drawer, really.”",
  "“The harbor is calm in the way a desk is clean when everything has been shoved into one drawer.”",
  "“Something is moving through Oar’s Rest quietly. Quiet trouble is the kind that keeps records clerks awake.”"
];
const GOVERNOR_DESK_TALK = [
  "A stack of trade reports sits beneath a brass seal. Judging by the notes in the margins, somebody has been arguing with merchants all week.",
  "Several documents concern harbor taxes, ship registrations, and complaints from captains who believe rules apply only to other people.",
  "A sealed letter from a neighboring port remains unopened. Edmund glances at it occasionally, as if hoping it will solve itself.",
  "The governor's desk is remarkably organized. That usually means someone else suffers for the disorder."
];

const GOVERNOR_NOTICE_TALK = [
  "A notice warns captains against sailing near recently reported reef activity.",
  "One decree concerns harbor fees. Judging by the edits, nobody was pleased with the final version.",
  "A faded order from several years ago remains pinned beside newer notices, largely forgotten but technically still valid.",
  "Several public announcements concern missing cargo, merchant disputes, and routine administrative matters."
];

const GOVERNOR_MAP_TALK = [
  "Red markings identify dangerous waters where ships have recently vanished.",
  "Trade routes stretch across the sea like veins, connecting ports through equal parts profit and risk.",
  "Several handwritten notes have been added around Blackwake Reef. None of them are reassuring.",
  "The governor's cartographers have updated the map recently, adding warnings where reports have become difficult to ignore."
];

const GOVERNOR_LAW_TALK = [
  "Garrick folds his arms. 'Most laws exist because somebody once thought a bad idea was worth trying.'",
  "'People complain about rules until the rules stop someone else from robbing them.'",
  "'The harbor works because everyone agrees on the same boundaries. Mostly.'",
  "'Law is simpler than people make it. Cause trouble, expect attention.'"
];

const GOVERNOR_THREAT_TALK = [
  "'Pirates are predictable. Greed usually is. The stranger threats are harder to prepare for.'",
  "'The sea produces enough danger without people adding their own.'",
  "'Smugglers, thieves, raiders. We manage those. It's the unknown reports that keep me reading late.'",
  "'Most threats don't announce themselves. That's why I get paid to notice them first.'"
];

const GOVERNOR_SECURITY_TALK = [
  "'Governor Hall isn't heavily guarded because we expect trouble. It's guarded because eventually trouble arrives.'",
  "'A peaceful day is usually the result of preparation nobody noticed.'",
  "'Good guards spend more time observing than fighting.'",
  "'Most of my work involves preventing problems before swords become involved.'"
];

const UNDERGROUND_LOCK_TALK = [
  "The lock is unlike anything commonly used in Oar's Rest. Its dark metal catches the lantern light without reflecting it.",
  "Tiny scratches circle the keyhole, but none look recent. Whoever last opened this door knew exactly what they were doing.",
  "The lock has no maker's mark, no rust, and no obvious weakness. That alone makes it expensive.",
  "A thin line of black wax seals part of the lockplate. Someone wanted proof if this door was touched."
];

const UNDERGROUND_DOOR_LISTEN_TALK = [
  "You hear nothing at first. Then something shifts faintly beyond the wood, too soft to trust and too clear to ignore.",
  "The door gives back only silence. In a place like this, silence feels less like absence and more like warning.",
  "A low murmur seems to rise from beyond the door, but it fades before you can decide whether it was real.",
  "For one brief moment, you think you hear water moving somewhere far below."
];

const UNDERGROUND_MARKING_TALK = [
  "Several symbols have been carved into the frame, then scraped nearly smooth. Someone tried to erase them without replacing the wood.",
  "Old markings hide beneath newer scratches. A warning, perhaps, or a record of who once passed through.",
  "One symbol remains clearer than the rest: a small eye cut into the grain and filled with dark wax.",
  "The markings do not match any official seal used in Oar's Rest. That probably explains why they survived this long."
];

const BROKER_RUMOR_TALK = [
  '"Rumors are cheap," Sasha says. "Truth costs more because fewer people survive carrying it."',
  'Sasha tilts her head slightly. "Half this city survives on rumors. The other half pretends it doesn\'t listen."',
  '"A rumor is only dangerous when the wrong person believes it," she says.',
  'The Broker smiles faintly. "If you heard it in a tavern, someone wanted it heard."'
];

const BROKER_SMUGGLER_TALK = [
  '"Every port has smugglers," Sasha says. "The successful ones are simply called merchants."',
  '"Smuggling is just trade with fewer witnesses," she says, folding her gloved hands.',
  'Sasha\'s eyes move briefly toward the crates. "Some ships unload twice. Once for the harbor. Once for everyone else."',
  '"The Watch catches fools," she says. "Professionals leave paperwork behind to prove they were never here."'
];

const BROKER_STRANGE_GOODS_TALK = [
  '"There are buyers for everything," Sasha says. "The question is whether there should be."',
  'The Broker glances toward the shadows. "Some goods are rare. Some are forbidden. The troublesome ones are both."',
  '"Strange goods arrive when desperate people discover ordinary coin is not enough," she says.',
  'Sasha smiles without warmth. "If something should have stayed buried, someone will eventually try to sell it."'
];

const UNDERGROUND_CRATE_MARKING_TALK = [
  "Faded symbols cover the wood. Some resemble merchant guild brands, while others have been deliberately scratched away.",
  "One crate bears the remains of a burned seal. Whatever house owned it, someone wanted that connection forgotten.",
  "The markings do not match the shipping ledgers used aboveground. That feels very intentional.",
  "A black wax stamp clings to one corner of the crate, cracked but not fully removed."
];

const UNDERGROUND_CARGO_TALK = [
  "The crates are sealed tight. Whatever lies inside was packed carefully and moved here quietly.",
  "A faint scent of oil, salt, and old leather escapes between the boards.",
  "One crate shifts slightly when touched, heavier on one side than the other.",
  "The cargo has been stacked for quick removal, not long storage. Someone expects it to move again soon."
];

const UNDERGROUND_CRATE_COUNT_TALK = [
  "You begin counting, then realize more crates are hidden behind canvas and shadow than you first noticed.",
  "The obvious crates are easy to count. The covered ones are another matter.",
  "Someone has arranged the crates to make the room look less full than it is.",
  "Your count changes depending on where the lantern light falls. That is probably not an accident."
];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const DAILY_NOTICE_POSTING = randomFrom(NOTICE_BOARD_POSTINGS);
const DAILY_BOUNTY_POSTING = randomFrom(BOUNTY_POSTINGS);
const DAILY_MISSING_POSTING = randomFrom(MISSING_PERSONS_POSTINGS);
const DAILY_FOOD = randomFrom(TAVERN_FOOD);
const DAILY_DRINK = randomFrom(TAVERN_DRINKS);
const DAILY_AVAILABLE_ROUTE = randomFrom(AVAILABLE_ROUTES);

const SCENE_ACTIONS = {
  tavern: {
    counter: {
      title: "Tavern Counter",
      text:
        "Alwen wipes the counter with a stained cloth, watching you with sharp but welcoming eyes.",
      options: ["Order Food", "Order Drink", "Speak with Alwen"],
      voicePool: VOICE.alwenCounter
    },
    rumors: {
      title: "Crowded Tables",
      text:
        "Sailors, merchants, and dockhands trade stories over chipped mugs and candlelight.",
      options: ["Hear Local Rumors", "Listen for Trouble", "Ask About Dragons"],
      voicePool: VOICE.alwenRumors
    },
    "notice-board": {
      title: "Notice Board",
      text:
        "Old parchment curls against the wall, pinned beneath rusted nails and marked with sea-stained ink.",
      options: [
        "Read Local Jobs",
        "Check Bounties",
        "Look for Missing Persons"
      ],
      voicePool: VOICE.alwenBoard
    },
    rest: {
      title: "Rooms Upstairs",
      text:
        "A narrow stairway leads to rented rooms above the tavern, where the noise fades into creaking wood and distant waves.",
      options: ["Rent a Room", "Rest Until Morning", "Return Downstairs"],
      voicePool: VOICE.alwenRooms
    }
  },

  market: {
    produce: {
      title: "Provisioners",
      text:
        "Baskets of citrus, dried fish, hard bread, and bruised apples crowd the stall. The merchant insists everything is fresher than it looks.",
      options: ["Inspect Food", "Ask About Prices", "Leave Stall"],
      voicePool: VOICE.lysaProvisioners
    },
    weapons: {
      title: "Arms & Armor",
      text:
        "Blades, pistols, hooks, and rusted oddities hang from weathered racks. Some look useful. Some look cursed. A few look both.",
      options: ["Inspect Weapons", "Ask About Repairs", "Leave Stall"],
      voicePool: VOICE.lysaArmsArmor
    },
    curios: {
      title: "Rare Goods",
      text:
        "Small relics, cracked shells, strange teeth, and cloudy bottles are arranged across a faded cloth. Nothing here looks ordinary for long.",
      options: ["Inspect Relics", "Ask About Dragon Items", "Leave Table"],
      voicePool: VOICE.lysaRareGoods
    }
  },

  docks: {
    routes: {
      title: "Route Board",
      text:
        "A weathered board lists routes scratched in ink and salt: familiar waters, dangerous reefs, and names half-crossed out.",
      options: ["View Available Routes", "Check Sea Warnings", "Leave Board"],
      voicePool: VOICE.brandonRoutes
    },
    ship: {
      title: "Ship Pier",
      text:
        "Your ship waits against the pier, ropes drawn tight, hull creaking softly as the tide pulls at her bones.",
      options: ["Inspect Ship", "Prepare to Depart", "Leave Pier"],
      voicePool: VOICE.brandonShip
    },
    cargo: {
      title: "Cargo Dock",
      text:
        "Crates, barrels, fishing nets, and sealed bundles crowd the dock. Dockhands move fast and ask few questions.",
      options: ["Inspect Cargo", "Ask About Supplies", "Leave Cargo Dock"],
      voicePool: VOICE.brandonCargo
    },
    "harbor-master": {
      title: "Harbor Master",
      text:
        "The harbor master studies you over a ledger thick with water stains. “Leaving again? Sea’s not known for mercy.”",
      options: [
        "Ask About Routes",
        "Ask About Weather",
        "Ask About Trouble",
        "Leave Harbor Master"
      ],
      voicePool: VOICE.brandonHarborMaster
    }
  },

  post: {
    bounties: {
      title: "Bounty Board",
      text:
        "Weathered bounty notices overlap one another beneath rusted nails. Some names are crossed out. Some never were.",
      options: ["Inspect Bounties", "Read Fresh Posting", "Leave Board"],
      voicePool: VOICE.cedricBounties
    },
    missing: {
      title: "Missing Persons",
      text:
        "Pages filled with names, sketches, and desperate requests cover the wall. Some are old enough to fade into the wood itself.",
      options: ["Read Notices", "Look for Patterns", "Leave Wall"],
      voicePool: VOICE.cedricMissing
    },
    records: {
      title: "Shipping Records",
      text:
        "Ledgers track arrivals, departures, damaged vessels, and ships that never returned from the sea.",
      options: ["Inspect Records", "Ask About Lost Ships", "Leave Records"],
      voicePool: VOICE.cedricRecords
    },
    postmaster: {
      title: "Town Postmaster",
      text:
        "Cedric Thorn adjusts his spectacles and studies you carefully. “Most folk only come here when they’re looking for something… or someone.”",
      options: [
        "Ask About Missing People",
        "Ask About Bounties",
        "Ask About Recent Trouble",
        "Leave Postmaster"
      ],
      voicePool: VOICE.cedricPostmaster
    }
  },

  governor: {
    desk: {
      title: "Governor’s Desk",
      text:
        "The governor’s desk is covered in sealed letters, tax records, trade disputes, and a half-finished decree weighted beneath a brass dragon stamp.",
      options: ["Inspect Decree", "Read Trade Dispute", "Leave Desk"],
      voicePool: VOICE.governorDesk
    },
    guard: {
      title: "Guard Captain",
      text:
        "The guard captain watches you with the patience of someone paid to notice trouble before it speaks.",
      options: [
        "Ask About Local Law",
        "Ask About Threats",
        "Leave Guard",
        "Ask About Security"
      ],
      voicePool: VOICE.governorGuard,
      npc: "guardCaptain"
    },
    notices: {
      title: "Official Notices",
      text:
        "Stamped notices line the wall: docking laws, curfew warnings, merchant permits, and one order marked with the governor’s private seal.",
      options: [
        "Read Docking Law",
        "Read Curfew Notice",
        "Read Sealed Order",
        "Leave Notices"
      ],
      voicePool: VOICE.governorNotices
    },
    map: {
      title: "Regional Map",
      text:
        "A large map of the surrounding waters is pinned beneath brass weights. Red ink marks reefs, missing ships, and waters marked unsafe.",
      options: ["Inspect Unsafe Waters", "Inspect Trade Routes", "Leave Map"],
      voicePool: VOICE.governorMap
    }
  },

  underground: {
    door: {
      title: "Sealed Door",
      text:
        "A heavy door waits at the end of the passage, marked with old scratches, dark wax, and symbols someone tried very hard to erase.",
      options: [
        "Examine the Lock",
        "Listen at the Door",
        "Search for Hidden Markings"
      ],
      voicePool: VOICE.sashaDoor
    },

    contact: {
      title: "Shadowed Contact",
      text:
        "The Broker watches from beneath her hood. She says little, but somehow the silence feels like a question.",
      options: [
        "Ask About Local Rumors",
        "Ask About Smugglers",
        "Ask About Strange Goods"
      ],
      voicePool: VOICE.sashaContact
    },

    crates: {
      title: "Marked Crates",
      text:
        "Several crates sit beneath torn canvas. Their markings have been burned away, though one still smells faintly of dragon oil.",
      options: ["Inspect the Markings", "Check the Cargo", "Count the Crates"],
      voicePool: VOICE.sashaCrates
    }
  }
};

const PLACEHOLDER_FLOWS = {
  "Order Food": {
    title: `Today's Meal — ${DAILY_FOOD.title}`,
    text: DAILY_FOOD.text,
    options: ["Ask What's Included", "Back to Counter"]
  },
  "Order Drink": {
    title: `Today's Drink — ${DAILY_DRINK.title}`,
    text: DAILY_DRINK.text,
    options: ["Ask About the Brew", "Back to Counter"]
  },
  "Hear Local Rumors": {
    title: "Local Rumors",
    text: randomFrom(RUMOR_POOL),
    options: ["Ask About the Reef", "Ask Who Saw It", "Back to Tables"]
  },
  "Listen for Trouble": {
    title: "Trouble in the Room",
    text:
      "You listen past the laughter. Somewhere near the back, two sailors argue over a missing crate and a name nobody wants to say aloud.",
    options: ["Listen Closer", "Ignore It", "Back to Tables"]
  },
  "Ask About Dragons": {
    title: "Dragon Talk",
    text:
      "A young sailor grins into his mug. “Saw one perch on the chapel roof last winter. Big as a longboat. Smarter than half the council.”",
    options: ["Ask What Color", "Ask Where It Went", "Back to Tables"]
  },
  "Read Local Jobs": {
    title: `${DAILY_NOTICE_POSTING.category} — ${DAILY_NOTICE_POSTING.title}`,
    text: DAILY_NOTICE_POSTING.text,
    options: ["Back to Board"]
  },
  "Check Bounties": {
    title: `Bounty Notice — ${DAILY_BOUNTY_POSTING.title}`,
    text: DAILY_BOUNTY_POSTING.text,
    options: ["Back to Board"]
  },
  "Look for Missing Persons": {
    title: `Missing Persons — ${DAILY_MISSING_POSTING.title}`,
    text: DAILY_MISSING_POSTING.text,
    options: ["Back to Board"]
  },
  "Rent a Room": {
    title: "Rent a Room",
    text:
      "Alwen slides a key across the counter. “Upstairs, second door. Ignore the window if it rattles. It’s been haunted longer than I’ve owned the place.”",
    options: ["Take the Key", "Ask About the Room", "Back to Stairs"]
  },
  "Rest Until Morning": {
    title: "Rest Until Morning",
    text:
      "The room upstairs is small, warm, and blessedly still. For the first time in days, the floor does not move beneath your feet.",
    options: ["Sleep", "Stay Awake a While", "Back to Stairs"]
  },
  "Return Downstairs": {
    title: "Return Downstairs",
    text:
      "You return to the tavern floor, where the fire still crackles and the room hums with low conversation.",
    options: ["Back to Stairs"]
  },
  "View Available Routes": {
    title: `Available Route — ${DAILY_AVAILABLE_ROUTE.title}`,
    text: DAILY_AVAILABLE_ROUTE.text,
    options: ["Back to Route Board"]
  },

  "Check Sea Warnings": {
    title: "Sea Warnings",
    text: randomFrom(SEA_WARNINGS),
    options: ["Back to Route Board"]
  },

  "Inspect Ship": {
    title: "Ship Inspection",
    text: randomFrom(SHIP_INSPECTIONS),
    options: ["Back to Ship Pier"]
  },

  "Prepare to Depart": {
    title: "Departure Preparations",
    text: randomFrom(DEPARTURE_PREP),
    options: ["Back to Ship Pier"]
  },

  "Inspect Cargo": {
    title: "Cargo Inspection",
    text: randomFrom(CARGO_INSPECTIONS),
    options: ["Back to Cargo Dock"]
  },

  "Ask About Supplies": {
    title: "Supply Notice",
    text: randomFrom(SUPPLY_NOTICES),
    options: ["Back to Cargo Dock"]
  },

  "Ask About Routes": {
    title: "Brandon on Routes",
    text: randomFrom(HARBOR_ROUTE_TALK),
    options: ["Back to Harbor Master"]
  },

  "Ask About Weather": {
    title: "Brandon on Weather",
    text: randomFrom(HARBOR_WEATHER_TALK),
    options: ["Back to Harbor Master"]
  },

  "Ask About Trouble": {
    title: "Brandon on Trouble",
    text: randomFrom(HARBOR_TROUBLE_TALK),
    options: ["Back to Harbor Master"]
  },
  "Inspect Food": {
    title: "Provisioners — Food & Supplies",
    text: randomFrom(MARKET_FOOD_INSPECTIONS),
    options: ["Back to Provisioners"]
  },

  "Ask About Prices": {
    title: "Provisioners — Market Prices",
    text: randomFrom(MARKET_PRICE_TALK),
    options: ["Back to Provisioners"]
  },

  "Inspect Weapons": {
    title: "Arms & Armor — Wares",
    text: randomFrom(MARKET_WEAPON_INSPECTIONS),
    options: ["Back to Arms & Armor"]
  },

  "Ask About Repairs": {
    title: "Arms & Armor — Repairs",
    text: randomFrom(MARKET_REPAIR_TALK),
    options: ["Back to Arms & Armor"]
  },

  "Inspect Relics": {
    title: "Rare Goods — Relics",
    text: randomFrom(MARKET_RELIC_INSPECTIONS),
    options: ["Back to Rare Goods"]
  },

  "Ask About Dragon Items": {
    title: "Rare Goods — Dragon Items",
    text: randomFrom(MARKET_DRAGON_ITEM_TALK),
    options: ["Back to Rare Goods"]
  },
  "Inspect Bounties": {
    title: "Bounty Board — Notices",
    text: randomFrom(POST_BOUNTY_INSPECTIONS),
    options: ["Back to Bounty Board"]
  },

  "Read Fresh Posting": {
    title: "Bounty Board — Fresh Posting",
    text: randomFrom(POST_FRESH_POSTINGS),
    options: ["Back to Bounty Board"]
  },

  "Read Notices": {
    title: "Missing Persons — Notices",
    text: randomFrom(POST_MISSING_NOTICES),
    options: ["Back to Missing Persons"]
  },

  "Look for Patterns": {
    title: "Missing Persons — Patterns",
    text: randomFrom(POST_MISSING_PATTERNS),
    options: ["Back to Missing Persons"]
  },

  "Inspect Records": {
    title: "Shipping Records — Ledger",
    text: randomFrom(POST_RECORD_INSPECTIONS),
    options: ["Back to Shipping Records"]
  },

  "Ask About Lost Ships": {
    title: "Shipping Records — Lost Ships",
    text: randomFrom(POST_LOST_SHIP_TALK),
    options: ["Back to Shipping Records"]
  },

  "Ask About Missing People": {
    title: "Cedric on Missing People",
    text: randomFrom(POSTMASTER_MISSING_TALK),
    options: ["Back to Postmaster"]
  },

  "Ask About Bounties": {
    title: "Cedric on Bounties",
    text: randomFrom(POSTMASTER_BOUNTY_TALK),
    options: ["Back to Postmaster"]
  },

  "Ask About Recent Trouble": {
    title: "Cedric on Recent Trouble",
    text: randomFrom(POSTMASTER_TROUBLE_TALK),
    options: ["Back to Postmaster"]
  },
  "Inspect Decree": {
    title: "Governor's Desk — Official Decree",
    text: randomFrom(GOVERNOR_DESK_TALK),
    options: ["Back to Governor's Desk"]
  },

  "Read Trade Dispute": {
    title: "Governor's Desk — Trade Dispute",
    text: randomFrom(GOVERNOR_DESK_TALK),
    options: ["Back to Governor's Desk"]
  },

  "Read Docking Law": {
    title: "Official Notices — Docking Law",
    text: randomFrom(GOVERNOR_NOTICE_TALK),
    options: ["Back to Official Notices"]
  },

  "Read Curfew Notice": {
    title: "Official Notices — Curfew Notice",
    text: randomFrom(GOVERNOR_NOTICE_TALK),
    options: ["Back to Official Notices"]
  },

  "Read Sealed Order": {
    title: "Official Notices — Sealed Order",
    text: randomFrom(GOVERNOR_NOTICE_TALK),
    options: ["Back to Official Notices"]
  },

  "Inspect Unsafe Waters": {
    title: "Regional Map — Unsafe Waters",
    text: randomFrom(GOVERNOR_MAP_TALK),
    options: ["Back to Regional Map"]
  },

  "Inspect Trade Routes": {
    title: "Regional Map — Trade Routes",
    text: randomFrom(GOVERNOR_MAP_TALK),
    options: ["Back to Regional Map"]
  },

  "Ask About Local Law": {
    title: "Captain Garrick Stone — Local Law",
    text: randomFrom(GOVERNOR_LAW_TALK),
    options: ["Back to Guard Captain"]
  },

  "Ask About Threats": {
    title: "Captain Garrick Stone — Threat Assessment",
    text: randomFrom(GOVERNOR_THREAT_TALK),
    options: ["Back to Guard Captain"]
  },

  "Ask About Security": {
    title: "Captain Garrick Stone — Security",
    text: randomFrom(GOVERNOR_SECURITY_TALK),
    options: ["Back to Guard Captain"]
  },

  "Examine the Lock": {
    title: "Sealed Door — Lock",
    text: randomFrom(UNDERGROUND_LOCK_TALK),
    options: ["Back to Sealed Door"]
  },

  "Listen at the Door": {
    title: "Sealed Door — Listening",
    text: randomFrom(UNDERGROUND_DOOR_LISTEN_TALK),
    options: ["Back to Sealed Door"]
  },

  "Search for Hidden Markings": {
    title: "Sealed Door — Hidden Markings",
    text: randomFrom(UNDERGROUND_MARKING_TALK),
    options: ["Back to Sealed Door"]
  },

  "Ask About Local Rumors": {
    title: "The Broker — Local Rumors",
    text: randomFrom(BROKER_RUMOR_TALK),
    options: ["Back to The Broker"]
  },

  "Ask About Smugglers": {
    title: "The Broker — Smugglers",
    text: randomFrom(BROKER_SMUGGLER_TALK),
    options: ["Back to The Broker"]
  },

  "Ask About Strange Goods": {
    title: "The Broker — Strange Goods",
    text: randomFrom(BROKER_STRANGE_GOODS_TALK),
    options: ["Back to The Broker"]
  },

  "Inspect the Markings": {
    title: "Marked Crates — Markings",
    text: randomFrom(UNDERGROUND_CRATE_MARKING_TALK),
    options: ["Back to Marked Crates"]
  },

  "Check the Cargo": {
    title: "Marked Crates — Cargo",
    text: randomFrom(UNDERGROUND_CARGO_TALK),
    options: ["Back to Marked Crates"]
  },

  "Count the Crates": {
    title: "Marked Crates — Count",
    text: randomFrom(UNDERGROUND_CRATE_COUNT_TALK),
    options: ["Back to Marked Crates"]
  }
};

const DIALOGUE_STATES = {
  alwen_intro: {
    speaker: "Alwen Kells",
    text:
      "“You’re not from around Oar’s Rest. Most folk carry themselves differently after a week at sea.”",
    options: [
      { text: "Ask about the port", next: "alwen_port" },
      { text: "Ask about work", next: "alwen_work" },
      { text: "Ask about rumors", next: "alwen_rumors" }
    ]
  },
  alwen_port: {
    speaker: "Alwen Kells",
    text:
      "“Oar’s Rest survives because every sailor between here and the eastern reefs eventually needs repairs, rest, or rum.”",
    options: [
      { text: "Ask about rumors", next: "alwen_rumors" },
      { text: "Back", next: "alwen_intro" }
    ]
  },
  alwen_work: {
    speaker: "Alwen Kells",
    text:
      "“There’s always work near the docks. Trouble too. Usually they arrive together.”",
    options: [{ text: "Back", next: "alwen_intro" }]
  },
  alwen_rumors: {
    speaker: "Alwen Kells",
    text:
      "“Some sailors swear they’ve seen dragons circling the old reefs at night. Smarter folk stay away.”",
    options: [{ text: "Back", next: "alwen_intro" }]
  }
};

const SCENE_CONFIG = {
  port: {
    sceneEl: document.getElementById("scenePort"),
    audioKey: "port"
  },
  tavern: {
    sceneEl: document.getElementById("sceneTavern"),
    audioKey: "tavern",
    welcomeKey: "elloran.oarsRest.tavernWelcomePlayed",
    dialogueEl: document.getElementById("sceneDialogue"),
    dialogueTextEl: document.getElementById("dialogueText"),
    textSpeed: 75,
    continueBtn: document.getElementById("continueDialogueBtn"),
    portraitSelector: "#sceneDialogue .dialogue-portrait",
    welcomeTexts: {
      healthy:
        "Well... hello there... You look like the sea tried to keep you and failed. My name is Alwen Kells, and I own this tavern. Warm yourself, but mind the stairs — they creak louder than drunk sailors.",
      wounded:
        "Whoa now... You look like the sea chewed you up and spat you back. Welcome to my tavern. My name is Alwen Kells, and I'm the innkeeper.",
      critical:
        "By the gods, what happened to you? Please, sit down before you collapse. I’m Alwen Kells, the innkeeper. You really should see the surgeon."
    },
    welcomeVoices: {
      healthy: VOICE.alwenWelcomeHealthy,
      wounded: VOICE.alwenWelcomeWounded,
      critical: VOICE.alwenWelcomeCritical
    },
    returnVoices: VOICE.alwenReturn
  },
  market: {
    sceneEl: document.getElementById("sceneMarket"),
    audioKey: "market",
    welcomeKey: "elloran.oarsRest.marketWelcomePlayed",
    dialogueEl: document.getElementById("marketDialogue"),
    dialogueTextEl: document.getElementById("marketDialogueText"),
    textSpeed: 60,
    continueBtn: document.getElementById("continueMarketDialogueBtn"),
    portraitSelector: "#marketDialogue .dialogue-portrait",
    welcomeTexts: {
      healthy:
        "Oh! New face in the market! Welcome to Oar’s Rest. I’m Lysa Fairwind, and if someone tries selling you fresh fish that smells older than Brandon, come find me.",
      wounded:
        "Whoa—are you shopping or bleeding? I’m Lysa Fairwind. The market can wait if you need bandages first.",
      critical:
        "No, no, no—standing is not a good idea. I’m Lysa Fairwind, and you look like you need a healer before a bargain."
    },
    welcomeVoices: {
      healthy: VOICE.lysaWelcomeHealthy,
      wounded: VOICE.lysaWelcomeWounded,
      critical: VOICE.lysaWelcomeCritical
    },
    returnVoices: VOICE.lysaReturn
  },
  docks: {
    sceneEl: document.getElementById("sceneDocks"),
    audioKey: "docks",
    welcomeKey: "elloran.oarsRest.docksWelcomePlayed",
    dialogueEl: document.getElementById("docksDialogue"),
    dialogueTextEl: document.getElementById("docksDialogueText"),
    textSpeed: 75,
    continueBtn: document.getElementById("continueDocksDialogueBtn"),
    portraitSelector: "#docksDialogue .dialogue-portrait",
    welcomeTexts: {
      healthy:
        "You looking to sail, or just standing there admiring all the ways the sea can kill a person? If you need anything, just ask. I am the harbor's master, Brandon Vale.",
      wounded:
        "The sea won't care if you are already hurting, mate. Brandon Vale's the name, and I am the harbor master here.",
      critical:
        "Hey, my name is Brandon Vale, and I have signed enough death ledgers to know when someone's pushing their luck. You don't need a voyage. You need a bed and a healer."
    },
    welcomeVoices: {
      healthy: VOICE.brandonWelcomeHealthy,
      wounded: VOICE.brandonWelcomeWounded,
      critical: VOICE.brandonWelcomeCritical
    },
    returnVoices: VOICE.brandonReturn
  },
  post: {
    sceneEl: document.getElementById("scenePost"),
    audioKey: "post",
    welcomeKey: "elloran.oarsRest.postWelcomePlayed",
    dialogueEl: document.getElementById("postDialogue"),
    dialogueTextEl: document.getElementById("postDialogueText"),
    textSpeed: 50,
    continueBtn: document.getElementById("continuePostDialogueBtn"),
    portraitSelector: "#postDialogue .dialogue-portrait",
    welcomeTexts: {
      healthy:
        "Welcome to the Oar's Rest Town Post. I'm Cedric Thorn, the clerk and keeper of records. If you're looking for work, news, or someone missing. Or... even trouble, chances are someone pinned it to a board in this building.",
      wounded:
        "You look like you've had a rough voyage. Name's Cedric Thorn, the town Post clerk. If you're searching for information, I'll help where I can, though you may want a healer before you go chasing more trouble.",
      critical:
        "Oh... You appear one strike away from joining the missing persons board. Sit down, catch your breath, and try not to collapse on the paperwork scattered around. My name is Cedric Thorn, the clerk here."
    },
    welcomeVoices: {
      healthy: VOICE.cedricWelcomeHealthy,
      wounded: VOICE.cedricWelcomeWounded,
      critical: VOICE.cedricWelcomeCritical
    },
    returnVoices: VOICE.cedricReturn
  },
  governor: {
    sceneEl: document.getElementById("sceneGovernor"),
    audioKey: "governor",
    welcomeKey: "elloran.oarsRest.governorWelcomePlayed",
    dialogueEl: document.getElementById("governorDialogue"),
    dialogueTextEl: document.getElementById("governorDialogueText"),
    textSpeed: 50,
    continueBtn: document.getElementById("continueGovernorDialogueBtn"),
    portraitSelector: "#governorDialogue .dialogue-portrait",
    welcomeTexts: {
      healthy:
        "Welcome to Governor Hall. My name is Edmund Hawthrone, and I work for the governor. Whether you're here on official business or out of curiosity, I'll do my best to point you in the right direction.",
      wounded:
        "You appear to have had a difficult journey. I'm Edmund Hawthorne, and Governor Hall is open to all lawful visitors, though I recommend finding a surgeon before filing any paperwork.",
      critical:
        "Good heavens. You look as though you've staggered straight from a battlefield. Sit down before you collapse and create more paperwork for all of us. My name is Edmund Hawthorne."
    },
    welcomeVoices: {
      healthy: VOICE.governorWelcomeHealthy,
      wounded: VOICE.governorWelcomeWounded,
      critical: VOICE.governorWelcomeCritical
    },
    guardWelcomeTexts: {
      healthy:
        "I'm Garrick Stone, Captain of the Harbor Watch. The Governor's time is valuable. State your business clearly, and we'll ensure it reaches the right ears.",
      wounded:
        "You've taken some damage, friend. Sit down before you fall down. I'm Captain Garrick Stone. Whatever brought you here can wait a minute.",
      critical:
        "I'm Captain Garrick Stone, leader of the harbor guard. Don't try to speak. Stay standing if you can. And if you can't, don't. A medic is needed now."
    },

    guardWelcomeVoices: {
      healthy: VOICE.governorGuardWelcomeHealthy,
      wounded: VOICE.governorGuardWelcomeWounded,
      critical: VOICE.governorGuardWelcomeCritical
    },
    returnVoices: VOICE.governorReturn
  },
  underground: {
    sceneEl: document.getElementById("sceneUnderground"),
    audioKey: "underground",
    welcomeKey: "elloran.oarsRest.undergroundWelcomePlayed",
    dialogueEl: document.getElementById("undergroundDialogue"),
    dialogueTextEl: document.getElementById("undergroundDialogueText"),
    textSpeed: 60,
    continueBtn: document.getElementById("continueUndergroundDialogueBtn"),
    portraitSelector: "#undergroundDialogue .dialogue-portrait",
    welcomeTexts: {
      healthy:
        "Interesting. A traveler with enough coin to reach Oar's Rest and enough curiosity to find their way down here. Most call me The Broker. And that will do for now.",
      wounded:
        "I've seen sailors arrive in better condition, and I've buried plenty who arrived worse. Either way, you're here now. That means you're still potentially useful.",
      critical:
        "You appear to be negotiating with death, stranger. I suggest concluding those negotiations in your favor before asking me any difficult questions."
    },
    welcomeVoices: {
      healthy: VOICE.sashaWelcomeHealthy,
      wounded: VOICE.sashaWelcomeWounded,
      critical: VOICE.sashaWelcomeCritical
    },
    returnVoices: VOICE.sashaReturn
  }
};

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function redirectToTitle() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.location.href = "/h1-title-page";
}

async function apiGet(path) {
  const token = getAuthToken();

  if (!token) {
    redirectToTitle();
    return null;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    redirectToTitle();
    return null;
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

async function apiPost(path, body = {}) {
  const token = getAuthToken();

  if (!token) {
    redirectToTitle();
    return null;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (res.status === 401) {
    redirectToTitle();
    return null;
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

function lockScene(config) {
  config.sceneEl?.classList.add("intro-locked");
  interactionLocked = true;
}

function validateLocation(player) {
  if (player.regions_id !== REQUIRED_REGION_ID) {
    window.location.href = "/h8-player-hub";
    return false;
  }

  return true;
}

function hideLoadingVeil() {
  loadingVeil.classList.add("hidden");
}

function pulseHud() {
  [hudHpCard, hudDragonCard, hudCsCard].forEach((el) => {
    if (!el) return;

    el.classList.remove("hud-updated");
    void el.offsetWidth;
    el.classList.add("hud-updated");
  });
}

async function loadPlayerHud() {
  try {
    const data = await apiGet("/players/me");
    if (!data) return;

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const player = data.player || data;
    const dragon = data.active_dragon || player.active_dragon || null;

    window.playerData = player;
    window.activeDragonData = dragon;

    if (!validateLocation(player)) return;

    const playerHpCurrent = player.hp_current ?? 0;
    const playerHpMax = player.hp_max ?? 0;
    const playerHpPct =
      playerHpMax > 0 ? (playerHpCurrent / playerHpMax) * 100 : 0;

    hudHpText.textContent = `${playerHpCurrent} / ${playerHpMax}`;
    hudHpFill.style.width = `${Math.max(0, Math.min(100, playerHpPct))}%`;

    if (dragon) {
      const dragonHpCurrent = dragon.hp_current ?? 0;
      const dragonHpMax = dragon.hp_max ?? 0;
      const dragonHpPct =
        dragonHpMax > 0 ? (dragonHpCurrent / dragonHpMax) * 100 : 0;

      hudDragonText.textContent = `${dragonHpCurrent} / ${dragonHpMax}`;
      hudDragonFill.style.width = `${Math.max(0, Math.min(100, dragonHpPct))}%`;
    } else {
      hudDragonText.textContent = "—";
      hudDragonFill.style.width = "0%";
    }

    hudCsText.textContent = player.celestial_silver ?? 0;

    pulseHud();
  } catch (err) {
    console.error("Failed to load player HUD:", err);
  }

  hideLoadingVeil();
}

function getPlayerCondition() {
  const player = window.playerData;

  if (!player || !player.hp_max) {
    return "healthy";
  }

  const hpPct = (player.hp_current / player.hp_max) * 100;

  if (hpPct <= 35) return "critical";
  if (hpPct <= 64) return "wounded";
  return "healthy";
}

function playClickSfx() {
  const click = SFX.click.cloneNode();
  click.volume = SFX.click.volume;
  click.play().catch(() => {
    console.warn("Click SFX was blocked.");
  });
}

function playRestSfx() {
  SFX.rest.currentTime = 0;
  SFX.rest.play().catch(() => {
    console.warn("Rest SFX was blocked.");
  });
}

function fadeAudioIn(audio, targetVolume = 0.4) {
  audio.play().catch(() => {
    console.warn("Audio play was blocked until user interaction.");
  });

  clearInterval(audio._fadeTimer);

  audio._fadeTimer = setInterval(() => {
    audio.volume = Math.min(targetVolume, audio.volume + 0.03);

    if (audio.volume >= targetVolume) {
      clearInterval(audio._fadeTimer);
    }
  }, 80);
}

function fadeAudioOut(audio) {
  clearInterval(audio._fadeTimer);

  audio._fadeTimer = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - 0.03);

    if (audio.volume <= 0) {
      clearInterval(audio._fadeTimer);
      audio.pause();
      audio.currentTime = 0;
    }
  }, 80);
}

function playSceneAudio(sceneName) {
  Object.keys(AUDIO).forEach((key) => {
    if (key === sceneName) {
      fadeAudioIn(AUDIO[key], 0.4);
    } else {
      fadeAudioOut(AUDIO[key]);
    }
  });

  startAmbientSfx(sceneName);
}

function startAmbientSfx(sceneName) {
  stopAmbientSfx();
  currentAmbientScene = sceneName;
  scheduleNextAmbientSfx();
}

function stopAmbientSfx() {
  if (ambientSfxTimer) {
    clearTimeout(ambientSfxTimer);
    ambientSfxTimer = null;
  }

  currentAmbientScene = null;
}

function scheduleNextAmbientSfx() {
  const delay = randomBetween(6500, 16000);

  ambientSfxTimer = setTimeout(() => {
    playRandomAmbientSfx();
    scheduleNextAmbientSfx();
  }, delay);
}

function playRandomAmbientSfx() {
  if (!currentAmbientScene) return;

  const pool = AMBIENT_SFX[currentAmbientScene];
  if (!pool || pool.length === 0) return;

  const source = randomFrom(pool);
  const sound = source.cloneNode();

  sound.volume = source.volume;
  sound.play().catch(() => {
    console.warn("Ambient SFX was blocked.");
  });
}

function playVoice(audio, options = {}) {
  if (!audio) return;

  const { lock = true, unlockOnEnd = true, portraitSelector = null } = options;

  if (lock) {
    interactionLocked = true;
  }

  if (currentVoice) {
    currentVoice.pause();
    currentVoice.currentTime = 0;
  }

  currentVoice = audio;

  const portrait = portraitSelector
    ? document.querySelector(portraitSelector)
    : null;

  portrait?.classList.add("is-speaking");

  audio.currentTime = 0;

  audio.play().catch(() => {
    console.warn("Voiceover was blocked.");

    portrait?.classList.remove("is-speaking");

    if (lock && unlockOnEnd) {
      interactionLocked = false;
    }
  });

  audio.onended = () => {
    portrait?.classList.remove("is-speaking");

    if (lock && unlockOnEnd) {
      interactionLocked = false;
    }
  };
}

function playRandomVoice(pool, options = {}) {
  if (!pool || pool.length === 0) return;

  const selected = randomFrom(pool);
  playVoice(selected, options);
}

function typeText(element, text, speed = 38, onComplete = null) {
  if (!element) return;

  clearInterval(typingTimer);

  element.textContent = "";
  element.classList.add("typing");

  let index = 0;

  typingTimer = setInterval(() => {
    element.textContent += text.charAt(index);
    index++;

    if (index >= text.length) {
      clearInterval(typingTimer);
      element.classList.remove("typing");

      if (typeof onComplete === "function") {
        onComplete();
      }
    }
  }, speed);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showSceneIntro(sceneName) {
  const data = SCENE_INFO[sceneName];
  if (!data) return;

  sceneIntroTitle.textContent = data.title;
  sceneIntro.classList.add("is-visible");

  setTimeout(() => {
    sceneIntro.classList.remove("is-visible");
  }, 1200);
}

function updateSceneInfo(sceneName) {
  const data = SCENE_INFO[sceneName];
  if (!data) return;

  locationTitle.textContent = data.title;
  locationSubtitle.textContent = data.subtitle;
}

function hideAllScenes() {
  Object.values(SCENE_CONFIG).forEach((config) => {
    config.sceneEl?.classList.remove("is-active");
  });
}

function hideAllDialogueBoxes() {
  Object.values(SCENE_CONFIG).forEach((config) => {
    if (!config.dialogueEl) return;

    config.dialogueEl.classList.remove("is-visible");
    config.dialogueEl.classList.remove("is-minimized");
  });
}

function lockScene(config) {
  config.sceneEl?.classList.add("intro-locked");
  interactionLocked = true;
}

function unlockScene(config) {
  config.sceneEl?.classList.remove("intro-locked");
  interactionLocked = false;
}

function hasWelcomePlayed(config) {
  if (!config.welcomeKey) return true;
  return localStorage.getItem(config.welcomeKey) === "true";
}

function markWelcomePlayed(config) {
  if (!config.welcomeKey) return;
  localStorage.setItem(config.welcomeKey, "true");
}

function showNpcWelcome(sceneName) {
  const config = SCENE_CONFIG[sceneName];
  if (!config || !config.dialogueEl || !config.dialogueTextEl) return;

  const condition = getPlayerCondition();
  const text = config.welcomeTexts?.[condition];
  const voice = config.welcomeVoices?.[condition];
  const controls = config.dialogueEl.querySelector(".dialogue-controls");

  if (!text) return;

  if (sceneName === "governor") {
    governorIntroStage = 0;
    setGovernorNpc("clerk");
  }

  lockScene(config);

  config.dialogueEl.classList.remove("is-minimized");
  config.dialogueEl.classList.add("is-visible");

  controls?.classList.remove("is-visible");

  playVoice(voice, {
    lock: true,
    unlockOnEnd: false,
    portraitSelector: config.portraitSelector
  });

  typeText(config.dialogueTextEl, text, config.textSpeed || 75, () => {
    controls?.classList.add("is-visible");
  });
}

function minimizeNpcDialogue(sceneName) {
  const config = SCENE_CONFIG[sceneName];
  if (!config || !config.dialogueEl) return;

  config.dialogueEl.classList.remove("is-visible");

  setTimeout(() => {
    config.dialogueEl.classList.add("is-minimized");
    config.dialogueEl.classList.add("is-visible");
    unlockScene(config);
  }, 180);
}

function showNpcMinimized(sceneName) {
  const config = SCENE_CONFIG[sceneName];
  if (!config || !config.dialogueEl) return;

  config.dialogueEl.classList.add("is-minimized");
  config.dialogueEl.classList.add("is-visible");
  unlockScene(config);
}

function setGovernorNpc(npcKey) {
  const npc = GOVERNOR_NPCS[npcKey] || GOVERNOR_NPCS.clerk;
  const box = document.getElementById("governorDialogue");
  if (!box) return;

  const nameEl = box.querySelector(".dialogue-name");
  const imgEl = box.querySelector(".dialogue-portrait img");

  nameEl?.classList.add("npc-swapping");
  imgEl?.classList.add("npc-swapping");

  setTimeout(() => {
    if (nameEl) nameEl.textContent = npc.name;

    if (imgEl) {
      imgEl.src = npc.portrait;
      imgEl.alt = npc.name;
    }

    requestAnimationFrame(() => {
      nameEl?.classList.remove("npc-swapping");
      imgEl?.classList.remove("npc-swapping");
    });
  }, 220);
}

function restoreGovernorClerk() {
  setGovernorNpc("clerk");
}

function handleSceneWelcome(sceneName) {
  const config = SCENE_CONFIG[sceneName];

  if (!config || !config.welcomeKey) {
    return;
  }

  if (!hasWelcomePlayed(config)) {
    showNpcWelcome(sceneName);
    return;
  }

  showNpcMinimized(sceneName);

  if (sceneName === "governor") {
    const speakerKey = Math.random() < 0.5 ? "clerk" : "guardCaptain";

    setGovernorNpc(speakerKey);

    const returnPool =
      speakerKey === "guardCaptain"
        ? VOICE.governorGuardReturn
        : VOICE.governorReturn;

    playRandomVoice(returnPool, {
      lock: true,
      unlockOnEnd: true,
      portraitSelector: config.portraitSelector
    });

    return;
  }

  if (config.returnVoices) {
    playRandomVoice(config.returnVoices, {
      lock: true,
      unlockOnEnd: true,
      portraitSelector: config.portraitSelector
    });
  }
}

function switchScene(sceneName) {
  if (interactionLocked) return;

  const config = SCENE_CONFIG[sceneName];
  if (!config) return;

  sceneFade.classList.add("is-fading");

  setTimeout(() => {
    hideAllScenes();
    hideAllDialogueBoxes();

    actionPanel.classList.remove("is-open");

    config.sceneEl.classList.add("is-active");

    playSceneAudio(config.audioKey);
    showSceneIntro(sceneName);

    setTimeout(() => {
      sceneFade.classList.remove("is-fading");
      updateSceneInfo(sceneName);
      handleSceneWelcome(sceneName);
    }, 120);
  }, 800);
}

function renderActionPanel(sceneName, actionKey, isReturn = false) {
  const data = SCENE_ACTIONS[sceneName]?.[actionKey];
  if (!data) return;

  if (!isReturn && data.voicePool) {
    playRandomVoice(data.voicePool, {
      lock: true,
      unlockOnEnd: true,
      portraitSelector: SCENE_CONFIG[sceneName]?.portraitSelector
    });
  }

  if (sceneName === "governor") {
    setGovernorNpc(data.npc === "guardCaptain" ? "guardCaptain" : "clerk");
  }

  actionTitle.textContent = data.title;
  actionText.textContent = data.text;
  actionOptions.innerHTML = "";

  data.options.forEach((optionText) => {
    const button = document.createElement("button");
    button.className = "location-btn";
    button.textContent = optionText;

    button.addEventListener("click", () => {
      if (interactionLocked) return;

      playClickSfx();
      handleActionOption(sceneName, actionKey, optionText);
    });

    actionOptions.appendChild(button);
  });

  actionPanel.classList.add("is-open");
}

function handleActionOption(sceneName, actionKey, optionText) {
  if (isLeaveOption(optionText)) {
    actionPanel.classList.remove("is-open");

    if (sceneName === "governor" && actionKey === "guard") {
      restoreGovernorClerk();
      showNpcMinimized("governor");
    }

    return;
  }

  if (optionText === "Speak with Alwen") {
    openDialogueState("alwen_intro");
    return;
  }

  openPlaceholderFlow(optionText);
}

function isLeaveOption(optionText) {
  return optionText.startsWith("Leave ") || optionText === "Step Away";
}

function openPlaceholderFlow(optionText) {
  const flow = PLACEHOLDER_FLOWS[optionText];

  if (!flow) {
    actionTitle.textContent = optionText;
    actionText.textContent = "This interaction will be expanded later.";
    actionOptions.innerHTML = "";

    const backButton = document.createElement("button");
    backButton.className = "location-btn";
    backButton.textContent = "Back";

    backButton.addEventListener("click", () => {
      if (interactionLocked) return;
      actionPanel.classList.remove("is-open");
    });

    actionOptions.appendChild(backButton);
    actionPanel.classList.add("is-open");
    return;
  }

  actionTitle.textContent = flow.title;
  actionText.textContent = flow.text;
  actionOptions.innerHTML = "";

  flow.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "location-btn";
    button.textContent = option;

    button.addEventListener("click", () => {
      if (interactionLocked) return;

      playClickSfx();

      if (option === "Back to Counter") {
        renderActionPanel("tavern", "counter", true);
        return;
      }

      if (option === "Back to Tables") {
        renderActionPanel("tavern", "rumors", true);
        return;
      }

      if (option === "Back to Board") {
        renderActionPanel("tavern", "notice-board", true);
        return;
      }

      if (option === "Back to Stairs") {
        renderActionPanel("tavern", "rest", true);
        return;
      }

      if (option === "Sleep") {
        restUntilMorning();
        return;
      }
      if (option === "Back to Route Board") {
        renderActionPanel("docks", "routes", true);
        return;
      }

      if (option === "Back to Ship Pier") {
        renderActionPanel("docks", "ship", true);
        return;
      }

      if (option === "Back to Cargo Dock") {
        renderActionPanel("docks", "cargo", true);
        return;
      }

      if (option === "Back to Harbor Master") {
        renderActionPanel("docks", "harbor-master", true);
        return;
      }
      if (option === "Back to Provisioners") {
        renderActionPanel("market", "produce", true);
        return;
      }

      if (option === "Back to Arms & Armor") {
        renderActionPanel("market", "weapons", true);
        return;
      }

      if (option === "Back to Rare Goods") {
        renderActionPanel("market", "curios", true);
        return;
      }
      if (option === "Back to Bounty Board") {
        renderActionPanel("post", "bounties", true);
        return;
      }

      if (option === "Back to Missing Persons") {
        renderActionPanel("post", "missing", true);
        return;
      }

      if (option === "Back to Shipping Records") {
        renderActionPanel("post", "records", true);
        return;
      }

      if (option === "Back to Postmaster") {
        renderActionPanel("post", "postmaster", true);
        return;
      }

      if (option === "Back to Sealed Door") {
        renderActionPanel("underground", "door", true);
        return;
      }

      if (option === "Back to The Broker") {
        renderActionPanel("underground", "contact", true);
        return;
      }

      if (option === "Back to Marked Crates") {
        renderActionPanel("underground", "crates", true);
        return;
      }

      openPlaceholderFlow(option);
    });

    actionOptions.appendChild(button);
  });

  actionPanel.classList.add("is-open");
}

function openDialogueState(stateId) {
  const state = DIALOGUE_STATES[stateId];
  if (!state) return;

  actionTitle.textContent = state.speaker;
  actionText.textContent = state.text;
  actionOptions.innerHTML = "";

  state.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "location-btn";
    button.textContent = option.text;

    button.addEventListener("click", () => {
      if (interactionLocked) return;

      playClickSfx();
      openDialogueState(option.next);
    });

    actionOptions.appendChild(button);
  });

  actionPanel.classList.add("is-open");
}

async function restUntilMorning() {
  if (interactionLocked) return;

  interactionLocked = true;
  actionPanel.classList.remove("is-open");
  sceneFade.classList.add("is-fading");

  try {
    await new Promise((resolve) => setTimeout(resolve, 700));

    playRestSfx();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const data = await apiPost("/players/me/rest");

    if (!data || !data.success) {
      throw new Error("Rest failed.");
    }

    hudHpFill.textContent = `HP: ${data.player_hp_after ?? 0} / ${
      window.playerData.hp_max ?? 0
    }`;
    hudDragonFill.textContent = `Dragon: ${data.dragon_hp_after ?? 0} / ${
      window.activeDragonData?.hp_max ?? data.dragon_hp_after ?? 0
    }`;

    if (window.playerData) {
      window.playerData.hp_current = data.player_hp_after;
    }

    if (window.activeDragonData) {
      window.activeDragonData.hp_current = data.dragon_hp_after;
    }

    pulseHud();

    setTimeout(() => {
      sceneFade.classList.remove("is-fading");
      interactionLocked = false;
      showRestSummary();
    }, 900);
  } catch (err) {
    console.error("Failed to rest:", err);
    sceneFade.classList.remove("is-fading");
    interactionLocked = false;
  }
}

function showRestSummary() {
  updateActionPanelContent(
    "You Rested Until Morning",
    "Warm morning light slips through the tavern window. Your wounds have eased, your thoughts feel clearer, and even the ship outside seems quieter than before.",
    () => {
      const button = document.createElement("button");
      button.className = "location-btn";
      button.textContent = "Return Downstairs";

      button.addEventListener("click", () => {
        playClickSfx();
        actionPanel.classList.remove("is-open");
        renderActionPanel("tavern", "rest", true);
      });

      actionOptions.appendChild(button);
    }
  );

  actionPanel.classList.add("is-open");
}

function updateActionPanelContent(title, text, renderOptions) {
  actionPanel.classList.add("content-changing");

  setTimeout(() => {
    actionTitle.textContent = title;
    actionText.textContent = text;
    actionOptions.innerHTML = "";

    if (typeof renderOptions === "function") {
      renderOptions();
    }

    actionPanel.classList.remove("content-changing");
  }, 120);
}

function bindSceneButtons() {
  document.querySelectorAll("[data-scene]").forEach((button) => {
    button.addEventListener("click", () => {
      if (interactionLocked) return;

      playClickSfx();
      switchScene(button.dataset.scene);
    });
  });
}

function bindActionButtons() {
  const bindings = [
    { selector: "[data-action]", sceneName: "tavern", attr: "action" },
    {
      selector: "[data-market-action]",
      sceneName: "market",
      attr: "marketAction"
    },
    {
      selector: "[data-docks-action]",
      sceneName: "docks",
      attr: "docksAction"
    },
    { selector: "[data-post-action]", sceneName: "post", attr: "postAction" },
    {
      selector: "[data-governor-action]",
      sceneName: "governor",
      attr: "governorAction"
    },
    {
      selector: "[data-underground-action]",
      sceneName: "underground",
      attr: "undergroundAction"
    }
  ];

  bindings.forEach((binding) => {
    document.querySelectorAll(binding.selector).forEach((button) => {
      button.addEventListener("click", () => {
        if (interactionLocked) return;

        playClickSfx();
        renderActionPanel(binding.sceneName, button.dataset[binding.attr]);
      });
    });
  });
}

function bindNpcContinueButtons() {
  Object.entries(SCENE_CONFIG).forEach(([sceneName, config]) => {
    if (!config.continueBtn) return;

    config.continueBtn.addEventListener("click", () => {
      playClickSfx();

      if (sceneName === "governor" && governorIntroStage === 0) {
        const condition = getPlayerCondition();
        const guardText = config.guardWelcomeTexts?.[condition];
        const guardVoice = config.guardWelcomeVoices?.[condition];
        const controls = config.dialogueEl.querySelector(".dialogue-controls");

        governorIntroStage = 1;

        controls?.classList.remove("is-visible");
        setGovernorNpc("guardCaptain");

        playVoice(guardVoice, {
          lock: true,
          unlockOnEnd: false,
          portraitSelector: config.portraitSelector
        });

        setTimeout(() => {
          typeText(
            config.dialogueTextEl,
            guardText,
            config.textSpeed || 75,
            () => {
              controls?.classList.add("is-visible");
            }
          );
        }, 260);

        return;
      }

      if (sceneName === "governor" && governorIntroStage === 1) {
        markWelcomePlayed(config);
        governorIntroStage = 0;
        restoreGovernorClerk();
        minimizeNpcDialogue(sceneName);
        return;
      }

      markWelcomePlayed(config);
      minimizeNpcDialogue(sceneName);
    });
  });
}

function bindUtilityButtons() {
  // debugHotspotsBtn.addEventListener("click", () => {
  //   document.body.classList.toggle("debug-hotspots");
  // });

  closeActionPanel.addEventListener("click", () => {
    if (interactionLocked) return;

    actionPanel.classList.remove("is-open");

    if (
      document.getElementById("sceneGovernor")?.classList.contains("is-active")
    ) {
      restoreGovernorClerk();
      showNpcMinimized("governor");
    }
  });

  enterLocationBtn.addEventListener("click", () => {
    startOverlay.style.display = "none";
    AUDIO.port.volume = 0.12;
    playSceneAudio("port");
  });

  const directoryBtn = document.getElementById("directoryBtn");
  if (directoryBtn) {
    directoryBtn.addEventListener("click", () => {
      alert("Port Directory will open here.");
    });
  }
}

function initLocationPage() {
  bindSceneButtons();
  bindActionButtons();
  bindNpcContinueButtons();
  bindUtilityButtons();
  loadPlayerHud();
}

initLocationPage();
