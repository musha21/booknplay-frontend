import { useState } from 'react';
import { Alert, Button, IconButton, InputAdornment, Paper, TextField } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import BrandLogo from '../../components/ui/BrandLogo';
import { useAdminLogin } from '../../hooks/useAdmin';
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useAdminLogin();
  return <div className="grid min-h-screen place-items-center bg-navy-900 p-4"><Paper className="w-full max-w-md !rounded-3xl p-8"><BrandLogo /><p className="eyebrow mt-8">Restricted access</p><h1 className="mt-2 text-2xl font-black">Platform login</h1><p className="mt-2 text-sm text-muted">Use your platform credentials.</p>{login.isError && <Alert severity="error" className="!mt-5">{login.error?.response?.data?.message || 'Login failed'}</Alert>}<form onSubmit={(event)=>{event.preventDefault();login.mutate({email,password});}} className="mt-6 space-y-4"><TextField fullWidth required type="email" label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><TextField fullWidth required type={showPassword ? 'text' : 'password'} label="Password" value={password} onChange={(e)=>setPassword(e.target.value)} slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton edge="end" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }} /><Button fullWidth type="submit" variant="contained" disabled={login.isPending}>{login.isPending?'Signing in…':'Sign in'}</Button></form></Paper></div>;
}
