import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaHome,
  FaClipboardList,
  FaSyncAlt,
  FaTasks,
  FaUsersCog,
  FaChevronDown,
  FaChevronRight,
  FaPlus,
  FaUserCircle,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

// Contract:
// props: { isOpen: boolean, onClose?: () => void }
// Renders a responsive side navigation with crisp dark & light mode styling.
const SideNavbar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [openGroups, setOpenGroups] = useState({
    0: true, // Overview open by default
    1: true, // Tasks open by default
  });

  const toggleGroup = (index) => {
    setOpenGroups(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const navGroups = useMemo(
    () => {
      const groups = [
        {
          title: "Overview",
          links: [
            { to: "/dashboard", label: "Dashboard", icon: <FaHome /> },
            { to: "/profile", label: "My Profile", icon: <FaUserCircle /> },
          ]
        },
        {
          title: "Tasks",
          links: [
            { to: "/my-tasks", label: "Tasks", icon: <FaClipboardList /> },
            { to: "/follow-ups", label: "Follow Ups", icon: <FaTasks /> },
            { to: "/create-task", label: "Create Task", icon: <FaPlus /> },
            { to: "/recurring-tasks", label: "Recurring Reminders", icon: <FaSyncAlt /> },
            { to: "/create-recurring-task", label: "Create Recurring Reminder", icon: <FaPlus /> },
          ]
        }
      ];

      // Add admin panel for admins
      if (user?.role === 'Admin') {
        groups.push({
          title: "Administration",
          links: [
            { to: "/admin", label: "Admin Panel", icon: <FaUsersCog /> },
          ]
        });
      }

      return groups;
    },
    [user]
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity z-30 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar - Drawer Overlay */}
      <aside
        className={`bg-white dark:bg-neutral-900 border-r border-border w-72
          fixed top-14 left-0 z-40 overflow-y-auto custom-scrollbar
          h-[calc(100vh-3.5rem)] shadow-xl shadow-black/10 dark:shadow-black/40
          transition-transform duration-300 ease-in-out
          ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Workspace Menu
          </span>
          {onClose && (
            <button
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <IoClose className="text-lg" />
            </button>
          )}
        </div>

        {/* Nav Groups */}
        <nav className="p-3 space-y-3">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="border-b border-border/60 pb-3 last:border-b-0">
              <button
                onClick={() => toggleGroup(groupIndex)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <span className="uppercase tracking-wider text-[11px]">{group.title}</span>
                {openGroups[groupIndex] ? (
                  <FaChevronDown className="text-neutral-400 dark:text-neutral-500 text-[10px]" />
                ) : (
                  <FaChevronRight className="text-neutral-400 dark:text-neutral-500 text-[10px]" />
                )}
              </button>

              {openGroups[groupIndex] && (
                <div className="mt-1 space-y-1">
                  {group.links.map(({ to, label, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isActive
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs"
                            : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:text-foreground"
                        }`
                      }
                    >
                      <span className="text-base shrink-0 opacity-80">{icon}</span>
                      <span className="truncate">{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default SideNavbar;
