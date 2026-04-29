import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="font-serif text-primary text-lg font-bold leading-none">G</span>
              </div>
              <span className="font-serif text-xl text-white tracking-tight">
                Green<span className="text-accent">Impact</span>
              </span>
            </Link>
            <p className="text-[#A1C1B1] text-sm leading-relaxed max-w-xs">
              A subscription platform combining golf performance tracking with charitable giving and monthly prize draws.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/#how-it-works" className="text-[#A1C1B1] hover:text-white text-sm transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="text-[#A1C1B1] hover:text-white text-sm transition-colors">Pricing</Link></li>
              <li><Link href="/charities" className="text-[#A1C1B1] hover:text-white text-sm transition-colors">Our Charities</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">Account</h4>
            <ul className="space-y-3">
              <li><Link href="/login" className="text-[#A1C1B1] hover:text-white text-sm transition-colors">Log In</Link></li>
              <li><Link href="/signup" className="text-[#A1C1B1] hover:text-white text-sm transition-colors">Sign Up</Link></li>
              <li><Link href="/dashboard" className="text-[#A1C1B1] hover:text-white text-sm transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal / Info */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">Information</h4>
            <ul className="space-y-3">
              <li><span className="text-[#A1C1B1] text-sm">Terms & Conditions</span></li>
              <li><span className="text-[#A1C1B1] text-sm">Privacy Policy</span></li>
              <li><span className="text-[#A1C1B1] text-sm">Responsible Gambling</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#6B8F7E] text-sm">
            © {new Date().getFullYear()} GreenImpact. All rights reserved.
          </p>
          <p className="text-[#6B8F7E] text-xs">
            Subscription funds are allocated to prize pools and charity contributions as described in our terms.
          </p>
        </div>
      </div>
    </footer>
  );
}
