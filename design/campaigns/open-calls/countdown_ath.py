"""Deadline posts for the three live open calls, in the fixed ATH open-call system.
Templates: countdown (ink), last call (orange), closing soon (cream, all calls), countdown story.
The call card on each post mirrors the website listing (image, name, ENDING IN X DAYS, date).
Usage: python3 countdown.py -> deadlines-ath/*.png
"""
import json, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'deadlines-ath'
OUT.mkdir(exist_ok=True)
BURG, NIGHT, PEONY, CREAM, CHILLI, INK = '#6A0620', '#52051A', '#FAD2E1', '#F9EEE5', '#AA0003', '#1C1310'
INK_TXT = INK
ORANGE = BURG
LOGO = (HERE / 'art' / 'logo-open-calls.svg').read_text().replace('viewBox="-78.00 -156.47 750.45 302.01"', 'viewBox="-2 -84 600 156"')
ARR = '<svg viewBox="0 0 24 24" width="{s}" height="{s}"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

# The three live calls, as listed on apply.artstoheartsproject.com on 12 Nov 2026
CALLS = {
    'aoty': dict(name='Artist of the Year 2026', short='Artist of the Year', img='call-aoty.jpg', pos='50% 40%', date='16 Nov 2026',
                 perks='$500 · Trophy · Book feature', kw='NOMINATE', days_now=4),
    'women': dict(name='Woman Artist Award · 7th', short='Woman Artist Award', img='call-women.jpg', pos='50% 40%', date='30 Nov 2026',
                  perks='$500 · Book feature · WIA membership', kw='AWARD', days_now=19),
    'garden': dict(name='101 Art Book · Garden', short='Garden Edition', img='call-garden.jpg', pos='50% 35%', date='13 Dec 2026',
                   perks='$500 · 4-page spread · Trophy', kw='GARDEN', days_now=32),
}


def arr(s=30):
    return ARR.replace('{s}', str(s))


def frame(fg, label, series, right='Swipe', accent=None, h=1350):
    r = f'<span class="pill fr" style="color:{fg};border-color:{fg}">{right} {arr(26)}</span>' if right else ''
    return (f'<p class="lab" style="color:{accent or fg}">[&nbsp;&nbsp;{label}&nbsp;&nbsp;]</p>'
            f'<p class="ser" style="color:{fg}">{series}</p><div class="brand" style="color:{fg}">{LOGO}</div>{r}')


def kwpill(kw, bg, fg, size=30):
    return f'<span class="kw" style="background:{bg};color:{fg};font-size:{size}px">Comment <b>{kw}</b> {arr(size + 4)}</span>'


def card(c, top, kwbg=BURG, kwfg=CREAM, days=None):
    """The website listing card, shrunk: image, name, ending pill, date, perks, keyword."""
    d = c['days_now'] if days is None else days
    ending = 'ENDS TONIGHT' if d == 0 else ('ENDS TOMORROW' if d == 1 else f'ENDING IN {d} DAYS')
    return f'''<div class="a" style="left:72px;right:72px;top:{top}px;background:{CREAM};border-radius:28px;padding:22px;display:flex;gap:28px;color:{INK}">
  <div style="width:300px;height:262px;border-radius:18px;background:url(art/{c['img']}) {c['pos']}/cover;flex:none"></div>
  <div style="display:flex;flex-direction:column;justify-content:space-between;padding:6px 6px 4px 0;min-width:0">
    <div><span style="display:inline-block;background:{PEONY};color:#6A0620;font:700 19px/1 Inter;letter-spacing:.1em;padding:10px 14px;border-radius:999px">{ending}</span>
    <p class="g" style="font-size:44px;margin-top:18px;letter-spacing:-.03em">{c['name']}</p>
    <p style="font:400 23px/1.3 Inter;margin-top:10px;opacity:.75">{c['perks']}</p></div>
    {kwpill(c['kw'], kwbg, kwfg, 24)}
  </div></div>'''


