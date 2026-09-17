import re

def strip_css_comments():
    with open("frontend/src/pages/HomePage.css", "r", encoding="utf-8") as f:
        css = f.read()

    # Strip block comments
    css_no_comments = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)

    with open("frontend/src/pages/HomePage.css", "w", encoding="utf-8") as f:
        f.write(css_no_comments)
    
    print("Stripped CSS comments.")

if __name__ == "__main__":
    strip_css_comments()
