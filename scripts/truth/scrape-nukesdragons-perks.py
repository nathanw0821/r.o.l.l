#!/usr/bin/env python3
"""Snapshot every Fallout 76 perk card (name, SPECIAL, level, top-rank cost, per-rank text)
from the Nukes & Dragons database, which mirrors the in-game card strings.
Usage: python3 scripts/truth/scrape-nukesdragons-perks.py [out.json] [--cache DIR]
Polite: one request per second, ~270 pages (about 5 minutes). Re-run after every game patch,
then `python3 scripts/truth/diff-perks.py` and fix src/data/perk-cards.json to match."""
import html, json, os, re, sys, time, urllib.request, datetime

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/128 Safari/537.36"
BASE = "https://nukesdragons.com/fallout-76/db/perks"
args = [a for a in sys.argv[1:] if not a.startswith("--")]
OUT = args[0] if args else "src/data/truth/perk-reference-nukesdragons.json"
CACHE = sys.argv[sys.argv.index("--cache") + 1] if "--cache" in sys.argv else None
if CACHE: os.makedirs(CACHE, exist_ok=True)

def get(url, cache_name=None):
    p = os.path.join(CACHE, cache_name) if CACHE and cache_name else None
    if p and os.path.exists(p) and os.path.getsize(p) > 1000:
        return open(p, encoding="utf-8", errors="ignore").read()
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    s = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
    if p: open(p, "w", encoding="utf-8").write(s)
    time.sleep(1.0)
    return s

def text(x): return html.unescape(re.sub(r"<[^>]+>", "", x)).strip()
SPECIALS = "strength|perception|endurance|charisma|intelligence|agility|luck|legendary"

def parse(slug, s):
    d = {"slug": slug}
    m = re.search(r"<title>Fallout 76 (.*?) Builds", s); d["name"] = html.unescape(m.group(1)) if m else slug
    m = re.search(r'data-testid="card:perk:[^"]+"', s)
    sp = re.findall(rf"\b({SPECIALS})\b", s[max(0, m.start() - 400):m.start()]) if m else []
    d["special"] = sp[-1].capitalize() if sp else None
    m = re.search(r"unlocked at level\s*(?:<[^>]+>\s*)*(\d+)", s); d["level"] = int(m.group(1)) if m else None
    m = re.search(r"costs\s*(?:<[^>]+>\s*)*(\d+)\s*(?:<[^>]+>\s*)*(?:Strength|Perception|Endurance|Charisma|Intelligence|Agility|Luck)\s*(?:<[^>]+>\s*)*points?", s)
    d["topCost"] = int(m.group(1)) if m else None
    ranks = []
    sec = re.search(r'<section id="ranks".*?</section>', s, flags=re.S)
    if sec:
        sec = sec.group(0)
        starts = [x.start() for x in re.finditer(rf'<div class="(?:{SPECIALS}) w-\[180px\]', sec)]
        for k, st in enumerate(starts):
            chunk = sec[st:starts[k + 1] if k + 1 < len(starts) else len(sec)]
            m = re.search(r'">\s*<div>(.*?)</div><div class="flex gap-1">', chunk, flags=re.S)
            if m: ranks.append({"rank": chunk.count("i-fa6-solid:star"), "description": text(m.group(1))})
    if not ranks:
        m = re.search(r'data-testid="card:perk:[^"]+".*?<p><!----><!--\[-->(.*?)<!--\]--></p>', s, flags=re.S)
        if m: ranks = [{"rank": 1, "description": text(m.group(1))}]
    d["ranks"] = sorted(ranks, key=lambda r: r["rank"])
    return d

index = get(BASE, "index.html")
slugs = sorted(set(re.findall(r"/fallout-76/db/perks/([a-z0-9\-]+)", index)))
print(f"{len(slugs)} perks", file=sys.stderr)
perks = []
for i, slug in enumerate(slugs, 1):
    try:
        perks.append(parse(slug, get(f"{BASE}/{slug}", f"{slug}.html")))
        print(f"{i}/{len(slugs)} {slug}", file=sys.stderr)
    except Exception as e:
        print(f"ERR {slug}: {e}", file=sys.stderr)
out = {"source": BASE, "fetchedAt": datetime.date.today().isoformat(), "perks": perks}
json.dump(out, open(OUT, "w"), indent=1, ensure_ascii=False); open(OUT, "a").write("\n")
print(f"wrote {OUT} ({len(perks)} perks)", file=sys.stderr)
