import urllib.request
import re

css = urllib.request.urlopen('https://meuassessor.com/style.css').read().decode('utf-8')

# Fix paths for images
css = css.replace("url('../images/", "url('/meuassessor/images/")
css = css.replace('url("../images/', 'url("/meuassessor/images/')

# Remove any weird syntax that might break vite, actually let's see if there is any first.
# Wait, let's just write it directly.
with open('frontend/public/meuassessor/meuassessor.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS downloaded and patched.")
