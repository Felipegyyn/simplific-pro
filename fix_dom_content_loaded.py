import re

with open('frontend/public/meuassessor/meuassessor_script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace document.addEventListener('DOMContentLoaded', ...) with an IIFE or setTimeout
# We will just replace it so the callback executes immediately or on next tick.

# It's safer to just replace 'DOMContentLoaded' with 'load' ?
# No, if the document is already loaded, 'load' will also not fire!
# The best way is to monkey-patch `addEventListener` at the top of the script!
# BUT we can just replace `document.addEventListener('DOMContentLoaded',` with `setTimeout(`

# Or simpler:
# `document.addEventListener("DOMContentLoaded", () => {`
# to
# `setTimeout(() => {`

count = 0
def replacer(match):
    global count
    count += 1
    return "setTimeout("

new_content = re.sub(r'document\.addEventListener\([\'"]DOMContentLoaded[\'"]\s*,', replacer, content)

print("Replaced DOMContentLoaded:", count)

with open('frontend/public/meuassessor/meuassessor_script.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
