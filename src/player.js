import * as THREE from 'three';
import { groundHeight, RUN_SPEED, START_Z } from './level.js';
const GRAVITY=21.5;
const PLAYER_FEET=1.15;
export class PlayerController {
  constructor(object){this.object=object;this.pos=object.position;this.vel=new THREE.Vector3();this.reset();}
  reset(z=START_Z,y=PLAYER_FEET){this.pos.set(0,y,z);this.vel.set(0,0,RUN_SPEED);}
  step(dt,grappleActive){
    if(grappleActive)return;
    const oldY=this.pos.y;
    this.vel.y-=GRAVITY*dt;this.pos.x=0;this.pos.addScaledVector(this.vel,dt);
    const g=groundHeight(this.pos.z);
    const floor=g===null?null:g+PLAYER_FEET;
    // Platforms are solid from above: never allow the runner to tunnel into them.
    if(floor!==null&&oldY>=floor-.08&&this.pos.y<=floor&&this.vel.y<=0){this.pos.y=floor;this.vel.y=0;if(this.vel.z<1)this.vel.z=RUN_SPEED;}
  }
  resolveGround(){
    const g=groundHeight(this.pos.z);if(g===null)return false;
    const floor=g+PLAYER_FEET;
    if(this.pos.y<floor&&this.vel.y<=0){this.pos.y=floor;this.vel.y=0;return true;}return false;
  }
  fallen(){return this.pos.y<-15;}
}
