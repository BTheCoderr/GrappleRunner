import * as THREE from 'three';

// Arcade rope constraint inspired by momentum-first grapple games:
// keep the player's incoming velocity, apply gravity, then remove only the
// velocity component that would stretch the rope. Release simply removes the
// constraint, so the exact current velocity becomes the launch.
const GRAVITY = 21.5;
const MAX_ROPE = 22;
const MIN_ROPE = 10;
const MAX_DOWN_SPEED = 18;

export class GrappleController {
  constructor(){this.active=false;this.anchor=null;this.length=0;this.tension=0;this.phase='idle';}

  attach(pos,vel,anchor){
    if(this.active||!anchor)return false;
    this.anchor=anchor;
    const dx=0, dy=pos.y-anchor.position.y, dz=pos.z-anchor.position.z;
    this.length=THREE.MathUtils.clamp(Math.hypot(dy,dz),MIN_ROPE,MAX_ROPE);
    // Do NOT replace velocity here. Entry speed is the swing's energy.
    vel.x=0;
    this.active=true;
    this.phase='catch';
    this.tension=0;
    return true;
  }

  release(){
    if(!this.active)return false;
    this.active=false;
    this.anchor=null;
    this.phase='idle';
    this.tension=0;
    return true;
  }

  step(pos,vel,dt){
    if(!this.active||!this.anchor)return;

    // Gravity acts continuously; the rope only redirects motion.
    vel.y=Math.max(vel.y-GRAVITY*dt,-MAX_DOWN_SPEED);
    vel.x=0;
    pos.addScaledVector(vel,dt);

    const ay=this.anchor.position.y, az=this.anchor.position.z;
    let ry=pos.y-ay, rz=pos.z-az;
    let dist=Math.hypot(ry,rz)||0.0001;

    // Rope can be slack, but can never stretch past its captured length.
    if(dist>=this.length){
      const ny=ry/dist, nz=rz/dist;
      pos.y=ay+ny*this.length;
      pos.z=az+nz*this.length;

      // Remove outward radial velocity only. Tangential momentum survives.
      const radial=vel.y*ny+vel.z*nz;
      if(radial>0){
        vel.y-=radial*ny;
        vel.z-=radial*nz;
        this.tension=radial;
      }else this.tension=0;

      // Re-project after correction to prevent numerical rope creep.
      ry=pos.y-ay;rz=pos.z-az;dist=Math.hypot(ry,rz)||1;
      pos.y=ay+(ry/dist)*this.length;
      pos.z=az+(rz/dist)*this.length;
    }

    const behind=pos.z<this.anchor.position.z-1.5;
    const below=pos.y<this.anchor.position.y-this.length*.82;
    const forward=pos.z>this.anchor.position.z+1.5;
    this.phase=forward?'climb':below?'bottom':behind?'catch':'swing';
  }

  reset(){this.active=false;this.anchor=null;this.length=0;this.tension=0;this.phase='idle';}
}
