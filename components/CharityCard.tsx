import Link from 'next/link';

export default function CharityCard({ charity }: { charity: any }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col h-full">
      {charity.image_url ? (
        <img src={charity.image_url} alt={charity.name} className="w-full aspect-video object-cover" />
      ) : (
        <div className="w-full aspect-video bg-[#F0F7F4] flex items-center justify-center p-6 text-center border-b border-[#E5E7EB]">
          <span className="font-serif text-2xl text-primary">{charity.name}</span>
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-serif text-2xl text-primary mb-3 line-clamp-1">{charity.name}</h3>
        <p className="text-text-muted text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">{charity.description}</p>
        <Link href={`/charities/${charity.id}`} className="text-primary font-bold hover:text-accent transition-colors flex items-center">
          Learn more 
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  );
}
