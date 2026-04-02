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

  // State cho thêm amenity
  const [newAmenity, setNewAmenity] = useState('');

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

  // Reset form khi room thay đổi
  useEffect(() => {
    if (initialRoom) {
      setFormData({
        roomNumber: initialRoom.roomNumber || '',
        floor: initialRoom.floor || '',
        status: initialRoom.status || 'Available',
        roomTypeId: initialRoom.roomTypeId || '',
        amenities: initialRoom.amenities ? [...initialRoom.amenities] : [],
        inventory: initialRoom.inventory ? [...initialRoom.inventory] : [],
      });
    }
    setIsEditing(false);
    setErrorMsg('');
    setShowAddInventory(false);
    setEditingInventoryIdx(null);
    setNewAmenity('');
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
        amenities: formData.amenities,
        inventory: formData.inventory,
      },
    });
  };

  // Handlers cho vật tư
  const handleAddInventory = () => {
    if (!inventoryForm.itemName.trim()) {
      alert('Vui lòng nhập tên vật tư');
      return;
    }
    if (editingInventoryIdx !== null) {
      // Sửa vật tư
      const updated = [...formData.inventory];
      updated[editingInventoryIdx] = {
        ...updated[editingInventoryIdx],
        ...inventoryForm,
      };
      setFormData({ ...formData, inventory: updated });
      setEditingInventoryIdx(null);
    } else {
      // Thêm vật tư mới
      setFormData({
        ...formData,
        inventory: [
          ...formData.inventory,
          {
            id: null,
            itemName: inventoryForm.itemName,
            quantity: parseInt(inventoryForm.quantity, 10),
            priceIfLost: parseFloat(inventoryForm.priceIfLost),
          },
        ],
      });
    }
    setShowAddInventory(false);
    setInventoryForm({ itemName: '', quantity: 1, priceIfLost: 0 });
  };

  const handleEditInventory = (idx) => {
    setEditingInventoryIdx(idx);
    setInventoryForm({
      itemName: formData.inventory[idx].itemName,
      quantity: formData.inventory[idx].quantity,
      priceIfLost: formData.inventory[idx].priceIfLost,
    });
    setShowAddInventory(true);
  };

  const handleDeleteInventory = (idx) => {
    setFormData({
      ...formData,
      inventory: formData.inventory.filter((_, i) => i !== idx),
    });
  };

  const handleAddAmenity = () => {
    if (!newAmenity.trim()) return;
    if (!formData.amenities.includes(newAmenity)) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity],
      });
    }
    setNewAmenity('');
  };

  const handleDeleteAmenity = (idx) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== idx),
    });
  };

  if (!initialRoom) return null;

  // === DỮ LIỆU TỪ initialRoom VÀ roomTypeData ===
  const roomType = roomTypeData || {};

  // Ưu tiên amenities từ initialRoom, nếu không thì lấy từ roomType
  let amenities = [];
  if (initialRoom.amenities && initialRoom.amenities.length > 0) {
    // Nếu là array string (trực tiếp)
    amenities = initialRoom.amenities;
  } else if (roomType.roomTypeAmenities && roomType.roomTypeAmenities.length > 0) {
    // Nếu là array object từ roomTypeAmenities
    amenities = roomType.roomTypeAmenities.map((rta) => rta.amenity?.name || rta.name).filter(Boolean);
  }

  // Ưu tiên inventory từ initialRoom, nếu không thì lấy từ roomTypeData
  const inventories = initialRoom.inventory && initialRoom.inventory.length > 0
    ? initialRoom.inventory
    : initialRoom.roomInventory || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bed color="primary" />
          <div>
            <Typography variant="h6" component="div">
              Phòng #{initialRoom.roomNumber} — {roomType.name || 'Không xác định'}
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
                  {roomType.name || '—'}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {roomType.basePrice ? roomType.basePrice.toLocaleString('vi-VN') + ' ₫' : '0 ₫'} / đêm
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography>
                  <strong>Sức chứa:</strong> {roomType.capacityAdults || 0} người lớn • {roomType.capacityChildren || 0} trẻ em
                </Typography>
                {roomType.size && (
                  <Typography><strong>Diện tích:</strong> {roomType.size} m²</Typography>
                )}
                {roomType.bedType && (
                  <Typography><strong>Loại giường:</strong> {roomType.bedType}</Typography>
                )}
                {roomType.description && (
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                    <strong>Chi tiết:</strong> {roomType.description}
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
                {isEditing ? (
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {formData.amenities?.length > 0 ? (
                        formData.amenities.map((name, i) => (
                          <Chip
                            key={i}
                            label={name}
                            color="primary"
                            variant="filled"
                            onDelete={() => handleDeleteAmenity(i)}
                          />
                        ))
                      ) : (
                        <Typography color="text.secondary">Chưa có tiện ích nào</Typography>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <TextField
                        size="small"
                        placeholder="Thêm tiện ích mới"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddAmenity();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddAmenity}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                ) : amenities.length > 0 ? (
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

                {isEditing && formData.inventory && formData.inventory.length > 0 ? (
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
                        {formData.inventory.map((item, i) => (
                          <TableRow key={i}>
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
                ) : inventories.length > 0 ? (
                  <Grid container spacing={2}>
                    {inventories.map((item, i) => (
                      <Grid item xs={12} sm={6} key={i}>
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