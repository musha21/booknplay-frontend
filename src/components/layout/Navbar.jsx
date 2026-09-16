import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container, Button, Avatar, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import {
  SportsSoccer, Search, EventNote, Person, Logout, Login, PersonAdd
} from '@mui/icons-material';
import useAuthStore from '../../stores/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    navigate('/auth/login');
  };

  const isAuth = Boolean(isAuthenticated);

  return (
    <header className="bg-navy-900 text-white sticky top-0 z-50 shadow-md font-sans">
      <Container maxWidth="xl" className="flex items-center justify-between h-16">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 decoration-none">
          <div className="w-9 h-9 rounded-xl bg-lime-500 flex items-center justify-center text-navy-900 shadow-lime">
            <SportsSoccer className="!text-xl" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Book<span className="text-lime-400">N</span>Play
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link to="/" className="text-slate-300 hover:text-lime-400 decoration-none transition-colors">
            Home
          </Link>
          <Link to="/search" className="text-slate-300 hover:text-lime-400 decoration-none transition-colors flex items-center gap-1">
            <Search className="!text-lg" /> Search Venues
          </Link>
          {isAuth && (
            <Link to="/account/bookings" className="text-slate-300 hover:text-lime-400 decoration-none transition-colors flex items-center gap-1">
              <EventNote className="!text-lg" /> My Bookings
            </Link>
          )}
        </nav>

        {/* Auth Buttons / Account Menu */}
        <div className="flex items-center gap-3">
          {isAuth ? (
            <>
              <button
                onClick={handleOpenMenu}
                className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-white py-1.5 px-3 rounded-full border border-navy-700 cursor-pointer transition-colors"
              >
                <Avatar className="!w-7 !h-7 !bg-lime-500 !text-navy-900 !font-bold !text-xs">
                  {customer?.firstName ? customer.firstName[0].toUpperCase() : 'U'}
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {customer?.firstName || 'Account'}
                </span>
              </button>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{
                  className: '!rounded-xl !mt-2 !min-w-[180px] !shadow-lg',
                }}
              >
                <MenuItem onClick={() => { handleCloseMenu(); navigate('/account/profile'); }}>
                  <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                  <ListItemText primary="My Profile" />
                </MenuItem>
                <MenuItem onClick={() => { handleCloseMenu(); navigate('/account/bookings'); }}>
                  <ListItemIcon><EventNote fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Upcoming Bookings" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} className="!text-red-600">
                  <ListItemIcon><Logout fontSize="small" className="!text-red-600" /></ListItemIcon>
                  <ListItemText primary="Sign Out" />
                </MenuItem>
              </Menu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                component={Link}
                to="/auth/login"
                variant="text"
                startIcon={<Login />}
                className="!text-slate-200 hover:!text-white !font-bold !text-sm"
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/auth/register"
                variant="contained"
                startIcon={<PersonAdd />}
                className="!bg-lime-500 hover:!bg-lime-600 !text-navy-900 !font-bold !text-sm !py-1.5 !px-4 !rounded-xl"
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
