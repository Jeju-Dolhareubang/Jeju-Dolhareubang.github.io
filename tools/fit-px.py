#!/usr/bin/env python3
"""Rewrite px lengths in assets/css/style.css so the desktop layout scales with
the screen width (2560px = 1:1, see --px in the stylesheet head).

  40px                 -> calc(40*var(--px))
  font-size:16px       -> max(calc(16*var(--px)),14px)   (text never drops below 14px)
  font-size:13px       -> 13px                            (small text is left alone)
  line-height:24px     -> 1.5  when the same rule sets a px font-size

Values of 2px or less (hairlines), media-query conditions, url() contents and
the GNB/menu, cursor, office-guide widget and any rule preceded by a
/* no-fit */ comment are left untouched. Running it twice is safe:
already-converted values are skipped.
"""
import re, sys

FLOOR = 14
# chrome that keeps a fixed size on every screen
SKIP = re.compile(r'office-guide|og-|\.gnb|\.menu|\.cursor|/\* *no-fit *\*/')
PX = re.compile(r'(?<![\w.#*-])(-?\d*\.?\d+)px\b')

def conv_px(v):
    def rep(m):
        n = float(m.group(1))
        if abs(n) <= 2: return m.group(0)
        return 'calc(%s*var(--px))' % m.group(1)
    # mask url(...)
    parts = re.split(r'(url\([^)]*\))', v)
    return ''.join(p if p.startswith('url(') else PX.sub(rep, p) for p in parts)

def conv_block(body):
    # split into declarations, respecting url() and strings
    decls, buf, depth, q = [], '', 0, None
    for ch in body:
        if q:
            buf += ch
            if ch == q: q = None
            continue
        if ch in '"\'': q = ch
        elif ch == '(': depth += 1
        elif ch == ')': depth -= 1
        if ch == ';' and depth == 0:
            decls.append(buf); buf = ''
        else: buf += ch
    decls.append(buf)
    fs = None
    for d in decls:
        m = re.match(r'\s*font-size\s*:\s*(\d*\.?\d+)px\s*(!important)?\s*$', d)
        if m: fs = float(m.group(1))
    out = []
    for d in decls:
        if ':' not in d or 'var(--px)' in d:
            out.append(d); continue
        prop, val = d.split(':', 1)
        p = prop.strip().lower()
        imp = ''
        mi = re.search(r'\s*!important\s*$', val)
        if mi: imp = '!important'; val = val[:mi.start()]
        lead = val[:len(val) - len(val.lstrip())]
        v = val.strip()
        if 'px' not in v:
            out.append(d); continue
        if p == 'font-size':
            nums = [float(x) for x in PX.findall(v)]
            if re.fullmatch(r'\d*\.?\d+px', v) and nums[0] <= FLOOR:
                out.append(d); continue
            floor = min(nums[0], FLOOR)
            nv = 'max(%s,%spx)' % (conv_px(v), ('%g' % floor))
        elif p == 'line-height' and fs and re.fullmatch(r'\d*\.?\d+px', v):
            nv = ('%.4f' % (float(v[:-2]) / fs)).rstrip('0').rstrip('.')
        else:
            nv = conv_px(v)
        out.append('%s:%s%s%s' % (prop, lead, nv, imp))
    return ';'.join(out)

def run(src):
    out, i, n = [], 0, len(src)
    stack = []          # preludes of open blocks
    buf = ''            # text since last { } ;
    start = 0
    while i < n:
        c = src[i]
        if src.startswith('/*', i):
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2
            buf += src[i:j]; i = j; continue
        if c in '"\'':
            j = i + 1
            while j < n and src[j] != c:
                j += 2 if src[j] == '\\' else 1
            buf += src[i:j + 1]; i = j + 1; continue
        if c == '{':
            stack.append(buf); out.append(buf + '{'); buf = ''; i += 1; continue
        if c == '}':
            prelude = stack.pop() if stack else ''
            ctx = ' '.join(stack + [prelude])
            if re.sub(r'/\*.*?\*/','',prelude,flags=re.S).strip().startswith('@') or SKIP.search(ctx):
                out.append(buf)
            else:
                out.append(conv_block(buf))
            out.append('}'); buf = ''; i += 1; continue
        if c == ';' and not stack:
            out.append(buf + ';'); buf = ''; i += 1; continue
        buf += c; i += 1
    out.append(buf)
    return ''.join(out)

if __name__ == '__main__':
    p = sys.argv[1] if len(sys.argv) > 1 else 'assets/css/style.css'
    s = open(p).read()
    open(p, 'w').write(run(s))
