import React, { useState } from 'react';
import { Paper, TextField, Button } from '@mui/material';
import useAuthStore from '../../stores/authStore';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { customer, setCustomer } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setCustomer({ ...customer, ...formData });
    toast.success('Profile updated successfully');
  };

  return (
    <Paper elevation={1} className="p-6 !rounded-2xl !bg-white">
      <h2 className="text-2xl font-bold text-navy-900 mb-6">Profile Settings</h2>
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        />
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        />
        <TextField
          fullWidth
          label="Email"
          value={formData.email}
          disabled
        />
        <TextField
          fullWidth
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Button type="submit" variant="contained" className="!bg-navy-700 !text-white !font-bold !py-3">
          Save Changes
        </Button>
      </form>
    </Paper>
  );
}