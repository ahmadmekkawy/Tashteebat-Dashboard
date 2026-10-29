"""Create browser-downloadable standalone HTML and source archives after a build."""
from pathlib import Path
import re
import zipfile

root = Path(__file__).resolve().parent.parent
dist = root / 'dist'
html = (dist / 'index.html').read_text()
html = re.sub(r'<script[^>]*src="([^"]+)"[^>]*></script>', lambda m: '<script type="module">' + (dist / m[1].lstrip('/')).read_text().replace('</script', '<\\/script') + '</script>', html)
html = re.sub(r'<link[^>]*href="([^"]+\.css)"[^>]*>', lambda m: '<style>' + (dist / m[1].lstrip('/')).read_text() + '</style>', html)
html = re.sub(r'<link[^>]*rel="manifest"[^>]*>', '', html)
html = html.replace('<head>', '<head><meta name="luma-standalone" content="true">', 1)
outputs = [root / 'public/downloads', dist / 'downloads']
if root.parent == Path('/workspace'):
    outputs.append(root.parent / 'luma-downloads')
for out in outputs:
    out.mkdir(parents=True, exist_ok=True)
    (out / 'Luma-Lighting-Calculator.html').write_text(html)
# A ZIP prevents browsers from displaying the runnable HTML as raw source.
app_archive = outputs[0] / 'Luma-App.zip'
with zipfile.ZipFile(app_archive, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('Luma-Lighting-Calculator.html', html)
    z.writestr('START-HERE.txt', 'Extract this ZIP, then double-click Luma-Lighting-Calculator.html. No installation or development tools are required.\n')
for out in outputs[1:]:
    (out / app_archive.name).write_bytes(app_archive.read_bytes())
archive = outputs[0] / 'Luma-Source-Code.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for file in root.rglob('*'):
        relative = file.relative_to(root)
        if file.is_file() and not any(p in ['node_modules', '.git', 'dist', 'site', 'downloads', '__pycache__'] for p in relative.parts) and not file.name.endswith('.tsbuildinfo'):
            z.write(file, Path('luma') / relative)
for out in outputs[1:]:
    (out / archive.name).write_bytes(archive.read_bytes())
print('Packaged standalone HTML and source ZIP into public/downloads and dist/downloads')

# Precache production asset hashes so the first online visit prepares offline use.
import json
core = ['/', '/icon.svg', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'] + ['/' + str(p.relative_to(dist)) for p in (dist / 'assets').rglob('*') if p.is_file()]
worker = (root / 'public/sw.js').read_text()
worker = re.sub(r'const CORE_FILES = \[.*?\];', 'const CORE_FILES = ' + json.dumps(core) + ';', worker, flags=re.S)
(dist / 'sw.js').write_text(worker)
