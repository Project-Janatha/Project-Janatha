const fs = require('fs');
const path = require('path');

function patchFile(filePath, pattern, replacement) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log('Not found:', filePath);
      return false;
    }
    let c = fs.readFileSync(filePath, 'utf8');
    if (c.includes(pattern)) {
      c = c.replace(pattern, replacement);
      fs.writeFileSync(filePath, c);
      console.log('Patched:', filePath);
      return true;
    }
    return false;
  } catch (e) {
    console.log('Error:', e.message);
    return false;
  }
}

const rootDir = process.cwd();

// Find all copies of react-native-css-interop
const dirs = [
  rootDir + '/node_modules/react-native-css-interop',
  rootDir + '/node_modules/nativewind/node_modules/react-native-css-interop',
  rootDir + '/packages/frontend/node_modules/react-native-css-interop'
];

for (const dir of dirs) {
  // Fix source TS file
  const srcFile = dir + '/src/css-to-rn/parseDeclaration.ts';
  patchFile(srcFile, 
    'case "box-shadow": {\n      parseBoxShadow(declaration.value, parseOptions);\n    }',
    'case "box-shadow": {\n      return;\n    }'
  );
  
  // Fix compiled JS file  
  const jsFile = dir + '/dist/css-to-rn/parseDeclaration.js';
  patchFile(jsFile,
    'case "box-shadow": {\n            parseBoxShadow(declaration.value, parseOptions);\n          }',
    'case "box-shadow": {\n            return;\n          }'
  );
}

console.log('Done patching box-shadow');