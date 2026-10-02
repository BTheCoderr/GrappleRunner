import * as THREE from 'three';
export class GameCamera{
  constructor(camera){this.camera=camera;this.target=new THREE.Vector3();this.look=new THREE.Vector3();this.baseFov=60;this.kick=0;}
  reset(z=-12){this.camera.fov=this.baseFov;this.camera.updateProjectionMatrix();this.camera.position.set(0,7,z-19);this.camera.lookAt(0,3,z+15);this.kick=0;}
  pulse(amount=.35){this.kick=Math.max(this.kick,amount);}
  update(player,dt,speed=0){const py=player.position.y,followY=THREE.MathUtils.clamp(7.2+(py-1.15)*.42,5.5,11.5);this.target.set(0,followY+this.kick*.18,player.position.z-19-this.kick*.7);this.camera.position.lerp(this.target,1-Math.pow(.006,dt));this.look.set(0,THREE.MathUtils.clamp(3.2+(py-1.15)*.28,2.5,7),player.position.z+15);this.camera.lookAt(this.look);const speedFov=this.baseFov+THREE.MathUtils.clamp((speed-10)*.42,0,7)+this.kick*1.8;this.camera.fov=THREE.MathUtils.lerp(this.camera.fov,speedFov,1-Math.pow(.02,dt));this.camera.updateProjectionMatrix();this.kick=Math.max(0,this.kick-dt*2.8);}
}
