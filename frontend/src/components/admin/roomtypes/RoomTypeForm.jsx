// src/pages/admin/rooms/RoomTypeForm.jsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
} from '@mui/material';

export default function RoomTypeForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    basePrice: '',
    capacityAdults: '',
    capacityChildren: '',
    size: '',
    bedType: '',
    totalRooms: '',      // Số phòng dự kiến
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        basePrice: initialData.basePrice || '',
        capacityAdults: initialData.capacityAdults || '',
        capacityChildren: initialData.capacityChildren || '',
        size: initialData.size || '',
        bedType: initialData.bedType || '',
        totalRooms: initialData.totalRooms || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      basePrice: parseFloat(form.basePrice) || 0,
      capacityAdults: parseInt(form.capacityAdults) || 0,
      capacityChildren: parseInt(form.capacityChildren) || 0,
      size: form.size ? parseFloat(form.size) : null,
      totalRooms: form.totalRooms ? parseInt(form.totalRooms) : null,
      id: initialData?.id,
    };

    onSave(payload);
  };

  return (
    <Dialog open={true} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle className="text-xl font-black text-gray-900">
        {initialData ? 'Chỉnh sửa Loại Phòng' : 'Thêm Loại Phòng Mới'}
      </DialogTitle>

      <DialogContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Tên loại phòng */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên loại phòng"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>

            {/* Giá + Diện tích */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá cơ bản (VND)"
                name="basePrice"
                type="number"
                value={form.basePrice}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Diện tích phòng (m²)"
                name="size"
                type="number"
                value={form.size}
                onChange={handleChange}
              />
            </Grid>

            {/* Số người lớn + Trẻ em */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số người lớn"
                name="capacityAdults"
                type="number"
                value={form.capacityAdults}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số trẻ em"
                name="capacityChildren"
                type="number"
                value={form.capacityChildren}
                onChange={handleChange}
              />
            </Grid>

            {/* Số phòng + Loại giường */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số phòng dự kiến"
                name="totalRooms"
                type="number"
                value={form.totalRooms}
                onChange={handleChange}
                helperText="Số lượng phòng thuộc loại này"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loại giường (Bed Type)"
                name="bedType"
                value={form.bedType}
                onChange={handleChange}
                placeholder="1 King Bed, 2 Queen Beds..."
              />
            </Grid>

            {/* Mô tả */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                multiline
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions className="px-6 pb-6">
        <Button
          onClick={onCancel}
          sx={{ borderRadius: '14px', px: 4 }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: '#ff5e1f',
            '&:hover': { bgcolor: '#e54d1a' },
            borderRadius: '14px',
            px: 6,
            fontWeight: 'bold',
          }}
        >
          {initialData ? 'Lưu thay đổi' : 'Thêm loại phòng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}