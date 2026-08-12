import os

PERK_ART_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "perks")
os.makedirs(PERK_ART_DIR, exist_ok=True)

SVGS = {
    "s": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="s-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="#090d16"/>
  <circle cx="100" cy="100" r="90" fill="url(#s-glow)"/>
  <circle cx="100" cy="90" r="40" fill="#f59e0b" opacity="0.2" stroke="#f59e0b" stroke-width="2"/>
  <!-- Vault Boy Flexing Arm & Torso Silhouette -->
  <path d="M70 140 C 70 110, 85 95, 100 95 C 115 95, 130 110, 130 140 Z" fill="#fbbf24"/>
  <circle cx="100" cy="70" r="22" fill="#fbbf24"/>
  <!-- Hair swoop -->
  <path d="M82 62 C 85 50, 115 50, 118 64 C 110 58, 90 58, 82 62 Z" fill="#fef08a"/>
  <!-- Flex Bicep -->
  <path d="M125 105 Q 150 80, 140 60 Q 125 70, 120 90 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/>
  <text x="100" y="175" text-anchor="middle" fill="#f59e0b" font-family="monospace" font-size="14" font-weight="900" letter-spacing="2">STRENGTH</text>
</svg>''',
    "p": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="p-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="#090d16"/>
  <circle cx="100" cy="100" r="90" fill="url(#p-glow)"/>
  <circle cx="100" cy="85" r="42" fill="#06b6d4" opacity="0.15" stroke="#06b6d4" stroke-width="2"/>
  <!-- Vault Boy Eye & Target Reticle -->
  <circle cx="100" cy="85" r="30" fill="none" stroke="#22d3ee" stroke-width="3" stroke-dasharray="4,4"/>
  <circle cx="100" cy="85" r="12" fill="#06b6d4"/>
  <circle cx="100" cy="85" r="4" fill="#ecfeff"/>
  <path d="M70 145 C 70 120, 85 105, 100 105 C 115 105, 130 120, 130 145 Z" fill="#22d3ee" opacity="0.8"/>
  <text x="100" y="175" text-anchor="middle" fill="#06b6d4" font-family="monospace" font-size="14" font-weight="900" letter-spacing="2">PERCEPTION</text>
</svg>''',
    "e": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="e-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="#090d16"/>
  <circle cx="100" cy="100" r="90" fill="url(#e-glow)"/>
  <!-- Shield & Heart Silhouette -->
  <path d="M100 40 L145 60 V105 C145 135, 100 155, 100 155 C100 155, 55 135, 55 105 V60 Z" fill="#10b981" opacity="0.2" stroke="#10b981" stroke-width="3"/>
  <path d="M100 70 C90 55, 65 65, 75 90 C85 110, 100 125, 100 125 C100 125, 115 110, 125 90 C135 65, 110 55, 100 70 Z" fill="#34d399"/>
  <text x="100" y="178" text-anchor="middle" fill="#10b981" font-family="monospace" font-size="14" font-weight="900" letter-spacing="2">ENDURANCE</text>
</svg>''',
    "c": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="c-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#eab308" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="#090d16"/>
  <circle cx="100" cy="100" r="90" fill="url(#c-glow)"/>
  <!-- Vault Boy Thumbs Up Silhouette -->
  <circle cx="100" cy="65" r="22" fill="#facc15"/>
  <path d="M80 60 C 85 48, 115 48, 120 62 Z" fill="#fef08a"/>
  <!-- Smile -->
  <path d="M92 72 Q 100 80, 108 72" fill="none" stroke="#090d16" stroke-width="3" stroke-linecap="round"/>
  <!-- Thumbs Up Hand -->
  <path d="M115 90 L 135 70 Q 142 65, 140 75 L 130 95 L 125 125 Z" fill="#facc15" stroke="#eab308" stroke-width="2"/>
  <path d="M75 140 C 75 110, 85 95, 100 95 C 115 95, 125 110, 125 140 Z" fill="#facc15"/>
  <text x="100" y="175" text-anchor="middle" fill="#eab308" font-family="monospace" font-size="14" font-weight="900" letter-spacing="2">CHARISMA</text>
</svg>''',
    "i": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="i-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="#090d16"/>
  <circle cx="100" cy="100" r="90" fill="url(#i-glow)"/>
  <!-- Atom & Brain Gears -->
  <ellipse cx="100" cy="85" rx="45" ry="18" fill="none" stroke="#818cf8" stroke-width="3" transform="rotate(30 100 85)"/>
  <ellipse cx="100" cy="85" rx="45" ry="18" fill="none" stroke="#818cf8" stroke-width="3" transform="rotate(-30 100 85)"/>
  <circle cx="100" cy="85" r="14" fill="#6366f1"/>
  <text x="100" y="175" text-anchor="middle" fill="#6366f1" font-family="monospace" font-size="14" font-weight="900" letter-spacing="2">INTELLIGENCE</text>
</svg>''',
    "a": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="a-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a855f7" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="#090d16"/>
  <circle cx="100" cy="100" r="90" fill="url(#a-glow)"/>
  <!-- Lightning Speed Lines & Vault Boy Sprint -->
  <path d="M110 35 L70 95 H105 L90 145 L135 85 H100 Z" fill="#c084fc" stroke="#a855f7" stroke-width="2"/>
  <text x="100" y="175" text-anchor="middle" fill="#a855f7" font-family="monospace" font-size="14" font-weight="900" letter-spacing="2">AGILITY</text>
</svg>''',
    "l": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="l-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="#090d16"/>
  <circle cx="100" cy="100" r="90" fill="url(#l-glow)"/>
  <!-- Glowing Vault Boy Gold Star -->
  <polygon points="100,35 115,75 158,75 122,100 135,142 100,116 65,142 78,100 42,75 85,75" fill="#fbbf24" stroke="#f59e0b" stroke-width="3"/>
  <circle cx="100" cy="85" r="10" fill="#fef08a" opacity="0.6"/>
  <text x="100" y="175" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="14" font-weight="900" letter-spacing="2">LUCK</text>
</svg>''',
    "legendary": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="leg-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="#090d16"/>
  <circle cx="100" cy="100" r="90" fill="url(#leg-glow)"/>
  <polygon points="100,25 120,70 170,70 130,100 145,150 100,120 55,150 70,100 30,70 80,70" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
  <text x="100" y="178" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="14" font-weight="900" letter-spacing="2">LEGENDARY</text>
</svg>'''
}

for key, content in SVGS.items():
    out_path = os.path.join(PERK_ART_DIR, f"vaultboy_{key}.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"✅ Created: {out_path}")

print("✨ All official Vault Boy vector SVGs created successfully!")
