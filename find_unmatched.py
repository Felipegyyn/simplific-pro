import re

def find_unmatched_parentheses():
    with open("frontend/src/pages/HomePage.css", "r", encoding="utf-8") as f:
        css = f.read()
        
    lines = css.split('\n')
    for i, line in enumerate(lines):
        open_parens = line.count('(')
        close_parens = line.count(')')
        if open_parens != close_parens:
            print(f"Line {i+1}: {line} (open: {open_parens}, close: {close_parens})")

if __name__ == "__main__":
    find_unmatched_parentheses()
