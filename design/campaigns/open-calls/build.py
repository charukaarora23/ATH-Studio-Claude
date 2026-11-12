"""ATH Open Call social system: renders one call's posts from one config.

Change CALL (and pick an EDITION colour pair) to make the posts for any open call.
Everything else (frame, card, tiles, pills, CTA, sticker) stays the same, which is
what makes every call look like ATH while each one still looks different.

Usage: python3 build.py            -> slides/*.png (1080 x 1350, story 1080 x 1920) and slides.html
Needs: Playwright (preinstalled), fonts/InstrumentSerif-*.ttf, Inter installed as a system font.
"""
import json, pathlib, re, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'slides'
OUT.mkdir(exist_ok=True)

# Brand constants (never change per call)
BRAND = dict(burgundy='#6A0620', night='#52051A', cream='#F9EEE5', paper='#FFFBF6',
             ink='#1C1310', peony='#FAD2E1', rose='#FFA1C2', chilli='#AA0003')

# Edition colour pairs: every call gets one deep + one light from the brand palette.
EDITIONS = {
    'garden':    dict(deep='#0B3B36', mid='#025054', light='#D0D996', tint='#EEF0D6'),   # petrol + pistachio
    'pattern':   dict(deep='#52051A', mid='#6A0620', light='#FAD2E1', tint='#FBEAF0'),   # burgundy + peony
    'colors':    dict(deep='#1C1310', mid='#3A2A24', light='#FFF3B2', tint='#FFF8DA'),   # ink + lemon
    'landscape': dict(deep='#4A1A0C', mid='#DD4E28', light='#F9EEE5', tint='#FBEFE6'),   # blood orange + cream
    'portrait':  dict(deep='#2B1030', mid='#52051A', light='#FFA1C2', tint='#FFE6EF'),   # night + hot rose
    'abstract':  dict(deep='#0E2547', mid='#6A0620', light='#B7D9FF', tint='#E6F1FF'),   # sky + burgundy
}

CALL = dict(
    series='101 Art Book', edition_no='16', name='Garden', ed='garden',
    title_pre='101 Art Book', title_word='Garden', title_post='Edition',
    deadline='13 Dec 2026', deadline_long='13 December 2026', results='within 3 weeks',
    award='$500', spots='101', url='artstoheartsproject.com', handle='@artstoheartsproject',
    total=8,
)
E = EDITIONS[CALL['ed']]
C = dict(BRAND, **E)

LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace(
    'viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')

ARROW = '<svg viewBox="0 0 24 24" width="{s}" height="{s}"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
TICK = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'


def arrow(s=34):
    return ARROW.replace('{s}', str(s))


def top(n, fg, total=None):
    total = total or CALL['total']
    return f'''<header class="top" style="color:{fg}"><span class="logo">{LOGO}</span>
{'<span class="count">%02d / %02d</span>' % (n, total) if total > 1 else ''}</header>'''


def foot(fg, right='swipe'):
    r = {'swipe': f'<span class="swipe">Swipe {arrow(30)}</span>',
         'apply': f'<span class="swipe">Apply · link in bio {arrow(30)}</span>',
         'none': ''}[right]
    return f'''<footer class="foot" style="color:{fg}"><span>{CALL['series']} · {CALL['name']} Edition</span>{r}</footer>'''


def pill(text, bg, fg, dot=None, border=None):
    d = f'<i style="background:{dot}"></i>' if dot else ''
    b = f'border:2px solid {border};' if border else ''
    return f'<span class="pill" style="background:{bg};color:{fg};{b}">{d}{text}</span>'


def credit(text, fg):
    return f'<p class="credit" style="color:{fg}">{text}</p>'


def sticker(line1, line2, bg=None, fg=None, x=0, y=0, r=-8):
    return (f'<div class="sticker" style="background:{bg or C["chilli"]};color:{fg or C["cream"]};left:{x}px;top:{y}px;transform:rotate({r}deg)">'
            f'<b>{line1}</b><span>{line2}</span></div>')