CSS = '''
@font-face{font-family:IS;src:url(fonts/InstrumentSerif-Regular.ttf)}
@font-face{font-family:IS;font-style:italic;src:url(fonts/InstrumentSerif-Italic.ttf)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#999;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}
.s{position:relative;width:1080px;height:1350px;overflow:hidden;margin-bottom:30px}.s.story{height:1920px}
.a{position:absolute}
.lab{position:absolute;left:72px;top:72px;font:600 21px/1 Inter;letter-spacing:.18em;text-transform:uppercase}
.ser{position:absolute;right:72px;top:72px;font:500 21px/1 Inter}
.brand{position:absolute;left:72px;bottom:70px}.brand svg{height:44px;width:auto;display:block}
.pill{display:inline-flex;align-items:center;gap:12px;height:60px;padding:0 26px;border:2px solid;border-radius:12px;font:600 21px/1 Inter;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.fr{position:absolute;right:72px;bottom:62px}
.kw{display:inline-flex;align-items:center;gap:14px;height:2.7em;padding:0 1.1em;border-radius:12px;font-family:Inter;font-weight:500;white-space:nowrap;align-self:flex-start}
.kw b{font-weight:700;letter-spacing:.05em}
.g{font-family:IS,Georgia,serif;font-weight:400;letter-spacing:-.02em;line-height:.92}
.g em,.it{font-family:IS;font-style:italic;font-weight:400;letter-spacing:-.01em}
'''
S = []


def post(name, bg, html, story=False):
    S.append((name, f'<section class="s{" story" if story else ""}" id="{name}" style="background:{bg}">{html}</section>'))


def countdown(cid, days):
    c = CALLS[cid]
    post(f'{cid}-{days}days', BURG, f'''
{frame(CREAM, 'Deadline', c['short'], right='Link in bio', accent=PEONY)}
<p class="g a" style="left:52px;top:110px;font-size:600px;color:{CREAM}">{days}</p>
<p class="it a" style="left:{90 + 300 * len(str(days))}px;top:450px;font-size:190px;color:{PEONY}">days</p>
<p class="g a" style="left:72px;right:72px;top:690px;font-size:84px;color:{CREAM}">left to apply to <em style="color:{PEONY}">{c['short']}.</em></p>
{card(dict(c, days_now=days), 900)}
''')


def lastcall(cid):
    c = CALLS[cid]
    post(f'{cid}-lastcall', PEONY, f'''
{frame(BURG, 'Last call', c['short'], right='Link in bio')}
<div class="a" style="right:72px;top:150px;width:210px;height:210px;border-radius:50%;background:{CHILLI};color:{CREAM};display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-10deg)"><b style="font:italic 400 64px/.9 IS">Last</b><span style="font:600 18px/1.2 Inter;letter-spacing:.14em;margin-top:6px">CALL</span></div>
<p class="g a" style="left:62px;right:300px;top:170px;font-size:210px;color:{BURG}">Closes <em>tonight.</em></p>
<p class="a" style="left:72px;right:72px;top:640px;font:400 40px/1.35 Inter;color:{BURG}">Your last chance to enter {c['short']}. One artwork is enough.</p>
{card(dict(c, days_now=0), 900)}
''')


# 1 Artist of the Year: 4 days left (today), then last call
countdown('aoty', 4)
lastcall('aoty')
# 2 Woman Artist Award at 10 days
countdown('women', 10)

# 3 Closing soon: all three live calls in one post, ordered by deadline
rows = ''.join(f'''<div style="display:flex;gap:26px;align-items:center;padding:22px 0;border-top:2px solid {BURG}">
  <div style="width:210px;height:150px;border-radius:16px;background:url(art/{c['img']}) {c['pos']}/cover;flex:none"></div>
  <div style="flex:1;min-width:0"><span style="display:inline-block;background:{PEONY};color:#6A0620;font:700 17px/1 Inter;letter-spacing:.1em;padding:9px 12px;border-radius:999px">ENDING IN {c['days_now']} DAYS</span>
    <p class="g" style="font-size:42px;margin-top:12px;letter-spacing:-.03em">{c['name']}</p>
    <p style="font:400 21px/1.3 Inter;margin-top:6px;opacity:.75">{c['perks']}</p></div>
  <span style="font:700 21px/1 Inter;letter-spacing:.06em;white-space:nowrap;color:{BURG}">{c['kw']} →</span></div>''' for c in CALLS.values())
