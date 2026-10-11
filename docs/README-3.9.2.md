# Current release: ACCRETION 3.9.2 · Hardcore Frontier

Hardcore is selectable for new journeys in Settings: maximum cohesion is 50%, worlds and comparable ambient bodies grow scarcer with scale, and rare Hardcore caches contain extra water, DNA and 50–150 Raw Material. Existing captures, asteroid belts, nine rivals, alternate routes, engineering, companions and slot/checkpoint behavior remain intact. See HARDCORE.md for exact rules and verification. © 2026 Web Stars Studios. Extract the complete ZIP, then double-click index.html. No installation or internet is required.

The sections below retain the earlier 3.9.0 feature/reference history. The current code and HARDCORE.md take precedence for the final difficulty/cache changes.

# ACCRETION: Orbital Infrastructure

Version 3.9.0. Extract the entire ZIP and double-click **index.html**. No installation, server, account, build step or internet is needed.

Press **U** for the deterministic engineering tree. Earn one adaptation point at **50%** and one at **100%** of each evolution bar. At **Moon scale**, install the free **Orbital Outpost** in Mining. It sends a mining drone to break real rocks and carry **Raw Material** home. Build the **Research Centre** in Science for **25 Raw Material**; a powered batch converts **50 Raw Material into 1 Research Point in 18 simulated seconds**.

Five main branches, two side branches, and **56 stackable installations** replace the old random offers. Each rank shows its cost and prerequisites. Researched ranks use **1 adaptation point plus 1 Research Point**, rising to **2 Research Points** from rank three or after ten powered research minutes. Science unlocks weapons, shields, propulsion, advanced extraction, sample recovery, stellar engineering, energy and decorative follower worlds. Existing installed adaptation IDs and their effects are retained in older saves.

Attack turrets knock real mass loose from rivals and fracture rocks. **Science optics → attack lasers → mining lasers** is enforced. Energy progresses through turbines, fission, fusion, solar collectors and Dyson swarms. Batteries can divert all generation into charging, then spend it on a fleet overclock. Duration trades against strength; normal flight is always available. All purchases add procedural hardware to your current astronomical body. Decorative planets can be hidden.

Sandbox now lists every Supernova journey stage and provides add/remove mass controls using the current astronomical unit, with ×1 through ×1 million scaling. Stellar resources arrive in orbital groups with planets, moons and asteroid belts. Galactic-scale groups contain nested stars, local worlds and belts. Gravastars now show a hypothetical vacuum-energy interior and a thin physical shell, rather than a black-hole horizon.

Every black-hole class now has an original animated Canvas design, with distinct disk geometry, moving bright clumps, returned-light contours, and feeding-dependent jets. The Interstallar's outer filaments are individually advected. These are locally drawn paths, with no photograph or imported image asset. Performance reduces the geometry, and pause, Photo and Reduced Motion retain their controls. See **HORIZON_DESIGNS.md**.

Your nine rival personalities, companions and wheel odds, orbital capture, nebulae, accretion disks, Final Interstallar, audio, achievements, settings, themes, dock, minimap, leaderboard, checkpoints and save slots remain. The existing every-three-evolution/15-second checkpoint choice is respected; **Save now** makes an explicit checkpoint. Run snapshots use version **6**, accepting valid versions **1–5**. Keep the previous release as a backup; older releases cannot load the new snapshot format.

See **ORBITAL_ENGINEERING.md** for the full requirements catalogue and **TEST_REPORT.md** for this update’s checks, measured CPU performance and limits. Diagnostics remain offline under **tests/run-all.html**. This environment cannot open a real browser; native simulation/Canvas tests pass, while browser console, actual file-page interaction, WebGL and hardware FPS still require a browser check.

## Previous release: The Final Interstallar

A single-player, offline gravitational evolution game. Version 3.8.0 adds The Final Interstallar, an explorable late-game horizon, and replaces black-hole artwork with procedural ray-based disks and lensing. Extract the ZIP and double-click index.html. Nothing needs installing. The existing classes, routes, companions, wheel, adaptations, AI, interface, galactic encounter and save slots remain.

## The Final Interstallar

Actual black-hole forms discover a distant, persistent landmark. It belongs to the universe rather than the rival/body spawning pool. The Interstallar remains the original final named class; **The Final Interstallar** is an optional merger milestone followed by endless flight. Other routes do not discover this black-hole encounter naturally.

Follow the gold bearing marker or press **G** and **Plot final course**. Instrument **8** shows the zone, distance in shadow radii, bearing and approach condition. The beacon, lens, disk, photon region and inner-flow boundary become progressively hazardous. Early black holes can approach and turn back. Full outward thrust and early reaction matter; Shift brakes. After the inner-flow warning boundary, an unready horizon cannot escape. Defense adaptations and emergency shell retain their effects. A stationary outer-disk approach survives at least 45 seconds in the tested fixture.

At The Interstallar or greater black-hole scale, enter between 1 and 3 shadow radii, slow below 38 scale-relative units/second and hold steady for 1.5 simulation seconds. Invulnerability and a recent evolution postpone the merger. The sequence lasts ten seconds of active, visible time, pauses with Escape, and protects the player. It sums the two masses once and awards an adaptation point for each crossed numeric threshold. Continue flight, Save & return, and Photo mode remain available afterward.

The five new advancements and local approach records use the existing archive. Journey slots and Sandbox keep independent landmark state. Charting and completing the merger commit explicit checkpoints; the selected ordinary checkpoint cadence is preserved. Older valid runs load with unchanged progress. New run snapshots use version 5, accepted alongside versions 1–4. Keep a backup of the old folder: opening a new snapshot in an older release is not supported.

