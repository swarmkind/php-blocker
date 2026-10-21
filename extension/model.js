export const MAX_APPROVED = 500;
export const MAX_LIST_BYTES = 64 * 1024 * 1024;
export const RESOURCE_TYPES = ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'webtransport', 'webbundle', 'other'];

export function hostname(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) throw new Error('Enter a hostname or an HTTP(S) address.');
  const input = value.trim();
  const url = new URL(input.includes('://') ? input : `https://${input}`);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Only HTTP(S) addresses without login details are accepted.');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host || host.length > 253 || /[\s*%\\]/.test(host)) throw new Error('Invalid hostname.');
  if (!host.startsWith('[') && !host.split('.').every(s => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(s))) throw new Error('Invalid hostname.');
  return host;
}

export function webAddress(value) {
  const url = new URL(value);
  url.hostname = hostname(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP(S) pages can be opened.');
  // Never replay a URL carrying embedded credentials.
  if (url.username || url.password) throw new Error('Addresses with login details are not supported.');
  return url.href;
}

export function navigationRule(extensionURL) {
  return {
    id: 2, priority: 2,
    action: {type: 'redirect', redirect: {regexSubstitution: `${extensionURL}blocked.html#\\1`}},
    condition: {regexFilter: '^(https?://.*)$', resourceTypes: ['main_frame'], requestMethods: ['get']}
  };
}

export function approvalRule(host, id) {
  if (hostname(host) !== host) throw new Error('Approval must use a canonical hostname.');
  const escaped = host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    id, priority: 10, action: {type: 'allow'},
    condition: {regexFilter: `^(https?|wss?)://${escaped}(:[0-9]+)?/`, resourceTypes: RESOURCE_TYPES}
  };
}

export function parseList(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_LIST_BYTES) throw new Error('Use a UTF-8 text list smaller than 64 MB.');
  const hosts = new Set();
  for (const [i, raw] of text.split(/\r?\n/).entries()) {
    const value = raw.trim();
    if (!value || value.startsWith('#')) continue;
    if (/[\s,;/@?#]/.test(value) || value.includes('://')) throw new Error(`Line ${i + 1}: use one hostname per line, without paths or CSV columns.`);
    const host = hostname(value);
    if (value.toLowerCase().replace(/\.$/, '') !== host && !/[^\x00-\x7F]/.test(value)) throw new Error(`Line ${i + 1}: invalid hostname.`);
    hosts.add(host);
  }
  if (!hosts.size) throw new Error('The file contains no hostnames.');
  return [...hosts].sort();
}
