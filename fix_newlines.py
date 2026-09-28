import os
import glob

files = glob.glob('frontend/src/components/home/*.jsx')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace literal \n with actual newline
    content = content.replace('\\n', '\n')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print(f"Fixed {len(files)} files.")