Settings adds Black-hole detail (Auto, Performance, Balanced, High), lensing, beacon, flash limiting and physical beaming. Canvas works without WebGL; High/Auto can try an optional local GPU path and fall back automatically. Pause and photo freeze optional motion. Reduced Motion uses a static bounded tier. The result is inspired by astrophysics, with compressed navigation and a display approximation for the asymmetric reference gap, not a Kerr simulator.

Photo mode offers 1×/2× PNG export capped at 3840 pixels wide and a discovered-horizon framing button. The Sandbox has explicit zone placements and a steady-merger test; these award no journey advancements. No admin hotkey is added.

For a private visual inspection, open **tests/final-interstallar-lab.html**. Load your reference image locally, adjust overlay framing, inclination, display asymmetry, disk extent, texture scale, glow, beaming, lens radius, quality and tier. Export the original render or measurements. Reference images are never uploaded, saved or included in exports. **tests/run-all.html** runs the aggregate isolated diagnostics. Both pages work with local ordered scripts and do not write real progress.

Verification here reached V1 (production simulation and native software Canvas). The actual browser could not start, so file-page interaction, browser console, real WebGL and hardware frame rate remain manual checks. The measured CPU comparison passes several geometric targets, while the asymmetric gap, radial profile and one borderline colour sample still differ from the supplied photographs. Full fidelity is not claimed. See **TEST_REPORT.md**, **FINAL_INTERSTALLAR.md**, and the result JSON files in tests.

## Galactic interface

Settings has one **Interface theme** selector for panels, buttons, chart backgrounds, dock details and advancement frames. It reuses the six existing earned frame palettes: Brass, Silver, Verdigris, Solar, Horizon and Ivory. Previous frame selections migrate when no theme setting exists. Themes unlocked in any slot are available across the save vault; body markings and companion accessories stay in their original per-slot Appearance menu. Changing a theme grants no resources or gameplay bonus.

Flight instruments now use a compact left rail, smaller rival/radar panels, consistent rectangular controls and readable numerical formatting. The control and ability shortcuts remain unchanged. Advancement plaques retain their one-third size and phased reveal. Performance mode avoids shelf blur and costly interface filters. Hide the HUD with H or hide telemetry, including FPS, with 5.

**FPS** is measured from actual render timestamps over a half-second sampling window. It uses the unclamped elapsed time rather than the fixed-step physics delta. A dash appears before a measurement and after hidden-tab suspension. It is not a simulated or advertised performance score.

The stage name, route caption, next class and growth bar now have one display owner. Selected paths retain their real reached precursor/remnant class through refreshes, collisions, restored saves and route completion; they no longer alternate with the ordinary stellar class.

## Two-hour galactic encounter

At star scale, press G, open the Galactic encounter section and choose **Begin encounter**. It is optional and can be started once in a journey. Set course follows the gas bridge. Four thirty-minute phases cover Approach, First passage, Tidal return and Core coalescence. The two-hour clock uses active, visible flight time, independently of evolution slow motion. Pause, menus, adaptations, photo mode, hidden-tab suspension and offline time do not advance it.

The two galactic cores, tidal bridge and chart follow the same saved phase geometry. A local density increase affects the existing atlas. Finite reserves release rotating gas/dust regions along the bridge; later passages can condense actual worlds or stars from that same reserve. Emission uses the existing maximum of eight coarse clouds and 24 cells per encounter cloud, waits when those slots are occupied, and stops when you leave the bridge. Gas bends under the existing gravity and only increases your body mass after normal captured-matter transport and assimilation. Decorative distant tracers are not collectible bodies.

Passing tides perturb outer player and rival orbits, while inner systems and direct steering are protected. These are compressed galactic approximations, not a full galaxy N-body simulation. Completion awards up to three adaptation points, **10% greater gravity** and **20% greater gas intake** for this journey. Nebula routes keep zero gravity and receive the intake benefit through dissolution. Rewards apply once, survive a checkpoint and end when you start a new journey. Completion is counted in the existing archive and lifetime statistics.

Starting and finishing commit a full checkpoint. While active, a small clock-only write runs each minute without changing the selected fifteen-second or three-evolution world/mass checkpoint cadence. Full snapshots include the material reserve, released matter, clouds and rewards. Separate slots keep separate encounters. At most the last minute of the encounter clock can be lost if a session ends without a checkpoint; blocked storage cannot preserve it.

The galaxy effect has 960 seeded cached tracers, draws at most 480 in High or 160 in Performance/low adaptive detail, and culls distant/offscreen work. Gas, coherent bodies, matter parcels and rival populations use their existing limits. No new loop, worker or runtime dependency is added.

## Living surfaces

Terrestrial bodies have rotating terrain under a fixed light source, independently drifting clouds, polar ice and atmospheric rims. Climate and composition select frozen, scorched, airless or ocean-bearing palettes. Gas giants and brown dwarfs have shearing cloud bands, moving storms and detailed ring lanes. Moons and dwarf planets have repeatable crater fields that travel across the curved disk. Early asteroids retain their tumbling, irregular silhouettes and gain fine mineral seams.

Stars have separate granulation and hot plasma layers, seeded moving prominences and stage-specific colour. Nebula forms have evolving knots and dust channels. Pulsar beams have a pulse envelope, Strange Matter has an undulating luminous core, and compact shells and black-hole filaments share the interpolated simulation clock. Black-hole disk streaks require actual stored matter; photon-ring light can appear around an unfed horizon. The Interstallar retains its travelling inner and outer lanes.

