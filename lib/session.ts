interface SessionData {
  userId: string;
  role: string;
  expires: number;
}

const sessions = new Map<string, SessionData>();

export const sessionStore = {
  createSession: (userId: string, data: Omit<SessionData, "userId">) => {
    sessions.set(userId, { userId, ...data });
  },

  getSession: (userId: string) => {
    const session = sessions.get(userId);
    if (!session) return null;
    if (session.expires < Date.now()) {
      sessions.delete(userId);
      return null;
    }
    return session;
  },

  deleteSession: (userId: string) => {
    sessions.delete(userId);
  },
};