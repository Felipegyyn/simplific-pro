def find_unmatched_braces():
    with open("frontend/src/pages/HomePage.css", "r", encoding="utf-8") as f:
        css = f.read()
        
    open_b = css.count('{')
    close_b = css.count('}')
    print(f"Total open {{: {open_b}, close }}: {close_b}")

if __name__ == "__main__":
    find_unmatched_braces()
