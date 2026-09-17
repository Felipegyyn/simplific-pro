import re

def fix_iifes():
    with open("frontend/public/meuassessor/meuassessor_script.js", "r", encoding="utf-8") as f:
        content = f.read()

    # Replace all top-level `});` with `})();`
    content = re.sub(r"^(\}\);)", "})();", content, flags=re.MULTILINE)

    with open("frontend/public/meuassessor/meuassessor_script.js", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Fixed un-invoked IIFEs.")

if __name__ == "__main__":
    fix_iifes()
