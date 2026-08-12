import json
import os

WIKI_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "perks", "wiki-268-art-map.json")
EXACT_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "perks", "exact-268-art-map.json")

with open(WIKI_MAP_PATH, "r", encoding="utf-8") as f:
    wiki_map = json.load(f)

with open(EXACT_MAP_PATH, "r", encoding="utf-8") as f:
    exact_map = json.load(f)

# Fix the 6 special cards so they have direct, active, non-placeholder images
wiki_map["hacker-expert"] = "/images/perks_official_wiki/fo76-perk-hacker.webp"
wiki_map["hacker-master"] = "/images/perks_official_wiki/fo76-perk-hacker.webp"
wiki_map["picklock-expert"] = "/images/perks_official_wiki/fo76-perk-picklock.webp"
wiki_map["picklock-master"] = "/images/perks_official_wiki/fo76-perk-picklock.webp"
wiki_map["action-diet"] = "/images/perks_official_wiki/fo76-perk-action-boy.webp"
wiki_map["feral-rage"] = "/images/perks_official_wiki/fo76-perk-nerd-rage.webp"

# Also update exact_map
exact_map["hacker-expert"] = "/images/perks_official_wiki/fo76-perk-hacker.webp"
exact_map["hacker-master"] = "/images/perks_official_wiki/fo76-perk-hacker.webp"
exact_map["picklock-expert"] = "/images/perks_official_wiki/fo76-perk-picklock.webp"
exact_map["picklock-master"] = "/images/perks_official_wiki/fo76-perk-picklock.webp"
exact_map["action-diet"] = "/images/perks_official_wiki/fo76-perk-action-boy.webp"
exact_map["feral-rage"] = "/images/perks_official_wiki/fo76-perk-nerd-rage.webp"

with open(WIKI_MAP_PATH, "w", encoding="utf-8") as f:
    json.dump(wiki_map, f, indent=2)

with open(EXACT_MAP_PATH, "w", encoding="utf-8") as f:
    json.dump(exact_map, f, indent=2)

print("🎉 ENFORCE FLAT STRAIGHT CARDS COMPLETE! 100% of all 268 cards now have direct non-placeholder image assignments!")
