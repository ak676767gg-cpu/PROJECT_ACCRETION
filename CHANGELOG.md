# 4.0.0 · Orbital Command

Connected engineering trees; separate original adaptations; new aimed weapons, drone orders and personal/horizon mining; guardian systems; structured stellar/galactic fields; richer procedural planet, station, gravastar and nebula rendering; Boss and Salvage modes; expanded Sandbox; local custom signals; optional private multiplayer backend; granular animation/performance controls; FPS cap through 240 then Unlimited. See ORBITAL_COMMAND.md and TEST_REPORT.md for exact scope and validation.

# 3.9.2 · Hardcore Raw Material caches · 7 October 2026

- Replaced direct Research Point rewards in rare Hardcore caches with 50, 100 or 150 extra Raw Material at planetary, stellar and compact/galactic scales.
- Preserved water/DNA amounts, 50% cohesion, spawn scarcity, copyright and all ordinary research/engineering requirements.
- Reused existing mining storage and lifetime raw counters. Research Points now require the Research Centre’s existing timed 50-Raw recipe.
- Carried the finite Raw Material payload through absorption, escaped parcels, fragments, full-pool drone/crate cargo, save/load and pooled-body reset.
- Migrated unclaimed 3.9.1 RP payloads once at 50 Raw Material per prior point; already-earned inventory balances remain untouched.
- Updated HUD/scanner, manual, settings and isolated tests. Production aggregate: 271 pass, zero fail, 15 explicitly unverified browser/device checks. Hardcore integration: 17/17, plus a successful actual 3.9.1-vault migration.

# 3.9.1 · Hardcore Frontier · 7 October 2026

- Added Hardcore for new journeys with 50% cohesion across initialization, regeneration, evolution, all Supernova routes, save restore, Sandbox and the final merger.
- Added progressive scarcity for new planets/world candidates and comparable ambient bodies; kept existing captured worlds, physically formed/shed matter, belts and nine rivals.
- Added marked Hardcore-only finite caches: extra DNA/water plus 1–3 Research Points, scaled with stage. Preserved payloads through packets, escape, fragmentation, full-pool cargo and save/load; no duplicate collection or other-mode RP bonus.
- Added © 2026 Web Stars Studios to menu, credits, support pages and source copyright notices while retaining MIT and contributor attribution.
- Added twelve isolated physics/cache checks and seventeen production integration checks. Core aggregate: 267 pass, 0 fail, 15 unverified. Offline architecture and ordered scripts are unchanged.

# 3.8.0 · The Final Interstallar

- Added a persistent, seeded final horizon with approach zones, readable warnings, defended cohesion stress, finite swallowed-matter accounting and an optional ten-second merger. Flight continues after the mass-sum milestone.
- Replaced black-hole artwork across the existing classes with original ray-based disks, primary/secondary lens images, bounded feeding, differential striations and gradual disk growth. Added baked, CPU-map and optional WebGL tiers with fallback and hysteresis.
- Integrated instrument 8, gold chart/beacon, five connected advancements, approach records, independent slot/Sandbox state, guarded merger restoration, afterglow choices and 1×/2× local PNG export.
- Extended the existing procedural audio with a proximity bed, quiet zone/pulse/merger cues and a pause-aware cue bus. Kept all existing synthesis, controls and preferences.
- Reused projection output vectors for background stars, galaxy tracers, gas and trails. A production-method microbenchmark measured fewer logical vector allocations and about 26% lower median time; this is not a whole-game FPS claim.
- Cached detailed null-ray contour geometry once and cropped its transparent bounds, reducing the final 1024 px T1 component median from 8.650 ms baseline to 7.300 ms in a matched native-Canvas pair. Retained motion with sparse advected filaments.
- Limited richer rival black-hole drawing to two per frame, retained labels and marker silhouettes for the others, reused the measured weak-field lens map and invalidated gas caches only when projected lenses move.
- Added an offline private-reference lab, aggregate isolated runner, integration checks, migration/round-trip/pacing evidence, numerical fidelity measurements and matched software-Canvas performance results.
- Preserved the 22 classes, routes, 50 companions, disclosed wheel economy, 18 adaptations, nine rivals, six earned themes, three slots and existing galactic encounter. No runtime dependency, extra loop, network request or public deployment.
- Verification reached production logic/software Canvas. Real browser/GPU behavior remains unexecuted because Chromium exited before loading a page. The asymmetric reference gap and radial profile are not reproduced exactly; performance exceptions are recorded in TEST_REPORT.md.

