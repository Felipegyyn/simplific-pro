import re

def fix_bot_names():
    with open("frontend/public/meuassessor/meuassessor_script.js", "r", encoding="utf-8") as f:
        content = f.read()

    # Replace specific bot names with "Simplific"
    bot_names = ["Martin", "Sofi", "Luna", "Rita", "Ítalo", "Theo", "Vivi", "Leo"]
    for name in bot_names:
        # replace in name: 'Martin'
        content = re.sub(rf"name:\s*'{name}'", "name: 'Simplific'", content)
        # replace in HTML strings and arrays
        content = re.sub(rf"'{name}'", "'Simplific'", content)
        content = re.sub(rf'"{name}"', '"Simplific"', content)
    
    # Replace all avatars with the logo (favicon)
    # The avatars are like: avatar: 'images/martin.jpg' or avatar: '/meuassessor/images/martin.jpg'
    # Actually wait, what if I didn't find 'images/' in my search because they were already replaced by '/meuassessor/images/' in my previous python script?
    # Let's replace any `avatar: '.*?'` with `avatar: '/favicon.ico'`
    content = re.sub(r"avatar:\s*['\"].*?['\"]", "avatar: '/favicon.ico'", content)
    
    with open("frontend/public/meuassessor/meuassessor_script.js", "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Fixed bot names and avatars.")

if __name__ == "__main__":
    fix_bot_names()
