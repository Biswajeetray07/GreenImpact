"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>('subscriber');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);
        const { data: dbUser } = await supabase.from('users').select('role').eq('auth_id', data.user.id).single() as any;
        if (dbUser) setRole(dbUser.role);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: dbUser } = await supabase.from('users').select('role').eq('auth_id', session.user.id).single() as any;
        if (dbUser) setRole(dbUser.role);
      } else {
        setUser(null);
        setRole('subscriber');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    setUser(null);
    setRole('subscriber');
    router.push('/');
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;
  const linkClass = (href: string) =>
    `text-sm font-bold transition-colors duration-200 ${
      isActive(href) 
        ? 'text-accent' 
        : 'text-[#A1C1B1] hover:text-white'
    }`;

  const publicLinks = [
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/charities', label: 'Charities' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-primary/95 backdrop-blur-md shadow-lg' 
        : 'bg-primary'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="font-serif text-primary text-lg font-bold leading-none">G</span>
            </div>
            <span className="font-serif text-xl text-white tracking-tight">
              Green<span className="text-accent">Impact</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!user ? (
              <>
                {publicLinks.map(l => (
                  <Link key={l.href} href={l.href} className={linkClass(l.href)}>{l.label}</Link>
                ))}
                <div className="flex items-center gap-3 ml-4">
                  <Link href="/login" className="text-sm font-bold text-[#A1C1B1] hover:text-white transition-colors">
                    Log In
                  </Link>
                  <Link href="/signup" className="btn-shine bg-accent text-[#1A1A1A] font-bold text-sm py-2 px-5 rounded-full hover:scale-[1.03] transition-transform shadow-sm">
                    Sign Up
                  </Link>
                </div>
              </>
            ) : role === 'admin' ? (
              <>
                <Link href="/admin" className={linkClass('/admin')}>Dashboard</Link>
                <Link href="/admin/users" className={linkClass('/admin/users')}>Users</Link>
                <Link href="/admin/draws" className={linkClass('/admin/draws')}>Draws</Link>
                <Link href="/admin/charities" className={linkClass('/admin/charities')}>Charities</Link>
                <Link href="/admin/winners" className={linkClass('/admin/winners')}>Winners</Link>
                <Link href="/admin/reports" className={linkClass('/admin/reports')}>Reports</Link>
                <button onClick={handleSignOut} className="text-sm font-bold text-[#A1C1B1] hover:text-white transition-colors ml-4">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
                <Link href="/charities" className={linkClass('/charities')}>Charities</Link>
                <button onClick={handleSignOut} className="text-sm font-bold text-[#A1C1B1] hover:text-white transition-colors ml-4">
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-1">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-white/10 animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            {!user ? (
              <>
                {publicLinks.map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">{l.label}</Link>
                ))}
                <hr className="border-white/10" />
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">Log In</Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="block bg-accent text-[#1A1A1A] font-bold py-3 px-4 rounded-full text-center mt-2">Sign Up</Link>
              </>
            ) : role === 'admin' ? (
              <>
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">Dashboard</Link>
                <Link href="/admin/users" onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">Users</Link>
                <Link href="/admin/draws" onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">Draws</Link>
                <Link href="/admin/charities" onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">Charities</Link>
                <Link href="/admin/winners" onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">Winners</Link>
                <Link href="/admin/reports" onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">Reports</Link>
                <hr className="border-white/10" />
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="w-full text-left text-[#A1C1B1] hover:text-white font-bold py-2">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">Dashboard</Link>
                <Link href="/charities" onClick={() => setMobileOpen(false)} className="block text-[#A1C1B1] hover:text-white font-bold py-2">Charities</Link>
                <hr className="border-white/10" />
                <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="w-full text-left text-[#A1C1B1] hover:text-white font-bold py-2">Sign Out</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
