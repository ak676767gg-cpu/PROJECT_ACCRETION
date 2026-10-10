# ACCRETION 4.0.0 · Orbital Command

Extract the complete ZIP and double-click **index.html**. Solo play requires no installation, server, account, build tools or internet. © 2026 Web Stars Studios.

This update preserves the existing campaign and adds connected engineering trees, a separate original Adaptations panel, richer procedural bodies/stations/nebulae, aimed mining and weapons, guardian planetary systems, expanded sandbox controls, Boss Gauntlet, Salvage Expedition, custom signals, lower-end settings and an optional multiplayer arena.

**Settings → Performance and resolution** is at the bottom. The FPS cap slider offers **30–240 FPS**, then **Unlimited**. Choose a lower CPU budget, resolution, texture/gas detail or shader mode for slower hardware. Decorative animations can be switched independently.

**U:** original adaptations, 1 AP per rank. **K:** deterministic engineering trees, RP per rank. Branches begin at Moon scale with a free Mining outpost. The Research Centre costs 25 Raw Material; refining 50 raw takes eighteen powered simulation seconds. Engineering does not spend adaptation points. Existing installed ranks carry forward.

**X:** aimed weapons. **Z:** mining-drone orders. **I:** personal mining laser. Hold click for weapons/laser, or click to assign drones. **T:** quick signals. **Y:** send first saved signal. WASD thrust, Shift brake, Space boost, F dock, H hide HUD, Escape pause and the existing panel shortcuts remain.

Read **ORBITAL_COMMAND.html** for the complete update and **MULTIPLAYER.html** for backend setup. The optional backend uses Python 3.10+ standard library on the host. The shared arena is separate from the offline campaign; the guide lists exactly which mechanics are synchronized. Nothing is hosted or connected automatically.

Three journey slots, every-three-evolution checkpoints, Hardcore caches, fifty companions, nine rivals, original remnant routes, achievements, procedural sound, galaxy collision and the Final Interstallar remain. Boss, Salvage and Sandbox have isolated saved state. Settings are shared. Keep the same browser profile and folder path when updating local-file saves.

**TEST_REPORT.md** records this release's tests, actual performance measurements and unverified browser-specific behavior. Open **tests/run-all.html** for offline diagnostics using an isolated in-memory vault.

The project uses ordered classic scripts sharing `window.AC`. No modules, fetch, workers, external art, fonts or runtime dependencies are used by the game. `backend/server.py` is optional. Historical development notes and previous verification reports are retained; the current code, ORBITAL_COMMAND.md and TEST_REPORT.md take precedence.
