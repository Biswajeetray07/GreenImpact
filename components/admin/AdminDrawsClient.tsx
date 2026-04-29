"use client";

import { useState } from 'react';

export default function AdminDrawsClient({ initialDraws }: { initialDraws: any[] }) {
  const [draws, setDraws] = useState(initialDraws);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Modal states
  const [showSimulate, setShowSimulate] = useState(false);
  const [simulateResult, setSimulateResult] = useState<any>(null);

  const [month, setMonth] = useState('');
  const [drawType, setDrawType] = useState('random');

  const handleCreate = async () => {
    try {
      const dateStr = month + '-01'; // YYYY-MM-01
      const res = await fetch('/api/admin/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: dateStr, drawType })
      });
      const data = await res.json();
      if (res.ok) {
        setDraws([data, ...draws]);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Error creating draw');
    }
  };

  const handleSimulate = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/draws/${id}/simulate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSimulateResult({ ...data, drawId: id });
        setShowSimulate(true);
        // Refresh local state to 'simulated'
        setDraws(draws.map(d => d.id === id ? { ...d, status: 'simulated', drawn_numbers: data.drawnNumbers, prize_pool_total: data.prizeBreakdown.total } : d));
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Error simulating');
    } finally {
      setLoadingId(null);
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm('Are you sure you want to publish this draw? This cannot be undone and will officially email winners.')) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/draws/${id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setDraws(draws.map(d => d.id === id ? { ...d, status: 'published' } : d));
        setShowSimulate(false);
        alert(`Published successfully! ${data.winnersCount} winners recorded.`);
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Error publishing');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl text-primary">Manage Draws</h1>
      
      <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-bold text-text-dark mb-2">Month</label>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-[8px]" />
        </div>
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-bold text-text-dark mb-2">Type</label>
          <select value={drawType} onChange={e => setDrawType(e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-[8px]">
            <option value="random">Random</option>
            <option value="algorithm">Algorithm (Weighted)</option>
          </select>
        </div>
        <button onClick={handleCreate} className="w-full sm:w-1/3 bg-primary text-white font-bold py-2 px-4 rounded-[8px] hover:bg-[#152e23]">
          Create Draw
        </button>
      </div>

      <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-sm text-text-muted">
                <th className="pb-3">Month</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Prize Pool</th>
                <th className="pb-3">Drawn Nums</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {draws.map(d => (
                <tr key={d.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                  <td className="py-4 font-bold text-text-dark">{new Date(d.month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                  <td className="py-4 capitalize">{d.draw_type}</td>
                  <td className="py-4">£{Number(d.prize_pool_total || 0).toFixed(2)}</td>
                  <td className="py-4 font-mono">{d.drawn_numbers ? d.drawn_numbers.join(', ') : '-'}</td>
                  <td className="py-4 capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${d.status === 'published' ? 'bg-[#ECFDF5] text-success' : d.status === 'simulated' ? 'bg-[#EFF6FF] text-[#1E3A8A]' : 'bg-gray-100 text-gray-600'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-3">
                    {d.status === 'draft' && (
                      <button onClick={() => handleSimulate(d.id)} disabled={loadingId === d.id} className="text-primary hover:text-accent font-bold">Simulate</button>
                    )}
                    {d.status === 'simulated' && (
                      <>
                        <button onClick={() => handleSimulate(d.id)} disabled={loadingId === d.id} className="text-text-muted hover:text-primary font-bold">Re-Simulate</button>
                        <button onClick={() => handlePublish(d.id)} disabled={loadingId === d.id} className="bg-accent text-[#1A1A1A] px-3 py-1 rounded shadow-sm hover:scale-105 font-bold transition-transform">Publish</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSimulate && simulateResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-3xl text-primary">Simulation Results</h2>
              <button onClick={() => setShowSimulate(false)} className="text-gray-500 hover:text-black">✕</button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm font-bold text-text-muted mb-2">Drawn Numbers</p>
              <div className="flex gap-3">
                {simulateResult.drawnNumbers.map((num: number) => (
                  <div key={num} className="w-12 h-12 rounded-full bg-accent text-[#1A1A1A] flex items-center justify-center font-bold text-xl">{num}</div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#F9FAFB] p-4 rounded-[12px] border border-[#E5E7EB]">
                <p className="text-sm text-text-muted mb-1">Jackpot (5 Match)</p>
                <p className="font-serif text-2xl text-primary">£{simulateResult.prizeBreakdown.jackpot.toFixed(2)}</p>
              </div>
              <div className="bg-[#F9FAFB] p-4 rounded-[12px] border border-[#E5E7EB]">
                <p className="text-sm text-text-muted mb-1">Total Pool</p>
                <p className="font-serif text-2xl text-primary">£{simulateResult.prizeBreakdown.total.toFixed(2)}</p>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-4">Estimated Winners ({simulateResult.preview.length})</h3>
            <div className="max-h-64 overflow-y-auto border border-[#E5E7EB] rounded-[8px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F9FAFB]">
                  <tr>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Matches</th>
                    <th className="p-3">Est. Prize</th>
                  </tr>
                </thead>
                <tbody>
                  {simulateResult.preview.map((p: any, i: number) => (
                    <tr key={i} className="border-t border-[#E5E7EB]">
                      <td className="p-3 font-mono text-xs">{p.userId}</td>
                      <td className="p-3">{p.matchCount}</td>
                      <td className="p-3 text-success font-bold">£{p.estimatedPrize.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <button onClick={() => setShowSimulate(false)} className="px-6 py-2 rounded-[8px] font-bold text-text-muted hover:bg-[#F9FAFB]">Close</button>
              <button onClick={() => handlePublish(simulateResult.drawId)} className="px-6 py-2 rounded-[8px] font-bold bg-primary text-white hover:bg-[#152e23]">Publish Draw</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
