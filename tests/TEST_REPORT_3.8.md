# 3.8.0 The Final Interstallar validation

Verification reached **V1: automated production runtime with a DOM adapter and native software Canvas, without a real browser**. V2 browser/software-GL and V3 browser/hardware-GL were not executed. All numbers below are observed V1 results unless explicitly labeled V0. Earlier sections remain historical and are not counted again.

## Executed checks

- **359 retained checks pass, zero fail**, across twelve suites: physics/progression 121, branch 16, supernova 36, Interstallar 11, advancement 28, slots 13, camera/pointer 19, collection 11, plaque motion 9, body animation 45, gallery 5 and interface/encounter/FPS 45. Run against the final production scripts after the last rendering edit.
- The new Final suite reports **60 pass, zero fail, 15 unverified notes**, 75 rows total. Its A–H groups cover ray/lens mathematics, CPU rendering, finite matter, field/pacing gates, merger and partial restore, saves, UI actions, fallbacks/tier hysteresis, caching and legacy integration. Some standalone unverified rows have separate V1 evidence in migration/pacing/audit/package files; browser/GPU/image-fidelity rows remain outstanding.
- The aggregate page reports **224 pass, zero fail, 15 unverified**, 239 rows total: physics 121, cosmic 22, Life Lab 5, components 16 and Final 75. These overlap other suites and are not added to their counts.
- **24 migration/restore checks pass**: fifteen golden 3.7 production fixtures plus nine version, retirement, Final restore and restart checks. **1,345,072 old primitive fields** compare identically; new fields and run version 4→5 are the only permitted changes.
- **Six deterministic round-trip comparisons pass**, classes 0, 5, 9, 15, 19 and 21:600 steps, checkpoint/restore, 600 steps versus uninterrupted 1,200. Position, mass and landmark errors are zero and RNG state matches; spawn/event timers are isolated for this test.
- **38 preservation checks pass**: original tables, all 54 achievement definitions/connections and fifteen byte-for-byte original files including gameplay/resource/orbit/adaptation/route-render/input/weather implementations and MIT/crawl files.
- **Three new developer pages initialize** with one existing frame owner and an in-memory isolated save. Static JS parse, IDs, titles, local references, classic order, SVG/XML, network/worker/eval/media/storage audits pass. ZIP extraction/integrity evidence is documented in the delivery report.

## Approach and merger

The actual input/thrust autopilot reaches the merge from the class 21 Beacon boundary in **314.15 seconds** (about 5 m 14 s), within the 4–8 minute target. At class 15, immediate escape from 5 R takes3.4 s; waiting 5 s takes16.93 s and retains61.66 cohesion; waiting 7 s takes21.02 s and retains50.18. A stationary outer-edge disk hold lasts 45 s above 95 cohesion. These are isolated scripted trajectories, not human play sessions. Ten-second visible merger timing, pause/hidden stops, threshold reward-once, mass sum, afterglow and partial-merger reload are exercised.

## Reference fidelity

All five supplied originals were inspected; R1 is the hero. The production **T1 256² crossing map plus 512² cached contour layer**, registered at587² output, passes several measured geometric tolerances. **M9 dark-gap asymmetry, M11 radial profile and M13 colour aggregate fail**. Seven of eight colour samples pass; mid disk ΔE76=14.000652 against ≤14, without rounding it into a pass. Some inclination, glow, extent and texture quantities are ambiguous/inferred or lower bounds, not independent passes. Fine turbulence and rotating-hole geometry differ. Default output is an original Schwarzschild-inspired display with explicit approximations, not exact Kerr or full photo parity. Reference/difference panels stay private; only original procedural graphics are distributed.

## Performance

Native software Canvas at 1440×900, no GL. Sparse measurements use 50 warm-up + 300 contiguous samples; dense measurements use 12 fresh processes × (50 warm-up + 25 measured), 300 pooled samples because longer native dense runs terminate. This deviation and host variability are explicit in final-performance.json.

Paired active-encounter class 21 crowded rendering measured **69.045→47.531 ms High** and **29.273→18.892 ms Performance**, median reductions31.16% and35.46%. Simulation medians9.909→10.244 ms and8.027→8.187 ms; combined80.420→59.771 ms and38.247→28.022 ms. These pairs precede the final transparent-contour crop and use tiny T0 footprints; the crop only affects richer large-image layers. They do not demonstrate 60 FPS.

Final-code 1024 px body-component pairs measured T0 median **5.183→4.836 ms**, T1 **8.650→7.300 ms**; p95 **6.579→8.412 ms** and **12.088→12.091 ms**. The cached contour occupies213×151 of 512² and avoids drawing empty pixels. Early class 0/9 render medians stay within 3%; Low simulation medians rise9.1–16.2%, only0.011–0.017 ms but outside the strict 3% target. Reported exceptions remain exceptions.

Final 256² bake:346.22 ms, 91 calls, p95 slice 4.625 ms/max 9.007 ms. Total completion meets 2 s but strict 4 ms slices do not. One full T1 estimated 7,144,352 bytes; T0 estimated 4,776,864 bytes, caches pruned below 11.7 MiB. Driver/heap memory is unmeasured. Reused production projection outputs measure37.369→27.665 ms per 200,000 calls with identical coordinate checksum and zero logical vector allocations in that reused method; this is not total renderer heap or FPS proof.

Auto hysteresis/fallback/culling/lazy GL, cached static contours, capped rival detail and existing adaptive quality remain. Strict largest-footprint landmark full-scene protocol, actual GPU costs, startup interaction, menu responsiveness, zero steady-state heap allocation and complete target-device 60 FPS verification remain outstanding.

## Browser limit and manual checks

**V0: browser verification blocked.** Local Chromium exits before a page loads; the cloud browser's security policy rejects file://. No alternate URL/server workaround was used. Empty console arrays from failed launch do not establish a clean console. Real double-click interaction, browser storage policy, console, CSS/focus, audio, download, GPU/context recovery, DPR/resize, photosensitivity screen-area metrics and hardware performance remain manual checks. Normal launch remains extract→Accretion→double-click index.html, with local classic dependencies and no install/server. Public-release gates remain blocked.

Evidence: tests/final-interstallar-results.json, final-run-all-results.json, final-page-results.json, final-migration.json, final-roundtrip.json, final-preservation.json, final-pacing.json, final-fidelity.json, final-performance.json, final-static-audit.json, final-browser-status.json and reference-analysis.json. The separate delivery report includes all 224 requirement IDs, M1–M17, conflicts, manual script and complete ZIP manifest.

Earlier reports below are historical and are not counted again.

# 3.7.0 Galactic interface validation

359 automated checks passed against the production ordered classic scripts: 121 physics/progression checks, 16 branch checks, 36 supernova checks, 11 Interstallar checks, 28 advancement checks, 13 slot checks, 19 camera/pointer checks, 11 collection checks, nine plaque-motion checks, 45 body-animation checks, five preview checks and 45 new interface/encounter/FPS checks. Retained suites were run against this version, not inferred from earlier reports. The bundled cosmic and Life Lab pages also passed 22 and five checks when executed through the isolated native-Canvas runtime. Those overlapping page checks are not added to the 359 total.

## New behavior verified

- Six earned palettes share a single Settings control and semantic interface/frame colours. Existing legacy and active-slot frame selections migrate; unlocks carry across slots while markings and accessories remain per slot. Locked/malformed choices fall back safely. Text, muted labels and accents exceed 4.5:1 against their panel surface in all six palettes. Theme changes do not change gameplay state or resources.
- Galaxy encounters require star scale and start once. Four thirty-minute phases use exactly 7,200 active seconds. Menus, upgrades, photo mode, hidden tabs, pauses, suspension gaps and invalid deltas cannot advance the clock. Actual render timestamps make the timer independent of evolution slow motion. Timing endpoints were exercised directly; this was not a two-hour human play session.
- Finite phase budgets, donor clouds, gas parcels and coherent condensed bodies conserve matter. Gravity bends emitted gas into the existing delayed-accretion pipeline; emission never instantly credits the player. Full cloud slots apply backpressure, exhausted slots recycle without resurrecting mass, and travelling away halts emission. Late-scale condensation produces real stellar bodies.
- Atlas density, bridge course and visual phase geometry derive from encounter state. Outer player and rival orbits receive differential tidal impulses; inner orbits and direct player velocity are protected. Completion grants one reward, respects the adaptation-bank cap, changes actual gravity and intake, and preserves zero-gravity nebula behavior.
- Full snapshots restore encounter timing, finite ledger, emitted gas and bonuses. Minute clock-only saves preserve the selected world/mass checkpoint cadence. Reload catches pending phase transitions once. Quota failures roll back the clock write. Corrupt states are rejected; old saves and separate slots remain valid. Completion counters account once.
- FPS measurements match synthetic 30, 60 and 120 Hz timestamps, retain the actual slow rate rather than using the fixed-step clamp, and reset after hidden tabs or long suspension. The readout follows existing H/5 visibility controls.
- All four selected routes retain one stage/route/next-class display across 240 mixed refresh intervals per route, mass loss, checkpoints, restore and completion. The unchosen route remains capped at Stellar Colossus. There is no second ordinary-stage writer overwriting the selected class.
- Repeated restarts retain one animation-loop owner and listener set, reset encounter/FPS/matter state, and keep companions and account records. Existing orbital hierarchy, stable capture, rivalry, absorption, movement, camera, adaptations, audio, achievements, wheel costs/odds and animated surfaces pass retained checks.
- Appearance can render before a run: the preview body is now initialized through the same reset/mass setup as a physical body. The standalone diagnostic pages contain the current UI IDs and selected-path fixtures. Their test hooks are not loaded by the game.
- Syntax, local references, unique page titles, SVG/XML and dependency checks pass. The main game still uses 21 local ordered classic scripts. No module, fetch, remote asset, worker, server or installation dependency was introduced.

