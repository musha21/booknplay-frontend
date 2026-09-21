import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Container, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useOwnerLogin } from '../../hooks/useOwner';
import BrandLogo from '../../components/ui/BrandLogo';
import ThemeToggle from '../../components/ui/ThemeToggle';
import LoginRoleSwitch from '../../components/auth/LoginRoleSwitch';

export default function OwnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useOwnerLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 pt-24 relative">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:px-8"><BrandLogo inverse /><ThemeToggle inverse /></div>
      <Container maxWidth="xs">
        <Paper className="p-8 !rounded-3xl">
          <LoginRoleSwitch />
          <Typography variant="h5" className="!font-bold !mb-1">Venue owner login</Typography>
          <Typography variant="body2" className="!text-slate-500 !mb-6">
            Manage courts, walk-ins, and earnings
          </Typography>
          {loginMutation.isError && (
            <Alert severity="error" className="mb-4">
              {loginMutation.error?.response?.data?.message || 'Login failed'}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton edge="end" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} />
            <Button type="submit" fullWidth variant="contained" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <Typography variant="body2" className="!mt-4 !text-center">
            New partner? <Link to="/owner/register">Create an account</Link>
          </Typography>
          <div className="mt-6 border-t border-slate-200 pt-4 text-center">
            <Link to="/admin/login" className="text-xs font-semibold text-slate-400 no-underline transition hover:text-slate-600">
              Platform access
            </Link>
          </div>
        </Paper>
      </Container>
    </div>
  );
}
