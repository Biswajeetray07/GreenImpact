"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Success() {
  const [charities, setCharities] = useState<any[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/charities');
        if (res.ok) {
          const data = await res.json();
          setCharities(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSelectCharity = async () => {
    if (!selectedCharity) return;
    setSaving(true);
    try {
      const res = await fetch('/api/user/charity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId: selectedCharity }),
      });

      if (res.ok) {
        setSaved(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save charity selection');
      }
    } catch (e) {
      console.error(e);
      alert('A network error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-cream px-4 py-12">
      <div className="max-w-lg w-full bg-white p-8 rounded-[16px] border border-[#E5E7EB] shadow-sm animate-fade-in text-center">
        <div className="w-16 h-16 bg-[#F0F7F4] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-4xl text-primary mb-4">You&apos;re in! Welcome to the platform.</h1>
        <p className="text-text-muted mb-8 leading-relaxed">
          Your subscription is confirmed. Choose the charity you&apos;d like to support — at least 10% of your subscription goes directly to them.
        </p>

        {/* Charity Selection */}
        {!saved && (
          <div className="mb-8 text-left">
            <h2 className="font-serif text-2xl text-primary mb-4 text-center">Select your charity</h2>
            {loading ? (
              <div className="text-center py-6 text-text-muted">Loading charities...</div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {charities.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCharity(c.id)}
                    className={`w-full text-left p-4 rounded-[12px] border-2 transition-all flex items-center gap-4 ${selectedCharity === c.id
                      ? 'border-accent bg-[#FFF8E7]'
                      : 'border-transparent bg-[#F9FAFB] hover:border-primary'
                    }`}
                  >
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#F0F7F4] flex items-center justify-center flex-shrink-0">
                        <span className="font-serif text-xl text-primary">{c.name?.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-text-dark">{c.name}</p>
                      <p className="text-sm text-text-muted line-clamp-1">{c.description}</p>
                    </div>
                    {selectedCharity === c.id && (
                      <svg className="w-5 h-5 text-accent ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedCharity && (
              <button
                onClick={handleSelectCharity}
                disabled={saving}
                className="w-full mt-6 bg-primary text-white font-bold py-3 px-4 rounded-full hover:bg-[#152e23] transition-colors"
              >
                {saving ? 'Saving...' : 'Confirm Charity Selection'}
              </button>
            )}
          </div>
        )}

        {saved && (
          <div className="bg-[#ECFDF5] text-success p-4 rounded-[12px] font-bold mb-6 animate-fade-in">
            ✓ Charity selected successfully!
          </div>
        )}

        <Link href="/dashboard" className="inline-block w-full bg-accent text-[#1A1A1A] font-bold py-3 px-4 rounded-full hover:scale-[1.02] transition-transform">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
