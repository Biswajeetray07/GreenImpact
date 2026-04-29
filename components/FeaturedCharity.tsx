"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FeaturedCharity() {
  const [charity, setCharity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/charities');
        if (res.ok) {
          const data = await res.json();
          const featured = data.find((c: any) => c.is_featured) || data[0];
          setCharity(featured);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading || !charity) return null;

  return (
    <section className="bg-primary text-white py-24 px-4 sm:px-6 lg:px-8 border-t-[8px] border-accent">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 animate-fade-in">
        <div className="w-full md:w-1/2 aspect-[4/3] rounded-[16px] overflow-hidden bg-[#122A20] shadow-2xl relative border border-white border-opacity-10">
          <div className="absolute top-6 left-6 bg-accent text-[#1A1A1A] font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider z-10 shadow-lg">
            This Month's Featured Cause
          </div>
          {charity.image_url ? (
            <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 text-center bg-gradient-to-tr from-[#0F2119] to-[#1B3A2D]">
              <span className="font-serif text-5xl text-accent opacity-80">{charity.name}</span>
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2">
          <h2 className="font-serif text-5xl sm:text-6xl mb-6 text-white leading-tight">{charity.name}</h2>
          <p className="text-[#A1C1B1] text-lg mb-10 leading-relaxed line-clamp-4">
            {charity.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/charities/${charity.id}`} className="bg-accent text-[#1A1A1A] text-center font-bold py-4 px-8 rounded-full hover:scale-[1.02] transition-transform shadow-lg">
              Support this Charity
            </Link>
            <Link href="/charities" className="bg-transparent border border-[#A1C1B1] text-[#A1C1B1] text-center font-bold py-4 px-8 rounded-full hover:bg-white hover:text-primary hover:border-white transition-all">
              View All Causes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
