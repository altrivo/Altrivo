"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TeamMember } from "@/lib/settings";
import { ArrowRight } from "lucide-react";

interface Props {
  members: TeamMember[];
  onUpdateMembers: (members: TeamMember[]) => void;
}

export function TeamMembersTab({ members, onUpdateMembers }: Props) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Editor" | "Viewer">("Editor");
  const [inviteName, setInviteName] = useState("");

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name: inviteName.trim() || inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      status: "Pending",
      addedAt: new Date().toISOString().split("T")[0],
    };

    onUpdateMembers([...members, newMember]);
    setInviteEmail("");
    setInviteName("");
    setShowInviteModal(false);
  };

  const handleRemoveMember = (id: string) => {
    onUpdateMembers(members.filter((m) => m.id !== id));
  };

  const handleChangeRole = (id: string, role: "Admin" | "Editor" | "Viewer") => {
    onUpdateMembers(
      members.map((m) => (m.id === id ? { ...m, role } : m))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-card border border-default shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-heading" style={{ fontFamily: "var(--font-display)" }}>
            Team &amp; Access Management
          </h3>
          <p className="text-xs text-subtle mt-1 max-w-lg">
            Grant staff, managers, or external agencies access to your vendor dashboard with granular permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="px-5 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-on-primary text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Members List Table */}
      <div className="p-6 rounded-2xl bg-card border border-default shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-default pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-heading">
            Current Members ({members.length})
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-subtle">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success-500" /> Admin (Full Control)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-info-500" /> Editor (Manage Products/Orders)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-body">
            <thead className="bg-muted text-[11px] uppercase text-subtle font-semibold border-b border-default">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-page transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-default bg-muted shrink-0">
                        <Image src={member.avatar} alt={member.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-heading text-sm">{member.name}</p>
                        <p className="text-xs text-subtle">{member.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleChangeRole(member.id, e.target.value as "Admin" | "Editor" | "Viewer")
                      }
                      className="h-8 px-2.5 rounded-lg border border-default bg-input text-xs font-semibold text-heading focus:outline-none focus:border-primary-500 cursor-pointer"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        member.status === "Active"
                          ? "bg-success-50 text-success-700 border-success-200"
                          : "bg-warning-50 text-warning-700 border-warning-200"
                      }`}
                    >
                      {member.status === "Active" ? "Active" : "Invite Sent"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-subtle font-mono">{member.addedAt}</td>

                  <td className="py-3.5 px-4 text-right">
                    {member.role !== "Admin" ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-xs font-medium text-error-600 hover:text-error-800 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-xs text-subtle italic">Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSendInvite}
            className="bg-card border border-default max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-default pb-3">
              <h3 className="text-base font-bold text-heading">Invite Team Member</h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-subtle hover:text-heading font-bold"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Full Name (Optional)</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Tariq Mahmood"
                className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@apexartisans.com"
                className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heading mb-1">Role Permission *</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "Admin" | "Editor" | "Viewer")}
                className="w-full h-11 px-3.5 rounded-xl border border-default bg-input text-heading text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="Admin">Admin (Full Access &amp; Billing)</option>
                <option value="Editor">Editor (Manage Inventory &amp; Orders)</option>
                <option value="Viewer">Viewer (Read-only Analytics)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-xs font-medium text-body hover:text-heading"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary-500 text-on-primary text-xs font-bold hover:bg-primary-600 inline-flex items-center gap-1.5"
              >
                <span>Send Invitation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
