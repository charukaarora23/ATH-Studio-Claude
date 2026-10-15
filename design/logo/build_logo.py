"""Builds the ATH logo as outlined SVG from the real fonts.

Faculty Glyphic for "arts" and "hearts", Libre Baskerville Italic for "to",
and Nord Regular for PROJECT.
Spacing is measured from the glyph outlines, so every lockup is identical.
Usage: python3 build_logo.py <fonts_dir> <out_dir>
"""
import os, sys, json
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

FD, OUT = sys.argv[1], sys.argv[2]
FONTS = {
    'name': os.path.join(FD, 'FacultyGlyphic-Regular.ttf'),
    'to': os.path.join(FD, 'LibreBaskerville-Italic.ttf'),
    'project': os.path.join(FD, os.environ.get('ATH_PROJECT_FONT', 'Nord-Regular.otf')),
}
S = 100.0           # name size (one em of Faculty Glyphic)
TO = 1.18 * S       # "to" size: the ratio from the existing logo
GAP = 0.25 * S      # equal ink gap either side of "to"
PROJ_CAP = 0.27 * S # cap height of PROJECT
PROJ_TRACK = 0.32   # tracking of PROJECT, in em
PROJ_DROP = 0.40 * S  # baseline of name to top of PROJECT capitals

COLOURS = {'burgundy': '#6A0620', 'chilli': '#AA0003', 'peony': '#FAD2E1', 'ballet': '#FFD6DE', 'cream': '#F9EEE5'}

class Font:
    def __init__(self, path):
        self.tt = TTFont(path); self.upem = self.tt['head'].unitsPerEm
        self.gs = self.tt.getGlyphSet()
        blob = hb.Blob.from_file_path(path); self.hbf = hb.Font(hb.Face(blob))
        self.cap = getattr(self.tt['OS/2'], 'sCapHeight', 700) or 700
    def run(self, text, size, x, y, track=0.0):
        """Shape text; return (svg path d, bbox) with baseline at y (y grows down)."""
        buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
        hb.shape(self.hbf, buf, {'kern': True, 'liga': True})
        sc = size / self.upem; d = []; bb = [1e9, 1e9, -1e9, -1e9]; cx = 0
        order = self.tt.getGlyphOrder()
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            name = order[info.codepoint]
            t = (sc, 0, 0, -sc, x + (cx + pos.x_offset) * sc, y - pos.y_offset * sc)
            pp = SVGPathPen(self.gs); self.gs[name].draw(TransformPen(pp, t)); d.append(pp.getCommands())
            bp = BoundsPen(self.gs); self.gs[name].draw(TransformPen(bp, t))
            if bp.bounds:
                a, b, c, e = bp.bounds; bb = [min(bb[0], a), min(bb[1], b), max(bb[2], c), max(bb[3], e)]
            cx += pos.x_advance + track * self.upem
        return ' '.join(d), bb

F = {k: Font(v) for k, v in FONTS.items()}

def measure(font, text, size, track=0.0):
    _, bb = font.run(text, size, 0, 0, track); return bb

def wordmark(project=True):
    """Horizontal lockup. Returns list of path strings and overall bbox."""
    paths = []
    a_bb = measure(F['name'], 'arts', S); t_bb = measure(F['to'], 'to', TO); h_bb = measure(F['name'], 'hearts', S)
    x = -a_bb[0]
    d, A = F['name'].run('arts', S, x, 0); paths.append(d)
    x_to = A[2] + GAP - t_bb[0]; d, T = F['to'].run('to', TO, x_to, 0); paths.append(d)
    x_h = T[2] + GAP - h_bb[0]; d, H = F['name'].run('hearts', S, x_h, 0); paths.append(d)
    top = min(A[1], T[1], H[1]); left, right = A[0], H[2]
    bb = [left, top, right, max(A[3], T[3], H[3])]
    if project:
        bb = add_project(paths, bb, (left + right) / 2)
    return paths, bb

def add_project(paths, bb, cx):
    f = F['project']; size = PROJ_CAP / (f.cap / f.upem)
    pb = measure(f, 'PROJECT', size, PROJ_TRACK)
    w = pb[2] - pb[0]; x = cx - w / 2 - pb[0]; y = PROJ_DROP + PROJ_CAP
    d, P = f.run('PROJECT', size, x, y, PROJ_TRACK); paths.append(d)
    return [min(bb[0], P[0]), bb[1], max(bb[2], P[2]), max(bb[3], P[3])]