Body orientation, apparent size and lens radius follow the same fixed-step interval as position. Pause and photo mode freeze motion; evolution slows surface motion with the simulation. Reduced Motion freezes optional surface and ring animation. The old dotted trajectory, boost feedback, centered camera, F-only dock, flight speeds, progression, physics, companions and saves remain.

New maps build in small frame slices, then blend into view. A reached class keeps its previous animated surface until the new map finishes, so detail resolves gradually. There are at most two pending maps and 24 finished maps (12 for Performance assets); ordinary neighbours use smaller maps. High detail animates at most three ordinary neighbours plus the player and selected body. Performance animates one ordinary neighbour plus those important bodies. Existing distance culling, batching and adaptive resolution remain active. Restart clears all maps, builders and interpolation histories. No extra world particles or game loop are created.

For a read-only visual inspection, open `tests/body-animation.html`. It uses the production renderers, includes all original classes and distinct branch forms, and offers pause, detail, motion and preview-speed controls. It never starts a journey or writes a save. Measurements and verification limits are in `TEST_REPORT.md`.

## Choosing a journey

CHOOSE PATH unlocks at Massive Star in the abilities bar and pause menu. Selection keeps your exact current star, mass, position, velocity, health, adaptations, companion, laboratory resources and saved universe. It also preserves a partly filled mass goal. Choosing does not cause an immediate supernova, change your speed or gravity, heal you or award an adaptation point.

Future growth follows the selected sequence. The first entry is your actual starting stellar class, so choosing at Blue Supergiant, Stellar Titan or Stellar Colossus keeps that form. Before the first branch evolution, you can revise the path while still at Massive Star scale or higher. Once the first branch class is reached, switching locks for that journey. The EVOLUTION PATH button then opens a read-only overview of the current and future classes. A new journey permits a new choice after reaching Massive Star again.

| Path | Journey after your current star | Remnant abilities |
| --- | --- | --- |
| Singularity | Contracting Supergiant → Collapsing Core → Singularity → Stellar-origin Black Hole → Intermediate-mass Black Hole → Massive Black Hole → Supermassive Black Hole → Galactic-core Black Hole → Ultramassive Black Hole → The Interstallar | From Singularity: gravity ×2; thrust, cruise and boost speed ×2/3 |
| Nebula | Mass-shedding Star → Expanding Stellar Shell → Emission Nebula → Molecular Cloud → Stellar Nursery → Galactic Nebula | From Emission Nebula: no gravity; speed ×0.85; overlapping bodies and gas dissolve gradually |
| Neutron star | Compressed Stellar Core → Proto-neutron Core → Small Neutron Star → Magnetar → Strange Matter | Neutron and Magnetar speed ×1.35; Magnetar gravity ×1.5; Strange Matter speed ×1.25, gravity ×1.15 and conversion field |
| Gravastar | Dense Shell Star → Vacuum-transition Core → Compact Gravastar → Vacuum Gravastar → Cosmic Gravastar | Remnant gravity ×1.25 / 1.4 / 1.6; collision damage ×0.6 / 0.5 / 0.45; speed ×0.9; acceleration toward larger bodies ×0.8 |

Each new stage requires five times the previous threshold and awards one adaptation point. Your original stellar flight profile and gravitational system remain through the precursor stages. New surfaces and procedural filaments reflect the chosen journey. Their flight notes have attainable branch-specific objectives. Large mass gains advance one earned class at a time, so milestones and cinematic transitions are not skipped. Attained branch stages remain attained after losing mass.

The actual supernova occurs at the third branch evolution, when the first remnant is reached. It has the existing route-specific light treatment, procedural sound and physical expanding impulse. That event can disturb nearby orbits. Nebula then releases its former system with the bodies' velocities, turns off gravitational attraction and starts real gradual assimilation. Other remnants can retain or lose worlds under their changed physics. Route abilities and the existing remnant achievements activate at this point, not on selecting a menu card.

Ignore path selection to continue the normal stellar sequence through Blue Supergiant, Stellar Titan and Stellar Colossus. Stellar Colossus ends named stellar evolution; mass can continue growing and path selection remains available at stellar scale.

Installed adaptations and companion bonuses still stack. Before becoming a nebula, gravity adaptations remain available and useful. Once the cloud forms, its offers exclude inactive gravity adaptations without deleting installed ranks. Dense rival gravity can disperse the cloud and strip stored material.

Dissolving or converting bodies retain coherent mass until it becomes visible stored parcels. Those parcels credit mass gradually after 1.5 simulated seconds, accelerated by Inner Flow ranks. Water and DNA transfer once. Existing black-hole disks retain their minimum six-second settling delay. Rival theft and gas depletion retain their actual mass ledgers.

Earlier 3.4 route checkpoints migrate once into the matching reached remnant stage, preserving mass, motion, adaptation points, matter reservoirs and attained classes. They do not repeat the supernova or restart the branch. New path origin and stage data use the existing save format, slots and three-evolution checkpoint cadence. Selection saves immediately without counting as an evolution.

Strange Matter, gravastars and The Interstallar are speculative or fictional gameplay forms. Stellar transformations preserve mass for continuity and do not model actual stellar-remnant mass loss. Units, distances, time and thresholds remain compressed for play.

## The Interstallar

