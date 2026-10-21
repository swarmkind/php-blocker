import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp, mkdir, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

const requests = [], results = [];
const server = createServer((req, res) => {
  requests.push(`${req.headers.host}${req.url}`);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-store');
  if (req.url === '/script.js') { res.setHeader('Content-Type', 'application/javascript'); return res.end('window.scriptLoaded=true;'); }
  res.end(`<!doctype html><title>Fixture</title><h1>Allowed fixture</h1><script src="/script.js"></script><img src="http://third.test:${server.address().port}/pixel"><form action="http://post.test:${server.address().port}/submit" method="post"><input name="secret" value="fixture-only"><button>Send form</button></form>`);
});
server.on('upgrade', (req, socket) => { requests.push(`${req.headers.host}${req.url}`); socket.destroy(); });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const profile = await mkdtemp(join(tmpdir(), 'php-blocker-test-'));
const extension = resolve('extension');
await mkdir('artifacts', {recursive: true});
let context;
async function launch() {
  context = await chromium.launchPersistentContext(profile, {
    executablePath: process.env.CHROME_PATH || chromium.executablePath(),
    headless: true,
    viewport: {width: 1100, height: 900},
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--host-resolver-rules=MAP *.test 127.0.0.1', '--no-proxy-server']
  });
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  const id = worker.url().split('/')[2];
  const settings = await context.newPage();
  await settings.goto(`chrome-extension://${id}/settings.html`);
  await settings.waitForFunction(async () => (await chrome.declarativeNetRequest.getDynamicRules()).some(r => r.id === 2));
  return {worker, id, settings};
}
async function check(name, fn) {
  const start = performance.now(); await fn();
  results.push({name, passed: true, ms: Math.round(performance.now()-start)}); console.log('PASS', name);
}
const hit = path => requests.filter(r => r.includes(path));
try {
  let {worker, id, settings} = await launch();
  const page = await context.newPage();
  await check('fresh navigation blocked before the server receives it', async () => {
    await page.goto(`http://first.test:${port}/initial?x=1&y=2`);
    await page.getByRole('heading', {name: 'This host is not approved.'}).waitFor();
    assert.equal(await page.locator('#host').textContent(), 'first.test');
    assert.equal(hit('/initial').length, 0);
    assert.equal(await page.locator('#approve').isDisabled(), true);
    await page.screenshot({path: 'artifacts/blocked.png'});
  });
  await check('explicit approval loads only the chosen host; third-party resource blocked', async () => {
    await page.locator('#consent').check();
    await page.locator('#approve').click();
    await page.getByRole('heading', {name: 'Allowed fixture'}).waitFor();
    await page.waitForFunction(() => window.scriptLoaded === true);
    assert.equal(hit('/initial').length, 1);
    assert.equal(hit('/pixel').length, 0);
    assert.equal(new URL(page.url()).search, '?x=1&y=2');
    const status = await page.evaluate(async port => {
      const fetchBlocked = await fetch(`http://api.test:${port}/fetch`).then(() => false, () => true);
      const socketBlocked = await new Promise(resolve => {
        const socket = new WebSocket(`ws://socket.test:${port}/socket`);
        socket.onerror = () => resolve(true); socket.onopen = () => {socket.close(); resolve(false);};
      });
      return {fetchBlocked, socketBlocked};
    }, port);
    assert.deepEqual(status, {fetchBlocked: true, socketBlocked: true});
    assert.equal(hit('/fetch').length, 0); assert.equal(hit('/socket').length, 0);
  });
  await check('PHP-looking paths and lookalike hosts remain blocked without approval', async () => {
    const other = await context.newPage();
    await other.goto(`http://php.test:${port}/login.php`);
    assert.match(await other.locator('#reason').textContent(), /PHP-style/);
    assert.equal(hit('/login.php').length, 0);
    await other.goto(`http://sub.first.test:${port}/subdomain`);
    await other.locator('#host').filter({hasText: 'sub.first.test'}).waitFor();
    assert.equal(hit('/subdomain').length, 0);
    await other.goto(`http://first.test.evil.test:${port}/lookalike`);
    assert.equal(hit('/lookalike').length, 0);
  });
  await check('POST to an unapproved host is blocked without replaying form data', async () => {
    await page.getByRole('button', {name: 'Send form'}).click();
    await page.waitForURL(url => url.href.includes('post.test') || url.href.startsWith('chrome-error://'));
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    assert.equal(hit('/submit').length, 0);
    assert.ok(!page.url().includes('blocked.html'));
  });
  await check('full bundled PHP evidence works on a fresh install without importing', async () => {
    assert.equal(await worker.evaluate(async () => (await chrome.storage.local.get('importedCount')).importedCount), undefined);
    for (const host of ['0038.co.jp', 'jquery.com']) {
      await page.goto(`https://${host}/`);
      await page.locator('#reason').filter({hasText: 'bundled PHP data'}).waitFor();
    }
    await settings.locator('#dataset').filter({hasText: '271,815 bundled hosts'}).waitFor();
  });
  await check('compact controls fit desktop and mobile; approval controls still work', async () => {
    assert.equal(await settings.locator('#list-options').getAttribute('open'), null);
    await settings.setViewportSize({width: 800, height: 650});
    assert.ok(await settings.evaluate(() => document.documentElement.scrollHeight <= innerHeight));
    await settings.screenshot({path: 'artifacts/settings-compact.png', fullPage: true});
    await settings.setViewportSize({width: 360, height: 740});
    assert.ok(await settings.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await settings.locator('#host').fill('control.test');
    await settings.locator('#accept').check();
    await settings.getByRole('button', {name: 'Approve', exact: true}).click();
    await settings.locator('#status').filter({hasText: 'control.test approved'}).waitFor();
    await settings.getByRole('button', {name: 'Remove approval for control.test', exact: true}).click();
    await settings.locator('#status').filter({hasText: 'control.test is no longer approved'}).waitFor();
    await settings.screenshot({path: 'artifacts/settings-mobile.png', fullPage: true});
    await settings.setViewportSize({width: 1100, height: 900});
    await settings.locator('#list-options summary').click();
  });
  await check('local list import changes evidence, not approvals; invalid import preserves data', async () => {
    const before = await worker.evaluate(() => chrome.declarativeNetRequest.getDynamicRules());
    await settings.locator('#file').setInputFiles({name: 'php-list.txt', mimeType: 'text/plain', buffer: Buffer.from('listed.test\nlisted.test\n')});
    await settings.locator('#import-status').filter({hasText: 'Imported 1 unique'}).waitFor();
    const evidence = await context.newPage();
    await evidence.goto(`http://listed.test:${port}/listed`);
    await evidence.locator('#reason').filter({hasText: 'your imported PHP list'}).waitFor();
    assert.equal(hit('/listed').length, 0);
    await settings.locator('#file').setInputFiles({name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('valid.test\n*.bad.test')});
    await settings.locator('#import-status').filter({hasText: 'previous list was kept'}).waitFor();
    assert.equal(await worker.evaluate(async () => (await chrome.storage.local.get('importedPHP')).importedPHP), 'listed.test');
    assert.deepEqual(await worker.evaluate(() => chrome.declarativeNetRequest.getDynamicRules()), before);
  });
  await check('large PHP list import remains local and reports its real size', async () => {
    const input = process.env.PHP_LIST || null;
    if (input) await settings.locator('#file').setInputFiles(input);
    else await settings.locator('#file').setInputFiles({name: 'large.txt', mimeType: 'text/plain', buffer: Buffer.from(Array.from({length: 300000}, (_, i) => `host${i}.test`).join('\n'))});
    await settings.locator('#import-status').filter({hasText: 'Imported'}).waitFor();
    const count = await worker.evaluate(async () => (await chrome.storage.local.get('importedCount')).importedCount);
    assert.ok(count >= 250000, `Unexpected list count ${count}`);
    console.log('Imported hostnames:', count);
  });
  await check('invalid warning-page destination cannot approve or execute code', async () => {
    await page.goto(`chrome-extension://${id}/blocked.html#javascript:alert(1)`);
    await page.locator('#reason').filter({hasText: 'No valid destination'}).waitFor();
    assert.equal(await page.locator('#approval').isVisible(), false);
    assert.match(await page.locator('#reason').textContent(), /No valid destination/);
  });
  await check('worker shutdown does not remove browser-enforced blocking', async () => {
    const session = await context.newCDPSession(settings);
    await session.send('ServiceWorker.enable'); await session.send('ServiceWorker.stopAllWorkers');
    await page.goto(`http://stopped.test:${port}/worker-stopped`);
    await page.getByRole('heading', {name: 'This host is not approved.'}).waitFor();
    assert.equal(hit('/worker-stopped').length, 0);
    await session.detach();
  });
  await check('approvals and strict blocking survive a browser restart', async () => {
    await context.close();
    ({worker, id, settings} = await launch());
    const page = await context.newPage();
    await page.goto(`http://first.test:${port}/restart`);
    await page.getByRole('heading', {name: 'Allowed fixture'}).waitFor();
    await page.goto(`http://restart-unknown.test:${port}/restart-blocked`);
    await page.getByRole('heading', {name: 'This host is not approved.'}).waitFor();
    assert.equal(hit('/restart-blocked').length, 0);
    await settings.screenshot({path: 'artifacts/settings.png', fullPage: true});
  });
  await check('removing approvals restores blocking; missing redirect fails closed', async () => {
    await settings.getByRole('button', {name: 'Remove every approval'}).click();
    await settings.locator('#status').filter({hasText: 'All approvals removed'}).waitFor();
    const page = await context.newPage();
    await page.goto(`http://first.test:${port}/revoked`);
    assert.equal(hit('/revoked').length, 0);
    await worker.evaluate(() => chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: [2]}));
    await page.goto(`http://fallback.test:${port}/fail-closed`).catch(error => assert.match(error.message, /ERR_BLOCKED_BY_CLIENT/));
    assert.equal(hit('/fail-closed').length, 0);
  });
  await writeFile('artifacts/browser-results.json', JSON.stringify({browser: context.browser()?.version(), date: new Date().toISOString(), results}, null, 2)+'\n');
} finally {
  await context?.close(); await new Promise(resolve => server.close(resolve));
}