def tiles(items, bg, fg, sub):
    return '<div class="tiles">' + ''.join(
        f'<div class="tile" style="background:{bg};color:{fg}"><span style="color:{sub}">{k}</span><b>{v}</b></div>' for k, v in items) + '</div>'


def cta(text, bg, fg):
    return f'<div class="cta" style="background:{bg};color:{fg}">{text}{arrow(40)}</div>'


def call_card(img, pos='50% 40%', h=560, compact=False):
    """THE recurring component: the same card the website listing uses."""
    t = tiles([('Deadline', CALL['deadline']), ('Artists', CALL['spots']), ('Top award', CALL['award'])],
              C['tint'], C['ink'], C['mid'])
    if h:
        head = f'''<div class="card-img" style="height:{h}px;background-image:url(art/{img});background-position:{pos}">
    <div class="card-pills">{pill('Open call', C['light'], C['deep'], dot=C['deep'])}{pill('No. ' + CALL['edition_no'], 'rgba(255,251,246,.22)', C['paper'])}{pill('Worldwide', 'rgba(255,251,246,.22)', C['paper'])}</div>
  </div>'''
        pills = ''
    else:
        head = ''
        pills = f'''<div style="display:flex;gap:10px;margin-bottom:28px">{pill('Open call', C['light'], C['deep'], dot=C['deep'])}{pill('No. ' + CALL['edition_no'], C['tint'], C['deep'])}{pill('Worldwide', C['tint'], C['deep'])}</div>'''
    return f'''{head}
  <div class="card-body">{pills}
    <p class="card-kicker" style="color:{C['mid']}">{CALL['title_pre']}</p>
    <h3 class="card-title" style="color:{C['ink']}">{CALL['title_word']} <em>{CALL['title_post']}</em></h3>
    {t}
    {cta('Apply now · link in bio', C['burgundy'], C['cream'])}
  </div>'''


CSS = f'''
@font-face{{font-family:"Instrument Serif";src:url(fonts/InstrumentSerif-Regular.ttf)}}
@font-face{{font-family:"Instrument Serif";font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#ddd;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}}
.slide{{position:relative;width:1080px;height:1350px;overflow:hidden;margin:0 0 40px}}
.slide.story{{height:1920px}}
.top{{position:absolute;left:72px;right:72px;top:60px;display:flex;justify-content:space-between;align-items:center;z-index:5}}
.logo svg{{height:58px;width:auto;display:block}}
.count{{font:500 26px/1 Inter;letter-spacing:.06em;font-variant-numeric:tabular-nums}}
.foot{{position:absolute;left:72px;right:72px;bottom:56px;display:flex;justify-content:space-between;align-items:center;font:500 25px/1 Inter;letter-spacing:.02em;z-index:5}}
.swipe{{display:flex;align-items:center;gap:12px;font-weight:600}}
.serif{{font-family:"Instrument Serif",serif;font-weight:400;letter-spacing:-.015em;line-height:.95}}
.serif em,.card-title em{{font-style:italic}}
.label{{font:600 24px/1.2 Inter;letter-spacing:.14em;text-transform:uppercase}}
.body{{font:400 34px/1.42 Inter}}
.pill{{display:inline-flex;align-items:center;gap:12px;height:56px;padding:0 26px;border-radius:999px;font:500 25px/1 Inter;white-space:nowrap;backdrop-filter:blur(8px)}}
.pill.lg{{height:66px;font-size:29px;padding:0 30px}}
.pill i{{width:12px;height:12px;border-radius:50%;display:block}}
.tiles{{display:flex;gap:16px}}
.tile{{flex:1;border-radius:24px;padding:24px 26px 22px;display:flex;flex-direction:column;gap:10px}}
.tile span{{font:600 20px/1 Inter;letter-spacing:.12em;text-transform:uppercase}}
.tile b{{font:400 52px/1 "Instrument Serif";letter-spacing:-.01em;white-space:nowrap}}
.cta{{height:104px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;padding:0 40px;font:600 32px/1 Inter}}
.sticker{{position:absolute;width:236px;height:236px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:6}}
.sticker b{{font:400 62px/.9 "Instrument Serif";font-style:italic}}
.sticker span{{font:600 19px/1.2 Inter;letter-spacing:.14em;text-transform:uppercase;margin-top:8px}}
.credit{{position:absolute;right:30px;bottom:120px;writing-mode:vertical-rl;transform:rotate(180deg);font:400 italic 24px/1 "Instrument Serif";letter-spacing:.01em;z-index:5;opacity:.9}}
.bg{{position:absolute;inset:0;background-size:cover}}
.card{{position:absolute;background:{C['paper']};border-radius:40px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.28)}}
.card-img{{position:relative;background-size:cover}}
.card-pills{{position:absolute;left:32px;top:32px;display:flex;gap:10px}}
.card-body{{padding:40px 44px 44px}}
.card-kicker{{font:600 22px/1 Inter;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px}}
.card-title{{font:400 92px/1 "Instrument Serif";letter-spacing:-.015em;margin-bottom:30px}}
.card .tiles{{margin-bottom:22px}}
.list{{list-style:none}}
.list li{{display:flex;gap:26px;align-items:flex-start;padding:26px 0;border-top:2px solid currentColor}}
.list li:last-child{{border-bottom:2px solid currentColor}}
.n{{font:400 44px/1 "Instrument Serif";min-width:64px}}
.li-t{{font:600 32px/1.25 Inter}}
.li-s{{font:400 26px/1.4 Inter;margin-top:6px;opacity:.82}}
'''

