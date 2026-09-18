#!/usr/bin/env python3
"""Check src/data/perk-cards.json against the dated in-game reference snapshot.
The comparison itself lives in src/lib/perks/perk-reference.test.ts (one source of truth);
this wrapper just runs that test. Re-scrape the snapshot with scrape-nukesdragons-perks.py first."""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.exit(subprocess.call(["npx", "vitest", "run", "src/lib/perks/perk-reference.test.ts"], cwd=ROOT))
