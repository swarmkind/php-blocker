# PHP evidence sources

These datasets report technology observations. They do not prove current PHP use, PHP dependence, an unpatched version, or compromise. We do not describe their entries as malicious sites. The strict blocker does not depend on exhaustive PHP detection: every unapproved host is blocked, and lists explain why a host may deserve extra caution.

## Bundled total: 271,815 unique hostnames

The release includes all 271,485 PHP-labelled hosts from the Edu-Data sample and 951 from Crawlora. There are 621 overlaps. No import or network download is required. The sources retain their separate licence status below.

## Crawlora: 951 hostnames, CC BY 4.0

- Author/source: [Crawlora-org, techstack-census-data](https://github.com/Crawlora-org/techstack-census-data).
- Source file: `data/sample-domains-10k.csv`, revision `8f5f83e371a96479dfa27b64b1e31c1d905ae7ba`.
- Observation date: 25 August 2026. Downloaded 21 October 2026.
- Source sample: 9,850 domains drawn from a Tranco top-million census. The full million-row technology dataset is **not** included in that public release.
- Selection: exact `PHP` entry in the pipe-separated `technology_names` column or `PHP` in `server_language`, case-insensitive. Lowercase, deduplicate and sort `domain`.
- Result: **951 distinct hostnames**, in `extension/data/php-hosts.json`.
- Changes: filtered to PHP, removed unrelated columns, sorted, deduplicated and converted to JSON. No new live checks were performed.
- Source CSV SHA-256: `c2381189e821bbc2317f3111ab90353dd4122bd65d4e346d3e11cfa489a10368`.
- Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), also included in `CC-BY-4.0.txt`. No endorsement by Crawlora is implied.

## Edu-Data: 271,485 PHP-labelled domains (bundled)

[Edu-Data’s Web Technology Database sample](https://edudata.gumroad.com/l/domains-technology) links a free [Google Drive CSV download](https://drive.google.com/file/d/11knlCzFgWLy2M2TuG3t8DFUYcuVLOcCb/view). The publisher says its source is HTTP Archive, March 2026.

The file downloaded on 21 October 2026 was named `technology_web_info_524k_domains.csv`. We counted it locally:

| Measurement | Count |
|---|---:|
| CSV records | 13,043,396 |
| Distinct domains across all technologies | 524,449 |
| Distinct domains whose `technology` equals `PHP` | 271,485 |
| Download size | 611,446,823 bytes |
| Filtered PHP text file size | 4,080,384 bytes |

The 524,449-domain count is **not** a PHP-only count. This is the largest free downloadable sample we verified during this search, not a claim to have found every free dataset on the internet. It is not necessarily the top 524,449 sites by visits, and March observations do not establish October patch status.

Source CSV SHA-256: `82a240be080dfb896fb817d3d52ff3ad35dc9c05ec3a425e9ff00114de6e5243`.

Filtered PHP file SHA-256: `4d167b65e5e4d78460803f91069bcb52d4fbb5f142c6d68c66288e5fa7e1aed6`.

**The public download page does not state an explicit redistribution licence for this sample. Redistribution rights remain unconfirmed.** The filtered factual hostname labels are included in `extension/data/php-hosts.json`; the source CSV and unrelated columns are not included. We do not grant or claim an open-data licence for this source. The MIT licence for our code and the CC BY licence for the Crawlora sample do not apply to it. To reproduce the filtered list from the publisher’s CSV:

```sh
python3 scripts/filter-php.py technology_web_info_524k_domains.csv php-hosts.txt
```

The published release already contains these hosts. You can also import `php-hosts.txt` under **Custom list**. No list or browsing history is uploaded. The filter uses Python’s standard library; no packages are required. A malformed source fails before writing output.

## Other sources investigated

- [HTTP Archive](https://httparchive.org/) publishes a much larger public technology dataset. PHP origins can be selected with BigQuery, but access requires a Google Cloud project and query costs depend on usage/free allowance. We did not run a query or verify a current PHP-domain count. Its dashboard’s adoption totals are not themselves a hostname download.
- [BuiltWith PHP top-million report](https://trends.builtwith.com/websitelist/PHP/Top-Million-Sites-by-Traffic) advertises 196,288 PHP entries as checked on 21 October 2026. Full export requires paid access, and its standard terms restrict redistribution. No BuiltWith data is bundled.
- [Tranco](https://tranco-list.eu/) provides domain rankings, **not PHP classifications**. A rank alone is never evidence of PHP.
