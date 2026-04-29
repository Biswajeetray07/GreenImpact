"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function CharityDetail({ params }: { params: { id: string } }) {
  const [charity, setCharity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('10');
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        const res = await fetch('/api/charities');
        if (res.ok) {
          const data = await res.json();
          const found = data.find((c: any) => c.id === params.id);
          setCharity(found);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCharity();
  }, [params.id]);

  const handleDonate = async () => {
    const amount = parseFloat(donationAmount);
    if (!amount || amount < 1) {
      alert('Minimum donation is £1');
      return;
    }
    setDonating(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId: charity.id, amount })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Must be logged in to donate. Please sign up or log in.');
      }
    } catch (e) {
      alert('Error processing donation');
    } finally {
      setDonating(false);
    }
  };

  if (loading) return <div className="bg-cream min-h-screen py-24 text-center"><div className="animate-spin inline-block rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!charity) return <div className="bg-cream min-h-screen py-24 text-center text-text-muted text-xl">Charity not found.</div>;

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto animate-fade-in">
        <Link href="/charities" className="inline-flex items-center text-text-muted hover:text-primary text-sm mb-6 font-medium transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to all charities
        </Link>
        
        <div className="bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] overflow-hidden mb-8">
          {charity.image_url ? (
            <img src={charity.image_url} alt={charity.name} className="w-full h-72 md:h-[400px] object-cover" />
          ) : (
            <div className="w-full h-72 md:h-[400px] bg-primary flex items-center justify-center p-8">
              <h1 className="font-serif text-5xl md:text-6xl text-white text-center opacity-90">{charity.name}</h1>
            </div>
          )}
          
          <div className="p-8 md:p-12">
            {charity.image_url && <h1 className="font-serif text-4xl md:text-5xl text-primary mb-8">{charity.name}</h1>}
            
            <div className="prose max-w-none text-text-dark text-lg leading-relaxed mb-12">
              <p className="whitespace-pre-wrap">{charity.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-[#E5E7EB]">
              <div>
                <h2 className="font-serif text-3xl text-primary mb-6 flex items-center">
                  <Calendar className="mr-3 text-accent" size={28} />
                  Upcoming events
                </h2>
                {charity.charity_events && charity.charity_events.length > 0 ? (
                  <ul className="space-y-4">
                    {charity.charity_events.map((e: any) => (
                      <li key={e.id} className="bg-[#F9FAFB] p-6 rounded-[12px] border border-[#E5E7EB] hover:border-accent transition-colors">
                        <p className="font-bold text-lg text-text-dark mb-1">{e.title}</p>
                        <p className="text-sm text-text-muted font-medium mb-3">{new Date(e.event_date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        {e.description && <p className="text-text-dark leading-relaxed">{e.description}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-[#F9FAFB] p-6 rounded-[12px] border border-[#E5E7EB]">
                    <p className="text-text-muted italic">No upcoming events scheduled at this time.</p>
                  </div>
                )}
              </div>

              <div>
                <div className="bg-[#FFF8E7] p-8 rounded-[16px] border border-accent shadow-sm sticky top-8">
                  <h2 className="font-serif text-3xl text-primary mb-4">Make an independent donation</h2>
                  <p className="text-text-dark mb-8 leading-relaxed">
                    100% of independent donations go directly to <strong>{charity.name}</strong>, minus standard payment processing fees.
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-text-dark mb-2">Donation Amount (£)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-lg font-bold text-text-dark">£</span>
                      </div>
                      <input 
                        type="number" 
                        min="1" 
                        value={donationAmount} 
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 text-lg border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-accent shadow-inner"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleDonate}
                    disabled={donating}
                    className="w-full bg-accent text-[#1A1A1A] font-bold py-4 px-6 rounded-full hover:scale-[1.02] transition-transform text-lg shadow-sm"
                  >
                    {donating ? 'Processing...' : 'Make a Donation'}
                  </button>
                  <p className="text-xs text-text-muted text-center mt-4">Secure payment processing via Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
