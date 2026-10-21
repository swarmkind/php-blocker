# PHP Blocker

A small Chrome/Brave extension by **Swarmkind** that blocks unapproved web hosts before their network requests proceed. A local warning shows PHP evidence where available; you must explicitly approve a host to visit it.

**Strict by default. Expect disrupted browsing. This is not a fix for a PHP vulnerability and does not certify any site as safe.** Approvals permit that host’s requests, including PHP. PHP evidence lists are incomplete historical observations.

[Download the latest ZIP](https://github.com/swarmkind/php-blocker/releases/latest) · [Installation instructions](INSTALL.md) · [Data sources](DATA-SOURCES.md) · [Privacy](PRIVACY.md) · [@swarmkind on X](https://x.com/swarmkind)

[Watch the 25-second demonstration](https://github.com/swarmkind/php-blocker/releases/download/v0.3.0/php-blocker-demo.mp4) — square video showing blocking, explicit approval and the control panel.

## Install without the Chrome Web Store

1. Download and extract the release ZIP to a permanent folder.
2. Open `chrome://extensions` or `brave://extensions` and enable **Developer mode**.
3. Click **Load unpacked**, then select the folder containing `manifest.json`.
4. Prefer a fresh browser profile. Close existing website tabs first, then test navigation to `https://example.com/` to confirm the block page appears.

If downloading the source ZIP, select its `extension` subfolder instead. No build or account is needed. These are desktop instructions. Full steps, updating and recovery are in [INSTALL.md](INSTALL.md).

## What it does

- Blocks unapproved HTTP(S) and WebSocket network requests, including page navigation and embedded resources.
- Shows a local warning before an unapproved GET navigation reaches the destination.
- Allows only exact hostnames you explicitly approve. Subdomains and third-party resources need separate approval. All ports and supported schemes for that hostname are included.
- Displays `.php`-style paths and matches from **271,815 bundled PHP-labelled hosts**. PHP list membership is a caution, not an allegation of a vulnerable or malicious site.
- Bundles all **271,485** PHP-labelled hosts from the Edu-Data sample, plus the existing Crawlora sample (271,815 unique hosts after merging). No import is needed. Optional custom lists remain local. [Sources, dates and licence status](DATA-SOURCES.md).
- Stores data only in your browser profile. No accounts, telemetry or remote list lookups.

The PHP list explains blocked hosts; strict mode already blocks every unapproved host. A manually approved host is allowed even if it appears in a PHP list. There is no automatic PHP-free or safe classification.

## Limits

This is not a firewall or a server patch. Previously loaded pages, existing connections, browser-protected traffic and service-worker-generated/cached responses are not fully controlled by these request rules. Other apps, profiles and incognito windows where the extension is disabled are outside its scope. Use a fresh profile and close existing website tabs before enabling it.

The initial packaged deny rule fails closed if the background worker cannot install the nicer navigation warning. Blocked POST submissions use the browser’s blocked-request error; we do not replay a form submission. Unpacked releases require manual updates. Removing an approval does not erase content already downloaded.

## Development

Runtime: plain JavaScript, HTML, CSS and Manifest V3; no build step or runtime dependencies.

```sh
npm install
npm test
python3 -m unittest discover -s tests -p '*_test.py'
npx playwright install chromium
npm run test:browser
npm run package
```

`CHROME_PATH=/path/to/chromium` selects a browser executable. Chrome for Testing/Chromium supports the automated unpacked-extension loading used by the test; branded Chrome may restrict that command-line flag. `PHP_LIST=/path/to/large-host-list.txt` exercises the real local import instead of a generated 300,000-host fixture.

Browser tests run with an isolated profile and local HTTP fixtures. They check that blocked navigation, third-party requests and POST data do not reach the fixture server, as well as approvals, exact-host boundaries, large imports, restart persistence and failure behaviour. Test artifacts are ignored by git.

The packaged ZIP is built from an explicit extension directory and documentation allowlist. Research downloads, browser profiles and development dependencies are never packaged.

## Licence

Code: [MIT](LICENSE). Crawlora data: [CC BY 4.0](CC-BY-4.0.txt). The Edu-Data sample states no explicit redistribution licence; its inclusion is not a claim of permission or an open-data licence. Code and Crawlora licences do not cover that source. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
