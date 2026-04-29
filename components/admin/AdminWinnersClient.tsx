"use client";

import { useState } from 'react';

export default function AdminWinnersClient({ initialWinners }: { initialWinners: any[] }) {
  const [winners, setWinners] = useState(initialWinners);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredWinners = filterStatus === 'all' ? winners : winners.filter(w => w.status === filterStatus);

  const handleReview = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/winners/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        setWinners(winners.map(w => w.id === id ? data : w));
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Error updating winner status');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl text-primary">Manage Winners</h1>
      
      <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm">
        <div className="mb-6">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 border border-[#E5E7EB] rounded-[8px]">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-sm text-text-muted">
                <th className="pb-3">Name</th>
                <th className="pb-3">Draw</th>
                <th className="pb-3">Tier</th>
                <th className="pb-3">Prize</th>
                <th className="pb-3">Proof</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredWinners.map(w => (
                <tr key={w.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                  <td className="py-4 font-bold text-text-dark">{w.users?.full_name}</td>
                  <td className="py-4">{new Date(w.draws?.month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                  <td className="py-4">{w.tier} Match</td>
                  <td className="py-4">£{Number(w.prize_amount).toFixed(2)}</td>
                  <td className="py-4">
                    {w.proof_url ? (
                      <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent font-bold underline">View Proof</a>
                    ) : (
                      <span className="text-text-muted">None</span>
                    )}
                  </td>
                  <td className="py-4 capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${w.status === 'paid' ? 'bg-[#ECFDF5] text-success' : w.status === 'approved' ? 'bg-[#EFF6FF] text-[#1E3A8A]' : w.status === 'rejected' ? 'bg-[#FEF2F2] text-danger' : 'bg-amber-100 text-amber-800'}`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-2">
                    {w.status === 'pending' && w.proof_url && (
                      <>
                        <button onClick={() => handleReview(w.id, 'approve')} className="bg-success text-white px-3 py-1 rounded text-xs font-bold">Approve</button>
                        <button onClick={() => handleReview(w.id, 'reject')} className="bg-danger text-white px-3 py-1 rounded text-xs font-bold">Reject</button>
                      </>
                    )}
                    {w.status === 'approved' && (
                      <button onClick={() => handleReview(w.id, 'mark_paid')} className="bg-primary text-white px-3 py-1 rounded text-xs font-bold">Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
