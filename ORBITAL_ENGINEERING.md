> Historical 3.9 reference. Version 4.0 separates original adaptations (1 AP) from engineering (RP only), adds Orbital Systems, and uses K for engineering. See ORBITAL_COMMAND.html and the live requirements inspector for current rules.

# Orbital engineering, version 3.9.0

## Flight loop

1. Grow through asteroid classes. Each halfway and completed evolution bar banks one adaptation point, once per threshold; losing mass or reselecting a path cannot repeat it.
2. Reach Moon scale, press U, select Mining, and install Orbital Outpost for free.
3. Coast near intact ore-bearing rocks. The first drone returns 4–9 Raw Material per original rock before ore-separation bonuses. Mine 25 material and build the Research Centre in Science.
4. Reserve 50 more material for each research batch. A powered batch takes 18 simulated seconds before modifiers. Research Points and adaptation points are separate requirements.
5. Unlock branches through Science. Balance drone count, weapons and shielding against generation. Machines slow down proportionally when power is insufficient; ordinary flight still works.
6. Develop generators and storage. Balanced mode uses surplus to charge. Charge mode pauses powered machinery. Spend stored energy on a 5–60 second overclock, with an inverse intensity/duration tradeoff.

## Costs and prerequisites

Mining’s first installation is free. The Research Centre costs only 25 raw. Other ranks cost one adaptation point and one Research Point. Rank three onward, advanced nodes, or ten minutes of powered research raise research cost to two. Maximum ranks, astronomical class gates, branch gates and individual prerequisites are all enforced by the same purchase function. The UI displays missing requirements as well as the complete dependency list.

| Installation | Branch | Max rank | Minimum class | Prerequisites |
| --- | --- | ---: | --- | --- |
| Deep gravity | Science | 5 | Moon-scale body | Gravity laboratory 1 |
| Extended influence | Science | 5 | Moon-scale body | Gravity laboratory 1 |
| Orbital resonance | Science | 4 | Moon-scale body | Gravity laboratory 1 |
| Vector drive | Speed | 5 | Moon-scale body | Propulsion engineering 1 |
| Inertial control | Speed | 3 | Moon-scale body | Propulsion engineering 1 |
| Escape burn | Speed | 3 | Moon-scale body | Vector drive 1 |
| Accretion efficiency | Mining | 4 | Moon-scale body | Advanced extraction 1 |
| Cohesive mantle | Defense | 4 | Moon-scale body | Field engineering 1 |
| Tidal stabilizer | Defense | 3 | Moon-scale body | Cohesive mantle 1 |
| Deep-space survey | Science | 3 | Moon-scale body | Research Centre 1 |
| Gravity pulse | Attack | 3 | Moon-scale body | Defense turrets 1 |
| Accretion surge | Attack | 3 | Moon-scale body | Gravity laboratory 1 |
| Emergency shell | Defense | 3 | Moon-scale body | Cohesive mantle 1 |
| Debris affinity | Mining | 4 | Moon-scale body | Collection fleet 1 |
| Inner flow | Science | 4 | Red dwarf star | Stellar engineering 1 |
| Gas collector | Mining | 4 | Red dwarf star | Stellar engineering 1 |
| Disk stability | Defense | 4 | Stellar-origin black hole | Stellar engineering 1 |
| System shepherd | Science | 3 | Red dwarf star | Stellar engineering 1 |
| Orbital outpost | Mining | 1 | Moon-scale body | None |
| Research Centre | Science | 1 | Moon-scale body | Orbital outpost 1 |
| Advanced extraction | Science | 1 | Moon-scale body | Research Centre 1 |
| Weapons engineering | Science | 1 | Moon-scale body | Research Centre 1 |
| Field engineering | Science | 1 | Moon-scale body | Research Centre 1 |
| Propulsion engineering | Science | 1 | Moon-scale body | Research Centre 1 |
| Power engineering | Science | 1 | Moon-scale body | Research Centre 1 |
| Gravity laboratory | Science | 1 | Terrestrial planet | Research Centre 1, Deep-space survey 1 |
| Coherent optics | Science | 1 | Terrestrial planet | Weapons engineering 1, Parallel research 1 |
| Sample laboratory | Science | 1 | Terrestrial planet | Research Centre 1, Parallel research 1 |
| Orbital design | Science | 1 | Terrestrial planet | Research Centre 1 |
| Stellar engineering | Science | 1 | Red dwarf star | Gravity laboratory 1, Parallel research 2 |
| Parallel research | Science | 4 | Moon-scale body | Research Centre 1 |
| Mining fleet | Mining | 5 | Moon-scale body | Orbital outpost 1, Advanced extraction 1 |
| Collection fleet | Mining | 4 | Moon-scale body | Advanced extraction 1 |
| Drill assemblies | Mining | 4 | Moon-scale body | Advanced extraction 1 |
| Ore separation | Mining | 3 | Moon-scale body | Mining fleet 1 |
| Prospecting array | Mining | 3 | Moon-scale body | Advanced extraction 1, Deep-space survey 1 |
| Mining lasers | Mining | 3 | Terrestrial planet | Attack lasers 1, Mining fleet 2, Drill assemblies 1 |
| Defense turrets | Attack | 4 | Moon-scale body | Weapons engineering 1 |
| Rapid cycling | Attack | 3 | Moon-scale body | Defense turrets 1 |
| Impact chambers | Attack | 3 | Moon-scale body | Defense turrets 1 |
| Attack lasers | Attack | 3 | Terrestrial planet | Coherent optics 1, Defense turrets 2 |
| Shield grid | Defense | 4 | Moon-scale body | Field engineering 1 |
| Shield capacitors | Defense | 3 | Moon-scale body | Shield grid 1, Battery banks 1 |
| Vector nozzles | Speed | 3 | Moon-scale body | Vector drive 1 |
| Closed-cycle turbine | Energy | 3 | Moon-scale body | Power engineering 1 |
| Fission reactor | Energy | 2 | Terrestrial planet | Closed-cycle turbine 1, Parallel research 1 |
| Fusion reactor | Energy | 2 | Gas giant | Fission reactor 1, Parallel research 2 |
| Stellar collectors | Energy | 2 | Red dwarf star | Fusion reactor 1 |
| Dyson swarm | Energy | 2 | Sun-like star | Stellar collectors 1, Battery banks 2 |
| Battery banks | Energy | 4 | Moon-scale body | Power engineering 1, Closed-cycle turbine 1 |
| Charge controllers | Energy | 3 | Moon-scale body | Battery banks 1 |
| Fleet overclock | Energy | 3 | Moon-scale body | Battery banks 1 |
| Power conversion | Energy | 3 | Moon-scale body | Power engineering 1, Parallel research 1 |
| Water condenser | Science | 3 | Moon-scale body | Sample laboratory 1 |
| DNA sequencer | Science | 3 | Moon-scale body | Sample laboratory 1 |
| Follower worlds | Cosmetics | 3 | Moon-scale body | Orbital design 1 |

