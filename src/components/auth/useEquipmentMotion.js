import { useState } from 'react';
import { useReducedMotion } from 'motion/react';

const STORAGE_KEY = 'booknplay-motion';

export default function useEquipmentMotion() {
  const reduced = Boolean(useReducedMotion());
  const [paused, setPaused] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'paused';
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setPaused((current) => {
      const next = !current;
      try {
        sessionStorage.setItem(STORAGE_KEY, next ? 'paused' : 'playing');
      } catch {
        /* session storage can be unavailable */
      }
      return next;
    });
  };

  return { reduced, paused, toggle, still: reduced || paused };
}
