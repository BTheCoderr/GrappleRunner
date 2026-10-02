import * as THREE from 'three';

const $=s=>document.querySelector(s);
const game=$('#game'),hint=$('#targetHint'),toast=$('#toast'),speedLabel=$('#speedLabel'),progressFill=$('#progressFill'),levelLabel=$('#levelLabel'),bestLabel=$('#bestLabel'),startScreen=$('#startScreen'),finishScreen=$('#finishScreen'),finishTime=$('#finishTime'),pauseButton=$('#pauseButton'),pauseScreen=$('#pauseScreen'),resumeButton=$('#resumeButton'),restartButton=$('#restartButton');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8ed8ff);scene.fog=new THREE.Fog(0x8ed8ff,90,260);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,350);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.domElement.style.touchAction='none';game.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x59758d,2.4));const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(-15,35,-10);scene.add(sun);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.72});const world=new THREE.Group();scene.add(world);
function box(x,y,z,w,h,d,c){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;world.add(m);return m}
// Controller proving ground: run, gap, forward swing, landing, second gap, forward swing, finish.
box(0,-2,0,18,4,44,0x657bd1);box(0,-2,72,24,4,30,0x54b99e);box(0,1,125,20,4,28,0xf09a65);box(-24,9,32,15,27,20,0x7896a8);box(25,12,63,17,34,22,0x71899d);box(-25,15,112,17,40,22,0x7896a8);box(24,12,145,16,34,20,0x71899d);
function makeAnchor(x,y,z){const a=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),new THREE.MeshStandardMaterial({color:0xffdf45,emissive:0xffb400,emissiveIntensity:3}));a.position.set(x,y,z);world.add(a);return a}
const anchors=[makeAnchor(0,15,36),makeAnchor(0,19,104)];
const finish=new THREE.Mesh(new THREE.TorusGeometry(4,.45,12,36),mat(0xffdf45));finish.rotation.y=Math.PI/2;finish.position.set(0,7,134);world.add(finish);
const player=new THREE.Group(),body=new THREE.Mesh(new THREE.CapsuleGeometry(.62,1.15,6,10),mat(0x222633)),head=new THREE.Mesh(new THREE.SphereGeometry(.48,16,12),mat(0xffb77d));head.position.y=1.35;player.add(body,head);scene.add(player);
const rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xffffff}));rope.visible=false;scene.add(rope);
const pos=player.position,vel=new THREE.Vector3();let running=false,paused=false,grappling=false,pointerHeld=false,currentAnchor=null,ropeLength=0,theta=0,omega=0,startT=0,landings=0,grapples=0,last=performance.now(),grappleStart=0;
const RUN=10.4,GRAVITY=21.5,MAX_HOLD=1900;
function groundAt(){if(pos.z<22&&Math.abs(pos.x)<8.5)return 0;if(pos.z>57&&pos.z<87&&Math.abs(pos.x)<11.5)return 0;if(pos.z>111&&pos.z<139&&Math.abs(pos.x)<9.5)return 3;return -999}
function nextAnchor(){for(const a of anchors){const dz=a.position.z-pos.z;if(dz>2&&dz<34)return a}return null}
function reset(){grappling=false;pointerHeld=false;currentAnchor=null;rope.visible=false;pos.set(0,1.15,-13);vel.set(0,0,RUN);theta=omega=0;landings=grapples=0;hint.textContent='RUN';toast.textContent='';progressFill.style.width='0%'}
function attach(){if(!running||paused||grappling)return;const a=nextAnchor();if(!a)return;currentAnchor=a;grappling=true;grapples++;grappleStart=performance.now();rope.visible=true;const rel=pos.clone().sub(a.position);ropeLength=THREE.MathUtils.clamp(Math.sqrt(rel.y*rel.y+rel.z*rel.z),10,24);theta=Math.atan2(rel.z,-rel.y);const tangentY=Math.sin(theta),tangentZ=Math.cos(theta);omega=(vel.y*tangentY+vel.z*tangentZ)/ropeLength;omega=Math.max(omega,.42);vel.x=0;hint.textContent='HOLD · SWING FORWARD';navigator.vibrate?.(8)}
function release(manual=true){if(!grappling)return;const tangentY=Math.sin(theta),tangentZ=Math.cos(theta),tangential=omega*ropeLength;vel.set(0,tangentY*tangential,tangentZ*tangential);vel.z=Math.max(vel.z,manual?9.2:9.8);if(theta>.18)vel.y=Math.max(vel.y,1.6);grappling=false;rope.visible=false;currentAnchor=null;hint.textContent='FLY FORWARD';navigator.vibrate?.(manual?6:4)}
function physics(dt){if(grappling&&currentAnchor){
  // Forward/vertical pendulum only. No lateral swing and no hidden auto-run while attached.
  const alpha=-(GRAVITY/ropeLength)*Math.sin(theta);omega+=alpha*dt;omega*=Math.pow(.998,dt*60);theta+=omega*dt;
  // Keep the useful arc controlled: approach from behind, pass underneath, climb forward.
  theta=THREE.MathUtils.clamp(theta,-1.12,1.02);pos.x=0;pos.y=currentAnchor.position.y-Math.cos(theta)*ropeLength;pos.z=currentAnchor.position.z+Math.sin(theta)*ropeLength;
  vel.set(0,Math.sin(theta)*omega*ropeLength,Math.cos(theta)*omega*ropeLength);
  const held=performance.now()-grappleStart;
  // Holding too long never creates an orbit. Release near the useful forward apex.
  if(theta>.82||(theta>.34&&omega<=.05)||held>MAX_HOLD)release(false);
  return;
 }
 const g=groundAt();if(g>-900&&pos.y<=g+1.15&&vel.y<=0){const wasAir=Math.abs(vel.y)>1;pos.y=g+1.15;vel.y=0;vel.x=0;vel.z=THREE.MathUtils.lerp(vel.z,RUN,.16);if(wasAir){landings++;toast.textContent='SMOOTH';setTimeout(()=>{if(toast.textContent==='SMOOTH')toast.textContent=''},280)}}else vel.y-=GRAVITY*dt;
 pos.x=THREE.MathUtils.lerp(pos.x,0,1-Math.pow(.05,dt));pos.addScaledVector(vel,dt);
}
function update(dt){if(!running||paused)return;if(pointerHeld&&!grappling)attach();for(let i=0;i<6;i++)physics(dt/6);if(pos.y<-15){toast.textContent='MISSED';navigator.vibrate?.(20);setTimeout(()=>{toast.textContent=''},300);const checkpoint=pos.z>88?new THREE.Vector3(0,4.15,116):pos.z>45?new THREE.Vector3(0,1.15,62):new THREE.Vector3(0,1.15,-13);grappling=false;pointerHeld=false;currentAnchor=null;rope.visible=false;pos.copy(checkpoint);vel.set(0,0,RUN);return}
 if(grappling&&currentAnchor){rope.geometry.setFromPoints([pos.clone().add(new THREE.Vector3(0,.6,0)),currentAnchor.position]);const forward=theta>0;rope.material.color.setHex(forward?0xa7ffbf:0xffffff);hint.textContent=theta>.28?'RELEASE':'HOLD · SWING'}else{const a=nextAnchor();hint.textContent=a&&a.position.z-pos.z<27?'HOLD TO GRAPPLE':groundAt()>-900?'RUN':'FLY'}
 // Camera follows forward progress but does not glue itself to every vertical swing movement.
 const desired=new THREE.Vector3(0,7.2,pos.z-18.5);camera.position.lerp(desired,1-Math.pow(.006,dt));camera.lookAt(0,3.1,pos.z+16);camera.fov=THREE.MathUtils.lerp(camera.fov,60+Math.max(0,vel.length()-11)*.35,.05);camera.updateProjectionMatrix();
 player.rotation.x=THREE.MathUtils.lerp(player.rotation.x,grappling?theta*.28:vel.y*.012,.12);speedLabel.textContent=Math.round(vel.length());progressFill.style.width=`${Math.max(0,Math.min(100,(pos.z+13)/147*100))}%`;
 if(pos.z>136&&groundAt()>-900){running=false;const t=(performance.now()-startT)/1000;finishTime.textContent=`${t.toFixed(2)}s`;bestLabel.textContent=`${grapples} GRAPPLES`;finishScreen.classList.add('visible');pauseButton.classList.add('hidden')}
}
function start(){reset();running=true;paused=false;startT=performance.now();levelLabel.textContent='CONTROL TEST';bestLabel.textContent='FORWARD ONLY';startScreen.classList.remove('visible');finishScreen.classList.remove('visible');pauseScreen.classList.remove('visible');pauseButton.classList.remove('hidden')}
$('#startButton').onclick=start;$('#nextButton').onclick=start;restartButton.onclick=start;pauseButton.onclick=e=>{e.stopPropagation();if(!running)return;paused=true;pointerHeld=false;if(grappling)release(false);pauseScreen.classList.add('visible');pauseButton.classList.add('hidden')};resumeButton.onclick=e=>{e.stopPropagation();paused=false;pauseScreen.classList.remove('visible');pauseButton.classList.remove('hidden');last=performance.now()};
renderer.domElement.addEventListener('pointerdown',e=>{if(!running||paused)return;e.preventDefault();pointerHeld=true;attach()},{passive:false});renderer.domElement.addEventListener('pointerup',()=>{pointerHeld=false;release(true)});renderer.domElement.addEventListener('pointercancel',()=>{pointerHeld=false;release(true)});
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.033);last=now;update(dt);renderer.render(scene,camera)}requestAnimationFrame(loop);addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});reset();camera.position.set(0,7,-29);camera.lookAt(0,3,15);
