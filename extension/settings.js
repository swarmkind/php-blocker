import {hostname, MAX_LIST_BYTES, parseList} from './model.js';
import {send} from './ui.js';
const $ = id => document.getElementById(id);

async function refresh() {
  const {rules} = await send({type: 'list'});
  $('approved').replaceChildren();
  for (const rule of rules) {
    const host = rule.condition.regexFilter.split('://')[1].split('(:')[0].replace(/\\/g, '');
    const li = document.createElement('li');
    const label = document.createElement('span'); label.textContent = host;
    const remove = document.createElement('button'); remove.textContent = 'Remove'; remove.className = 'secondary';
    remove.setAttribute('aria-label', `Remove approval for ${host}`);
    remove.addEventListener('click', async () => {
      try { await send({type: 'remove', id: rule.id}); await refresh(); $('status').textContent = `${host} is no longer approved. Reload or close its open tabs.`; }
      catch (error) { $('status').textContent = error.message; }
    });
    li.append(label, remove); $('approved').append(li);
  }
  if (!rules.length) $('approved').textContent = 'No hosts approved. Strict blocking is active.';
  const bundled = await (await fetch('data/php-hosts.json')).json();
  const local = await chrome.storage.local.get(['importedCount', 'importedName']);
  $('dataset').textContent = `${bundled.hosts.length.toLocaleString()} bundled hostnames from Crawlora’s August 2026 sample (CC BY 4.0). ${local.importedCount ? `${local.importedCount.toLocaleString()} locally imported hostnames from ${local.importedName}.` : 'No imported list.'}`;
}
$('add').addEventListener('submit', async event => {
  event.preventDefault();
  if (!$('accept').checked) return;
  try {
    const host = hostname($('host').value);
    await send({type: 'approve', host});
    $('host').value = ''; $('accept').checked = false;
    await refresh(); $('status').textContent = `${host} approved. This is not a security check.`;
  } catch (error) { $('status').textContent = error.message; }
});
$('reset').addEventListener('click', async () => {
  try { await send({type: 'reset'}); await refresh(); $('status').textContent = 'All approvals removed. Close previously loaded tabs.'; }
  catch (error) { $('status').textContent = error.message; }
});
$('file').addEventListener('change', async () => {
  const file = $('file').files[0];
  if (!file) return;
  $('file').disabled = true;
  try {
    if (file.size > MAX_LIST_BYTES) throw new Error('The file exceeds 64 MB.');
    const hosts = parseList(await file.text());
    await chrome.storage.local.set({importedPHP: hosts.join('\n'), importedCount: hosts.length, importedName: file.name});
    await refresh(); $('import-status').textContent = `Imported ${hosts.length.toLocaleString()} unique hostnames. Approvals unchanged.`;
  } catch (error) { $('import-status').textContent = `${error.message} The previous list was kept.`; }
  finally { $('file').disabled = false; $('file').value = ''; }
});
$('clear').addEventListener('click', async () => {
  try { await chrome.storage.local.remove(['importedPHP', 'importedCount', 'importedName']); await refresh(); $('import-status').textContent = 'Imported list removed.'; }
  catch (error) { $('import-status').textContent = error.message; }
});
refresh().catch(error => { $('status').textContent = error.message; });
