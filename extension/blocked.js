import {hostname, webAddress} from './model.js';
import {phpEvidence, send} from './ui.js';
const $ = id => document.getElementById(id);
let target, host;
window.addEventListener('hashchange', () => {
  target = host = null;
  $('approval').hidden = true;
  location.reload();
});
try {
  target = webAddress(location.hash.slice(1));
  host = hostname(target);
  $('host').textContent = host;
  const path = new URL(target).pathname;
  $('reason').textContent = /\.php(?:[0-9])?(?:\/|$)/i.test(path)
    ? 'This address contains a PHP-style path. That is a signal, not proof of server software or vulnerability.'
    : await phpEvidence(host);
  $('approval').hidden = false;
  $('consent').addEventListener('change', () => { $('approve').disabled = !$('consent').checked; });
} catch (error) {
  $('reason').textContent = 'No valid destination was supplied. Nothing has been approved.';
  $('approval').hidden = true;
}
$('approval').addEventListener('submit', async event => {
  event.preventDefault();
  if (!host || !$('consent').checked) return;
  $('approve').disabled = true;
  try {
    await send({type: 'approve', host});
    location.replace(target);
  } catch (error) { $('status').textContent = error.message; $('approve').disabled = false; }
});
$('settings').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('leave').addEventListener('click', async () => {
  const tab = await chrome.tabs.getCurrent();
  if (tab) await chrome.tabs.remove(tab.id);
});
