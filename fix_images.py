with open('frontend/public/meuassessor/meuassessor_script.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'/images/", "'/meuassessor/images/")
content = content.replace('"/images/', '"/meuassessor/images/')

with open('frontend/public/meuassessor/meuassessor_script.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Image paths fixed.")
