import * as THREE from 'three';

const GRAVITY=21.5;
export class GrappleController {
  constructor(){this.active=false;this.anchor=null;this.length=0;this.theta=0;this.omega=0;}
  attach(pos,vel,anchor){if(this.active||!anchor)return false;this.anchor=anchor;const rel=pos.clone().sub(anchor.position);this.length=THREE.MathUtils.clamp(Math.hypot(rel.y,rel.z),9,27);this.theta=Math.atan2(rel.z,-rel.y);const ty=Math.sin(this.theta),tz=Math.cos(this.theta);this.omega=(vel.y*ty+vel.z*tz)/this.length;this.active=true;return true;}
  release(vel){if(!this.active)return false;const speed=this.omega*this.length;vel.set(0,Math.sin(this.theta)*speed,Math.cos(this.theta)*speed);this.active=false;this.anchor=null;return true;}
  step(pos,vel,dt){if(!this.active||!this.anchor)return;const alpha=-(GRAVITY/this.length)*Math.sin(this.theta);this.omega+=alpha*dt;this.omega*=Math.pow(.999,dt*60);this.theta+=this.omega*dt;this.theta=THREE.MathUtils.clamp(this.theta,-1.18,1.18);pos.x=0;pos.y=this.anchor.position.y-Math.cos(this.theta)*this.length;pos.z=this.anchor.position.z+Math.sin(this.theta)*this.length;const speed=this.omega*this.length;vel.set(0,Math.sin(this.theta)*speed,Math.cos(this.theta)*speed);}
  reset(){this.active=false;this.anchor=null;this.length=0;this.theta=0;this.omega=0;}
}
