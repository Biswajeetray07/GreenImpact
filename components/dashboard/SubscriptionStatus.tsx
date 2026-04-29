"use client";

import { useState } from 'react';

export default function SubscriptionStatus({ subscription, loading: externalLoading }: { subscription: any, loading?: boolean }) {
  const [loading, setLoading] = useState(false);

  if (externalLoading) return <div className="animate-pulse bg-gray-200 h-24 rounded-[16px] w-full"></div>;

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Unable to open billing portal');
      }
    } catch (e) {
      alert('Error redirecting to billing portal');
    } finally {
      setLoading(false);
    }
  };

  const status = subscription?.status || 'inactive';
  const plan = subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'No Plan';
  
  let badgeColor = 'bg-gray-200 text-gray-700 border-gray-300';
  if (status === 'active') badgeColor = 'bg-[#ECFDF5] text-success border border-[#D1FAE5]';
  if (status === 'lapsed') badgeColor = 'bg-[#FEF2F2] text-danger border border-[#FECACA]';
  if (status === 'cancelled') badgeColor = 'bg-[#FEF2F2] text-danger border border-[#FECACA]';

  const renewalDate = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

  return (
    <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Subscription Status</h2>
        <div className="flex items-center gap-4 flex-wrap mb-1">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${badgeColor}`}>
            {status.toUpperCase()}
          </span>
          <span className="font-serif text-2xl text-primary">{plan}</span>
        </div>
        {renewalDate && status !== 'cancelled' && (
          <p className="text-sm text-text-dark font-medium mt-2">Renews on {renewalDate}</p>
        )}
        {status === 'cancelled' && renewalDate && (
          <p className="text-sm text-text-dark font-medium mt-2">Access ends on {renewalDate}</p>
        )}
      </div>

      <button 
        onClick={handleManageBilling}
        disabled={loading}
        className="bg-primary text-white font-bold py-3 px-6 rounded-full hover:scale-105 hover:bg-[#152e23] transition-all whitespace-nowrap shadow-sm"
      >
        {loading ? 'Redirecting...' : 'Manage billing'}
      </button>
    </div>
  );
}
