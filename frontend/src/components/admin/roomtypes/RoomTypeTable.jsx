// src/components/admin/room-types/RoomTypeTable.jsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import { Edit, Delete, Star } from '@mui/icons-material';
import RoomTypeAmenities from './RoomTypeAmenities';

export default function RoomTypeTable({
  roomTypes,
  isLoading,
  onEdit,
  onDelete,
  onManageAmenities,
}) {
  const [amenitiesDialog, setAmenitiesDialog] = useState({
    open: false,
    roomTypeId: null,
    roomTypeName: '',
  });

  const openAmenitiesManager = (roomType) => {
    setAmenitiesDialog({
      open: true,
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
    });
  };

  const closeAmenitiesManager = () => {
    setAmenitiesDialog({
      open: false,
      roomTypeId: null,
      roomTypeName: '',
    });
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Đang tải danh sách loại phòng...</Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Tên loại phòng</strong></TableCell>
              <TableCell align="right"><strong>Giá cơ bản (₫)</strong></TableCell>
              <TableCell><strong>Sức chứa</strong></TableCell>
              <TableCell><strong>Diện tích (m²)</strong></TableCell>
              <TableCell><strong>Giường</strong></TableCell>
              <TableCell align="center"><strong>Tiện ích</strong></TableCell>
              <TableCell align="center"><strong>Hành động</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {roomTypes && roomTypes.length > 0 ? (
              roomTypes.map((rt) => (
                <TableRow key={rt.id} hover>
                  <TableCell>#{rt.id}</TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {rt.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      {rt.basePrice?.toLocaleString('vi-VN')} ₫
                    </strong>
                  </TableCell>
                  <TableCell>
                    {rt.capacityAdults} lớn • {rt.capacityChildren} trẻ em
                  </TableCell>
                  <TableCell>
                    {rt.size ? `${rt.size} m²` : '—'}
                  </TableCell>
                  <TableCell>{rt.bedType || '—'}</TableCell>

                  {/* Cột Tiện ích */}
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Star />}
                      onClick={() => onManageAmenities(rt)}
                      sx={{ textTransform: 'none' }}
                    >
                      Quản lý
                    </Button>
                  </TableCell>

                  {/* Hành động */}
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => onEdit(rt)}
                      sx={{ mr: 1 }}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => onDelete(rt.id)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    Không tìm thấy loại phòng nào.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal quản lý tiện ích */}
      <RoomTypeAmenities
        open={amenitiesDialog.open}
        onClose={closeAmenitiesManager}
        roomTypeId={amenitiesDialog.roomTypeId}
        roomTypeName={amenitiesDialog.roomTypeName}
      />
    </>
  );
}