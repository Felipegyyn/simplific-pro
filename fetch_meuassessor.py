import requests

def fetch_html():
    url = "https://meuassessor.com/"
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        with open("meuassessor_raw.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        print("Successfully fetched HTML")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fetch_html()
