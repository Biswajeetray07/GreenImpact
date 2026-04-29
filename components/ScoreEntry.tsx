"use client";

import { useState } from 'react';

export default function ScoreEntry({ onScoreAdded, currentCount }: { onScoreAdded: () => void, currentCount: number }) {
  const [score, setScore] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedScore = parseInt(score, 10);
    if (!parsedScore || parsedScore < 1 || parsedScore > 45) {
      setError('Score must be between 1 and 45.');
      return;
    }
    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: parsedScore, date }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to save score.');
      } else {
        setScore('');
        setDate('');
        onScoreAdded();
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm transition-all hover:scale-[1.01]">
      <h3 className="font-serif text-2xl text-primary mb-2">Add a Score</h3>
      <p className="text-sm text-text-muted mb-1">You have {currentCount} of 5 scores on record.</p>
      <p className="text-xs text-text-muted mb-6">The platform keeps your latest 5 Stableford scores for the monthly draw. Older scores are automatically removed.</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="text-danger text-sm bg-red-50 p-3 rounded-md">{error}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Score (1-45)</label>
            <input 
              type="number" 
              min="1" max="45" step="1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter score 1–45"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Date</label>
            <input 
              type="date"
              max={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-accent text-[#1A1A1A] font-bold py-3 px-4 rounded-full hover:scale-[1.02] transition-transform"
        >
          {loading ? 'Adding...' : 'Add Score'}
        </button>
      </form>
    </div>
  );
}
