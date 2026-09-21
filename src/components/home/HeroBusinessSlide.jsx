import { motion } from 'motion/react';
import { Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import VenueImage from '../ui/VenueImage';

export default function HeroBusinessSlide({ slide, homepage = {}, onExplore, onSearch, reduced }) {
  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-navy-900 lg:min-h-[78vh]">
      <motion.div className="absolute inset-0" initial={false} animate={{ scale: 1 }} transition={{ duration: reduced ? 0 : 0.45 }}>
        <VenueImage src={slide.imageUrl || slide.logoUrl} alt={slide.name || 'Sports venue'} className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/90 via-navy-900/55 to-navy-900/20" />
      <div className="relative z-10 section-container flex min-h-[70vh] flex-col justify-end pb-16 pt-24 lg:min-h-[78vh] lg:pb-20">
        <p className="eyebrow !text-lime-300">{slide.badge || 'Premium partner'}{slide.name ? ` · ${slide.name}` : ''}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-.04em] text-white sm:text-6xl">
          {homepage.heading || slide.headline || 'Find the right place for your next game.'}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
          {homepage.description || slide.description || 'Search by sport and city, then book a court that works for your team.'}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="contained" color="secondary" endIcon={<ArrowForward />} onClick={onSearch} className="!min-h-11">Find a venue</Button>
          {onExplore && slide?.businessId ? (
            <Button variant="outlined" onClick={() => onExplore(slide)} className="!min-h-11 !border-white/40 !text-white hover:!border-lime-400">Explore this business</Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
