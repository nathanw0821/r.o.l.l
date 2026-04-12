# Nukes & Dragons share URL — R.O.L.L. notes

Reference: [Nukes & Dragons — Fallout 76 character planner](https://nukesdragons.com/fallout-76/character).

This document describes what **R.O.L.L. actually implements** today versus what still needs **reverse engineering**. Automated tests live in `src/lib/builder/nukes-dragons-import.test.ts` (`npm run test`).

---

## One Share URL, several parallel payloads

N&D packs **different UI surfaces** into separate query keys. They are **not** the same as the two-letter keys inside `p=`:

| Query | Planner UI (roughly) | R.O.L.L. today |
|-------|----------------------|----------------|
| `p=` | Normal perk cards (SPECIAL columns × slots × rank) | Parsed; partial `ND_PERK_TABLE` → **unknownCodes** = slot keys we have no math for yet |
| `s=` | Allocated SPECIAL | Parsed hex → scaling for mapped perks |
| `lp=` | **Legendary perks** row (e.g. `x94`… = card + rank) | **Not** parsed; importer warns if present |
| `ef=` | **Mutations**, Ghoul / Glow / team **switchboard** toggles, etc. | **Not** parsed; use builder **Character state** for sandbox mutations |
| `cd=` | Extra packed planner / character state | **Not** parsed; importer warns if present |

So a long list like `sd`, `su`, `sp`, … under “not in table” refers only to **`p=` regular perk slots**, not to legendary cards or mutation cards (those ride in **`lp=`** / **`ef=`**, not as entries in `unknownCodes`).

---

## `p=` — standard perk string (implemented)

**Not** a generic `[TwoLetterPerkId][Rank]` stream. N&D encodes one letter per **SPECIAL tree** (`s|p|e|c|i|a|l`), then one **slot id** character (`[a-z0-9]`), then **rank digits** (`1`–`999` in the parser; sandbox math clamps card effects to ranks `1`–`3`).

Examples:

| Fragment | Tree | Slot | Rank | Internal key |
|----------|------|------|------|----------------|
| `sd3` | `s` (Strength) | `d` | `3` | `sd` |
| `sp10` | `s` | `p` | `10` | `sp` |
| `ee1` | `e` | `e` | `1` | `ee` |

**Uppercase + digits** (e.g. `B1`, `H3`) are stripped before parse — they act as **in-URL markers** (legendary-perk related in share links), not standard perk tokens.

**Implicit rank 1:** If the slot id is a **digit** and the next character is another SPECIAL letter (or end of string), N&D may omit the `1`; e.g. `l3ee1` → Luck slot `3` at rank `1`, then `ee1`.

**Trailing junk:** Bytes that are not a SPECIAL starter are **skipped** (e.g. mutation-style suffixes) so the rest of `p=` does not hard-fail the import.

Parser entry point: `parseNukesDragonsPerkParam` in `src/lib/builder/nukes-dragons-import.ts`.

---

## `s=` — allocated SPECIAL (implemented)

Seven **hex** characters `0-9a-f`, in order **S P E C I A L**, each digit encoding **1–15** (hex `a` = 10, `f` = 15).

Example: `s=aa547aa` → STR 10, PER 10, END 5, CHA 4, INT 7, AGI 10, LCK 10.

Used only for perks whose `ND_PERK_TABLE` handlers scale off that spread. Invalid length or non-hex → import falls back to placeholder all-10.

---

## `lp=` — legendary perks (**not** implemented — spike)

Observed pattern looks like repeated segments beginning with `x` (e.g. `lp=x94x64x74x44x84xa4`). Hypotheses to verify with **A/B URL diffs** on the live planner:

1. Toggle **one** legendary card on/off, copy Share URL twice, diff `lp=` only.
2. Change **rank** of one legendary by one step, diff again — confirm which digit(s) move.
3. Check whether `x94` means “card 9 / rank 4” vs “id 94 / rank implied” vs delimiter rules.

Do **not** bake math into R.O.L.L. until a grammar is proven; optionally log raw `lp` in dev when implementing.

---

## `ef=` — effects / Ghoul / mutations in URL (**not** implemented — spike)

Example blob: `ef=MgM0M5MhMaM1McM9MeMfM7M2MbMiM6M4MdM8M3`. External writeups may call this Base64-like; treat it as **opaque until mapped** from N&D’s own serialization (DevTools bundle or structured A/B toggles):

1. Toggle **one** mutation, diff `ef=`.
2. Toggle **Ghoul** or planner “Glow” UI if exposed, diff `ef=` and related params (`cd=` may couple).
3. Record whether length is always even, whether pairs map to enum indices, etc.

R.O.L.L. **Character state** mutations and serum-style toggles are **separate** from `ef=` today.

---

## `cd=` and `v=`

Not consumed by the importer yet. Same A/B approach: change one planner-only control, diff query keys.

---

## Golden URL for tests

Full example used in `nukes-dragons-import.test.ts` (planner v2 style):

`https://nukesdragons.com/fallout-76/character?cd=kk0131000k10&ef=MgM0M5MhMaM1McM9MeMfM7M2MbMiM6M4MdM8M3&s=aa547aa&p=sd3su1sq3sx1sp10B1p03pd3pg3pu1pp2li1eo1es10l3ee1cu1ce1lb2ic3lq1au30H3ak1af1a52ai1ab3ad3lv3lk3lg10v30j10n3e31ej2&lp=x94x64x74x44x84xa4&v=2`
