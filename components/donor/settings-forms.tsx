"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Phone, Lock, Save, Trash2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsFormsProps {
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
}

export default function SettingsForms({ user }: SettingsFormsProps) {
  const { update } = useSession();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile.");
      
      // Update NextAuth local session storage
      await update({ name, email });
      setSuccess("Profile details updated successfully.");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password.");
      
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account.");
      // Logout
      window.location.href = "/";
    } catch (e: any) {
      setError(e.message || "Failed to delete account.");
      setDeleteConfirmOpen(false);
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      
      {/* LEFT COLUMN: Update Profile Form */}
      <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-3">
          <User className="h-4.5 w-4.5 text-primary" /> Profile Settings
        </h3>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-xl text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Full Name</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
              <User className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
              <Mail className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Phone Number</label>
            <div className="flex items-center bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5">
              <Phone className="h-4.5 w-4.5 text-slate-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-primary to-secondary text-xs font-bold text-white px-5 py-2.5 rounded-xl shadow-md shadow-primary/10 hover:opacity-95 flex items-center gap-1.5 hover:-translate-y-0.5 transition-all transform"
          >
            <Save className="h-4 w-4" /> Save Profile Details
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: Change Password & Danger Zone */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Security Password Form */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-850 pb-3">
            <Lock className="h-4.5 w-4.5 text-secondary" /> Change Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-medium">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-medium">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-medium">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white py-2.5 rounded-xl border border-slate-700/60 transition-all text-center"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-slate-950/45 border border-slate-900 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danger Zone</h3>
          <p className="text-[10px] text-slate-500 leading-normal">
            Deleting your account will permanently wipe your donor credentials and bookmark logs from TrustBridge databases.
          </p>

          {!deleteConfirmOpen ? (
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="h-4.5 w-4.5" /> Delete Account
            </button>
          ) : (
            <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-3">
              <div className="flex gap-1.5 text-rose-400 text-[10px] font-bold">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>Are you absolutely sure? This cannot be undone.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px]"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-lg text-[10px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
