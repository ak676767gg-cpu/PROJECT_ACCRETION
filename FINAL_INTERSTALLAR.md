# ACCRETION 3.8.0: The Final Interstallar

The implemented update adds a persistent horizon encounter and replaces black-hole rendering while preserving the 3.7 game. This is an original procedural model, with no reference photograph, film footage, sound sample or external runtime asset.

## Integration and invariants

Three strict classic IIFEs share window.AC. They load immediately after supernova-rendering.js and before game.js: final-interstallar.js, final-render.js, final-ui.js. No modules, fetch, workers, package manager or new requestAnimationFrame owner are added. The existing 1/60 fixed step, accumulator, movement, source selection, ordinary collision rules, spawning budgets and original RNG streams retain their meanings.

The landmark has ID -38 and kind landmark. It is not Body, never enters bodies/hash/sources, and is absent from ordinary absorption, AI food, spawning and leaderboard budgets. Seed XOR 0xF17A38 owns its placement RNG. The saved first black-hole anchor and floating-origin rebasing preserve relative location. Early play performs a scalar eligibility guard before classification.

The 22 original classes, their thresholds and radii remain unchanged. Class index 21 is still The Interstallar. The Final Interstallar is an optional landmark and post-merger title, not a replacement class entry. Only an actual eligible black-hole appearance discovers it naturally; the other routes remain distinct. Sandbox access is explicit and earns no journey advancement.

## Public APIs

- AC.FINAL: frozen encounter constants. AC.FINAL_LOOK: frozen default display fit.
- AC.cleanFinal(value): bounded optional-v1 state cleaner; rejects future/malformed new blocks without relaxing old run validation.
- AC.FinalInterstallar(game, saved): update(dt), forces(dt), accelerationOn(body, out), advanceReal(dt), rebase(x,y), serialize(), place(zone), complete().
- AC.FinalRay.orbit(b): dimensionless Schwarzschild ray in shadow-impact units; returns its bounded sampled orbit, capture flag and deflection. AC.FinalRay.images(x,y,cx,cy,r,out): bounded primary/secondary point-source images and magnifications.
- AC.FinalRender(renderer): draw(), advance(), reset(), memoryBytes(), ensureGL(), disposeGL(). Its static legacy flag retains the old artwork for developer comparison.
- final-ui.js wraps the existing UI actions, update/stage/archive/settings, map/camera/menu, and Photo image/export. Delegated actions and the existing focus/input paths own interaction.

## Encounter constants and tuning

| Quantity | Default | Meaning |
| --- | --- | --- |
| Discovery/merge stage | 15 / 21 | Actual black-hole scale, not merely high mass |
| Landmark mass | 5^22 | Compressed gameplay mass; finite consumed mass increases it |
| Beacon / lens / disk / photon / inner-flow | 1000 / 250 / 18 / 5 / 1.6 R | R is the existing body-radius convention |
| Placement beyond lens | 31000 × unit(5^15) | Gives a readable early approach |
| Gravity cap / softening | 24 / 0.5 R | Capped real player mu and softened field |
| Outer assistance cap | 0.74 × player thrust | Gameplay cap outside the inner-flow boundary |
| Inner forced inflow | 42 × current unit / second | Accepted irreversible-flow approximation for an unready horizon |
| Merge radius / speed / hold | 1–3 R / 38 u/s / 1.5 s | Continuous, resettable gate |
| Visible merge time | 10 s | Active, visible time, independent of evolution slow motion |
| Outer stress / inner quadratic stress | 0.015 / 3.2 per second | Uses original defense multipliers |
| Inner warning / emergency protection | 5 s / 8 s | Reaction warning and existing shell |

The actual field uses mu_eff = min(18000 × landmarkMass / unit(playerMass), 24 × Physics.mu(game,player)). The real mu includes route, adaptation, companion and encounter bonuses. Acceleration is mu_eff × displacement / (distance² + softening²)^(3/2), truncated outside the lens with a final 20% taper and bounded by thrust. The output-writing acceleration function does not mutate game state or allocate an output when supplied one. Cache refresh obtains the live player values before force application.

This is deliberately not a physical supermassive black-hole force at a literal astronomical distance. The inner-flow rule is a separate gameplay transport approximation, activated only after warning, inside 1.6 R, and below merge readiness. Its velocity relaxation preserves a real irreversible boundary despite the outer thrust cap. No claim of a purely Newtonian point of no return is made.

Fixed-step autopilot checks (tests/final-pacing.json) found a class-21 beacon-to-merger time of 314.15 seconds. A class-15 body at 5 R escaped immediately in 3.4 seconds; waiting five seconds took 16.93 seconds and retained 61.66 cohesion; waiting seven took 21.02 seconds and retained 50.18. These were actual input/thrust trajectories with spawns isolated, not a human play session. The tested outer-disk hold survived 45 seconds above 95 cohesion.

## Matter, stress and merger

