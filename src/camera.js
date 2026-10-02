import * as THREE from 'three';
export class GameCamera {
  constructor(camera){this.camera=camera;this.target=new THREE.Vector3();this.look=new THREE.Vector3();}
  reset(z=-12){this.camera.position.set(0,7,z-19);this.camera.lookAt(0,3,z+15);}
  update(player,dt){
    // Follow only part of the vertical motion: enough to keep the runner in
    // frame, not enough to make the whole city bob with every swing.
    const py=player.position.y;
    const followY=THREE.MathUtils.clamp(7.2+(py-1.15)*0.42,5.5,11.5);
    this.target.set(0,followY,player.position.z-19);
    this.camera.position.lerp(this.target,1-Math.pow(.006,dt));
    this.look.set(0,THREE.MathUtils.clamp(3.2+(py-1.15)*0.28,2.5,7),player.position.z+15);
    this.camera.lookAt(this.look);
  }
}
