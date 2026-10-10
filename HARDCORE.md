# Hardcore Frontier · ACCRETION 3.9.2

Choose Settings → Next journey difficulty → Hardcore, then start a new journey. Continuing a saved journey retains that journey’s difficulty, even if the setting for future journeys changes. Standard and Relaxed remain available with their existing cohesion and resource behavior.

## Cohesion

Hardcore starts at 50% cohesion and cannot regenerate or heal above 50%. Ordinary evolutions, every Supernova branch, Sandbox class changes, final-merger healing and restored checkpoints all respect this cap. Rival cohesion remains unchanged. Existing armor, shields, defenses and escape windows remain available.

## Scarcer worlds at increasing scale

From Moon scale onward, Hardcore reduces new planetary-world candidates and wandering large bodies. New same-class or larger ambient matter becomes progressively less likely to survive the spawn filter. Existing captured planets, rival population, physically shed debris and condensation are preserved. Smaller resources and mineable asteroid belts remain available.

For scale index s ≥ 4, a structured world candidate passes with max(12%, 55% × 0.9^(s−4)); a same-class-or-larger ambient candidate passes with max(1.5%, 40% × 0.8^(s−4)). Failed peer candidates become smaller matter. These are conditional per-candidate probabilities, not the percentage of every visible body. Class comparison uses the current route’s mass threshold, so alternate Supernova routes are handled correctly. Hardcore also reduces the replenishment target for wandering large bodies. The population cap and fixed-step loop remain unchanged.

## Higher-value rare caches, only in Hardcore

Successful rare world/wanderer spawns and surviving comparable ambient spawns carry a marked finite resource cache:

| Current scale | Water | DNA | Extra Raw Material |
| --- | ---: | ---: | ---: |
| Moon / planetary / brown-dwarf (4–8) | 12–24 | 3–6 | 50 |
| Stellar (9–14) | 24–48 | 6–12 | 100 |
| Compact / galactic (15–21) | 48–96 | 12–24 | 150 |

The existing life scanner labels caches and their Raw Material amount. Resources are received through physical collection or accepted inner absorption, not by discovering or keeping an orbit. Water/DNA recovery adaptations still apply, but the companion wheel keeps its 500-water/100-DNA price and 59/35/5/1 rarity odds. Caches no longer grant Research Points directly. Extra Raw Material enters the existing mining inventory; the Research Centre still refines 50 Raw Material into 1 Research Point over time.

The cache stays on the body, captured parcel, escaped matter or mining fragment. When the body pool is full, mining carries its samples/bonus Raw Material in finite drone cargo or a crate. Save/load preserves the payload and claim state. Collection claims and pending ledger commits prevent duplicated payouts. Pooled bodies/packets reset their cache state. Other difficulties do not generate these caches or award these bonus cache materials.

## Studio credit and architecture

© 2026 Web Stars Studios appears on the main menu, credits and support pages. LICENSE.txt adds the studio notice while retaining the existing contributors notice and MIT permission text. This is a copyright credit, not a change to the source license or a public deployment.

The entry still loads 27 classic local scripts sharing window.AC. No server, install, build, internet, account, external asset or CDN has been introduced. Extract the ZIP and double-click index.html.

## Checks

The updated aggregate production diagnostics pass 271 checks, with zero failures and the same 15 explicitly unverified browser/device items. Seventeen new Hardcore integration checks pass, along with the existing 22 engineering and 13 slot checks. Sixteen Hardcore/cache checks are included in the existing isolated physics suite. Real browser/file-origin interaction, console inspection, audio-device behavior and device FPS remain unverified in this environment; automated/native checks do not establish those outcomes.

## Previous-save compatibility

Unclaimed 3.9.1 cache payloads in bodies, packets, crates and carried cargo convert once at 50 Raw Material per former Research Point. Already-earned Research Points, ordinary ore and inventory balances are retained. Claimed caches cannot pay out again.