post('closing-soon', CREAM, f'''
{frame(BURG, 'Open calls', 'Closing soon', right='Save this')}
<h2 class="g a" style="left:66px;right:72px;top:150px;font-size:124px;color:{BURG}">3 open calls. <em>Which one is yours?</em></h2>
<div class="a" style="left:72px;right:72px;top:450px;color:{INK};border-bottom:2px solid {BURG}">{rows}</div>
<p class="a" style="left:72px;top:1180px;font:500 24px/1.3 Inter;color:{BURG}">Comment the call's word and we'll DM you the details.</p>
''')

# 4 Countdown story (1080 x 1920)
c = CALLS['aoty']
post('aoty-4days-story', BURG, f'''
<p class="lab" style="color:{PEONY};top:150px">[&nbsp;&nbsp;Deadline&nbsp;&nbsp;]</p><p class="ser" style="color:{CREAM};top:150px">{c['short']}</p>
<p class="g a" style="left:52px;top:240px;font-size:640px;color:{CREAM}">4</p>
<p class="it a" style="left:420px;top:600px;font-size:210px;color:{PEONY}">days</p>
<p class="g a" style="left:72px;right:72px;top:880px;font-size:84px;color:{CREAM}">left to apply to <em style="color:{PEONY}">{c['short']}.</em></p>
{card(c, 1150)}
<p class="a" style="left:0;right:0;top:1520px;text-align:center;font:500 30px/1 Inter;color:{CREAM}">Tap the link to apply</p>
''', story=True)


# ---- ESCALATION for one call (Garden): burgundy at 10 days, ink for the final week ----
def countdown_on(cid, days, bg, name):
    c = CALLS[cid]
    post(name, bg, f"""
{frame(CREAM, 'Deadline', c['short'], right='Link in bio', accent=PEONY)}
<p class="g a" style="left:52px;top:110px;font-size:600px;color:{CREAM}">{days}</p>
<p class="it a" style="left:{90 + 300 * len(str(days))}px;top:450px;font-size:190px;color:{PEONY}">{'day' if days == 1 else 'days'}</p>
<p class="g a" style="left:72px;right:72px;top:690px;font-size:84px;color:{CREAM}">left to apply to <em style="color:{PEONY}">{c['short']}.</em></p>
{card(dict(c, days_now=days), 900)}
""")


def words_on(cid, name, big, small, days, sticker=False):
    c = CALLS[cid]
    st = (f'<div class="a" style="right:72px;top:150px;width:210px;height:210px;border-radius:50%;background:{CHILLI};color:{CREAM};display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-10deg)">'
          f'<b style="font:italic 400 64px/.9 IS">Last</b><span style="font:600 18px/1.2 Inter;letter-spacing:.14em;margin-top:6px">CALL</span></div>') if sticker else ''
    post(name, INK, f"""
{frame(CREAM, 'Last call' if sticker else 'Deadline', c['short'], right='Link in bio', accent=PEONY)}
{st}
<p class="g a" style="left:62px;right:300px;top:170px;font-size:210px;color:{CREAM}">{big}</p>
<p class="a" style="left:72px;right:72px;top:640px;font:400 40px/1.35 Inter;color:{CREAM};opacity:.9">{small}</p>
{card(dict(c, days_now=days), 900)}
""")


countdown_on('garden', 10, BURG, 'esc-1-day21-10days')
countdown_on('garden', 7, INK, 'esc-2-day24-7days')
countdown_on('garden', 3, INK, 'esc-3-day27-3days')
words_on('garden', 'esc-4-day29-tomorrow', 'Closes <em style="color:#FAD2E1">tomorrow.</em>', 'One artwork is enough. Comment GARDEN and we\'ll DM you the link.', 1)
words_on('garden', 'esc-5-day30-lastcall', 'Closes <em style="color:#FAD2E1">tonight.</em>', 'Your last chance to be one of the 101 in the Garden Edition.', 0, sticker=True)

(HERE / 'deadlines-ath.html').write_text(f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{"".join(h for _, h in S)}</body></html>')
(HERE / '.shot8.cjs').write_text(f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:1080,height:1350}}}});
await p.goto('file://{HERE}/deadlines-ath.html');await p.evaluate(()=>document.fonts.ready);
for(const id of {json.dumps([n for n, _ in S])}){{await p.locator('[id="'+id+'"]').screenshot({{path:'{OUT}/'+id+'.png'}});}}await b.close();}})();""")
subprocess.run(['node', str(HERE / '.shot8.cjs')], check=True, cwd='/tmp')
print('rendered', len(S))
