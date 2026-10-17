"""Build the two guide pages from src/*.html, src/shared.css and the outlined logo files.

Run from anywhere: python3 design/guidelines/src/build.py
In the sources, <svg data-logo="KEY"></svg> becomes the real outlined logo (colour = currentColor).
Add data-pad="1" to keep the clear-space margin inside the box.
"""
import re, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
LOGO = ROOT.parent / 'logo' / 'svg'

SRC = {  # key: (file, clear-space padding in the file's units)
    'name': ('master/logo-master_burgundy.svg', 78),
    'full': ('logo_burgundy.svg', 78),
    'stack': ('logo-stacked_burgundy.svg', 78),
    'mono': ('monogram_burgundy.svg', 32),
    't': ('favicon_peony-on-burgundy.svg', None),
    'bookshop': ('descriptor/logo-bookshop_burgundy-on-cream.svg', 78),
    'studio': ('descriptor/logo-studio_burgundy-on-cream.svg', 78),
    'opencalls': ('descriptor/logo-open-calls_burgundy-on-cream.svg', 78),
    'gallery': ('descriptor/logo-gallery_burgundy-on-cream.svg', 78),
}

defs, boxes = [], {}
for key, (f, pad) in SRC.items():
    s = (LOGO / f).read_text()
    x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', s).group(1).split())
    inner = re.search(r'<g fill="[^"]+">(.*?)</g>', s, re.S).group(1)
    label = re.search(r'aria-label="([^"]+)"', s).group(1)
    if pad is None:  # favicon: the file's square is already the right box
        pad = 0
    boxes[key] = {'pad': f'{x:.2f} {y:.2f} {w:.2f} {h:.2f}',
                  'tight': f'{x+pad:.2f} {y+pad:.2f} {w-2*pad:.2f} {h-2*pad:.2f}',
                  'label': label}
    defs.append(f'<g id="lg-{key}">{inner}</g>')

SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' + ''.join(defs) + '</defs></svg>'
CSS = (HERE / 'shared.css').read_text()
import json
LINKS = json.loads((HERE / 'links.json').read_text())  # published addresses of the two guides


def logo_tag(m):
    attrs = m.group(1)
    key = re.search(r'data-logo="([^"]+)"', attrs).group(1)
    padded = 'data-pad="1"' in attrs
    rest = re.sub(r'\s*data-(logo|pad)="[^"]*"', '', attrs)
    b = boxes[key]
    vb = b['pad'] if padded else b['tight']
    return f'<svg{rest} viewBox="{vb}" fill="currentColor" role="img" aria-label="{b["label"]}"><use href="#lg-{key}"/></svg>'


for src, out in [('social.html', 'ATH-social-and-graphics.html'), ('ui-print.html', 'ATH-ui-and-print.html'), ('playbook.html', 'ATH-social-playbook.html')]:
    page = (HERE / src).read_text()
    for k, v in LINKS.items():
        page = page.replace(k, v)
    page = page.replace('/*SHARED*/', CSS).replace('<!--SPRITE-->', SPRITE)
    page = re.sub(r'<svg(\s[^>]*data-logo="[^"]+"[^>]*)></svg>', logo_tag, page)
    (ROOT / out).write_text(page)
    print(out, round(len(page) / 1024), 'KB')
