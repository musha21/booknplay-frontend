import { ArrowForward, Search } from '@mui/icons-material';
import { Button, Skeleton } from '@mui/material';
import { motion, useReducedMotion } from 'motion/react';
import EmptyState from '../ui/EmptyState';
import VenueCard from '../ui/VenueCard';
import { staggerContainer } from '../../motion/variants';

export default function VenueShowcase({ venues, loading, error, sort, onSort, onRetry, onClear, onViewAll }) {
  const reduced = useReducedMotion();
  return (
    <section id="venues" className="scroll-mt-24 border-y border-line bg-surface py-20 sm:py-24">
      <div className="section-container">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><p className="eyebrow">Places to play</p><h2 className="section-title mt-2">Featured venues</h2><p className="section-subtitle">Compare individual locations, prices and sports before choosing a time.</p></div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Sort venues">
            {[["recommended", "Recommended"], ["price", "Lowest price"], ["newest", "Recently added"]].map(([value, label]) => <button key={value} type="button" aria-pressed={sort === value} onClick={() => onSort(value)} className={`calendar-filter ${sort === value ? 'calendar-filter-active' : ''}`}>{label}</button>)}
          </div>
        </div>
        {loading ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={350} />)}</div>
          : error ? <div className="mt-8"><EmptyState icon={Search} title="Could not load venues" description="The venue list is unavailable right now." actionLabel="Retry" onAction={onRetry} /></div>
            : !venues.length ? <div className="mt-8"><EmptyState icon={Search} title="No matching venues" description="Try another sport or clear the selected location." actionLabel="Clear filters" onAction={onClear} /></div>
              : <motion.div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3" variants={reduced ? undefined : staggerContainer(0.07)} initial={reduced ? false : 'hidden'} whileInView={reduced ? undefined : 'show'} viewport={{ once: true }}>{venues.slice(0, 6).map((venue) => <VenueCard key={venue.id} venue={venue} actionLabel="Check times" />)}</motion.div>}
        <div className="mt-8 text-center"><Button onClick={onViewAll} endIcon={<ArrowForward />}>View all matching venues</Button></div>
      </div>
    </section>
  );
}
