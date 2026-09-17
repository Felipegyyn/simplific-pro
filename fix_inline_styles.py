import re

def camel_to_kebab(name):
    # DiaArte -> dia-arte
    # GdI -> gd-i
    # W -> w
    # Special cases:
    if name == 'DiaArte': return 'dia-arte'
    if name == 'GdI': return 'gd-i'
    if name == 'GdN': return 'gd-n'
    if name == 'GdH': return 'gd-h'
    if name == 'GdLen': return 'gd-len'
    
    # Simple camel to kebab
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1-\2', s1).lower()

def fix_styles():
    with open("frontend/src/pages/HomePage.jsx", "r", encoding="utf-8") as f:
        content = f.read()

    # Find all style={{ ... }}
    def style_replacer(match):
        style_content = match.group(1)
        
        # We want to replace properties like W: '...', GdI: '...', DiaArte: 'url(...)'
        # But NOT standard CSS like color:, width:, top:, bottom:, flex:, position:
        
        # Split properties safely (naive split on comma, assuming no commas in values except url)
        # Actually, let's use a regex to match Key: 'Value' or Key: "Value"
        
        def prop_replacer(m):
            key = m.group(1)
            val = m.group(2)
            
            # Standard CSS properties we found
            if key in ['color', 'width', 'top', 'bottom', 'flex', 'position']:
                return m.group(0) # Keep unchanged
                
            # If it's DiaArte, fix the images path
            if key == 'DiaArte':
                val = val.replace("url(\\'images/", "url(\\'/meuassessor/images/")
                val = val.replace("url('images/", "url('/meuassessor/images/")
                val = val.replace('url("images/', 'url("/meuassessor/images/')
                
            kebab = camel_to_kebab(key)
            return f"'--{kebab}': {val}"
            
        new_style_content = re.sub(r'([a-zA-Z]+):\s*([\'\"].*?[\'\"]|\d+)', prop_replacer, style_content)
        
        return f"style={{{new_style_content}}}"

    content = re.sub(r'style=\{\{(.*?)\}\}', style_replacer, content)

    with open("frontend/src/pages/HomePage.jsx", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Fixed inline styles.")

if __name__ == "__main__":
    fix_styles()
