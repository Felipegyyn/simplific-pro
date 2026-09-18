import re
with open('meuassessor_raw.html', 'r', encoding='utf-8') as f:
    content = f.read()
scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', content)
print("Scripts:", scripts)
