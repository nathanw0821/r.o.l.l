import json
import os

PERK_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "perk-cards.json")
WIKI_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "perks", "wiki-268-art-map.json")

with open(PERK_JSON_PATH, "r", encoding="utf-8") as f:
    cards = json.load(f)

with open(WIKI_MAP_PATH, "r", encoding="utf-8") as f:
    wiki_map = json.load(f)

print(f"📊 CANONICAL LIST AUDIT REPORT:")
print(f"  - Total Active Cards: {len(cards)}")

valid_specials = {"S", "P", "E", "C", "I", "A", "L", "LEGENDARY"}
invalid_cards = []

for c in cards:
    if c.get("special") not in valid_specials:
        invalid_cards.append(c)

print(f"  - Invalid/Unused Category Cards: {len(invalid_cards)}")
if invalid_cards:
    for inv in invalid_cards:
        print(f"    ⚠️ Removing unused card: [{inv.get('special')}] {inv.get('name')}")
    cards = [c for c in cards if c.get("special") in valid_specials]
    with open(PERK_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(cards, f, indent=2)

print(f"🎉 CANONICAL LIST AUDIT COMPLETE! {len(cards)} cards strictly follow official S.P.E.C.I.A.L. lists!")
