"use client";

import React, { useState } from "react";
import { SecuritySession } from "@/lib/settings";

interface Props {
  sessions: SecuritySession[];
  onUpdateSessions: (sessions: SecuritySession[]) => void;
}

export function SecurityTab({ sessions, onUpdateSessions }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [revokedNotice, setRevokedNotice] = useState(false);

  const calculateStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const strengthScore = calculateStrength(newPassword);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordStatus("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordStatus("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordStatus(""), 3000);
  };

  const handleRevokeSession = (id: string) => {
    onUpdateSessions(sessions.filter((s) => s.id !== id));
  };

  const handleLogoutEverywhere = () => {
    // Keep only the current session
    onUpdateSessions(sessions.filter((s) => s.current));
    setRevokedNotice(true);
    setTimeout(() => setRevokedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Change Password Card */}
      <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-card border border-default shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
            Change Password
          </h3>
          <p className="text-xs text-subtle mt-1">
            Ensure your account uses a long, random password to prevent unauthorized access.
          </p>
        </div>

        {passwordStatus && (
          <div className="p-3.5 rounded-xl bg-success-50 border border-success-200 text-success-800 text-xs font-semibold flex items-center gap-2">
            ✓ {passwordStatus}
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-error-50 border border-error-200 text-error-800 text-xs font-semibold flex items-center gap-2">
            ⚠ {passwordError}
          </div>
        )}

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 transition-all"
            />

            {/* Password Strength Meter */}
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-subtle font-medium">
                  <span>Strength</span>
                  <span className="font-semibold text-heading">
                    {strengthScore < 50 ? "Weak" : strengthScore < 75 ? "Medium" : "Strong"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strengthScore < 50 ? "bg-error-500" : strengthScore < 75 ? "bg-warning-500" : "bg-success-500"
                    }`}
                    style={{ width: `${strengthScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-heading mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="flex justify-start pt-2 border-t border-default">
          <button
            type="submit"
            className="px-6 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-on-primary text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Update Password
          </button>
        </div>
      </form>

      {/* Active Sessions Card */}
      <div className="p-6 rounded-2xl bg-card border border-default shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
              Active Login Sessions
            </h3>
            <p className="text-xs text-subtle mt-1">
              Devices and locations currently authenticated into your vendor account.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogoutEverywhere}
            className="px-4 py-2.5 rounded-xl border border-error-200 bg-error-50 hover:bg-error-100 text-error-700 text-xs font-bold transition-all cursor-pointer"
          >
            Logout Everywhere Else
          </button>
        </div>

        {revokedNotice && (
          <div className="p-3.5 rounded-xl bg-success-50 border border-success-200 text-success-800 text-xs font-semibold flex items-center gap-2">
            ✓ Revoked all other active sessions successfully!
          </div>
        )}

        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="p-4 rounded-xl border border-default bg-page flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-card border border-default text-xl">
                  💻
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-heading">{sess.device}</h4>
                    {sess.current && (
                      <span className="px-2 py-0.5 rounded-full bg-success-50 text-success-700 border border-success-200 text-[10px] font-bold">
                        This Device
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-subtle mt-0.5">
                    {sess.location} &bull; IP: <span className="font-mono">{sess.ip}</span> &bull; Last active: {sess.lastActive}
                  </p>
                </div>
              </div>

              {!sess.current && (
                <button
                  type="button"
                  onClick={() => handleRevokeSession(sess.id)}
                  className="px-3 py-1.5 rounded-lg border border-default hover:bg-muted text-subtle hover:text-error-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