The final Singularity-route evolution follows the Ultramassive black hole at five times its simulation mass. Its reference-inspired appearance combines an opaque central shadow, a thin photon-like ring, a lensed upper and lower disk, and a wide amber flow across the foreground. Bright, long travelling filaments and luminous heads now visibly circulate at different speeds in the inner and outer lanes; actual captured matter raises their intensity. This is a fictional endgame class.

Mass and accretion continue beyond the final class. The HUD records the completed evolution, and its achievement joins the existing ascent branch. To try it immediately, open the separate Sandbox, press B and choose The Interstallar. Pausing, photo mode and reduced motion freeze the ring motion. Performance mode reduces the atlas resolution and filament count. The compact one-third-size achievement plaques remain.


## Offline launch

Extract the complete ZIP, open `Accretion`, and double-click `index.html`. All graphics, surfaces, sound effects, and backgrounds are procedural. There are no runtime dependencies, network requests, modules, accounts, installations, or build steps.

This review build is not approved for public hosting. See `RELEASE_READINESS.md` for the domain, operator/contact, hosting and browser checks still needed. The sitemap is intentionally inactive until public URLs exist.

Use a modern desktop browser. Sound begins after interacting with the page. Browser localStorage saves settings, achievements, records, lifetime statistics, and the current journey. If storage is blocked, the game remains playable and reports that saving is unavailable.

To retain an earlier save, use the same browser and original extracted folder location. File-page storage behavior varies across browsers; moving or renaming the folder may give it a different storage area. The storage key remains `accretion.v1`; run snapshots are versioned and accept old saves.

## Legacy & Origins update

Five optional solar-system **Blueprints** now live in the existing observatory: Inner family, Outer guardian, Moonkeepers, Ringkeeper and Resonant family. Press L at star scale and choose Blueprints. They measure actual owned stable worlds, composition, orbital distances, moons, belts and established period relationships. Each requires twenty to thirty uninterrupted healthy seconds. A disturbance resets the hold. Selecting a goal never creates planets; completion adds a record and unlocks the Architect crest without giving mass or resources.

**Expeditions** is the prestige menu, available from the main menu, pause menu and F dock. A living journey qualifies after reaching star scale and completing four different class journey goals. Explicitly retiring it records its real peak mass/class, time and completed goals, then starts a fresh asteroid. Companions, eggs, resources, nicknames, branches, achievements, records and chosen cosmetics stay in this slot; the retired body, orbits and adaptations do not. A successful storage checkpoint is required before retirement, and a failed retirement write keeps the old playable universe. Sandbox cannot prestige. There are twenty commemorative ranks.

Choose one optional promise for the new expedition: **Far traveller** (sectors and coherent captures), **Patient custodian** (three stable worlds plus a moon), or **Horizon watcher** (black-hole scale and genuinely accreted matter). Rank increases the requirement, capped at rank twelve for pacing. The custodian hold resets on a system disturbance. Captured matter never satisfies the horizon goal before it actually accretes. Completion records once without power or resource rewards.

The existing earned cosmetic catalogue contains eighteen options across body markings, companion accessories and advancement frames, including their original defaults. **Appearance** keeps the marking and accessory controls; Settings now owns the frame/theme control. Unlocks use the existing achievements or expedition ranks. Markings and gear persist per slot; advancement frames now follow the shared Interface theme. All remain cosmetic and use procedural/vector drawing with no image downloads. Rank one unlocks the Legacy seal, rank two the Expedition ribbon, and rank three the Ivory frame. The earlier achievements remain, including prestige, a kept promise, a blueprint and five survived impacts. The full current catalogue contains 59 milestones.

**Impact history** records up to six scars per significant body. Real damaging collisions leave craters/fractures on rock and terrestrial surfaces. Gas and brown-dwarf bodies display band disturbances; stars and horizons retain the history as stylized asymmetric plasma or disk imprints because they have no solid surface. Shielded impacts and gentle absorption do not add a scar. Scars and orientation persist through evolution and checkpoints. Performance mode draws fewer marks. A fresh body and a reused pooled object start clean.

**Hatching** now shows the actual ready companion emerging from a cracking shell in a 2.8–5 second sequence. Legendary companions have a longer orbital-light reveal and distinct procedural cue. Reveal companion skips to the result; Escape returns to the collection. Ownership is granted once before animation and an explicit Hatch action commits the current checkpoint when storage is available. Closing or minimizing cannot duplicate the companion. Game and operating-system reduced motion show a still result immediately. Visual samples are capped and driven by the existing UI clock; no extra RAF, timers or world particles are created. The fifty species, wheel costs and 59/35/5/1% odds are unchanged.

The **F-only dock** uses a glass shelf, original square vector icons, tooltips, subtle magnification and separators. Hover never opens it. Its idle, pointer-leave and window-open hiding behavior keeps the flight view clear. Appearance, Expeditions and all earlier windows remain reachable there.

## Animated plaque reveal

The popup now forms as a luminous frame, builds a brief warm highlight, then resolves its badge and title over 1.08 seconds. It holds clearly before a gentle fade. The existing UI clock drives every phase, so menus, evolution, photo mode and HUD hiding freeze the actual visual state instead of replaying an entrance. Reduced motion, including the operating-system preference, shows a still plaque. No extra animation loop or timer is added.

To inspect task, goal and challenge animations without playing or changing a save, open `tests/advancement-animation.html`. This local preview uses the production renderer and stylesheet. It offers top/bottom placement, pause/resume and reduced motion, and loads no gameplay or storage system.

## Cosmic Advancements update

