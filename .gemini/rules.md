# Project rules for AGY (Antigravity CLI)

- Perk cards, deployment pacing, the Vault firewall and the no-push rule are defined in `AGENTS.md` (perk cards: PNG masters in `public/images/in_game_cards/`, WebP delivered via `<picture>`) and in the shared spec (`~/.config/sovereign_vault/CLAUDE.md` §6). Do not duplicate them here.
- Never run `git push`; Nathan pushes. Never push or deploy while a Cloudflare / GitHub Actions run is pending.
