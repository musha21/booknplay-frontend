import apiClient from '../lib/axios';

export const updateBusiness = (data) => apiClient.put('/owner/business', data);

export const uploadBusinessImages = ({ logo, images, profileImage }) => {
  const form = new FormData();
  if (logo) form.append('logo', logo);
  if (profileImage) form.append('profileImage', profileImage);
  (images || []).forEach((file) => form.append('images', file));
  return apiClient.post('/owner/business/images', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const changeOwnerPassword = (data) => apiClient.put('/owner/auth/password', data);
