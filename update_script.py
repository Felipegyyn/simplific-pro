import re

with open('frontend/public/meuassessor/meuassessor_script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the IntersectionObserver condition just to be sure it's correct
content = content.replace(
    'if (entry.intersectionRatio >= 0.4) { visivel = true;  acorda(); }',
    'if (entry.isIntersecting) { visivel = true; acorda(); }'
)
content = content.replace(
    'threshold: [0, 0.4]',
    'threshold: [0, 0.1]'
)

# Also force start just in case IntersectionObserver is completely broken in their browser
content = content.replace(
    'io.observe(palco);',
    'io.observe(palco); setTimeout(() => { if (!visivel) { visivel = true; acorda(); } }, 2000);'
)

# Add error handling
part1 = """    const flow = document.getElementById('promiseFlow');
    const alvo = document.getElementById('flowText');
    if (!flow || !alvo) return;
    try {"""

content = content.replace("""    const flow = document.getElementById('promiseFlow');
    const alvo = document.getElementById('flowText');
    if (!flow || !alvo) return;""", part1)

part2 = """        if (document.hidden) dorme();
        else acorda();
    });
    } catch(e) {
        flow.style.background = "red";
        flow.style.minHeight = "200px";
        alvo.textContent = "ERROR: " + (e.message || e);
    }"""

content = content.replace("""        if (document.hidden) dorme();
        else acorda();
    });""", part2)

with open('frontend/public/meuassessor/meuassessor_script.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
