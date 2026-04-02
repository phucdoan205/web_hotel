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
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';

export default function RoomTypeAmenities({ open, onClose, roomTypeId, roomTypeName }) {
  const queryClient = useQueryClient();

  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Tự động xóa lỗi khi dialog mở
  useEffect(() => {
    if (open) setErrorMsg('');
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

  // Mutation thêm amenity
  const addMutation = useMutation({
    mutationFn: ({ roomTypeId, amenityId }) =>
      roomApi.addAmenityToRoomType(roomTypeId, amenityId),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomTypeAmenities', roomTypeId]);
      setSelectedAmenity(null);
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(
        err.response?.data?.Message ||
        err.response?.data?.message ||
        'Thêm tiện ích thất bại'
      );
    },
  });

  // Mutation xóa amenity
  const removeMutation = useMutation({
    mutationFn: ({ roomTypeId, amenityId }) =>
      roomApi.removeAmenityFromRoomType(roomTypeId, amenityId),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomTypeAmenities', roomTypeId]);
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(
        err.response?.data?.Message ||
        err.response?.data?.message ||
        'Xóa tiện ích thất bại'
      );
    },
  });

  const handleAdd = () => {
    if (!selectedAmenity) return;
    addMutation.mutate({ roomTypeId, amenityId: selectedAmenity.id });
  };

  const handleRemove = (amenityId) => {
    if (confirm('Bạn có chắc muốn xóa tiện ích này khỏi loại phòng?')) {
      removeMutation.mutate({ roomTypeId, amenityId });
    }
  };

  const availableAmenities = allAmenities.filter(
    a => !currentAmenities.some(ca => ca.id === a.id)
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg"           // Tăng từ md → lg để rộng hơn trên máy tính
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        Quản lý Tiện ích - {roomTypeName}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {/* === PHẦN THÊM TIỆN ÍCH - ĐÃ LÀM RỘNG TỐI ĐA === */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Thêm tiện ích
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' } 
          }}>
            <Autocomplete
              fullWidth
              options={availableAmenities}
              getOptionLabel={(option) => option.name}
              value={selectedAmenity}
              onChange={(_, newValue) => setSelectedAmenity(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn tiện ích"
                  placeholder="Tìm kiếm tên tiện ích..."
                  size="medium"
                />
              )}
              disabled={addMutation.isPending}
            />

            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!selectedAmenity || addMutation.isPending}
              sx={{
                minWidth: { xs: '100%', sm: 160 },
                height: '56px',           // Đồng bộ chiều cao với TextField
                fontWeight: 'bold',
                px: 4
              }}
            >
              {addMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'THÊM'
              )}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Danh sách tiện ích hiện có */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Tiện ích hiện có ({currentAmenities.length})
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : currentAmenities.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, fontStyle: 'italic' }}>
              Chưa có tiện ích nào cho loại phòng này.
            </Typography>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1.5,
              pt: 1 
            }}>
              {currentAmenities.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  onDelete={() => handleRemove(item.id)}
                  color="primary"
                  variant="outlined"
                  deleteIcon={<DeleteIcon />}
                  sx={{
                    fontSize: '1.02rem',
                    py: 2.8,
                    px: 2.5,
                    borderRadius: '50px',
                    '& .MuiChip-label': { px: 1.5 },
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderColor: 'primary.main',
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          size="large"
        >
          ĐÓNG
        </Button>
      </DialogActions>
    </Dialog>
  );
}