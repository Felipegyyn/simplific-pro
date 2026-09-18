import re
with open('meuassessor_test.html', 'r', encoding='utf-8') as f:
    content = f.read()

links = re.findall(r'<link[^>]*rel="stylesheet"[^>]*>', content)
print("Links:", links)
