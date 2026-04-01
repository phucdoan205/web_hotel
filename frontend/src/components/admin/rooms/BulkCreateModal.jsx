// BulkCreateModal.jsx (phiên bản đầy đủ hơn)
import { useState } from 'react';
import { Dialog, Box, TextField, Button, Typography } from '@mui/material';
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

  const mutation = useMutation({
    mutationFn: roomApi.bulkCreateRooms,
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      alert('Tạo nhiều phòng thành công!');
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box p={4}>
        <Typography variant="h6" gutterBottom>Tạo Nhiều Phòng (Bulk Create)</Typography>

        <TextField fullWidth label="Loại phòng ID" type="number" value={form.roomTypeId} onChange={e => setForm({ ...form, roomTypeId: +e.target.value })} sx={{ mb: 2 }} />
        <TextField fullWidth label="Số phòng bắt đầu (ví dụ: 101)" value={form.startNumber} onChange={e => setForm({ ...form, startNumber: e.target.value })} sx={{ mb: 2 }} />
        <TextField fullWidth label="Số lượng phòng" type="number" value={form.count} onChange={e => setForm({ ...form, count: +e.target.value })} sx={{ mb: 2 }} />
        <TextField fullWidth label="Tầng" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: +e.target.value })} />

        <Button 
          fullWidth 
          variant="contained" 
          size="large" 
          sx={{ mt: 3 }}
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Đang tạo...' : 'Tạo hàng loạt phòng'}
        </Button>
      </Box>
    </Dialog>
  );
}