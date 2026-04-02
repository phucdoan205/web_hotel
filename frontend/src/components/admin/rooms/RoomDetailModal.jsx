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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Bed, Inventory as InventoryIcon, Star, Edit, Save, Cancel, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';

export default function RoomDetailModal({ open, onClose, room: initialRoom }) {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  // State cho thêm/sửa vật tư
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [editingInventoryIdx, setEditingInventoryIdx] = useState(null);
  const [inventoryForm, setInventoryForm] = useState({ itemName: '', quantity: 1, priceIfLost: 0 });

  // Fetch loại phòng chi tiết từ API
  const { data: roomTypeData, isLoading: isRoomTypeLoading } = useQuery({
    queryKey: ['roomType', initialRoom?.roomTypeId],
    queryFn: () => roomApi.getRoomTypeById(initialRoom?.roomTypeId),
    enabled: !!initialRoom?.roomTypeId,
    select: (response) => response.data,
  });

  const { data: roomTypesData } = useQuery({
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

  const { data: roomInventoryData = [] } = useQuery({
    queryKey: ['roomInventory', initialRoom?.id],
    queryFn: () => roomApi.getInventoryByRoom(initialRoom.id).then((res) => res.data),
    enabled: !!initialRoom?.id && open,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const createInventoryMutation = useMutation({
    mutationFn: (data) => roomApi.createInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomInventory', initialRoom?.id]);
      setShowAddInventory(false);
      setEditingInventoryIdx(null);
      setInventoryForm({ itemName: '', quantity: 1, priceIfLost: 0 });
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.response?.data || 'Lưu vật tư thất bại');
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({ id, data }) => roomApi.updateInventory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomInventory', initialRoom?.id]);
      setShowAddInventory(false);
      setEditingInventoryIdx(null);
      setInventoryForm({ itemName: '', quantity: 1, priceIfLost: 0 });
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.response?.data || 'Cập nhật vật tư thất bại');
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: (id) => roomApi.deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomInventory', initialRoom?.id]);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.response?.data || 'Xóa vật tư thất bại');
    },
  });

  const inventoryItems = (roomInventoryData && roomInventoryData.length > 0)
    ? roomInventoryData
    : initialRoom?.inventory || [];

  // Reset form khi room thay đổi
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
    setShowAddInventory(false);
    setEditingInventoryIdx(null);
  }, [initialRoom]);

  // Cập nhật phòng - khớp với PUT /api/rooms/{id}
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roomApi.updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['room', initialRoom?.id]);
      queryClient.invalidateQueries(['rooms']);
      setIsEditing(false);
      alert('Cập nhật thông tin phòng thành công!');
      onClose();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.response?.data || 'Cập nhật thất bại');
    },
  });

  const handleSave = () => {
    if (!initialRoom?.id) return;
    updateMutation.mutate({
      id: initialRoom.id,
      data: {
        roomNumber: formData.roomNumber,
        floor: parseInt(formData.floor, 10),
        status: formData.status,
        roomTypeId: parseInt(formData.roomTypeId, 10),
      },
    });
  };

  // Handlers cho vật tư
  const handleAddInventory = () => {
    if (!inventoryForm.itemName.trim()) {
      alert('Vui lòng nhập tên vật tư');
      return;
    }

    const payload = {
      itemName: inventoryForm.itemName.trim(),
      quantity: parseInt(inventoryForm.quantity, 10),
      priceIfLost: parseFloat(inventoryForm.priceIfLost),
    };

    if (editingInventoryIdx !== null) {
      const itemId = inventoryItems[editingInventoryIdx]?.id;
      if (itemId) {
        updateInventoryMutation.mutate({ id: itemId, data: payload });
      } else {
        createInventoryMutation.mutate({ roomId: initialRoom.id, ...payload });
      }
      setEditingInventoryIdx(null);
    } else {
      createInventoryMutation.mutate({ roomId: initialRoom.id, ...payload });
    }
  };

  const handleEditInventory = (idx) => {
    const item = inventoryItems[idx];
    if (!item) return;

    setEditingInventoryIdx(idx);
    setInventoryForm({
      itemName: item.itemName,
      quantity: item.quantity,
      priceIfLost: item.priceIfLost,
    });
    setShowAddInventory(true);
  };

  const handleDeleteInventory = (idx) => {
    const itemId = inventoryItems[idx]?.id;
    if (!itemId) {
      setErrorMsg('Không tìm thấy vật tư để xóa');
      return;
    }

    deleteInventoryMutation.mutate(itemId);
  };

  if (!initialRoom) return null;

  // === DỮ LIỆU TỪ initialRoom VÀ roomTypeData ===
  const roomType = roomTypeData || {};
  const selectedRoomType = roomTypesData?.find((rt) => String(rt.id) === String(formData.roomTypeId)) || roomType;
  const displayRoomType = isEditing ? selectedRoomType : roomType;
  const titleRoomType = isEditing ? selectedRoomType : roomType;

  const amenities = displayRoomType.roomTypeAmenities?.length > 0
    ? displayRoomType.roomTypeAmenities.map((rta) => rta.amenity?.name || rta.name).filter(Boolean)
    : initialRoom.amenities || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bed color="primary" />
          <div>
            <Typography variant="h6" component="div">
              Phòng #{initialRoom.roomNumber} — {titleRoomType.name || initialRoom.roomTypeName || 'Không xác định'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {initialRoom.id} • Tầng {initialRoom.floor}
            </Typography>
          </div>
        </div>
      </DialogTitle>

      <DialogContent dividers>
        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
        {isRoomTypeLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
          </div>
        )}
        {!isRoomTypeLoading && (
          <Grid container spacing={4}>
            {/* Thông tin phòng - có nút Chỉnh sửa */}
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
                      <InputLabel>Loại phòng</InputLabel>
                      <Select
                        value={formData.roomTypeId}
                        label="Loại phòng"
                        onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                        disabled={!isEditing}
                      >
                        {roomTypesData.map((rt) => (
                          <MenuItem key={rt.id} value={rt.id}>
                            {rt.name}
                          </MenuItem>
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
                  {displayRoomType.name || '—'}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {displayRoomType.basePrice ? displayRoomType.basePrice.toLocaleString('vi-VN') + ' ₫' : '0 ₫'} / đêm
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography>
                  <strong>Sức chứa:</strong> {displayRoomType.capacityAdults || 0} người lớn • {displayRoomType.capacityChildren || 0} trẻ em
                </Typography>
                {displayRoomType.size && (
                  <Typography><strong>Diện tích:</strong> {displayRoomType.size} m²</Typography>
                )}
                {displayRoomType.bedType && (
                  <Typography><strong>Loại giường:</strong> {displayRoomType.bedType}</Typography>
                )}
                {displayRoomType.description && (
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>Chi tiết:</strong> {displayRoomType.description}
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Tiện ích */}
            <Grid item xs={12}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, m: 0 }}>
                  <Star color="warning" /> Tiện ích
                </Typography>
              </div>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
                {amenities.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {amenities.map((name, i) => (
                      <Chip key={i} label={name} color="primary" variant="outlined" />
                    ))}
                  </div>
                ) : (
                  <Typography color="text.secondary">Chưa có tiện ích nào.</Typography>
                )}
                {isEditing && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Tiện ích được quản lý theo loại phòng, không thể chỉnh sửa tại đây.
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Vật tư trong phòng */}
            <Grid item xs={12}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, m: 0 }}>
                  <InventoryIcon /> Vật tư trong phòng
                </Typography>
                {isEditing && !showAddInventory && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setShowAddInventory(true);
                      setEditingInventoryIdx(null);
                      setInventoryForm({ itemName: '', quantity: 1, priceIfLost: 0 });
                    }}
                  >
                    Thêm vật tư
                  </Button>
                )}
              </div>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
                {isEditing && showAddInventory && (
                  <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Tên vật tư"
                          value={inventoryForm.itemName}
                          onChange={(e) => setInventoryForm({ ...inventoryForm, itemName: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Số lượng"
                          type="number"
                          value={inventoryForm.quantity}
                          onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Giá bồi thường"
                          type="number"
                          value={inventoryForm.priceIfLost}
                          onChange={(e) => setInventoryForm({ ...inventoryForm, priceIfLost: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="contained" onClick={handleAddInventory}>
                            {editingInventoryIdx !== null ? 'Cập nhật' : 'Thêm'}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setShowAddInventory(false);
                              setEditingInventoryIdx(null);
                              setInventoryForm({ itemName: '', quantity: 1, priceIfLost: 0 });
                            }}
                          >
                            Hủy
                          </Button>
                        </div>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {isEditing && inventoryItems.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell><strong>Tên vật tư</strong></TableCell>
                          <TableCell align="center"><strong>Số lượng</strong></TableCell>
                          <TableCell align="right"><strong>Giá bồi thường</strong></TableCell>
                          <TableCell align="center"><strong>Hành động</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {inventoryItems.map((item, i) => (
                          <TableRow key={item.id ?? i}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">{item.priceIfLost?.toLocaleString('vi-VN')} ₫</TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditInventory(i)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteInventory(i)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : isEditing ? (
                  <Typography color="text.secondary">Chưa có vật tư nào</Typography>
                ) : inventoryItems.length > 0 ? (
                  <Grid container spacing={2}>
                    {inventoryItems.map((item, i) => (
                      <Grid item xs={12} sm={6} key={item.id ?? i}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography fontWeight="bold">{item.itemName}</Typography>
                          <Typography variant="body2">
                            Số lượng: <strong>{item.quantity}</strong>
                          </Typography>
                          <Typography variant="body2">
                            Giá bồi thường: <strong>{item.priceIfLost?.toLocaleString('vi-VN') || 0} ₫</strong>
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary">Chưa có vật tư nào được ghi nhận.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
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
              {updateMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Lưu thay đổi'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="outlined" size="large">
            ĐÓNG
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}