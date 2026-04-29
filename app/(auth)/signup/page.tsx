"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function Signup() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName) newErrors.fullName = 'Full Name is required.';
    if (!email) newErrors.email = 'Email is required.';
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setErrors({ form: error.message });
      setLoading(false);
    } else {
      router.push('/pricing');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-cream px-4 py-12">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <span className="font-serif text-accent text-2xl font-bold leading-none">G</span>
          </div>
          <h1 className="font-serif text-4xl text-primary mb-2">Join the movement</h1>
          <p className="text-text-muted">Create your account to start making an impact.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm">
          <form onSubmit={handleSignup} className="space-y-5">
            {errors.form && <div className="text-danger text-sm text-center bg-red-50 p-3 rounded-xl font-medium">{errors.form}</div>}
            
            <div>
              <label className="block text-sm font-bold text-text-dark mb-1.5">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-danger text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-text-dark mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-danger text-sm mt-1">{errors.email}</p>}
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
              {errors.password && <p className="text-danger text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-text-dark mb-1.5">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-accent transition-shadow"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-danger text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-shine w-full bg-accent text-[#1A1A1A] font-bold py-3.5 px-4 rounded-full hover:scale-[1.02] transition-transform flex items-center justify-center shadow-sm"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
        
        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:text-accent transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
}