# 3.7.0 · Galactic interface

- Unified interface themes and advancement frames in one Settings selector; reused all six earned palettes, migrated prior frame choices, and kept body/companion cosmetics in Appearance.
- Refined gameplay rails, panels, buttons, settings groups, save cards, archives, observatory, menus, dock and chart backgrounds. Retained the compact plaque size, F-only dock, controls, dotted forecast and centered camera.
- Added an optional persistent 7,200-second galactic encounter with four timed phases, coherent core geometry, bridge navigation, actual atlas density, finite rotating gas reserves, funded world/star condensation and mild outer-orbit tides.
- Kept gas capture, delayed assimilation, material conservation and bounded populations in the existing systems. Completion awards once, records a real lifetime counter, and applies journey-only gravity/intake benefits and up to three adaptation points.
- Saved encounter state and finite matter in current checkpoints; minute clock-only persistence preserves the selected world/mass checkpoint cadence. Old saves and separate slots remain compatible.
- Added a measured render FPS readout with correct unclamped timestamps and hidden-tab reset.
- Removed competing stage/progress writers. Selected routes retain their actual class, goal and caption across UI refreshes, mass loss, saves and completed paths.
- Fixed Appearance's pre-flight body initialization. Refreshed the bundled cosmic and Life Lab diagnostic pages for current path and wheel rules.
- Bounded galaxy rendering, reduced samples/glows in Performance and adaptive detail, and preserved existing spatial hash, pooled matter and particles, surface caches, source limits and single-loop ownership.

# 3.6.0 · Living surfaces

- Added cached longitude-mapped terrain, independent clouds, climate-aware colours, polar ice, atmospheric rims and fixed lighting.
- Added gas/brown-dwarf latitude shear, travelling storms and layered ring lanes; richer stellar granulation, plasma and moving prominences; fine asteroid seams and rotating crater fields.
- Improved nebula filaments, pulsing compact-star beams, the Strange Matter core and matter-dependent black-hole disk motion. The Interstallar's circulating filaments remain active.
- Unified decorative motion with interpolated simulation time, including slow motion, pause, photo and Reduced Motion. Size, orientation and lensing share the position interval.
- Spread surface generation over bounded frame slices, retain existing surfaces during construction and crossfade completed detail. Limit builds, caches and animated neighbours; scale new work with Performance and Adaptive detail.
- Added a separate offline body-animation inspection page. It creates no run or save. Preserved gameplay routes, controls, companions, adaptations, AI, achievements, menus and checkpoint data.

# 3.5.0 · Evolution journeys

- Choosing a path now preserves the current star, movement, health, adaptations and partly filled growth goal. Selection does not immediately explode, grant points or activate remnant buffs.
- Added eight distinct precursor classes across the four routes. Each replaces the regular stellar sequence and leads into the existing remnant progression.
- Path switching unlocks at Massive Star and is available at the starting star stage. The first branch evolution locks the journey; the same button remains as a stage overview.
- Actual supernova effects and remnant abilities occur when the first remnant is reached. Orbital release, matter conversion, audio and achievements follow that physical transition.
- Updated precursor visuals and attainable flight-note goals. Branch progress advances one attained class at a time and survives mass loss.
- Migrated older remnant saves into equivalent reached classes without mass loss, repeated points or repeat transformations. Original save slots, controls, pets and Interstallar ring animation remain.

# 3.4.0 · Supernova paths

