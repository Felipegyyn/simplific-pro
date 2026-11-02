const ts = require("C:/Users/felipe.oliveira/AppData/Local/Programs/Antigravity IDE/resources/app/node_modules/typescript/lib/typescript.js");
const fs = require("fs");

let content = fs.readFileSync("step357_content.jsx", "utf8");
// Let's remove </div> before );
content = content.replace('    </div>\n  );', '  );');

const sf = ts.createSourceFile("HomePage.jsx", content, ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
console.log('Parse diagnostics when removing </div>:', sf.parseDiagnostics.length);
sf.parseDiagnostics.forEach(d => {
  const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
  console.log(`Ln ${line + 1}, Col ${character + 1} ts(${d.code}): ${d.messageText}`);
});