def stacked():
    paths = []
    a_bb = measure(F['name'], 'arts', S); t_bb = measure(F['to'], 'to', TO); h_bb = measure(F['name'], 'hearts', S)
    w1 = (a_bb[2] - a_bb[0]) + GAP + (t_bb[2] - t_bb[0]); w2 = h_bb[2] - h_bb[0]; cx = max(w1, w2) / 2
    x = cx - w1 / 2 - a_bb[0]; d, A = F['name'].run('arts', S, x, 0); paths.append(d)
    d, T = F['to'].run('to', TO, A[2] + GAP - t_bb[0], 0); paths.append(d)
    line2 = 1.05 * S
    d, H = F['name'].run('hearts', S, cx - w2 / 2 - h_bb[0], line2); paths.append(d)
    bb = [min(A[0], H[0]), min(A[1], T[1]), max(T[2], H[2]), H[3]]
    global PROJ_DROP
    keep = PROJ_DROP; PROJ_DROP = line2 + keep
    bb = add_project(paths, bb, cx); PROJ_DROP = keep
    return paths, bb

def monogram():
    paths = []; g = 0.05 * S
    A_bb = measure(F['name'], 'A', S); t_bb = measure(F['to'], 't', TO); H_bb = measure(F['name'], 'H', S)
    d, A = F['name'].run('A', S, -A_bb[0], 0); paths.append(d)
    d, T = F['to'].run('t', TO, A[2] + g - t_bb[0], 0); paths.append(d)
    d, H = F['name'].run('H', S, T[2] + g - H_bb[0], 0); paths.append(d)
    return paths, [A[0], min(A[1], T[1], H[1]), H[2], max(A[3], T[3], H[3])]

def favicon_t():
    t_bb = measure(F['to'], 't', TO); d, T = F['to'].run('t', TO, -t_bb[0], 0); return [d], T

X = -measure(F['name'], 'h', S)[1]   # clear space x = height of the letter h

def svg(paths, bb, fg, bg=None, pad=X, square=False, title='Arts to Hearts Project'):
    l, t, r, b = bb; w, h = r - l, b - t
    if square:
        side = max(w, h) + 2 * pad; ox = l - (side - w) / 2; oy = t - (side - h) / 2; vw = vh = side
    else:
        ox, oy, vw, vh = l - pad, t - pad, w + 2 * pad, h + 2 * pad
    rect = f'<rect x="{ox:.2f}" y="{oy:.2f}" width="{vw:.2f}" height="{vh:.2f}" fill="{bg}"/>' if bg else ''
    body = ''.join(f'<path d="{p}"/>' for p in paths)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{ox:.2f} {oy:.2f} {vw:.2f} {vh:.2f}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{rect}<g fill="{fg}">{body}</g></svg>')

os.makedirs(OUT, exist_ok=True)
SETS = [  # name, fg, bg
    ('burgundy-on-cream', 'burgundy', 'cream'), ('peony-on-burgundy', 'peony', 'burgundy'),
    ('ballet-on-chilli', 'ballet', 'chilli'), ('burgundy-on-peony', 'burgundy', 'peony'),
    ('burgundy', 'burgundy', None), ('peony', 'peony', None), ('ballet', 'ballet', None), ('chilli', 'chilli', None),
]
made = []
for kind, fn in [('logo', lambda: wordmark(True)), ('logo-no-project', lambda: wordmark(False)), ('logo-stacked', stacked)]:
    p, bb = fn()
    for n, fg, bg in SETS:
        f = f'{kind}_{n}.svg'; open(os.path.join(OUT, f), 'w').write(svg(p, bb, COLOURS[fg], COLOURS[bg] if bg else None)); made.append(f)
p, bb = monogram()
for n, fg, bg in [('ballet-on-chilli', 'ballet', 'chilli'), ('peony-on-burgundy', 'peony', 'burgundy'), ('burgundy-on-cream', 'burgundy', 'cream'), ('burgundy', 'burgundy', None)]:
    f = f'monogram_{n}.svg'; open(os.path.join(OUT, f), 'w').write(svg(p, bb, COLOURS[fg], COLOURS[bg] if bg else None, pad=0.32 * S, square=True, title='AtH')); made.append(f)
p, bb = favicon_t()
for n, fg, bg in [('ballet-on-chilli', 'ballet', 'chilli'), ('peony-on-burgundy', 'peony', 'burgundy')]:
    f = f'favicon_{n}.svg'; open(os.path.join(OUT, f), 'w').write(svg(p, bb, COLOURS[fg], COLOURS[bg], pad=0.2 * S, square=True, title='Arts to Hearts')); made.append(f)
json.dump({'files': made, 'project_font': os.path.basename(FONTS['project'])}, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
print(len(made), 'files; PROJECT font:', os.path.basename(FONTS['project']))