The existing achievement catalogue now contains 59 milestones, including the achievements for astronomical classes, coherent captures, stable moons, asteroid belts, measured resonance, final companion forms, discoveries and class goals. Earn requirements come from actual attained classes and simulation state. Milestones record progress; they do not grant mass, laboratory resources, pets or extra adaptations.

Press **J** during flight, use the flight dock or choose **Advancements** from the main/pause menu. The connected map has six branches, original celestial badges, earned/locked filters, search across the catalogue, a requirement inspector and observed progress where a counter exists. Select a badge or navigate with Tab and arrow keys. Connections are guidance, not mandatory prerequisites. The Archive retains its **Records** and **Journey log** views.

Real unlocks enter a queue of wide, brass-framed plaques. Tasks, goals and challenges have distinct borders, durations and procedural chimes. One plaque appears at a time without pausing the universe or intercepting input. Notices wait through menus, evolution, photo mode and hidden HUD; an already displayed notice pauses its clock while obscured. Settings can disable plaques and their chimes or move them to the bottom. Reduced motion shows a still plaque without a light wash, blur or entrance/exit motion.

The save format and `accretion.v1` storage key remain unchanged. New milestone IDs persist alongside the original achievements in each of the three slots, with the existing checkpoint cadence. Eligible recorded classes are reconciled silently when opening an older save; they do not replay a queue of unlocks. Sandbox cannot award journey achievements. Restart and slot changes clear pending notices without adding loops, listeners or timers.

The visual reference was Advancement Plaques by Grend. Only its presentation conventions were used; all shipped art, code and sound are original local implementations. The reference and current test limits are recorded in `sources.html` and `TEST_REPORT.md`.

## Living Frontier update

This release continues the collection repair. The centered camera, original dotted trajectory and circular endpoint, visible depth-correct boost exhaust, uniform flight controls and black-hole resource delivery stay intact.

Procedural fields now use distinct geometries and shared motion: silicate ribbons, ice shoals, fast comet corridors, moonlet archipelagos, rogue-world passages, circumstellar nurseries, molecular filaments and stellar associations. Discoveries appear ahead of your route when physical space is available, use the existing finite matter and body budgets, and enter your checkpointed journey log. Fields drift rather than remaining fixed labels. Stellar passages include planetary masses with real tangential velocities. Rival stellar fields use the rival's own position, velocity and gravity.

Flight notes give one optional goal per astronomical class: coherent captures, controlled coasting, exploration, stable-system upkeep, dust condensation or actual accretion. Completion banks one adaptation point. It grants no mass, water, DNA or pets and cannot reward the same class twice in that journey. The goal, its progress, visited sectors, completed classes and recent discoveries are checkpointed. New lifetime counters and three achievements extend the existing Archive.

Rivals still use the original five personalities. They choose richer routes, avoid contested gravity wells according to their caution, preserve their own established worlds when healthy, recover debris and contest exposed systems. Their intention is visible in leaderboard tooltips and system view. Routes, intentions and short retaliation memories survive checkpoints.

The existing orbital observatory has two views. **Orbits and worlds** draws actual positions, cached orbit paths and moon hierarchies; click a body on the diagram or list to inspect it. Dashed amber and coral paths indicate risk. **Matter flow** separates incoming streams, rotating disk mass and accepted inner flow. It shows the actual inward rate and explains the delay before mass credit. Cooled-disk markers come from the same finite concentrations that the formation calculation uses; an empty disk no longer displays a fictitious condensation band. Newly formed bodies conserve the transferred mass and record their birth.

Procedural audio adds quiet thrust, boost/braking and feeding layers inside the existing audio context, a peak limiter, and distinct discovery, formation and goal cues. Pause and mute affect all layers. Companions, new fragments, effects, fields and stellar-weather rings use their correct depth plane. Brief mass labels reflect actual assimilation.

Renderer changes include shared small-body silhouette paths, pooled particle batches, cached planetary rings, resolution-aware procedural surfaces, bounded ordinary trails and lower-detail nebula sampling. Nebula cache frames compensate camera motion, and duplicate lens preparation was removed. Gravity hot loops, orbital element allocation, composition normalization and repeated gravity/profile lookups were reduced. Performance and Adaptive detail control the new visual work. The complete test and measurement limits are in `TEST_REPORT.md`; synthetic software-canvas timing is not a browser FPS guarantee.

All 22 existing classes, nine active rivals, eighteen adaptations, fifty companions, save slots, wheel odds and costs, menus, sandbox, atlas, replay, photo tools, achievements and procedural sound remain. No runtime dependency was added.

## Expedition update

The galaxy chart records up to 256 visited sectors, extracted-matter depletion, a plotted course and last-seen rival positions. Travel coordinates are scale-relative. Density and depletion feed galactic spawning, so returning to an exploited sector is less productive. Markers are observations, not remote tracking. Your chart is part of the journey checkpoint.

Companions develop while equipped. The first fork requires 180 seconds of flight plus exploration, threat exposure or four ice captures. At 300 seconds all first-fork choices unlock. Scout, Warden and Forager each offer two permanent specializations after 600 seconds. Forms change the procedural creature and add modest, visible buffs. Species IDs, rarity, discovery costs and wheel odds stay unchanged.

Iron, rock, ice and gas fractions affect planetary radius and impact resilience. Accretion mixes composition by transferred mass. The observatory shows fractions, density, atmospheric retention and a compressed temperature estimate. A star's approximate habitable annulus moves as its mass changes. Temperate stable worlds provide a small survey bonus; the label does not establish that life exists.

Stable neighboring planets near 2:1, 3:2 or 4:3 periods earn +2% gravity efficiency per pair after fifteen observed seconds, capped at +6%. The bonus disappears when those paths destabilize. This detects persistent period relationships rather than solving a full resonant-angle model.

