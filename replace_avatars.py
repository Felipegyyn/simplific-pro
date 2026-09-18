import re
with open('frontend/src/pages/HomePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'/meuassessor/images/(martin|luna)[^"\']*\.jpg', '/favicon.svg', content)
content = re.sub(r'Martin\:', 'Simplific:', content)
content = re.sub(r'Luna\:', 'Simplific:', content)
content = re.sub(r'>Martin<', '>Simplific<', content)
content = re.sub(r'>Luna<', '>Simplific<', content)

with open('frontend/src/pages/HomePage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced avatars and names in HomePage.jsx")