S = []


def slide(name, html, bg, story=False):
    S.append((name, f'<section class="slide{" story" if story else ""}" id="{name}" style="background:{bg}">{html}</section>'))


# 01 COVER: art full bleed, scrim into the edition colour, title + status sticker
slide('01-cover', f'''
<div class="bg" style="background-image:url(art/flower-portrait.jpg);background-position:50% 18%;background-size:1080px auto"></div>
<div class="bg" style="background:linear-gradient(180deg,rgba(11,59,54,.55) 0%,rgba(11,59,54,0) 22%,rgba(11,59,54,0) 42%,{C['deep']} 78%)"></div>
{top(1, C['paper'])}
{sticker('Now', 'open', x=780, y=300, r=-10)}
{credit('Artwork: Artist Name, Title', C['paper'])}
<div style="position:absolute;left:72px;right:72px;top:600px">
  {pill('New open call', C['light'], C['deep'], dot=C['deep'])}
  <p class="label" style="color:{C['light']};margin:34px 0 8px">{CALL['series']} · No. {CALL['edition_no']}</p>
  <h1 class="serif" style="color:{C['paper']};font-size:184px">Garden <em>Edition</em></h1>
  <p class="body" style="color:{C['paper']};margin-top:22px;max-width:840px">101 artists, one hardcover book. Open to artists worldwide until <b style="font-weight:600">{CALL['deadline_long']}</b>.</p>
</div>
{foot(C['paper'])}
''', C['deep'])

# 02 PROMISE: the reason to care, with proof numbers
slide('02-promise', f'''
{top(2, C['deep'])}
<div style="position:absolute;left:72px;right:72px;top:230px">
  <p class="label" style="color:{C['mid']}">Why this book</p>
  <h2 class="serif" style="color:{C['deep']};font-size:136px;margin-top:28px">We want to put <em>101 artists</em> on the radar.</h2>
  <p class="body" style="color:{C['ink']};margin-top:40px;max-width:860px">Garden Edition is the sixteenth book in the 101 Art Book series. Your work goes in front of collectors, curators, galleries and art lovers.</p>
</div>
<div style="position:absolute;left:72px;right:72px;top:960px">
{tiles([('Editions in print', '15'), ('Artists published', '1,300+'), ('Since', '2023')], C['tint'], C['deep'], C['mid']).replace('<b>', '<b style="font-size:92px">').replace('padding:', 'padding:')}
</div>
{foot(C['deep'])}
''', C['paper'])

