"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Check, Zap } from 'lucide-react';

export default function Pricing() {
  const router = useRouter();
  const supabase = createClient();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);
        const { data: dbData } = await supabase.from('users').select('id').eq('auth_id', data.user.id).single();
        if (dbData) setDbUser(dbData);
      }
      setLoadingUser(false);
    });
  }, [supabase]);

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    if (!user) {
      router.push('/signup');
      return;
    }
    setLoadingPlan(planType);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, userId: dbUser?.id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong');
        setLoadingPlan(null);
      }
    } catch (e) {
      alert('Error initiating checkout');
      setLoadingPlan(null);
    }
  };

  const features = [
    'Access to Monthly Prize Draws',
    'Track Latest 5 Stableford Scores',
    'Min. 10% Direct to Your Charity',
    'Personal Impact Dashboard',
    'Winner Verification & Payouts',
  ];

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="text-center mb-16">
          <span className="text-sm font-bold text-accent uppercase tracking-widest">Pricing</span>
          <h1 className="font-serif text-5xl sm:text-6xl text-primary mt-3 mb-4">Invest in Impact</h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Choose a plan that fits your generosity. A portion of every subscription goes directly to your selected charity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 hover:shadow-lg transition-all flex flex-col shadow-sm group">
            <h2 className="font-serif text-3xl text-primary mb-2">Monthly</h2>
            <div className="text-5xl font-serif text-primary mb-1">
              £9.99
            </div>
            <p className="text-sm text-text-muted mb-8">per month · cancel anytime</p>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {features.map((f, i) => (
                <li key={i} className="flex items-start text-text-dark">
                  <Check className="text-success mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSubscribe('monthly')}
              disabled={loadingPlan !== null || loadingUser}
              className={`btn-shine w-full font-bold py-4 px-4 rounded-full transition-all text-base ${loadingPlan !== null || loadingUser ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:shadow-md'}`}
            >
              {loadingUser ? 'Loading...' : loadingPlan === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white rounded-2xl border-2 border-accent p-8 hover:shadow-lg transition-all flex flex-col shadow-md relative group">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-accent text-[#1A1A1A] px-5 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-1.5">
              <Zap size={14} />
              Best Value
            </div>
            <h2 className="font-serif text-3xl text-primary mb-2">Yearly</h2>
            <div className="text-5xl font-serif text-primary mb-1">
              £99.00
            </div>
            <p className="text-sm text-text-muted mb-8">per year · <span className="text-success font-bold">save £20.88</span></p>
            
            <ul className="space-y-4 mb-10 flex-grow">
              {features.map((f, i) => (
                <li key={i} className="flex items-start text-text-dark">
                  <Check className="text-success mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
              <li className="flex items-start text-text-dark">
                <Check className="text-accent mr-3 mt-0.5 flex-shrink-0" size={18} />
                <span className="text-sm font-bold">2 Months Free</span>
              </li>
            </ul>
            <button 
              onClick={() => handleSubscribe('yearly')}
              disabled={loadingPlan !== null || loadingUser}
              className={`btn-shine w-full font-bold py-4 px-4 rounded-full transition-all text-base ${loadingPlan !== null || loadingUser ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-accent text-[#1A1A1A] hover:shadow-md'}`}
            >
              {loadingUser ? 'Loading...' : loadingPlan === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-16 text-center">
          <p className="text-text-muted text-sm mb-4">Secure payments powered by Stripe. Cancel or manage your subscription any time.</p>
          <div className="flex items-center justify-center gap-8 text-text-muted text-xs font-bold uppercase tracking-wider">
            <span>🔒 256-bit SSL</span>
            <span>💳 Stripe Billing</span>
            <span>❤️ Charity Impact</span>
          </div>
        </div>
      </div>
    </div>
  );
}
