import re
with open('frontend/public/meuassessor/meuassessor.css', 'r', encoding='utf-8') as f:
    content = f.read()

print("iphones:", re.findall(r'iphone[^\.\"]*\.webp', content))
print("celular:", re.findall(r'celular[^\.\"]*\.webp', content))
