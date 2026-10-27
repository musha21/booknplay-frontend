import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import BrandLogo from '../ui/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';
import SportsEquipment from './SportsEquipment';
import useEquipmentMotion from './useEquipmentMotion';

const HERO = {
  customer: {
    eyebrow: 'Make time for play',
    title: <>Less planning.<br />More <em>playing.</em></>,
    text: <>Your court. Your crew. Your next great game.<br />It all starts here.</>,
  },
  owner: {
    eyebrow: 'Grow with BooknPlay',
    title: <>Your venue.<br />More <em>players.</em></>,
    text: <>Make room for more great games.<br />Your business journey starts here.</>,
  },
  admin: {
    eyebrow: 'Platform administration',
    title: <>A clear view.<br />Every <em>game.</em></>,
    text: <>One place to keep BooknPlay running.</>,
  },
};

export default function AuthAccessShell({
  role = 'customer',
  mode: _mode = 'login',
  kicker,
  title,
  subtitle,
  children,
  alternate,
}) {
  const hero = HERO[role] || HERO.customer;
  const reduced = Boolean(useReducedMotion());
  const equipment = useEquipmentMotion();
  const still = equipment.still;
  const admin = role === 'admin';
  const owner = role === 'owner';
  // Customer auth screens stay customer-only (no owner/admin CTAs).
  // Owner shell may offer a path back to player login; admin stays invite/URL-only.
  const showPlayerLink = owner;

  return (
    <main className={`auth-access${admin ? ' is-admin' : ''}${still ? ' is-still' : ''}`}>
      <section className="auth-brand">
        <div className="auth-brand-top">
          <BrandLogo inverse className="auth-logo" />
          <ThemeToggle inverse />
        </div>
        <motion.div
          className="auth-hero"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.75, ease: 'easeOut' }}
        >
          <p className="auth-eyebrow"><span />{hero.eyebrow}</p>
          <h1>{hero.title}</h1>
          <p>{hero.text}</p>
        </motion.div>
        <SportsEquipment still={still} quiet={admin} />
        <div className="auth-brand-bottom">
          <span>Find your game.</span>
          <button type="button" onClick={equipment.toggle} disabled={reduced} aria-pressed={still}>
            {reduced ? 'Reduced motion enabled' : equipment.paused ? 'Play animation' : 'Pause animation'}
          </button>
        </div>
      </section>
      <section className="auth-form-panel">
        <header className="auth-topbar">
          {showPlayerLink ? (
            <Link to="/auth/login">Looking to play? <strong>Sign in as a player ↗</strong></Link>
          ) : (
            <span className="auth-topbar-spacer" aria-hidden="true" />
          )}
        </header>
        <motion.div
          className="auth-form-wrap"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.65, delay: reduced ? 0 : 0.15, ease: 'easeOut' }}
        >
          <p className="auth-kicker">{kicker}</p>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          {alternate && (
            <p className="auth-switch">
              {alternate.prompt}{' '}
              <Link to={alternate.to} state={alternate.state}>{alternate.label}</Link>
            </p>
          )}
          {admin && <p className="auth-switch">Accounts are invitation only.</p>}
        </motion.div>
        <footer className="auth-footer">
          <span>© 2026 BooknPlay</span>
          <span className="auth-secure">Your game starts here</span>
        </footer>
      </section>
    </main>
  );
}
