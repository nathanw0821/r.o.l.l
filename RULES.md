# 📜 MANDATORY PROJECT RULES & DIRECTIVES FOR AGY (ANTIGRAVITY CLI)

## 🎨 Official Datamined Perk Card Assets Policy
- **STRICT RULE**: ALWAYS use the 319 official datamined Fallout 76 Vault Boy & Vault Girl SVG vector card assets stored in `public/images/perks_official/*.svg`.
- **NO DELETIONS**: NEVER delete or remove any files from `public/images/perks_official/`.
- **NO WEB SCRAPING**: Do NOT run web scrapers or attempt to download third-party wiki images.
- **NO FALLBACK STAR ICONS**: `PipBoyCardArt` must ALWAYS render the authentic datamined Vault Boy vector artwork directly inside the Pip-Boy radar grid card frame without replacing it with generic star icons or full-card image overrides.

## 🚀 Deployment Pipeline Pacing Policy
- **STRICT RULE**: NEVER push a new commit or trigger a new deployment while a previous Cloudflare / GitHub Actions deployment workflow is still running or pending.
- **WAIT FOR COMPLETION**: Always wait for the ongoing deployment to finish and verify that the prior deployment is live before pushing any subsequent updates.
- **NO AUTOMATIC PUSHES**: Do NOT execute `git push` unless explicitly asked by the user.
