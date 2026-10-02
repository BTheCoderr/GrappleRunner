import * as THREE from 'three';

const GRAVITY=21.5;
const TARGET_ROPE=10.5;
const REEL_SPEED=18;
const MAX_DOWN_SPEED=15;

export class GrappleController {
  constructor(){this.active=false;this.anchor=null;this.length=0;this.targetLength=TARGET_ROPE;this.tension=0;this.phase='idle';}

  attach(pos,vel,anchor){
    if(this.active||!anchor)return false;
    this.anchor=anchor;
    const dy=pos.y-anchor.position.y,dz=pos.z-anchor.position.z;
    // Start at the real distance so attachment never teleports the player,
    // then reel rapidly toward an arcade-length rope.
    this.length=Math.hypot(dy,dz);
    this.targetLength=TARGET_ROPE;
    vel.x=0;
    this.active=true;this.phase='catch';this.tension=0;
    return true;
  }

  release(){if(!this.active)return false;this.active=false;this.anchor=null;this.phase='idle';this.tension=0;return true;}

  step(pos,vel,dt){
    if(!this.active||!this.anchor)return;
    // The short controlled rope is the key: don't let a distant tap create a
    // 20+ unit pendulum whose bottom is literally below the level/camera.
    this.length=Math.max(this.targetLength,this.length-REEL_SPEED*dt);
    vel.y=Math.max(vel.y-GRAVITY*dt,-MAX_DOWN_SPEED);vel.x=0;
    pos.addScaledVector(vel,dt);

    const ay=this.anchor.position.y,az=this.anchor.position.z;
    let ry=pos.y-ay,rz=pos.z-az,dist=Math.hypot(ry,rz)||0.0001;
    if(dist>this.length){
      const ny=ry/dist,nz=rz/dist;
      pos.y=ay+ny*this.length;pos.z=az+nz*this.length;
      const radial=vel.y*ny+vel.z*nz;
      // Remove outward motion; reeling supplies only enough inward pull to
      // shorten the rope, never a forward launch boost.
      if(radial>0){vel.y-=radial*ny;vel.z-=radial*nz;this.tension=radial;}else this.tension=0;
    }

    const bottomY=this.anchor.position.y-this.length;
    const behind=pos.z<this.anchor.position.z-1.2;
    const nearBottom=pos.y<bottomY+2.0;
    const forward=pos.z>this.anchor.position.z+1.2;
    this.phase=forward?'climb':nearBottom?'bottom':behind?'catch':'swing';
  }

  reset(){this.active=false;this.anchor=null;this.length=0;this.targetLength=TARGET_ROPE;this.tension=0;this.phase='idle';}
}
