#!/usr/bin/env python3
"""Deterministic, explicit runtime package. No npm install at runtime."""
import hashlib,json,zipfile
from pathlib import Path
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'manifest.json').read_text())
out=root/'packages'/('v'+m['version']);out.mkdir(parents=True,exist_ok=True)
archive=out/('aide-pkg-almanac-v'+m['version']+'.zip')
files=['LICENSE','README.md','CHANGELOG.md','THIRD_PARTY_NOTICES.md','manifest.json','index.js','lib/almanac.js','lib/calendar.js','vendor/hko-reference.json','vendor/hko-provenance.json','workbench.html','vendor/lunar.js','vendor/lunar-LICENSE','vendor/lunar-package.json','vendor/provenance.json']
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for name in sorted(files):
  info=zipfile.ZipInfo(name,(2026,10,20,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,(root/name).read_bytes())
checksum=hashlib.sha256(archive.read_bytes()).hexdigest()
(out/'SHA256SUMS').write_text(checksum+'  '+archive.name+'\n')
print(json.dumps({'file':str(archive.relative_to(root)),'sha256':checksum,'bytes':archive.stat().st_size}))