# 03 THEME: what counts, as a pill cloud
subjects = ['Flowers', 'Plants', 'Trees', 'Leaves', 'Butterflies', 'Birds', 'Fruits', 'Seeds', 'Forests',
            'Landscapes', 'Botanical illustration', 'Nature photography', 'Organic patterns', 'Abstract nature',
            'Imagined gardens', 'Mixed media']
cloud = ''.join(pill(s, 'transparent', C['deep'], border=C['deep']).replace('class="pill"', 'class="pill lg"') for s in subjects)
slide('03-theme', f'''
{top(3, C['deep'])}
<div style="position:absolute;left:72px;right:72px;top:210px">
  <p class="label" style="color:{C['deep']}">The theme</p>
  <h2 class="serif" style="color:{C['deep']};font-size:150px;margin-top:26px">What counts as a <em>garden?</em></h2>
  <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:56px">{cloud}</div>
  <p class="serif" style="color:{C['deep']};font-size:64px;line-height:1.05;margin-top:64px">Abstract, remembered or imagined: nature can be your <em>starting point,</em> not your subject.</p>
</div>
{foot(C['deep'])}
''', C['light'])

# 04 VALUE: what selection gives you (card with art on top, list below)
benefits = [
    ('Your work in print', 'A page in a premium hardcover book, alongside 100 other artists from around the world.'),
    ('Certificate of Recognition', 'An official record of your selection for your CV, website and grant applications.'),
    ('Promoted to our community', 'Artist features to our 190,000+ social followers and 100,000+ email subscribers.'),
    ('Sold where readers shop', 'Arts to Hearts Shop, Amazon and Barnes & Noble, plus independent bookstores.'),
]
li = ''.join(f'<li><span class="n" style="color:{C["mid"]}">{i + 1:02d}</span><div><p class="li-t">{t}</p><p class="li-s">{s}</p></div></li>'
             for i, (t, s) in enumerate(benefits))
slide('04-value', f'''
{top(4, C['paper'])}
<div style="position:absolute;left:72px;right:72px;top:170px">
  <h2 class="serif" style="color:{C['paper']};font-size:116px">Selected? <em>Here's what you get.</em></h2>
</div>
<div class="card" style="left:72px;right:72px;top:420px;padding:16px 48px 24px">
  <ul class="list" style="color:{C['ink']}">{li.replace('<li>', f'<li style="border-color:{C["tint"]}">', 1)}</ul>
</div>
{foot(C['paper'])}
''', C['deep'])

# 05 AWARDS: three tiers, brand colours (value = burgundy)
def tier(rank, head, items, bg, fg, sub):
    return (f'<div style="background:{bg};color:{fg};border-radius:28px;padding:34px 40px;display:flex;gap:32px;align-items:center">'
            f'<div style="min-width:250px"><p class="label" style="color:{sub};font-size:20px">{rank}</p>'
            f'<p class="serif" style="font-size:96px;margin-top:8px">{head}</p></div>'
            f'<p style="font:500 28px/1.45 Inter">{items}</p></div>')


