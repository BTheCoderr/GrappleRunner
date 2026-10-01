import * as THREE from 'three';

const game = document.querySelector('#game');
const levelLabel = document.querySelector('#levelLabel');
const speedLabel = document.querySelector('#speedLabel');
const bestLabel = document.querySelector('#bestLabel');
const progressFill = document.querySelector('#progressFill');
const hint = document.querySelector('#targetHint');
const toast = document.querySelector('#toast');
const startScreen = document.querySelector('#startScreen');
const finishScreen = document.querySelector('#finishScreen');
const finishTime = document.querySelector('#finishTime');
const pauseButton = document.querySelector('#pauseButton');
const pauseScreen = document.querySelector('#pauseScreen');
const resumeButton = document.querySelector('#resumeButton');
const restartButton = document.querySelector('#restartButton');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ed8ff);
scene.fog = new THREE.Fog(0x8ed8ff, 48, 190);

const camera = new THREE.PerspectiveCamera(64, innerWidth / innerHeight, 0.1, 350);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.domElement.style.touchAction = 'none';
game.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x5b7088, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 2.35);
sun.position.set(-14, 34, -10);
sun.castShadow = true;
scene.add(sun);

const mat = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.72 });
const roofMats = [mat(0x58b9a6), mat(0x6b77c8), mat(0xf19a66), mat(0x8e70bd)];
const hazardMat = mat(0xe84d5b);
const movingMat = mat(0xff784f);

const world = new THREE.Group();
scene.add(world);

const anchors = [];
const roofs = [];
const hazards = [];
const movers = [];
const checkpoints = [];
let targetAnchor = null;

function box(x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  world.add(mesh);
  return mesh;
}

function addRoof(x, y, z, w = 16, d = 16) {
  box(x, y - 2, z, w, 4, d, roofMats[roofs.length % roofMats.length]);
  roofs.push({ x, y, z, w, d });
}

function addAnchor(x, y, z) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffe14d,
    emissive: 0xffb800,
    emissiveIntensity: 2.4,
    roughness: 0.35
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.82, 18, 14), material);
  mesh.position.set(x, y, z);
  world.add(mesh);
  anchors.push(mesh);
  return mesh;
}

function addHazard(x, y, z, w, h, d) {
  const mesh = box(x, y, z, w, h, d, hazardMat);
  hazards.push({ mesh, w, h, d });
}

function addMover(x, y, z, w, h, d, axis = 'x', range = 4, speed = 1) {
  const mesh = box(x, y, z, w, h, d, movingMat);
  const mover = { mesh, w, h, d, axis, range, speed, base: mesh.position.clone(), phase: movers.length * 1.37 };
  movers.push(mover);
  hazards.push({ mesh, w, h, d, moving: true });
}

function addCheckpoint(x, y, z) {
  checkpoints.push({ z: z + 2, p: new THREE.Vector3(x, y + 1.15, z) });
}

function addFinish(x, y, z) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.45, 12, 36), mat(0xffdf45));
  ring.rotation.y = Math.PI / 2;
  ring.position.set(x, y + 5.5, z);
  world.add(ring);
  return z;
}

function buildLevel(level) {
  while (world.children.length) world.remove(world.children[0]);
  anchors.length = 0;
  roofs.length = 0;
  hazards.length = 0;
  movers.length = 0;
  checkpoints.length = 0;
  targetAnchor = null;

  if (level === 1) {
    const platforms = [
      { x: 0, y: 0, z: 0, w: 18, d: 18 },
      { x: 0, y: 0, z: 34, w: 18, d: 16 },
      { x: 4, y: 1.0, z: 68, w: 17, d: 16 },
      { x: -3, y: 1.7, z: 102, w: 19, d: 17 }
    ];
    platforms.forEach((p) => {
      addRoof(p.x, p.y, p.z, p.w, p.d);
      addCheckpoint(p.x, p.y, p.z);
    });
    addAnchor(0, 9.5, 18);
    addAnchor(6, 10.8, 52);
    addAnchor(-6, 12.0, 86);
    return addFinish(-3, 1.7, 109);
  }

  const count = 7 + Math.min(4, Math.floor(level / 2));
  const step = 34;
  let lane = 0;
  let y = 0;

  for (let i = 0; i < count; i++) {
    const z = i * step;
    if (i > 0) {
      const direction = i % 4 < 2 ? 1 : -1;
      lane = THREE.MathUtils.clamp(lane + direction * (level < 5 ? 3 : 4.5), -9, 9);
    }
    if (level >= 5 && i > 0 && i % 4 === 0) y += 1.3;

    addRoof(lane, y, z, 16 + (i % 2) * 2, 15);
    addCheckpoint(lane, y, z);

    if (i < count - 1) {
      const side = i % 2 ? -1 : 1;
      addAnchor(lane + side * (level < 4 ? 4 : 6), y + 11 + (i % 3), z + 18);

      if (level >= 3 && i % 3 === 1) {
        addHazard(lane + side * 3, y + 2.2, z + 10, 3, 4.4, 1.5);
      }
      if (level >= 5 && i % 3 === 0) {
        addMover(lane, y + 2.1, z + 11, 2.5, 3.8, 1.8, 'x', 4.2 + level * 0.2, 0.7 + level * 0.05);
      }
      if (level >= 7 && i % 4 === 2) {
        addMover(lane, y + 5.2, z + 12, 6.2, 1.0, 1.8, 'y', 2.4, 1.0 + level * 0.04);
      }
    }
  }

  return addFinish(lane, y, (count - 1) * step + 7);
}