- Added a persistent, optional Supernova choice from Massive Star, available in flight and pause. The unchosen stellar path ends at Stellar Colossus; it retains further mass growth.
- Added Singularity, four nebula classes, Small Neutron Star / Magnetar / Strange Matter, and three gravastar classes. All seven existing black-hole classes and The Interstallar remain in the Singularity route. Each remnant tier requires fivefold mass.
- Applied real branch gravity, thrust, speed, collision protection and resistance modifiers. Nebula exerts no gravity and gradually dissolves overlapping coherent bodies and finite gas cells. Strange Matter adds a real conversion field.
- Stored reaction matter in the existing bounded, pooled parcel system. Assimilation is delayed, conserves mass, transfers resources once and reacts to rival theft. Cloud cohesion is vulnerable to gradual rival stripping.
- Added four distinct procedural supernova treatments: inward collapse, expanding cloud filaments, bipolar remnant beams and assembling vacuum shells. The expanding wave actually affects nearby bodies. Added remnant ambient profiles and four procedural cues to the existing audio context.
- Saved route identity, tier, starting mass, class records, partial erosion, stored material and new lifetime counters through the existing three-slot checkpoints. Old compact saves migrate without changing mass or attained class. Added five crests to the existing advancement system.
- Added branch-aware HUD, matter inspection and achievable class goals. New windows use the existing minimization and F dock. Existing controls, AI, companions, upgrades, achievements, camera lock and offline architecture remain.
- Made The Interstallar's ring movement much more visible with brighter travelling arcs, luminous disk heads and stronger differential rotation. Pause, photo mode and Reduced Motion still freeze it.
- Cached route modifiers and tier calculations, skipped cloud gravity work, bounded dissolution sampling and reduced low-priority stream trails according to the Performance setting. Important streams and all physical matter remain simulated.

# 3.3.0 · The Interstallar

- Added The Interstallar as the final named evolution after Ultramassive, plus its achievement in the existing ascent branch. Further mass growth continues within the final class.
- Added original procedural black-hole artwork with a lensed bright upper/lower disk, dark shadow, narrow photon-like ring, amber foreground flow and independently moving filaments. Actual captured matter controls the extra feeding glow.
- Ring motion follows simulation time, respects pause/photo and reduced motion, and uses two bounded cached atlases with fewer filaments in Performance mode.
- Added final-class HUD completion and the class to the existing Sandbox. Preserved the 3.2.1 compact plaques and the existing save format.

# 3.2.1 · Compact achievement popups

- Achievement notification plaques are one-third their previous width and height, including icons, text, borders, and glow.
- Top and bottom placement, earned frame styles, queue timing, reveal animation, and reduced-motion behavior are preserved.

# 3.2.0 · Legacy & Origins

- Added five optional real-orbit blueprint goals to the existing observatory with consecutive holds, health checks and saved completion records.
- Added up to twenty prestige expeditions, recorded retired journeys and three rank-scaled optional promises. Retirement requires star scale plus four different class goals, preserves the slot’s meta collection and safely aborts on storage failure.
- Added eighteen appearance choices, including defaults, using achievement or expedition-rank unlocks. Body sigils, companion gear and selectable plaque frames are cosmetic only and belong to their existing save slot.
- Added a six-mark impact history for important bodies, actual-damage scars and stage-appropriate surface/band/plasma/disk presentation. Evolution and checkpoints preserve it; pools and restarts clear new bodies correctly.
- Added actual-creature hatch sequences for every existing species, longer legendary reveals, procedural cracking/reveal cues, skip/equip/collection controls and reduced-motion handling. Claiming an egg commits its ready result; repeated claims cannot duplicate it.
- Replaced the edge rail with an Apple-inspired glass icon shelf. F is the only opening input. It hides on inactivity, pointer leave or opening a window; hover/focus do not open or pin it. Existing instrument and window shortcuts remain.
- Extended the existing save catalogue to 48 achievements and added blueprint/promise lifetime counters without a second persistence system. Retained all prior classes, rivals, adaptations, companion mechanics, collection, camera and offline scripts.
- Added isolated physics/integration diagnostics and matched dense-scene profiles. See TEST_REPORT.md for the measurements and real-browser verification limits.

# 3.1.1 · Animated advancement reveal

- Replace the short slide/fade with a staged framed silhouette, warm illumination, badge/title reveal, readable hold and gentle exit.
- Use the existing UI clock for every visual phase; menus and cinematics freeze the reveal instead of replaying it.
- Respect game and operating-system reduced motion. Cache identical hold styles to avoid redundant DOM writes.
- Add an isolated offline preview using the production plaque paint method and CSS, without save or gameplay state.
- Retain the 44 achievements, connected menu, notifications, save slots and all gameplay.

