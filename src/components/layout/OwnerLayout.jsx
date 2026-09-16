import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Logout,
  Payments,
  Stadium,
} from '@mui/icons-material';
import useAuthStore from '../../stores/authStore';

const drawerWidth = 240;

const links = [
  { to: '/owner', label: 'Venues', icon: <Dashboard />, end: true },
  { to: '/owner/venues/new', label: 'Create venue', icon: <Stadium /> },
  { to: '/owner/earnings', label: 'Earnings', icon: <Payments /> },
  { to: '/owner/profile', label: 'Profile', icon: <AccountCircle /> },
];

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { owner, logout } = useAuthStore();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
            BookNPlay Owner
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {owner?.businessName}
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => {
              logout();
              navigate('/owner/login');
            }}
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', pt: 8 },
        }}
      >
        <List>
          {links.map((link) => (
            <ListItemButton
              key={link.to}
              component={NavLink}
              to={link.to}
              end={link.end}
              sx={{ '&.active': { bgcolor: '#eef1f8', color: 'primary.main' } }}
            >
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
