# Install PHP Precaution in Chrome or Brave

This is a desktop unpacked extension. No Chrome Web Store account or approval is required. Use Chrome/Brave based on Chromium 128 or later. It is not an Android or iOS installation package.

**It blocks unapproved web hosts by default. Ordinary websites will break until you approve the hosts they need.** Approval allows PHP too; it is not a security check. This extension does not fix the PHP vulnerabilities on a server.

## Install the release ZIP

1. Prefer a new, separate Chrome or Brave profile. Save your work and close existing website tabs before enabling the extension. Previously loaded pages and existing connections are not undone.
2. Download `php-precaution-0.1.0.zip` from [GitHub Releases](https://github.com/swarmkind/php-precaution/releases/latest).
3. Extract the ZIP into a permanent folder. Do not leave it inside the ZIP, and do not delete or move the extracted folder while using the extension.
4. Open **`chrome://extensions`** in Chrome or **`brave://extensions`** in Brave.
5. Switch on **Developer mode**.
6. Click **Load unpacked**. Select the extracted `php-precaution` folder containing `manifest.json`.
7. The settings page opens. Pin **PHP Precaution — Swarmkind** from the browser’s Extensions menu for easy access.
8. Test it: open `https://example.com/`. A warning should appear before that page is requested. If it does not, stop and check that the extension is enabled and has site access on all sites.

If using GitHub’s **Code → Download ZIP** instead, extract it and select the repository’s **`extension`** subfolder in step 6. No build, Node.js or command line is needed to install either version.

## Browse with it

- Unapproved navigation opens a local warning. It shows either a PHP-style path, an exact-host match in a PHP evidence list, or **PHP use is unknown**.
- To proceed, read the displayed hostname, tick the risk acknowledgement and click **Approve host and continue**. The approval persists until removed.
- Approvals are for the **exact hostname**, across all ports and HTTP/HTTPS/WebSocket schemes. Approving `example.com` does not approve `www.example.com`, `cdn.example.com`, or unrelated third-party hosts.
- Scripts, images, frames, API calls and WebSockets to unapproved hosts are blocked too. Open the extension’s settings to approve required hosts individually. The extension does not automatically allow a page’s dependencies.
- Requests to an approved host, including `.php` paths, are allowed. The PHP evidence list explains a precaution; it does not override your explicit approval.
- Blocked form submissions may show the browser’s normal blocked-page error. The extension deliberately does **not** replay a POST as a GET or resubmit form data.
- Use **Remove** beside a host, or **Remove every approval**, to revoke access. Close or reload affected tabs afterward.
- Up to 500 exact hosts can be approved. This keeps the rules within Chrome’s regex quota.

## Import your own PHP evidence list

Open the extension settings and select a UTF-8 `.txt` file containing one hostname per line:

```text
example.com
www.example.org
```

Blank lines and `#` comments are accepted. URLs, wildcards, ports and CSV columns are rejected. Duplicate names are removed. The limit is 64 MB. An invalid file leaves the previous import intact; a valid import replaces it. Importing never grants access to a site.

See [DATA-SOURCES.md](DATA-SOURCES.md) for the large, freely downloadable technology sample and its local filtering instructions. The public extension bundles only the separately licensed 951-host Crawlora sample.

## Update, disable or remove

- Unpacked extensions **do not update automatically**. Download the new release and replace the files in the same permanent folder, then click **Reload** on the Extensions page. Close existing website tabs before reloading. Confirm blocking again afterward.
- To recover ordinary browsing, turn the extension off at `chrome://extensions` or `brave://extensions`. Browser-internal extension settings remain accessible.
- **Remove** uninstalls it and removes its saved approvals/imports. You can then delete the extracted folder.
- If your organisation disables Developer mode or unpacked extensions, ask its administrator. Do not bypass device management policies.
- Incognito is not covered unless you explicitly enable **Allow in incognito** in the extension’s details. Other browser profiles and apps are never covered.

## Limits

This is a browser request restriction, not a firewall, malware scanner, or server patch. PHP can be hidden; evidence lists can be old or wrong. Browser-protected traffic, service-worker-generated/cached responses, already-loaded content and already-established connections are outside or may bypass its request filtering. Other extensions can affect the warning experience. Use a fresh profile and treat approving a host as accepting its content, not certifying it.
