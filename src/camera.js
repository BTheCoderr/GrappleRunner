import * as THREE from 'three';
export class GameCamera {
  constructor(camera){this.camera=camera;this.target=new THREE.Vector3();}
  reset(z=-12){this.camera.position.set(0,7,z-19);this.camera.lookAt(0,3,z+15);}
  update(player,dt){this.target.set(0,7.4,player.position.z-19);this.camera.position.lerp(this.target,1-Math.pow(.008,dt));this.camera.lookAt(0,3.3,player.position.z+15);}
}
