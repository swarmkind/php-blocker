# Verification — 21 October 2026

- Node unit tests: 5 passed.
- Python CSV-filter test: 1 passed.
- Chrome for Testing / Chromium 151.0.7922.34: 11 browser checks passed.
- Installed Brave executable (Chromium 155.0.8059.85): 11 browser checks passed in a temporary profile.
- Both browser runs imported the actual 271,485-host text file locally.
- The documented CSV filter reproduced the previously extracted file byte-for-byte (SHA-256 in DATA-SOURCES.md).
- Warning and settings pages inspected visually.

Checks covered pre-network blocking, explicit approval, unapproved third-party images/fetch/WebSockets, subdomain/lookalike isolation, blocked POST without replay, invalid-import preservation, a large list import, bundled PHP evidence, malicious warning-page input, stopped background workers, restart persistence, approval removal and a missing-redirect fallback.

No live website was vulnerability-scanned. We have not tested Windows, Linux, mobile browsers, incognito, managed devices or Chromium 128. The release is not Chrome Web Store reviewed. See INSTALL.md for browser limitations and recovery.
