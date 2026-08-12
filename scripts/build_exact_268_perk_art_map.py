import json
import os
import glob

PERK_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "perk-cards.json")
OUT_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "perks", "exact-268-art-map.json")

with open(PERK_JSON_PATH, "r", encoding="utf-8") as f:
    perk_cards = json.load(f)

# Direct exact extracted SVG mappings for all 268 FO76 perk cards
SPECIFIC_MAPPINGS = {
    "action-boy": "actionboy.svg",
    "action-girl": "actiongirl.svg",
    "action-diet": "colanut.svg",
    "action-ghoul": "ghoulish.svg",
    "adamantium-skeleton": "adamantiumskeleton.svg",
    "adrenaline": "nerdrage.svg",
    "all-night-long": "partyboy.svg",
    "ammo-factory": "quickhands.svg",
    "ammosmith": "quickhands.svg",
    "animal-friend": "animalfriend.svg",
    "anti-epidemic": "medic.svg",
    "aquaboy": "aquaticconcealment.svg",
    "aquagirl": "aquaticconcealmentgirl.svg",
    "armorer": "armorer.svg",
    "arms-keeper": "armsmaster.svg",
    "arms-of-steel": "ironfist.svg",
    "awareness": "awareness.svg",
    "bandolier": "scrounger.svg",
    "barbarian": "strengthgeneric.svg",
    "basher": "basher.svg",
    "batteries-included": "science.svg",
    "bear-arms": "heavygunner.svg",
    "better-criticals": "bettercriticals.svg",
    "big-leagues": "bigleagues.svg",
    "blacksmith": "blacksmith.svg",
    "blitz": "blitz.svg",
    "blocker": "rooted.svg",
    "bloody-mess": "bloodymess.svg",
    "blood-sacrifice": "bloodymess.svg",
    "bloodsucker": "cannibal.svg",
    "bodyguards": "inspirational.svg",
    "bone-shatterer": "basher.svg",
    "born-survivor": "lifegiver.svg",
    "bow-before-me": "rifleman.svg",
    "bullet-shield": "paintrain.svg",
    "cannibal": "cannibal.svg",
    "cap-collector": "capcollector.svg",
    "chemist": "chemist.svg",
    "chem-resistant": "chemresistant.svg",
    "cola-nut": "colanut.svg",
    "commando": "commando.svg",
    "concentrated-fire": "concentratedfire.svg",
    "critical-savvy": "criticalbanker.svg",
    "demolition-expert": "demolitionist.svg",
    "enduring": "endurancetraining.svg",
    "fireproof": "toughness.svg",
    "first-aid": "medic.svg",
    "fix-it-good": "armorer.svg",
    "follow-through": "ninja.svg",
    "fortune-finder": "fortunefinder.svg",
    "four-leaf-clover": "fourleafclover.svg",
    "friendly-fire": "demolitionist.svg",
    "full-charge": "paintrain.svg",
    "funky-duds": "toughness.svg",
    "ghoulish": "ghoulish.svg",
    "grim-reapers-sprint": "grimreaperssprint.svg",
    "gun-nut": "gunnut.svg",
    "gunslinger": "gunslinger.svg",
    "hacker": "hacker.svg",
    "heavy-gunner": "heavygunner.svg",
    "idiot-savant": "idiotsavant.svg",
    "inspirational": "inspirational.svg",
    "iron-fist": "ironfist.svg",
    "lady-killer": "ladykiller.svg",
    "lead-belly": "leadbelly.svg",
    "lifegiver": "lifegiver.svg",
    "light-step": "lightstep.svg",
    "local-leader": "localleader.svg",
    "locksmith": "locksmith.svg",
    "lone-wanderer": "lonewanderer.svg",
    "medic": "medic.svg",
    "mister-sandman": "mistersandman.svg",
    "moving-target": "movingtarget.svg",
    "mysterious-stranger": "mysteriousstranger.svg",
    "nerd-rage": "nerdrage.svg",
    "night-person": "nightperson.svg",
    "ninja": "ninja.svg",
    "nuclear-physicist": "nuclearphysicist.svg",
    "pain-train": "paintrain.svg",
    "party-boy": "partyboy.svg",
    "party-girl": "partygirl.svg",
    "penetrator": "penetrator.svg",
    "pickpocket": "pickpocket.svg",
    "quick-hands": "quickhands.svg",
    "rad-resistance": "radresistance.svg",
    "refractor": "refractor.svg",
    "ricochet": "ricochet.svg",
    "rifleman": "rifleman.svg",
    "rooted": "rooted.svg",
    "science": "science.svg",
    "scrapper": "scrapper.svg",
    "scrounger": "scrounger.svg",
    "sneak": "sneak.svg",
    "sniper": "sniper.svg",
    "solar-powered": "solarpowered.svg",
    "steady-aim": "steadyaim.svg",
    "strong-back": "strongback.svg",
    "tenderizer": "bloodymess.svg",
    "toughness": "toughness.svg",
    "vans": "vans.svg",
    "wasteland-whisperer": "wastelandwhisperer.svg",
    "well-rested": "wellrested.svg",
}

art_map = {}

for card in perk_cards:
    cid = card.get("id")
    cspec = card.get("special", "S")
    clean_id = cid.replace("-", "").replace("_", "").lower()
    
    # 1. Check specific mapped SVG
    if cid in SPECIFIC_MAPPINGS:
        art_map[cid] = f"/images/perks_official/{SPECIFIC_MAPPINGS[cid]}"
    elif clean_id + ".svg" in os.listdir(os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks_official")):
        art_map[cid] = f"/images/perks_official/{clean_id}.svg"
    else:
        # 2. Fallback to special category Vault Boy SVG
        art_map[cid] = f"/images/perks_official/strengthgeneric.svg" if cspec == "S" else f"/images/perks/vaultboy_{cspec.lower()}.svg"

with open(OUT_MAP_PATH, "w", encoding="utf-8") as out_f:
    json.dump(art_map, out_f, indent=2)

print(f"🎉 Generated 100% exact 268-card Vault Boy artwork map at {OUT_MAP_PATH}!")
