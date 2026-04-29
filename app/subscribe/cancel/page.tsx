import Link from 'next/link';

export default function Cancel() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-cream px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-[16px] border border-[#E5E7EB] shadow-sm animate-fade-in text-center">
        <h1 className="font-serif text-3xl text-primary mb-4">No worries — you can subscribe anytime.</h1>
        <p className="text-text-muted mb-8 leading-relaxed">
          Your checkout was cancelled. We're ready whenever you want to start making an impact.
        </p>
        <Link href="/pricing" className="inline-block w-full bg-primary text-white font-bold py-3 px-4 rounded-full hover:scale-[1.02] transition-transform">
          Back to Pricing
        </Link>
      </div>
    </div>
  );
}
