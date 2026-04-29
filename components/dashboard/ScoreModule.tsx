"use client";

import { useEffect, useState, useCallback } from 'react';
import ScoreEntry from '@/components/ScoreEntry';
import ScoreList from '@/components/ScoreList';

export default function ScoreModule({ isActive, loading: externalLoading }: { isActive: boolean, loading?: boolean }) {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/scores');
      if (res.ok) {
        const data = await res.json();
        setScores(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      fetchScores();
    } else {
      setLoading(false);
    }
  }, [isActive, fetchScores]);

  if (externalLoading) return <div className="animate-pulse bg-gray-200 h-64 rounded-[16px] w-full"></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-3xl text-primary">Your scores</h2>
      </div>

      {!isActive ? (
        <div className="bg-[#FFF8E7] p-8 rounded-[16px] border border-accent text-center shadow-sm">
          <h3 className="font-serif text-2xl text-primary mb-2">Subscription Required</h3>
          <p className="text-text-dark font-medium">Subscribe to enter scores, access monthly draws, and start making an impact.</p>
        </div>
      ) : (
        <>
          <ScoreEntry onScoreAdded={fetchScores} currentCount={scores.length} />
          {loading ? (
            <p className="text-text-muted text-center py-8">Loading scores...</p>
          ) : (
            <ScoreList scores={scores} onScoresUpdated={fetchScores} />
          )}
        </>
      )}
    </div>
  );
}
