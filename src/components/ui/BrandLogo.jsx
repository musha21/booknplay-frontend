import { Link } from 'react-router-dom';
import logoMarkDaylight from '../../assets/brand/logo-mark-daylight.png';
import logoMarkBrand from '../../assets/brand/logo-mark.png';

function Wordmark({ inverse = false }) {
  return (
    <span className={`brand-logo-wordmark${inverse ? ' is-inverse' : ''}`}>
      booknplay<small>.lk</small>
    </span>
  );
}

function Mark({ className = '', inverse = false }) {
  return (
    <img
      src={inverse ? logoMarkBrand : logoMarkDaylight}
      alt=""
      aria-hidden="true"
      className={`brand-logo-mark ${className}`.trim()}
      draggable={false}
    />
  );
}

export default function BrandLogo({
  to = '/',
  inverse = false,
  compact = false,
  linked = true,
  variant = 'default',
  className = '',
}) {
  const Wrapper = linked ? Link : 'div';
  const linkProps = linked
    ? { to, 'aria-label': 'Booknplay.lk home' }
    : { 'aria-label': 'Booknplay.lk' };

  if (variant === 'home') {
    const mark = (
      <>
        <Mark className="hp-brand-mark" inverse={inverse} />
        <Wordmark inverse={inverse} />
      </>
    );
    if (!linked) return <div className={`hp-brand ${className}`.trim()}>{mark}</div>;
    return (
      <Link to={to} aria-label="Booknplay.lk home" className={`hp-brand ${className}`.trim()}>
        {mark}
      </Link>
    );
  }

  return (
    <Wrapper
      {...linkProps}
      className={`brand-logo inline-flex items-center gap-2 no-underline ${className}`.trim()}
    >
      <Mark inverse={inverse} />
      {!compact && <Wordmark inverse={inverse} />}
    </Wrapper>
  );
}
