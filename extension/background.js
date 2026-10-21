import {approvalRule, hostname, MAX_APPROVED, navigationRule} from './model.js';

// The packaged deny rule remains active even if this worker cannot initialize.
async function installNavigation() {
  await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: [2], addRules: [navigationRule(chrome.runtime.getURL(''))]});
}
chrome.runtime.onInstalled.addListener(() => {
  installNavigation().catch(console.error);
  chrome.runtime.openOptionsPage();
});
chrome.runtime.onStartup.addListener(() => installNavigation().catch(console.error));
chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

let queue = Promise.resolve();
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(''))) return;
  const task = queue.then(async () => {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const approvals = rules.filter(r => r.action.type === 'allow');
    if (message.type === 'list') return {rules: approvals};
    if (message.type === 'reset') {
      await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: approvals.map(r => r.id)});
      return {};
    }
    if (message.type === 'remove') {
      if (!approvals.some(r => r.id === message.id)) throw new Error('Approval not found.');
      await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: [message.id]});
      return {};
    }
    if (message.type === 'approve') {
      const host = hostname(message.host);
      const candidate = approvalRule(host, 100);
      if (approvals.some(r => r.condition.regexFilter === candidate.condition.regexFilter)) return {host};
      if (approvals.length >= MAX_APPROVED) throw new Error(`Limit reached: remove an approval first (${MAX_APPROVED} maximum).`);
      let id = 100;
      while (rules.some(r => r.id === id)) id++;
      await chrome.declarativeNetRequest.updateDynamicRules({addRules: [approvalRule(host, id)]});
      return {host};
    }
    throw new Error('Unknown action.');
  });
  queue = task.catch(() => {});
  task.then(result => respond({ok: true, ...result}), error => respond({ok: false, error: error.message}));
  return true;
});
