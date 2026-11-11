(() => {
  const siteRoot = new URL(".", document.currentScript.src);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const homePanels = [
    ".ribbon-hero", ".about-panel", ".project-group > h2", ".project-card"
  ].join(", ");
  const casePanels = [
    ".case-study > :not(.case-gallery, .case-back)", ".case-study > .case-gallery > *"
  ].join(", ");

  function pageType(url) {
    if (!url || url.origin !== location.origin) return null;
    if (!url.pathname.startsWith(siteRoot.pathname)) return null;
    const path = url.pathname.slice(siteRoot.pathname.length);
    if (path === "" || path === "index.html") return "home";
    if (/^work\/[^/]+\.html$/.test(path)) return "case";
    return null;
  }

  function prepare(transition, fromURL, toURL, phase) {
    if (!transition) return;
    const from = pageType(fromURL);
    const to = pageType(toURL);
    if (!from || !to || from === to || reducedMotion.matches) {
      transition.skipTransition();
      return;
    }

    transition.types.add(to === "case" ? "project-open" : "project-return");
    const current = phase === "outgoing" ? from : to;
    const panels = [...document.querySelectorAll(current === "home" ? homePanels : casePanels)]
      .filter((panel) => {
        const { top, bottom, width, height } = panel.getBoundingClientRect();
        return width && height && bottom > 0 && top < document.documentElement.clientHeight &&
          getComputedStyle(panel).visibility === "visible";
      });

    panels.forEach((panel, index) => {
      panel.style.viewTransitionName = `${phase}-${index}`;
      panel.style.viewTransitionClass = `${phase} step-${Math.min(index, 3)}`;
    });

    const reset = () => {
      panels.forEach((panel) => {
        panel.style.removeProperty("view-transition-name");
        panel.style.removeProperty("view-transition-class");
      });
    };
    transition.finished.then(reset, reset);
    if (phase === "outgoing") {
      addEventListener("pageshow", reset, { once: true });
    }
  }

  addEventListener("pageswap", (event) => {
    const activation = event.activation;
    prepare(event.viewTransition, new URL(location.href),
      activation?.entry && new URL(activation.entry.url), "outgoing");
  });

  addEventListener("pagereveal", (event) => {
    const from = window.navigation?.activation?.from?.url;
    prepare(event.viewTransition, from && new URL(from), new URL(location.href), "incoming");
  });
})();
