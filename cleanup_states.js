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

  if (!content.includes('ActiveSessionsManager')) {
    content = content.replace(/import \{ useAuth \} from \"@\/components\/auth\/AuthProvider\";?\r?\n/, 
      match => match + 'import { ActiveSessionsManager } from "@/components/settings/ActiveSessionsManager";\n');
  }

  content = content.replace(/import axios from \"axios\";?\r?\n/g, '');
  content = content.replace(/import \{ useQuery, useMutation, useQueryClient \} from \"@tanstack\/react-query\";?\r?\n/g, '');

  const statesRegex = /  const queryClient = useQueryClient\(\);\r?\n\s*const \[selectedSessionId, setSelectedSessionId\] = useState<string \| null>\(null\);\r?\n\s*const \{ data: selectedSession.*?\} = useQuery\(\{[\s\S]*?\}\);\s*const sessionDetailsError =.*?\r?\n/m;
  content = content.replace(statesRegex, '');
  
  const manualStatesRegex = /  const \[sessions, setSessions\] = useState<any\[\]>\(\[\]\);?\r?\n\s*const \[sessionsLoading, setSessionsLoading\] = useState\(true\);?\r?\n\s*const \[sessionsError, setSessionsError\] = useState<string \| null>\(null\);?\r?\n\s*const \[revokingSessions, setRevokingSessions\] = useState\(false\);?\r?\n\s*const \[revokeMessage, setRevokeMessage\] = useState<string \| null>\(null\);?\r?\n\s*const \[revokingSessionId, setRevokingSessionId\] = useState<string \| null>\(null\);?\r?\n/gm;
  content = content.replace(manualStatesRegex, '');

  const useEffectRegex = /  useEffect\(\(\) => \{\s*setSessionsLoading\(true\);?[\s\S]*?setSessionsLoading\(false\)\)?;?\s*\}, \[\]\);?\r?\n/gm;
  content = content.replace(useEffectRegex, '');

  const handleRevokeAllRegex = /  const handleRevokeAllSessions = async \(\) => \{[\s\S]*?finally \{\s*setRevokingSessions\(false\);?\s*\}\s*\};?\r?\n/gm;
  content = content.replace(handleRevokeAllRegex, '');

  const handleViewRegex = /  const handleViewSession = \(sessionId: string\) => \{\s*setSelectedSessionId\(sessionId\);?\s*\};?\r?\n/gm;
  content = content.replace(handleViewRegex, '');

  const handleRevokeRegex = /  const revokeSessionMutation = useMutation\(\{[\s\S]*?\}\);?\r?\n\r?\n  const handleRevokeSession = \(sessionId: string\) => \{\s*revokeSessionMutation.mutate\(sessionId\);?\s*\};?\r?\n/gm;
  content = content.replace(handleRevokeRegex, '');

  fs.writeFileSync(f, content, 'utf8');
  console.log('Cleaned up states in', f);
});
