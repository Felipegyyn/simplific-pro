import re

def fix_script():
    filepath = "frontend/public/meuassessor/meuassessor_script.js"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find where the DOMContentLoaded wrapper starts
    # `document.addEventListener('DOMContentLoaded', () => {` is at the beginning
    if "document.addEventListener('DOMContentLoaded'" in content:
        # replace the opening
        content = content.replace("document.addEventListener('DOMContentLoaded', () => {", "(() => {")
        # replace the closing `});` at the very end of the file.
        # Since it's a huge file, we just replace the last `});`
        # Or better, just wrap it in an IIFE: (() => { ... })();
        content = content.replace("});", "})();", 1) # wait, replacing only the first one is bad, the last one is what we want.
        
        # Safer: just replace the beginning and append `)();` to the end if we strip the ending.
        # Actually, let's just do an exact match using regex for the whole block.
        content = re.sub(r"^document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{", "(() => {", content)
        content = re.sub(r"\}\);\s*$", "})();", content)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    print("Fixed script.")

if __name__ == "__main__":
    fix_script()
