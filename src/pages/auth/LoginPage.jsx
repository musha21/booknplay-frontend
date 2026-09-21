import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography, InputAdornment, IconButton,
  Alert
} from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff, SportsSoccer } from '@mui/icons-material';
import {
  useLogin
 } from '../../hooks/useAuth';
import BrandLogo from '../../components/ui/BrandLogo';
import ThemeToggle from '../../components/ui/ThemeToggle';
import LoginRoleSwitch from '../../components/auth/LoginRoleSwitch';

export default function LoginPage() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const bookingRedirect = location.state?.reason === 'booking' || location.state?.from?.pathname === '/checkout';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password });
  };


  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 pt-24 font-sans relative">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:px-8"><BrandLogo inverse /><ThemeToggle inverse /></div>
      <Container maxWidth="xs">
        <Paper elevation={3} className="p-8 !bg-white !rounded-3xl !shadow-2xl">
          <LoginRoleSwitch />
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 decoration-none">
              <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center text-navy-900 shadow-lime">
                <SportsSoccer className="!text-2xl" />
              </div>
              <span className="text-2xl font-extrabold text-navy-900">Book<span className="text-lime-600">N</span>Play</span>
            </Link>
            <Typography variant="h5" className="!font-bold !text-navy-900">
              {bookingRedirect ? 'Sign in to complete your booking' : 'Welcome Back'}
            </Typography>
            <Typography variant="body2" className="!text-slate-500 !mt-1">
              {bookingRedirect
                ? 'You can browse courts without an account. A customer login is required to reserve a slot.'
                : 'Sign in to book courts and manage bookings'}
            </Typography>
          </div>

          {loginMutation.isError && (
            <Alert severity="error" className="mb-4">
              {loginMutation.error?.response?.data?.message || 'Invalid email or password'}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email className="!text-slate-400" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="!text-slate-400" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loginMutation.isPending}
              className="!bg-lime-500 hover:!bg-lime-600 !text-navy-900 !font-bold !py-3 !rounded-xl shadow-lime">
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-500">
            Don't have an account? {''}
            <Link to="/auth/register" state={location.state} className="text-navy-400 font-semibold hover:text-lime-600 decoration-none">
              Register now
            </Link>
          </div>
        </Paper>
      </Container>
    </div>
  );
}
