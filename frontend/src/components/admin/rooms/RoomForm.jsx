// RoomForm.jsx
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';
import { TextField, Button, Box, Typography, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';

export default function RoomForm({ onSuccess }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    roomNumber: '',
    roomTypeId: '',
    floor: '',
    status: 'Available',
    cleaningStatus: 'Dirty',
  });

  const { data: roomTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ['roomTypes'],
    queryFn: async () => {
      const res = await roomApi.getRoomTypes();
      console.log('RoomTypes API response:', res.data); // debug
      return res.data.items || [];
    },
    staleTime: 5 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: true,
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
        <Select
          value={form.roomTypeId}
          label="Loại phòng"
          onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
          disabled={loadingTypes}
        >
          {loadingTypes ? (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
            </MenuItem>
          ) : roomTypes.length === 0 ? (
            <MenuItem disabled>Không có loại phòng</MenuItem>
          ) : (
            roomTypes.map((rt) => (
              <MenuItem key={rt.id} value={rt.id}>
                {rt.name}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      <TextField fullWidth label="Tầng" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} sx={{ mb: 2 }} />

      <Button type="submit" variant="contained" fullWidth size="large" disabled={mutation.isPending}>
        {mutation.isPending ? 'Đang tạo...' : 'Tạo Phòng'}
      </Button>
    </Box>
  );
}