"use client";

import { useState, useEffect } from 'react';
import CharityCard from '@/components/CharityCard';
import { Search } from 'lucide-react';

export default function CharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharities = async () => {
      setLoading(true);
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
    fetchCharities();
  }, []);

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="text-center mb-16">
          <h1 className="font-serif text-5xl text-primary mb-6">Causes we support</h1>
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Search charities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-[#E5E7EB] rounded-full focus:outline-none focus:ring-2 focus:ring-accent shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredCharities.length === 0 ? (
          <div className="bg-white p-12 rounded-[16px] border border-[#E5E7EB] text-center max-w-2xl mx-auto shadow-sm">
            <p className="text-text-muted text-lg">No charities found matching your search.</p>
            <button onClick={() => setSearchTerm('')} className="mt-4 text-primary font-bold hover:underline">Clear search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCharities.map(charity => (
              <CharityCard key={charity.id} charity={charity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