## New-layer performance

Native software Canvas profiling used 40 warm-up and 120 measured draws per phase, with pixel readback to flush commands. Across four phases, the extra world galaxy layer had High median costs of 0.94–2.80 ms and p95 of 1.07–3.05 ms. Performance medians were 0.49–0.55 ms and p95 0.59–0.69 ms. Low adaptive detail behaved similarly. The management chart is separately drawn at a four-Hz UI cadence: median 1.44–1.47 ms in High and 0.48–0.49 ms in Performance. These are component timings, not browser FPS.

The layer retains 960 seeded tracers, draws at most 480/160 High/Performance samples, uses at most two cached glow stamps, omits glows at low detail and culls offscreen/distant work. Each encounter cloud has 24 coarse cells within the existing eight-region cap. Twenty thousand blocked emission attempts per mode created no bodies/cells, spent no reserve and completed in 26–29 ms total. Existing matter/particle pooling, spatial hashing, bounded important sources, hierarchical orbits, surface caches, adaptive resolution and distance culling remain active.

A deliberately saturated native-software scene included nine final-stage rivals, eight clouds/224 cells, 160/154 matter parcels, 309/234 live bodies and an active galaxy encounter. Median simulation was 9.86/7.59 ms and drawing 72.21/36.52 ms in High/Performance; p95 drawing was 82.77/43.04 ms. It does not demonstrate 60 FPS. This fixed-detail stress runner bypasses the main loop's adaptive quality feedback. Results vary by host and are not GPU/browser measurements. The game exposes a real FPS counter so actual hardware behavior is visible. Raw results are bundled under tests/.

## Browser verification limit

Chromium exited during launch before opening the intended file://index.html. Browser console, CSS layout, audible sound, actual file-origin storage permissions and browser/GPU FPS remain unverified in this environment. Empty console arrays from that failed launch are not a clean-console result. Isolated production scripts, native Canvas, local dependencies, save/restart logic and ZIP extraction are verified. The game entry point still requires only extraction and opening index.html, with no server or installation.

Earlier reports below are historical and are not counted again.

# 3.6.0 Living surfaces validation

309 automated checks passed against the production ordered classic scripts: 116 isolated physics/progression/timing checks, 16 branch-journey checks, 36 remnant integration checks, 11 Interstallar checks, 28 advancement checks, 13 save-slot checks, 19 camera/pointer checks, 11 collection checks, nine plaque checks, 45 new body-animation checks and five definition-only preview checks. Earlier sections below describe prior versions and are not counted again.

## What was verified

- Original dwarf, moon, terrestrial, super-Earth, gas, brown-dwarf and stellar classes show changing surface frames. Independent cloud drift, fixed lighting, gas latitude shear, storms, ring motion, nebula flow, pulsar/magnetar/Strange Matter/gravastar/singularity motion and the original Interstallar filaments were checked with native Canvas pixels.
- Performance mode retains visible motion. Reduced Motion freezes optional animation across early bodies, planets, stars, all remnant types and both ordinary/final horizons. Sub-step timing follows position interpolation; pause/photo mode ignore wall-clock advancement; new size/orientation/lens intervals remain consistent.
- Cached longitude data and lighting are reused. Stage/climate changes fade between assets; an existing animated surface remains active while the replacement builds. Deferred and synchronous atlas generation produce identical image data. Stale builders expire, at most two builders exist, player/selection have priority, and detail/cache caps remain bounded.
- Visual rendering and deferred generation leave physics mass, velocities, random outcomes, stored parcels and saved snapshots unchanged. Actual capture/absorption, delayed accretion, orbital hierarchies, rivals, supernova paths and evolution awards pass the retained integration suites.
- Existing settings, slot checkpoints, path origin/tier, physical orientation, momentum and resources reload correctly. Restarts clear all new maps, row builders, geometry caches and histories without adding game loops or input listeners. The centered camera, old dotted forecast, boost feedback, dock, pet rarity rules and compact plaques pass their retained checks.
- The separate `tests/body-animation.html` loads only definitions and the preview. All 41 original/branch choices render, its single preview loop animates, pause and quality/motion controls work, and it leaves storage unchanged. The main game still contains the same 21 ordered scripts.
- Source syntax, local references, unique page titles, XML and dependency checks pass. No fetch, worker, module, remote asset or new runtime dependency was introduced.

## Rendering budgets and measured limits

Surface generation now uses a soft row-work budget of 2 ms in High and 1.2 ms in Performance/low adaptive detail, with final stamping on a separate frame. It is not a hard maximum: one row, garbage collection or final stamping can overrun. In a sequential isolated CPU measurement across Moon, Earth, gas giant and Massive Star, High maps finished in 12–28 processing calls, with median slices of 2.13–2.23 ms and a maximum measured slice of 3.81 ms. Performance maps finished in 6–13 calls, with median slices of 1.21–1.34 ms and maximum 1.90 ms. Map creation is limited to two pending jobs and cached assets to 24 (12 for Performance maps). Ordinary animated neighbours are capped at three in High and one in Performance; player/selection are reserved. Ordinary maps are smaller, and adaptive resolution, particle/trail budgets and lens/detail culling remain active.

A warmed 60-pixel body measurement, including a software Canvas readback, gives High medians of 0.74 ms for Moon, 1.28 ms for Earth, 2.30 ms for gas giant, 1.44 ms for brown dwarf and 1.77 ms for Massive Star. Performance medians range from 0.73 to 1.95 ms. The additional animation has a measurable cost over the former static sprites. First visible-frame costs were 2.9–10.2 ms in High; subsequent map work is sliced rather than blocking on the complete map. These are component costs, not total frame or browser/GPU FPS.

The deliberately saturated final-scale scene retains the same populations: nine rival horizons, eight nebula regions/224 gas cells, 160/154 matter parcels, and 309/234 live bodies in High/Performance. Sequential native software Canvas measurements with a pixel readback gave median drawing costs of 63.0 ms / 28.1 ms and simulation costs of 9.4 ms / 7.0 ms. Software full-scene timings vary substantially between runs. This stress scene does not demonstrate 60 FPS, and no browser performance guarantee is made. Native Canvas timings are not browser/GPU measurements; the main game's adaptive setting lowers resolution and effects under sustained slow frames, while these fixed-detail stress samples deliberately do not run that feedback loop. Raw results are included under `tests/`.

## Browser verification

Chromium exited during launch before opening `file://index.html`. Browser console, CSS layout, audible sound, actual file-origin storage permissions and browser FPS remain unverified here. Empty console/error arrays from that attempt are not a clean-console result. The production classic scripts, local references, storage/restart behavior and rendering were instead exercised through isolated runtimes and native Canvas. The entry point remains offline and requires no server or installation.

# 3.5.0 Evolution journeys validation

253 automated checks passed against the production ordered classic scripts: 110 isolated physics/progression checks, 16 new branch-journey integration/rendering checks, 36 remnant integration/animation/audio checks, 11 Interstallar checks, 28 advancement checks, 13 save-slot checks, 19 camera/pointer checks, 11 collection/inner-flow checks and nine plaque-motion checks. Earlier reports below are historical and are not counted again.

## Changed behavior verified

- Choosing at Massive Star or a later stellar class retains the exact mass, radius, position, velocity, health, boost energy, cooldowns, installed adaptations, pending adaptation choices and point balance. Ordinary stellar gravity and propulsion remain. A partly filled goal retains its progress and next mass threshold. Selection awards no points and triggers no explosion.
- All four complete sequences are checked against explicit expected class names. The eight unique precursor classes replace ordinary supergiant progression. Fivefold thresholds award one stage and one point at a time; a large mass gain cannot skip the cinematic stage sequence. Repeated calls cannot farm awards, and losing mass cannot silently change an attained branch class.
- Before the first branch evolution, choices can be changed at the origin star without healing, timer resets, shifted thresholds or extra points. Selection before Massive Star, below Massive Star mass after losing mass, or after the first branch evolution is rejected. The existing menu remains available to inspect the locked journey, current stage and upcoming classes.
- Supernova, remnant profiles, coherent-body reactions, planetary release and route crests activate at the third branch evolution. Precursor stars retain actual gravitational attraction and their orbit hierarchy. Each true transformation retains its existing light, audio and physical shockwave. Later evolutions and restored saves do not replay it.
- New and precursor save/load tests cover all four paths at levels zero through three. Tests also migrate every previous 3.4 route tier into its equivalent new position exactly once, preserving reached form, mass, motion, points and stored matter. New origin/schema data are validated inside the existing version-four journey snapshot. Independent slots, the three-evolution cadence and lifetime accounting remain.
- Precursor flight-note objectives are attainable and do not require black-hole accretion while still a star. The full stage overview shows the selected route, current class, reached classes and disabled choices after locking. The existing F dock can minimize and reopen it. Reduced Motion makes the precursor filaments still.
- Actual precursor body frames were rendered and visually inspected with native Canvas. Route-specific filaments and proto-neutron polar light change with simulation time. The Interstallar's moving highlights, opaque shadow, feeding response, quality settings and frozen pause/photo/Reduced Motion state remain covered.
- Existing physics, rival orbital systems, delayed matter transfer, DNA/water conservation, achievements, pets, collection, camera, old trajectory pointer, menus and repeated restarts remain covered. New path schema, origin and reaction state reset without duplicate loops or listeners.

## Rendering overhead

The new precursor overlay was measured sequentially with native software Canvas at a 40-pixel body radius, 20 warmup frames and 100 samples for each route, tier and quality setting. High-detail medians range from 0.032 to 0.036 ms; Performance medians range from 0.019 to 0.024 ms. Maximum p95 is 0.101 ms in High and 0.063 ms in Performance. These are component costs, not full-scene or browser/GPU FPS. The existing bounded simulation, spatial hash, particle pools, gas cells and detail budgets remain; no new full physics population, event listener or animation loop was added.

