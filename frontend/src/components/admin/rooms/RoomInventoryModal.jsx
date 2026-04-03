// src/components/admin/rooms/RoomInventoryModal.jsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  Box,
  Autocomplete,
  Alert,
} from '@mui/material';
import { Inventory as InventoryIcon, Delete as DeleteIcon, DeleteSweep as DeleteSweepIcon, Add as AddIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';

export default function RoomInventoryModal({ 
  open, 
  onClose, 
  roomId, 
  roomNumber 
}) {
  const queryClient = useQueryClient();

  const [selectedToDelete, setSelectedToDelete] = useState([]);
  const [inventoryInputValue, setInventoryInputValue] = useState('');
  const [inventoryForm, setInventoryForm] = useState({
    equipmentId: null,
    itemName: '',
    quantity: 1,
    priceIfLost: 0,
  });

  // Lấy danh sách vật tư của phòng
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['roomInventory', roomId],
    queryFn: () => roomApi.getInventoryByRoom(roomId).then((res) => res.data),
    enabled: open,
  });

  // Gợi ý thiết bị từ Equipment
  const { data: equipmentSuggestions = [] } = useQuery({
    queryKey: ['equipmentSuggestions'],
    queryFn: () => roomApi.getEquipments({ isActive: true }).then((res) => res.data?.items || []),
    enabled: open,
  });

  const createInventoryMutation = useMutation({
    mutationFn: (data) => roomApi.createInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomInventory', roomId]);
      setInventoryInputValue('');
      setInventoryForm({ equipmentId: null, itemName: '', quantity: 1, priceIfLost: 0 });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Thêm vật tư thất bại');
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: (id) => roomApi.deleteInventory(id),
    onSuccess: () => queryClient.invalidateQueries(['roomInventory', roomId]),
    onError: (err) => {
      alert(err.response?.data?.message || 'Xóa vật tư thất bại');
    },
  });

  const handleAddInventory = () => {
    if (!inventoryForm.itemName.trim()) {
      alert('Vui lòng nhập tên vật tư');
      return;
    }

    const payload = {
      roomId,
      equipmentId: inventoryForm.equipmentId || null,
      itemName: inventoryForm.itemName.trim(),
      quantity: parseInt(inventoryForm.quantity, 10) || 1,
      priceIfLost: parseFloat(inventoryForm.priceIfLost) || 0,
      isActive: true,
    };

    createInventoryMutation.mutate(payload);
  };

  const handleAddAllEquipment = async () => {
    const existingNames = new Set(inventoryItems.map(item => 
      (item.equipmentName || item.itemName).toLowerCase()
    ));

    const toAdd = equipmentSuggestions.filter(eq => 
      !existingNames.has(eq.name.toLowerCase())
    );

    if (toAdd.length === 0) {
      alert('Tất cả thiết bị đã được thêm vào phòng này.');
      return;
    }

    if (!window.confirm(`Thêm ${toAdd.length} thiết bị vào phòng?`)) return;

    try {
      for (const eq of toAdd) {
        await roomApi.createInventory({
          roomId,
          equipmentId: eq.id,
          itemName: eq.name,
          quantity: 1,
          priceIfLost: 0,
          isActive: true,
        });
      }
      queryClient.invalidateQueries(['roomInventory', roomId]);
      alert(`Đã thêm ${toAdd.length} thiết bị thành công!`);
    } catch (err) {
      alert('Có lỗi khi thêm một số thiết bị');
    }
  };

  const toggleSelection = (id) => {
    setSelectedToDelete(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    setSelectedToDelete(e.target.checked 
      ? inventoryItems.map(item => item.id).filter(Boolean) 
      : []
    );
  };

  const handleBulkDelete = async () => {
    if (selectedToDelete.length === 0) return;
    if (!window.confirm(`Xóa ${selectedToDelete.length} vật tư đã chọn?`)) return;

    try {
      await Promise.all(selectedToDelete.map(id => roomApi.deleteInventory(id)));
      queryClient.invalidateQueries(['roomInventory', roomId]);
      setSelectedToDelete([]);
      alert('Đã xóa thành công');
    } catch (err) {
      alert('Xóa một số vật tư thất bại');
    }
  };

  const handleDeleteAll = async () => {
    if (inventoryItems.length === 0) return;
    if (!window.confirm(`XÓA HẾT ${inventoryItems.length} vật tư trong phòng này?`)) return;

    try {
      const ids = inventoryItems.map(item => item.id).filter(Boolean);
      await Promise.all(ids.map(id => roomApi.deleteInventory(id)));
      queryClient.invalidateQueries(['roomInventory', roomId]);
      setSelectedToDelete([]);
      alert('Đã xóa tất cả vật tư');
    } catch (err) {
      alert('Xóa tất cả thất bại');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InventoryIcon color="primary" />
          Vật tư phòng #{roomNumber} ({inventoryItems.length})
        </div>
      </DialogTitle>

      <DialogContent>
        {/* Phần thêm nhanh từ Equipment */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Thêm từ thiết bị có sẵn</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Autocomplete
                freeSolo
                options={equipmentSuggestions}
                getOptionLabel={(opt) => opt.name || ''}
                inputValue={inventoryInputValue}
                onInputChange={(_, val) => setInventoryInputValue(val)}
                onChange={(_, newValue) => {
                  if (newValue) {
                    setInventoryForm({
                      equipmentId: newValue.id,
                      itemName: newValue.name,
                      quantity: 1,
                      priceIfLost: 0,
                    });
                  }
                }}
                renderInput={(params) => <TextField {...params} label="Chọn thiết bị" size="small" />}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField 
                fullWidth 
                label="SL" 
                type="number" 
                size="small" 
                value={inventoryForm.quantity} 
                onChange={e => setInventoryForm({ ...inventoryForm, quantity: +e.target.value })} 
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={handleAddInventory} 
                disabled={!inventoryForm.itemName.trim()}
              >
                Thêm
              </Button>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={handleAddAllEquipment}
              >
                Thêm tất cả
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Danh sách vật tư */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Danh sách vật tư hiện có</Typography>
          {inventoryItems.length > 0 && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteSweepIcon />} 
              onClick={handleDeleteAll}
            >
              Xóa tất cả
            </Button>
          )}
        </Box>

        {inventoryItems.length > 0 ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedToDelete.length > 0 && selectedToDelete.length < inventoryItems.length}
                      checked={selectedToDelete.length === inventoryItems.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell><strong>Tên vật tư / Thiết bị</strong></TableCell>
                  <TableCell align="center"><strong>Số lượng</strong></TableCell>
                  <TableCell align="right"><strong>Giá bồi thường</strong></TableCell>
                  <TableCell align="center"><strong>Hành động</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell padding="checkbox">
                      <Checkbox 
                        checked={selectedToDelete.includes(item.id)} 
                        onChange={() => toggleSelection(item.id)} 
                      />
                    </TableCell>
                    <TableCell>{item.equipmentName || item.itemName}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{item.priceIfLost?.toLocaleString('vi-VN')} ₫</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="error" 
                        onClick={() => deleteInventoryMutation.mutate(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" align="center" sx={{ py: 6 }}>
            Phòng này chưa có vật tư nào.
          </Typography>
        )}

        {selectedToDelete.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />} 
              onClick={handleBulkDelete}
            >
              Xóa đã chọn ({selectedToDelete.length})
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}