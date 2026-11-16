(() => {
  window.createSunbreak = (stage, journey, reduced, repaint) => {
    const home = document.querySelector("#home");
    const wash = stage.querySelector(".sunwash");
    const nightControls = [...stage.children].filter(el => el !== wash && el.tagName !== "CANVAS");
    const root = document.documentElement;
    const span = () => reduced.matches ? 0 : innerHeight * 1.05;
    let last = -1;
    let lastLiveSky;
    let focusOnArrival = false;
    const clamp = n => Math.max(0, Math.min(1, n));
    const smooth = (a,b,t) => {
      const x = clamp((t-a)/(b-a));
      return x*x*(3-2*x);
    };
    const phase = distance => reduced.matches ? 0 : clamp(distance/Math.max(1,span()));

    function directToDirectory() {
      focusOnArrival = true;
      const end = journey.getBoundingClientRect().top + scrollY + journey.offsetHeight - stage.offsetHeight;
      scrollTo({ top:end, behavior:"instant" });
      repaint();
    }

    function syncMode() {
      root.classList.toggle("sunbreak-motion", !reduced.matches);
      (reduced.matches ? journey.parentElement : stage).append(home);
      home.inert = !reduced.matches;
      stage.classList.remove("sun-ready");
      nightControls.forEach(el => { el.inert = false; });
      last = -1;
      repaint();
    }
    reduced.addEventListener("change", syncMode);
    syncMode();
    for (const jump of document.querySelectorAll('a[href="#home"]')) {
      jump.addEventListener("click", event => {
        if (reduced.matches || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        directToDirectory();
      });
    }
    if (location.hash === "#home" && !reduced.matches && !history.state?.rainY) {
      requestAnimationFrame(directToDirectory);
    }

    return {
      span,
      phase,
      paint(distance, hasLiveSky = false) {
        if (reduced.matches) return false;
        const p = phase(distance);
        const ready = p > .985;
        if (p !== last || hasLiveSky !== lastLiveSky) {
          const rain = 1-smooth(.08,.52,p);
          const copy = smooth(.53,.93,p);
          const mist = hasLiveSky ? .47*smooth(.36,.92,p) : smooth(.06,.94,p);
          stage.style.setProperty("--rain-ui", rain.toFixed(3));
          stage.style.setProperty("--sun-mist", mist.toFixed(3));
          stage.style.setProperty("--sun-copy", copy.toFixed(3));
          stage.style.setProperty("--sun-drift", ((1 - copy) * 9).toFixed(1) + "px");
          home.classList.toggle("sun-seen", copy > 0);
          home.classList.toggle("sun-ready", ready);
          stage.classList.toggle("sun-ready", rain<.01);
          home.inert = !ready;
          if (rain<.01 && nightControls.some(el => el.contains(document.activeElement))) focusOnArrival=true;
          nightControls.forEach(el => { el.inert = rain<.01; });
          if (ready && focusOnArrival) {
            home.focus({ preventScroll:true });
            focusOnArrival = false;
          }
          last = p;
          lastLiveSky = hasLiveSky;
        }
        return ready;
      },
    };
  };
})();
