import { Button } from '@mui/material';
import { Download, Shield } from '@mui/icons-material';
import { toast } from 'sonner';

export default function PrivacyPage() {
  return (
    <div className="customer-panel p-5 sm:p-7">
      <p className="eyebrow">Your information</p>
      <h2 className="customer-card-title mt-2">Privacy and data controls</h2>
      <p className="customer-body mt-2">Manage how you access the personal information connected to your account.</p>
      <div className="mt-6 rounded-2xl border border-line bg-canvas/60 p-5">
        <div className="flex gap-3">
          <Shield className="text-lime-600" />
          <div>
            <h3 className="customer-card-title">Account data export</h3>
            <p className="customer-body mt-1">Request a copy of your profile and booking history. It will be sent to your registered email address.</p>
            <Button
              className="!mt-4 !border-line !font-bold !text-ink hover:!border-lime-500"
              variant="outlined"
              startIcon={<Download />}
              onClick={() => toast.info('Data export requested. We will email you when it is ready.')}
            >
              Request my data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