## Offline audit and limits

All 206 local HTML references resolve, the nine page titles are unique, JavaScript syntax passes, IDs/CSS delimiters are checked, and XML parses. Classic script order and window.AC remain. There are no runtime modules, fetch calls, workers, external assets or CDN dependencies. Full-DOM diagnostic pages use the current production menu markup. The final ZIP is checked for CRC integrity and byte-for-byte source parity.

Launch remains: extract the complete ZIP, open Accretion, double-click index.html. Direct browser verification remains unavailable: the earlier Chromium attempt terminated before a page opened. Browser console, CSS layout, actual file-page storage permissions, audible output and browser FPS are not confirmed by isolated tests or native Canvas. No public deployment occurred; existing publication requirements remain.

Current evidence: tests/branch-validation.json, tests/branch-results.json, tests/physics-results.json and tests/precursor-performance.json. The reports below describe previous versions.

# 3.4.0 Supernova paths and active Interstallar validation

230 automated checks passed against the production ordered classic scripts: 103 definition-only physics/progression checks, 36 Supernova integration/animation/audio checks, 11 Interstallar checks, 28 advancement checks, 13 save-slot checks, 19 camera/pointer checks, 11 collection/inner-flow checks and nine plaque-motion checks. Earlier reports below are historical and are not counted again.

## New behavior covered

- Supernova unlocks at Massive Star, remains optional after later stellar evolution or mass loss, and has a pause-menu counterpart. Declining it ends named stellar evolution at Stellar Colossus without ending mass growth. Locked, invalid and repeated choices cannot award points or change a route.
- All four choices preserve actual mass, momentum, installed adaptations, companions and laboratory resources. Route tiers require fivefold mass growth and award each tier once. Singularity retains every existing black-hole class through The Interstallar. Neutron, Magnetar, Strange Matter, Nebula and Gravastar modifiers affect actual acceleration, cruise speed, gravity, collisions and reactions.
- Nebula removes gravitational attraction and coherent-body contact absorption. Only bodies inside its cloud erode. Extracted mass becomes stored matter before gradual assimilation; finite nebula cells actually lose density. Separate donors remain distinct, and partial erosion cannot duplicate DNA or water. Strange Matter converts physical nearby material. Dense rivals can gradually strip a cloud.
- The expanding supernova impulse alters actual velocities and can destabilize an existing planetary system. Nebula releases former bound bodies with their velocities. Later remnant evolutions clear the initial supernova animation rather than replaying it. Each route has distinct procedural frame changes; Reduced Motion uses a steady glow.
- Route, tier, starting mass, attained stellar classes, partial erosion and stored flow parcels survive real checkpoint serialization/reload. Legacy compact saves migrate into Singularity with their attained class and mass preserved. Invalid route/reaction state is rejected. Existing three-evolution checkpoints and independent save slots remain; route selection saves immediately. New lifetime counters account only once.
- The five new crests extend the existing catalogue to 54. Early remnant choices do not award skipped stellar or black-hole milestones. Branch-specific journey goals remain achievable. Cloud adaptation offers exclude inactive gravity options while installed ranks survive. The existing inspector, HUD, minimization and F dock remain in use.
- Four procedural Supernova cues have different synthesis envelopes. Five remnant ambient profiles reuse the original persistent voices and single audio context, and mute still applies. These checks validate synthesis/control calls, not audible sound quality.
- Interstallar inner and outer filaments visibly move in both quality profiles, with travelling bright heads and differential rotation. The central shadow remains opaque. Pause, photo mode and Reduced Motion freeze the clock-driven effect. Actual stored matter changes feeding intensity, caches stay bounded, and rendering does not mutate physics, random state, listeners or loops.
- Repeated starts/restarts clear paths, reactions, stored parcels and transformation state without adding event listeners or animation loops. Retained tests cover orbital hierarchies, rival systems, delayed accretion, resource collection, achievements, save slots and the original centered camera/dotted trajectory/boost behavior.

## Offline audit

The audit resolves 206 local HTML references, confirms nine unique page titles, checks all JavaScript syntax and duplicate IDs, parses XML and checks CSS delimiters. No runtime modules, fetch calls, workers or remote assets are introduced. Scripts share window.AC and remain classically ordered. Diagnostic pages load the updated script definitions. Offline launch remains: extract the ZIP, open Accretion, double-click index.html.

## Dense-scene measurements

These are sequential warmed native software Canvas wall times, not browser/GPU frame rates. The stress scene starts with nine final-scale rivals, eight nebula regions, 224 finite gas cells and 148 stored matter parcels. It samples 50 frames after 20 warmup frames; standalone Interstallar drawing samples 80 frames after 20 warmup frames. All simulated matter remains bounded. Actual scene population changes through real captures and fragmentation.

| Detail | Interstallar draw median | Simulation median | Scene draw median | Scene draw p95 |
| --- | ---: | ---: | ---: | ---: |
| High | 1.532 ms | 9.143 ms | 32.897 ms | 37.419 ms |
| Performance | 0.153 ms | 6.702 ms | 18.147 ms | 24.290 ms |

Performance detail lowers ring filaments and atlas resolution, cloud sampling and render work. Small stream trails have a bounded detail-scaled budget; significant parcels remain visible and every parcel retains its physics. Gravity/profile lookups reuse cached route values, zero-gravity clouds skip gravity work, and reactions use a rotating bounded candidate budget. The deliberately dense software-rendered scene exceeds a 16.7 ms drawing budget, so these results do not establish 60 FPS on a desktop browser.

## Verification limits

Chromium terminated during launch before opening a page. Real-browser file:// launch, console, CSS layout, localStorage permission behavior, downloads, audible output and browser FPS remain unverified here. Empty browser error arrays are not evidence of a clean console because no page opened. Isolated runtimes and native Canvas do not replace those checks. The procedural animation frames were inspected visually through native Canvas.

No public deployment occurred. The existing domain/operator and publication requirements remain in RELEASE_READINESS.md. Current evidence: tests/supernova-validation.json, tests/supernova-results.json, tests/physics-results.json and tests/supernova-performance.json.

# 3.3.0 The Interstallar validation

184 automated checks passed against the production classic scripts: 93 definition-only physics/progression checks, 11 new final-stage integration/rendering checks, 28 advancement checks, 13 save-slot checks, 19 camera/pointer checks, 11 collection/inner-flow checks and nine plaque-motion checks. Earlier validation below is retained as historical evidence, not counted as newly rerun tests.

The focused final-stage checks cover the exact threshold after Ultramassive, continuous astronomical mass labels, final evolution/point/achievement awarding exactly once, continued growth without phantom classes, final-class HUD and journey goals, save/load of the final state and earlier checkpoints, visible filament motion in both quality settings, opaque central shadow, reduced motion, actual feeding intensity, pause/photo freeze, bounded caches, rendering without simulation/RNG/listener/loop changes, Sandbox separation, repeated restarts and the existing delayed accretion transfer.

The static offline audit passed: 196 local references resolve, nine page titles are unique, JavaScript syntax is valid, IDs and CSS delimiters are intact and XML parses. Ordered scripts, window.AC, the original save/storage format and offline launch structure remain. There are no runtime modules, fetch calls, workers or remote assets. The stylesheet is byte-identical to 3.2.1, retaining the one-third-size plaques. New visual linework is procedural and uses no attached image file at runtime.

## Native Canvas measurements

Sequential warmed component measurements used a native software Canvas renderer, not a browser or GPU. The deliberately dense final-scale scene used nine rival horizons, eight nebula regions, 224 gas cells and about 150 coarse matter parcels. The same seed, counts and quality profiles were used for 3.2.1 and 3.3.0. The final version caps full-detail rival filaments at two plus the player and downsamples small-body radiance atlases. Performance mode further reduces filaments. Tiny projections omit invisible animation, and both caches are cleared on restart.

| Quality | Previous scene render median | Final scene render median | Final simulation median | Final body render median |
| --- | --- | --- | --- | --- |
| High | 31.493 ms | 28.512 ms | 8.889 ms | 0.615 ms |
| Performance | 17.382 ms | 16.911 ms | 6.598 ms | 0.120 ms |

These extreme software-rendered scenes exceed a combined 16.7 ms frame budget. These component measurements do not establish 60 FPS or guarantee a particular desktop result; differences between timed runs also include runtime variance. The comparison confirms that the final rendering pass returned the dense-scene cost near the previous baseline after the initial heavier implementation. Raw methods and p95 values are in tests/interstallar-performance.json and tests/interstallar-performance-previous.json.

## Verification limits

The local Chromium process closed during launch before loading index.html. Browser file:// launch, console output, CSS layout, audio output and GPU FPS remain unverified in this environment. Production Canvas output was rendered and inspected directly; that is not a browser screenshot. Extract the complete ZIP and double-click Accretion/index.html to launch the offline game. For an immediate look at the new class, open the separate Sandbox and choose The Interstallar in B experiments. Public hosting remains disabled.

Current results: tests/interstallar-validation.json, tests/interstallar-results.json, tests/interstallar-audit.json and the performance reports named above.

# 3.2.1 Compact achievement popup validation

The popup is uniformly scaled to one-third its previous width and height, including its text, badge, borders, glow and shortcut. Top and bottom transform origins retain the corresponding screen anchors. Existing animation variables, timing and frame palettes are used.

Nine existing production-script plaque regression checks passed for reveal phases, top/bottom offsets, pause/resume, HUD/evolution suspension, reduced motion, queue reset, restart cleanup and the isolated offline animation preview. The static audit passed for all 196 local page references, JavaScript syntax, unique page titles and IDs, CSS delimiters, XML and offline runtime dependencies. Game simulation and saved data formats were not changed.

