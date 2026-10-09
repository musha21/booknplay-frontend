import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Divider, Drawer, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { ArrowOutward, Close, EventNote, Favorite, Login, Logout, Menu as MenuIcon, Person, PersonAdd } from '@mui/icons-material';
import { revokeAndClearSession } from '../../lib/signOut';
import useAuthStore from '../../stores/authStore';
import BrandLogo from '../ui/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';

const links = [
  { to: '/#venues', label: 'Explore venues' },
  { to: '/owner/register', label: 'List a venue' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, isAuthenticated } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = location.pathname === '/';
  const closeAll = () => { setAnchorEl(null); setMobileOpen(false); };
  const handleLogout = async () => {
    closeAll();
    const path = await revokeAndClearSession('CUSTOMER');
    navigate(path);
  };

  return (
    <header className={`site-header ${isHome ? 'home-site-header' : 'border-b border-line/70 bg-canvas/90 backdrop-blur-xl'}`}>
      {isHome ? (
        <div className="hp-header-bar">
          <BrandLogo variant="home" />
          <nav className={`hp-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
            <Link to="/#venues" onClick={() => setMobileOpen(false)}>Explore venues</Link>
            <a href="#sports" onClick={() => setMobileOpen(false)}>Sports</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How it works</a>
            {isAuthenticated && <Link to="/account/favourites" className="hp-nav-extra" onClick={() => setMobileOpen(false)}>Favourites</Link>}
            {isAuthenticated && <Link to="/account/bookings" className="hp-nav-extra" onClick={() => setMobileOpen(false)}>My bookings</Link>}
            {isAuthenticated && <button type="button" className="hp-nav-extra" onClick={handleLogout}>Sign out</button>}
          </nav>
          <div className="hp-header-actions">
            <ThemeToggle />
            <Link to="/owner/register" className="hp-partner-link">List your venue <span aria-hidden="true">↗</span></Link>
            {isAuthenticated ? (
              <>
                <button type="button" className="hp-account" onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="Open account menu">
                  <Avatar className="!h-8 !w-8 !bg-lime-400 !text-xs !font-black !text-navy-900">{customer?.firstName?.[0]?.toUpperCase() || 'U'}</Avatar>
                  <span>{customer?.firstName || 'Account'}</span>
                </button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  <MenuItem onClick={() => { closeAll(); navigate('/account/profile'); }}><ListItemIcon><Person fontSize="small" /></ListItemIcon><ListItemText>My profile</ListItemText></MenuItem>
                  <MenuItem onClick={() => { closeAll(); navigate('/account/favourites'); }}><ListItemIcon><Favorite fontSize="small" /></ListItemIcon><ListItemText>Favourites</ListItemText></MenuItem>
                  <MenuItem onClick={() => { closeAll(); navigate('/account/bookings'); }}><ListItemIcon><EventNote fontSize="small" /></ListItemIcon><ListItemText>My bookings</ListItemText></MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} className="!text-red-500"><ListItemIcon><Logout className="!text-red-500" fontSize="small" /></ListItemIcon><ListItemText>Sign out</ListItemText></MenuItem>
                </Menu>
              </>
            ) : (
              <Link to="/auth/login" className="hp-sign-in">Sign in <ArrowOutward fontSize="small" /></Link>
            )}
            <button type="button" className="hp-menu-toggle" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileOpen((open) => !open)}>
              {mobileOpen ? <Close /> : <MenuIcon />}
            </button>
          </div>
        </div>
      ) : (
        <div className="section-container flex items-center gap-3 py-3">
          <BrandLogo compact className="md:hidden" />
          <BrandLogo className="hidden md:inline-flex" />
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <button onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="Open account menu" className="hidden items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-ink lg:flex">
                  <Avatar className="!h-8 !w-8 !bg-lime-400 !text-xs !font-black !text-navy-900">{customer?.firstName?.[0]?.toUpperCase() || 'U'}</Avatar>
                  <span className="text-sm font-bold">{customer?.firstName || 'Account'}</span>
                </button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  <MenuItem onClick={() => { closeAll(); navigate('/account/profile'); }}><ListItemIcon><Person fontSize="small" /></ListItemIcon><ListItemText>My profile</ListItemText></MenuItem>
                  <MenuItem onClick={() => { closeAll(); navigate('/account/favourites'); }}><ListItemIcon><Favorite fontSize="small" /></ListItemIcon><ListItemText>Favourites</ListItemText></MenuItem>
                  <MenuItem onClick={() => { closeAll(); navigate('/account/bookings'); }}><ListItemIcon><EventNote fontSize="small" /></ListItemIcon><ListItemText>My bookings</ListItemText></MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} className="!text-red-500"><ListItemIcon><Logout className="!text-red-500" fontSize="small" /></ListItemIcon><ListItemText>Sign out</ListItemText></MenuItem>
                </Menu>
              </>
            ) : (
              <Button component={Link} to="/auth/login" variant="text" startIcon={<Login />} className="!hidden lg:!inline-flex">Sign in</Button>
            )}
            <IconButton aria-label="Open menu" onClick={() => setMobileOpen(true)} className="!rounded-full !border !border-line !bg-surface lg:!hidden">
              <MenuIcon />
            </IconButton>
          </div>
        </div>
      )}
      {!isHome && (
        <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} slotProps={{ paper: { className: 'mobile-nav' } }}>
          <div className="mobile-nav-top">
            <BrandLogo className="mobile-nav-brand" />
            <IconButton aria-label="Close menu" onClick={() => setMobileOpen(false)}><Close /></IconButton>
          </div>
          <nav className="mobile-nav-links" aria-label="Mobile">
            {links.map((link) => <Link key={link.to} to={link.to} onClick={closeAll}>{link.label}</Link>)}
            {isAuthenticated && <Link to="/account/bookings" onClick={closeAll}>My bookings</Link>}
          </nav>
          <div className="mobile-nav-actions">
            <div className="mobile-nav-appearance">Appearance <ThemeToggle /></div>
            {isAuthenticated ? <Button variant="outlined" color="error" onClick={handleLogout} startIcon={<Logout />}>Sign out</Button> : <>
              <Button component={Link} to="/auth/login" onClick={closeAll} variant="outlined" startIcon={<Login />}>Log in</Button>
              <Button component={Link} to="/auth/register" onClick={closeAll} variant="contained" color="secondary" startIcon={<PersonAdd />}>Create account</Button>
              <Button component={Link} to="/owner/register" onClick={closeAll}>List your venue</Button>
            </>}
          </div>
        </Drawer>
      )}
    </header>
  );
}
