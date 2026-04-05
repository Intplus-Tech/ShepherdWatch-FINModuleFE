import Redis from "ioredis";

type RefreshSession = {
  userId: string;
  expires: number;
};

const redisUrl = process.env.REDIS_URL;
const isProd = process.env.NODE_ENV === "production";

const redis = redisUrl ? new Redis(redisUrl) : null;

const refreshSessions = new Map<string, RefreshSession>();

const refreshKey = (tokenId: string) => `refresh:${tokenId}`;
const refreshUserKey = (userId: string) => `refresh_user:${userId}`;

const ensureRedis = () => {
  if (!redis) {
    if (isProd) {
      throw new Error("REDIS_URL is required in production for refresh tokens.");
    }
    return false;
  }
  return true;
};

export const refreshStore = {
  add: async (tokenId: string, userId: string, expiresAtMs: number) => {
    if (!ensureRedis()) {
      refreshSessions.set(tokenId, { userId, expires: expiresAtMs });
      return;
    }

    const ttlSeconds = Math.max(1, Math.floor((expiresAtMs - Date.now()) / 1000));
    await redis!.multi()
      .set(refreshKey(tokenId), userId, "EX", ttlSeconds)
      .sadd(refreshUserKey(userId), tokenId)
      .expire(refreshUserKey(userId), ttlSeconds)
      .exec();
  },

  hasValid: async (tokenId: string) => {
    if (!ensureRedis()) {
      const session = refreshSessions.get(tokenId);
      if (!session) return false;
      if (session.expires < Date.now()) {
        refreshSessions.delete(tokenId);
        return false;
      }
      return true;
    }

    const exists = await redis!.exists(refreshKey(tokenId));
    return exists === 1;
  },

  delete: async (tokenId: string) => {
    if (!ensureRedis()) {
      refreshSessions.delete(tokenId);
      return;
    }

    const userId = await redis!.get(refreshKey(tokenId));
    const multi = redis!.multi().del(refreshKey(tokenId));
    if (userId) {
      multi.srem(refreshUserKey(userId), tokenId);
    }
    await multi.exec();
  },

  deleteAllForUser: async (userId: string) => {
    if (!ensureRedis()) {
      for (const [tokenId, session] of refreshSessions.entries()) {
        if (session.userId === userId) {
          refreshSessions.delete(tokenId);
        }
      }
      return;
    }

    const tokenIds = await redis!.smembers(refreshUserKey(userId));
    if (tokenIds.length > 0) {
      const multi = redis!.multi();
      tokenIds.forEach((tokenId) => multi.del(refreshKey(tokenId)));
      multi.del(refreshUserKey(userId));
      await multi.exec();
    } else {
      await redis!.del(refreshUserKey(userId));
    }
  },
};
