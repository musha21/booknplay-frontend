import { Button } from '@mui/material';
import { ArrowForward, CalendarMonth, Search, Verified } from '@mui/icons-material';
import VenueImage from '../ui/VenueImage';

export default function BookingHeroFallback({ homepage = {}, cover, onSearch }) {
  const heading = homepage.heading || 'Find the right place for your next game.';
  const description = homepage.description || 'Search by sport and city, then book a court that works for your team.';

  if (cover) {
    return (
      <section className="relative min-h-[70vh] overflow-hidden bg-navy-900 lg:min-h-[78vh]">
        <VenueImage src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/55 to-navy-900/20" />
        <div className="relative z-10 section-container flex min-h-[70vh] flex-col justify-end pb-16 pt-24 lg:min-h-[78vh] lg:pb-20">
          <p className="eyebrow !text-lime-300">{homepage.eyebrow || 'Sports venues across Sri Lanka'}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-.04em] text-white sm:text-6xl">{heading}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{description}</p>
          <Button variant="contained" color="secondary" endIcon={<ArrowForward />} onClick={onSearch} className="!mt-8 !min-h-11 !w-fit">Find a venue</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-line bg-surface">
      <div className="section-container grid gap-10 py-16 lg:grid-cols-[1fr_.8fr] lg:items-center lg:py-24">
        <div>
          <p className="eyebrow">{homepage.eyebrow || 'Sports venues across Sri Lanka'}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-.05em] text-ink sm:text-6xl">{heading}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">{description}</p>
          <Button variant="contained" color="secondary" endIcon={<ArrowForward />} onClick={onSearch} className="!mt-8 !min-h-11">Find a venue</Button>
        </div>
        <div className="rounded-[28px] bg-navy-900 p-6 text-white sm:p-8">
          <p className="text-sm font-extrabold text-lime-300">Everything in one booking</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[[Search, 'Discover', 'Search by sport and location'], [CalendarMonth, 'Choose', 'See times and clear prices'], [Verified, 'Play', 'Book with confidence']].map(([Icon, title, copy]) => (
              <div key={title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lime-300"><Icon /></span>
                <span><strong className="block">{title}</strong><small className="text-slate-300">{copy}</small></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
