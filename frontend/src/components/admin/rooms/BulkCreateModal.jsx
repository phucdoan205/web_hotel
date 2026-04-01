// BulkCreateModal.jsx
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Alert } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';

export default function BulkCreateModal({ open, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    roomTypeId: 1,
    startNumber: '101',
    count: 5,
    floor: 1,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => {
      // Chuyển sang format mà backend BulkCreate đang mong đợi
      const rooms = [];
      let currentNumber = parseInt(data.startNumber);

      for (let i = 0; i < data.count; i++) {
        rooms.push({
          roomNumber: currentNumber.toString().padStart(3, '0'), // 101, 102...
          roomTypeId: data.roomTypeId,
          floor: data.floor,
          status: 'Available',
          cleaningStatus: 'Dirty'
        });
        currentNumber++;
      }

      return roomApi.bulkCreateRooms({ rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      alert('Tạo hàng loạt phòng thành công!');
      setErrorMsg('');
      onClose();
      // Reset form
      setForm({ roomTypeId: 1, startNumber: '101', count: 5, floor: 1 });
    },
    onError: (error) => {
      const msg = error.response?.data?.message 
               || error.response?.data 
               || error.message 
               || 'Không thể tạo phòng hàng loạt';
      setErrorMsg(msg);
      console.error('Bulk create error:', error.response?.data);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    mutation.mutate(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo Nhiều Phòng (Bulk Create)</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <TextField
            fullWidth
            label="Loại phòng ID"
            type="number"
            value={form.roomTypeId}
            onChange={e => setForm({ ...form, roomTypeId: +e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Số phòng bắt đầu (ví dụ: 101)"
            value={form.startNumber}
            onChange={e => setForm({ ...form, startNumber: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Số lượng phòng"
            type="number"
            value={form.count}
            onChange={e => setForm({ ...form, count: +e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Tầng"
            type="number"
            value={form.floor}
            onChange={e => setForm({ ...form, floor: +e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Đang tạo...' : `Tạo ${form.count} phòng`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}