The isolated runtime does not verify browser CSS rendering or a real file:// launch. Those browser checks remain unverified; prior validation and measurements below are historical results from the earlier releases, not newly rerun measurements. Current patch results: tests/compact-plaque-motion-results.json and tests/compact-plaque-audit.json.

# 3.2.0 Legacy & Origins validation

289 unique automated checks passed against the actual ordered classic scripts in isolated VM/DOM and native software Canvas runtimes. This includes the 247 retained checks, nine additions to the definition-only physics suite (now 93), and 33 new integration checks. Optional diagnostics repeat the 93 physics checks without a game loop or changes to the saved profile; those repeats are not counted again. No testing dependency is loaded by the game.

## New behavior covered

- Prestige requires a living stellar journey plus four different completed class goals. A successful manual checkpoint precedes retirement. Both initial-checkpoint failure and retirement-write failure retain the old playable universe. Body, orbits and adaptations retire; companions, eggs, resources, names, branches, records, achievements and cosmetics remain in the same slot. History, trial state and looks survive load. Rank cap, sandbox exclusion, other-slot isolation and repeated-activation rejection are verified.
- Three optional expedition promises use actual captures/sectors, stable hierarchical moons, uninterrupted healthy-system time or truly accreted black-hole matter. Disturbance resets the custodian hold. Captured disk mass does not satisfy accretion. Completion records once and grants no resources or power.
- Cosmetic migration rejects locked/unknown choices, preserves earned selections per slot and uses existing achievement/rank gates. Plaque frames use the existing notice and reveal phases. All companion accessories and body markings render through production Canvas code without physics mutation. The eighteen options include their original defaults.
- Actual damaging collisions record scars; shielded contacts and gentle absorption do not. Fatal contacts do not count as survived impacts. Marks cap at six, persist through evolution/checkpoints with sprite orientation, and clear on body reuse. The original eight scripts for AI, cosmic physics/rendering, effects, composition, input, adaptations and world spawning are byte-identical to 3.1.1.
- Five blueprint recipes check actual owned stable planets, rocky/gas composition, radial separation, nested moons, real six-body belts and established planetary period relationships. Sustained holds reset when disturbed and reward once without creating matter or resources. Selection/hold progress persist. Three planets captured naturally through the production fixed step complete the Inner family goal after remaining stable. Arrangement scans run at five Hz and revalidate at the exact award boundary.
- Every one of the fifty existing species hatches as its actual creature. Incubation must be ready; claiming, skipping, closing, minimizing, equipping and repeated attempts do not reroll or duplicate the pet. Explicit claims checkpoint the ready result. Reduced motion immediately displays a still result with no extra reveal cue. Procedural crack, reveal, legendary and prestige sounds use the existing synthesizer, obey mute and play at most once per reveal phase. Native Canvas images of three hatch sequences, ten body classes and all six accessory choices were inspected; they are not browser screenshots.
- The dock opens only from F. Hover, focus and close-button activation cannot open it. Five idle seconds hide it even with focus; real interaction refreshes the timer, pointer leave shortens it to 0.65 seconds and opening a window closes it. The full hidden HUD, native dock navigation, Escape, upgrades and existing windows remain functional. Restarts clear transient state and add no listeners or animation loops.

## Matched dense-scene measurements

Sequential warmed tests used the same six saved 3.1.1 scenes for both releases, one seed, 40 warm-up plus 110 measured frames and the same native software Canvas runtime. Simulation counts remain bounded: 259–1120 bodies, up to 148 matter parcels, 224 gas cells and 420 or 1200 decorative particles. Timing varies with the execution environment. These are component timings, not browser FPS or a performance guarantee.

| Scene | Quality | 3.1.1 simulation / render median (ms) | 3.2.0 simulation / render median (ms) |
| --- | --- | --- | --- |
| Asteroid | High | 3.788 / 8.766 | 3.302 / 8.193 |
| Asteroid | Performance | 2.950 / 5.186 | 3.177 / 5.298 |
| Stellar | High | 5.430 / 20.651 | 5.123 / 17.253 |
| Stellar | Performance | 4.295 / 7.260 | 4.459 / 8.189 |
| Black hole | High | 8.381 / 22.753 | 8.279 / 22.510 |
| Black hole | Performance | 7.620 / 8.262 | 7.342 / 7.820 |

A second set added a legendary companion/halo, six scars on the player and nine rivals, the Legacy marking, a selected moon blueprint and an active custodian promise. Isolated warmed results were:

| Active scene | Quality | Simulation median (ms) | Render median (ms) |
| --- | --- | --- | --- |
| Stellar | High | 5.095 | 18.094 |
| Stellar | Performance | 4.521 | 7.964 |
| Black hole | High | 8.323 | 22.751 |
| Black hole | Performance | 8.082 | 9.557 |

High-detail extremes exceed a 16.7 ms combined budget in this software-only renderer, and the active dense black-hole Performance scene sums to about 17.6 ms at component medians; upper tails are higher. Browser GPU rendering was not measured. The existing adaptive detail/resolution, spatial hash, fixed-step cap, LOD and pooling remain. New marks reduce their cap in Performance/low adaptive detail, hatch sparks cap at ten instead of up to thirty-two, previews run at twenty instead of thirty Hz, and Performance disables dock blur. Use Performance and Adaptive visual detail for dense scenes. Raw medians, p95, budgets and method are in the two heritage performance reports.

## Offline audit and verification limits

Classic script order and the window.AC namespace are preserved, with no modules, fetch, workers, server, build, external runtime assets or CDN libraries. Static syntax, all local references, unique IDs/titles, CSS delimiters and XML pass. Both full integration-diagnostic pages share the new production markup. The storage key, three-evolution/timed cadence, nine rival personalities, eighteen stackable adaptations, old trajectory/camera/boost, collection repair, rare DNA and 500-water/100-DNA wheel with 59/35/5/1% odds remain covered by regression checks.

The local Chromium executable again exited with SIGTRAP (133) before loading any page. Real-browser file:// launch, console, CSS layout/animation, audible output, exports and FPS therefore remain unverified. Isolated runtimes and native Canvas do not establish those results. Extract the full ZIP and double-click Accretion/index.html to use the offline build. No public hosting or publication occurred, and the existing release gates remain.

Current reports: tests/legacy-origins-validation.json, tests/heritage-results.json, tests/physics-results.json, tests/heritage-performance.json, tests/heritage-active-performance.json and tests/heritage-audit.json. Historical reports follow.

# 3.1.1 Animated plaque validation

247 unique automated checks passed using the production classic scripts in isolated VM/DOM and native software Canvas runtimes. These comprise the 238 retained checks and nine new animation/preview checks. No testing dependency is loaded by the game.

## Motion and lifecycle coverage

- The actual queued plaque builds a framed silhouette, illuminates, resolves its badge/title, then holds before fading. Fully readable presentation begins at 1.08 seconds. Task, goal and challenge plaques last 4.8, 5.5 and 6.3 seconds; each has at least 3.2 seconds of steady readable hold before the 0.48-second exit.
- Top/bottom placement mirrors the subtle entrance and exit offsets while keeping reveal values identical. The light wash, badge scale, text opacity and blur are finite and bounded throughout every type's timeline.
- Pausing during illumination freezes every painted value. Resuming keeps the same phase and does not replay the cue. Hidden HUD and cinematic evolution also freeze both reveal and exit. Photo-mode deferral remains covered by the retained advancement suite.
- Game or operating-system reduced motion removes light wash, blur, scale change and movement while keeping the plaque readable for its normal lifetime.
- The next queued plaque clears the preceding fade and starts from its own forming phase. Restart during illumination clears styles, phase and queued state without additional listeners, timers or game animation loops. Steady hold performs no redundant style writes.
- The optional offline preview loads the production UI paint method and stylesheet. Task/goal/challenge replay, pause/resume, reduced motion and one preview loop are tested. The isolated page never accesses browser storage, constructs a Game, loads Audio or awards an achievement.

## Retained systems and offline checks

All 238 retained checks pass again: advancement progress/persistence, original physics, orbital hierarchy, rival systems, nebulae, protoplanetary formation, delayed accretion, all classes, companions, wheel odds/cost, three save slots, checkpoint cadence, audio synthesis, settings, menus, workspace controls, camera/pointer/boost, collection and restarts. Seventeen simulation and meta-system files, including physics, Save, Audio, Life and Game, are byte-identical to the delivered 3.1.0 build. The optional definition-only diagnostic page repeats all 84 physics checks without a game loop or saved-state change; repeated checks are not counted twice.

JavaScript syntax, 196 local HTML references, unique IDs/titles, CSS delimiters, XML and prohibited runtime-dependency checks pass. Ordered classic scripts still share window.AC; no modules, fetch requests, workers, external assets, CDN dependency, server or installation is introduced. ZIP integrity and byte-for-byte source parity are verified. Extract the full ZIP and double-click Accretion/index.html to launch, or open tests/advancement-animation.html for the isolated motion preview.

## Verification limits

The previous environment's real-browser startup failure remains unresolved. Real-browser file:// launch, console, CSS layout, rendered animation and audible output are not verified. The tests verify the live timing, paint properties and lifecycle in an isolated DOM runtime; they do not establish browser rendering quality. The offline preview is supplied for direct inspection in the player's browser. No browser FPS guarantee or new performance benchmark is claimed. No public hosting occurred; existing release gates remain unchanged.

Current results: tests/plaque-animation-validation.json, tests/plaque-motion-results.json and tests/plaque-animation-audit.json. Reports below are historical.

# 3.1.0 Cosmic Advancements validation

238 unique automated checks passed against the production ordered classic scripts in isolated VM/DOM and native software Canvas runtimes: 84 physics/progression checks, 28 advancement integration checks, 16 Living Frontier checks and 110 retained save-slot, companion, wheel, presentation, expedition, combined-system, workspace, camera and collection checks. The game uses none of the testing runtime's development dependencies.

