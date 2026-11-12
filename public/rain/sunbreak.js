(() => {
  window.createSunbreak = (stage, journey, reduced, repaint) => {
    const home = document.querySelector("#home");
    const wash = stage.querySelector(".sunwash");
    const nightControls = [...stage.children].filter(el => el !== wash && el.tagName !== "CANVAS");
    const root = document.documentElement;
    const span = () => reduced.matches ? 0 : innerHeight * 1.05;
    let last = -1;
    let focusOnArrival = false;
    const clamp = n => Math.max(0, Math.min(1, n));

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
      paint(distance) {
        if (reduced.matches) return false;
        const p = clamp(distance / Math.max(1, span()));
        const ready = p > .985;
        if (p !== last) {
          const radius = Math.hypot(innerWidth * .99, stage.clientHeight * .87);
          const ease = p * p * (3 - 2 * p);
          stage.style.setProperty("--sun-radius", (radius * 1.14 * ease) + "px");
          const copy = clamp((p - .64) / .31);
          stage.style.setProperty("--sun-copy", copy.toFixed(3));
          stage.style.setProperty("--sun-drift", ((1 - copy) * 14).toFixed(1) + "px");
          home.classList.toggle("sun-seen", copy > 0);
          home.classList.toggle("sun-ready", ready);
          home.inert = !ready;
          nightControls.forEach(el => { el.inert = ready; });
          if (ready && (focusOnArrival || nightControls.some(el => el.contains(document.activeElement)))) {
            home.focus({ preventScroll:true });
            focusOnArrival = false;
          }
          last = p;
        }
        return ready;
      },
    };
  };
})();
