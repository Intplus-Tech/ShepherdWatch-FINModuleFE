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

  // Add useMutation to import
  if (content.includes('@tanstack/react-query') && !content.includes('useMutation')) {
    content = content.replace(/useQuery,\s*useQueryClient/, 'useQuery, useMutation, useQueryClient');
  }

  const oldRevoke = /const handleRevokeSession = async \(sessionId: string\) => \{[\s\S]*?\} catch \(err: any\) \{[\s\S]*?\} finally \{[\s\S]*?\}\s*\};?/;
  
  const newRevoke = `const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await axios.patch(\`/api/v1/sessions/\${sessionId}/revoke\`);
      return res.data;
    },
    onMutate: (sessionId) => {
      setRevokingSessionId(sessionId);
      setSessionsError(null);
    },
    onSuccess: (data, sessionId) => {
      setSessions((prev) =>
        prev.map((session) =>
          session._id === sessionId ? { ...session, isActive: false } : session
        )
      );
      if (selectedSessionId === sessionId) {
        queryClient.setQueryData(['session', sessionId], (old: any) => old ? { ...old, isActive: false } : old);
      }
    },
    onError: (err: any) => {
      setSessionsError(err.response?.data?.message || err.message || "Unable to revoke session");
    },
    onSettled: () => {
      setRevokingSessionId(null);
    }
  });

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId);
  };`;

  content = content.replace(oldRevoke, newRevoke);
  fs.writeFileSync(f, content, 'utf8');
  console.log('Updated ' + f);
});
