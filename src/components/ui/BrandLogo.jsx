import { Link } from 'react-router-dom';

export default function BrandLogo({ to = '/', inverse = false, compact = false, linked = true, variant = 'default', className = '' }) {
  const Wrapper = linked ? Link : 'div';
  if (variant === 'home') {
    const mark = (
      <>
        <span className="hp-brand-mark" aria-hidden="true"><span>bp</span></span>
        book<span>nplay</span><small>.lk</small>
      </>
    );
    if (!linked) return <div className={`hp-brand ${className}`}>{mark}</div>;
    return <Link to={to} aria-label="Booknplay.lk home" className={`hp-brand ${className}`}>{mark}</Link>;
  }
  return (
    <Wrapper {...(linked ? { to } : {})} aria-label="Booknplay.lk home" className={`inline-flex items-center gap-2 no-underline ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 40 40" width="36" height="36" className="h-9 w-9 shrink-0">
        <rect x="2" y="2" width="36" height="36" rx="9" fill={inverse ? '#fff' : 'var(--accent, #C7F84B)'} />
        <text x="6.5" y="25.5" fill="var(--brand, #092636)" fontFamily="Inter, sans-serif" fontSize="21" fontWeight="900">b</text>
        <text x="20" y="28" fill="var(--brand, #092636)" fontFamily="Inter, sans-serif" fontSize="21" fontWeight="900">p</text>
      </svg>
      {!compact && (
        <span className={`text-xl font-black tracking-[-.04em] ${inverse ? 'text-white' : 'text-ink'}`}>
          bookn<span style={{ color: 'var(--accent, #C7F84B)' }}>play</span><small className="ml-0.5 text-[9px] font-extrabold tracking-normal opacity-55">.lk</small>
        </span>
      )}
    </Wrapper>
  );
}