# 3.1.0 Cosmic Advancements

- Added 20 milestones to the existing achievement system, bringing the catalogue to 44.
- Added six connected branches, original celestial badges, cross-branch search, earned/locked filters, requirement inspection and keyboard navigation inside the existing Archive.
- Kept personal Records and Journey log as selectable Archive views.
- Added queued task, goal and challenge plaques with short entrance/exit animation and distinct procedural chimes. They wait through menus, cinematic evolution, photo mode and hidden HUD.
- Added J, menu and side-dock access; top/bottom placement and notification opt-out; respected reduced motion and mute.
- Preserved old achievement IDs, per-slot saves, three-evolution checkpoints and sandbox isolation. Silently recognized already attained new class milestones in older records.
- Added checks for milestone conditions, queues, migration, input, audio and restart cleanup. The offline classic-script architecture and collection/camera repairs are retained.

# 3.0.0: Living Frontier

- Continued from 2.4.3, retaining its collection repair, original dotted pointer and centered camera.
- Added eight moving encounter patterns using existing finite bodies, clouds and procedural budgets.
- Added optional per-class journey goals with one-time adaptation rewards and a checkpointed journal.
- Improved personality-based rival routing, world preservation, visible intentions and retaliation persistence.
- Added a selectable orbital diagram and matter-flow view to the existing observatory.
- Replaced timer-only formation decoration with previews of actual eligible disk concentrations.
- Extended Archive achievements and lifetime counters for exploration, goals and dust-born worlds.
- Added procedural motion/feeding layers and new cues to the existing audio system, with pause/mute control.
- Corrected depth for companions, fields, fragments, rings and weather visuals.
- Optimized gravity callbacks, orbital allocations, composition reuse, small-body and particle batching, planetary ring caching, trails and nebula LOD.
- Preserved all classes, rivals, adaptations, pets, wheel prices/odds, menus, local saves and offline ordered scripts.

Previous release notes follow.

## 2.4.3 · Black-hole collection repair

- Preserved finite water/DNA payloads through tidal breakup, delayed delivery and escaped streams. Physical collection and inner-flow delivery cannot duplicate resources.
- Dissipative inner-flow capture and velocity advection prevent boosted black holes from leaving accepted matter behind. Relative motion continues; the six-second delay and gradual feeding rate remain.
- Reserved twelve matter-parcel slots from diffuse gas for coherent bodies; escaped parcels reclaim inactive world slots.
- Restored the original dotted trajectory with a circular endpoint. Retained camera centering, the corrected forecast and viewport clipping.
- Corrected boost exhaust depth and pooled particle reset so effects stay beside the visible source.
- Extended save validation and six isolated physics regressions. Added twelve main-game integration checks covering boosted collection, checkpoints, legacy saves, early-stage behavior, effects, pointer appearance and repeated restarts.

## 2.4.2 · Centered camera and trajectory pointer

- Camera follows the interpolated body on all three axes with no velocity offset or selected-body focus drift. Smooth zoom and free photo camera remain intact; R recenters and resets zoom.
- Shared camera transform for background, lensing, bodies and forecast. Collision shake is capped at six pixels.
- Fixed-step coasting estimate with visible clipped endpoint chevrons, local momentum and thrust markers, and swept relative contact warnings.
- Mouse steering starts at the rendered body and accounts for the tilted projection. Tiny or overlapping field names cannot cover the local pointer.
- Prediction is capped at twelve gravity sources, or six in Performance, with at most six seconds of forecast and fewer rendered samples at low detail.

## 2.4.1 · Smooth flight and workspace dock

- One shared scale-relative flight profile for all astronomical classes; stellar and compact transitions no longer reduce thrust. Existing coasting, braking, boosts, upgrades and gravity remain active.
- Recalibrated gentle orbital assistance for the uniform thrust; planets still have independent motion and boosts can disrupt them.
- Seven individually minimized HUD instruments, 1–7 shortcuts and per-slot checkpointed layouts.
- Right-edge sliding dock with pointer auto-hide, keyboard focus support, reduced-motion support, instrument restoration and shortcuts to retained windows.
- Backtick / Minimize returns a window to flight; its normal shortcut and the dock reopen it without spending pending adaptation points.
- Restart clears transient dock state without installing extra loops or listeners. Offline diagnostic pages updated with the current interface.

