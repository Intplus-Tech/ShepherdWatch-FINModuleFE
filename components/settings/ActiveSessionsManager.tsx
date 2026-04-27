"use client";

import React, { useState } from "react";
import { useSessions } from "@/components/hooks/useSessions";

export function ActiveSessionsManager() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const {
    sessions,
    sessionsLoading,
    sessionsError,
    selectedSession,
    sessionDetailsLoading,
    sessionDetailsError,
    revokeAllSessions,
    revokingSessions,
    revokeAllError,
    revokeAllSuccess,
    revokeSession,
    revokingSessionId,
    revokeSessionError,
  } = useSessions(selectedSessionId);

  const handleRevokeAll = () => {
    const currentSession = sessions.find((session: any) =>
      Boolean(session?.isCurrent ?? session?.isCurrentSession ?? session?.current ?? session?.currentDevice)
    );
    const currentSessionId = String(currentSession?._id ?? currentSession?.id ?? "");
    revokeAllSessions(currentSessionId);
  };

  const handleViewSession = (id: string) => {
    setSelectedSessionId(id);
  };

  const handleRevoke = (id: string) => {
    revokeSession(id);
  };

  const errorMsg = sessionsError || revokeAllError || revokeSessionError;

  return (
    <div className="mt-6 sm:mt-8 bg-white border text-left border-[#EEF1F6] shadow-[0px_2px_8px_rgba(0,0,0,0.02)] rounded-[16px] flex flex-col relative w-full overflow-hidden">
      <div className="p-6 sm:p-8 md:p-10 border-b border-[#EEF1F6] flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-[#111827] text-[18px] sm:text-[20px] font-[900] tracking-tight leading-none">Active Sessions</h3>
          <p className="text-[#6B7280] text-[13px] sm:text-[14px] font-[500] mt-1">
            Devices currently logged into your account.
          </p>
        </div>
        <button
          onClick={handleRevokeAll}
          disabled={revokingSessions}
          className="h-[38px] px-4 rounded-[8px] bg-[#2563EB] text-white text-[12.5px] font-[700] hover:bg-[#1D4ED8] transition-colors disabled:opacity-70 whitespace-nowrap"
        >
          {revokingSessions ? "Revoking..." : "Log out of all devices"}
        </button>
      </div>

      {sessionsLoading ? (
        <div className="p-6 sm:p-8 md:p-10 text-[#64748B] text-[14px]">Loading sessions...</div>
      ) : revokeAllSuccess ? (
        <div className="p-6 sm:p-8 md:p-10 text-emerald-600 text-[13.5px] font-[600]">{revokeAllSuccess}</div>
      ) : errorMsg ? (
        <div className="p-6 sm:p-8 md:p-10 text-rose-600 text-[13.5px] font-[600]">{errorMsg}</div>
      ) : sessions.length === 0 ? (
        <div className="p-6 sm:p-8 md:p-10 text-[#64748B] text-[14px]">No active sessions found.</div>
      ) : (
        <div className="p-6 sm:p-8 md:p-10 grid grid-cols-1 gap-4">
          {sessions.map((session: any) => (
            <div
              key={session._id}
              className="border border-[#EEF1F6] rounded-[12px] p-4 sm:p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-[#111827] text-[14px] font-[800]">
                  {session.device || "Unknown Device"}
                </div>
                <div className={`text-[12px] font-[700] ${session.isActive ? "text-emerald-600" : "text-[#94A3B8]"}`}>
                  {session.isActive ? "Active" : "Expired"}
                </div>
              </div>
              <div className="text-[#64748B] text-[13px] font-[500]">
                {session.browser || "Unknown Browser"} • {session.os || "Unknown OS"}
              </div>
              <div className="text-[#64748B] text-[12.5px] font-[500]">
                IP: {session.ipAddress || "Unknown"} • {session.location || "Unknown location"}
              </div>
              <div className="text-[#94A3B8] text-[12px] font-[500]">
                Created: {session.createdAt ? new Date(session.createdAt).toLocaleString() : "N/A"} •
                Expires: {session.expiresAt ? new Date(session.expiresAt).toLocaleString() : "N/A"}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleViewSession(session._id)}
                  className="text-[12px] font-[700] text-[#2563EB] hover:underline"
                >
                  View details
                </button>
                <button
                  onClick={() => handleRevoke(session._id)}
                  disabled={revokingSessionId === session._id || !session.isActive}
                  className="text-[12px] font-[700] text-rose-600 hover:underline disabled:opacity-60"
                >
                  {revokingSessionId === session._id ? "Revoking..." : "Revoke"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {sessionDetailsLoading ? (
        <div className="px-6 sm:px-8 md:px-10 pb-6 text-[#64748B] text-[13px]">Loading session details...</div>
      ) : sessionDetailsError ? (
        <div className="px-6 sm:px-8 md:px-10 pb-6 text-rose-600 text-[13px] font-[600]">{sessionDetailsError}</div>
      ) : selectedSession ? (
        <div className="px-6 sm:px-8 md:px-10 pb-6 text-[13px] text-[#64748B]">
          Viewing: {selectedSession.device || "Unknown Device"} • {selectedSession.browser || "Unknown Browser"} • {selectedSession.os || "Unknown OS"} • {selectedSession.location || "Unknown location"}
        </div>
      ) : null}
    </div>
  );
}