const player = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.15, 6, 10), mat(0x222633));
const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 12), mat(0xffb77d));
head.position.y = 1.35;
body.castShadow = head.castShadow = true;
player.add(body, head);
scene.add(player);

const rope = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })
);
rope.visible = false;
scene.add(rope);

const pos = player.position;
const vel = new THREE.Vector3();
const checkpoint = new THREE.Vector3();

let running = false;
let respawning = false;
let grappling = false;
let currentAnchor = null;
let ropeLength = 0;
let ropeTargetLength = 0;
let level = 1;
let finishZ = 0;
let startT = 0;
let lastCheckpointZ = -Infinity;
let grappleCount = 0;
let pointerHeld = false;
let pointerId = null;
let pointerStartX = 0;
let pointerX = 0;
let steering = 0;
let grounded = false;
let spawnGraceUntil = 0;
let paused = false;
let pauseStartedAt = 0;
let pausedTotal = 0;

const BASE_RUN_SPEED = 8.4;
const MAX_RUN_SPEED = 11.2;
const GRAVITY = 19.5;
const ROPE_REEL_SPEED = 10.0;
const SWING_ASSIST = 2.2;
const STEER_ACCEL = 0.95;
const SOFT_LATERAL_LIMIT = 10.5;
const HARD_LATERAL_LIMIT = 13.5;
const AIR_DRAG = 0.9985;

function setAnchorVisual(anchor, selected, attached = false) {
  if (!anchor) return;
  const s = attached ? 1.42 : selected ? 1.24 : 1;
  anchor.scale.lerp(new THREE.Vector3(s, s, s), 0.25);
  anchor.material.emissiveIntensity = attached ? 5.0 : selected ? 3.7 : 2.4;
}

function chooseTarget() {
  let best = null;
  let bestScore = Infinity;
  for (const anchor of anchors) {
    const offset = anchor.position.clone().sub(pos);
    const dz = offset.z;
    if (dz < 4 || dz > 40) continue;
    const distance = offset.length();
    if (distance > 43) continue;
    const lateralBias = Math.abs(offset.x - steering * 7);
    const verticalPenalty = Math.max(0, offset.y - 18) * 0.2;
    const score = distance + lateralBias * 0.55 + verticalPenalty;
    if (score < bestScore) {
      bestScore = score;
      best = anchor;
    }
  }
  return best;
}

function updateTargetVisual() {
  const next = grappling ? currentAnchor : chooseTarget();
  if (next !== targetAnchor) {
    if (targetAnchor && targetAnchor !== currentAnchor) setAnchorVisual(targetAnchor, false);
    targetAnchor = next;
  }
  for (const anchor of anchors) {
    setAnchorVisual(anchor, anchor === targetAnchor, grappling && anchor === currentAnchor);
  }
}

function attachGrapple() {
  if (!running || respawning || grappling) return;
  const anchor = chooseTarget();
  if (!anchor) {
    toast.textContent = 'NO HOOK IN RANGE';
    setTimeout(() => {
      if (!respawning && toast.textContent === 'NO HOOK IN RANGE') toast.textContent = '';
    }, 350);
    return;
  }
  currentAnchor = anchor;
  grappling = true;
  grappleCount += 1;
  // Attach at the real distance, then smoothly tighten toward a shorter
  // working radius. This makes the rope catch early without teleporting.
  const attachDistance = pos.distanceTo(anchor.position);
  ropeLength = THREE.MathUtils.clamp(attachDistance, 7.5, 28);
  ropeTargetLength = THREE.MathUtils.clamp(attachDistance * 0.78, 7.25, 20.5);
  rope.visible = true;
  if (grounded) vel.y = Math.max(vel.y, 0.2);
  if (navigator.vibrate) navigator.vibrate(10);
}

