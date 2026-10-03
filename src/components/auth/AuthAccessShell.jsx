import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import ThemeToggle from '../ui/ThemeToggle';
import LoginRoleSwitch from './LoginRoleSwitch';
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
  mode = 'login',
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
  const partnerTo = role === 'owner' ? '/auth/login' : '/owner/register';
  const partnerLabel = role === 'owner' ? 'Sign in as a player' : 'Partner with us';
  const partnerPrompt = role === 'owner' ? 'Looking to play?' : 'Own a venue?';

  return (
    <main className={`auth-access${admin ? ' is-admin' : ''}${still ? ' is-still' : ''}`}>
      <section className="auth-brand">
        <div className="auth-brand-top">
          <Link to="/" className="auth-logo" aria-label="BooknPlay home">booknplay<span>.</span></Link>
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
          <Link to={partnerTo}>{partnerPrompt} <strong>{partnerLabel} ↗</strong></Link>
        </header>
        <motion.div
          className="auth-form-wrap"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.65, delay: reduced ? 0 : 0.15, ease: 'easeOut' }}
        >
          {role !== 'admin' && <LoginRoleSwitch mode={mode} />}
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
          {role !== 'admin' && <Link to="/admin/login">Platform admin ↗</Link>}
          <span className="auth-secure">Your game starts here</span>
        </footer>
      </section>
    </main>
  );
}
