import re

with open('frontend/public/meuassessor/meuassessor_script.js', 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
def replacer(match):
    global count
    count += 1
    return "setTimeout("

new_content = re.sub(r'window\.addEventListener\([\'"]load[\'"]\s*,', replacer, content)
new_content = re.sub(r'window\.addEventListener\([\'"]DOMContentLoaded[\'"]\s*,', replacer, new_content)

print("Replaced window load/DOMContentLoaded:", count)

with open('frontend/public/meuassessor/meuassessor_script.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
