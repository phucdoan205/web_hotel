// RoomForm.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';
import { TextField, Button, Box, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

export default function RoomForm({ onSuccess }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    roomNumber: '',
    roomTypeId: '',
    floor: '',
    status: 'Available',
    cleaningStatus: 'Dirty',
  });

  const mutation = useMutation({
    mutationFn: roomApi.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      onSuccess?.();
      setForm({ roomNumber: '', roomTypeId: '', floor: '', status: 'Available', cleaningStatus: 'Dirty' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Tạo Phòng Mới</Typography>

      <TextField fullWidth label="Số phòng" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} required sx={{ mb: 2 }} />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Loại phòng</InputLabel>
        <Select value={form.roomTypeId} onChange={e => setForm({ ...form, roomTypeId: e.target.value })} required>
          <MenuItem value={1}>Standard</MenuItem>
          <MenuItem value={2}>Deluxe</MenuItem>
          <MenuItem value={3}>Suite</MenuItem>
          {/* Thêm động sau khi có API getRoomTypes */}
        </Select>
      </FormControl>

      <TextField fullWidth label="Tầng" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} sx={{ mb: 2 }} />

      <Button type="submit" variant="contained" fullWidth size="large" disabled={mutation.isPending}>
        {mutation.isPending ? 'Đang tạo...' : 'Tạo Phòng'}
      </Button>
    </Box>
  );
}