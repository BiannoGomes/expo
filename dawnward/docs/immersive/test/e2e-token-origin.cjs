const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const hosts = [];
  p.on('request', q => hosts.push(new URL(q.url()).host));
  const t = fs.readFileSync('demo-token.txt', 'utf8').trim();
  await p.goto(`http://127.0.0.1:8770/galaxy.html?api=https://evil.example#token=${t}`);
  await p.waitForFunction(() => window.__dwGalaxyReady === true, null, { timeout: 20000 });
  console.log(JSON.stringify({ requestedEvil: hosts.includes('evil.example'), fellBackToSample: (await p.locator('#source').textContent()).startsWith("I couldn't load your galaxy"), tokenGone: !p.url().includes('token=') }));
  await b.close();
})();
