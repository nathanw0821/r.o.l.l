#!/usr/bin/env python3
"""Diff src/data/perk-cards.json against the dated Nukes & Dragons reference snapshot.
Usage: python3 scripts/truth/diff-perks.py  (prints discrepancies; exit 1 if any)
Re-scrape the snapshot with scripts/truth/scrape-nukesdragons-perks.py after a game patch."""
import json, re, html, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
cards = json.load(open(os.path.join(ROOT, "src/data/perk-cards.json")))
ref = json.load(open(os.path.join(ROOT, "src/data/truth/perk-reference-nukesdragons.json")))["perks"]
SP = {"S": "Strength", "P": "Perception", "E": "Endurance", "C": "Charisma", "I": "Intelligence", "A": "Agility", "L": "Luck", "LEGENDARY": "Legendary"}
def norm(t): return re.sub(r"\s+", " ", html.unescape(t or "").replace("’", "'").replace("“", '"').replace("”", '"').replace("–", "-").replace("—", "-")).strip()
def key(n): return re.sub(r"\s+", " ", norm(n).lower().replace("!", "").replace(".", "").replace("'", "").replace("-", " ").replace("/", " ")).strip()
byk = {key(r["name"]): r for r in ref}
bad = 0
for c in cards:
    r = byk.get(key(c["name"]))
    if not r: print(f"{c['name']}: not in reference"); bad += 1; continue
    if r["special"] and SP.get(c["special"]) != r["special"]: print(f"{c['name']}: special {c['special']} vs {r['special']}"); bad += 1
    if c["special"] != "LEGENDARY" and r["level"] is not None and c["minLevel"] != r["level"]: print(f"{c['name']}: level {c['minLevel']} vs {r['level']}"); bad += 1
    if len(c["ranks"]) != len(r["ranks"]): print(f"{c['name']}: ranks {len(c['ranks'])} vs {len(r['ranks'])}"); bad += 1
    for rk in c["ranks"]:
        m = [x for x in r["ranks"] if x["rank"] == rk["rank"]]
        if not m or norm(m[0]["description"]) != norm(rk["description"]):
            print(f"{c['name']} r{rk['rank']}:\n  site: {rk['description']}\n  game: {m[0]['description'] if m else '<none>'}"); bad += 1
print(f"{len(cards)} cards checked, {bad} discrepancies")
sys.exit(1 if bad else 0)
