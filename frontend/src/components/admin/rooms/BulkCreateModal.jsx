// src/components/admin/rooms/BulkCreateModal.jsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';

export default function BulkCreateModal({ open, onClose }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    roomTypeId: '',
    startNumber: '101',
    count: 5,
    floor: 1,
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Room Types (PagedResponse)
  const { data: roomTypes = [], isLoading: loadingTypes } = useQuery({
    queryKey: ['roomTypes'],
    queryFn: async () => {
      const res = await roomApi.getRoomTypes();
      console.log('RoomTypes API response:', res.data); // debug
      return res.data.items || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: open,                    // chỉ fetch khi modal mở
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (!data.roomTypeId) throw new Error('Vui lòng chọn loại phòng');

      const rooms = [];
      let current = parseInt(data.startNumber, 10);

      for (let i = 0; i < data.count; i++) {
        rooms.push({
          roomNumber: current.toString().padStart(3, '0'),
          roomTypeId: Number(data.roomTypeId),
          floor: data.floor,
          status: 'Available',
          cleaningStatus: 'Dirty',
        });
        current++;
      }

      return roomApi.bulkCreateRooms({ rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      alert(`Tạo thành công ${form.count} phòng!`);
      onClose();
      setForm({ roomTypeId: '', startNumber: '101', count: 5, floor: 1 });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Tạo phòng thất bại';
      setErrorMsg(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    mutation.mutate(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Tạo Nhiều Phòng (Bulk Create)
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
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
          </Box>

          <TextField fullWidth label="Số phòng bắt đầu" value={form.startNumber} onChange={e => setForm({ ...form, startNumber: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Số lượng" type="number" value={form.count} onChange={e => setForm({ ...form, count: +e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Tầng" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: +e.target.value })} />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending || !form.roomTypeId}>
            {mutation.isPending ? 'Đang tạo...' : `Tạo ${form.count} phòng`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}