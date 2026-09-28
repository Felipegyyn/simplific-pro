import re

css_path = 'frontend/public/meuassessor/meuassessor.css'

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Make all white/light backgrounds dark
css = re.sub(r'background(?:-color)?\s*:\s*#ffffff', 'background-color:#000000', css, flags=re.IGNORECASE)
css = re.sub(r'background(?:-color)?\s*:\s*#f[0-9a-f]{5}', 'background-color:#111827', css, flags=re.IGNORECASE)

# Make all dark text white
css = re.sub(r'color\s*:\s*#000000', 'color:#ffffff', css, flags=re.IGNORECASE)
css = re.sub(r'color\s*:\s*#111b21', 'color:#ffffff', css, flags=re.IGNORECASE)
css = re.sub(r'color\s*:\s*#333333', 'color:#e5e7eb', css, flags=re.IGNORECASE)

# Ensure the iOS/WhatsApp mockups get dark mode colors too
css = css.replace('background:#f0ebe4', 'background:#0b141a') # WhatsApp BG
css = css.replace('background:#e9edef', 'background:#202c33') # WhatsApp message BG (light) -> dark
css = css.replace('background:rgba(255,255,255,0.65)', 'background:rgba(32,44,51,0.9)') # Bot message
css = css.replace('background:rgba(217,253,211,0.75)', 'background:rgba(0,92,75,0.9)') # User message

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS inverted to dark theme.")
