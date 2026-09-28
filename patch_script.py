import os

file_path = 'frontend/public/meuassessor/meuassessor_script.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Enclose in IIFE to prevent variable redeclaration
if not content.startswith('(function() {'):
    content = '(function() {\n' + content + '\n})();'

# 2. Add null check for simulationContainer.scrollTop
old_code = "simulationContainer.scrollTop = simulationContainer.scrollHeight;"
new_code = "if (simulationContainer) { simulationContainer.scrollTop = simulationContainer.scrollHeight; }"
content = content.replace(old_code, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("meuassessor_script.js patched successfully.")
