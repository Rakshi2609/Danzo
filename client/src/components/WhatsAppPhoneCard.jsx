import React, { useEffect, useState } from "react";
import { userService } from "../services/taskService";
import toast from "react-hot-toast";
import { FaWhatsapp, FaCheck, FaPencilAlt } from "react-icons/fa";

// Card that lets a user set/update their WhatsApp number (digits only, with country code).
const WhatsAppPhoneCard = ({ user, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Always fetch fresh profile — AuthContext user may be stale (saved before phone was set)
  useEffect(() => {
    userService.getCurrentUser()
      .then((res) => setPhone(res.data?.user?.phone || res.data?.phone || ""))
      .catch(() => setPhone(user?.phone || ""));
  }, []);

  const save = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits && (digits.length < 10 || digits.length > 15)) {
      toast.error("Enter number with country code, e.g. 918660677696");
      return;
    }
    setSaving(true);
    try {
      const res = await userService.updateProfile({ phone: digits });
      toast.success(res.data.phone ? "WhatsApp number saved ✅" : "WhatsApp number cleared");
      setEditing(false);
      setPhone(res.data.phone || "");
      if (onUpdated) onUpdated(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save number");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative z-10 p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-xl border border-border shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
          <FaWhatsapp className="text-sm" />
        </span>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Notifications
          </p>
          <h3 className="text-sm sm:text-[15px] font-semibold leading-tight text-foreground">
            WhatsApp Reminders
          </h3>
        </div>
      </div>

      {editing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="918660677696"
            className="flex-1 h-9 px-3 rounded-lg border border-border bg-neutral-50 dark:bg-neutral-950 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          />
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-all hover:bg-zinc-800 active:bg-zinc-950 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
          >
            <FaCheck className="text-xs" /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {phone ? (
              <>
                Daily task digests delivered to{" "}
                <span className="font-semibold text-foreground tabular-nums">+{phone}</span>
              </>
            ) : (
              "No WhatsApp number set — add one to get morning & evening task summaries."
            )}
          </p>
          <button
            onClick={() => { setEditing(true); }}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-white dark:bg-neutral-900 px-3 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 cursor-pointer"
          >
            <FaPencilAlt className="text-[10px]" /> {phone ? "Change" : "Add Number"}
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatsAppPhoneCard;
