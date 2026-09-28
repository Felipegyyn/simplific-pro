import os

css_path = 'frontend/public/meuassessor/meuassessor.css'

with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '#bc85f8': '#22c55e',
    '#e27bb7': '#16a34a',
    '#c183fb': '#4ade80',
    '226,123,183': '22,163,74',
    '188,133,248': '34,197,94',
    '193,131,251': '74,222,128',
    '150,95,190': '20,83,45'
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Colors updated in meuassessor.css")
