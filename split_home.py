import re

def analyze_jsx():
    with open('frontend/src/pages/HomePage.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the start of the return statement
    start_match = re.search(r'<div className="clone-wrapper">', content)
    if not start_match:
        print("Could not find <div className=\"clone-wrapper\">")
        return
    
    start_idx = start_match.end()
    
    # Simple tag parser to find top level children
    tags = []
    i = start_idx
    
    while i < len(content):
        # Find next tag opening
        tag_match = re.search(r'<([a-zA-Z0-9]+)([^>]*)>', content[i:])
        if not tag_match:
            break
            
        tag_name = tag_match.group(1)
        full_tag = tag_match.group(0)
        
        # skip self-closing or simple tags like <link, <img
        if full_tag.endswith('/>') or tag_name in ['link', 'img', 'br', 'hr']:
            tags.append(full_tag)
            i += tag_match.end()
            continue
            
        # If it's a structural tag, we need to find its closing tag
        # This is a naive bracket counter
        depth = 1
        j = i + tag_match.end()
        while depth > 0 and j < len(content):
            next_open = content.find(f'<{tag_name}', j)
            next_close = content.find(f'</{tag_name}>', j)
            
            # also handle self-closing of the same tag name e.g. <div ... />
            next_self_close_match = re.search(rf'<{tag_name}[^>]*/>', content[j:])
            next_self_close = next_self_close_match.start() + j if next_self_close_match else -1

            if next_close == -1:
                break
                
            # Find which comes first
            options = []
            if next_open != -1: options.append(('open', next_open))
            if next_close != -1: options.append(('close', next_close))
            if next_self_close != -1: options.append(('self_close', next_self_close))
            
            options.sort(key=lambda x: x[1])
            first_event, pos = options[0]
            
            if first_event == 'close':
                depth -= 1
                j = pos + len(f'</{tag_name}>')
            elif first_event == 'open':
                depth += 1
                j = pos + 1
            else: # self_close
                j = pos + 1
                
        # we found the end of this tag
        tag_content = content[i + tag_match.start() : j]
        # Just save the first line or first 100 chars to identify it
        first_line = tag_content.split('\\n')[0][:150]
        tags.append(first_line)
        i = j

    for idx, t in enumerate(tags):
        print(f"{idx}: {t.strip()}")

if __name__ == '__main__':
    analyze_jsx()
