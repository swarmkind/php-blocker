# Verification — v0.2.0, 21 October 2026

- Node unit tests: 5 passed.
- Python CSV-filter test: 1 passed.
- Chrome for Testing / Chromium 151.0.7922.34: 12 browser checks passed.
- Installed Brave executable (Chromium 155.0.8059.85): 12 browser checks passed in a temporary profile.
- Both browser runs verified the full bundled list on a fresh install, before any import, and also tested importing the actual 271,485-host text file.
- All 271,485 source hostnames are present in the merged 271,815-host bundle; the filtered source checksum matches the provenance record.
- Compact settings checked at 800×650 and 360×740, including adding and removing an approval.
- The documented CSV filter reproduced the previously extracted file byte-for-byte (SHA-256 in DATA-SOURCES.md).
- Compact desktop and mobile-width settings screenshots inspected visually.

Checks covered pre-network blocking, explicit approval, unapproved third-party images/fetch/WebSockets, subdomain/lookalike isolation, blocked POST without replay, invalid-import preservation, a large list import, bundled PHP evidence, malicious warning-page input, stopped background workers, restart persistence, approval removal and a missing-redirect fallback.

No live website was vulnerability-scanned. We have not tested Windows, Linux, mobile browsers, incognito, managed devices or Chromium 128. The release is not Chrome Web Store reviewed. See INSTALL.md for browser limitations and recovery.

## v0.2.1 link update

Verified the control-panel X link target, new-tab navigation, normal approval requirement, and desktop/narrow layouts in Chrome for Testing. Inspected the desktop screenshot. The full blocking suite was not rerun for this HTML/CSS link update.
