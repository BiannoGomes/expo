// Prototypes A, B and C against the web builds, with the test AI.
const { chromium } = require('playwright');
const fs = require('fs');
const S = process.argv[2];
const token = fs.readFileSync(S + '/demo-token.txt', 'utf8').trim();
const r = { A: {}, B: {}, C: {} };
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.floor(s.length / 2)].toFixed(1) : null; };
const p95 = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.floor(s.length * 0.95)].toFixed(1) : null; };

async function app(ctx) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 50)));
  await page.goto('http://127.0.0.1:8790/');
  await page.evaluate(t => localStorage.setItem('dawnward.token', t), token);
  await page.reload();
  await page.getByText(/^Universe$/).first().click();
  return { page, errors };
}

(async () => {
  const browser = await chromium.launch();

  // ---- A: enter Mind, keep one thought, see it born as a star ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const { page, errors } = await app(ctx);
    const t0 = Date.now();
    await page.getByRole('button', { name: /^Mind\..*Travel to this world/ }).click({ force: true });
    const box = page.getByRole('textbox', { name: 'One thought for Mind' });
    await box.waitFor({ timeout: 15000 });
    r.A.enterMind_ms = Date.now() - t0;
    const thought = 'An idea for the studio: smaller batches, more often.';
    await box.fill(thought);
    const t1 = Date.now();
    await page.getByRole('button', { name: 'Keep this thought in Mind' }).click();
    await page.getByText("Kept. It's a star now.").waitFor({ timeout: 20000 });
    r.A.keep_to_star_ms = Date.now() - t1;
    r.A.starButton = await page.getByRole('button', { name: new RegExp('smaller batches') }).count();
    r.A.inspectShowsNew = await page.getByText(/^A new star/).count();
    r.A.boxCleared = (await box.inputValue()) === '';
    await page.waitForTimeout(1000);
    await page.screenshot({ path: S + '/shots/20-mind-star-born.png', fullPage: true });
    await page.getByRole('button', { name: 'Back to your sky' }).click();
    await page.getByRole('button', { name: /^Mind\..*Travel to this world/ }).waitFor({ timeout: 15000 });
    r.A.routeBack = true;
    r.A.pageErrors = errors;
    await ctx.close();
  }

  // ---- A, reduced motion: same path, no animation required ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const { page, errors } = await app(ctx);
    await page.getByRole('button', { name: /^Mind\..*Travel to this world/ }).click({ force: true });
    const box = page.getByRole('textbox', { name: 'One thought for Mind' });
    await box.waitFor({ timeout: 15000 });
    await box.fill('A quieter thought, with motion reduced.');
    await page.getByRole('button', { name: 'Keep this thought in Mind' }).click();
    await page.getByText("Kept. It's a star now.").waitFor({ timeout: 20000 });
    r.A.reducedMotion_ok = true;
    r.A.reducedMotion_errors = errors;
    await ctx.close();
  }

  // ---- B: Soul galaxy, explained links, list mode, correction controls ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const { page, errors } = await app(ctx);
    await page.getByRole('button', { name: /^Soul\..*Travel to this world/ }).click({ force: true });
    await page.getByText('Your evenings in Soul').waitFor({ timeout: 15000 });
    await page.waitForTimeout(800);
    r.B.svgLines = await page.locator('svg line').count();
    const stars = page.getByRole('button', { name: /^Your evening of / });
    r.B.starButtons = await stars.count();
    await stars.first().click();
    await page.getByText('This evening supports:').waitFor();
    r.B.starShowsTheme = true;
    await page.getByRole('button', { name: /^See why: / }).first().click();
    await page.getByText('The evenings behind this:').waitFor();
    r.B.themeShowsEvidence = await page.getByText(/^[A-Z][a-z]+day, .*: “/).count();
    r.B.disputeOffered = await page.getByRole('button', { name: "That's not right" }).count() > 0;
    r.B.formingLabel = await page.getByText('Still forming').count();
    await page.screenshot({ path: S + '/shots/21-soul-theme-explained.png', fullPage: true });
    await page.getByRole('button', { name: 'Show your evenings as a list' }).click();
    r.B.listRows = await page.getByRole('button', { name: /^Your evening of |^(Still forming|A guess|Probably true|Well established): / }).count();
    await page.screenshot({ path: S + '/shots/22-soul-list-mode.png', fullPage: true });
    // leave out from the galaxy, then undo
    await page.getByRole('button', { name: /^Your evening of / }).first().click();
    const before = await page.getByRole('button', { name: /^Your evening of / }).count();
    await page.getByRole('button', { name: 'Leave this evening out' }).click();
    await page.getByText(/^Left out\. This evening no longer shapes/).waitFor();
    await page.waitForTimeout(800);
    r.B.leaveOut_removedOne = (await page.getByRole('button', { name: /^Your evening of / }).count()) === before - 1;
    await page.getByRole('button', { name: 'Undo' }).click();
    await page.waitForTimeout(1200);
    r.B.undo_restored = (await page.getByRole('button', { name: /^Your evening of / }).count()) === before;
    r.B.pageErrors = errors;
    await ctx.close();
  }

  // ---- C: the same galaxy in 3D / WebXR ----
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).slice(0, 80)));
    await page.goto('http://127.0.0.1:8770/galaxy.html');
    await page.waitForFunction(() => window.__dwGalaxyReady === true, null, { timeout: 20000 });
    r.C.sampleLabelled = await page.getByText("Sample galaxy. These are invented evenings, not anyone's.").count();
    r.C.sampleStars = await page.locator('#stars li').count();
    r.C.vrButton = await page.locator('#vr button, #vr a').first().textContent().catch(() => null);
    await page.waitForTimeout(3000);
    const sampleFrames = await page.evaluate(() => window.__dwFrames.slice(-120));
    r.C.sample_frame_median_ms = med(sampleFrames);
    r.C.sample_frame_p95_ms = p95(sampleFrames);

    const api = await (await fetch('http://127.0.0.1:3000/galaxy?world=all', { headers: { authorization: `Bearer ${token}` } })).json();
    await page.goto(`http://127.0.0.1:8770/galaxy.html?api=http://127.0.0.1:3000#token=${token}`);
    await page.waitForFunction(() => window.__dwGalaxyReady === true, null, { timeout: 20000 });
    r.C.tokenClearedFromUrl = !page.url().includes('token=');
    r.C.yourGalaxyLabel = (await page.locator('#source').textContent()).startsWith('Your galaxy:');
    r.C.parity_stars = { list: await page.locator('#stars li').count(), api: api.stars.length };
    r.C.parity_themes = { list: await page.locator('#themes li').count(), api: api.themes.length };
    await page.locator('#stars li button').first().click();
    r.C.panelShowsEvening = await page.locator('#panel.on q').count();
    await page.locator('#themes li button').first().click();
    r.C.panelShowsTheme = await page.locator('#panel.on .statement').count();
    // click a star in the 3D view itself
    await page.locator('#stage canvas').focus();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(3000);
    const frames = await page.evaluate(() => window.__dwFrames.slice(-120));
    r.C.real_frame_median_ms = med(frames);
    r.C.real_frame_p95_ms = p95(frames);
    await page.screenshot({ path: S + '/shots/23-galaxy-xr-desktop.png' });
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const mp = await mobile.newPage();
    await mp.goto('http://127.0.0.1:8770/galaxy.html');
    await mp.waitForFunction(() => window.__dwGalaxyReady === true, null, { timeout: 20000 });
    r.C.mobile_noHorizontalScroll = await mp.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    await mp.screenshot({ path: S + '/shots/24-galaxy-xr-phone.png', fullPage: true });
    r.C.pageErrors = errors;
    await ctx.close();
  }

  console.log(JSON.stringify(r, null, 2));
  await browser.close();
})().catch(e => { console.error(String(e).slice(0, 700)); console.log(JSON.stringify(r, null, 2)); process.exit(1); });
