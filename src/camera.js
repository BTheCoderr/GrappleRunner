import * as THREE from 'three';
export class GameCamera{
  constructor(camera){this.camera=camera;this.target=new THREE.Vector3();this.look=new THREE.Vector3();this.baseFov=61;this.kick=0;this.ahead=18;}
  reset(z=-12){this.camera.fov=this.baseFov;this.camera.updateProjectionMatrix();this.camera.position.set(0,7.4,z-20.5);this.camera.lookAt(0,3.4,z+18);this.kick=0;this.ahead=18;}
  pulse(amount=.35){this.kick=Math.max(this.kick,amount);}
  update(player,dt,speed=0,targetAnchor=null){const py=player.position.y,fast=THREE.MathUtils.clamp((speed-9)/14,0,1),anchorAhead=targetAnchor?THREE.MathUtils.clamp(targetAnchor.position.z-player.position.z,12,34):18+fast*8;this.ahead=THREE.MathUtils.lerp(this.ahead,anchorAhead,1-Math.pow(.03,dt));const followY=THREE.MathUtils.clamp(7.5+(py-1.15)*.36,5.8,11.8);this.target.set(0,followY+this.kick*.14,player.position.z-20.5-fast*2-this.kick*.45);this.camera.position.lerp(this.target,1-Math.pow(.008,dt));const lookY=THREE.MathUtils.clamp(3.4+(py-1.15)*.22,2.7,7.2);this.look.set(0,lookY,player.position.z+this.ahead);this.camera.lookAt(this.look);const speedFov=this.baseFov+fast*5+this.kick*1.25;this.camera.fov=THREE.MathUtils.lerp(this.camera.fov,speedFov,1-Math.pow(.025,dt));this.camera.updateProjectionMatrix();this.kick=Math.max(0,this.kick-dt*3.1);}
}
