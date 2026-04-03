import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Autocomplete,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Box,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  DeleteSweep as DeleteSweepIcon,
  AddCircle as AddCircleIcon 
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';

export default function RoomTypeAmenities({ open, onClose, roomTypeId, roomTypeName }) {
  const queryClient = useQueryClient();

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedToDelete, setSelectedToDelete] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Tự động reset khi mở dialog
  useEffect(() => {
    if (open) {
      setErrorMsg('');
      setSelectedAmenities([]);
      setSelectedToDelete([]);
    }
  }, [open]);

  // Lấy danh sách tất cả amenities
  const { data: allAmenities = [] } = useQuery({
    queryKey: ['amenities'],
    queryFn: () => roomApi.getAmenities().then(res => res.data),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  // Lấy amenities hiện tại của RoomType
  const { data: currentAmenities = [], isLoading } = useQuery({
    queryKey: ['roomTypeAmenities', roomTypeId],
    queryFn: () => roomApi.getRoomTypeAmenities(roomTypeId).then(res => res.data),
    enabled: !!roomTypeId && open,
  });

  // Mutation thêm nhiều amenity
  const addMutation = useMutation({
    mutationFn: (amenityIds) =>
      Promise.all(amenityIds.map(id => roomApi.addAmenityToRoomType(roomTypeId, id))),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomTypeAmenities', roomTypeId]);
      setSelectedAmenities([]);
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.Message || err.response?.data?.message || 'Thêm tiện ích thất bại');
    },
  });

  // Mutation xóa nhiều amenity
  const removeMutation = useMutation({
    mutationFn: (amenityIds) =>
      Promise.all(amenityIds.map(id => roomApi.removeAmenityFromRoomType(roomTypeId, id))),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomTypeAmenities', roomTypeId]);
      setSelectedToDelete([]);
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.Message || err.response?.data?.message || 'Xóa tiện ích thất bại');
    },
  });

  const handleAddSelected = () => {
    if (selectedAmenities.length === 0) return;
    const amenityIds = selectedAmenities.map(a => a.id);
    addMutation.mutate(amenityIds);
  };

  const handleAddAll = () => {
    if (availableAmenities.length === 0) return;
    if (!confirm(`Bạn có chắc muốn THÊM HẾT tất cả ${availableAmenities.length} tiện ích còn lại?`)) return;

    const allIds = availableAmenities.map(a => a.id);
    addMutation.mutate(allIds);
  };

  const handleBulkDelete = () => {
    if (selectedToDelete.length === 0) return;
    if (!confirm(`Bạn có chắc muốn xóa ${selectedToDelete.length} tiện ích đã chọn?`)) return;
    removeMutation.mutate(selectedToDelete);
  };

  const handleDeleteAll = () => {
    if (currentAmenities.length === 0) return;
    if (!confirm(`Bạn có chắc muốn XÓA HẾT tất cả ${currentAmenities.length} tiện ích của loại phòng này?`)) return;
    
    const allIds = currentAmenities.map(item => item.id);
    removeMutation.mutate(allIds);
  };

  const toggleDeleteSelection = (amenityId) => {
    setSelectedToDelete(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // Amenity chưa được thêm vào RoomType
  const availableAmenities = allAmenities.filter(
    a => !currentAmenities.some(ca => ca.id === a.id)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        Quản lý Tiện ích - {roomTypeName}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {/* === THÊM TIỆN ÍCH === */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Thêm tiện ích
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Autocomplete
              multiple
              fullWidth
              options={availableAmenities}
              getOptionLabel={(option) => option.name}
              value={selectedAmenities}
              onChange={(_, newValue) => setSelectedAmenities(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn tiện ích"
                  placeholder="Chọn một hoặc nhiều tiện ích..."
                  size="medium"
                />
              )}
              disabled={addMutation.isPending}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: { xs: '100%', sm: 200 } }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddSelected}
                disabled={selectedAmenities.length === 0 || addMutation.isPending}
                sx={{ height: '56px', fontWeight: 'bold' }}
              >
                {addMutation.isPending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  `THÊM (${selectedAmenities.length})`
                )}
              </Button>

              {availableAmenities.length > 0 && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<AddCircleIcon />}
                  onClick={handleAddAll}
                  disabled={addMutation.isPending}
                  sx={{ height: '56px', fontWeight: 'bold' }}
                >
                  Thêm hết ({availableAmenities.length})
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* === DANH SÁCH TIỆN ÍCH HIỆN CÓ === */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Tiện ích hiện có ({currentAmenities.length})
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedToDelete.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  disabled={removeMutation.isPending}
                  size="small"
                >
                  Xóa đã chọn ({selectedToDelete.length})
                </Button>
              )}

              {currentAmenities.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleDeleteAll}
                  disabled={removeMutation.isPending}
                  size="small"
                >
                  Xoá hết
                </Button>
              )}
            </Box>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : currentAmenities.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, fontStyle: 'italic' }}>
              Chưa có tiện ích nào cho loại phòng này.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, pt: 1 }}>
              {currentAmenities.map((item) => {
                const isSelected = selectedToDelete.includes(item.id);
                return (
                  <Chip
                    key={item.id}
                    label={item.name}
                    onDelete={() => toggleDeleteSelection(item.id)}
                    color={isSelected ? "error" : "primary"}
                    variant={isSelected ? "filled" : "outlined"}
                    deleteIcon={<DeleteIcon />}
                    sx={{
                      fontSize: '1.02rem',
                      py: 2.8,
                      px: 2.5,
                      borderRadius: '50px',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: isSelected ? 'rgba(211, 47, 47, 0.1)' : 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          ĐÓNG
        </Button>
      </DialogActions>
    </Dialog>
  );
}