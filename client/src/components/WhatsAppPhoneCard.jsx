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
      .then((res) => setPhone(res.data?.phone || ""))
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
    <div className="p-3 sm:p-4 bg-green-50 rounded-lg shadow-md border border-green-200 relative z-10">
      <h3 className="text-sm sm:text-base font-bold mb-2 text-green-800 flex items-center gap-2">
        <FaWhatsapp className="text-green-600" /> WhatsApp Reminders
      </h3>
      {editing ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="918660677696"
            className="flex-1 px-3 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
            disabled={saving}
          />
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <FaCheck /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm text-gray-700">
            {phone ? (
              <>Get daily task digests on <span className="font-bold">+{phone}</span></>
            ) : (
              "No WhatsApp number set — add one to get morning & evening task summaries."
            )}
          </p>
          <button
            onClick={() => { setEditing(true); }}
            className="px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 flex items-center gap-1"
          >
            <FaPencilAlt /> {phone ? "Change" : "Add Number"}
          </button>
        </div>
      )}
    </div>
  );
};

export default WhatsAppPhoneCard;
