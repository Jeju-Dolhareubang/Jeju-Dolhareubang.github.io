#!/usr/bin/env python3
"""Give small text Pretendard for Hangul (Latin stays Montserrat).

Every rule in assets/css/style.css whose font-size is a plain px value of
16px or less, or a fit-scaled value whose base is 16px or less
(max(calc(N*var(--px)),14px) with N <= 16), sets
    --ff:var(--font-small)
(an inherited property read by `body *{font-family:var(--ff,...)}`, so
children that only inherit the small size follow it too); larger font-size
rules reset it (--ff:initial). Explicit ONE Mobile body-copy rules read
var(--ff,"ONE Mobile",...) so they follow the same switch. Small rules are skipped when they already set a font-family without "ONE Mobile" in it
(Roboto Mono labels, Pretendard specimens, etc. keep their face).
ONE Mobile has no small-size hinting and smears below ~16px; Pretendard is
built for UI text. Running it twice is safe.
"""
import re, sys

LIMIT = 16
PX = re.compile(r'^\s*(\d*\.?\d+)px\s*(!important)?\s*$')
FIT = re.compile(r'^\s*max\(calc\((\d*\.?\d+)\*var\(--px\)\),\s*\d+px\)\s*(!important)?\s*$')

def sizes(v):
    """base sizes in a font-size value: N of calc(N*var(--x)) and plain Npx"""
    v = v.replace('!important', '')
    if re.search(r'(vw|vh|em|%|clamp)', v):
        return None
    ns = [float(x) for x in re.findall(r'calc\((\d*\.?\d+)\*var\(', v)]
    rest = re.sub(r'calc\([^()]*\)', '', v)
    ns += [float(x) for x in re.findall(r'(\d*\.?\d+)px', rest)]
    return ns or None

def small(v):
    ns = sizes(v)
    return bool(ns) and max(ns) <= LIMIT

def conv_block(body):
    decls = [d for d in body.split(';')]
    fs = None; ff = None
    for d in decls:
        if ':' not in d: continue
        k, v = d.split(':', 1); k = k.strip().lower()
        if k == 'font-size': fs = v
        if k == 'font-family': ff = v
    if fs is None or '--ff' in body:
        return body
    b = body.rstrip(); tail = body[len(b):]
    sep = '' if b.endswith(';') or not b else ';'
    if not small(fs):
        # larger text resets the inherited face so it never picks up a parent's small face
        return b + sep + '--ff:initial' + tail
    if ff is not None and 'ONE Mobile' not in ff:
        return body
    add = '--ff:var(--font-small)' + ('' if ff is None else ';font-family:var(--font-small)!important')
    return b + sep + add + tail

def run(src):
    out, buf, stack, i, n = [], '', [], 0, len(src)
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
            pre = re.sub(r'/\*.*?\*/', '', prelude, flags=re.S).strip()
            out.append(buf if pre.startswith('@') or re.match(r'^(from|to|\d+%)', pre) else conv_block(buf))
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
