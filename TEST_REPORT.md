# ACCRETION 4.0.0 verification report

Validated on 8 October 2026. This report supersedes earlier release reports retained in the source folder.

## Completed automated checks

- Combined isolated production diagnostics: **286 passed, 0 failed, 15 explicitly unverified browser/visual checks**.
- Existing engineering integration: **22/22**. Separate AP/RP pricing and the expanded 62-definition catalogue are intentional changes to prior assertions.
- Save-slot integration: **13/13**. Hardcore and rare Raw Material cache checks: **17/17**.
- New command/scenario checks: **15/15**, included in the combined total. They cover tree separation, setting validation, signals, sandbox resource isolation, real projectile/laser damage, finite horizon extraction, physical guardians, nested systems, boss rewards, salvage delivery, save/load and restarts.
- Frame pacing: **20 combinations** across 60, 120, 144 and 240 Hz callback schedules, with caps of 30, 60, 120, 240 and Unlimited. Observed rates were within one frame per second of the achievable requested ceiling. This verifies limiter logic, not a monitor's physical refresh rate.
- Live optional backend: three WebSocket clients, shared room movement and chat, another isolated room, static client serving and denial of backend-source requests. No server errors were reported.
- Two production game transports joined a live backend, received snapshots, sent movement, rendered the shared world, rejected campaign checkpoint writes and disconnected cleanly.
- Production JavaScript is syntax checked; classic local script paths are audited. ZIP CRC and fresh extracted byte comparison are checked during packaging.

## Performance measurements

Environment: Node 24, a VM DOM adapter and native software Canvas at a 1440 × 900 display size. These are CPU measurements, not browser/GPU FPS measurements. Default adaptive detail was disabled to make the reported presets reproducible.

The first dense stress fixture exposed high software rendering costs. The final pass shares sphere lighting maps, reduces spherical strip detail for small bodies, limits gas-buffer resolution and refresh cadence, and scales body/effect budgets with CPU settings. The full-detail stress path is retained for hardware with sufficient headroom; low-end users should use Eco, low shaders/gas and a smaller render resolution.

| Final sampled stellar scene | Live body array | Gas cells | Median simulation | Median draw | 95th-percentile draw |
| --- | ---: | ---: | ---: | ---: | ---: |
| Full detail | 360 | 56 | 3.26 ms | 14.55 ms | 31.56 ms |
| Eco / low detail / 720p selection | 192 | 56 | 2.42 ms | 6.96 ms | 10.58 ms |

These figures do not establish a universal 60 FPS guarantee. High-detail software rendering can exceed a 16.7 ms frame budget; the shipped adaptive detail and lower-end settings provide the intended fallback. The frame cap never accelerates the fixed 60 Hz physics loop.

## Visual review and limits

Inspected native Canvas frames of the updated planet/station renderer, a structured star system and the turbulent gas layer. Procedural surfaces and black holes retain time-driven geometry; no external replacement photographs were added. Animation controls and bounded render tiers are checked in the automated suites.

An installed real browser executable was unavailable in this environment. **Actual file:// interaction, the browser console, WebGL behavior, CSS layout on real displays, GIF decoding and hardware FPS remain unverified here.** The project uses local classic scripts without fetch, modules, workers, CDN dependencies or required remote assets, preserving the file-launch architecture. Open index.html after extraction and tests/run-all.html for browser diagnostics. That diagnostic page uses an isolated in-memory vault.

The multiplayer backend is tested as a private arena, not as a synchronized full campaign or a production-scale public service. Browser permission policies, public TLS/firewall configuration and independent security review remain outside the local tests. See MULTIPLAYER.html for exact setup and scope.

## Reproduction and included evidence

The tests folder contains command-tests.js and the existing physics, cosmic, life, component, horizon and final suites. Current result files are prefixed command- or named frame-cap-results.json/network-client-results.json. Earlier JSON files are historical evidence, not current-release claims. Full source and setup instructions are included.
