import requests
import os

def fetch_assets():
    base_url = "https://meuassessor.com/"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    # 1. Fetch CSS
    try:
        r = requests.get(base_url + "style.css", headers=headers)
        r.raise_for_status()
        with open("meuassessor_style.css", "w", encoding="utf-8") as f:
            f.write(r.text)
        print("Fetched style.css")
    except Exception as e:
        print(f"Error CSS: {e}")

    # 2. Fetch Script
    try:
        r = requests.get(base_url + "script.js", headers=headers)
        if r.status_code == 200:
            with open("meuassessor_script.js", "w", encoding="utf-8") as f:
                f.write(r.text)
            print("Fetched script.js")
    except Exception as e:
        pass

if __name__ == "__main__":
    fetch_assets()
