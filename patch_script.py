import re

with open('frontend/public/meuassessor/meuassessor_script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Video play catches
js = js.replace('video.play();', 'video.play().catch(() => {});')
js = js.replace('linha[i].play();', 'linha[i].play().catch(() => {});')

# 2. Bot names
js = js.replace("'Luna'", "'Simplific'")
js = js.replace("'Martin'", "'Simplific'")
js = js.replace("foto: '/images/avatars/luna-32.jpg'", "foto: '/meuassessor/favicon.png'")
js = js.replace("foto: '/images/avatars/martin-32.jpg'", "foto: '/meuassessor/favicon.png'")
# The original might not have /meuassessor/ in front of /images, let's just replace the exact paths if needed.
# To be safe, let's just use regex for the avatar URLs.
js = re.sub(r"foto:\s*'[^']*luna-32\.jpg'", "foto: '/meuassessor/favicon.png'", js)
js = re.sub(r"foto:\s*'[^']*martin-32\.jpg'", "foto: '/meuassessor/favicon.png'", js)

# 3. Intersection Observer tweak (to ensure it triggers)
js = js.replace('threshold: [0, 0.4]', 'threshold: [0, 0.1]')
js = js.replace('entry.intersectionRatio >= 0.4', 'entry.isIntersecting')

js = js.replace('threshold: [0, 0.6]', 'threshold: [0, 0.1]')
js = js.replace('entry.intersectionRatio >= 0.6', 'entry.isIntersecting')

with open('frontend/public/meuassessor/meuassessor_script.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Script restored and patched.")
