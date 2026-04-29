

interface DrawHistoryProps {
  entries: any[];
  draws: any[];
  loading?: boolean;
}

export default function DrawHistory({ entries, draws, loading }: DrawHistoryProps) {
  if (loading) return <div className="animate-pulse bg-gray-200 h-64 rounded-[16px] w-full mt-8"></div>;
  const upcomingDraws = draws.filter(d => d.status === 'draft' || d.status === 'simulated');
  const nextDraw = upcomingDraws.length > 0 ? upcomingDraws[0] : null;

  return (
    <div className="bg-white p-8 rounded-[16px] border border-[#E5E7EB] shadow-sm animate-fade-in mt-8">
      <h2 className="font-serif text-3xl text-primary mb-6">Draw participation</h2>

      {nextDraw && (
        <div className="bg-[#FFF8E7] p-5 rounded-[12px] border border-accent mb-8 shadow-sm">
          <p className="font-bold text-text-dark text-center">
            Next draw: {new Date(nextDraw.month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} — scores are being tracked
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center p-8 bg-[#F9FAFB] rounded-[12px] border border-[#E5E7EB]">
          <p className="text-text-muted italic">You haven&apos;t participated in any draws yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => {
            const drawDate = entry.draws?.month ? new Date(entry.draws.month) : null;
            const monthStr = drawDate ? drawDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Unknown';
            const tierStr = entry.tier ? `Tier ${entry.tier} Winner` : 'No match';
            const scoresStr = entry.user_scores ? entry.user_scores.join(', ') : 'None';
            
            return (
              <div key={entry.id} className="p-5 border border-[#E5E7EB] rounded-[12px] flex flex-col sm:flex-row justify-between gap-4 hover:border-primary transition-colors bg-[#F9FAFB] shadow-sm">
                <div>
                  <p className="font-bold text-lg text-text-dark">{monthStr}</p>
                  <p className="text-sm text-text-muted mt-1">Scores: <span className="font-medium text-text-dark">{scoresStr}</span></p>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold shadow-sm ${entry.tier ? 'bg-[#ECFDF5] text-success border border-[#D1FAE5]' : 'bg-white text-text-muted border border-[#E5E7EB]'}`}>
                    {entry.match_count} Matches
                  </span>
                  <p className={`mt-2 font-bold text-sm ${entry.tier ? 'text-accent' : 'text-text-muted'}`}>{tierStr}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
