# ACCRETION 4.0.0: Orbital Command

Extract the complete ZIP and open `index.html`. All solo modes work offline. No image assets, CDN, build process or server are needed. The optional private multiplayer arena is described in `MULTIPLAYER.html` and `backend/README.md`.

## Adaptations and skill trees

**U: Adaptations.** The eighteen original adaptations retain their card presentation, ranks and effects. Each rank costs one adaptation point and no research. Earn a point once at halfway and once at a full evolution bar. Old installed ranks remain installed.

**K: Engineering.** Forty-four installations form connected, deterministic skill trees, with selectable nodes, prerequisite links, rank markers and a requirements inspector. Five main branches are Mining, Science, Attack, Defense and Speed. Energy, Cosmetics and Orbital Systems are side branches. Zoom the tree independently of the world.

Branches open at Moon scale. Mining's initial station is free. Build the Research Centre for 25 Raw Material; refine 50 raw into one RP over eighteen powered simulation seconds. Engineering uses RP, not AP. Most ranks cost one RP, rising to two from the third rank or after ten powered research minutes. Explicit advanced nodes also cost two RP. Science, class and installed-rank requirements still apply. The power, battery and overclock system is retained.

Orbital Systems requires Stellar engineering. Guardian assembly costs 80 raw and 0.3% of your core mass, has a 35-second cooldown and up to four slots. A black hole also needs Galactic architecture; each stellar guardian then costs 200 raw and 0.5% of core mass. These are simulated bodies with physical orbits. Stable guardians divert a bounded share of damage into their own mass and produce recoverable debris. They can lose stability or be stolen. Guardian belts and armor extend this system. Decorative follower worlds remain separate and toggleable.

## Aimed equipment

The small command strip leaves the original boost controls visible. WASD, arrows, Shift brake and Space boost are unchanged.

- **X:** toggle aimed weapons. Hold the left mouse button to fire installed turrets and attack lasers. Shots collide with actual intervening rocks or enemies.
- **Z:** drone orders. Click a rock or an area to prioritize mining there. Loaded miners finish delivering their cargo.
- **I:** personal mining laser, after Mining lasers is installed. Hold the left button to cut real material. Heat locks the beam until it cools; power remains necessary.
- Select **Flight** to return mouse input to ordinary flight behavior.
- **T:** quick signals; Use Edit signals in the quick-signal panel to edit four saved signals. **Y:** send the first saved signal. Text, local images/GIFs and four bubble shapes are supported. Images are optional and bounded. Other players' images are hidden unless enabled in Settings.

The laser dependency remains Science optics → Attack lasers → Mining lasers. Horizon extraction additionally requires Mining lasers rank 2 and Stellar engineering. It strips finite outer-disk packets from a black hole and creates raw-material crates. An empty accretion disk yields nothing; it does not extract the black hole's core mass.

## Places and appearances

Stellar fields favor a few host stars with physically orbiting planets, moons and finite asteroid belts. At galactic scale, a few black-hole primaries host stellar systems with nested worlds. Old nearby bodies are retained through normal progression. Galaxies use limited simulated stars plus distant density structure; they are not thousands of individual physics bodies.

The planet renderer now uses spherical texture projection, richer procedural terrain, cloud drift and cached directional shading. Station hardware has pressure modules, trusses, solar wings, habitation rings, docking structures, research equipment and battery banks. Installed branches have distinct machinery. Gravastars have an animated opaque shell and surface waves. Nebula wisps use cached turbulent density textures driven by actual gas-cell positions and remaining mass. The previous distinct procedural black-hole designs, moving disks, lensing and Interstallar remain in use.

## Game modes

- **Evolution journey:** the full original progression, nine rivals, companions, achievements and three save slots. Hardcore retains its 50% cohesion and rarer, richer raw/DNA/water caches.
- **Boss gauntlet:** a separate Moon-scale run with starter equipment and three bosses. Each has a visible warning before a radial pulse, directed beam or gravitational pull. Mine and research between waves. Rewards are finite and each defeat counts once.
- **Salvage expedition:** a separate run to survey three sites and deliver 300 actual raw material to a moving depot. Match its speed to unload.
- **Sandbox:** all normal and supernova classes, scale-aware mass edits, add/remove AP/RP/raw/water/DNA, unlock equipment, gravity/time/density controls, spawning/rival/damage/collision switches, and placement of planets, stars, black holes, solar systems, galaxies, belts and nebulae.
- **Multiplayer arena:** optional, server-authoritative shared gravity and combat. Its scope and backend setup are documented separately. It does not overwrite campaign saves.

## Settings and performance

All resolution/performance controls are at the bottom of Settings. Select automatic/native rendering or 360p, 540p, 720p, 900p, 1080p, 1440p or 2160p. The FPS slider offers 30–240 FPS in five-frame steps, followed by **Unlimited**. This is a ceiling, not a promised frame rate. Display refresh and hardware still apply. Fixed-step physics remains 60 Hz.

CPU budget reduces entity budgets and visual detail. Shader mode controls lensing and horizon quality; texture and gas detail are independently adjustable. Adaptive detail remains available. Animation switches cover surfaces, clouds, horizons, nebula drift, machinery, companions, event sequences and signal images. Turning off a decorative animation does not freeze physically orbiting bodies or stop matter transfer. Reduced Motion overrides decorative animation switches.

The game continues to use one requestAnimationFrame loop, fixed-step simulation, pooled particles/projectiles, a spatial hash, distance culling, cached surfaces and bounded orbit/gas populations. Restarts replace scene state rather than adding loops or input listeners.

## Architecture for future contributors

All production scripts remain ordered classic scripts sharing `window.AC`. `command.js` defines modes, aiming and scenario state before `save.js`; `command-rendering.js` extends existing procedural renderers; `command-ui.js` extends existing UI; `multiplayer.js` is the optional transport before `game.js`. Offline code uses no fetch, workers, ES modules or external runtime libraries. The socket is opened only by Connect.

Run schema remains version 6 with optional validated command/guardian state. Vault version 2 gains isolated scenario slots. Settings are shared, while materials, records and achievements from experimental/scenario modes are kept out of ordinary journeys. Original save migration remains in `save.js`. Browser storage behavior for file URLs still depends on the browser; keep the same browser profile and folder when updating.

Open `tests/run-all.html` for the included diagnostic page. See `TEST_REPORT.md` for actual validation results and limitations.

© 2026 Web Stars Studios. Source remains under the included MIT license.
