#!/usr/bin/env python3
"""Sync the shared header/footer (partials/) into every page.

Edit partials/header.html or partials/footer.html, then run:
    python3 tools/sync-partials.py
Each page keeps static HTML; the generated blocks sit between
<!-- @header --> ... <!-- @end header --> (and the same for footer).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = {
    'index.html': 'home',
    'about.html': 'about',
    'how-i-work.html': 'how',
    'work/task.html': 'work',
    'work/neople-developers.html': 'work',
    'work/dnf-cms.html': 'work',
    'work/media-insight.html': 'work',
    'work/cyphers.html': 'work',
}
TAG_ATTR = {'about.html': 'data-cta-text'}  # about animates the footer line itself


def render(tpl, page, current):
    root = '../' if page.startswith('work/') else ''
    out = tpl.replace('{{root}}', root)
    for key in ('home', 'work', 'about', 'how'):
        out = out.replace('{{cur_%s}}' % key, ' is-current' if key == current else '')
    return out.replace('{{tag_attr}}', TAG_ATTR.get(page, 'data-reveal'))


def put(html, name, tag_re, block):
    marked = '<!-- @%s -->\n%s\n<!-- @end %s -->' % (name, block, name)
    pat = re.compile(r'<!-- @%s -->.*?<!-- @end %s -->' % (name, name), re.S)
    if pat.search(html):
        return pat.sub(lambda m: marked, html, count=1)
    return re.sub(tag_re, lambda m: marked, html, count=1, flags=re.S)


def main():
    header = (ROOT / 'partials/header.html').read_text(encoding='utf-8').strip()
    footer = (ROOT / 'partials/footer.html').read_text(encoding='utf-8').strip()
    for page, current in PAGES.items():
        path = ROOT / page
        html = path.read_text(encoding='utf-8')
        new = put(html, 'header', r'<header class="gnb">.*?</header>', render(header, page, current))
        new = put(new, 'footer', r'<footer.*?</footer>', render(footer, page, current))
        if new != html:
            path.write_text(new, encoding='utf-8')
            print('updated', page)
        else:
            print('ok     ', page)


if __name__ == '__main__':
    main()