# 2.4.0 ; Expedition systems

- Persistent sector chart, course selection, finite exploitation and last-observed rivals.
- Two-fork pet evolution with experience, procedural forms and concrete buffs.
- Composition-based planetary density, mass-weighted mixing and impact resilience.
- Moving stellar habitable annuli, climate estimates and atmospheric weather effects.
- Observed orbital-period relationships and conditional resonance bonuses.
- Rare magnetar visitors and forecast, propagating stellar waves.
- Separately saved sandbox with experimental classes and physical test encounters.
- Bounded encounter recording, seekable playback and game-over persistence.
- Frozen photo camera with local PNG export and restored state.
- Extended profile/run validation, isolated tests and bounded performance settings.
- Kept replay browsing within its selected save; moved the chart shortcut above flight controls and added distinct specialization silhouettes.

# 2.3.0: Publication review build

- Replaced generic hero and menu wording with concrete gameplay and control descriptions.
- Removed promotional AI credits. Preserved source license notices and the existing offline architecture.
- Added local SVG and ICO favicons; distinct page titles and descriptions.
- Added factual offline Privacy and Terms pages, cited Sources, and a custom 404 page.
- Added prelaunch robots.txt, llms.txt and an explicitly inactive sitemap.xml. No invented domain or contact information.
- Kept public release blocked pending a confirmed domain, operator/contact details, hosting review, browser checks and approval.
- Removed violet interface accents and decorative gradient cards, reduced hover movement, and used numbered adaptation marks.
- Corrected collection layout classes, portrait button spacing, menu scrolling, dialog labels and saved audio-label accuracy.
- Centered the wheel pointer independently of font metrics. Mouse steering records clicks immediately, stops at the playfield edge and has a small center dead zone.
- No deployment, remote game dependencies, new tracking or changes to save schema and game rules.

# 2.2.0 ; Separate horizons, living companions
# 2.3.0 — Companion ecology, rival personality, reachable stars

**Fixes**

- Stars can grow again. Red dwarf to Sun-like took an estimated 57 minutes and Sun-like to Massive star 241; both are now 2-6 minutes, in line with every other class. Stellar gas drag, nebula placement, field body mass and debris coalescence were each corrected. Black-hole behaviour is unchanged.
- The trajectory forecast no longer drifts off the body. It was projected without its z coordinate while the body was drawn with one, and started a full physics step ahead of the rendered position. It now integrates all three axes from the interpolated render position using the same softening, resist, grace and speed cap as the simulation, and scales its horizon with class.

**Companions**

- Every companion now carries a secondary passive drawn from its silhouette: jelly forms occasionally halve gravity-pulse cost, crystalline forms extend the trajectory forecast, winged forms sharpen braking, serpentine forms widen the life scanner, and shelled, spiral and many-limbed forms add capture efficiency, orbital assist and escape-burn recharge. All feed multipliers the simulation already applied.
- Life Lab gained a DISCOVER / INCUBATOR / COLLECTION / EQUIPPED tab strip and an equipped-companion summary.
- Eggs report a procedural status line that changes at roughly 25, 50, 75 and 100 percent, written per rarity.
- Scanner markers brighten and breathe while a mature system is paying its gravity bonus.
- Three achievements: equipping a Legendary companion, completing any single rarity, and hatching while three planets hold stable orbits.

**Rivals**

- Personalities now differ from the first minute. Aggressive rivals tolerate worse mass ratios and press the player harder; cautious rivals keep a wider berth, prefer quiet debris and settle once they hold three stable bodies; opportunists target matter already bound to someone else; explorers roam further and re-plan sooner; efficient rivals slow down and consolidate near a class threshold.
- An aggressive rival that loses a world to the player breaks off into a short pursuit.
- Rival names appear on threat arrows, in the system readout when a nearby world is theirs, and on the restore and game-over screens.

**Audio**

