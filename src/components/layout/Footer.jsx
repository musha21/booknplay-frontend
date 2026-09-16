import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Grid, Divider
} from '@mui/material';
import {
  SportsSoccer, Phone, Email, LocationOn, Facebook, Instagram, Twitter
} from '@mui/icons-material';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-16 pb-8 border-t border-navy-800 font-sans">
      <Container maxWidth="xl">
        <Grid container spacing={4} className="mb-12">
          <Grid xs={12} md={4}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center text-navy-900 shadow-lime">
                <SportsSoccer className="text-navy-900 !text-2xl" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Book<span className="text-lime-400">N</span>Play
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Book your favorite sports venues, courts, and pitches seamlessly across Sri Lanka. Instant confirmation & real-time slot availability.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center text-slate-300 hover:bg-lime-500 hover:text-navy-900 transition-colors"><Facebook fontSize="small" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center text-slate-300 hover:bg-lime-500 hover:text-navy-900 transition-colors"><Instagram fontSize="small" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center text-slate-300 hover:bg-lime-500 hover:text-navy-900 transition-colors"><Twitter fontSize="small" /></a>
            </div>
          </Grid>
          <Grid xs={6} sm={3} md={2}>
            <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider text-xs text-lime-400">Quick Links</h4>
            <ul className="space-y-2.5 text-sm p-0 m-0 list-none">
              <li><Link to="/" className="hover:text-lime-400 transition-colors decoration-none text-slate-400">Home</Link></li>
              <li><Link to="/search" className="hover:text-lime-400 transition-colors decoration-none text-slate-400">Search Venues</Link></li>
              <li><Link to="/account/bookings" className="hover:text-lime-400 transition-colors decoration-none text-slate-400">My Bookings</Link></li>
              <li><Link to="/account/profile" className="hover:text-lime-400 transition-colors decoration-none text-slate-400">Account Settings</Link></li>
            </ul>
          </Grid>
          <Grid xs={6} sm={3} md={2}>
            <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider text-xs text-lime-400">Sports</h4>
            <ul className="space-y-2.5 text-sm p-0 m-0 list-none">
              <li><Link to="/search?sport=badminton" className="hover:text-lime-400 transition-colors decoration-none text-slate-400">Badminton</Link></li>
              <li><Link to="/search?sport=football" className="hover:text-lime-400 transition-colors decoration-none text-slate-400">Futsal & Football</Link></li>
              <li><Link to="/search?sport=cricket" className="hover:text-lime-400 transition-colors decoration-none text-slate-400">Indoor Cricket</Link></li>
              <li><Link to="/search?sport=tennis" className="hover:text-lime-400 transition-colors decoration-none text-slate-400">Tennis & Padel</Link></li>
            </ul>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <h4 className="text-white font-bold text-base mb-4 uppercase tracking-wider text-xs text-lime-400">Contact & Support</h4>
            <div className="space-y3 text-sm text-slate-400">
              <div className="flex items-center gap-3"><Phone className="text-lime-400 !text-lg" /><span>+94 11 234 5678</span></div>
              <div className="flex items-center gap-3"><Email className="text-lime-400 !text-lg" /><span>support@booknplay.lk</span></div>
              <div className="flex items-center gap-3"><LocationOn className="text-lime-400 !text-lg" /><span>123 Sports Complex Way, Colombo 03</span></div>
            </div>
          </Grid>
        </Grid>
        <Divider className="!border-navy-800 !my-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 BookNPlay LK. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 decoration-none text-slate-500">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 decoration-none text-slate-500">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 decoration-none text-slate-500">Partner With Us</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}