The field affects the player and nearby existing parcels/grouped gas cells. Coherent bodies gain their existing heat/tidal/risk state near the disk. No new matter population is introduced. Parcels crossing R are removed once into the landmark ledger; gas near the horizon is drained gradually at 7% of its initial cell mass/second. Coherent bodies crossing the horizon contribute finite mass. None grants player water, DNA, a capture count or an AI defeat. Feeding changes the landmark picture through a bounded decaying envelope.

During a merge, input is softly locked, original invulnerability protects the player, camera/position move on the active real-time phase, and Reduced Motion keeps optional travel static until handover. Pause and hidden pages stop progress. A saved partial phase resumes from its saved position without snapping to the original starting coordinates. Completion sums masses once (under the existing finite mass cap), awards one point per crossed numeric threshold, records the milestone and removes the active landmark. The class table and route levels remain unchanged. Continue, Save & return and Photo are explicit afterglow choices. A failed save leaves the live result available.

## Rendering model

The existing body radius is the displayed shadow radius. It does not alter collisions. Three fitted disk anchors blend with logarithmic mass progress: Ember (extent 3.1 R, outer radius 8 Schwarzschild radii), Halo (4.4 R / 11.25), and Full (5.6 R / 14.5). Important-body detail is limited to player/landmark, plus at most two richer rival bakes; other rival black holes keep silhouettes and labels.

Light integrates the Binet-equivalent Schwarzschild null equation u'' + u = 1.5u² with u = r_s/r, initial u=0 and u'=1/b. Critical impact is sqrt(27)/2 in r_s units. The CPU RK4 step is 0.009, bounded to 1100 iterations. Plane crossings provide radius and azimuth for up to three image orders. The CPU map reuses 600 radial trajectories rather than performing a full integrator per pixel. Finite termination and root interpolation prevent the outgoing weak-field ray from acquiring a whole-step error. Tests bracket 0.99/1.01 of critical impact and check weak deflection against 2r_s/b.

The cinematic disk uses declining emissivity, a short warm fitted colour ramp, gravitational-redshift-inspired radiance, bounded filmic shoulder, finite-height foreground photosphere, a separate Gaussian critical rim and local halo. The emitting inner radius 2.05 r_s includes a stylized plunge region, not an assertion that the Schwarzschild ISCO is there. Emissivity 2.05 and exposure 5 are fitted/model assumptions. Inclination means five degrees above the disk plane; the lab uses 85 degrees from its normal. A -0.15 R arch offset is a display approximation for reference asymmetry, not a Kerr metric or real spin measurement.

Small-map striations use cached material coordinates. Large CPU footprints overlay null-ray isoradius filaments, computed cooperatively from the same rays. Inner material rotates faster with angular frequency proportional to r^-1.5. Two wrapped 240-second phase layers crossfade continuously. Optional beaming is capped. Feeding changes brightness by at most 7% with flash limiting, 12% without it, using a slow envelope; it has no gameplay effect. Reduced Motion freezes optional material and orbital filaments. Pause/photo use the existing frozen clock.

The separate weak-field point-source map solves theta_± = (beta ± sqrt(beta²+4))/2 in Einstein-radius units, with bounded perfect-alignment magnification and arc stretch. The Einstein scale 1.65 shadow radii is a visual assumption, not a recovered physical lens distance. Background stars, galaxy tracers and grouped gas reuse it; at most 80 secondary star images are drawn per frame. Gas caches invalidate when projected lens position/radius changes materially. This improves coherence but is not a full scene-texture GR lens; the local GPU background and CPU scene are not proven identical.

## Tiers, resources and failure behavior

| Tier | Path | Bounds |
| --- | --- | --- |
| T0 | Static ray-map bake with bounded orbital filaments | 192² map; small footprints, menu, Performance, Reduced Motion |
| T1 | CPU cached crossing map and 24 Hz material update | 256² map; two adjacent anchors can blend |
| T2 | Optional local WebGL 1 ray integration | 56 steps, 640² cap |
| T3 | Optional local WebGL 1 ray integration | 128 steps, 1024² cap |

Only one optional GL canvas/context exists. Highp below 16 bits, context absence, shader failure or context loss chooses Canvas. Loss/restore listeners are installed once per owned canvas; restore rebuilds lazily. Programs and buffers are deleted and context disposal is explicit. The premultiplied, feathered GL result is copied into the main Canvas in the same task with preserveDrawingBuffer false. Driver storage is not measured here.

CPU maps build in cooperative 3.8 ms target slices with bounded work quanta. A readable curved fallback appears immediately. Native timing occasionally exceeds the target; it is a cooperative budget, not a hard real-time guarantee. At most five cached maps and an estimated 11.7 MiB cap are retained. Pixel buffers, crossing maps, palettes, sampled paths, contour coordinates and 512² static contour canvases count toward the estimate. Detailed contours are baked once and cropped from geometry; the frame draws only their occupied rectangle. GPU render-buffer estimate is under 40 MiB, but actual driver/heap verification is outstanding. The inspected 384² hero map is a private comparison configuration, not the default gameplay map.

