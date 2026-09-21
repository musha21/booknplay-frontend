export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export const reducedFade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export const staggerContainer = (stagger = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
});

export const cardHover = { y: -4, transition: { duration: 0.2 } };

export const buttonPress = { scale: 0.97 };

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

export const intensityFactor = (intensity = 'SUBTLE') => {
  if (intensity === 'NONE') return 0;
  if (intensity === 'ENERGETIC') return 1.35;
  return 1;
};
