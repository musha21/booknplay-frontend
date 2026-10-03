import { useState } from 'react';
import { TextField, Button } from '@mui/material';
import useAuthStore from '../../stores/authStore';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { customer, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateUser(formData);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="customer-panel p-5 sm:p-7">
      <p className="eyebrow">Personal details</p>
      <h2 className="customer-card-title mt-2">Profile settings</h2>
      <p className="customer-body mt-2">Keep your contact details accurate for booking updates.</p>
      <form onSubmit={handleSave} className="mt-6 max-w-xl space-y-4 rounded-2xl border border-line bg-canvas/60 p-4 sm:p-5">
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
        <Button type="submit" variant="contained" className="!bg-navy-900 !px-6 !py-3 !font-bold !text-white hover:!bg-navy-800">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
