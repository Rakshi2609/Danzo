import { useState, useEffect } from 'react';
import { userService } from '../services/taskService';
import toast from 'react-hot-toast';
import { FaCrown, FaUserShield, FaUserTie, FaUser, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import LoadingScreen from '../components/common/LoadingScreen';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateRole(userId, newRole);
      toast.success('User role updated successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'Manager':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'Member':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20';
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading administration console..." submessage="Fetching user directory & role policies" />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs">
            <FaCrown className="text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Admin Console</h2>
            <p className="text-xs text-muted-foreground">Manage workspace members, roles, and permissions</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-border">
          {users.length} Registered User{users.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Users Table Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-neutral-50/80 dark:bg-neutral-950/60">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  WhatsApp Phone
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Change Role
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white dark:bg-neutral-900">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.displayName}
                          className="h-9 w-9 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-foreground font-bold border border-border">
                          {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="text-sm font-semibold text-foreground">
                        {u.displayName || 'Unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-mono text-muted-foreground">
                      {u.phone ? `+${u.phone}` : <span className="italic opacity-60">None</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-4 font-bold rounded-lg ${getRoleBadgeColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium bg-neutral-50 dark:bg-neutral-950 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                    >
                      <option value="Member">Member</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg ${
                      u.isActive 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {u.isActive ? <FaCheckCircle className="text-[10px]" /> : <FaTimesCircle className="text-[10px]" />}
                      <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="bg-white dark:bg-neutral-900 border border-border rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
          <FaUserShield className="text-primary" />
          <span>Role Permission Matrix</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Admin</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Full workspace control. Manage user roles, access control, recurring bots, and workspace settings.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400">Manager</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Delegate and assign tasks to teammates, monitor follow-up completion, and configure recurring schedules.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Member</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create and execute tasks, log actual task time, update progress, and maintain login check-in streaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
