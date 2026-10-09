import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';

import './AccordionGallery.css';

const DEFAULT_ITEMS = [
  { image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
  { image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
  { image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
  { image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
  { image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
];

const AccordionGallery = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 2,
  accentColor = '#ffffff',
  overlayColor = '#060010',
  textColor = '#ffffff',
  height = 460,
  gap = 10,
  radius = 16,
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.1,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  showIndicators = true,
  grayscale = true,
  className = '',
  autoPlay = false,
  autoPlayInterval = 1000,
  pauseOnHover: _pauseOnHover = true,
  onItemActivate,

}) => {
  const rootRef = useRef(null);
  const panelRefs = useRef([]);
  const mediaRefs = useRef([]);
  const barRefs = useRef([]);
  const textRefs = useRef([]);
  const tlRef = useRef(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);
  const resumeTimerRef = useRef(null);

  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 520px)').matches : false
  );
  const [isVisible, setIsVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(
    typeof document === 'undefined' ? true : !document.hidden
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(max-width: 520px)');
    const updateScreen = () => setIsSmallScreen(mql.matches);
    updateScreen();
    mql.addEventListener('change', updateScreen);
    return () => mql.removeEventListener('change', updateScreen);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const isVertical = orientation === 'vertical' || isSmallScreen;
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), Math.max(count - 1, 0)));
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrefersReduced(mql.matches);
    sync();
    mql.addEventListener('change', sync);
    return () => mql.removeEventListener('change', sync);
  }, []);

  const canHover =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(hover: hover)').matches
      : true;

  const pauseTemporarily = useCallback((duration = autoPlayInterval) => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, duration);
  }, [autoPlayInterval]);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    },
    []
  );

  const hoverActivates = trigger === 'hover' && canHover && !autoPlay;

  const applyLayout = useCallback(
    animate => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = isVertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: isVertical ? 0 : isActive ? 0 : shift,
              y: isVertical ? (isActive ? 0 : shift) : 0,
              '--ag-gray': gray,
              '--ag-dim': isActive ? 0 : 0.35,
              duration: dur,
              ease
            },
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      count,
      expandRatio,
      duration,
      ease,
      isVertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced
    ]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = isVertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, isVertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  useEffect(() => {
    if (!autoPlay || count <= 1 || isPaused || prefersReduced || !isVisible || !pageVisible) return undefined;

    const intervalId = setInterval(() => {
      setActive(prev => (prev + 1) % count);
    }, Math.max(1000, autoPlayInterval));

    return () => clearInterval(intervalId);
  }, [autoPlay, autoPlayInterval, count, isPaused, prefersReduced, isVisible, pageVisible]);

  const handleEnter = i => {
    if (hoverActivates) setActive(i);
  };

  const handleClick = (i, e) => {
    if (autoPlay) {
      pauseTemporarily(Math.max(4000, autoPlayInterval));
    }
    if (i !== active) {
      e.preventDefault();
      setActive(i);
      return;
    }
    if (onItemActivate) {
      e.preventDefault();
      onItemActivate(items[i], i, e);
    }
  };

  const handleKeyDown = (i, e) => {
    if (autoPlay) {
      pauseTemporarily(Math.max(4000, autoPlayInterval));
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  return (
    <div className={`accordion-gallery-wrapper${className ? ` ${className}` : ''}`}>
      <div
        ref={rootRef}
        className={`accordion-gallery${isVertical ? ' accordion-gallery--vertical' : ''}`}
        style={{
          '--ag-accent': accentColor,
          '--ag-overlay': overlayColor,
          '--ag-text': textColor,
          '--ag-gap': `${gap}px`,
          '--ag-radius': `${radius}px`,
          height: isVertical ? `${Math.round(height * 1.6)}px` : `${height}px`
        }}
        role="list"
        aria-label="Image accordion gallery"
      >
        {items.map((item, i) => {
          const isActive = i === active;
          const Tag = item.link ? 'a' : 'div';
          return (
            <Tag
              key={i}
              ref={el => (panelRefs.current[i] = el)}
              className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
              style={{ borderRadius: `${radius}px` }}
              href={item.link || undefined}
              onClick={e => handleClick(i, e)}
              onMouseEnter={() => handleEnter(i)}
              onFocus={() => {
                if (hoverActivates) setActive(i);
              }}
              onKeyDown={e => handleKeyDown(i, e)}
              role="listitem"
              tabIndex={0}
              aria-current={isActive ? 'true' : undefined}
              aria-label={item.label}
            >
              <span className="ag-panel__frame">
                <span className="ag-panel__media" ref={el => (mediaRefs.current[i] = el)}>
                  <img
                    src={item.image}
                    alt={item.alt || item.label || ''}
                    loading={i === active || i === (active + 1) % count ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable="false"
                  />
                </span>
                <span className="ag-panel__overlay" aria-hidden="true" />
              </span>
              {showLabels && (
                <span className="ag-panel__label" aria-hidden="true">
                  <span className="ag-panel__bar" ref={el => (barRefs.current[i] = el)} />
                  <span className="ag-panel__text" ref={el => (textRefs.current[i] = el)}>
                    {item.label}
                  </span>
                </span>
              )}
            </Tag>
          );
        })}
      </div>

      {showIndicators && count > 1 && (
        <div className="ag-indicators" role="tablist" aria-label="Slide indicators">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              className={`ag-indicator-dot${i === active ? ' ag-indicator-dot--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (autoPlay) pauseTemporarily(Math.max(4000, autoPlayInterval));
                setActive(i);
              }}
              aria-label={`Go to slide ${i + 1}: ${item.label || ''}`}
              aria-selected={i === active}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AccordionGallery;
