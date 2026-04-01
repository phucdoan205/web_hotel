// src/pages/admin/RoomDetailPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/admin/roomApi';
import { 
  Box, Typography, Paper, Grid, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from '@mui/material';
import { Edit, Delete, ContentCopy } from '@mui/icons-material';
import { useState } from 'react';

export default function AdminRoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openInventory, setOpenInventory] = useState(false);
  const [openClone, setOpenClone] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [cloneForm, setCloneForm] = useState({ targetRoomId: '', newItemName: '' });

  // Lấy thông tin phòng
  const { data: room } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomApi.getRoomById(id).then(res => res.data),
  });

  // Lấy vật tư của phòng
  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory', id],
    queryFn: () => roomApi.getInventoryByRoom(id).then(res => res.data),
    enabled: !!id,
  });

  const createInventoryMutation = useMutation({
    mutationFn: roomApi.createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory', id]);
      setOpenInventory(false);
    },
  });

  const cloneMutation = useMutation({
    mutationFn: roomApi.cloneInventory,
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory', id]);
      setOpenClone(false);
      alert('Clone vật tư thành công!');
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: roomApi.deleteInventory,
    onSuccess: () => queryClient.invalidateQueries(['inventory', id]),
  });

  const handleClone = (item) => {
    setSelectedInventory(item);
    setCloneForm({ targetRoomId: '', newItemName: item.itemName });
    setOpenClone(true);
  };

  const handleCloneSubmit = () => {
    cloneMutation.mutate({
      sourceInventoryId: selectedInventory.id,
      targetRoomId: Number(cloneForm.targetRoomId),
      newItemName: cloneForm.newItemName.trim() || undefined,
    });
  };

  if (!room) return <Typography>Loading...</Typography>;

  return (
    <Box p={3}>
      <Button onClick={() => navigate('/admin/rooms')} sx={{ mb: 2 }}>← Quay lại danh sách phòng</Button>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Phòng {room.roomNumber}</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography><strong>Loại phòng:</strong> {room.roomTypeName}</Typography>
            <Typography><strong>Giá cơ bản:</strong> {room.basePrice?.toLocaleString('vi-VN')} VND</Typography>
            <Typography><strong>Tầng:</strong> {room.floor}</Typography>
            <Typography><strong>Trạng thái:</strong> {room.status}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography><strong>Trạng thái dọn:</strong> {room.cleaningStatus}</Typography>
            <Typography><strong>Sức chứa:</strong> {room.capacityAdults} người lớn, {room.capacityChildren} trẻ em</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Phần quản lý vật tư */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Danh sách vật tư phòng</Typography>
        <Button variant="contained" onClick={() => setOpenInventory(true)}>+ Thêm vật tư</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên vật tư</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="right">Giá nếu mất</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.itemName}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">{item.priceIfLost?.toLocaleString('vi-VN')} VND</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleClone(item)}><ContentCopy /></IconButton>
                  <IconButton color="error" onClick={() => deleteInventoryMutation.mutate(item.id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {inventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">Chưa có vật tư nào</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog thêm vật tư */}
      <Dialog open={openInventory} onClose={() => setOpenInventory(false)}>
        <DialogTitle>Thêm vật tư cho phòng {room.roomNumber}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Tên vật tư" onChange={e => setFormData({...formData, itemName: e.target.value})} sx={{ mt: 2 }} />
          <TextField fullWidth label="Số lượng" type="number" onChange={e => setFormData({...formData, quantity: +e.target.value})} sx={{ mt: 2 }} />
          <TextField fullWidth label="Giá nếu mất (VND)" type="number" onChange={e => setFormData({...formData, priceIfLost: +e.target.value})} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInventory(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => createInventoryMutation.mutate({ roomId: Number(id), ...formData })}>Thêm</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Clone vật tư */}
      <Dialog open={openClone} onClose={() => setOpenClone(false)}>
        <DialogTitle>Clone vật tư sang phòng khác</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="ID phòng đích" type="number" value={cloneForm.targetRoomId} onChange={e => setCloneForm({...cloneForm, targetRoomId: e.target.value})} sx={{ mt: 2 }} />
          <TextField fullWidth label="Tên vật tư mới (để trống = giữ nguyên)" value={cloneForm.newItemName} onChange={e => setCloneForm({...cloneForm, newItemName: e.target.value})} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClone(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCloneSubmit}>Clone</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}