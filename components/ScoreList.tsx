"use client";

import { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';

export default function ScoreList({ scores, onScoresUpdated }: { scores: any[], onScoresUpdated: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const startEdit = (score: any) => {
    setEditingId(score.id);
    setEditValue(score.score.toString());
  };

  const handleSave = async (id: string) => {
    const parsed = parseInt(editValue, 10);
    if (!parsed || parsed < 1 || parsed > 45) {
      alert('Score must be between 1 and 45.');
      return;
    }
    
    setLoadingId(id);
    try {
      const res = await fetch(`/api/scores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: parsed }),
      });
      if (res.ok) {
        setEditingId(null);
        onScoresUpdated();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update score.');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this score entry?')) return;
    
    setLoadingId(id);
    try {
      const res = await fetch(`/api/scores/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onScoresUpdated();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete score.');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoadingId(null);
    }
  };

  if (scores.length === 0) {
    return (
      <div className="bg-white p-8 rounded-[16px] border border-[#E5E7EB] text-center shadow-sm">
        <p className="text-text-muted italic">No scores yet — add your first score above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-sm overflow-hidden">
      <ul className="divide-y divide-[#E5E7EB]">
        {scores.map((scoreObj) => {
          const dateFormatted = new Date(scoreObj.date).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          });

          return (
            <li key={scoreObj.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
              <div>
                <p className="text-sm text-text-muted mb-1">{dateFormatted}</p>
                {editingId === scoreObj.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="number"
                      min="1" max="45"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-20 px-2 py-1 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button disabled={loadingId === scoreObj.id} onClick={() => handleSave(scoreObj.id)} className="text-success hover:text-opacity-80 p-1">
                      <Check size={18} />
                    </button>
                    <button disabled={loadingId === scoreObj.id} onClick={() => setEditingId(null)} className="text-danger hover:text-opacity-80 p-1">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <p className="font-bold text-2xl text-text-dark">{scoreObj.score} pts</p>
                )}
              </div>

              {editingId !== scoreObj.id && (
                <div className="flex gap-3">
                  <button onClick={() => startEdit(scoreObj)} disabled={loadingId === scoreObj.id} className="text-text-muted hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(scoreObj.id)} disabled={loadingId === scoreObj.id} className="text-text-muted hover:text-danger transition-colors p-2 rounded-full hover:bg-red-50">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
