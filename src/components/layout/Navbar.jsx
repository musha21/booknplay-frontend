import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Avatar, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Close, EventNote, Login, Logout, Menu as MenuIcon, Person, PersonAdd, Search } from '@mui/icons-material';
import useAuthStore from '../../stores/authStore';
import BrandLogo from '../ui/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';

const links = [
  { to: '/search', label: 'Explore venues', icon: <Search /> },
  { to: '/#sports', label: 'Sports' },
  { to: '/#how-it-works', label: 'How it works' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeAll = () => { setAnchorEl(null); setMobileOpen(false); };
  const handleLogout = () => { closeAll(); logout(); navigate('/auth/login'); };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur-xl">
      <div className="section-container flex h-[72px] items-center justify-between gap-4">
        <BrandLogo />
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => <NavLink key={link.to} to={link.to} className="text-sm font-bold text-muted no-underline transition hover:text-ink">{link.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <button onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="Open account menu" className="hidden items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-1.5 pr-3 text-ink sm:flex">
                <Avatar className="!h-8 !w-8 !bg-lime-400 !text-xs !font-black !text-navy-900">{customer?.firstName?.[0]?.toUpperCase() || 'U'}</Avatar>
                <span className="text-sm font-bold">{customer?.firstName || 'Account'}</span>
              </button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { closeAll(); navigate('/account/profile'); }}><ListItemIcon><Person fontSize="small" /></ListItemIcon><ListItemText>My profile</ListItemText></MenuItem>
                <MenuItem onClick={() => { closeAll(); navigate('/account/bookings'); }}><ListItemIcon><EventNote fontSize="small" /></ListItemIcon><ListItemText>My bookings</ListItemText></MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} className="!text-red-500"><ListItemIcon><Logout className="!text-red-500" fontSize="small" /></ListItemIcon><ListItemText>Sign out</ListItemText></MenuItem>
              </Menu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button component={Link} to="/auth/login" color="inherit" startIcon={<Login />}>Log in</Button>
              <Button component={Link} to="/owner/register" variant="contained">List your venue</Button>
            </div>
          )}
          <IconButton className="lg:!hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
        </div>
      </div>
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 'min(86vw, 340px)', p: 2 } }}>
        <div className="flex items-center justify-between"><BrandLogo /><IconButton aria-label="Close navigation" onClick={() => setMobileOpen(false)}><Close /></IconButton></div>
        <List className="!mt-6">
          {links.map((link) => <ListItemButton key={link.to} component={Link} to={link.to} onClick={closeAll}><ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 750 }} /></ListItemButton>)}
          {isAuthenticated && <ListItemButton component={Link} to="/account/bookings" onClick={closeAll}><ListItemText primary="My bookings" primaryTypographyProps={{ fontWeight: 750 }} /></ListItemButton>}
        </List>
        <div className="mt-auto grid gap-2 pt-6">
          {isAuthenticated ? <Button variant="outlined" color="error" onClick={handleLogout} startIcon={<Logout />}>Sign out</Button> : <>
            <Button component={Link} to="/auth/login" onClick={closeAll} variant="outlined" startIcon={<Login />}>Log in</Button>
            <Button component={Link} to="/auth/register" onClick={closeAll} variant="contained" color="secondary" startIcon={<PersonAdd />}>Create account</Button>
            <Button component={Link} to="/owner/register" onClick={closeAll}>List your venue</Button>
          </>}
        </div>
      </Drawer>
    </header>
  );
}
