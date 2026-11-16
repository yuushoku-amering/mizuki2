(() => {
  function createWaterContact() {
    let impulse = null;
    let x = 0, y = 0, dent = 0, split = 0;

    function disturb(px,py,strength,time) {
      const previous = impulse;
      const nearby = previous && Math.hypot(px-previous.x,py-previous.y)<42;
      const carry = nearby ? previous.power*Math.exp((previous.time-time)*9) : 0;
      impulse = { x:px, y:py, time, power:Math.max(carry,strength) };
    }

    function release() {
      impulse = null;
    }

    function sample(box,time,dt,enabled,flow) {
      if (!enabled) {
        impulse = null;
        dent = split = 0;
        return flow ? { flow } : null;
      }
      const radius = Math.max(31,Math.min(105,Math.min(box.width,box.height)*.235));
      const boxDistance = Math.max(box.left-(impulse?.x??x),(impulse?.x??x)-box.left-box.width,
        box.top-(impulse?.y??y),(impulse?.y??y)-box.top-box.height);
      const age = impulse ? Math.max(0,time-impulse.time) : 4;
      const pulse = impulse && boxDistance<radius*.36 ? impulse.power*Math.exp(-Math.max(0,age-.075)*7) : 0;
      if (pulse>.015) {
        const follow = dent<.035 ? 1 : 1-Math.exp(-dt*27);
        x += (impulse.x-x)*follow;
        y += (impulse.y-y)*follow;
      }
      dent += (pulse-dent)*(1-Math.exp(-(pulse>dent?31:6.5)*dt));
      const targetSplit = Math.min(1.13,pulse*1.12);
      split += (targetSplit-split)*(1-Math.exp(-(targetSplit>split?23:5)*dt));
      if (dent<.012 && split<.012) return flow ? { flow } : null;
      return {
        flow,
        point:[2*(x-box.left)/box.width-1,1-2*(y-box.top)/box.height,
          2*radius/box.width,2*radius/box.height],
        force:[dent,split,time%4],
      };
    }

    return { disturb, release, sample };
  }

  window.createWaterContact=createWaterContact;
})();
