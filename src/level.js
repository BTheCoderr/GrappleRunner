import * as THREE from 'three';

export const COURSE_END = 190;
export const START_Z = -12;
export const RUN_SPEED = 10.5;

export function groundHeight(z) {
  if (z < 22) return 0;
  if (z > 55 && z < 88) return 0;
  if (z > 116 && z < 145) return 2;
  if (z > 174 && z < 205) return 4;
  return null;
}

export function buildLevel(scene) {
  const group = new THREE.Group(); scene.add(group);
  const material = color => new THREE.MeshStandardMaterial({ color, roughness:.72 });
  const box = (x,y,z,w,h,d,color) => { const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color)); m.position.set(x,y,z); m.receiveShadow=m.castShadow=true; group.add(m); return m; };
  box(0,-2,0,18,4,44,0x657bd1);       // start
  box(0,-2,71,22,4,32,0x54b99e);      // easy landing
  box(0,0,131,20,4,29,0xf09a65);      // timing landing
  box(0,2,190,22,4,32,0x9a7bd1);      // long-gap landing
  box(-23,10,34,14,28,18,0x7896a8); box(24,12,69,15,34,20,0x71899d);
  box(-24,14,124,16,38,20,0x7896a8); box(24,16,181,16,42,20,0x71899d);
  const makeAnchor=(y,z)=>{const a=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),new THREE.MeshStandardMaterial({color:0xffdf45,emissive:0xffb400,emissiveIntensity:3}));a.position.set(0,y,z);group.add(a);return a;};
  const anchors=[makeAnchor(15,36),makeAnchor(18,103),makeAnchor(23,160)];
  const labels=['EASY SWING','LATE RELEASE','LONG GAP'];
  const finish=new THREE.Mesh(new THREE.TorusGeometry(4,.45,12,36),material(0xffdf45)); finish.rotation.y=Math.PI/2; finish.position.set(0,9,195); group.add(finish);
  return { group, anchors, labels };
}

export function nextAnchor(anchors,z) { return anchors.find(a => { const dz=a.position.z-z; return dz>2&&dz<36; }) || null; }