slide('05-awards', f'''
{top(5, C['cream'])}
<div style="position:absolute;left:72px;right:72px;top:170px">
  <p class="label" style="color:{C['rose']}">Awards</p>
  <h2 class="serif" style="color:{C['cream']};font-size:120px;margin-top:24px">Three artists get <em>even more.</em></h2>
  <div style="display:flex;flex-direction:column;gap:14px;margin-top:44px">
    {tier('Winner', '$500', 'Cash award · 4-page feature · glass trophy', C['peony'], C['night'], C['burgundy'])}
    {tier('First runner-up', '2 pages', 'Feature in the book · glass trophy', 'rgba(249,238,229,.1)', C['cream'], C['rose'])}
    {tier('Second runner-up', '2 pages', 'Feature in the book · glass trophy', 'rgba(249,238,229,.1)', C['cream'], C['rose'])}
  </div>
  <p class="body" style="color:{C['cream']};font-size:28px;margin-top:34px;opacity:.85">All three also get a certificate, an Arts to Hearts promotional feature and an Artsy artist listing.</p>
</div>
{foot(C['cream'])}
''', C['burgundy'])

# 06 WHO: eligibility checklist + the trust note
who = ['Artists aged 18 and over', 'Open to artists worldwide', 'Emerging, mid-career and established',
       'Self-taught artists welcome', 'Individual artists only', 'No degree, gallery or exhibition history needed']
wl = ''.join(f'<li style="padding:20px 0"><span style="color:{C["mid"]}">{TICK}</span><p class="li-t" style="font-weight:500">{w}</p></li>' for w in who)
slide('06-who', f'''
{top(6, C['deep'])}
<div style="position:absolute;left:72px;right:72px;top:200px">
  <p class="label" style="color:{C['mid']}">Who can apply</p>
  <h2 class="serif" style="color:{C['deep']};font-size:132px;margin-top:24px">If you make it, <em>you can enter.</em></h2>
  <ul class="list" style="color:{C['ink']};margin-top:40px;border-color:{C['tint']}">{wl.replace('<li style="', f'<li style="border-color:{C["tint"]};')}</ul>
  <div style="background:{C['tint']};border-radius:24px;padding:28px 34px;margin-top:30px;font:400 27px/1.45 Inter;color:{C['ink']}">
    <b style="font-weight:600">Original work only.</b> AI-generated art isn't eligible. Work you've shown, published or sold before is welcome if you hold the rights.</div>
</div>
{foot(C['deep'])}
''', C['paper'])

# 07 HOW: four steps, dates first
steps = [('Submit by ' + CALL['deadline'], 'One high-resolution image of your original work.'),
         ('Jury review', 'Every eligible entry goes to the jury once the call closes.'),
         ('Results', 'Announced ' + CALL['results'] + ' of the deadline.'),
         ('In print', 'Your page in the hardcover Garden Edition.')]
sl = ''.join(f'<li style="border-color:rgba(208,217,150,.35)"><span class="n" style="color:{C["light"]}">{i + 1:02d}</span><div><p class="li-t">{t}</p><p class="li-s">{s}</p></div></li>'
             for i, (t, s) in enumerate(steps))
slide('07-how', f'''
<div class="bg" style="background-image:url(art/ref-reid.jpg);height:400px;background-position:50% 50%"></div>
<div class="bg" style="height:400px;background:linear-gradient(180deg,rgba(11,59,54,.5),rgba(11,59,54,0) 40%,{C['deep']} 100%)"></div>
{top(7, C['paper'])}
<p class="credit" style="color:{C['paper']};writing-mode:horizontal-tb;transform:none;left:72px;right:auto;top:340px;bottom:auto">Mary Hiester Reid (1854–1921), detail</p>
<div style="position:absolute;left:72px;right:72px;top:420px">
  <h2 class="serif" style="color:{C['paper']};font-size:120px">How it <em>works</em></h2>
  <ul class="list" style="color:{C['paper']};margin-top:30px">{sl}</ul>
</div>
{foot(C['paper'])}
''', C['deep'])

# 08 END: the call card, the same one the website shows
slide('08-apply', f'''
<div class="bg" style="background:{C['light']}"></div>
{top(8, C['deep'])}
<div class="card" style="left:96px;right:96px;top:160px">{call_card('night-bloom.jpg', '50% 32%', 470)}</div>
<p style="position:absolute;left:0;right:0;top:1196px;text-align:center;font:500 26px/1 Inter;color:{C['deep']}">Save this · Send it to an artist who should apply</p>
{foot(C['deep'], 'none')}
''', C['light'])

