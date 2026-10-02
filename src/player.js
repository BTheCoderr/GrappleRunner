import * as THREE from 'three';
import { groundHeight, RUN_SPEED, START_Z } from './level.js';
const GRAVITY=21.5;
export class PlayerController {
  constructor(object){this.object=object;this.pos=object.position;this.vel=new THREE.Vector3();this.reset();}
  reset(z=START_Z,y=1.15){this.pos.set(0,y,z);this.vel.set(0,0,RUN_SPEED);}
  step(dt,grappleActive){if(grappleActive)return;const g=groundHeight(this.pos.z);if(g!==null&&this.pos.y<=g+1.15&&this.vel.y<=0){this.pos.y=g+1.15;this.vel.y=0;if(this.vel.z<1)this.vel.z=RUN_SPEED;}else this.vel.y-=GRAVITY*dt;this.pos.x=0;this.pos.addScaledVector(this.vel,dt);}
  fallen(){return this.pos.y<-15;}
}
