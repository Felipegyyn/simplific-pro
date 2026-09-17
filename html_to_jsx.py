import re

def html_to_jsx():
    with open("meuassessor_raw.html", "r", encoding="utf-8") as f:
        html = f.read()

    # Extract the body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    if not body_match:
        print("No body found")
        return
    body = body_match.group(1)

    # 1. Replace class with className
    body = body.replace('class="', 'className="')
    
    # 2. Replace for with htmlFor
    body = body.replace('for="', 'htmlFor="')
    
    # 3. Fix self-closing tags
    for tag in ['img', 'br', 'hr', 'input', 'source']:
        # Find tags not already self-closed
        body = re.sub(r'(<' + tag + r'[^>]*?)(?<!/)>', r'\1 />', body, flags=re.IGNORECASE)

    # 4. Handle some standard camelCase attributes
    body = body.replace('autoplay', 'autoPlay')
    body = body.replace('playsinline', 'playsInline')
    body = body.replace('onclick', 'onClick')
    body = body.replace('onsubmit', 'onSubmit')
    body = body.replace('onchange', 'onChange')
    body = body.replace('tabindex', 'tabIndex')
    body = body.replace('stroke-width', 'strokeWidth')
    body = body.replace('stroke-linecap', 'strokeLinecap')
    body = body.replace('stroke-linejoin', 'strokeLinejoin')
    body = body.replace('fill-rule', 'fillRule')
    body = body.replace('clip-rule', 'clipRule')
    body = body.replace('stroke-miterlimit', 'strokeMiterlimit')
    
    # 5. Replace Brand text
    body = body.replace('Meu Assessor', 'Simplific Pro')
    body = body.replace('meu assessor', 'simplific pro')
    body = body.replace('Meu assessor', 'Simplific Pro')
    body = body.replace('meu Assessor', 'simplific Pro')
    
    # 6. Replace CTA links
    body = re.sub(r'href="https://app\.meuassessor\.com/assinar"', 'href="/checkout"', body)
    body = re.sub(r'href="https://app\.meuassessor\.com/#/entrar"', 'href="/login"', body)

    # 7. Map image paths to imported assets or public folder
    # Instead of importing 50 images, we can serve them from the public folder.
    # We downloaded them to frontend/src/assets/meuassessor/
    # Let's keep them there, but in JSX we can just use require() or import them.
    # Or, the easiest way for 50 images is to move them to frontend/public/meuassessor/
    # Let's change the paths in JSX to '/meuassessor/images/...'
    body = body.replace('src="images/', 'src="/meuassessor/images/')
    
    # Exceção para o logo:
    # <img src="/meuassessor/images/logo-meu-assessor.svg" ... /> -> change to logo (which we will import)
    body = re.sub(r'src="/meuassessor/images/logo-[^"]*\.svg"', 'src={logo}', body)

    jsx = f"""import React, {{ useEffect }} from 'react';
import {{ useNavigate, Link }} from 'react-router-dom';
import logo from '../assets/LOGO.png';
import './HomePage.css';

const HomePage = () => {{
  const navigate = useNavigate();

  useEffect(() => {{
      // Script logic will go here
  }}, []);

  return (
    <div className="clone-wrapper">
      {body}
    </div>
  );
}};

export default HomePage;
"""

    with open("frontend/src/pages/HomePage.jsx", "w", encoding="utf-8") as f:
        f.write(jsx)
        
    print("Converted HTML to JSX in HomePage.jsx")

if __name__ == "__main__":
    html_to_jsx()
