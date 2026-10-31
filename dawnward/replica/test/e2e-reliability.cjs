// Failure paths: no lost words. Run against the web build with the test AI.
const { chromium } = require('playwright');
const fs = require('fs');
const S = process.argv[2];
const r = {};
async function open(page, tokenFile) {
  await page.goto('http://127.0.0.1:8790/');
  await page.evaluate(t => localStorage.setItem('dawnward.token', t), fs.readFileSync(S + '/' + tokenFile, 'utf8').trim());
  await page.reload();
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, permissions: ['microphone'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 60)));
  await open(page, 'demo-token.txt');
  await page.getByText(/^Debrief$/).first().click();
  const box = page.getByRole('textbox', { name: "Tonight's reflection" });
  await box.waitFor();
  await page.getByText(/From your evening/).first().waitFor({ timeout: 15000 }).catch(() => {});
  r.debrief_questionQuoted = await page.getByText(/From your evening/).count();

  // 1. Send fails: honest error, no goodnight, words stay.
  await box.fill('Tonight I fixed the bike and called my brother.');
  await page.route('**/debrief', route => route.abort());
  await page.getByRole('button', { name: "Reflect: send tonight's reflection" }).click();
  await page.getByText(/tonight isn't saved yet/).waitFor();
  r.sendFail_errorShown = true;
  r.sendFail_goodnightShown = await page.getByText(/Sleep well/).count();
  r.sendFail_wordsKept = (await box.inputValue()).includes('fixed the bike');
  await page.screenshot({ path: S + '/shots/10-debrief-send-failed.png' });
  await page.unroute('**/debrief');
  await page.getByRole('button', { name: "Reflect: send tonight's reflection" }).click();
  await page.getByText(/Sleep well/).waitFor();
  r.retry_goodnightShown = true;
  r.retry_errorGone = (await page.getByText(/tonight isn't saved yet/).count()) === 0;

  // 2. Transcription fails: the recording is kept and can be written down later.
  let voice = 'unsupported';
  try {
    await page.getByRole('button', { name: 'Speak it instead' }).click();
    await page.getByRole('button', { name: "Listening. Tap when you're done" }).waitFor({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.route('**/transcribe', route => route.fulfill({ status: 503, body: '{}' }));
    await page.getByRole('button', { name: "Listening. Tap when you're done" }).click();
    await page.getByText(/Your recording is kept/).waitFor({ timeout: 15000 });
    r.voiceFail_keptNote = true;
    r.voiceFail_speakHidden = await page.getByRole('button', { name: 'Speak it instead' }).count();
    await page.screenshot({ path: S + '/shots/11-recording-kept.png' });
    await page.unroute('**/transcribe');
    await page.route('**/transcribe', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: 'I walked by the river.' }) }));
    await page.getByRole('button', { name: 'Write my recording down' }).click();
    await page.waitForFunction(() => [...document.querySelectorAll('textarea')].some(t => t.value.includes('walked by the river')), null, { timeout: 15000 });
    r.voiceRetry_wordsArrived = true;
    r.voiceRetry_buttonGone = (await page.getByRole('button', { name: 'Write my recording down' }).count()) === 0;

    // 3. Leaving the tab while recording stops the mic and keeps the words.
    await page.route('**/transcribe', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: 'Then I made tea.' }) }));
    await page.getByRole('button', { name: 'Speak it instead' }).click();
    await page.getByRole('button', { name: "Listening. Tap when you're done" }).waitFor({ timeout: 8000 });
    await page.waitForTimeout(1200);
    await page.getByText(/^Today$/).first().click();
    await page.waitForTimeout(2500);
    await page.getByText(/^Debrief$/).first().click();
    await page.waitForFunction(() => [...document.querySelectorAll('textarea')].some(t => t.value.includes('made tea')), null, { timeout: 15000 });
    r.blur_wordsKept = true;
    r.blur_noteShown = await page.getByText(/I stopped listening when you left/).count();
    r.blur_stillRecording = await page.getByRole('button', { name: "Listening. Tap when you're done" }).count();
    voice = 'tested';
  } catch (e) {
    voice = 'failed: ' + String(e).split('\n')[0].slice(0, 160);
    await page.screenshot({ path: S + '/shots/dbg-voice.png' });
  }
  r.voice = voice;
  await page.unroute('**/transcribe').catch(() => {});

  // 4. A tick that fails to save is put back and said so.
  await page.getByText(/^Today$/).first().click();
  const card = page.getByRole('checkbox', { name: /^One thing to train/i }).first();
  await card.waitFor({ timeout: 20000 });
  await page.route('**/plan/*/slot', route => route.abort());
  await card.click();
  await page.getByText(/That didn't save/).waitFor();
  r.tickFail_noteShown = true;
  r.tickFail_reverted = (await card.getAttribute('aria-checked')) === 'false';
  await page.unroute('**/plan/*/slot');
  await card.click();
  await page.waitForTimeout(1200);
  r.tick_savedWhenOnline = (await card.getAttribute('aria-checked')) === 'true';
  r.tick_noteCleared = (await page.getByText(/That didn't save/).count()) === 0;
  // Two quick taps while offline: both fail, the step must end as it began.
  const startState = await card.getAttribute('aria-checked');
  await page.route('**/plan/*/slot', route => route.abort());
  await card.click(); await card.click();
  await page.waitForTimeout(1500);
  r.tick_doubleTapOffline_unchanged = (await card.getAttribute('aria-checked')) === startState;
  await page.unroute('**/plan/*/slot');
  await page.screenshot({ path: S + '/shots/12-tick-failed-then-saved.png', fullPage: true });

  // 5. Onboarding: a message that fails comes back to the box.
  const p2 = await ctx.newPage();
  p2.on('pageerror', e => errors.push('p2 ' + String(e).slice(0, 60)));
  await open(p2, 'new-token.txt');
  await p2.getByText('Begin your story').click();
  const answer = p2.getByRole('textbox', { name: 'Your answer' });
  await answer.waitFor({ timeout: 20000 });
  await answer.fill('I grew up by the sea and I miss it.');
  await p2.route('**/onboarding/message', route => route.abort());
  await p2.getByRole('button', { name: 'Send' }).click();
  await p2.getByText(/Your words are back in the box/).waitFor();
  r.onboardingFail_wordsBack = (await answer.inputValue()) === 'I grew up by the sea and I miss it.';
  const bubbles = () => p2.evaluate(t => [...document.querySelectorAll('div')].filter(d => d.children.length === 0 && d.textContent === t).length, 'I grew up by the sea and I miss it.');
  r.onboardingFail_fakeBubbleRemoved = (await bubbles()) === 0;
  await p2.screenshot({ path: S + '/shots/13-onboarding-words-back.png' });
  await p2.unroute('**/onboarding/message');
  await p2.getByRole('button', { name: 'Send' }).click();
  await p2.waitForFunction(t => [...document.querySelectorAll('div')].some(d => d.children.length === 0 && d.textContent === t), 'I grew up by the sea and I miss it.');
  r.onboardingRetry_sent = (await answer.inputValue()) === '' && (await bubbles()) === 1;
  r.onboarding_noLongDash = !(await p2.locator('body').innerText()).includes('\u2014');

  r.pageErrors = errors;
  console.log(JSON.stringify(r, null, 2));
  await browser.close();
})().catch(e => { console.error(String(e).slice(0, 600)); console.log(JSON.stringify(r, null, 2)); process.exit(1); });
