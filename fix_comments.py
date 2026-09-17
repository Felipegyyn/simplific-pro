import re

def fix_comments():
    with open("frontend/src/pages/HomePage.jsx", "r", encoding="utf-8") as f:
        content = f.read()

    # Replace HTML comments <!-- ... --> with JSX comments {/* ... */}
    content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', content, flags=re.DOTALL)

    with open("frontend/src/pages/HomePage.jsx", "w", encoding="utf-8") as f:
        f.write(content)
    
    print("Fixed HTML comments in JSX.")

if __name__ == "__main__":
    fix_comments()