## Advancement coverage

- All 44 milestones have unique IDs, original vector badges and valid branch metadata. The 24 existing milestones remain. Related links are acyclic guidance and do not block earning. Each of the 12 new astronomical milestones checks the attained evolution class rather than mass alone.
- The two coherent-capture totals are specific to the current journey. Stable-moon checks require an actual stable planet/moon hierarchy; the belt milestone requires real stable bodies. The resonance milestone waits for the existing measured fifteen-second relationship. Companion specialization, finite encounters and class directives use their real state and counters.
- Milestones add no mass, DNA, water, pets or adaptation points. Last-second capture milestones survive game over. Older recorded classes reconcile silently rather than replaying notifications. New IDs persist with the existing save array, slot isolation, storage key and checkpoint cadence. Sandbox cannot award journey milestones.
- Genuine unlocks are queued once and shown in order through a single plaque DOM element. The task, goal and challenge types have distinct duration and procedural synthesis. Chimes begin when a plaque is displayed, obey mute, and use the existing audio context. These checks verify synthesis and controls, not audible quality.
- Menus, cinematic evolution, photo mode and hidden HUD defer plaques; an obscured active plaque freezes its timer. Top/bottom placement applies on the first frame. Disabling notices still records achievements. Restart and slot changes clear active/pending plaques without new listeners, RAF loops or timers.
- All six advancement branches, exact earned totals, cross-branch search, earned/locked filtering, related links, selected requirements and observable progress are covered. Arrow-key navigation selects another node without earning it. J toggles the advancement window without applying thrust. Records and journey-log views remain accessible.
- Twenty-two actual local SVG emblem kinds and the production seventeen-node astronomical map geometry were rendered with native software Canvas and visually inspected. This validates the vector art and node/path geometry; it is not a browser HTML/CSS layout inspection.

## Retained regression coverage

All retained suites pass: stable hierarchical orbits, rival-built systems and theft, nebulae, protoplanetary formation, delayed accretion, mass conservation, all 21 classes, nine rivals, eighteen adaptations, fifty companions, resources, wheel odds/cost, three independent slots, three-evolution checkpoints, menus, settings, centered camera, old dotted trajectory/circular endpoint, depth-correct boost, collection repair and repeated restarts. The optional definition-only diagnostic page passes all 84 physics checks, starts no game loop and restores saved/sandbox state. Those repeated checks are not counted twice.

## Offline audit, overhead and limits

The final source audit passes JavaScript syntax, 188 resolved local HTML references, unique page IDs/titles, CSS delimiters, XML and forbidden runtime dependencies. All scripts remain classic and ordered on window.AC; there are no module imports, fetch requests, workers, external assets or CDN dependencies. The ZIP is checked for integrity and byte-for-byte source parity. Launch remains extract, open Accretion, double-click index.html.

The new milestone scan runs once per simulated second and uses the existing bounded body/system state. The map is rebuilt when opened or interacted with, not on each physics frame. One plaque and a bounded catalogue replace simultaneous achievement toast creation. The existing particle pool, fixed-step loop, spatial hash, Performance detail and render pipeline remain. No browser FPS claim is made; dense-scene measurements in the 3.0.0 report below describe that earlier build and have not been repeated for this UI-focused update.

A downloaded Chromium engine identified its version but terminated with SIGTRAP before a page opened. Real-browser file:// launch, console, CSS layout, audible output and browser downloads remain unverified in this environment. Isolated runtimes and native Canvas are not substitutes for those checks. No public hosting or publication occurred; RELEASE_READINESS.md retains the existing launch gates.

Current details: tests/cosmic-advancements-validation.json, tests/advancement-results.json, tests/physics-results.json, tests/diagnostics-page-results.json and tests/cosmic-advancements-audit.json. Reports below are historical.

# 3.0.0 Living Frontier validation

205 automated checks passed using the production classic scripts in isolated VM/DOM and native software Canvas runtimes. These are 79 physics/progression checks, 16 new Living Frontier integration checks and 110 retained save-slot, Life Lab, wheel, presentation, expedition, combined-system, workspace, camera and collection checks. No development dependency is used by the playable game.

## New and retained coverage

- Scalar three-dimensional orbital elements preserve energy, angular momentum, eccentricity and inclination while reusing output storage. Cached gravity responds to changed mass, adaptations and amplification. Composition reuse still repairs malformed mixtures.
- Finite resource fields have reproducible ribbon, corridor and cluster geometry, shared drift and entity-budget limits. Stellar world passages include actual planetary masses with tangential velocities. Rival fields use their own host and can build bound systems away from the player.
- Journey goals measure actual capture counts, controlled coasting, explored sectors, sustained system health, condensation or inner accretion. Each class grants at most one adaptation point. Neither discovery nor a goal creates laboratory resources or pet rewards. Black-hole goals exclude captured mass that has not accreted.
- Formation previews use eligible rotating, cooling matter rather than a decorative timer. Actual births conserve transferred mass. Incoming, rotating disk and inner-flow reservoirs partition captured matter without overlap. Black-hole flow retains its minimum six-second delay and gradual transfer.
- The orbital observatory draws real positions and cached paths, selects a body from its diagram, retains star/planet/moon inspection and marks risk. Matter view describes its actual reservoirs and rate. Flight notes, archive entries and rival intentions render through the existing interface.
- Full vault reload preserves completed goals, journal, fields, rival routes and stored matter. Completing a goal cannot bypass a slot's three-evolution checkpoint cadence. New lifetime counters account once. Existing old checkpoints remain valid; malformed new values are rejected.
- Ten new restart cycles clear world, matter, particles, formation previews, diagrams, selected bodies and goal state without additional listeners or animation loops. The retained suites also cover repeated restarts, all 21 classes, all 50 companions, 18 adaptations, nine rivals, settings, slots and original menus.
- Companion effects, resource fields, fragments, boost exhaust and stellar-weather rings retain their physical depth. Camera-cache compensation follows translation and zoom. Performance detail reduces gas sampling, trails, particles and lens work. Small bodies remain physical simulation entities when their drawing is batched.
- The procedural audio extension creates one context and persistent layers once, fades motion/feeding during pause and routes mute through the existing master. New cues throttle repetition. This verifies control and synthesis calls, not audible quality.
- The 2.4.3 collection repair remains covered: boosted and moving black holes deliver mass and the original water/DNA payloads, escaped matter keeps unclaimed resources, reload cannot duplicate samples, and gas leaves room for coherent-body packets. Wheel costs stay 500 water plus 100 DNA with 59/35/5/1 rarity odds. Scarcity is unchanged.
- The original dotted trajectory, circular endpoint, inset clipping, centered camera and visible depth-correct boost effects remain. Forecasts leave the live universe unchanged. Native Canvas scenes at stellar and compact scales were visually inspected.

The optional physics diagnostic page was also loaded in its own definition-only script order: all 79 checks pass without starting a game loop, and running them restores the original saved state and sandbox mode. This repeats the physics suite; it is not counted as another 79 unique checks.

## Matched dense-scene measurements

The 2.4.3 and 3.0.0 sources were restored from identical saved starting scenes at 1440 by 900. Each process ran 40 warmup steps and 110 timed steps. Scene replenishment was disabled equally, while physical simulation and rendering remained active. Dense late-stage scenes include eight nebulae, 224 finite gas cells, 148 stored matter packets and nine rivals. High detail holds 1,200 effect particles; Performance holds 420.

Median wall times below use native software Canvas in a shared workspace. They are separate simulation and rendering costs, not browser frame times. The high-detail stellar row uses the median of three alternating paired repeat trials; other rows use the matched comparison run.

| Scene | Bodies | Simulation 2.4.3 | Simulation 3.0.0 | Rendering 2.4.3 | Rendering 3.0.0 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Asteroid, high | 1,120 | 7.557 ms | 6.029 ms | 29.005 ms | 15.014 ms |
| Asteroid, Performance | 1,120 | 7.016 ms | 6.491 ms | 21.613 ms | 9.625 ms |
| Star, high, paired median | 520 | 16.281 ms | 12.261 ms | 59.896 ms | 42.694 ms |
| Star, Performance | 400 | 10.013 ms | 6.896 ms | 29.332 ms | 12.570 ms |
| Black hole, high | 325 | 18.880 ms | 14.222 ms | 40.074 ms | 36.787 ms |
| Black hole, Performance | 259 | 15.845 ms | 11.165 ms | 16.483 ms | 13.519 ms |

The first high-detail stellar comparison was slower in 3.0.0: 51.499 to 55.520 ms rendering and 12.377 to 15.813 ms simulation. Three alternating paired repeats resolved that inconsistent result: each repeat had lower rendering and simulation costs in the new build, with rendering reductions from 28.7% to 38.0%. All raw initial and repeat results are included. Shared-machine scheduling and software rendering produce substantial timing variance.

These stress scenes can exceed a 16.7 ms total frame budget. Roughly 60 FPS on an actual desktop is not established by these tests. High-detail stellar and black-hole scenes remain expensive in software rendering. The existing Adaptive setting reduces effect detail and drawing resolution, and Performance uses lower physical late-stage budgets and reduced visual sampling.

## Offline audit and limits

The final local-reference, JavaScript syntax, unique page title/ID, CSS delimiter, XML and forbidden runtime-dependency audit passed. The packaged archive is checked for integrity and byte-for-byte source parity. The launch path remains extract, open Accretion, double-click index.html; no module imports, fetch requests, workers, accounts, installers, external assets or CDN libraries are introduced.

Direct real-browser file:// launching, browser console, HTML/CSS layout, audible output and browser downloads remain unverified because no browser engine is available in this environment. Isolated DOM and native Canvas tests do not substitute for those checks. No public deployment occurred; existing publication gates remain in RELEASE_READINESS.md.

