// src/components/admin/rooms/RoomDetailModal.jsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Divider,
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { Bed, Inventory, Star, Edit, Save, Cancel } from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';

export default function RoomDetailModal({ open, onClose, room }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  // Reset form khi mở modal
  const handleOpen = () => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        floor: room.floor || '',
        status: room.status || 'Available',
        cleaningStatus: room.cleaningStatus || 'Dirty',
      });
    }
    setIsEditing(false);
    setErrorMsg('');
  };

  // Mutation cập nhật phòng
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roomApi.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      setIsEditing(false);
      alert('Cập nhật thông tin phòng thành công!');
      onClose();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    },
  });

  const handleSave = () => {
    if (!room) return;
    updateMutation.mutate({
      id: room.id,
      data: {
        roomNumber: formData.roomNumber,
        floor: parseInt(formData.floor),
        status: formData.status,
        cleaningStatus: formData.cleaningStatus,
      },
    });
  };

  if (!room) return null;

  const roomType = room.roomType || {};
  const amenities = roomType.amenities || room.amenities || [];
  const inventories = room.roomInventory || room.inventories || [];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      onEntered={handleOpen}
      maxWidth="lg" 
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Bed color="primary" />
            Phòng #{room.roomNumber} - {roomType.name || 'Không xác định'}
          </Box>
          
          {!isEditing && (
            <Button 
              variant="outlined" 
              startIcon={<Edit />} 
              onClick={() => setIsEditing(true)}
            >
              Chỉnh sửa
            </Button>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

        <Grid container spacing={4}>
          {/* Phần chỉnh sửa thông tin */}
          <Grid item xs={12} md={7}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                {isEditing ? 'Chỉnh sửa thông tin phòng' : 'Thông tin phòng'}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số phòng"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tầng"
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái phòng</InputLabel>
                    <Select
                      value={formData.status}
                      label="Trạng thái phòng"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      disabled={!isEditing}
                    >
                      <MenuItem value="Available">Available</MenuItem>
                      <MenuItem value="Occupied">Occupied</MenuItem>
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                      <MenuItem value="Cleaning">Cleaning</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái dọn phòng</InputLabel>
                    <Select
                      value={formData.cleaningStatus}
                      label="Trạng thái dọn phòng"
                      onChange={(e) => setFormData({ ...formData, cleaningStatus: e.target.value })}
                      disabled={!isEditing}
                    >
                      <MenuItem value="Dirty">Dirty</MenuItem>
                      <MenuItem value="InProgress">In Progress</MenuItem>
                      <MenuItem value="Clean">Clean</MenuItem>
                      <MenuItem value="Inspected">Inspected</MenuItem>
                      <MenuItem value="Pickup">Pickup</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Thông tin loại phòng */}
          <Grid item xs={12} md={5}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Loại phòng</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {roomType.name}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {roomType.basePrice?.toLocaleString()} ₫ / đêm
              </Typography>
            </Paper>
          </Grid>

          {/* Tiện ích */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star color="warning" /> Tiện ích
            </Typography>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
              {amenities.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {amenities.map((amenity, i) => (
                    <Chip key={i} label={amenity} color="primary" variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">Chưa có tiện ích</Typography>
              )}
            </Paper>
          </Grid>

          {/* Vật tư */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory /> Vật tư trong phòng
            </Typography>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
              {inventories.length > 0 ? (
                <Grid container spacing={2}>
                  {inventories.map((item, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                        <Typography fontWeight="bold">{item.itemName}</Typography>
                        <Typography variant="body2">
                          Số lượng: <strong>{item.quantity}</strong> • 
                          Giá bồi thường: <strong>{item.priceIfLost?.toLocaleString()} ₫</strong>
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">Chưa có vật tư được ghi nhận.</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        {isEditing ? (
          <>
            <Button onClick={() => setIsEditing(false)} startIcon={<Cancel />}>
              Hủy
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              startIcon={<Save />}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="outlined" size="large">
            Đóng
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}