import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Container, Grid, Paper, List, ListItem, ListItemButton, ListItemText, Avatar
} from '@mui/material';
import {
  EventNote, History, Favorite, Person, Shield, HelpOutlined
} from '@mui/icons-material';
import useAuthStore from '../../stores/authStore';

export default function AccountPage() {
  const location = useLocation();
  const { customer } = useAuthStore();

  const menuItems = [
    { label: 'Upcoming Bookings', path: '/account/bookings', icon: <EventNote /> },
    { label: 'Booking History', path: '/account/history', icon: <History /> },
    { label: 'Favourites', path: '/account/favourites', icon: <Favorite /> },
    { label: 'Profile', path: '/account/profile', icon: <Person /> },
    { label: 'Privacy Controls', path: '/account/privacy', icon: <Shield /> },
    { label: 'Help & Support', path: '/account/help', icon: <HelpOutlined /> },
  ];

  return (
    <div className="py-10 bg-slate-50 min-h-screen font-sans">
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid xs={12} md={3}>
            <Paper elevation={1} className="p-6 !rounded-2xl !bg-white">
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="!w-12 !h-12 !bg-lime-500 !text-navy-900 !font-bold">
                  {customer?.firstName ? customer.firstName[0].toUpperCase() : 'U'}
                </Avatar>
                <div>
                  <h3 className="font-bold text-navy-900">{customer?.firstName || 'User'} {customer?.lastName}</h3>
                  <p className="text-xs text-slate-400">{customer?.email}</p>
                </div>
              </div>

              <List className="p-0">
                {menuItems.map((item) => (
                  <ListItem key={item.path} disablePadding className="mb-1">
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      selected={location.pathname === item.path}
                      className="!rounded-xl"
                    >
                      <div className="mr-3 text-navy-700">{item.icon}</div>
                      <ListItemText primary={item.label} primaryTypographyProps={{ className: '!font-semibold !text-sm' }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid xs={12} md={9}>
            <Outlet />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}