Current details: tests/living-frontier-validation.json, tests/frontier-results.json, tests/physics-results.json, tests/diagnostics-page-results.json, tests/dense-legacy-matched.json, tests/dense-final-matched.json and tests/stellar-repeat.json. The version reports below are historical; their timings and counts describe those earlier builds.

# 2.4.3 Black-hole collection and pointer repair

171 automated checks passed using the actual ordered production scripts in isolated DOM and native software Canvas runtimes: 61 physics/progression checks, 11 collection integration checks and 99 save-slot, Life Lab, wheel, presentation, expedition, combined-system, workspace and camera checks. The main collection test executes Game.frame(), including its fixed-step accumulator, HUD updates and renderer, rather than testing the physics helper alone.

## Reproduced faults

In the original 2.4.2 build, tidal breakup discarded water and DNA because normal resource collection only handled coherent-body contacts. In a head-on boosted black-hole encounter, the parcel reached the inner region, then the source outran it before its six-second feeding gate. That test recorded no mass gain and no resources after thirty simulated seconds. A depth-aware camera also projected two-dimensional boost particles away from a source whose z coordinate had changed.

## Verified repairs

- Tidal streams preserve the asteroid's existing water and DNA. Remote capture alone awards nothing; inner delivery collects each payload once. Escaping material retains unclaimed payloads. No spawn yields, rarity probabilities or wheel costs were increased.
- Material entering the black-hole inner flow dissipates impact energy and follows source acceleration while retaining relative motion. The six-second minimum and gradual transfer rate remain. Outer material still escapes or transfers to a stronger rival.
- Boosted, sustained-thrust and coasting encounters grow and deliver the original two-water/one-DNA fixture at three black-hole classes. Early asteroid/planetary collection still works.
- Checkpoints preserve remaining mass, payloads, collection flags and accepted inner flow. Reload cannot duplicate resources. Older snapshots lacking the new fields continue feeding; invalid fields are rejected.
- Coarse gas has a 148-parcel allocation limit, reserving twelve slots within the original total cap of 160 for coherent captures. Escaped matter can reclaim an inactive world slot. All retained orbital hierarchy, rival-system, nebula, formation, mass-conservation and disk-delay checks pass.
- The previous dotted path and circular endpoint are restored. Additional local chevrons and thrust dots are removed. Centered camera transforms, corrected forecasts and inset clipping remain verified.
- Boost particles use the source's depth coordinate and velocity. Pooled particles reset those values. A native Canvas image was inspected at nonzero depth to confirm a centered source, visible exhaust and the old circular endpoint.
- Eight collection-specific restarts, twenty workspace restarts and prior integration restart checks do not add loops, listeners or stale effects/reservoirs. Wheel odds remain 59/35/5/1 with a 500-water/100-DNA charge; three-evolution checkpoints remain intact.

## Offline audit and limits

All 174 local references resolve. JavaScript syntax, unique HTML IDs/titles, CSS structure and ZIP source parity/integrity checks pass. No runtime requests, modules, workers, build tools, remote assets or CDN dependencies were introduced. The playable ZIP contains the complete source under Accretion; open its index.html after extraction.

Direct real-browser file:// launching, browser console, HTML/CSS layout, audible output and browser downloads remain unverified because no browser engine is installed in this environment. Native Canvas and DOM tests are not a substitute for those checks, and no browser FPS guarantee is claimed. Publication gates remain unchanged; no deployment occurred.

Current details: tests/collection-validation.json, tests/collection-results.json, tests/collection-audit.json and tests/physics-results.json. Reports below are historical.

# 2.4.2 Camera lock and trajectory validation

154 automated checks passed, including 19 new camera/forecast checks and all 135 prior regression checks. Tests load the production classic scripts in isolated DOM/native software Canvas runtimes. Optional diagnostics require no tooling to play the game.

Camera checks cover all 21 classes at four interpolation phases, nonzero depth, large velocities, production drawing, selected system view, pause, matching background transforms, free photo camera and exact restoration, R recenter/reset, floating-origin rebasing, resizing, cinematic zoom and restart. Mouse aiming remains centered even during fixed physics steps before the next render, and corrects projection tilt.

Forecast checks cover the visible body's starting position, inset clipping in eight directions across five scale levels, uniform horizon across classes, actual fixed-step coasting against an anchored gravity source, moving-threat swept contact, zero/near-rest/depth motion, nonmutation of the live universe, bounded source/sample counts, offscreen photo behavior, and suppression of tiny or overlapping field labels over the player. A native Canvas image was inspected for centering and contact-marker alignment. This does not verify HTML/CSS in a real browser.

The forecast simulates coasting, with no ongoing thrust or braking. Other gravity sources continue their current velocity rather than replaying AI or mutual N-body motion. It is an estimate. Zoom is smooth; intentional collision shake can move the scene by up to six screen pixels.

## Prediction cost

A dense synthetic case with 32 available gravity sources was measured over 300 timed calls after 50 warmup calls. High detail uses at most 12 sources and Performance at most six, with a maximum six-second horizon and reduced drawing samples. These are isolated forecast times, not browser FPS.

| Mode | Sources | Median | p95 |
| --- | ---: | ---: | ---: |
| High | 12 | 0.508 ms | 0.633 ms |
| Performance | 6 | 0.298 ms | 0.366 ms |

All prior physics, rivals, orbital systems, nebula/accretion, companions, wheel, upgrades, audio cues, expedition, settings, checkpoints, three save slots, dock shortcuts and restart tests pass. The local-reference audit resolves 174 references; all scripts parse, page titles and HTML IDs are unique, CSS braces balance, and no modules, runtime requests, workers, external assets or CDNs were added. ZIP entries are checked against their source bytes and for archive integrity.

Real-browser file:// launch, browser console, CSS layout, audible output and browser downloads remain unverified in this environment. Publication gates are unchanged and no deployment occurred.

Current details: tests/camera-validation.json, tests/camera-results.json, tests/camera-audit.json and tests/forecast-performance.json. Historical reports follow.

# 2.4.1 Smooth flight and workspace validation

135 automated checks passed: 55 physics/progression/orbital checks, 13 save-slot checks, five Life Lab checks, ten wheel checks, nine presentation/runtime checks, 18 expedition checks, six combined-system checks and 19 workspace checks. These use the actual ordered production scripts in isolated DOM/native software Canvas runtimes. No development dependencies are required to play.

New movement checks cover all 21 classes with equal normalized thrust and cruising speed; uniform boosts, upgrades and braking at asteroid, planetary, stellar and compact scales; gentle star movement with independent bound bodies; unchanged base/ranked orbital stress; disruptive boosts; and stopping satellite acceleration when the star reaches its cruise equilibrium.

Workspace checks cover all seven instrument shortcuts, repeat protection, minimizing/restoring retained windows, deferred adaptation choices, number-key selection in Adaptations, pet-name typing isolation, pointer auto-hide, keyboard focus retention, restore with the full HUD hidden, F minimizing a modal before opening the dock, photo camera restoration, contextual system/sandbox availability, independent per-slot layouts, old-save defaults, invalid-name sanitization, atomic three-evolution checkpoints, twenty restarts without extra loops/listeners, native button activation without accidental boosting, and preserving Tab navigation inside the dock.

The earlier regression suites recheck rival systems, nebula/accretion matter conservation, moons, resonances, weather, pet passives/evolution, checkpoints, replay/photo mode, all retained menus and procedural audio cues. Dense-scene measurements below are historical measurements from the prior build, not new browser FPS claims.

Local-reference audit: 174 local references resolve, HTML IDs and page titles are unique, all JavaScript syntax checks pass, CSS braces balance, and no runtime requests, workers, modules, remote assets or CDN dependencies were introduced. Both offline integration-diagnostic pages include the current dock and toolbar. ZIP integrity and extracted references are checked before delivery.

Browser limitation: this environment did not permit direct real-browser file://, console, CSS layout, audible-output or download verification. The automated runtimes do not substitute for those checks. The game remains an unpublished local build; the existing publication gates remain in RELEASE_READINESS.md.

Detailed current results: tests/smooth-flight-validation.json, tests/physics-results.json, tests/workspace-results.json and tests/workspace-audit.json. Historical reports follow.

# 2.4.0 Expedition systems validation

101 automated checks passed using the actual ordered game scripts: 46 physics/progression/cosmic/companion checks, 13 save-slot checks, five Life Lab integration checks, ten discovery-wheel checks, nine presentation/runtime checks and 18 Expedition checks. The isolated runtimes use a DOM adapter and native software Canvas. No new dependencies are required by the playable game.

Verified galaxy-chart checkpoint/reload and floating-origin continuity; extraction-driven density; experience-gated pet branches and distinct specialization silhouettes; weighted planet composition and pooled-state reset; moving habitable zones and weather-sensitive climate; stable 2:1 pairs gaining and losing bonuses; star/planet/moon hierarchy; twelve-second flare forecasts and once-per-wave atmospheric/velocity effects; actual compact magnetar sources and saved wave state; sandbox resources, deaths, achievements and records staying outside normal slots; recorded encounters surviving game over; replay selection following the active slot; frozen photo camera and valid PNG image generation; menu/control rendering; procedural sound cue synthesis; malformed-save rejection; and twenty repeated restarts/mode switches without added loops or listeners.

The main regression suite also rechecks rival systems, stable orbits, capture conservation, accretion delay, protoplanetary formation, nebula gas transfer, settings, upgrades, progression and original controls. The archive, wheel odds (59/35/5/1), 500-water/100-DNA cost and fifty-species collection remain intact.

## Dense-scene measurements

Measured at 1440 by 900 with eight nebula regions, 224 finite gas cells and crowded matter reservoirs. Median simulation/render times below are separate measurements in a native software Canvas harness, not browser FPS.