- Ambient noise and filter cutoff now follow nearby gas density.
- A low tension bed rises with threat proximity and releases over about two seconds; it follows mute, pause and restart.
- Orbit and disk milestones play a short rising triad.
- Losing one of your own worlds is pitched and weighted by its mass relative to yours.

**Rendering and orbits**

- Orbits at risk of ejection or collision pulse once per second.
- Captures below star stage emit a burst in the body's own colour instead of vanishing.
- The companion's orbit is capped in screen space so it no longer drifts off-screen at high mass.
- A rotating denser band appears in the disk while condensation is counting down.
- Rivals plot on the minimap as hollow rings with their initial.
- Holding O draws faint orbit ellipses for bodies already on screen; a selected body shows PERI and APO markers in place.
- Moons are indented under their parent in the system list.
- A slow ring pulses from the player while a mature system pays its bonus.

**Save and quality of life**

- Save slots show the class and best mass for that slot.
- Archive adds stable orbits established, companions hatched and longest single journey.
- Life Lab first-use text now uses the shared hint memory and does not repeat.
- New setting to hide the companion name label; every setting now carries a one-line description.

**Performance**

- Spatial hash cell size is tuned to live body count and spread; measured occupancy moved from under one body per cell to 5.2.
- Particle pool, ring and label arrays are capped.
- The lensing pass and the companion portrait now follow the adaptive quality gate.
- Restart clears the renderer sprite cache, cosmic stamp cache and effect arrays.

**Preserved**

- Ordered classic scripts under `window.AC`, no modules, no build step, no network use, offline `file://` launch. Existing 2.2.0 and pre-slots saves migrate with collections, nicknames, hints, settings and lifetime totals intact.


- Removed the admin panel, permanent class-switch function and keyboard shortcut.
- Added three toggle-selected independent save slots; migrated the old single profile to Slot 1.
- Added per-slot three-evolution autosave toggle, manual Save now, atomic world/resource checkpoints and shared settings.
- Reworked all companion art with shaded materials, articulated silhouettes and animation; added an inspectable live Life Lab preview.
- Added Small / Medium / Large companion sizes, reduced-motion support and a bounded 20/30 Hz preview.
- Preserved the simulation, progress, rarity buffs, pet names, discovery/incubation, cosmic systems and offline launch architecture.

# 2.1.5 ; Permanent class selection

- Replaced the five-second preview with permanent, saved class changes. Removed the timer, rollback and cooldown.
- Ctrl + Shift + 6 selects any named class immediately; existing sector bodies and matter rescale with the player.
- Pets, resources, eggs, nicknames and adaptations persist. Older preview cooldowns are ignored.

# 2.1.4 ; Companion buffs & class preview

- Equipped companions now apply rarity-scaled thrust, gravity and collision protection. Exact percentages appear on their cards and beside the equipped pet.
- Ctrl + Shift + 6 opens the admin preview menu with all 21 astronomical classes. Five-second temporary simulation; original world, inventory, progression and saved journey restored afterward.
- Preview countdown, early return, persistent one-minute cooldown and isolated preview saves. No additional animation loop or event handlers.
- Previous wheel, scarcity, nicknames, H shortcut, orbital systems and offline architecture retained.

# 2.1.3 ; Discovery wheel

- Life Lab wheel: 500 water + 100 DNA; Common 59%, Rare 35%, Epic 5%, Legendary 1%.
- Common sector includes Uncommon pets so all fifty remain obtainable.
- Eggs save immediately and incubate during flight. Completed sectors spend no resources; full incubators block spins.
- Existing saves, nicknames and H shortcut retained. Reduced motion skips wheel animation.

# 2.1.2 ; Scarcer discoveries

- Ordinary field ice frequency reduced from 22% to 12%; removed guaranteed life-bearing field starters.
- Icy bodies yield 1–2 water instead of 2–4. DNA appears in 20% of ice bodies instead of 40%, with one sample instead of 1–2.
- Increased recipe costs across all tiers. Legendary recipes now require 600 water and 180 DNA, with 180 seconds of active-flight incubation.
- Eggs save their own incubation duration. Existing pets, nicknames, inventories, and in-progress eggs retain their progress.
- Updated recipe UI, manual and optional diagnostics; offline launch and H shortcut retained.

