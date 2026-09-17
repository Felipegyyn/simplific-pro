import re

def fix_css():
    with open("frontend/src/pages/HomePage.css", "r", encoding="utf-8") as f:
        content = f.read()

    # Look for malformed URLs or anything weird
    # Usually it's something like `url("")` without quotes that breaks tailwind 4, or unclosed parenthesis.
    
    # Let's fix paths:
    # background-image: url(../images/...) -> url(/meuassessor/images/...)
    content = content.replace('url(../images/', 'url(/meuassessor/images/')
    content = content.replace('url("images/', 'url("/meuassessor/images/')
    content = content.replace("url('images/", "url('/meuassessor/images/")
    content = content.replace('url(images/', 'url(/meuassessor/images/')
    
    # Also fix fonts if they have url()
    content = content.replace('url(fonts/', 'url(/meuassessor/fonts/')
    
    # Tailwind v4 sometimes crashes on specific malformed calc or empty url()
    content = content.replace('url()', 'none')
    content = content.replace('url("")', 'none')
    content = content.replace("url('')", "none")

    with open("frontend/src/pages/HomePage.css", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Fixed CSS paths and potential Tailwind v4 crashers.")

if __name__ == "__main__":
    fix_css()