function detachGrapple() {
  if (!grappling) return;
  grappling = false;
  rope.visible = false;
  currentAnchor = null;

  const speed = vel.length();
  if (speed > 12.5 && vel.y > -1.5) {
    toast.textContent = 'CLEAN RELEASE';
    if (navigator.vibrate) navigator.vibrate(8);
    setTimeout(() => {
      if (toast.textContent === 'CLEAN RELEASE') toast.textContent = '';
    }, 300);
  }
}

function resetPlayer() {
  detachGrapple();
  pos.copy(checkpoint);
  vel.set(0, 0, BASE_RUN_SPEED);
  respawning = false;
  grounded = true;
  spawnGraceUntil = performance.now() + 850;
}

function groundAt() {
  let top = -999;
  for (const roof of roofs) {
    if (
      Math.abs(pos.x - roof.x) < roof.w / 2 - 0.35 &&
      Math.abs(pos.z - roof.z) < roof.d / 2 - 0.35
    ) {
      top = Math.max(top, roof.y);
    }
  }
  return top;
}

function hitHazard(hazard) {
  const q = hazard.mesh.position;
  return (
    Math.abs(pos.x - q.x) < hazard.w / 2 + 0.32 &&
    Math.abs(pos.z - q.z) < hazard.d / 2 + 0.32 &&
    pos.y + 1.7 > q.y - hazard.h / 2 &&
    pos.y - 1.0 < q.y + hazard.h / 2
  );
}

function respawn(message) {
  if (respawning) return;
  respawning = true;
  detachGrapple();
  toast.textContent = message;
  if (navigator.vibrate) navigator.vibrate([20, 25, 35]);
  setTimeout(() => {
    toast.textContent = '';
    resetPlayer();
  }, 420);
}

function updatePointerSteering() {
  if (!pointerHeld) {
    steering = THREE.MathUtils.lerp(steering, 0, 0.12);
    return;
  }
  const span = Math.max(80, innerWidth * 0.18);
  steering = THREE.MathUtils.clamp((pointerX - pointerStartX) / span, -0.65, 0.65);
}

