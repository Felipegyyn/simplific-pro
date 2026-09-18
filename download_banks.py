import os
import urllib.request
import re

with open('meuassessor_raw.html', 'r', encoding='utf-8') as f:
    content = f.read()

images = set(re.findall(r'images/bancos/[^\"]+\.svg', content))

os.makedirs('frontend/public/meuassessor/images/bancos', exist_ok=True)

for img in images:
    url = f"https://meuassessor.com/{img}"
    dest = f"frontend/public/meuassessor/{img}"
    try:
        urllib.request.urlretrieve(url, dest)
        print(f"Downloaded {img}")
    except Exception as e:
        print(f"Failed to download {img}: {e}")

# What about the favicon.svg 404 error?
try:
    urllib.request.urlretrieve("https://meuassessor.com/favicon.svg", "frontend/public/favicon.svg")
    print("Downloaded favicon.svg")
except Exception as e:
    print(f"Failed to download favicon.svg: {e}")

