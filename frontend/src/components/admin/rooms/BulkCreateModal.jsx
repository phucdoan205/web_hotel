// BulkCreateModal.jsx - ĐÃ SỬA LỖI roomTypes.map is not a function

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

  // Fetch Room Types
  const { data: roomTypesData, isLoading: loadingTypes } = useQuery({
    queryKey: ['roomTypes'],
    queryFn: async () => {
      const response = await roomApi.getRoomTypes();
      return response.data.items ?? [];
    },
    staleTime: 5 * 60 * 1000,     // Giữ dữ liệu 5 phút → ít gọi lại hơn
    gcTime: 10 * 60 * 1000,       // Giữ cache lâu hơn
    refetchOnWindowFocus: false,  // Tắt refetch khi focus lại tab
    refetchOnReconnect: false,
  });

  // Bảo vệ dữ liệu: luôn là mảng
  const roomTypes = Array.isArray(roomTypesData) ? roomTypesData : [];

  const mutation = useMutation({
    mutationFn: (data) => {
      if (!data.roomTypeId) throw new Error('Vui lòng chọn loại phòng');

      const rooms = [];
      let currentNumber = parseInt(data.startNumber, 10);

      for (let i = 0; i < data.count; i++) {
        rooms.push({
          roomNumber: currentNumber.toString().padStart(3, '0'),
          roomTypeId: Number(data.roomTypeId),
          floor: data.floor,
          status: 'Available',
          cleaningStatus: 'Dirty',
        });
        currentNumber++;
      }

      return roomApi.bulkCreateRooms({ rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      alert(`Đã tạo thành công ${form.count} phòng!`);
      setErrorMsg('');
      onClose();
      setForm({ roomTypeId: '', startNumber: '101', count: 5, floor: 1 });
    },
    onError: (error) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        'Không thể tạo phòng hàng loạt';
      setErrorMsg(msg);
      console.error('Bulk create error:', error);
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
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMsg}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="room-type-label">Loại phòng</InputLabel>
              <Select
                labelId="room-type-label"
                value={form.roomTypeId}
                label="Loại phòng"
                onChange={(e) => setForm({ ...form, roomTypeId: e.target.value })}
                disabled={loadingTypes}
              >
                {loadingTypes ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải loại phòng...
                  </MenuItem>
                ) : roomTypes.length === 0 ? (
                  <MenuItem disabled>Không có loại phòng nào</MenuItem>
                ) : (
                  roomTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            label="Số phòng bắt đầu (ví dụ: 101)"
            value={form.startNumber}
            onChange={(e) => setForm({ ...form, startNumber: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Số lượng phòng"
            type="number"
            value={form.count}
            onChange={(e) => setForm({ ...form, count: +e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Tầng"
            type="number"
            value={form.floor}
            onChange={(e) => setForm({ ...form, floor: +e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || !form.roomTypeId}
          >
            {mutation.isPending ? 'Đang tạo...' : `Tạo ${form.count} phòng`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}