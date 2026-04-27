import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useSessions(selectedSessionId: string | null) {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/sessions?page=1&limit=20');
      return res.data?.data?.data ?? [];
    }
  });

  const sessionDetailsQuery = useQuery({
    queryKey: ['session', selectedSessionId],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/sessions/${selectedSessionId}`);
      return res.data?.data;
    },
    enabled: !!selectedSessionId
  });

  const revokeAllMutation = useMutation({
    mutationFn: async (currentSessionId: string | null) => {
      const res = await axios.post("/api/v1/sessions/revoke-all", currentSessionId ? { currentSessionId } : {});
      return res.data;
    },
    onSuccess: (data, currentSessionId) => {
      queryClient.setQueryData(['sessions'], (old: any) => {
        if (!old) return old;
        return old.map((session: any) => {
          const sessionId = String(session?._id ?? session?.id ?? "");
          return { ...session, isActive: currentSessionId ? sessionId === currentSessionId : false };
        });
      });
    }
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await axios.patch(`/api/v1/sessions/${sessionId}/revoke`);
      return res.data;
    },
    onSuccess: (data, sessionId) => {
      queryClient.setQueryData(['sessions'], (old: any) => {
        if (!old) return old;
        return old.map((session: any) =>
          session._id === sessionId ? { ...session, isActive: false } : session
        );
      });
      if (selectedSessionId === sessionId) {
        queryClient.setQueryData(['session', sessionId], (old: any) => old ? { ...old, isActive: false } : old);
      }
    }
  });

  return {
    sessions: sessionsQuery.data ?? [],
    sessionsLoading: sessionsQuery.isLoading,
    sessionsError: sessionsQuery.error ? (sessionsQuery.error as Error).message : null,
    
    selectedSession: sessionDetailsQuery.data ?? null,
    sessionDetailsLoading: sessionDetailsQuery.isLoading,
    sessionDetailsError: sessionDetailsQuery.error ? (sessionDetailsQuery.error as Error).message : null,

    revokeAllSessions: revokeAllMutation.mutate,
    revokingSessions: revokeAllMutation.isPending,
    revokeAllError: revokeAllMutation.error ? (revokeAllMutation.error as Error).message : null,
    revokeAllSuccess: revokeAllMutation.isSuccess ? "All sessions revoked successfully." : null,

    revokeSession: revokeMutation.mutate,
    revokingSessionId: revokeMutation.isPending ? revokeMutation.variables : null,
    revokeSessionError: revokeMutation.error ? (revokeMutation.error as Error).message : null,
  };
}
