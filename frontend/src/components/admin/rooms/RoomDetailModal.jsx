// src/components/admin/rooms/RoomDetailModal.jsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Bed, Star, Edit, Save, Cancel } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';

export default function RoomDetailModal({ 
  open, 
  onClose, 
  room: initialRoom 
}) {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch loại phòng
  const { data: roomTypeData, isLoading: isRoomTypeLoading } = useQuery({
    queryKey: ['roomType', initialRoom?.roomTypeId],
    queryFn: () => roomApi.getRoomTypeById(initialRoom?.roomTypeId),
    enabled: !!initialRoom?.roomTypeId,
    select: (res) => res.data,
  });

  const { data: roomTypesData = [] } = useQuery({
    queryKey: ['roomTypes'],
    queryFn: async () => {
      const res = await roomApi.getRoomTypes();
      return res.data.items || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  useEffect(() => {
    if (initialRoom) {
      setFormData({
        roomNumber: initialRoom.roomNumber || '',
        floor: initialRoom.floor || '',
        status: initialRoom.status || 'Available',
        roomTypeId: initialRoom.roomTypeId || '',
      });
    }
    setIsEditing(false);
    setErrorMsg('');
  }, [initialRoom]);

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }) => roomApi.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
      queryClient.invalidateQueries(['room', initialRoom?.id]);
      setIsEditing(false);
      alert('Cập nhật phòng thành công!');
      onClose();
    },
    onError: (err) => setErrorMsg(err.response?.data?.message || 'Cập nhật thất bại'),
  });

  const handleSaveRoom = () => {
    if (!initialRoom?.id) return;
    updateRoomMutation.mutate({
      id: initialRoom.id,
      data: {
        roomNumber: formData.roomNumber,
        floor: parseInt(formData.floor, 10),
        status: formData.status,
        roomTypeId: parseInt(formData.roomTypeId, 10),
      },
    });
  };

  if (!initialRoom) return null;

  const roomType = roomTypeData || {};
  console.log(roomType.amenities)
  const amenities = roomType.amenities?.map((rta) => rta).filter(Boolean) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bed color="primary" />
          <div>
            <Typography variant="h6">
              Phòng #{initialRoom.roomNumber} — {roomType.name || initialRoom.roomTypeName || 'Không xác định'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {initialRoom.id} • Tầng {initialRoom.floor}
            </Typography>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers>
        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

        {isRoomTypeLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <CircularProgress />
          </div>
        ) : (
          <Grid container spacing={4}>
            {/* Thông tin phòng */}
            <Grid item xs={12} md={7}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Typography variant="h6">Thông tin phòng</Typography>
                  {!isEditing && (
                    <Button 
                      variant="outlined" 
                      startIcon={<Edit />} 
                      onClick={() => setIsEditing(true)} 
                      size="small"
                    >
                      CHỈNH SỬA
                    </Button>
                  )}
                </div>

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
                      <InputLabel>Loại phòng</InputLabel>
                      <Select 
                        value={formData.roomTypeId} 
                        onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })} 
                        disabled={!isEditing}
                      >
                        {roomTypesData.map((rt) => (
                          <MenuItem key={rt.id} value={rt.id}>{rt.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Loại phòng */}
            <Grid item xs={12} md={5}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Loại phòng</Typography>
                <Typography variant="h5" fontWeight="bold" color="#ff5e1f">
                  {roomType.name || '—'}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {roomType.basePrice ? roomType.basePrice.toLocaleString('vi-VN') + ' ₫' : '0 ₫'} / đêm
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography>
                  <strong>Sức chứa:</strong> {roomType.capacityAdults || 0} người lớn • {roomType.capacityChildren || 0} trẻ em
                </Typography>
                {roomType.size && <Typography><strong>Diện tích:</strong> {roomType.size} m²</Typography>}
                {roomType.bedType && <Typography><strong>Loại giường:</strong> {roomType.bedType}</Typography>}
              </Paper>
            </Grid>

            {/* Tiện ích */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Star color="warning" /> Tiện ích
              </Typography>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3, minHeight: 120 }}>
                {amenities.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {amenities.map((name, i) => (
                      <Chip key={i} label={name} color="primary" variant="outlined" />
                    ))}
                  </div>
                ) : (
                  <Typography color="text.secondary">Chưa có tiện ích nào.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        {isEditing ? (
          <>
            <Button onClick={() => setIsEditing(false)} startIcon={<Cancel />}>Hủy</Button>
            <Button 
              onClick={handleSaveRoom} 
              variant="contained" 
              startIcon={<Save />} 
              disabled={updateRoomMutation.isPending}
            >
              {updateRoomMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Lưu thay đổi'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="outlined" size="large">ĐÓNG</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}