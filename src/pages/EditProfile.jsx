import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig"; // <-- adjust to your paths
import {
  updateProfile as fbUpdateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Shield, User, Loader2, CheckCircle2, AlertCircle,Calendar, Lock } from "lucide-react";
import { toast } from "react-toastify";
export default function ProfileUpdatePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [providers, setProviders] = useState([]);
  const hasPassword = useMemo(() => providers.includes("password"), [providers]);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPw, setShowPw] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          toast.error("You must be signed in to edit your profile." )
          setLoading(false);
          return;
        }
        setEmail(user.email || "");
        setProviders(user.providerData?.map((p) => p.providerId) || []);
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data();
          console.log('d is',d)
          setLocation(d.location || "");
          setDisplayName(d.displayName || "");
        }
      } catch (e) {
        toast.error("Failed to load profile." )
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  async function onSaveProfile(e) {
    e?.preventDefault();
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not signed in.");
      if (displayName && displayName !== user.displayName) {
        console.log('came under fbUpdate Profile')
        await fbUpdateProfile(user, { displayName });
      }
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          displayName: displayName || user.displayName || "",
          email: user.email || email,
          location: location || "",
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );
      console.log('came here after merging')
      toast.success("Your profile was updated successfully")
    } catch (e) {
      console.log('entered catch block')
      toast.error("Your Profile could not be saved successfully! Please try again.")
    } finally {
      setSaving(false);
    }
  }
  async function onUpdatePassword(e) {
    e?.preventDefault();
    if (!hasPassword) return;
    if (!currentPwd || !newPwd) {
      toast.error("Please enter current and new password" )
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Your previous and current password do not match!")
      return;
    }
    if (newPwd.length < 6) {
      toast.error("Use atleast 6 characters for the new password.")
      return;
    }
    setPwSaving(true);
    try {
      const user = auth.currentUser;
      if (!user?.email) throw new Error("Not signed in.");
      const cred = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPwd);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      toast.success("Your password was saved successfully!")
    } catch (e) {
      let msg = e?.message || "Failed to update password.";
      if (e?.code === "auth/wrong-password") msg = "Current password is incorrect.";
      if (e?.code === "auth/weak-password") msg = "New password is too weak.";
      if (e?.code === "auth/requires-recent-login") msg = "Please sign in again and retry.";
      toast.error(msg)
    } finally {
      setPwSaving(false);
    }
  }
  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-4">
        <div className="flex items-center gap-2 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>
      </div>
    );
  }
  return (
    <>
    <div className="max-w-4xl mx-auto">
<div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-4 sm:p-6 mb-6 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
     <div
  className="w-12 h-12 aspect-square rounded-xl
             bg-gradient-to-r from-blue-500 to-pink-500
             flex items-center justify-center
             ring-1 ring-indigo-200/60 shadow-sm
             shrink-0 flex-none"
>
  <img
    src="/translogo.png"                     
    alt="SafeAlly logo"
    className="block object-contain max-w-[72%] max-h-[72%] select-none pointer-events-none"
    draggable="false"
  />
</div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Add/Edit Profile Details</h1>
            <p className="text-sm text-gray-600">Add/Update your profile details on this page </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{getCurrentDate()}</span>
        </div>
      </div>
  </div>
</div>
    <div className="px-3 sm:px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-10">
            {/* Section: Profile */}
            <section>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-4">Profile</h3>
              <form onSubmit={onSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      value={email}
                      disabled
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-gray-600"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const u = auth.currentUser;
                      setDisplayName("");
                      setLocation("");
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border text-white bg-[#8789C0] hover:bg-[#8789C0]"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1e3a8a] text-white disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            </section>
            <div className="h-px bg-gray-100" />
            <section>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4">
                <User className="h-4 w-4 text-[#1e3a8a]" />
                <span className="truncate">Sign-in method: {providers.length ? providers.join(", ") : "—"}</span>
              </div>
              {hasPassword ? (
                <form onSubmit={onUpdatePassword} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                      <input
                        type={showPw ? "text" : "password"}
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                      <input
                        type={showPw ? "text" : "password"}
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="At least 6 characters"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                      <input
                        type={showPw ? "text" : "password"}
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
                         placeholder="Confirm new password"
                      />
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <input id="showpw" type="checkbox" className="rounded" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
                        <label htmlFor="showpw">Show passwords</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={pwSaving}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-60"
                    >
                      {pwSaving ? "Updating…" : "Update password"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-xl border border-purple-100 bg-gray-200 p-4 text-sm text-[#1e3a8a]">
                  <div className="font-medium mb-1 flex items-center gap-2"><Lock className="h-4 w-4" /> Password not available</div>
                  <p>
                    You currently sign in with Google. There’s no password to change here. To manage your Google password, visit
                    {" "}
                    <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline">Google Account › Security</a>.
                  </p>
                </div>
              )}
            </section>
           
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
