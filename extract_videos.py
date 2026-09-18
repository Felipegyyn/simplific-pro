import re
from bs4 import BeautifulSoup

with open('meuassessor_test.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

for v in soup.find_all('video'):
    print("VIDEO:", v.get('id', v.get('class')))
    for s in v.find_all('source'):
        print("  SOURCE:", s.get('src'))
