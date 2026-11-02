const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/HomePage.jsx', 'utf8');

// Parse tags manually with regex to verify exact matching
const tagRegex = /<\/?([a-zA-Z0-9_\.]+)(\s+[^>]*?)?(\/?)>/g;

let match;
const stack = [];
let lineNum = 1;
let lastIndex = 0;

const lines = content.split('\n');

function getLineCol(index) {
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (count + lines[i].length + 1 > index) {
      return { line: i + 1, col: index - count + 1 };
    }
    count += lines[i].length + 1;
  }
  return { line: lines.length, col: 1 };
}

// Let's strip comments and strings to not confuse regex
// Actually let's use Babel AST which is an exact parser:
const parser = require('./frontend/node_modules/@babel/parser');
const ast = parser.parse(content, { sourceType: 'module', plugins: ['jsx'] });
const traverse = require('./frontend/node_modules/@babel/traverse').default;

const jsxElements = [];
traverse(ast, {
  JSXElement(path) {
    const opening = path.node.openingElement;
    const closing = path.node.closingElement;
    const isSelfClosing = opening.selfClosing;
    jsxElements.push({
      name: opening.name.name || opening.name.property?.name,
      startLine: opening.loc.start.line,
      startCol: opening.loc.start.column,
      selfClosing: isSelfClosing,
      closingLine: closing ? closing.loc.start.line : null,
      closingCol: closing ? closing.loc.start.column : null,
    });
  }
});

console.log('Total JSXElements found by Babel:', jsxElements.length);
const unclosed = jsxElements.filter(e => !e.selfClosing && !e.closingLine);
console.log('Unclosed JSX elements according to Babel:', unclosed);

// Let's check the root element
const root = jsxElements.find(e => e.startLine === 146 || e.startLine === 147);
console.log('Root element:', root);

