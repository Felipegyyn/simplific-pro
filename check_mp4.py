import re
with open('frontend/public/meuassessor/meuassessor_script.js', 'r', encoding='utf-8') as f:
    content = f.read()
print("mp4 files:", re.findall(r'[\'"][^\'"]+\.mp4[\'"]', content))
