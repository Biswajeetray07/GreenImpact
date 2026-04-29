import { createServerClient } from '@/lib/supabase';

export default async function AdminDashboard() {
  const supabase = createServerClient() as any;
  
  const [
    { count: activeSubs },
    { data: draws },
    { data: donations },
    { data: winners }
  ] = await Promise.all([
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('draws').select('*').order('month', { ascending: false }),
    supabase.from('donations').select('amount'),
    supabase.from('winners').select('*, users(full_name), draws(month)').order('created_at', { ascending: false }).limit(5)
  ]);

  const activeSubscribers = activeSubs || 0;
  
  const currentDraw = draws && draws.length > 0 ? draws[0] : null;
  const prizePoolThisMonth = currentDraw ? Number(currentDraw.prize_pool_total || 0) : 0;

  const totalCharity = donations ? donations.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) : 0;
  const totalDraws = draws ? draws.filter((d: any) => d.status === 'published').length : 0;

  const last5Draws = draws ? draws.slice(0, 5) : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-serif text-4xl text-primary">Overview Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Subscribers" value={activeSubscribers.toString()} />
        <StatCard title="Prize Pool (Current)" value={`£${prizePoolThisMonth.toFixed(2)}`} />
        <StatCard title="Total Raised for Charity" value={`£${totalCharity.toFixed(2)}`} />
        <StatCard title="Total Published Draws" value={totalDraws.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm">
          <h2 className="font-serif text-2xl text-primary mb-6">Recent Draws</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-sm text-text-muted">
                  <th className="pb-3">Month</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {last5Draws.map((d: any) => (
                  <tr key={d.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 font-bold text-text-dark">{new Date(d.month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                    <td className="py-3 capitalize">{d.draw_type}</td>
                    <td className="py-3 capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${d.status === 'published' ? 'bg-[#ECFDF5] text-success' : 'bg-gray-100 text-gray-600'}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm">
          <h2 className="font-serif text-2xl text-primary mb-6">Recent Winners</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E5E7EB] text-sm text-text-muted">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Draw</th>
                  <th className="pb-3">Tier</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {winners && winners.map((w: any) => (
                  <tr key={w.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 font-bold text-text-dark">{w.users?.full_name}</td>
                    <td className="py-3">{new Date(w.draws?.month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</td>
                    <td className="py-3">{w.tier} Match</td>
                    <td className="py-3 capitalize">{w.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-[16px] border border-[#E5E7EB] shadow-sm hover:scale-[1.02] transition-transform">
      <p className="text-sm font-bold text-text-muted mb-2">{title}</p>
      <p className="font-serif text-4xl text-primary">{value}</p>
    </div>
  );
}
