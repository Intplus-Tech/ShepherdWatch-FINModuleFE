const fs = require('fs');
const fpath = 'app/(screens)/director-screen/settings-asset/page.tsx';

let content = fs.readFileSync(fpath, 'utf8');

if (!content.includes('useAssetClasses')) {
  content = content.replace(/import \{ useAssetConfig \} from \"@\/components\/hooks\/useAssetConfig\"/, 
    'import { useAssetConfig } from "@/components/hooks/useAssetConfig"\nimport { useAssetClasses } from "@/components/hooks/useAssetClasses"\nimport { useRouter } from "next/navigation"');
}

if (!content.includes('const router = useRouter()')) {
  content = content.replace(/export default function Page\(\) \{/, 
    'export default function Page() {\n  const router = useRouter()\n  const { assetClasses, isLoading: assetClassesLoading } = useAssetClasses()');
}

content = content.replace(/const assetClasses = assetConfig\?\.classes \?\? \[\]\n/, '');

const btnRegex = /<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?setShowAddClass[\s\S]*?\}\}[\s\S]*?>[\s\S]*?\{showAddClass \? \"Close\" : \"\+ Add New Class\"\}[\s\S]*?<\/button>/;
const newBtn = `<button
                    onClick={() => router.push("/director-screen/new-class-modal")}
                    className="text-[14.86px] leading-[21.23px] font-bold text-[#3B5BDB]"
                  >
                    + Add New Class
                  </button>`;
content = content.replace(btnRegex, newBtn);

const inlineFormRegex = /\{showAddClass \? \([\s\S]*?\) : null\}/;
content = content.replace(inlineFormRegex, '');

content = content.replace(/const \[showAddClass, setShowAddClass\] = useState\(false\)\n/, '');
content = content.replace(/const \[classForm, setClassForm\] = useState\(\{[\s\S]*?\}\)\n/, '');
content = content.replace(/const \[classSaving, setClassSaving\] = useState\(false\)\n/, '');
content = content.replace(/const \[classMessage, setClassMessage\] = useState<string \| null>\(null\)\n/, '');
content = content.replace(/const \[classError, setClassError\] = useState<string \| null>\(null\)\n/, '');

const handleAddRegex = /const handleAddClass = async \(\) => \{[\s\S]*?finally \{\s*setClassSaving\(false\)\n\s*\}\n\s*\}/;
content = content.replace(handleAddRegex, '');

content = content.replace(/\{loading \? \"Loading asset classes\.\.\.\" : \"No asset classes configured yet\.\"}/, '{assetClassesLoading ? "Loading asset classes..." : "No asset classes configured yet."}');

fs.writeFileSync(fpath, content, 'utf8');
console.log('Updated', fpath);
