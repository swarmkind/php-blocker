# Privacy

PHP Blocker has no server, accounts, analytics, telemetry or remote reputation queries. It does not automatically download datasets.

Approved hostnames are stored in Chrome’s local declarative request rules. An imported PHP list, its filename and row count are saved in extension-local storage. These are not synced by this extension. Uninstalling it removes this state.

When an unapproved GET navigation is intercepted, its destination URL is passed in the fragment of a local extension warning page. The fragment is not sent to a web server, but the URL can remain in browser history. Treat history and your browser profile as sensitive. The extension does not separately record visited URLs, request bodies or passwords.

## Permissions

- `declarativeNetRequest`: lets the browser enforce blocking even while the extension worker is asleep.
- HTTP/HTTPS host access: needed to redirect attempted navigation to a local warning page. Keep site access enabled for all sites for the intended behaviour.
- `storage` and `unlimitedStorage`: hold optional large PHP lists locally. File imports are still limited to 64 MB by the app.

There are no content scripts. The extension does not inspect the DOM of visited pages or submit forms. A host you approve receives normal browser requests, including normal cookies and any data you choose to send. Approval is not an isolation sandbox.
