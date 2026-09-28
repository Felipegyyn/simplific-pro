import os
import glob

# Fix image paths in all js files
js_files = glob.glob('frontend/public/meuassessor/*.js')
for f in js_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Fix paths
    content = content.replace("'images/", "'/meuassessor/images/")
    content = content.replace('"images/', '"/meuassessor/images/')
    
    # Fix the .catch() error for animations
    content = content.replace(
        "linha[i].play().catch(e => console.warn(\"Video play prevented\", e));",
        "var _p = linha[i].play(); if (_p && _p.catch) _p.catch(e => console.warn(\"Video play prevented\", e));"
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print(f"Fixed {len(js_files)} scripts.")
