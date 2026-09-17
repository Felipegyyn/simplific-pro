import re
import requests
import os
from bs4 import BeautifulSoup

def download_assets():
    with open("meuassessor_raw.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    soup = BeautifulSoup(html, "html.parser")
    tags_with_src = soup.find_all(src=True)
    
    base_url = "https://meuassessor.com/"
    os.makedirs("frontend/src/assets/meuassessor", exist_ok=True)
    
    for tag in tags_with_src:
        src = tag['src']
        if src.startswith('images/') or src.startswith('assets/') or src.startswith('videos/'):
            full_url = base_url + src
            local_path = os.path.join("frontend/src/assets/meuassessor", os.path.basename(src))
            if not os.path.exists(local_path):
                print(f"Downloading {full_url}...")
                try:
                    r = requests.get(full_url, stream=True)
                    r.raise_for_status()
                    with open(local_path, 'wb') as out_f:
                        for chunk in r.iter_content(1024):
                            out_f.write(chunk)
                except Exception as e:
                    print(f"Failed to download {full_url}: {e}")
                    
    print("Done downloading HTML assets.")

    # CSS assets (like background images)
    with open("meuassessor_style.css", "r", encoding="utf-8") as f:
        css = f.read()
        
    urls = re.findall(r'url\((.*?)\)', css)
    for u in urls:
        u = u.strip("'\"")
        if u.startswith('images/') or u.startswith('../images/'):
            u_clean = u.replace('../', '')
            full_url = base_url + u_clean
            local_path = os.path.join("frontend/src/assets/meuassessor", os.path.basename(u_clean))
            if not os.path.exists(local_path):
                print(f"Downloading CSS asset {full_url}...")
                try:
                    r = requests.get(full_url, stream=True)
                    r.raise_for_status()
                    with open(local_path, 'wb') as out_f:
                        for chunk in r.iter_content(1024):
                            out_f.write(chunk)
                except Exception as e:
                    print(f"Failed to download {full_url}: {e}")

if __name__ == "__main__":
    download_assets()
