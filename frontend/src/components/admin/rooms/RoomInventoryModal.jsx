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
} from '@mui/material';
import { Inventory as InventoryIcon, Delete as DeleteIcon, DeleteSweep as DeleteSweepIcon, Add as AddIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';
import { equipmentApi } from '../../../api/admin/equipmentApi';

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

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['roomInventory', roomId],
    queryFn: () => roomApi.getInventoryByRoom(roomId).then((res) => res.data),
    enabled: open,
  });

  const { data: equipmentSuggestions = [] } = useQuery({
    queryKey: ['equipmentSuggestions'],
    queryFn: () => equipmentApi.getEquipments({ isActive: true }).then((res) => res.data?.items || []),
    enabled: open,
  });

  const createInventoryMutation = useMutation({
    mutationFn: (data) => roomApi.createInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomInventory', roomId]);
      setInventoryInputValue('');
      setInventoryForm({ equipmentId: null, itemName: '', quantity: 1, priceIfLost: 0 });
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: (id) => roomApi.deleteInventory(id),
    onSuccess: () => queryClient.invalidateQueries(['roomInventory', roomId]),
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
    const existing = new Set(inventoryItems.map(item => (item.equipmentName || item.itemName).toLowerCase()));
    const toAdd = equipmentSuggestions.filter(eq => !existing.has(eq.name.toLowerCase()));

    if (toAdd.length === 0) {
      alert('Tất cả thiết bị đã được thêm vào phòng này.');
      return;
    }

    if (!window.confirm(`Thêm ${toAdd.length} thiết bị vào phòng?`)) return;

    for (const eq of toAdd) {
      await roomApi.createInventory({
        roomId,
        equipmentId: eq.id,
        itemName: eq.name,
        quantity: 1,
        priceIfLost: parseFloat(eq.defaultPriceIfLost || eq.priceIfLost || 0),
        isActive: true,
      });
    }
    queryClient.invalidateQueries(['roomInventory', roomId]);
  };

  // ... (các hàm toggle, delete giữ nguyên)

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

    await Promise.all(selectedToDelete.map(id => roomApi.deleteInventory(id)));
    queryClient.invalidateQueries(['roomInventory', roomId]);
    setSelectedToDelete([]);
  };

  const handleDeleteAll = async () => {
    if (inventoryItems.length === 0) return;
    if (!window.confirm(`XÓA HẾT ${inventoryItems.length} vật tư?`)) return;

    const ids = inventoryItems.map(item => item.id).filter(Boolean);
    await Promise.all(ids.map(id => roomApi.deleteInventory(id)));
    queryClient.invalidateQueries(['roomInventory', roomId]);
    setSelectedToDelete([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InventoryIcon color="primary" />
          Vật tư phòng #{roomNumber} ({inventoryItems.length})
        </div>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Thêm từ thiết bị có sẵn
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Autocomplete - Rộng tối đa */}
            <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
              <Autocomplete
                freeSolo
                fullWidth
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
                      priceIfLost: parseFloat(newValue.defaultPriceIfLost || newValue.priceIfLost || 0),
                    });
                  } else {
                    setInventoryForm({ 
                      equipmentId: null, 
                      itemName: '', 
                      quantity: 1, 
                      priceIfLost: 0 
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Chọn thiết bị" 
                    size="small" 
                    fullWidth 
                    sx={{ '& .MuiInputBase-root': { minHeight: '48px' } }}
                  />
                )}
              />
            </Box>

            {/* Số lượng */}
            <Box sx={{ width: 140 }}>
              <TextField 
                fullWidth 
                label="Số lượng" 
                type="number" 
                size="small" 
                value={inventoryForm.quantity} 
                onChange={e => setInventoryForm({ ...inventoryForm, quantity: +e.target.value })} 
                sx={{ '& .MuiInputBase-root': { minHeight: '48px' } }}
              />
            </Box>

            {/* Giá bồi thường - Cho phép chỉnh sửa */}
            <Box sx={{ width: 180 }}>
              <TextField 
                fullWidth 
                label="Giá bồi thường (nếu mất)" 
                type="number" 
                size="small" 
                value={inventoryForm.priceIfLost} 
                onChange={e => setInventoryForm({ ...inventoryForm, priceIfLost: +e.target.value })} 
                sx={{ '& .MuiInputBase-root': { minHeight: '48px' } }}
              />
            </Box>

            <Button 
              variant="contained" 
              onClick={handleAddInventory} 
              disabled={!inventoryForm.itemName.trim()}
              startIcon={<AddIcon />}
              sx={{ height: '48px', px: 3, whiteSpace: 'nowrap' }}
            >
              Thêm
            </Button>

            <Button 
              variant="outlined" 
              onClick={handleAddAllEquipment}
              sx={{ height: '48px', px: 3, whiteSpace: 'nowrap' }}
            >
              Thêm tất cả
            </Button>
          </Box>
        </Box>

        {/* Phần danh sách vật tư giữ nguyên */}
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
          <TableContainer component={Paper} sx={{ mb: 3 }}>
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