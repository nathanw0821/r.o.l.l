# Project rules for AGY (Antigravity CLI)

- Perk cards, deployment pacing, the Vault firewall, and the live deployment pipeline are defined in `AGENTS.md` (perk cards: PNG masters in `public/images/in_game_cards/`, WebP delivered via `<picture>`) and in the shared spec (`~/.config/sovereign_vault/CLAUDE.md` §6). Do not duplicate them here.
- Live deployments to Cloudflare Workers occur through `git push origin main` under identity `nathanw0821` (`nathanw <nathanw0821@gmail.com>`), running the verified CI/CD Wrangler deployment pipeline.
- Never push or deploy while a Cloudflare / GitHub Actions run is pending. Verify completion first.
