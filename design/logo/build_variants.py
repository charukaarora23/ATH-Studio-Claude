"""Second-round files: descriptor lockups, the 1.08x "to" test, and production versions.
Usage: ATH_FONTS=<fonts folder> python3 build_variants.py
"""
import os, importlib
FD = os.environ['ATH_FONTS']; HERE = os.path.dirname(os.path.abspath(__file__))
os.environ['ATH_OUT'] = 'unused'

def load(to_ratio):
    os.environ['ATH_TO'] = str(to_ratio)
    import build_logo; return importlib.reload(build_logo)

def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'w').write(text)

INK, WHITE = '#1C1310', '#FFFFFF'
for ratio, folder in [(1.18, 'svg'), (1.08, 'svg-to-108')]:
    L = load(ratio); C = L.COLOURS; out = os.path.join(HERE, folder)
    pairs = [('burgundy-on-cream', C['burgundy'], C['cream']), ('peony-on-burgundy', C['peony'], C['burgundy']), ('ballet-on-chilli', C['ballet'], C['chilli'])]
    # 1. master without PROJECT, and descriptor lockups (the slot that names each room)
    for label in ['BOOKSHOP', 'STUDIO', 'GALLERY', 'OPEN CALLS', 'MAGAZINE', 'PODCAST']:
        p, bb = L.wordmark(True, label); slug = label.lower().replace(' ', '-')
        for n, fg, bg in pairs:
            write(os.path.join(out, 'descriptor', f'logo-{slug}_{n}.svg'), L.svg(p, bb, fg, bg, title=f'Arts to Hearts {label.title()}'))
    p, bb = L.wordmark(False)
    for n, fg, bg in pairs + [('burgundy', C['burgundy'], None)]:
        write(os.path.join(out, 'master', f'logo-master_{n}.svg'), L.svg(p, bb, fg, bg, title='Arts to Hearts'))
    if ratio != 1.18:
        continue
    # 4. production: one-colour ink and white, all lockups
    for kind, fn in [('logo', lambda: L.wordmark(True)), ('logo-master', lambda: L.wordmark(False)), ('logo-stacked', L.stacked), ('monogram', L.monogram)]:
        p, bb = fn(); sq = kind == 'monogram'
        for n, fg in [('ink', INK), ('white', WHITE)]:
            write(os.path.join(out, 'one-colour', f'{kind}_{n}.svg'), L.svg(p, bb, fg, None, pad=0.32 * L.S if sq else L.X, square=sq))
    # circular avatar: monogram inside the safe circle of a square tile
    p, bb = L.monogram(); l, t, r, b = bb; w, h = r - l, b - t; side = max(w, h) / 0.62; cx, cy = (l + r) / 2, (t + b) / 2
    for n, fg, bg in [('peony-on-burgundy', C['peony'], C['burgundy']), ('ballet-on-chilli', C['ballet'], C['chilli'])]:
        body = ''.join(f'<path d="{d}"/>' for d in p)
        write(os.path.join(out, 'avatar', f'avatar-circle_{n}.svg'),
              f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{cx-side/2:.2f} {cy-side/2:.2f} {side:.2f} {side:.2f}" role="img" aria-label="AtH"><title>AtH</title>'
              f'<rect x="{cx-side/2:.2f}" y="{cy-side/2:.2f}" width="{side:.2f}" height="{side:.2f}" fill="{bg}"/><g fill="{fg}">{body}</g></svg>')
print('done')