Stellar weather gives twelve seconds of warning. Flares and occasional compact magnetar visitors emit expanding waves that perturb velocities, heat surfaces and strip part of atmospheres. Incoming disk matter responds to the same wave. Events retain their forecast, propagation and already-hit state across checkpoints.

Open Sandbox from the main menu for a separate experimental save. Select any existing class, release physical planet/moon trajectories, test a 2:1 pair, create a dust cloud or forecast an event. Test companions and resources remain there. The three normal journeys, achievements, lifetime totals and records are unaffected. Change back through Save slots. Class changes reset the sandbox's local matter reservoirs and orbital assignments while rescaling its coherent bodies.

Encounter replay records the latest significant collision, capture or wave passage: about six seconds before and four after, with nearby actual body positions. Recording is capped at 84 frames and 25 bodies per frame; Performance mode uses four samples per second and twelve neighbors. Replays pause the live universe, support seeking and playback speed, and can survive the end of a journey. They are bounded snapshots, not resimulation of the entire universe.

Photo mode freezes the simulation and camera follow. Pan, zoom, focus a selected body, toggle paths and labels, and set export exposure. Export PNG downloads the canvas locally without HTML interface panels. Leaving restores the previous camera and play/pause state.

## Collection repair

Black-hole tidal breakup now carries each asteroid's original water and DNA into its matter stream. Capturing a stream alone awards no resources; it must reach the inner region. Escaping streams retain their unclaimed payload. Physical contacts and subsequent stream delivery cannot award the same samples twice.

Matter reaching the black hole's inner flow dissipates relative impact speed and follows the source's acceleration while continuing its own motion. Boosting no longer abandons that accepted matter. The existing six-second minimum delay and gradual mass-transfer rate remain. Outer disk matter can still escape or be stripped. Dense gas reserves twelve parcel slots for coherent-body capture. Checkpoints preserve payloads, collection status and accepted inner flow; older snapshots remain supported.

DNA rarity, water yields, pet wheel prices and rarity odds are unchanged.

## Centered camera and trajectory pointer

The flight camera stays centered on the interpolated player position on all three axes, including at star scale. Velocity no longer offsets its focus. System view keeps the star centered when selecting a body; photo mode retains its free camera. R recenters and resets zoom. Zoom remains smooth; collision shake is capped at six screen pixels.

The original dotted trajectory and circular endpoint are restored. There are no extra local chevrons or thrust dots. The endpoint stays 32 pixels inside the viewport. Amber crosses indicate projected contact. The estimate still uses fixed-step coasting physics, limited gravity sources and the same centered camera transform. Boost exhaust uses your body's depth plane so it remains visible as you move through a tilted system.

## Smooth flight and workspace dock

Every class uses one scale-relative propulsion profile: the same thrust, cruise limit, boost behavior and braking. Camera scale grows with the body, so moving between planetary, stellar and compact classes no longer cuts your input thrust. Gravity, collisions, momentum, upgrades and pet bonuses still affect actual motion. Evolution retains its brief cinematic slowdown. Stable-system assistance is calibrated to preserve its earlier orbital stress at normal thrust, while boosts remain disruptive.

Hide individual HUD instruments with 1–7 or their small minimize buttons. Press F to open the glass icon shelf. It never opens on hover or focus. It hides after five idle seconds, shortly after the pointer leaves, or when you open a window. Pointer movement or keyboard use refreshes its timer; stationary focus does not pin it open. Escape or F closes it. The Instruments icon has all seven panel toggles and Restore all. Tab navigates its square controls without activating system view or boost. The shelf remains available when H hides the full HUD and stays out of photo exports. Reduced motion disables icon magnification. Performance mode disables the shelf blur.

The Minimize button or backtick (`) returns an open window to flight. Its usual shortcut toggles it again; the dock also remembers the last minimized window. Menus still pause the universe while open. Upgrade choices and pending points survive minimization, and 1–3 still choose adaptations while that window is open. Hidden-instrument preferences belong to each save slot and follow its existing checkpoint cadence. Save now stores them immediately.

## Controls

| Input | Action |
| --- | --- |
| J | Open/minimize the advancement map |
| WASD / arrows | Apply thrust; release to coast |
| Shift | Brake |
| Space | Rechargeable boost, after unlocking |
| E / Q | Gravity pulse / amplification, after unlocking |
| U | Open / minimize adaptations |
| N | Open / minimize Life Lab |
| 1 / 2 / 3 / 4 | Hide / restore mass, rivals, radar, system metrics |
| 5 / 6 / 7 | Hide / restore telemetry, flight notes, abilities |
| F | Open / close the dock; hover never opens it |
| Backtick (`) | Minimize the current window |
| H | Hide / restore flight HUD and notifications |
| Escape | Pause / back |
| M | Mute |
| Mouse wheel / R | Adjust zoom / recenter and reset zoom |
| Left mouse held | Optional steering, enabled in Settings |
| Tab, at star scale | Toggle system overview |
| O held | Show orbital paths |
| L | Orbital observatory |
| Click in system overview | Select a bound body |
| C | Toggle selected orbit collapse |
| G | Persistent galaxy chart and course selection |
| V | Latest significant encounter replay |
| P | Pause for photo mode and PNG export |
| B, in sandbox | Experimental class and encounter tools |

## The Life Lab

