import re

def fix_jsx():
    with open("frontend/src/pages/HomePage.jsx", "r", encoding="utf-8") as f:
        content = f.read()

    # Fix style="display:none" -> style={{display: 'none'}}
    # Since there are multiple inline styles in HTML, we will find all style="XYZ"
    def style_replacer(match):
        style_content = match.group(1)
        # simplistic conversion of CSS to JS object string
        # e.g., display: none; margin-top: 10px -> display: 'none', marginTop: '10px'
        declarations = style_content.split(';')
        js_styles = []
        for d in declarations:
            d = d.strip()
            if not d: continue
            if ':' in d:
                key, val = d.split(':', 1)
                key = key.strip()
                val = val.strip().replace("'", "\\'")
                
                # convert kebab-case to camelCase
                parts = key.split('-')
                camel_key = parts[0] + ''.join(p.title() for p in parts[1:])
                js_styles.append(f"{camel_key}: '{val}'")
                
        return "style={{" + ", ".join(js_styles) + "}}"

    content = re.sub(r'style="([^"]*)"', style_replacer, content)

    # Some common replacements for SVG
    content = content.replace('xmlns:xlink', 'xmlnsXlink')
    content = content.replace('xml:space', 'xmlSpace')
    content = content.replace('viewbox', 'viewBox')
    
    # Write back
    with open("frontend/src/pages/HomePage.jsx", "w", encoding="utf-8") as f:
        f.write(content)

    print("Fixed JSX inline styles and SVG attributes.")

if __name__ == "__main__":
    fix_jsx()
