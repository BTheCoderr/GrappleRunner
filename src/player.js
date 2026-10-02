import * as THREE from 'three';
import { groundHeight, RUN_SPEED, LEVELS } from './level.js';
const GRAVITY=21.5,PLAYER_FEET=1.15,HEAD_CLEARANCE=.35;
export class PlayerController{
  constructor(object){this.object=object;this.pos=object.position;this.vel=new THREE.Vector3();this.levelIndex=0;this.collided=false;this.reset();}
  setLevel(index){this.levelIndex=index;const l=LEVELS[index];this.reset(l.start,(groundHeight(l.start,index)??0)+PLAYER_FEET);}
  reset(z=LEVELS[this.levelIndex].start,y=(groundHeight(z,this.levelIndex)??0)+PLAYER_FEET){this.pos.set(0,y,z);this.vel.set(0,0,RUN_SPEED);this.collided=false;}
  hitsRaisedFace(oldZ,newZ){const oldGround=groundHeight(oldZ,this.levelIndex),newGround=groundHeight(newZ,this.levelIndex);if(newGround===null)return false;const oldTop=oldGround??-Infinity;if(newGround<=oldTop+.05)return false;return this.pos.y<newGround+PLAYER_FEET-HEAD_CLEARANCE;}
  step(dt,grappleActive){if(grappleActive)return;this.collided=false;const oldY=this.pos.y,oldZ=this.pos.z;this.vel.y-=GRAVITY*dt;this.pos.x=0;this.pos.addScaledVector(this.vel,dt);if(this.hitsRaisedFace(oldZ,this.pos.z)){this.pos.z=oldZ;this.vel.z=0;this.collided=true;return;}const g=groundHeight(this.pos.z,this.levelIndex),floor=g===null?null:g+PLAYER_FEET;if(floor!==null&&oldY>=floor-.08&&this.pos.y<=floor&&this.vel.y<=0){this.pos.y=floor;this.vel.y=0;if(this.vel.z<1)this.vel.z=RUN_SPEED;}}
  resolveGround(oldZ=this.pos.z){this.collided=false;if(this.hitsRaisedFace(oldZ,this.pos.z)){this.pos.z=oldZ;this.vel.z=0;this.collided=true;return false;}const g=groundHeight(this.pos.z,this.levelIndex);if(g===null)return false;const floor=g+PLAYER_FEET;if(this.pos.y<floor&&this.vel.y<=0){this.pos.y=floor;this.vel.y=0;return true;}return false;}
  fallen(){return this.pos.y<-15;}
}
