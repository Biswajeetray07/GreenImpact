"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function CharityModule({ isActive, userId, loading: externalLoading }: { isActive: boolean, userId: string, loading?: boolean }) {
  const [subscription, setSubscription] = useState<any>(null);
  const [charity, setCharity] = useState<any>(null);
  const [charities, setCharities] = useState<any[]>([]);
  const [percentage, setPercentage] = useState(10);
  const [totalDonated, setTotalDonated] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingPercentage, setSavingPercentage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const charitiesRes = await fetch('/api/charities');
        if (charitiesRes.ok) setCharities(await charitiesRes.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSupabaseData = async () => {
      if (!userId) return;
      const supabase = createClient() as any;
      
      const { data: subData }: { data: any } = await supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
      if (subData) {
        setSubscription(subData);
        setPercentage(subData.charity_percentage || 10);
        if (subData.charity_id) {
          const { data: cData } = await supabase.from('charities').select('*').eq('id', subData.charity_id).single();
          setCharity(cData);
        }
      }

      const { data: donations } = await supabase.from('donations').select('amount').eq('user_id', userId);
      if (donations) {
        const sum = donations.reduce((acc: number, d: any) => acc + d.amount, 0);
        setTotalDonated(sum);
      }
      setLoading(false);
    };
    fetchSupabaseData();
  }, [userId]);

  const handlePercentageChange = async (val: number) => {
    setPercentage(val);
    setSavingPercentage(true);
    try {
      await fetch('/api/user/charity-percentage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentage: val })
      });
    } catch (e) {
      alert('Failed to update percentage');
    } finally {
      setSavingPercentage(false);
    }
  };

  const handleChangeCharity = async (newCharityId: string) => {
    try {
      const res = await fetch('/api/user/charity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId: newCharityId })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to change charity');
        return;
      }
      const selectedCharity = charities.find(c => c.id === newCharityId);
      setCharity(selectedCharity);
      setShowModal(false);
    } catch (e) {
      alert('Failed to change charity');
    }
  };

  if (!isActive) return null;

  if (loading) return <div className="animate-pulse bg-white p-6 rounded-[16px] border border-[#E5E7EB] h-64"></div>;

  return (
    <div className="bg-white p-8 rounded-[16px] border border-[#E5E7EB] shadow-sm animate-fade-in relative">
      <h2 className="font-serif text-3xl text-primary mb-8">Your Impact</h2>
      
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="w-full md:w-1/3 text-center flex flex-col items-center">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#F0F7F4] flex items-center justify-center mb-6 overflow-hidden shadow-md border-2 border-accent border-opacity-30">
            {charity?.image_url ? (
              <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-5xl text-primary">{charity?.name ? charity.name.charAt(0) : '?'}</span>
            )}
          </div>
          <h3 className="font-bold text-text-dark text-xl mb-2">{charity?.name || 'No charity selected'}</h3>
          <button onClick={() => setShowModal(true)} className="text-primary hover:text-accent text-sm font-bold transition-colors underline decoration-2 underline-offset-4 mb-4">
            Change your charity
          </button>
        </div>

        <div className="w-full md:w-2/3 space-y-10">
          <div className="bg-[#F9FAFB] p-6 rounded-[12px] border border-[#E5E7EB]">
            <div className="flex justify-between items-end mb-4">
              <label className="font-bold text-text-dark text-lg">Contribution Percentage</label>
              <span className="text-3xl font-serif text-primary">{percentage}%</span>
            </div>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              You currently allocate {percentage}% of your subscription fee directly to {charity?.name || 'your charity'}. 
              Move the slider to increase your impact.
            </p>
            <input 
              type="range" 
              min="10" max="100" step="1" 
              value={percentage} 
              onChange={(e) => setPercentage(parseInt(e.target.value))}
              onMouseUp={() => handlePercentageChange(percentage)}
              onTouchEnd={() => handlePercentageChange(percentage)}
              className="w-full h-3 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-accent"
            />
            {savingPercentage && <span className="text-xs text-success font-bold mt-3 block animate-pulse">Saving changes...</span>}
          </div>

          <div className="bg-[#FFF8E7] p-6 rounded-[12px] border border-accent flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-sm font-bold text-text-dark mb-1">Total Independent Donations</p>
              <p className="text-4xl font-serif text-primary">£{totalDonated.toFixed(2)}</p>
            </div>
            {charity && (
              <Link href={`/charities/${charity.id}`} className="bg-primary text-white text-center font-bold py-3 px-6 rounded-full hover:scale-[1.02] transition-transform shadow-sm whitespace-nowrap">
                Donate Again
              </Link>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB] rounded-t-[24px]">
              <h3 className="font-serif text-2xl text-primary">Select a Charity</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-dark p-2 rounded-full hover:bg-[#E5E7EB] transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-3">
              {charities.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => handleChangeCharity(c.id)}
                  className={`w-full text-left p-5 rounded-[12px] border-2 ${charity?.id === c.id ? 'border-accent bg-[#FFF8E7]' : 'border-transparent bg-[#F9FAFB] hover:border-primary'} transition-all`}
                >
                  <p className="font-bold text-lg text-text-dark mb-1">{c.name}</p>
                  <p className="text-sm text-text-muted line-clamp-2">{c.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
