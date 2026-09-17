def fix_css_typos():
    with open("frontend/src/pages/HomePage.css", "r", encoding="utf-8") as f:
        content = f.read()

    # Fix the typo '){' -> '{'
    content = content.replace('.zap4-bolha.is-voce){', '.zap4-bolha.is-voce{')
    content = content.replace('.zap4-bolha.is-luna){', '.zap4-bolha.is-luna{')
    content = content.replace('.dia-zap-audio, .dia-zap-resp, .zap4-bolha){', '.dia-zap-audio, .dia-zap-resp, .zap4-bolha{')

    with open("frontend/src/pages/HomePage.css", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Fixed CSS typos.")

if __name__ == "__main__":
    fix_css_typos()