function simulateStep(dt) {
  const wasGrounded = grounded;
  grounded = false;

  // Running assist only exists while your feet are on a roof. In the air,
  // momentum belongs to the player instead of the game secretly pushing forward.
  if (wasGrounded) {
    vel.z = THREE.MathUtils.lerp(vel.z, MAX_RUN_SPEED, 1 - Math.pow(0.018, dt));
    vel.x *= Math.pow(0.72, dt);
  } else {
    vel.x *= Math.pow(AIR_DRAG, dt * 60);
    vel.z *= Math.pow(AIR_DRAG, dt * 60);
  }

  vel.y -= GRAVITY * dt;

  if (grappling && currentAnchor) {
    ropeLength = Math.max(
      ropeTargetLength,
      ropeLength - ROPE_REEL_SPEED * dt
    );

    const radial = pos.clone().sub(currentAnchor.position);
    const radialLength = Math.max(radial.length(), 0.001);
    const n = radial.multiplyScalar(1 / radialLength);

    // Apply tension before the hard constraint so the rope curves the path
    // progressively instead of suddenly catching after the player passes it.
    const stretch = Math.max(0, radialLength - ropeLength);
    if (stretch > 0) {
      const inward = n.clone().multiplyScalar(-1);
      const outwardSpeed = Math.max(0, vel.dot(n));
      vel.addScaledVector(inward, (stretch * 13 + outwardSpeed * 4.5) * dt);
    }

    // Very small tangent assist keeps the arcade flow alive without turning
    // the rope into a forward tractor beam.
    const forwardTangent = new THREE.Vector3(0, 0, 1).addScaledVector(n, -n.z);
    if (forwardTangent.lengthSq() > 0.01) {
      forwardTangent.normalize();
      vel.addScaledVector(forwardTangent, SWING_ASSIST * dt);
    }

    const sideTangent = new THREE.Vector3(1, 0, 0).addScaledVector(n, -n.x);
    if (sideTangent.lengthSq() > 0.01) {
      sideTangent.normalize();
      vel.addScaledVector(sideTangent, steering * STEER_ACCEL * dt);
    }
  }

  const previousYSpeed = vel.y;

  // Keep side-to-side control useful without letting a swing launch the
  // character completely out of the phone's view.
  const lateralOverage = Math.abs(pos.x) - SOFT_LATERAL_LIMIT;
  if (lateralOverage > 0) {
    vel.x += -Math.sign(pos.x) * lateralOverage * 10 * dt;
  }

  pos.addScaledVector(vel, dt);

  if (Math.abs(pos.x) > HARD_LATERAL_LIMIT) {
    pos.x = THREE.MathUtils.clamp(pos.x, -HARD_LATERAL_LIMIT, HARD_LATERAL_LIMIT);
    if (Math.sign(vel.x) === Math.sign(pos.x)) vel.x *= 0.18;
  }

  if (grappling && currentAnchor) {
    const radial = pos.clone().sub(currentAnchor.position);
    const distance = radial.length();

    if (distance > ropeLength) {
      const n = radial.multiplyScalar(1 / distance);
      pos.copy(currentAnchor.position).addScaledVector(n, ropeLength);

      // Remove only the velocity that tries to stretch the rope. Tangential
      // velocity survives, which is what creates the pendulum arc.
      const outwardSpeed = vel.dot(n);
      if (outwardSpeed > 0) vel.addScaledVector(n, -outwardSpeed);
    }

    if (currentAnchor.position.z < pos.z - 7) detachGrapple();
  }

  const ground = groundAt();
  if (ground > -900 && pos.y <= ground + 1.15 && vel.y <= 0) {
    const impactSpeed = Math.abs(previousYSpeed);
    pos.y = ground + 1.15;
    vel.y = 0;
    grounded = true;

    if (impactSpeed > 14.5) {
      vel.z *= 0.92;
    }

    for (const cp of checkpoints) {
      if (cp.z > lastCheckpointZ && pos.z >= cp.z) {
        checkpoint.copy(cp.p);
        lastCheckpointZ = cp.z;
      }
    }
  }
}

function updatePhysics(dt, now) {
  if (!running || respawning || paused) return;

  updatePointerSteering();

  for (const mover of movers) {
    mover.mesh.position[mover.axis] =
      mover.base[mover.axis] + Math.sin(now * 0.001 * mover.speed + mover.phase) * mover.range;
  }

  // Three small physics steps make the rope constraint much less jittery on phones.
  const steps = 3;
  const stepDt = dt / steps;
  for (let i = 0; i < steps; i++) {
    simulateStep(stepDt);

    if (pos.y < -13 || Math.abs(pos.x) > 25) {
      respawn('MISSED!');
      return;
    }

    if (now > spawnGraceUntil) {
      for (const hazard of hazards) {
        if (hitHazard(hazard)) {
          respawn('CRASH!');
          return;
        }
      }
    }
  }

  updateTargetVisual();

  if (rope.visible && currentAnchor) {
    rope.geometry.setFromPoints([
      pos.clone().add(new THREE.Vector3(0, 0.65, 0)),
      currentAnchor.position
    ]);
  }

  hint.textContent = grappling
    ? 'SWINGING · RELEASE WHEN YOU RISE'
    : targetAnchor
      ? 'HOLD TO GRAPPLE'
      : 'NEXT HOOK AHEAD';

  player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -vel.x * 0.028, 0.1);
  player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, vel.y * 0.012, 0.1);

  // Follow lateral movement closely so the player stays near the center of
  // the screen instead of disappearing off the left or right edge.
  const cameraTarget = new THREE.Vector3(pos.x * 0.88, pos.y + 5.6, pos.z - 15.5);
  camera.position.lerp(cameraTarget, 1 - Math.pow(0.0045, dt));
  camera.lookAt(pos.x * 0.82, pos.y + 2.1, pos.z + 13);
  camera.fov = THREE.MathUtils.lerp(camera.fov, 62 + Math.max(0, vel.length() - 10) * 0.2, 0.045);
  camera.updateProjectionMatrix();

  speedLabel.textContent = Math.round(vel.length());
  progressFill.style.width = `${Math.min(100, Math.max(0, (pos.z / finishZ) * 100))}%`;

  if (pos.z > finishZ) {
    if (grappleCount < 2) {
      respawn('SWING THE COURSE');
      return;
    }
    running = false;
    detachGrapple();
    const time = (performance.now() - startT - pausedTotal) / 1000;
    const key = `grapple-best-${level}`;
    const previousBest = Number(localStorage.getItem(key) || 999);
    if (time < previousBest) localStorage.setItem(key, time);
    finishTime.textContent = `${time.toFixed(2)}s`;
    bestLabel.textContent = `${Math.min(time, previousBest).toFixed(2)}s`;
    finishScreen.classList.add('visible');
  }
}

