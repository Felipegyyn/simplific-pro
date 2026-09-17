import re

def fix_window_load():
    with open("frontend/public/meuassessor/meuassessor_script.js", "r", encoding="utf-8") as f:
        content = f.read()

    # Replace window.addEventListener('load', func) with 
    # if(document.readyState === 'complete') { func(); } else { window.addEventListener('load', func); }
    
    def replacer(match):
        func = match.group(1)
        return f"if (document.readyState === 'complete') {{ {func}(); }} else {{ window.addEventListener('load', {func}); }}"
    
    content = re.sub(r"window\.addEventListener\('load',\s*([a-zA-Z0-9_]+)\);", replacer, content)
    
    # Also handle inline functions window.addEventListener('load', function() { ... })
    content = content.replace("window.addEventListener('load', function () {", "if (document.readyState === 'complete') { (function() {")
    # For the inline ones, it's harder with regex, let's just do a naive replace of exact matches if there are any.
    
    with open("frontend/public/meuassessor/meuassessor_script.js", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Fixed window load events.")

if __name__ == "__main__":
    fix_window_load()
