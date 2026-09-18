import re

def cache_bust():
    with open("frontend/src/pages/HomePage.jsx", "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace(
        'script.src = "/meuassessor/meuassessor_script.js";',
        'script.src = "/meuassessor/meuassessor_script.js?v=" + Date.now();'
    )
    
    content = content.replace(
        '<link rel="stylesheet" href="/meuassessor/meuassessor.css" />',
        '<link rel="stylesheet" href={"/meuassessor/meuassessor.css?v=" + Date.now()} />'
    )

    with open("frontend/src/pages/HomePage.jsx", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Cache busted")

if __name__ == "__main__":
    cache_bust()
