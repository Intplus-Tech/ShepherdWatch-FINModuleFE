const fs = require('fs');
const files = [
  'app/(screens)/branch-admin/user-settings/page.tsx',
  'app/(screens)/branchaccount-pastor/settings/page.tsx',
  'app/(screens)/branchlead-pastor/settings/page.tsx',
  'app/(screens)/director-screen/settings/page.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.log('Not found:', f);
    return;
  }
  let content = fs.readFileSync(f, 'utf8');

  // Add useQuery import if not exists
  if (!content.includes('useQuery')) {
    content = content.replace(/import axios from "axios"\r?\n/, 'import axios from "axios";\nimport { useQuery, useQueryClient } from "@tanstack/react-query";\n');
  }

  // Inject queryClient
  if (!content.includes('useQueryClient()')) {
    content = content.replace(/export default function .*?\(\) \{\r?\n/, match => match + '  const queryClient = useQueryClient();\n');
  }

  const oldStatesRegex = /const \[selectedSession,\s*setSelectedSession\]\s*=\s*useState<any\s*\|\s*null>\(null\);?\s*const \[sessionDetailsLoading,\s*setSessionDetailsLoading\]\s*=\s*useState\(false\);?\s*const \[sessionDetailsError,\s*setSessionDetailsError\]\s*=\s*useState<string\s*\|\s*null>\(null\);?/m;
  const newStates = `const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { data: selectedSession, isLoading: sessionDetailsLoading, error: sessionDetailsErrorObj } = useQuery({
    queryKey: ['session', selectedSessionId],
    queryFn: async () => {
      const res = await axios.get(\`/api/v1/sessions/\${selectedSessionId}\`);
      return res.data?.data;
    },
    enabled: !!selectedSessionId
  });
  const sessionDetailsError = sessionDetailsErrorObj ? (sessionDetailsErrorObj as Error).message : null;`;
  
  content = content.replace(oldStatesRegex, newStates);

  const oldHandleView = /const handleViewSession = async \(sessionId: string\) => \{[\s\S]*?setSelectedSession\(data\?\.data \?\? null\);?\s*\} catch \(err: any\) \{[\s\S]*?\} finally \{[\s\S]*?\}\s*\}/;
  const newHandleView = `const handleViewSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  }`;
  
  content = content.replace(oldHandleView, newHandleView);

  const oldRevokeSet = /if \(selectedSession\?\._id === sessionId\) \{\s*setSelectedSession\(\{ \.\.\.selectedSession, isActive: false \}\);?\s*\}/;
  const newRevokeSet = `if (selectedSessionId === sessionId) {
        queryClient.setQueryData(['session', sessionId], (old: any) => old ? { ...old, isActive: false } : old);
      }`;
      
  content = content.replace(oldRevokeSet, newRevokeSet);

  fs.writeFileSync(f, content, 'utf8');
  console.log('Updated ' + f);
});
