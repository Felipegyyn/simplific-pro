import re
import os

COMPONENT_MAPPING = {
    2: "Header",
    3: "HeroSection",
    4: "PromiseSection",
    5: "SecuritySection",
    6: "TeamSection",
    7: "DaySection",
    8: "ShowcaseSection",
    9: "OpenFinanceSection",
    10: "GraphsSection",
    11: "AgendaSection",
    12: "EnterpriseSection",
    13: "BenefitsSection",
    14: "ExpedientSection",
    15: "IntegrationsSection",
    16: "ClientsSection",
    17: "PricingSection",
    18: "AmbassadorsSection",
    19: "FAQSection",
    20: "Footer",
    21: "ModalCartao",
    22: "ModalOrg",
    23: "ModalConversa",
    24: "ModalPainel",
    25: "ModalConta",
    26: "ModalCobranca",
    27: "ModalDocumentos",
    28: "ModalDrive"
}

def refactor():
    with open('frontend/src/pages/HomePage.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
        
    start_match = re.search(r'<div className="clone-wrapper">', content)
    if not start_match:
        return
        
    start_idx = start_match.end()
    
    tags = []
    i = start_idx
    
    # Parse tags (same as before)
    while i < len(content):
        tag_match = re.search(r'<([a-zA-Z0-9]+)([^>]*)>', content[i:])
        if not tag_match: break
            
        tag_name = tag_match.group(1)
        full_tag = tag_match.group(0)
        
        if full_tag.endswith('/>') or tag_name in ['link', 'img', 'br', 'hr']:
            tags.append((i + tag_match.start(), i + tag_match.end(), full_tag))
            i += tag_match.end()
            continue
            
        depth = 1
        j = i + tag_match.end()
        while depth > 0 and j < len(content):
            next_open = content.find(f'<{tag_name}', j)
            next_close = content.find(f'</{tag_name}>', j)
            next_self_close_match = re.search(rf'<{tag_name}[^>]*/>', content[j:])
            next_self_close = next_self_close_match.start() + j if next_self_close_match else -1

            if next_close == -1: break
                
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
            else:
                j = pos + 1
                
        tags.append((i + tag_match.start(), j, content[i + tag_match.start() : j]))
        i = j

    # Ensure components directory exists
    os.makedirs('frontend/src/components/home', exist_ok=True)
    
    new_content = content
    imports = []
    
    # Process from back to front to avoid index shifting issues
    for idx in sorted(COMPONENT_MAPPING.keys(), reverse=True):
        start_pos, end_pos, tag_str = tags[idx]
        comp_name = COMPONENT_MAPPING[idx]
        
        # Write component file
        comp_code = f"import React from 'react';\\n"
        if "logo" in tag_str and comp_name == "Header":
            comp_code += "import logo from '../../assets/LOGO.png';\\n"
            
        comp_code += f"\\nconst {comp_name} = () => {{\\n  return (\\n    <>{tag_str}</>\\n  );\\n}};\\n\\nexport default {comp_name};\\n"
        
        with open(f'frontend/src/components/home/{comp_name}.jsx', 'w', encoding='utf-8') as f:
            f.write(comp_code)
            
        # Update HomePage.jsx
        new_content = new_content[:start_pos] + f"<{comp_name} />" + new_content[end_pos:]
        imports.append(f"import {comp_name} from '../components/home/{comp_name}';")
        
    # Inject imports after existing imports
    import_idx = new_content.rfind("import ", 0, new_content.find("const HomePage"))
    import_end_idx = new_content.find("\\n", import_idx) + 1
    
    final_content = new_content[:import_end_idx] + "\\n".join(reversed(imports)) + "\\n" + new_content[import_end_idx:]
    
    with open('frontend/src/pages/HomePage.jsx', 'w', encoding='utf-8') as f:
        f.write(final_content)
        
    print("Refactoring complete.")

if __name__ == '__main__':
    refactor()
