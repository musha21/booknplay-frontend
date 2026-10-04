import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

export default function SportsEquipment({ still = false, quiet = false }) {
  const stageRef = useRef(null);
  const finePointer = useRef(false);
  const frame = useRef(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => { finePointer.current = query.matches; };
    sync();
    query.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const move = (event) => {
    if (still || quiet || !finePointer.current || window.innerWidth < 800) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = {
      x: ((event.clientX - rect.left - rect.width / 2) / rect.width) * 16,
      y: ((event.clientY - rect.top - rect.height / 2) / rect.height) * 12,
    };
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setOffset(next));
  };

  const reset = () => {
    cancelAnimationFrame(frame.current);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="auth-stage" aria-hidden="true" ref={stageRef} onPointerMove={move} onPointerLeave={reset}>
      <div className="auth-stage-light" />
      <span className="auth-speed-line auth-speed-line-one" />
      <span className="auth-speed-line auth-speed-line-two" />
      <motion.div
        className="auth-equipment-arrival"
        initial={still ? false : { opacity: 0, x: 25, y: 35, rotate: 4, scale: 0.91 }}
        animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
        transition={still ? { duration: 0 } : { duration: 1.15, ease: [0.18, 0.7, 0.2, 1] }}
      >
        <motion.div className="auth-equipment-parallax" animate={{ x: still || quiet ? 0 : offset.x, y: still || quiet ? 0 : offset.y }} transition={{ duration: still ? 0 : 0.55, ease: [0.18, 0.7, 0.2, 1] }}>
          <motion.img
            className="auth-equipment-art"
            src="/sports-equipment.webp"
            alt=""
            width="1024"
            height="1024"
            draggable="false"
            animate={still || quiet ? { y: 0, rotate: 0 } : { y: [0, -12, 0], rotate: [-1, 1, -1] }}
            transition={still || quiet ? { duration: 0 } : { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.15 }}
          />
        </motion.div>
      </motion.div>
      <div className="auth-sport-tags">
        <span>CRICKET</span>
        <span>BADMINTON</span>
        <span>FOOTBALL</span>
      </div>
    </div>
  );
}
