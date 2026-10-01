import * as THREE from 'three';

const $=s=>document.querySelector(s);
const game=$('#game'),hint=$('#targetHint'),toast=$('#toast'),speedLabel=$('#speedLabel'),progressFill=$('#progressFill'),levelLabel=$('#levelLabel'),bestLabel=$('#bestLabel'),startScreen=$('#startScreen'),finishScreen=$('#finishScreen'),finishTime=$('#finishTime'),pauseButton=$('#pauseButton'),pauseScreen=$('#pauseScreen'),resumeButton=$('#resumeButton'),restartButton=$('#restartButton');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8ed8ff);scene.fog=new THREE.Fog(0x8ed8ff,80,220);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,300);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.domElement.style.touchAction='none';game.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x59758d,2.4));const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(-15,35,-10);scene.add(sun);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.72});const world=new THREE.Group();scene.add(world);
function box(x,y,z,w,h,d,c){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;world.add(m);return m}
// Deliberately tiny test course: runway -> impossible gap -> one hook -> landing.
box(0,-2,0,18,4,42,0x657bd1);box(0,-2,76,24,4,34,0x54b99e);box(-23,8,30,15,25,20,0x7896a8);box(25,12,60,17,33,22,0x7896a8);
const anchor=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),new THREE.MeshStandardMaterial({color:0xffdf45,emissive:0xffb400,emissiveIntensity:3}));anchor.position.set(0,16,37);world.add(anchor);
const finish=new THREE.Mesh(new THREE.TorusGeometry(4,.45,12,36),mat(0xffdf45));finish.rotation.y=Math.PI/2;finish.position.set(0,5,84);world.add(finish);
const player=new THREE.Group(),body=new THREE.Mesh(new THREE.CapsuleGeometry(.62,1.15,6,10),mat(0x222633)),head=new THREE.Mesh(new THREE.SphereGeometry(.48,16,12),mat(0xffb77d));head.position.y=1.35;player.add(body,head);scene.add(player);
const rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xffffff}));rope.visible=false;scene.add(rope);
const pos=player.position,vel=new THREE.Vector3();let running=false,paused=false,grappling=false,pointerHeld=false,ropeLength=0,theta=0,omega=0,startT=0,airborne=false,landed=false,last=performance.now();
const RUN=10.2,GRAVITY=22,HOOK_Z=37,LAND_Z=76;
function groundAt(){if(pos.z<21&&Math.abs(pos.x)<8.5)return 0;if(pos.z>59&&pos.z<93&&Math.abs(pos.x)<11.5)return 0;return -999}
function reset(){grappling=false;pointerHeld=false;airborne=false;landed=false;rope.visible=false;pos.set(0,1.15,-12);vel.set(0,0,RUN);theta=omega=0;hint.textContent='RUN TO THE GAP';toast.textContent='';progressFill.style.width='0%'}
function attach(){if(!running||paused||grappling)return;const dz=anchor.position.z-pos.z;if(dz<2||dz>34)return;grappling=true;airborne=true;rope.visible=true;const rel=pos.clone().sub(anchor.position);ropeLength=Math.max(10,rel.length());theta=Math.atan2(rel.z,-rel.y);const tangent=new THREE.Vector3(0,Math.sin(theta),Math.cos(theta));omega=vel.dot(tangent)/ropeLength;hint.textContent='HOLD · SWING';navigator.vibrate?.(8)}
function release(){if(!grappling)return;const tangent=new THREE.Vector3(0,Math.sin(theta),Math.cos(theta));const tangential=omega*ropeLength;vel.set(0,tangent.y*tangential,tangent.z*tangential);vel.z=Math.max(vel.z,8);grappling=false;rope.visible=false;hint.textContent='FLY · LAND';navigator.vibrate?.(6)}
function physics(dt){if(grappling){
  // Explicit 2D pendulum. Position comes from rope angle, not from auto-run.
  // theta=0 is directly below the hook; positive theta is forward.
  const alpha=-(GRAVITY/ropeLength)*Math.sin(theta);omega+=alpha*dt;omega*=Math.pow(.997,dt*60);theta+=omega*dt;
  pos.x=0;pos.y=anchor.position.y-Math.cos(theta)*ropeLength;pos.z=anchor.position.z+Math.sin(theta)*ropeLength;
  const tangent=new THREE.Vector3(0,Math.sin(theta),Math.cos(theta));vel.set(0,tangent.y*omega*ropeLength,tangent.z*omega*ropeLength);
  // Holding can never create a second orbit. At the forward apex the rope lets go.
  if(theta>0.9||((theta>0.28)&&omega<=0))release();
 }else{
  const g=groundAt();if(g>-900&&pos.y<=g+1.15&&vel.y<=0){pos.y=g+1.15;vel.y=0;airborne=false;vel.z=RUN}else{airborne=true;vel.y-=GRAVITY*dt}
  pos.addScaledVector(vel,dt);
 }
}
function update(dt){if(!running||paused)return;if(pointerHeld&&!grappling)attach();for(let i=0;i<6;i++)physics(dt/6);if(pos.y<-14){toast.textContent='MISSED — TRY THE SWING';navigator.vibrate?.(20);reset();return}if(grappling){rope.geometry.setFromPoints([pos.clone().add(new THREE.Vector3(0,.6,0)),anchor.position]);const forward=theta>0;rope.material.color.setHex(forward?0xa7ffbf:0xffffff);hint.textContent=forward?'RELEASE NOW':'HOLD · DROP UNDER HOOK'}
 if(!landed&&pos.z>61&&groundAt()>-900&&pos.y<=1.18){landed=true;toast.textContent='THAT IS THE SWING';setTimeout(()=>{if(toast.textContent==='THAT IS THE SWING')toast.textContent=''},600)}
 const camX=grappling?-6*Math.sin(theta):0,camY=pos.y+6.2,camZ=pos.z-17;camera.position.lerp(new THREE.Vector3(camX,camY,camZ),1-Math.pow(.004,dt));camera.lookAt(pos.x,pos.y+2,pos.z+14);speedLabel.textContent=Math.round(vel.length());progressFill.style.width=`${Math.max(0,Math.min(100,(pos.z+12)/96*100))}%`;
 if(pos.z>88&&landed){running=false;const t=(performance.now()-startT)/1000;finishTime.textContent=`${t.toFixed(2)}s`;bestLabel.textContent='SWING TEST';finishScreen.classList.add('visible');pauseButton.classList.add('hidden')}
}
function start(){reset();running=true;paused=false;startT=performance.now();levelLabel.textContent='SWING TEST';bestLabel.textContent='ONE HOOK';startScreen.classList.remove('visible');finishScreen.classList.remove('visible');pauseScreen.classList.remove('visible');pauseButton.classList.remove('hidden')}
$('#startButton').onclick=start;$('#nextButton').onclick=start;restartButton.onclick=start;pauseButton.onclick=e=>{e.stopPropagation();if(!running)return;paused=true;pointerHeld=false;pauseScreen.classList.add('visible');pauseButton.classList.add('hidden')};resumeButton.onclick=e=>{e.stopPropagation();paused=false;pauseScreen.classList.remove('visible');pauseButton.classList.remove('hidden');last=performance.now()};
renderer.domElement.addEventListener('pointerdown',e=>{if(!running||paused)return;e.preventDefault();pointerHeld=true;attach()},{passive:false});renderer.domElement.addEventListener('pointerup',()=>{pointerHeld=false;release()});renderer.domElement.addEventListener('pointercancel',()=>{pointerHeld=false;release()});
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.033);last=now;update(dt);renderer.render(scene,camera)}requestAnimationFrame(loop);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});reset();camera.position.set(0,7,-27);camera.lookAt(0,2,15);
