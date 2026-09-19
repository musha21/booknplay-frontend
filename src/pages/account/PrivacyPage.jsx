import { Button } from '@mui/material';
import { Download, Shield } from '@mui/icons-material';
import { toast } from 'sonner';

export default function PrivacyPage() {
  return <div className="surface-card p-5 sm:p-7"><p className="eyebrow">Your information</p><h2 className="mt-2 text-2xl font-black text-ink">Privacy and data controls</h2><div className="mt-6 rounded-2xl border border-line bg-canvas/60 p-5"><div className="flex gap-3"><Shield className="text-lime-600" /><div><h3 className="font-extrabold text-ink">Account data export</h3><p className="mt-1 text-sm leading-6 text-muted">Request a copy of your profile and booking history. It will be sent to your registered email address.</p><Button className="!mt-4" variant="outlined" startIcon={<Download />} onClick={() => toast.info('Data export requested. We will email you when it is ready.')}>Request my data</Button></div></div></div></div>;
}