## Finite matter and transport

Drones and haulers are lightweight agents, not extra gravitational bodies. Up to six miners and four collectors use a half-second spatial-hash scan. Ore and cut integrity belong to each actual rock. Fracture returns that rock’s mass through the existing debris system. Extracted ore travels in a drone or a finite crate before becoming stored Raw Material. Fractured debris does not regenerate ore. Water and DNA remain on physical fragments or a carried payload; deterministic fractional recovery prevents repeated rounding gains.

Turrets use capped projectiles and beams, prioritize nearby unprotected rivals, and otherwise target mineable rocks. Dislodged enemy mass becomes physical debris; it does not award imaginary damage currency. Shields hold a bounded energy reserve and recharge only when safely powered. Laser upgrades enforce the science-to-attack-to-mining chain.

Research consumes the entire 50-material batch when it starts; a saved pending batch cannot deduct that cost again on reload. Drone cargo, crates, power mode, battery, overclock, shield charge, fractional recovery and milestone claims are saved in the existing slot. Transient trajectories/projectiles restart cleanly. Ordinary autosaves respect the selected cadence.

## Power

Base outpost supply: 2 power. Each generator rank adds 4 turbine, 8 fission, 14 fusion, 16 solar or 28 Dyson power. Each battery rank holds 60. Machine demand is 0.8 per miner, 0.45 per hauler, 1 per Research Centre, 0.9 per turret, and 0.3 per shield rank, before conversion upgrades. Shortages reduce powered rates proportionally. Generation and battery units are game abstractions, not watts.

Overclock spends the currently stored energy once, then runs powered machines at the chosen 1–2.5× rate for the selected duration. Efficiency upgrades improve the energy-to-time conversion. Propulsion gets a smaller capped 25% bonus; passive gravity and damage modifiers keep their established behavior. Charging stops powered branches while preserving normal player control and already charged shields.

## Scale and appearance

All original adaptation IDs retain their physical effects. Every installed rank draws a color-coded module; branches add drones, laboratories, turrets, shields, engines, reactors, collectors and swarms. Performance mode reduces module geometry and swarm count while retaining rank indicators. Cosmetic worlds are explicitly visual and toggleable.

Late fields use real initial orbital velocities around their own primaries. At galactic scale, aggregate regions contain a few stars with local worlds and belts. Formation-host IDs are only level-of-detail metadata: they do not pre-classify an orbit as stable or rigidly attach a body. Tiny belts are retained long enough for capture/mining, then culled as they become microscopic relative to later classes. All detailed bodies stay inside the existing population cap.

Gravastars retain the existing branch buffs but now use a vacuum-energy interior and thin material boundary. No event horizon or singularity is drawn. This follows the hypothetical gravastar model requested as inspiration; quantum gravity and internal pressure equations are not simulated.
