import { Link } from 'react-router-dom';

export default function BrandLogo({ to = '/', inverse = false, compact = false, className = '' }) {
  return (
    <Link to={to} aria-label="Booknplay.lk home" className={`inline-flex items-center gap-2 no-underline ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 40 40" className="h-9 w-9 shrink-0">
        <circle cx="20" cy="20" r="17" fill={inverse ? '#fff' : '#061032'} />
        <path d="M7 20h26M20 3c-5 5-7 11-7 17s2 12 7 17" fill="none" stroke="#A3E635" strokeWidth="6" />
      </svg>
      {!compact && (
        <span className={`text-xl font-black tracking-[-.04em] ${inverse ? 'text-white' : 'text-ink'}`}>
          bookn<span className="text-lime-500">play</span><span className={inverse ? 'text-white' : 'text-ink'}>.lk</span>
        </span>
      )}
    </Link>
  );
}

