"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Winnings({ userId, loading: externalLoading }: { userId: string, loading?: boolean }) {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient() as any;
        const { data } = await supabase
          .from('winners')
          .select('*, draws(month)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (data) setWinners(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, [userId]);

  if (externalLoading) return <div className="animate-pulse bg-gray-200 h-48 rounded-[16px] w-full mt-8"></div>;
  if (loading) return <div className="animate-pulse bg-white p-6 rounded-[16px] border border-[#E5E7EB] h-48 mt-8"></div>;

  if (winners.length === 0) return null;

  const totalWon = winners.filter(w => w.status === 'paid').reduce((acc, curr) => acc + Number(curr.prize_amount), 0);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">Pending</span>;
      case 'approved': return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">Approved</span>;
      case 'rejected': return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200">Rejected</span>;
      case 'paid': return <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Paid</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-[16px] border border-[#E5E7EB] shadow-sm animate-fade-in mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="font-serif text-3xl text-primary">Your Winnings</h2>
        <div className="text-left sm:text-right">
          <p className="text-sm font-bold text-text-muted">Total Paid Won</p>
          <p className="text-2xl font-serif text-success">£{totalWon.toFixed(2)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="py-4 font-bold text-text-dark text-sm">Draw Month</th>
              <th className="py-4 font-bold text-text-dark text-sm">Tier</th>
              <th className="py-4 font-bold text-text-dark text-sm">Prize Amount</th>
              <th className="py-4 font-bold text-text-dark text-sm">Status</th>
              <th className="py-4 font-bold text-text-dark text-sm text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {winners.map(w => {
              const monthStr = w.draws?.month ? new Date(w.draws.month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Unknown';
              return (
                <tr key={w.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-4 font-medium text-text-dark">{monthStr}</td>
                  <td className="py-4 text-text-muted">{w.tier} Match</td>
                  <td className="py-4 font-bold text-primary">£{Number(w.prize_amount).toFixed(2)}</td>
                  <td className="py-4">{getStatusBadge(w.status)}</td>
                  <td className="py-4 text-right">
                    {w.status === 'pending' && !w.proof_url && (
                      <Link href={`/dashboard/verify/${w.id}`} className="inline-block bg-accent text-[#1A1A1A] font-bold text-sm px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-sm">
                        Upload proof
                      </Link>
                    )}
                    {w.status === 'pending' && w.proof_url && (
                      <Link href={`/dashboard/verify/${w.id}`} className="text-sm font-bold text-primary hover:underline bg-[#F0F7F4] px-3 py-1 rounded-full">
                        Under review
                      </Link>
                    )}
                    {w.status !== 'pending' && (
                      <Link href={`/dashboard/verify/${w.id}`} className="text-sm font-bold text-text-muted hover:text-primary transition-colors underline decoration-1 underline-offset-4">
                        View details
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
