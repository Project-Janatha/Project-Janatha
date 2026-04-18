const fs = require('fs');
const paths = [
  process.cwd() + '/node_modules/react-native-css-interop/src/css-to-rn/parseDeclaration.ts',
  process.cwd() + '/node_modules/nativewind/node_modules/react-native-css-interop/src/css-to-rn/parseDeclaration.ts'
];

for (const p of paths) {
  try {
    let c = fs.readFileSync(p, 'utf8');
    if (c.includes('if (aspectRatio.auto)') && !c.includes('!aspectRatio.ratio')) {
      c = c.replace('if (aspectRatio.auto)', 'if (!aspectRatio || !aspectRatio.ratio || aspectRatio.auto)');
      fs.writeFileSync(p, c);
      console.log('Patched:', p);
    }
  } catch (e) {
    // ignore
  }
}
console.log('Done patching');