export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export const reducedFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export const pageEnter = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

export const sectionEnter = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer = (stagger = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
});

export const cardHover = { y: -4, transition: { duration: 0.2 } };

export const buttonPress = { scale: 0.97 };

export const drawerSlide = {
  hidden: { x: '-100%' },
  show: { x: 0, transition: { type: 'spring', stiffness: 380, damping: 36 } },
  exit: { x: '-100%', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

export const backdropFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const dialogPop = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.15 } },
};

export const tabIndicator = {
  layout: true,
  transition: { type: 'spring', stiffness: 420, damping: 34 },
};

export const heroSlide = {
  enter: (direction) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
};

export const reducedHero = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

export const imageReveal = {
  rest: { scale: 1 },
  hover: { scale: 1.04, transition: { duration: 0.35 } },
};

export const mediaReorder = {
  layout: true,
  transition: { type: 'spring', stiffness: 420, damping: 36 },
};

export const successPulse = {
  initial: { scale: 0.92, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

export const intensityFactor = (intensity = 'SUBTLE') => {
  if (intensity === 'NONE') return 0;
  if (intensity === 'ENERGETIC') return 1.35;
  return 1;
};
