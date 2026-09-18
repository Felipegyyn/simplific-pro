import re

with open('meuassessor_raw.html', 'r', encoding='utf-8') as f:
    content = f.read()

videos = re.findall(r'<video[^>]*>', content)
print("Video tags:", videos)
