import React, { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldAlert, Loader2, Info } from "lucide-react";

const Settings = ({ token, onToggle2FASetup }) => {
  const [setupAllowed, setSetupAllowed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Load current 2FA setup setting
  useEffect(() => {
    const load2FAStatus = async () => {
      try {
        const response = await fetch("/api/auth/2fa-status");
        const data = await response.json();
        setSetupAllowed(data.setupAllowed);
      } catch (err) {
        console.error("Error loading 2FA status:", err);
      }
    };

    load2FAStatus();
  }, []);

  const handleToggle2FASetup = async () => {
    const newState = !setupAllowed;
    const confirmMessage = newState
      ? "Enable 2FA setup on login page?"
      : "Disable 2FA setup? Users won't be able to setup new 2FA, but existing users can still login.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/toggle-2fa-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: newState }),
      });

      const data = await response.json();

      if (response.ok) {
        setSetupAllowed(newState);
        setMessage(data.message);
        setMessageType("success");
        if (onToggle2FASetup) {
          onToggle2FASetup(newState);
        }
      } else {
        setMessage(data.error || "Failed to toggle 2FA setup");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Network error occurred");
      setMessageType("error");
    }

    setLoading(false);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-green-600/10 rounded-xl">
          <Shield className="text-green-500" size={24} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Security Settings
        </h2>
      </div>

      <div className="space-y-8">
        {/* 2FA Setup Control Section */}
        <div className=" p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={20} />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                Two-Factor Authentication
              </h3>
            </div>
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                setupAllowed
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-red-500/10 text-red-500 border border-red-500/20"
              }`}
            >
              {setupAllowed ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-zinc-400 text-sm leading-relaxed">
              Control whether new users can set up Google Authenticator.
              Disabling this will hide the setup button from the login screen,
              preventing new 2FA registrations while allowing existing users to
              log in securely.
            </p>

            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <Info className="text-blue-500 mt-0.5" size={16} shrink={0} />
              <p className="text-xs text-blue-400 font-medium">
                {setupAllowed
                  ? "The 'Setup 2FA' button is currently visible on the login page."
                  : "The 'Setup 2FA' button is currently hidden. Only existing codes are accepted."}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle2FASetup}
            disabled={loading}
            className={`w-full py-4 px-6 font-black rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${
              setupAllowed
                ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10"
                : "bg-green-600 hover:bg-green-500 text-black shadow-lg shadow-green-600/10"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : setupAllowed ? (
              <ShieldAlert size={20} />
            ) : (
              <ShieldCheck size={20} />
            )}
            {setupAllowed ? "Disable New Setup" : "Enable New Setup"}
          </button>
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              messageType === "success"
                ? "bg-green-500/5 border-green-500/20 text-green-500"
                : "bg-red-500/5 border-red-500/20 text-red-500"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                messageType === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <p className="text-sm font-bold uppercase tracking-wider">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
