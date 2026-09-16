import React from 'react';
import { Paper, Button } from '@mui/material';
import { toast } from 'sonner';

export default function PrivacyPage() {
  return (
    <Paper elevation={1} className="p-6 !rounded-2xl !bg-white">
      <h2 className="text-2xl font-bold text-navy-900 mb-4">Privacy & Data Controls</h2>
      <p className="text-slate-500 mb-6">Manage your personal data, cookie preferences, and account deletion requests.</p>
      <div className="space-y-4">
        <Button variant="outlined" onClick={() => toast.info('Data export initiated. We will email your history.')}>
          Download My Data
        </Button>
      </div>
    </Paper>
  );
}