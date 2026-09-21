import { motion, useReducedMotion } from 'motion/react';
import PremiumBusinessCard from './PremiumBusinessCard';
import { fadeUp, reducedFade, staggerContainer } from '../../motion/variants';

export default function BusinessShowcase({ businesses, onViewBusiness }) {
  const reduced = useReducedMotion();
  if (!businesses.length) return null;
  return (
    <section id="businesses" className="section-container py-20 sm:py-24">
      <p className="eyebrow">Sports businesses</p>
      <h2 className="section-title mt-2">Discover trusted sports businesses</h2>
      <p className="section-subtitle">Explore businesses first, then choose the venue that works best for your game.</p>
      <motion.div
        className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={reduced ? undefined : staggerContainer(0.08)}
        initial={reduced ? false : 'hidden'}
        whileInView={reduced ? undefined : 'show'}
        viewport={{ once: true, amount: 0.15 }}
      >
        {businesses.slice(0, 6).map((business) => (
          <motion.div key={business.id} variants={reduced ? reducedFade : fadeUp}>
            <PremiumBusinessCard business={business} onView={onViewBusiness} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
