const fs = require('fs');
const fpath = 'app/(screens)/director-screen/assets/page.tsx';

let content = fs.readFileSync(fpath, 'utf8');

// Replace import
content = content.replace(/import \{ useAssetConfig \} from \"@\/components\/hooks\/useAssetConfig\"/, 
  'import { useAssetClasses } from "@/components/hooks/useAssetClasses"');

// Replace hook usage
content = content.replace(/const \{ assetConfig, loading, error \} = useAssetConfig\(\)/, 
  'const { assetClasses, isLoading: loading, error } = useAssetClasses()');

// Replace assetConfig?.classes with assetClasses
content = content.replace(/!assetConfig\?\.classes \|\| assetConfig\.classes\.length === 0/g, 
  '!assetClasses || assetClasses.length === 0');

content = content.replace(/assetConfig\.classes\.map\(\(row\) => \(/g, 
  'assetClasses.map((row: any) => (');

// Update row values
content = content.replace(/row\.depreciationMethod \|\| \"Straight Line\"/g, 
  'row.defaultDepreciationMethod || row.depreciationMethod || "straight_line"');

content = content.replace(/row\.usefulLifeYears \|\| \"N\/A\"/g, 
  'row.defaultUsefulLifeYears || row.usefulLifeYears || "N/A"');

content = content.replace(/<td className=\"px-6 py-4 font-medium text-\[\#4B5563\]\">0\%<\/td>/g, 
  '<td className="px-6 py-4 font-medium text-[#4B5563]">{row.defaultResidualValuePercent || 0}%</td>');

fs.writeFileSync(fpath, content, 'utf8');
console.log('Updated', fpath);
