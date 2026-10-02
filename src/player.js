import * as THREE from 'three';
import { groundHeight, RUN_SPEED, LEVELS } from './level.js';
const GRAVITY=21.5,PLAYER_FEET=1.15,HEAD_CLEARANCE=.35,FACE_EPS=.04;
export class PlayerController{
  constructor(object){this.object=object;this.pos=object.position;this.vel=new THREE.Vector3();this.levelIndex=0;this.collided=false;this.reset();}
  setLevel(index){this.levelIndex=index;const l=LEVELS[index];this.reset(l.start,(groundHeight(l.start,index)??0)+PLAYER_FEET);}
  reset(z=LEVELS[this.levelIndex].start,y=(groundHeight(z,this.levelIndex)??0)+PLAYER_FEET){this.pos.set(0,y,z);this.vel.set(0,0,RUN_SPEED);this.collided=false;}
  crossedRaisedFace(oldZ,newZ){if(newZ<=oldZ)return null;const platforms=LEVELS[this.levelIndex].platforms;for(const[a,b,h]of platforms){if(a<=oldZ+FACE_EPS||a>newZ+FACE_EPS)continue;const before=groundHeight(a-FACE_EPS,this.levelIndex),oldTop=before??-Infinity;if(h<=oldTop+.05)continue;const requiredY=h+PLAYER_FEET-HEAD_CLEARANCE;if(this.pos.y<requiredY)return{z:a-FACE_EPS,height:h};}return null;}
  rejectFace(face){this.pos.z=face.z;this.vel.z=0;this.vel.y=Math.min(this.vel.y,0);this.collided=true;}
  step(dt,grappleActive){if(grappleActive)return;this.collided=false;const oldY=this.pos.y,oldZ=this.pos.z;this.vel.y-=GRAVITY*dt;this.pos.x=0;this.pos.addScaledVector(this.vel,dt);const face=this.crossedRaisedFace(oldZ,this.pos.z);if(face){this.rejectFace(face);return;}const g=groundHeight(this.pos.z,this.levelIndex),floor=g===null?null:g+PLAYER_FEET;if(floor!==null&&oldY>=floor-.08&&this.pos.y<=floor&&this.vel.y<=0){this.pos.y=floor;this.vel.y=0;if(this.vel.z<1)this.vel.z=RUN_SPEED;}}
  resolveGround(oldZ=this.pos.z){this.collided=false;const face=this.crossedRaisedFace(oldZ,this.pos.z);if(face){this.rejectFace(face);return false;}const g=groundHeight(this.pos.z,this.levelIndex);if(g===null)return false;const floor=g+PLAYER_FEET;if(this.pos.y<floor&&this.vel.y<=0){this.pos.y=floor;this.vel.y=0;return true;}return false;}
  fallen(){return this.pos.y<-15;}
}
