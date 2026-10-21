import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {approvalRule, hostname, navigationRule, parseList, webAddress} from '../extension/model.js';

test('host input is canonical and cannot smuggle schemes, wildcards or credentials', () => {
  assert.equal(hostname('HTTPS://Example.COM:8080/path'), 'example.com');
  assert.equal(hostname('bücher.example'), 'xn--bcher-kva.example');
  assert.equal(hostname('https://[::1]:8080/'), '[::1]');
  for (const value of ['', '*.example.com', 'javascript:alert(1)', 'file:///etc/passwd', 'https://user:pass@example.com', 'x y.com']) assert.throws(() => hostname(value));
  assert.throws(() => webAddress('javascript:alert(1)'));
  assert.throws(() => webAddress('https://user:pass@example.com'));
});

test('approval matches only the exact host across allowed schemes and ports', () => {
  const pattern = new RegExp(approvalRule('example.com', 100).condition.regexFilter);
  for (const u of ['https://example.com/', 'http://example.com:8080/a', 'wss://example.com/socket']) assert.ok(pattern.test(u), u);
  for (const u of ['https://evil-example.com/', 'https://example.com.evil.test/', 'https://sub.example.com/', 'https://evil.test/example.com/', 'https://exampleXcom/']) assert.ok(!pattern.test(u), u);
  assert.ok(new RegExp(approvalRule('[::1]', 100).condition.regexFilter).test('http://[::1]:8080/'));
});

test('list parser rejects malformed imports instead of silently truncating', () => {
  assert.deepEqual(parseList('# note\nEXAMPLE.COM\nexample.com\nbücher.example\n'), ['example.com', 'xn--bcher-kva.example']);
  for (const v of ['', '# empty', 'domain,technology\nexample.com,PHP', 'example.com/path', '*.example.com', 'example.com:123', 'https://example.com', 'example.com\ngood.com bad.com']) assert.throws(() => parseList(v));
});

test('deny rule is packaged and navigation redirects never replay POST', async () => {
  const manifest = JSON.parse(await readFile('extension/manifest.json'));
  const [deny] = JSON.parse(await readFile('extension/strict.json'));
  assert.equal(manifest.declarative_net_request.rule_resources[0].enabled, true);
  assert.equal(deny.action.type, 'block');
  assert.ok(deny.condition.resourceTypes.includes('main_frame'));
  assert.ok(deny.condition.resourceTypes.includes('xmlhttprequest'));
  assert.ok(deny.condition.resourceTypes.includes('websocket'));
  const nav = navigationRule('chrome-extension://test/');
  assert.deepEqual(nav.condition.requestMethods, ['get']);
  assert.equal(nav.action.redirect.regexSubstitution, 'chrome-extension://test/blocked.html#\\1');
});

test('bundled PHP evidence is deduplicated and attributed', async () => {
  const data = JSON.parse(await readFile('extension/data/php-hosts.json'));
  assert.equal(data.hosts.length, 951);
  assert.equal(data.license, 'CC BY 4.0');
  assert.deepEqual(data.hosts, parseList(data.hosts.join('\n')));
});
