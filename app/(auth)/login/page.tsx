"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-cream px-4 py-12">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <span className="font-serif text-accent text-2xl font-bold leading-none">G</span>
          </div>
          <h1 className="font-serif text-4xl text-primary mb-2">Welcome Back</h1>
          <p className="text-text-muted">Sign in to track your scores and impact.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="text-danger text-sm text-center bg-red-50 p-3 rounded-xl font-medium">{error}</div>}
            
            <div>
              <label className="block text-sm font-bold text-text-dark mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-dark mb-1.5">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-shine w-full bg-accent text-[#1A1A1A] font-bold py-3.5 px-4 rounded-full hover:scale-[1.02] transition-transform flex items-center justify-center shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        
        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account? <Link href="/signup" className="text-primary font-bold hover:text-accent transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
