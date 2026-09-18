import urllib.request
import re

scripts = ['menu.js', 'script.js', 'agenda.js', 'cobranca.js', 'embaixadores.js', 'dia2.js', 'ben2.js', 'rastro.js']
base_url = 'https://meuassessor.com/'

full_script = ""

for s in scripts:
    url = base_url + s
    print(f"Downloading {url}")
    try:
        content = urllib.request.urlopen(url).read().decode('utf-8')
        full_script += f"\n\n/* --- {s} --- */\n\n" + content
    except Exception as e:
        print(f"Failed to download {s}: {e}")

# Patches for 'Simplific'
full_script = full_script.replace("'Martin'", "'Simplific'")
full_script = full_script.replace("'Luna'", "'Simplific'")
full_script = full_script.replace('"Martin"', '"Simplific"')
full_script = full_script.replace('"Luna"', '"Simplific"')
full_script = full_script.replace("Martin:", "Simplific:")
full_script = full_script.replace("Luna:", "Simplific:")

# Patch video promise rejections to prevent Uncaught (in promise) DOMException
full_script = re.sub(r'(\.play\(\))', r'\1.catch(e => console.warn("Video play prevented", e))', full_script)

with open('frontend/public/meuassessor/meuassessor_script.js', 'w', encoding='utf-8') as f:
    f.write(full_script)

print("Concatenated and patched scripts successfully.")