New ordinary asteroid fields contain about 12% icy bodies. Each supplies 1–2 water; 20% of these ice bodies also carry exactly one DNA sample. Fields no longer guarantee a life-bearing asteroid. Saved resources, already-spawned asteroids, existing pets, nicknames, and in-progress eggs are preserved. Existing eggs retain their original incubation duration; new recipes use the costs below.

Some icy asteroids carry water, and a smaller subset carry fictional signs of life. Blue H₂O markers identify water; mint DNA markers identify both. Collide with them to collect the marked resources once. Collection is stored with the asteroid's claim state in the same checkpoint. Matter captured remotely by tides does not award collision samples.

Open **Life Lab [N]** and use the discovery wheel. Each successful discovery costs **500 water + 100 DNA**, then places its companion in an incubation slot. Fly to incubate; menus pause development. Up to three eggs fit at once.

| Sector | Chance | Incubation |
| --- | ---: | ---: |
| Common (includes existing Uncommon companions) | 59% | 20–30 seconds |
| Rare | 35% | 45 seconds |
| Epic | 5% | 90 seconds |
| Legendary | 1% | 180 seconds |

The Common sector contains 34 companions, Rare 8, Epic 5 and Legendary 3. A sector is selected first, then an undiscovered pet from that sector, excluding eggs already incubating. If that sector is complete or its remaining pets are incubating, no resources are spent. Sector odds never change. A full incubator blocks spinning. Discoveries join the next journey checkpoint; closing the menu does not cancel the egg. Existing pets, eggs, resources and nicknames are preserved. Resources are earned through play only and have no cash value.

Equip a companion to rename it in Life Lab. Nicknames save per pet, appear in your collection and during flight, and survive new journeys. Use Reset or a blank name to restore its species name. Names are limited to 24 characters.

Press **H** during flight for a clear HUD-free view; press H again to restore it. The simulation continues. Escape still opens the pause menu, and menus remain visible. Quiet flight is remembered when resuming, while new or restored journeys begin with the HUD visible.

One equipped companion follows your body and increases the life-signal scanner from 330 to 650 local units. All rarities provide the same scanner benefit. Each has a procedural appearance; portraits are cached, and only the equipped companion animates in flight. Resources, eggs, discoveries, and your equipped pet carry across journeys within the selected slot. Companions are friendly science fiction, not a claim that extraterrestrial DNA has been discovered.

## Equipped companion buffs

Only your equipped companion applies these bonuses. They multiply existing adaptation effects and disappear when the pet is unequipped. The shared life-signal scanner benefit remains.

| Rarity | Thrust | Gravity strength | Collision damage |
| --- | ---: | ---: | ---: |
| Common | +3% | +2% | −2% |
| Uncommon | +5% | +4% | −4% |
| Rare | +8% | +6% | −6% |
| Epic | +12% | +10% | −10% |
| Legendary | +18% | +15% | −15% |

## Save slots and companion appearance

Three independent slots are available from the main menu or pause menu. Click a slot button to select it, then Begin or Continue. Switching saves the outgoing journey first. Your previous single save migrates into Slot 1. All three slots keep separate worlds, companions, nicknames, eggs, water, DNA, achievements and records; audio/display settings are shared.

Each slot has an **Autosave every 3 evolutions** toggle, on by default. A new journey gets an initial checkpoint. Three subsequent class increases save a new checkpoint and reset the counter. Merely pausing or closing does not bypass this cadence. Resources, claims, egg progress and world state are committed together. **Save now**, **Save & return to main menu**, and switching slots create immediate checkpoints and reset the counter. Disabling the toggle restores regular timed saves, including pause/resource checkpoints. Completed journeys always save their final records. At the highest class, use Save now or disable the evolution cadence to keep later progress.

The admin panel, class-switching method and Ctrl+Shift+6 shortcut have been removed. Previously saved high-level bodies remain valid.

All 50 companions now use shaded procedural creature silhouettes with animated wings, tails, tentacles, segmented bodies or mineral fronds. Click a collection portrait for a large live preview. Only one equipped companion and the visible preview animate; thumbnails remain cached. Small / Medium / Large controls in the Life Lab and Settings affect visual size without changing buffs. Reduced motion freezes creature animation; Performance mode reduces preview detail and refresh rate.

## Rivals and living systems

Stellar rivals use the same binding-energy, orbit-observation, hierarchy and disturbance rules as you. They can keep planets, lose them in close encounters, and capture them from another system. Cautious rivals protect their holdings, aggressive rivals contest planets, efficient rivals favor low-thrust captures, opportunists seek exposed streams, and explorers continue travelling.

Black-hole rivals can strip exposed captured matter when their well dominates the parcel and its relative trajectory is bound. This transfers actual reservoir mass, with no immediate mass credit. Feeding has a meaningful delay: black-hole parcels remain captured for at least six seconds before inner-boundary transfer, and baseline inner flow is capped at 3.5% of a parcel's initial mass per second. The existing ranked adaptations include disk capacity, intake, inner flow, and System shepherd.

Orbit lines distinguish healthy, unstable, collision-risk, and collapsing bodies; brief labels follow objects when classification changes. The observatory identifies ownership and risk, and the feeding HUD separates captured mass, rotating disk mass, and actual accretion rate. First-use explanations are remembered. New achievements and lifetime counters appear in the original Archive. Ambient synthesis shifts between asteroid, planetary, stellar and black-hole phases.

## How the game changes

**Asteroids and planets:** move gently through resources, use momentum and gravity, avoid dominant rivals, and choose stackable upgrades. Smaller bodies curve toward you. Contact transfers matter into a finite assimilation stream instead of adding all mass instantly. Similar bodies bounce and fragment. Large collisions damage cohesion and grant a short escape window.

