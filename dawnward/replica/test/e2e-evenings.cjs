const { chromium } = require('playwright');
const fs = require('fs');
const S = process.argv[2];
const token = fs.readFileSync(S + '/demo-token.txt', 'utf8').trim();
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = [];
  let stepName='load'; page.on('console', m => { if (m.type() === 'error') errors.push(stepName+': '+m.text().slice(0,40)); });
  page.on('pageerror', e => errors.push('PAGEERROR@'+stepName+': '+String(e).slice(0,40)));
  await page.goto('http://127.0.0.1:8790/');
  await page.evaluate(t => localStorage.setItem('dawnward.token', t), token);
  await page.reload();
  const result = {};
  stepName='after-reload';
  await page.getByText('From your evening', { exact: false }).first().waitFor({ timeout: 20000 });
  result.quotesOnToday = await page.getByText('From your evening', { exact: false }).count();
  result.inventedQuoteShown = await page.getByText('words this person never said').count();
  await page.waitForTimeout(2500); await page.screenshot({ path: S + '/shots/01-today.png', fullPage: true });

  stepName='today-screenshot-done'; await page.getByText(/^Universe$/).first().click();
  await page.getByRole('button', { name: 'What I understand about you' }).click();
  await page.getByText('Your evenings, in your own words').click();
  await page.getByText('In your own words', { exact: true }).waitFor();
  await page.getByText('Leave this out').first().waitFor();
  result.cards = await page.getByText(/^Leave this out$|^Bring it back$/).count();
  await page.screenshot({ path: S + '/shots/02-evenings.png', fullPage: true });

  await page.getByLabel('Search your evenings').fill('brother');
  await page.waitForTimeout(900);
  result.searchCards = await page.getByText(/^Leave this out$|^Bring it back$/).count();
  await page.screenshot({ path: S + '/shots/03-search.png', fullPage: true });

  await page.getByRole('button', { name: /^Leave out your evening/ }).first().click();
  await page.getByText(/^Left out\. I won't use/).waitFor();
  result.leftOutStatusShown = await page.getByText(/Nothing from this evening shapes/).count();
  await page.screenshot({ path: S + '/shots/04-left-out.png', fullPage: true });
  await page.getByRole('button', { name: 'Undo' }).click();
  await page.getByText('Leave this out').first().waitFor();
  result.afterUndoBringBack = await page.getByText(/^Bring it back$/).count();

  await page.getByLabel('Search your evenings').fill('zebra');
  await page.waitForTimeout(900);
  result.emptySearchShown = await page.getByText(/None of your evenings mention/).count();
  await page.screenshot({ path: S + '/shots/05-empty-search.png', fullPage: true });

  // keyboard reach: the search field and actions are focusable
  await page.getByLabel('Search your evenings').fill('');
  await page.waitForTimeout(700);
  await page.getByLabel('Search your evenings').focus();
  await page.keyboard.press('Tab');
  result.tabAfterSearch = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.slice(0, 40));
  result.consoleErrors = errors;
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