# ---- lifecycle extras: same system, different moment ----
slide('m1-story', f'''
<div class="bg" style="background-image:url(art/flower-portrait.jpg);background-position:50% 20%"></div>
<div class="bg" style="background:linear-gradient(180deg,rgba(11,59,54,.5),rgba(11,59,54,0) 20%,rgba(11,59,54,0) 45%,{C['deep']} 70%)"></div>
<header class="top" style="color:{C['paper']};top:120px"><span class="logo">{LOGO}</span></header>
{sticker('Now', 'open', x=760, y=640, r=-10)}
<p class="credit" style="color:#FFFBF6;bottom:auto;top:200px">Artwork: Artist Name, Title</p>
<div class="card" style="left:72px;right:72px;top:1010px">{call_card('night-bloom.jpg', '50% 30%', 0)}</div>
<p style="position:absolute;left:0;right:0;top:1640px;text-align:center;font:500 30px/1 Inter;color:#FFFBF6">Tap the link to apply</p>
''', C['deep'], story=True)

slide('m2-reminder', f'''
{top(1, C['deep'], 1)}
<div style="position:absolute;left:72px;right:72px;top:230px">
  {pill('Garden Edition', C['tint'], C['deep'], dot=C['mid'])}
  <h2 class="serif" style="color:{C['deep']};font-size:300px;margin-top:40px;line-height:.85">10 <em>days</em></h2>
  <p class="serif" style="color:{C['deep']};font-size:96px;margin-top:70px">left to enter the <em>Garden Edition.</em></p>
  <p class="body" style="color:{C['ink']};margin-top:40px;max-width:820px">Submissions close on {CALL['deadline_long']}. One high-resolution image is all you need to start.</p>
</div>
<div style="position:absolute;left:72px;right:72px;top:1110px">{cta('Apply now · link in bio', C['burgundy'], C['cream'])}</div>
{foot(C['deep'], 'none')}
''', C['paper'])

slide('m3-lastcall', f'''
<div class="bg" style="background-image:url(art/night-bloom.jpg);background-position:50% 30%"></div>
<div class="bg" style="background:linear-gradient(180deg,rgba(82,5,26,.35),rgba(82,5,26,.1) 30%,{C['night']} 72%)"></div>
{top(1, C['cream'], 1)}
{sticker('Last', 'call', x=760, y=380, r=8)}
{credit('Artwork: Artist Name, Title', C['cream'])}
<div style="position:absolute;left:72px;right:72px;top:700px">
  <p class="label" style="color:{C['rose']}">Closes tonight · {CALL['deadline']}</p>
  <h2 class="serif" style="color:{C['cream']};font-size:150px;margin-top:22px">Your <em>last chance</em> to be one of 101.</h2>
</div>
<div style="position:absolute;left:72px;right:72px;top:1130px">{cta('Apply now · link in bio', C['cream'], C['night'])}</div>
{foot(C['cream'], 'none')}
''', C['night'])

html = f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>'
(HERE / 'slides.html').write_text(html)

js = f'''
const {{ chromium }} = require('playwright');
(async () => {{
  const b = await chromium.launch();
  const p = await b.newPage({{ viewport: {{ width: 1080, height: 1350 }}, deviceScaleFactor: 1 }});
  await p.goto('file://{HERE}/slides.html');
  await p.evaluate(() => document.fonts.ready);
  for (const id of {json.dumps([n for n, _ in S])}) {{
    await p.locator('[id="' + id + '"]').screenshot({{ path: '{OUT}/' + id + '.png' }});
  }}
  await b.close();
}})();'''
(HERE / '.shot.cjs').write_text(js)
subprocess.run(['node', str(HERE / '.shot.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