**Stars:** suitably positioned bodies with sufficient tangential speed can stay in orbit. Stability uses negative binding energy, angular momentum, eccentricity, a surface-clearing periapsis, an influence-contained apoapsis, and an observation period. A passing body with too much energy escapes. Pure two-body gravity does not automatically capture an unbound visitor: gas drag, collision losses, changing gravity, and encounters with other masses can remove energy.

Planets may hold moons within a conservative fraction of their Hill sphere. Their positions and velocities are integrated independently; they are not attached to the player's coordinates. An explicit, bounded stabilization field partly assists stable bodies during gentle thrust. Boosting removes that assistance. Strong encounters, close approaches, and changing stellar mass can destabilize orbits.

Six or more small, stable rocky bodies in a similar radial band produce a belt representation. Additional belt flecks represent portions of those bodies; they are not extra mass. Comparable companions exert gravity on the primary, allowing approximate binary/barycenter motion. Companion capture is uncommon and not guaranteed.

The observatory lists bound objects and their current orbital classification. Collapsing a selected orbit drains angular momentum over time. Releasing collapse preserves the body's current trajectory, not its earlier orbit. A mature system with three stable planets can supply up to 8% stronger gravity, 30% wider detection, and 16% faster bound-gas intake. Bonuses grow over time and diminish when planets are lost. This trades immediate consumption for ongoing benefits.

**Protoplanetary disks:** nearby gas clouds contain finite matter. Bound gas transfers into rotating parcels, dissipates vertical motion, and can clump after cooling. Formation transfers existing disk mass to a coherent body; it does not generate a planet from nothing. Planetesimals can grow through later capture and collisions.

**Black holes:** progression continues through stellar-origin, intermediate, massive, supermassive, galactic-core, and ultramassive classes. Nebulae, stellar debris, stars, compact remnants, and aggregated clusters become important resources. Captured matter remains separate from player mass. Only material reaching the inner boundary contributes mass, at a finite rate. A disk can saturate its intake capacity, and the Inner flow, Gas collector, and Disk stability upgrades modify feeding.

Nebula cells bend, focus, and trail under gravity; their visible density falls as matter is transferred into streams. Disk brightness depends on stored matter. Background stars and gas positions are displaced locally to approximate lensing. The black-hole disk silhouette uses stylized lensed arcs around a central shadow; this is not relativistic ray tracing.

Galactic regions use a procedural spiral density field. Rich arms contain more resources; distant stars and cluster flecks are aggregate representations. The simulation never allocates a galaxy's worth of full physical bodies.

## Scientific and gameplay approximations

This is a deliberately compressed game, not a scientific simulator. Displayed kilograms interpolate between astronomical landmarks; logical mass, radius, distance, time, collision ratios, and evolution thresholds are compressed separately. Displayed component masses therefore do not form an SI-conservative scientific model. Simulation mass is the conserved gameplay resource during captures, gas transfers, and condensation.

The preserved 1.0 stellar progression reaches 150 solar masses before collapse. The next class is named **stellar-origin black hole** at a compressed 200-solar-mass landmark; it is not presented as a typical stellar-mass black hole. Later thresholds reach 10,000, one million, and larger solar-mass scales. Growth beyond the last named class continues.

Gravity is softened, influence-limited Newtonian attraction. Detailed sources are bounded and spatially partitioned. Moon hierarchies use local two-body elements and Hill-sphere screening rather than full universal N-body interactions. Planes are represented by a lightweight third coordinate projected into the Canvas scene. Gas drag, stabilization, tidal boundaries, viscous disk transport, and cooling are gameplay approximations.

## Architecture and performance

The original `core`, `world`, `player`, `ai`, `physics`, `effects`, `rendering`, `ui`, `audio`, `upgrades`, `save`, and `game` files remain. The existing `cosmic.js`, `cosmic-rendering.js`, and `cosmic-ui.js` now handle shared player/rival systems. `life.js` adds the companion catalog and lightweight collection behavior under the same AC namespace. `supernova.js` and `supernova-rendering.js` extend those existing systems with optional stellar routes and procedural remnant visuals.

- Fixed-step simulation; one persistent animation loop and one set of input handlers.
- Spatial partitioning and limited major gravity sources.
- Up to 288 orbital candidates across player and rival systems evaluated every 0.3 simulation seconds.
- Up to eight nebulae with 28 coarse cells each, updated about eight times per second.
- At most 160 captured-matter parcels, with conservative gas merging.
- Lower field/fragment budgets at stellar and galactic scales; sparse galactic regions spawn fewer bodies.
- Cached surfaces, smaller sprites, cached glows, distance culling, bounded trails and orbit paths.
- Adaptive detail reduces render resolution and decorative samples if frame rate remains low. Performance mode further limits visual quality.

60 FPS is a target, not a verified hardware guarantee. See `TEST_REPORT.md` for actual measurements and the direct-browser testing limitation.

## Optional diagnostics

`tests/physics-tests.html` runs 121 production physics, rivalry, orbital hierarchy, remnant progression, conservation, saving and companion checks locally in a browser. `tests/cosmic-tests.html` runs the integrated cosmic checks using the full game. `tests/life-tests.html` exercises the companion menus, wheel prices and odds, incubation, nicknames, persistence and restarts. These pages are optional; normal play requires only `index.html`. Diagnostic tests preserve existing saved progress.

See `CHANGELOG.md` for the update summary and `LICENSE.txt` for the MIT license.