function startLevel() {
  startScreen.classList.remove('visible');
  finishScreen.classList.remove('visible');
  finishZ = buildLevel(level);
  checkpoint.set(0, 1.15, 0);
  lastCheckpointZ = -Infinity;
  grappleCount = 0;
  pointerHeld = false;
  steering = 0;
  paused = false;
  pauseStartedAt = 0;
  pausedTotal = 0;
  pauseScreen.classList.remove('visible');
  pauseButton.classList.remove('hidden');
  resetPlayer();

  levelLabel.textContent = `${level}/10`;
  const best = localStorage.getItem(`grapple-best-${level}`);
  bestLabel.textContent = best ? `${Number(best).toFixed(2)}s` : '--';
  startT = performance.now();
  running = true;

  toast.textContent =
    level === 1
      ? 'FLOW TEST: HOLD → SWING → RELEASE'
      : level < 4
        ? 'USE THE HOOKS TO CHANGE YOUR LINE'
        : level < 7
          ? 'CONTROL YOUR LANDINGS'
          : 'CHAIN THE SWINGS';

  setTimeout(() => {
    if (!respawning) toast.textContent = '';
  }, 1250);
}

function setPaused(nextPaused) {
  if (!running || respawning || paused === nextPaused) return;
  paused = nextPaused;
  pointerHeld = false;
  pointerId = null;
  detachGrapple();

  if (paused) {
    pauseStartedAt = performance.now();
    pauseScreen.classList.add('visible');
    pauseButton.classList.add('hidden');
  } else {
    if (pauseStartedAt) pausedTotal += performance.now() - pauseStartedAt;
    pauseStartedAt = 0;
    pauseScreen.classList.remove('visible');
    pauseButton.classList.remove('hidden');
    last = performance.now();
  }
}

pauseButton.onclick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  setPaused(true);
};

resumeButton.onclick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  setPaused(false);
};

restartButton.onclick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  paused = false;
  pauseScreen.classList.remove('visible');
  startLevel();
};

document.querySelector('#startButton').onclick = startLevel;
document.querySelector('#nextButton').onclick = () => {
  level = level < 10 ? level + 1 : 1;
  startLevel();
};

renderer.domElement.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  pointerHeld = true;
  pointerId = event.pointerId;
  pointerStartX = event.clientX;
  pointerX = event.clientX;
  renderer.domElement.setPointerCapture?.(event.pointerId);
  attachGrapple();
}, { passive: false });

renderer.domElement.addEventListener('pointermove', (event) => {
  if (!pointerHeld || event.pointerId !== pointerId) return;
  event.preventDefault();
  pointerX = event.clientX;
}, { passive: false });

function endPointer(event) {
  if (pointerId !== null && event?.pointerId !== undefined && event.pointerId !== pointerId) return;
  event?.preventDefault?.();
  pointerHeld = false;
  pointerId = null;
  detachGrapple();
}

renderer.domElement.addEventListener('pointerup', endPointer, { passive: false });
renderer.domElement.addEventListener('pointercancel', endPointer, { passive: false });
renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

addEventListener('keydown', (event) => {
  if (event.code === 'Space' && !event.repeat) {
    event.preventDefault();
    pointerHeld = true;
    pointerStartX = innerWidth / 2;
    pointerX = pointerStartX;
    attachGrapple();
  }
});

addEventListener('keyup', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    pointerHeld = false;
    detachGrapple();
  }
});

addEventListener('blur', () => {
  pointerHeld = false;
  detachGrapple();
  if (running && !paused && !finishScreen.classList.contains('visible')) setPaused(true);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && running && !paused) setPaused(true);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

finishZ = buildLevel(1);
checkpoint.set(0, 1.15, 0);
resetPlayer();
camera.position.set(0, 7, -13);
camera.lookAt(0, 2, 10);

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.025, (now - last) / 1000);
  last = now;
  updatePhysics(dt, now);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
