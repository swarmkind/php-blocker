#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parent.parent
version = json.loads((root / 'extension/manifest.json').read_text())['version']
output = root / 'artifacts' / f'php-blocker-{version}.zip'
output.parent.mkdir(exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for path in sorted((root / 'extension').rglob('*')):
        if path.is_file() and '_metadata' not in path.parts:
            assert path.suffix in {'.json', '.js', '.html', '.css'}, path
            archive.write(path, f'php-blocker/{path.relative_to(root / "extension")}')
    for name in ['INSTALL.md', 'LICENSE', 'DATA-SOURCES.md', 'PRIVACY.md', 'THIRD-PARTY-NOTICES.md', 'CC-BY-4.0.txt']:
        archive.write(root / name, f'php-blocker/{name}')
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert 'php-blocker/manifest.json' in archive.namelist()
    assert not any('research/' in name or 'node_modules/' in name for name in archive.namelist())
digest = hashlib.sha256(output.read_bytes()).hexdigest()
output.with_suffix('.zip.sha256').write_text(f'{digest}  {output.name}\n')
print(f'{output.name}: {output.stat().st_size:,} bytes; SHA-256 {digest}')
