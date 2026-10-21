export async function send(message) {
  const reply = await chrome.runtime.sendMessage(message);
  if (!reply?.ok) throw new Error(reply?.error || 'The extension could not apply this change.');
  return reply;
}

export async function phpEvidence(host) {
  const bundled = await (await fetch('data/php-hosts.json')).json();
  const local = await chrome.storage.local.get(['importedPHP', 'importedName']);
  if (bundled.hosts.includes(host)) return `Listed in the bundled PHP data. Historical detection; patch status unknown.`;
  if (local.importedPHP?.split('\n').includes(host)) return `Listed in your imported PHP list (${local.importedName || 'local file'}). The extension has not verified this report.`;
  return 'PHP use is unknown. This host is blocked because you have not approved it.';
}
