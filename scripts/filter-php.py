#!/usr/bin/env python3
"""Extract distinct PHP-labelled hostnames from the public Edu-Data CSV sample."""
import csv
import json
import pathlib
import re
import sys


def extract(source):
    hosts = set()
    with open(source, encoding='utf-8-sig', newline='') as stream:
        reader = csv.DictReader(stream)
        if not {'domain', 'technology'}.issubset(reader.fieldnames or []):
            raise ValueError('Expected domain and technology CSV columns.')
        for row in reader:
            if row['technology'] != 'PHP':
                continue
            host = row['domain'].strip().lower().rstrip('.').encode('idna').decode('ascii')
            if len(host) > 253 or not all(re.fullmatch(r'[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?', part) for part in host.split('.')):
                raise ValueError('Invalid hostname in source; no output was written.')
            hosts.add(host)
    if not hosts:
        raise ValueError('No PHP rows found; no output was written.')
    return sorted(hosts)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Usage: python3 scripts/filter-php.py source.csv php-hosts.txt')
    source, output = map(pathlib.Path, sys.argv[1:])
    if source.resolve() == output.resolve():
        sys.exit('Output must not overwrite the source CSV.')
    hosts = extract(source)
    output.write_text('\n'.join(hosts) + '\n', encoding='utf-8')
    print(json.dumps({'php_hostnames': len(hosts), 'output': str(output)}))
