import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/admin/roomApi';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, TextField, Box, Typography } from '@mui/material';
import { useState } from 'react';

const columns = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Tên loại phòng', flex: 1 },
  { field: 'basePrice', headerName: 'Giá cơ bản', width: 150 },
  { field: 'capacityAdults', headerName: 'Người lớn', width: 100 },
  { field: 'capacityChildren', headerName: 'Trẻ em', width: 100 },
  { field: 'roomCount', headerName: 'Số phòng', width: 100 },
];

export default function RoomTypesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});

  const { data } = useQuery({ queryKey: ['roomTypes'], queryFn: () => roomApi.getRoomTypes().then(r => r.data) });

  const createMutation = useMutation({
    mutationFn: roomApi.createRoomType,
    onSuccess: () => {
      queryClient.invalidateQueries(['roomTypes']);
      setOpen(false);
    },
  });

  const handleCreate = () => {
    createMutation.mutate(form);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Quản lý Loại Phòng</Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>Thêm loại phòng</Button>

      <DataGrid rows={data?.items || []} columns={columns} pageSizeOptions={[10, 20]} />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <Box p={3} width={400}>
          <TextField fullWidth label="Tên loại phòng" onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField fullWidth label="Giá cơ bản" type="number" onChange={e => setForm({ ...form, basePrice: +e.target.value })} sx={{ mt: 2 }} />
          {/* thêm các field khác tương tự */}
          <Button fullWidth variant="contained" onClick={handleCreate} sx={{ mt: 3 }}>Tạo</Button>
        </Box>
      </Dialog>
    </Box>
  );
}