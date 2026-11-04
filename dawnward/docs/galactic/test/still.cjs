// Preload for the functional suites: Flow is Dawnward's default motion (4 Nov 2026), so arrivals spring in and
// a tapped card morphs into its practice. Functional suites check what's on screen, not how it moved, and
// mid-animation states would make them timing-dependent on slow test machines. With DW_STILL=1, every new
// browser context starts with motion set to "Still" (the user-facing minimum) unless the page already chose one.
// e2e-motion.cjs runs WITHOUT this preload: it is the suite that tests motion.
// Usage: DW_STILL=1 node -r ./still.cjs e2e-home.cjs
if (process.env.DW_STILL === "1") {
  const pw = require("playwright");
  const launch = pw.chromium.launch.bind(pw.chromium);
  pw.chromium.launch = async (...a) => {
    const b = await launch(...a);
    const nc = b.newContext.bind(b);
    b.newContext = async (...o) => {
      const c = await nc(...o);
      await c.addInitScript(() => { try { if (location.protocol !== "about:" && !localStorage.getItem("dw-motion")) localStorage.setItem("dw-motion", "now"); } catch {} });
      return c;
    };
    const np = b.newPage.bind(b);
    b.newPage = async (...o) => { const p = await np(...o); await p.context().addInitScript(() => { try { if (location.protocol !== "about:" && !localStorage.getItem("dw-motion")) localStorage.setItem("dw-motion", "now"); } catch {} }); return p; };
    return b;
  };
}
