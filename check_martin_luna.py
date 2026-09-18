import re
with open('frontend/src/pages/HomePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

images = re.findall(r'<img[^>]*src=[\'"]([^\'"]+)[\'"]', content)
print("Martin/Luna:", [img for img in images if 'martin' in img.lower() or 'luna' in img.lower()])
