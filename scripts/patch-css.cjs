const fs = require('fs');
const paths = [
  process.cwd() + '/node_modules/react-native-css-interop/src/css-to-rn/parseDeclaration.ts',
  process.cwd() + '/node_modules/nativewind/node_modules/react-native-css-interop/src/css-to-rn/parseDeclaration.ts'
];

for (const p of paths) {
  try {
    let c = fs.readFileSync(p, 'utf8');
    // Fix 1: Handle undefined aspectRatio
    if (c.includes('if (aspectRatio.auto)') && !c.includes('!aspectRatio.ratio')) {
      c = c.replace('if (aspectRatio.auto)', 'if (!aspectRatio || !aspectRatio.ratio || !Array.isArray(aspectRatio.ratio) || aspectRatio.auto)');
    }
    // Fix 2: Handle when ratio is undefined array access
    if (c.includes('aspectRatio.ratio[0] === aspectRatio.ratio[1]')) {
      c = c.replace('if (aspectRatio.ratio[0] === aspectRatio.ratio[1] ', 'if (!aspectRatio.ratio || !Array.isArray(aspectRatio.ratio) || aspectRatio.ratio[0] === aspectRatio.ratio[1] ');
    }
    fs.writeFileSync(p, c);
    console.log('Patched:', p);
  } catch (e) {
    // ignore
  }
}
console.log('Done patching');