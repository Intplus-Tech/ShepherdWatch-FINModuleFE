import fs from 'fs';
import glob from 'fast-glob';

const files = glob.sync('app/(screens)/**/page.tsx', { absolute: true });
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf-8');
  if (content.trim() === '') {
    const parts = f.replace(/\\/g, '/').split('/');
    const name = parts[parts.length - 2].replace(/[^a-zA-Z0-9]/g, '');
    const componentName = name.charAt(0).toUpperCase() + name.slice(1) + 'Page';
    fs.writeFileSync(f, `export default function ${componentName}() {\n  return <div>${name} Page</div>\n}`);
    console.log(`Fixed ${f}`);
  }
});