| Scene | Bodies | Parcels | Simulation median | Software rendering median | New systems p95 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Star, high detail | 520 | 160 | 6.30 ms | 18.24 ms | 0.66 ms |
| Star, Performance | 400 | 160 | 5.04 ms | 9.57 ms | 0.57 ms |
| Black hole, Performance | 260 | 126 | 6.91 ms | 8.02 ms | 0.37 ms |

High-detail dense scenes exceed a 60 FPS frame budget in software rendering. The existing adaptive setting reduces rendering resolution/effects in response to frame rate, and Performance reduces late-stage body limits, gas drawing frequency, orbit detail, trails and replay sampling. Roughly 60 FPS cannot be guaranteed across browsers or hardware. Recording is capped at 84 frames and 25 bodies, chart storage at 256 sectors, and matter parcels at 160.

## Offline and publication limits

The local-reference and syntax audit passes. All scripts are classic scripts under window.AC; there are no module imports, fetch requests, workers, build steps or remote game assets. PNG export uses a local canvas data URL. ZIP integrity was checked. Extract the folder and open index.html.

Direct browser file:// launch, browser console, CSS layout at real viewport sizes, download behavior and audible output could not be reverified in this environment. Native Canvas and isolated-runtime results do not substitute for those checks. No public deployment occurred. The existing domain/operator/hosting and browser publication gates remain in RELEASE_READINESS.md.

Detailed results: tests/expedition-results.json and tests/expedition-performance.json. Historical version reports follow.

# 2.3.0 publication-review validation

## Executed checks

80 automated checks passed: 43 physics/progression/cosmic/companion checks, 13 save-slot and pet checks, five Life Lab integration checks, ten discovery-wheel checks, and nine new presentation/control/runtime checks. These execute actual ordered scripts in isolated runtimes with a DOM adapter and native Canvas. No runtime error or warning was captured in the targeted 21-class rendering/menu smoke test. This does not constitute a real browser console inspection.

The new checks cover mouse target initialization, mouseleave cancellation, keyboard preservation, center dead zone, menu labels, numbered adaptations, mute-state accuracy, rendering across 21 astronomical classes, offline/online 404 link base behavior and version consistency. Existing tests recheck migration, resource claims, per-slot progress, three-evolution checkpoints, pets and restarts.

The source audit checked eight unique page titles, 160 local references, JavaScript syntax, CSS delimiter balance, local favicon/XML parsing, prelaunch noindex tags and the absence of automatic remote runtime requests. Ten external documentation links are deliberate references, not runtime dependencies. The current sitemap is well-formed inactive XML with no URLs and must not be submitted as a production sitemap.

## Explicit limits and launch blockers

Direct browser file:// launch, actual browser console output, CSS layout at real viewport widths, accessibility behavior and audible output were not reverified in this environment. No local browser capability is available. No errors were hidden by installing error-swallowing handlers. Browser testing remains a required prelaunch gate.

No domain, hosting service, operator identity or contact method was supplied. Nothing was deployed. Server-side 404 responses, DNS, TLS, canonical URLs, indexing and host log practices cannot be confirmed before those facts exist. The policy pages describe the offline build only and do not certify legal compliance. See RELEASE_READINESS.md for the remaining work.

Detailed new reports: tests/editorial-results.json and tests/prepublication-site-audit.json. Earlier reports below describe their respective versions and testing limits.

# 2.2.0 ; Save slots and companion rendering
# 2.3.0 — Companion ecology, rival personality, stellar progression

**47 / 47 automated physics checks passed**, up from 43. The four additions are companion buff resolution across all five rarity tiers including the new shape passives; the discovery wheel's documented 59/35/5/1 mapping; initialisation, single-increment behaviour and save round-tripping of the three new lifetime keys; and the system-stability bonus falling to zero on a destabilising event then recovering after thirty quiet seconds with three stable planets. Tests execute the actual ordered scripts in isolated runtimes with a DOM adapter. They are not browser layout tests.

Alongside the physics suite, **23 / 23 DOM checks** and **17 / 17 save-migration checks** passed in a full jsdom boot of `index.html` with the real ordered scripts and a stubbed 2D context.

## Stellar progression correction

The 2.2.0 report did not measure per-class pacing. Measurement here used a headless harness running the real `world`, `physics` and `cosmic` modules with a steering autopilot that seeks capturable bodies and retreats from heavier ones, recording minutes of play to gain the 5x simulation mass one class requires.

| Class | 2.2.0 | 2.3.0 |
| --- | ---: | ---: |
| Terrestrial planet (stage 5) | 2.6 min | 2.4 min |
| Gas giant (stage 7) | 3.2 min | 3.1 min |
| Red dwarf star (stage 9) | 57.5 min | 2.4 / 4.2 min |
| Sun-like star (stage 10) | 241 min | 3.5 / 5.5 min |
| Blue supergiant (stage 12) | 814 min | 3.0 min |
| Stellar colossus (stage 14) | not measured | 2.6 min |
| Stellar-origin black hole (stage 15) | not measured | 4.4 min |

Four independent causes were traced, all confined to stages 9-14. Stellar gas parcels carried a drag coefficient of `.004`, so gas entering an accretion disk orbited for minutes without crossing the inner boundary. Nebulae spawned 500-2000 units from a star against an intake radius near 507 units; instrumentation recorded 2.74x player mass created as gas of which 0.066x ever reached a parcel, the remainder drifting unbound and being culled. Field bodies were generated at 0.002-0.7% of player mass against 1.8-13.3% at every other scale, although the class table is self-similar at every step. Fragmentation debris occupied 252 of 520 body slots, displacing capturable worlds. Black-hole behaviour at stage 15 and above was not altered; its measured pacing is reported for the first time here.

## Trajectory forecast correction

`trajectory()` projected through `screen(x, y)` with no third argument while the player body is drawn through `bodyPoint()`, which passes `z`. Because the integrator accumulates `az` on the player and the camera tilt falls to 0.72 at stellar scale, the forecast was drawn on a different plane from the body it belonged to. It also began at the end-of-step simulation position rather than the interpolated render position, and applied softening derived from the source radius alone where the integrator uses `max(source.r * .18, player.r * .4)`.

The rewritten forecast integrates all three axes from the interpolated render position, mirrors the integrator's softening, resist upgrade, grace factor and speed cap, and scales its step with class so the arc stays legible where stellar thrust is an eighth of asteroid thrust. Measured start-point offset from the rendered body is 0.000 px at mid-step; a regression guard asserts the previous start point was measurably offset for the same state.

## Coverage of new behaviour

- Companion buffs resolve for all fifty companions. Each silhouette family maps to exactly one secondary passive, passive values rise monotonically across rarity, unrelated passive keys stay at zero, and the unequipped table is fully neutral. The resolved table is cached per equipped companion because it is read every frame.
- Life Lab tab strip renders four tabs through the existing `data-action` routing, shows exactly one section at a time, and lists all fifty cards with their shape passive. Active tab is transient UI state and is not written to the vault.
- Life Lab first-use text is recorded in the existing `hintsSeen` array and does not reappear once seen.
- Incubation flavour resolves to five distinct bands per rarity across the 25/50/75/100% thresholds.
- Lifetime counters credit only the delta between checkpoints. Repeated accounting of identical statistics, and accounting after a statistics round trip, both leave the totals unchanged. `longestRun` retains its maximum when a shorter run finishes afterwards.
- Save migration verified from the 2.2.0 slots vault and from the pre-slots 2.1.x flat profile. Existing best mass, lifetime totals, collections, nicknames, hints and settings survive; the three new lifetime keys and the `companionLabel` setting initialise to their defaults. The three new achievements are defined and unearned.
- Driven restarts add no additional animation callbacks; exactly one `requestAnimationFrame` callback is outstanding per frame. Restart now also clears the renderer sprite cache, the cosmic stamp cache and all effect arrays.
- Menu, flight, all panels, restart, forced stellar stage, forced black-hole stage and game over were driven in sequence with **zero console errors and zero warnings**.

## Performance and stability audit

Effect arrays were audited for unbounded growth. Particles already recycled through a pool but the pool itself was unbounded across a long session and is now capped at 1400; rings and labels expire on lifetime and are additionally capped at 24 and 15.

The spatial hash cell size already scaled with `A.unit(player.m)`, but measured occupancy was 0.4-0.8 bodies per cell against the 4-10 target, meaning the query path paid for a large number of empty cell lookups. Cell size is now tuned from live body count and spread at evolution boundaries and scaled proportionally between them. Measured occupancy at star stage is 5.2 bodies per cell across 99 occupied cells.

Adaptive quality coverage was checked on the three newest layers. Nebula flow cells already scaled their render resolution and refresh cadence with the detail multiplier, and their trails were already gated. The gravitational lensing pass ran unconditionally and now returns early below half detail. The companion portrait drew unconditionally and is now gated behind the same multiplier.

## Offline and package audit

