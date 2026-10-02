# GrappleRunner

Mobile-first 3D forward grapple runner.

## Core loop
Auto-run → hold to grapple → swing forward → release → land → repeat.

## Current build: 10-Level Grapple Campaign
The game now uses a ten-level handcrafted campaign built around progressive mastery of the grapple/run movement system. The priority remains movement quality: every level should be reliably beatable with clean player-controlled timing before difficulty is increased.

### Campaign
1. **Rooftop Rhythm** — learn the basic three-swing rhythm.
2. **Double Drop** — use controlled drops to preserve momentum.
3. **High Line** — introduce higher catches and one moving hook.
4. **Gap Run** — commit to longer gaps and faster releases.
5. **Final Flow** — chain four swings through a neon run.
6. **No Touch** — chain three hooks across a skybridge gap.
7. **Low Ceiling** — stay low through an underpass and clear beams.
8. **Crane City** — read moving-hook timing in a construction district.
9. **Red Zone** — combine height control with readable hazards.
10. **Master Flow** — combine drops, high catches, chains, moving hooks and hazards.

## Balance rules
- The next grapple target becomes available early enough to read and react on a phone.
- Difficult sequences get a checkpoint before the commitment point where practical.
- Moving hooks use controlled travel rather than large unpredictable vertical swings.
- Hazards are obstacles to clear, not giant unavoidable death walls.
- Difficulty comes from timing, momentum and sequencing—not hidden boosts or impossible geometry.
- Later levels combine previously learned skills instead of introducing several unproven mechanics at once.

## Controller architecture
- `src/input.js` — pointer/keyboard state only.
- `src/grapple.js` — rope attachment and forward/vertical pendulum solver.
- `src/player.js` — gravity, free flight, running, and landing.
- `src/camera.js` — stable presentation camera; never changes player physics.
- `src/level.js` — deterministic campaign geometry, platforms, hazards and hooks.
- `src/main.js` — game state and wiring only.

## Mechanics rules
- No sideways steering or sideways swing.
- No timed auto-release. The player's release ends the grapple.
- No minimum release-speed boost or hidden upward launch boost.
- No camera-driven movement.
- Falling respawns at the latest checkpoint so retries stay quick.

## Product rule
Movement first. No shops, currencies, accounts, procedural levels, or feature clutter until the grapple/run loop is genuinely fun on a phone.
