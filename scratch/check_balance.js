
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const content = fs.readFileSync('../src/components/builder/builder-experiment-client.tsx', 'utf8');

let parenCount = 0;
let braceCount = 0;
let bracketCount = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
    
    if (parenCount < 0) console.log(`Unbalanced ) at position ${i}`);
    if (braceCount < 0) console.log(`Unbalanced } at position ${i}`);
    if (bracketCount < 0) console.log(`Unbalanced ] at position ${i}`);
}

console.log(`Final counts - Paren: ${parenCount}, Brace: ${braceCount}, Bracket: ${bracketCount}`);