Four HTML pages resolve all 66 local script, style and navigation references. All nineteen JavaScript files pass syntax checking. HTML IDs are unique per page. No `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `Worker`, ES module, CDN or external asset dependency is present; the only `data:` URIs are inline favicons. Classic scripts share `window.AC` in a fixed order of sixteen files. The storage key remains `accretion.v1`.

## Direct-browser limitation

Local `file:` navigation remains unavailable in this environment. Direct double-click launch, real browser console output, final CSS layout, audible output and hardware frame rate could not be empirically verified. DOM routes, canvas call sequences, synthesis scheduling and local references were exercised in an isolated runtime instead. The dense-scene software-rendering measurements recorded for 2.1 below are unchanged by this release and **still exceed the 16.7 ms budget; 60 FPS is not verified and not guaranteed.**

Optional browser diagnostics remain `tests/physics-tests.html`, `tests/cosmic-tests.html` and `tests/life-tests.html`.


61 automated checks passed: 43 existing physics, progression, cosmic-system and recipe checks; 13 focused save-slot/companion checks; and five Life Lab integration checks. Tests execute the actual ordered scripts in isolated runtimes with a DOM adapter and native Canvas. They are not browser layout tests.

Verified: migration from the original single-profile format; three independent journeys and collections; checkpoints after exactly three new evolutions; no intermediate resource/world mismatch; manual saving; timed mode; settings shared across slots; reload rollback; game-over isolation; admin removal; all 50 procedural creatures; animated preview; size persistence; unchanged buffs; reduced-motion freeze; storage-failure reporting. Twenty repeated restarts/slot switches add no listeners or animation loops. The thumbnail cache remains capped at 50.

Rendered and visually inspected the 50-creature catalog and live preview. Creature rendering at the largest preview size measured 0.151 ms median and 0.359 ms p95 over 600 samples in the native software Canvas harness. Preview refresh is capped at 30 Hz (20 Hz in Performance mode); only the equipped creature animates in flight. This is incremental renderer cost, not an overall 60 FPS claim. Existing dense-scene limitations below remain.

Local-reference and JavaScript syntax audit: 66 local references resolve, 19 scripts parse, no external requests or worker dependencies. ZIP integrity checked. The offline classic-script architecture is preserved. Direct browser file:// launching, browser console, CSS layout and audible output could not be reverified because local browser navigation is unavailable in this environment.

Detailed new results: tests/slots-results.json and tests/pet-profile.json. Historical reports below describe their respective versions; former admin tests do not apply to this release.

# 2.1.5 permanent class selector validation

Five targeted runtime checks passed: hotkey/menu and repeated immediate switching; collection/egg/nickname/adaptation preservation; selection persistence beyond the former timer and across reload; finite cosmic matter during large upward/downward scale changes; and removal of legacy cooldown data without duplicate listeners or loops. Local-reference/syntax audit and ZIP integrity checks passed. Direct browser testing remains unavailable. Earlier preview tests below document historical behavior and are superseded by this patch.

# 2.1.4 buffs and preview validation

50 automated checks passed: 43 existing physics/progression/recipes checks and seven focused buffs/preview checks. Focused checks cover each rarity's real thrust and gravity multipliers, actual 15% legendary collision-damage reduction, the admin shortcut and all 21 class options, complete original-state restoration, blocked preview save writes, cooldown persistence across reload/restart, finite simulation and rendering for all classes, early return, restart recovery and unchanged animation-loop/listener counts. Preview results are in tests/preview-results.json.

Local reference/syntax and ZIP integrity checks repeated. Browser-specific layout, shortcut interception, sound and direct file launch remain unverified because local browser navigation is unavailable. Existing performance limitations below remain unchanged. Earlier results below are historical where not rerun for this patch.

# 2.1.3 wheel validation

Ten focused checks passed: exact 59/35/5/1 sector mapping across 10,000 evenly spaced inputs; legendary selection; exact resource charge; animation re-entry lock; result display; egg persistence; complete-sector no-charge behavior; full-incubator blocking; removal of visible recipe buttons; all 50 pets retained in sector pools. Syntax and local-file reference audits passed. Browser testing remains unavailable; previous results below are historical where not rerun for this patch.

# 2.1.2 scarcity patch validation

53 automated checks passed for this patch: the 43-check physics/progression/recipes suite, five existing Life Lab integration checks, and five focused scarcity/migration checks. A seeded sample of 96,000 ordinary field asteroids contained 11,400 icy bodies (11.875%), 2,320 DNA samples (2.417% of all bodies), and 17,101 water. Of 4,000 fields, 2,232 contained no DNA; guaranteed field starters are gone.

Verified legendary resource gates, exact deductions, the 180-second timer surviving save/reload, accurate incubation display, legacy egg waits, existing resources and pets, and unchanged collision claim persistence. Local references/syntax and ZIP integrity were checked. Direct browser testing remains unavailable; earlier performance limitations remain unchanged. Detailed scarcity results are in tests/scarcity-results.json. Earlier-version results below are historical where not rerun for this patch.

# 2.1.1 patch validation

Six targeted isolated-runtime checks passed: nickname persistence through reload/restart, safe text rendering and Enter submission, reset/legacy-save migration, H/repeat/input behavior, pause/resume/restart recovery, and no duplicate listeners or loops. The existing Life Lab integration suite was also rerun. The source/syntax/local-reference audit and ZIP integrity checks were repeated. Direct browser testing remains unavailable; the 2.1 performance limitations below remain unchanged.

# ACCRETION 2.1 ; Living Systems & Life Lab: validation

## Automated result

**92 / 92 checks passed.** These execute the actual ordered JavaScript in isolated runtimes with a DOM adapter and native software Canvas. They are not browser layout or hardware-FPS tests.

| Suite | Passed |
| --- | ---: |
| Physics, progression, rival systems, conservation, companion recipes | 43 / 43 |
| Original menus, controls, abilities, saves, audio and rendering | 11 / 11 |
| Existing cosmic systems regression | 22 / 22 |
| Rival behavior, updated UI, milestones, audio, quality and restart integration | 11 / 11 |
| Life Lab menus, incubation, reload, restart and companion scanner | 5 / 5 |

The complete check names and results are in `tests/validation-results.json`.

## Coverage

- Stable, eccentric and unbound trajectories; two complete stellar revolutions; planet/moon hierarchy; gentle movement and violent ejection; collapse with continuous motion; binary barycenter behavior.
- Rival-built systems, planet stealing, close-pass destabilization, actual disk ownership transfer with conservation, missing-parent recovery.
- Protoplanetary condensation from existing mass; finite nebula consumption; delayed black-hole inner transfer; localized lensing; bounded galactic spawning; scale transitions retaining matter.
- Existing nine rivals/five personalities, original fifteen classes and fourteen adaptations preserved. Cosmic classes and ranked system/black-hole upgrades remain available.
- New achievement conditions, idempotent lifetime counters, system/rival/disk saves, ranked upgrade choices, bounded bonuses that fade when bodies are lost.
- Mass-scaled cues, four ambient profiles using one synthesis graph, mute, finite audio envelopes. Audible output requires browser verification.
- Local trajectory hints, selection and ownership controls, danger markers, feeding terms, remembered first-use explanations, cinematic milestones and archive entries.
- Fifty unique companion recipes in 20/14/8/5/3 rarity distribution. Every recipe is crafted, incubated, hatched and equipped in a test. Costs, insufficient funds, duplicate prevention and three-egg limit checked.
- Collision-only water/DNA collection, no repeated claim, simultaneous resource/claim checkpoint, pooled-body reset, malformed collection normalization, persistent eggs and equipment, paused incubation, active scanner benefit.
- Repeated restarts retain collection and clear transient systems/pools without extra animation loops or listeners. All fifty procedural portraits render and their contact sheet was visually inspected.

## Dense-scene measurements

Seeded stress scenes used eight nebula regions (224 coarse gas cells), nine rivals, procedural resources, live simulation and live software-Canvas rendering. The belt scene additionally began with sixty satellites. Each row measures 60 frames after simulation/render warmup. High uses 1440 × 900; Performance uses 864 × 540 for the same 1440 × 900 viewport. These forced-quality measurements do not exercise the adaptive frame-rate controller.

| Scene | Quality | Bodies / parcels | Simulation median | Render median | Combined median | Combined p95 |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Nebula | High | 534 / 70 | 8.99 ms | 48.84 ms | 58.75 ms | 80.23 ms |
| Nebula | Performance | 429 / 69 | 7.25 ms | 27.84 ms | 35.36 ms | 43.71 ms |
| Belt | High | 538 / 80 | 8.22 ms | 55.26 ms | 64.64 ms | 100.81 ms |
| Belt | Performance | 417 / 30 | 7.13 ms | 31.57 ms | 38.66 ms | 89.50 ms |
| Galactic | High | 356 / 117 | 10.83 ms | 69.18 ms | 80.13 ms | 93.49 ms |
| Galactic | Performance | 274 / 116 | 8.75 ms | 27.94 ms | 37.29 ms | 53.32 ms |

**The dense software-rendering tests still exceed the 16.7 ms budget. 60 FPS has not been verified and is not guaranteed.** Performance mode materially reduces cost, but does not meet that target in this stress harness. Browser hardware acceleration may differ; it was not available for measurement.

Implemented reductions include bounded per-owner orbit evaluation, pooled captured parcels/trail points, fixed gas-cell budgets, cached low-resolution nebula rendering, cached lens sources and black-hole silhouettes, stream sprite LOD and fragment limits, sampled trails/stars, and quality-dependent body budgets. The adaptive controller lowers render resolution and decorative detail when measured frame rate drops below 53 FPS and restores detail slowly above 58 FPS. Physics ownership and stored matter remain real at every quality level. Pets add only one lightweight follower and a bounded scanner, not fifty simulated entities.

Detailed measurements are in `tests/performance-results.json`.

## Offline and package audit

Four HTML pages resolve all 66 local script, style and navigation references. All nineteen JavaScript files pass syntax checking. HTML IDs are unique. No runtime fetch, XMLHttpRequest, WebSocket, EventSource, Worker, ES module, CDN or external asset dependency is present. Classic scripts share `window.AC`. The original localStorage key remains `accretion.v1`; older run snapshots are accepted and Life Lab defaults migrate into existing records.

The final ZIP is checked for CRC integrity and contains the complete project. Launch needs only extraction and opening `Accretion/index.html`.

## Direct-browser limitation

The available browser blocked local `file:` navigation. Direct double-click launch, browser console output, final CSS layout, audible output and browser FPS could not be empirically verified. No alternate route was used to bypass that restriction. DOM routes, Canvas drawing, synthesis scheduling and local references were checked in the isolated runtime instead.

Optional browser diagnostics are `tests/physics-tests.html`, `tests/cosmic-tests.html`, and `tests/life-tests.html`. They preserve existing records and do not form part of normal gameplay.
