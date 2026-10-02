import * as THREE from 'three';

export const RUN_SPEED = 10.5;

// Five authored rounds. Same front/back grapple language, increasingly demanding timing.
export const LEVELS = [
  {name:'ROOFTOP RHYTHM', start:-12, end:190, platforms:[[-12,22,0],[55,88,0],[116,145,2],[174,205,4]], hooks:[[15,36],[18,103],[23,160]], labels:['EASY SWING','LATE RELEASE','LONG GAP']},
  {name:'DOUBLE DROP', start:220, end:420, platforms:[[220,250,4],[282,310,1],[344,371,5],[401,435,2]], hooks:[[20,267],[15,327],[24,387]], labels:['DROP LOW','CARRY SPEED','CLIMB OUT']},
  {name:'HIGH LINE', start:455, end:675, platforms:[[455,484,2],[523,551,7],[594,620,3],[657,692,8]], hooks:[[24,505],[29,573],[22,640]], labels:['HIGH CATCH','SHORT LANDING','HIGH FINISH']},
  {name:'GAP RUN', start:715, end:955, platforms:[[715,746,3],[790,815,5],[858,882,2],[932,970,6]], hooks:[[21,769],[26,838],[25,907]], labels:['LONG GAP','QUICK RELEASE','LONG GAP']},
  {name:'FINAL FLOW', start:1000, end:1280, platforms:[[1000,1030,4],[1070,1094,7],[1135,1158,3],[1200,1222,8],[1260,1295,5]], hooks:[[24,1050],[28,1115],[23,1180],[30,1240]], labels:['CATCH','RELEASE','CARRY','FINAL SWING']}
];

export function groundHeight(z,levelIndex=0){const level=LEVELS[levelIndex];for(const [a,b,h] of level.platforms)if(z>=a&&z<=b)return h;return null;}

export function buildLevel(scene,levelIndex=0){
  const level=LEVELS[levelIndex],group=new THREE.Group();scene.add(group);const material=color=>new THREE.MeshStandardMaterial({color,roughness:.72});
  const box=(x,y,z,w,h,d,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.receiveShadow=m.castShadow=true;group.add(m);return m;};
  const colors=[0x657bd1,0x54b99e,0xf09a65,0x9a7bd1,0x58a6a6];
  level.platforms.forEach(([a,b,h],i)=>box(0,h-2,(a+b)/2,20,4,b-a,colors[i%colors.length]));
  // Side skyline only; never intersects the player's forward plane.
  level.platforms.forEach(([a,b,h],i)=>{const z=(a+b)/2+18;box(i%2?-24:24,h+11,z,14,26,18,0x7896a8);});
  const makeAnchor=(y,z)=>{const a=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),new THREE.MeshStandardMaterial({color:0xffdf45,emissive:0xffb400,emissiveIntensity:3}));a.position.set(0,y,z);group.add(a);return a;};
  const anchors=level.hooks.map(([y,z])=>makeAnchor(y,z));
  const finish=new THREE.Mesh(new THREE.TorusGeometry(4,.45,12,36),material(0xffdf45));finish.rotation.y=Math.PI/2;finish.position.set(0,(level.platforms.at(-1)?.[2]||0)+6,level.end-6);group.add(finish);
  return {group,anchors,labels:level.labels,level};
}

export function nextAnchor(anchors,z){return anchors.find(a=>{const dz=a.position.z-z;return dz>2&&dz<38;})||null;}
