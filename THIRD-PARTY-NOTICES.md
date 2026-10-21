# Third-party notices

The Crawlora contribution to `extension/data/php-hosts.json` is adapted from **Crawlora-org, techstack-census-data**, snapshot 25 August 2026, revision `8f5f83e371a96479dfa27b64b1e31c1d905ae7ba`, under **Creative Commons Attribution 4.0 International**.

Source: https://github.com/Crawlora-org/techstack-census-data

Licence: https://creativecommons.org/licenses/by/4.0/ (full text in `CC-BY-4.0.txt`).

Changes: selected rows explicitly labelled PHP; retained only normalized distinct hostnames; sorted and converted to JSON. Counts and provenance are in `DATA-SOURCES.md`. No endorsement is implied.

The extension runtime uses no third-party JavaScript or network service. Playwright is a development-only dependency used for browser verification and is not shipped inside the extension ZIP.

## Edu-Data sample

The bundle also contains 271,485 distinct PHP-labelled hostnames filtered from Edu-Data’s free 524,449-domain sample. The publisher attributes the observations to HTTP Archive, March 2026. Source: https://edudata.gumroad.com/l/domains-technology

Changes: selected exact PHP labels, retained only hostnames, normalized, sorted and deduplicated, then merged with Crawlora. Source counts and checksums are in DATA-SOURCES.md. No endorsement or current vulnerability finding is implied.

The sample publisher states no explicit redistribution licence. Rights are unconfirmed; neither this project’s MIT licence nor Crawlora’s CC BY 4.0 licence covers this contribution.
