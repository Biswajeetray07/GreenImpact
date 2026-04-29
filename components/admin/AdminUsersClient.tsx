"use client";

import { useState } from 'react';
import { Pencil, X, Check, Trash2 } from 'lucide-react';

export default function AdminUsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');

  // Edit Profile Modal
  const [editUser, setEditUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Scores Modal
  const [scoresUser, setScoresUser] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState('');
  const [scoreActionLoading, setScoreActionLoading] = useState<string | null>(null);

  // Toggle Sub
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Edit Profile ──
  const openEdit = (user: any) => {
    setEditUser(user);
    setEditName(user.full_name);
    setEditEmail(user.email);
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_profile', full_name: editName, email: editEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u.id === editUser.id ? data : u));
        setEditUser(null);
      } else {
        alert(data.error || 'Error updating user');
      }
    } catch (e) {
      alert('Error updating user');
    } finally {
      setEditLoading(false);
    }
  };

  // ── View/Edit Scores ──
  const openScores = async (user: any) => {
    setScoresUser(user);
    setScoresLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      if (res.ok) {
        setScores(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScoresLoading(false);
    }
  };

  const handleScoreUpdate = async (scoreId: string) => {
    const parsed = parseInt(editScoreValue, 10);
    if (!parsed || parsed < 1 || parsed > 45) {
      alert('Score must be between 1 and 45.');
      return;
    }
    setScoreActionLoading(scoreId);
    try {
      const res = await fetch(`/api/admin/users/${scoresUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_score', scoreId, score: parsed })
      });
      if (res.ok) {
        setScores(scores.map(s => s.id === scoreId ? { ...s, score: parsed } : s));
        setEditingScoreId(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Error updating score');
      }
    } catch (e) {
      alert('Error updating score');
    } finally {
      setScoreActionLoading(null);
    }
  };

  const handleScoreDelete = async (scoreId: string) => {
    if (!confirm('Delete this score entry?')) return;
    setScoreActionLoading(scoreId);
    try {
      const res = await fetch(`/api/admin/users/${scoresUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_score', scoreId })
      });
      if (res.ok) {
        setScores(scores.filter(s => s.id !== scoreId));
      } else {
        const data = await res.json();
        alert(data.error || 'Error deleting score');
      }
    } catch (e) {
      alert('Error deleting score');
    } finally {
      setScoreActionLoading(null);
    }
  };

  // ── Toggle Subscription ──
  const handleToggleSub = async (userId: string) => {
    setToggleLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_subscription' })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? data : u));
      } else {
        alert(data.error || 'Error toggling subscription');
      }
    } catch (e) {
      alert('Error toggling subscription');
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl text-primary">Manage Users</h1>

      <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-sm text-text-muted">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Sub End</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredUsers.map(u => {
                const sub = u.subscriptions && u.subscriptions.length > 0 ? u.subscriptions[0] : null;
                const end = sub && sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('en-GB') : '-';

                return (
                  <tr key={u.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-4 font-bold text-text-dark">{u.full_name}</td>
                    <td className="py-4 text-text-muted">{u.email}</td>
                    <td className="py-4 capitalize">{sub?.plan || '-'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${sub?.status === 'active' ? 'bg-[#ECFDF5] text-success' : 'bg-gray-100 text-gray-600'}`}>
                        {sub?.status || 'inactive'}
                      </span>
                    </td>
                    <td className="py-4 text-text-muted">{end}</td>
                    <td className="py-4 text-right space-x-3">
                      <button onClick={() => openEdit(u)} className="text-primary hover:text-accent font-bold transition-colors">Edit</button>
                      <button onClick={() => openScores(u)} className="text-primary hover:text-accent font-bold transition-colors">Scores</button>
                      <button
                        onClick={() => handleToggleSub(u.id)}
                        disabled={toggleLoading === u.id}
                        className="text-text-muted hover:text-primary font-bold transition-colors"
                      >
                        {toggleLoading === u.id ? '...' : 'Toggle Sub'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB] rounded-t-[24px]">
              <h3 className="font-serif text-2xl text-primary">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="text-text-muted hover:text-text-dark p-2 rounded-full hover:bg-[#E5E7EB] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-text-dark mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-dark mb-1">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setEditUser(null)} className="px-5 py-2 rounded-[8px] font-bold text-text-muted hover:bg-[#F9FAFB]">Cancel</button>
                <button
                  onClick={handleEditSave}
                  disabled={editLoading}
                  className="px-5 py-2 rounded-[8px] font-bold bg-primary text-white hover:bg-[#152e23] transition-colors"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Scores Modal ── */}
      {scoresUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB] rounded-t-[24px]">
              <div>
                <h3 className="font-serif text-2xl text-primary">Scores</h3>
                <p className="text-sm text-text-muted mt-1">{scoresUser.full_name} ({scoresUser.email})</p>
              </div>
              <button onClick={() => { setScoresUser(null); setEditingScoreId(null); }} className="text-text-muted hover:text-text-dark p-2 rounded-full hover:bg-[#E5E7EB] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              {scoresLoading ? (
                <div className="text-center py-12 text-text-muted">Loading scores...</div>
              ) : scores.length === 0 ? (
                <div className="text-center py-12 text-text-muted italic">No scores recorded for this user.</div>
              ) : (
                <div className="space-y-3">
                  {scores.map(s => {
                    const dateStr = new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    return (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB]">
                        <div>
                          <p className="text-sm text-text-muted">{dateStr}</p>
                          {editingScoreId === s.id ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="number"
                                min="1"
                                max="45"
                                value={editScoreValue}
                                onChange={(e) => setEditScoreValue(e.target.value)}
                                className="w-20 px-2 py-1 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                              />
                              <button
                                disabled={scoreActionLoading === s.id}
                                onClick={() => handleScoreUpdate(s.id)}
                                className="text-success hover:text-opacity-80 p-1"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                disabled={scoreActionLoading === s.id}
                                onClick={() => setEditingScoreId(null)}
                                className="text-danger hover:text-opacity-80 p-1"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <p className="font-bold text-xl text-text-dark">{s.score} pts</p>
                          )}
                        </div>
                        {editingScoreId !== s.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingScoreId(s.id); setEditScoreValue(s.score.toString()); }}
                              disabled={scoreActionLoading === s.id}
                              className="text-text-muted hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleScoreDelete(s.id)}
                              disabled={scoreActionLoading === s.id}
                              className="text-text-muted hover:text-danger p-2 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
