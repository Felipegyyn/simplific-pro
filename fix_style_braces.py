import re

def fix_style_braces():
    with open("frontend/src/pages/HomePage.jsx", "r", encoding="utf-8") as f:
        content = f.read()

    # Find all style={...} where it's not already style={{...}}
    # We will use a regex to look for style={ followed by anything but {
    # and ends with }. Since there might be some style={{...}} now or in future,
    # let's be precise.
    
    # regex: style=\{(?!\{)(.*?)\}
    # replacement: style={{\1}}
    
    content = re.sub(r'style=\{(?!\{)(.*?)\}', r'style={{\1}}', content)

    with open("frontend/src/pages/HomePage.jsx", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Fixed style braces.")

if __name__ == "__main__":
    fix_style_braces()
