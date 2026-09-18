import re
with open('frontend/src/pages/HomePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

images = re.findall(r'<img[^>]*src=[\'"]([^\'"]+)[\'"]', content)
print("Images:", [img for img in images if 'avatar' in img or 'mascote' in img])
