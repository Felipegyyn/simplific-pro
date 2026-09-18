import re

# 1. Read raw HTML
with open('meuassessor_raw.html', 'r', encoding='utf-8') as f:
    raw_content = f.read()

# 2. Extract last script
scripts = re.findall(r'<script[^>]*>(.*?)</script>', raw_content, re.DOTALL)
original_js = scripts[-1]

# 3. Apply fixes
# 3.1 Catch video.play() promises
original_js = original_js.replace('video.play();', 'video.play().catch(() => {});')
original_js = original_js.replace('linha[i].play();', 'linha[i].play().catch(() => {});')

# 3.2 Change bot names to Simplific
original_js = original_js.replace("'Luna'", "'Simplific'")
original_js = original_js.replace("'Martin'", "'Simplific'")
original_js = original_js.replace("'Ana Prado'", "'Ana Prado'") # Keep this
original_js = original_js.replace("foto: '/meuassessor/images/avatars/luna-32.jpg'", "foto: '/meuassessor/favicon.png'")
original_js = original_js.replace("foto: '/meuassessor/images/avatars/martin-32.jpg'", "foto: '/meuassessor/favicon.png'")

# 3.3 Fix IntersectionObserver in SEÇÃO 3 (and SEÇÃO 4, etc. if needed)
# Actually, I'll just change ALL threshold: [0, 0.4] to threshold: [0, 0.1]
# and entry.intersectionRatio >= 0.4 to entry.isIntersecting
original_js = original_js.replace('threshold: [0, 0.4]', 'threshold: [0, 0.1]')
original_js = original_js.replace('entry.intersectionRatio >= 0.4', 'entry.isIntersecting')

# Also SEÇÃO 4 threshold
original_js = original_js.replace('threshold: [0, 0.6]', 'threshold: [0, 0.1]')
original_js = original_js.replace('entry.intersectionRatio >= 0.6', 'entry.isIntersecting')

# 4. Save
with open('frontend/public/meuassessor/meuassessor_script.js', 'w', encoding='utf-8') as f:
    f.write(original_js)

print("Restored and patched successfully.")