# 2.1.1 ; Pet nicknames & quiet flight

- Rename the equipped companion in Life Lab; press Enter or Save name. Names persist per pet through reloads and journeys, with safe text rendering and a Reset button.
- H hides/restores the flight HUD, notifications and companion label. Escape and menus remain available; restart restores visible HUD.
- Updated manual, optional diagnostic pages, and fixed duplicate class attributes in the Life Lab markup.

# 2.1.0 ; Living Systems & Life Lab

- Shared stable-orbit detection for stellar rivals, planet/moon ownership, stolen planets, encounter disruption, and rival accretion-disk stripping.
- Preserved the original fifteen classes, nine starting rivals/five personalities and fourteen adaptations, plus the prior cosmic classes and upgrades. Added System shepherd through the existing ranked adaptation choices.
- Mature, bounded system bonuses trade immediate consumption for long-term gravity, detection and intake. Black-hole inner transfer now has a six-second minimum delay and finite flow.
- Extended the original Archive with orbital/system/disk/merger/survival achievements, planet/system/accretion counters, and companion discoveries.
- Four procedural ambient characters, mass-scaled orbital cues, sample/egg/hatch sounds, and first-orbit/first-disk cinematics reuse the existing audio and timing systems.
- Local trajectory cues, risk-colored orbit paths, ownership-aware selection, an improved observatory, feeding terms and remembered first-use help.
- Icy asteroids with finite water and DNA; collision-only collection with checkpointed claim state.
- Life Lab in the main/pause/HUD menus and on N. Fifty named companions in five rarity tiers; explicit recipes, three incubation slots, active-flight incubation, hatching, equip/unequip, filters and persistent collection.
- One lightweight equipped companion provides extended life-signal scanning. Cached procedural portraits and bounded scanner markers.
- Cached low-resolution gas layer, lens-source caching, bounded orbital candidates per owner, parcel/trail reuse, cached black-hole silhouettes, and Performance/adaptive controls covering cosmic effects.
- Expanded isolated-runtime tests and optional offline diagnostics. Existing save key and classic ordered AC scripts retained; no external dependencies.

# Accretion ; Cosmic Systems 2.0

This release extends the existing Accretion game, retaining its controls, AI personalities, upgrade system, menus, audio, achievements, procedural worlds, and original save key.

- **Solar systems:** persistent bound bodies, planets and moons, belt detection, companion bodies, contextual HUD, selection, observatory, and overview camera.
- **Orbital mechanics:** specific energy, angular momentum, eccentricity, periapsis/apoapsis, Hill-sphere moon checks, observation-based stability, perturbations, flybys, escape, and barycenter motion. Stellar orbits no longer suffer blanket capture drag.
- **Protoplanetary systems:** rotating gas loses vertical motion, accumulates in disks, and condenses into coherent planetesimals using actual stored mass. Coherent bodies can subsequently collide and grow.
- **Nebulae:** five procedural region styles with finite coarse gas cells, slow internal flow, gravitational focusing, curved wakes, density depletion, and mass transfer into streams.
- **Absorption:** all stages transfer captured bodies into delayed matter parcels; fragments and trails remain visible while matter spirals or plunges toward its source. Compact objects tidally disrupt smaller bodies before contact.
- **Black holes:** six new mass classes, disk reservoirs, delayed inner accretion, feeding-dependent brightness, lensed background points and nebular positions, central shadow, photon-ring-inspired glow, and bent disk arcs.
- **Galactic progression:** spiral density fields, sparse/rich regions, clustered stars, stellar aggregates, compact remnants, dust lanes, and nebula complexes. Existing nearby matter survives scale changes.
- **Strategy:** gentle stellar thrust helps preserve systems, boosts can destabilize them, three healthy planets provide up to 8% gravity efficiency, and selected orbits can be collapsed over time. Three new stackable disk/gas upgrades.
- **Performance and persistence:** bounded gas/stream/orbit budgets, reduced late-game body populations, density-aware spawning, cached glow sprites, adaptive render resolution, old-save compatibility, and saved matter reservoirs.
