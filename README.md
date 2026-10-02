# GrappleRunner

Mobile-first 3D forward grapple runner.

## Core loop
Auto-run → hold to grapple → swing forward → release → land → repeat.

## Current build: 3-Swing Mechanics Lab
The game is intentionally in movement-validation mode before full level production resumes.

The deterministic course tests three situations:
1. Easy swing — establish the basic hold/release rhythm.
2. Late release — prove release timing actually matters.
3. Long gap — prove momentum comes from the swing rather than hidden launch assistance.

## Controller architecture
- `src/input.js` — pointer/keyboard state only.
- `src/grapple.js` — rope attachment and forward/vertical pendulum solver.
- `src/player.js` — gravity, free flight, running, and landing.
- `src/camera.js` — stable presentation camera; never changes player physics.
- `src/level.js` — deterministic test geometry, platforms, and hooks.
- `src/main.js` — game state and wiring only.

## Mechanics rules
- No sideways steering or sideways swing.
- No timed auto-release. The player's release ends the grapple.
- No minimum release-speed boost or hidden upward launch boost.
- No camera-driven movement.
- Falling respawns at the current test section so iteration stays quick.

## Product rule
Movement first. No shops, currencies, accounts, procedural levels, or feature clutter until the grapple/run loop is genuinely fun on a phone.