Auto starts at T2, lowers after three seconds below 45 measured FPS, and raises after ten seconds above 58 with a thirty-second recovery interval. Existing quality, adaptive detail, Reduced Motion, menu state and footprint also constrain detail. Renderer failure uses bounded Canvas fallback. The physics never depends on the active tier.

## Saving, archive and UI

Only accretion.v1 is used. Vault version 2 and three slots plus Sandbox remain. Run snapshots accept versions 1–5; version 5 adds optional final v1 with x/y, angle, discovery/chart flags, nearest R, lens seconds, photo count, zone, warnings, merger phase/done, a bounded seen list and consumed mass. Coordinates are bounded to ±10^12; counters and enums are checked independently. Malformed/future final blocks are discarded without discarding a valid old run. Ordinary old validation remains strict.

Five connected advancements extend the original 54 to 59: Signal in the Dark, Edge of the Lens, Light That Circles, Turned Back and The Final Interstallar. Lifetime charting, nearest approach, lens time, photos and mergers are accounted through the existing delta pattern. The first chart and merger explicitly checkpoint; automatic fifteen-second/three-evolution cadence otherwise remains. Successful retirement removes the live landmark with the universe, preserving lifetime records; a failed write keeps the live state.

The instrument uses key 8 and the original minimized-panel/Dock system; F remains the only opening key and the dock idles closed after five seconds. H still hides the HUD. The map/bearing marker has a separate inset from the old pointer/threat arrows. The old trajectory endpoint, boost feedback, centered camera, menus and six earned themes remain. The existing audio gains quiet proximity/zone/pulse/merger cues, with a pause-aware gain bus and no parallel loop. Pulse tempo is bounded to two per second.

## Developer pages and evidence

Open tests/final-interstallar-lab.html offline. It uses the production scripts, Sandbox in memory, and the existing Game frame owner. Controls include plane inclination, display asymmetry, extent, texture, glow, beaming, Einstein radius, tier/quality, phase pause, checkerboard and a private FileReader overlay. Cool and screen-tilted variants are interpretation presets; they do not claim exact matching of the other photos. Reference pixels never enter exports or storage. PNG and numerical measurement exports are local.

Open tests/run-all.html for the aggregate diagnostics, or tests/final-interstallar-tests.html for the final-specific suite. Full-shell pages mirror the new DOM and load order. The standalone advancement-plaque page intentionally loads only its original core/UI subset, not Game or the new renderer.

Evidence files: final-interstallar-results.json, final-run-all-results.json, final-migration.json, final-roundtrip.json, final-pacing.json, final-performance.json, final-fidelity.json, final-static-audit.json and reference-analysis.json. TEST_REPORT.md states exact counts and verification levels.

## Reference decisions and limits

R1 (587²) is the hero because it separates the shadow, narrow rim, band and both arches. R2 is cropped film-still-looking context; R3 is cool/bloomed; R4 has larger warm geometry but no separately resolved rim; R5 is watermarked and excluded from fitting. Apparent types are visual classifications, not verified source provenance.

R1's observed core diameter is 0.409 image heights ±0.014; its band is about 0.073 R below centre, upper/lower maxima about 0.19/0.17 R beyond the shadow, and ring FWHM about 0.044 R. All M1–M17 methods, uncertainties and sparse colour observations are in reference-analysis.json. The production T1 256² map with its 512² contour layer passes several geometry/colour tolerances but fails the asymmetric gap, radial exponent and one borderline colour sample (ΔE76=14.000652, tolerance 14). Fine turbulence, independent physical inclination, glow separation and cross-tier parity are not fully verified. Full photo fidelity is not claimed. The earlier private 384² comparison is supporting development evidence, not the default gameplay proof.

R1's nearly equal arches override a generic lower-dimmer styling rule. Cropped extent is a lower bound. Its noisy, graded band fit is not a trustworthy physical emissivity measurement. Screen rotation is independent of physical inclination in the lab. The small asymmetry is labeled as a display fit rather than claiming a Kerr solution.

The verified primary references and retrieval caveats are on sources.html: James et al. 2015, Thorne 2014, Luminet 1979, Bardeen 1973, EHT 2019, NASA and Gralla et al. 2019, with Khronos guidance for optional GL. Bardeen retrieval failed here; its bibliographic entry is not a claim that it was read.

## Verification environment and remaining risks

Environment B: Node 24 isolated production runtime plus native software Canvas. V1 simulation, save comparison and numerical rendering run here. Chromium exits before a page loads; the cloud browser URL policy rejects file://. No workaround was attempted. Browser console, real file-page interaction, GPU execution, focus/resize behavior, certified flash thresholds and hardware 60 FPS remain unverified. Dense measurements use explicitly batched native processes because longer dense runs terminate in the native renderer. They are not browser FPS.

Do not publish this package yet. Domain/operator/hosting and real-browser release gates remain blocked. Remaining reference/performance exceptions, the manual ten-minute script and the full requirement matrix are recorded in the delivery report.
