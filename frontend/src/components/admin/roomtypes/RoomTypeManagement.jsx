// src/components/admin/rooms/RoomTypeManagement.jsx
import React, { useState } from 'react';
import { Button } from '@mui/material';
import { Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';
import RoomTypeForm from './RoomTypeForm';
import RoomTypeTable from './RoomTypeTable';
import RoomTypeAmenities from './RoomTypeAmenities';   // ← Import component mới

const RoomTypeManagement = () => {
  const queryClient = useQueryClient();

  const [openForm, setOpenForm] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);

  // State cho quản lý tiện ích
  const [amenitiesDialog, setAmenitiesDialog] = useState({
    open: false,
    roomTypeId: null,
    roomTypeName: '',
  });

  // === LẤY DANH SÁCH LOẠI PHÒNG ===
  const { data: roomTypes = [], isLoading, error } = useQuery({
    queryKey: ['roomTypes'],
    queryFn: async () => {
      const res = await roomApi.getRoomTypes();
      return res.data.items || [];
    },
  });

  // === THÊM MỚI ===
  const createMutation = useMutation({
    mutationFn: roomApi.createRoomType,
    onSuccess: () => {
      queryClient.invalidateQueries(['roomTypes']);
      setOpenForm(false);
      setEditingRoomType(null);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Thêm loại phòng thất bại");
    },
  });

  // === CẬP NHẬT ===
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => roomApi.updateRoomType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['roomTypes']);
      setOpenForm(false);
      setEditingRoomType(null);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Cập nhật thất bại");
    },
  });

  const handleOpenCreate = () => {
    setEditingRoomType(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (roomType) => {
    setEditingRoomType(roomType);
    setOpenForm(true);
  };

  // === MỞ QUẢN LÝ TIỆN ÍCH ===
  const handleOpenAmenities = (roomType) => {
    setAmenitiesDialog({
      open: true,
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
    });
  };

  const handleCloseAmenities = () => {
    setAmenitiesDialog({
      open: false,
      roomTypeId: null,
      roomTypeName: '',
    });
  };

  const handleSave = (payload) => {
    if (editingRoomType) {
      updateMutation.mutate({ id: editingRoomType.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá loại phòng này?")) return;

    try {
      await roomApi.deleteRoomType(id);
      queryClient.invalidateQueries(['roomTypes']);
    } catch (err) {
      alert("Xoá thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Room Types</h1>
          <p className="text-gray-500 mt-1">Quản lý các loại phòng khách sạn</p>
        </div>

        <Button
          variant="contained"
          startIcon={<Plus className="size-5" />}
          onClick={handleOpenCreate}
          sx={{
            bgcolor: '#ff5e1f',
            '&:hover': { bgcolor: '#e54d1a' },
            borderRadius: '16px',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 6,
            py: 1.8,
            boxShadow: '0 4px 12px rgba(255, 94, 31, 0.3)',
          }}
        >
          Thêm loại phòng mới
        </Button>
      </div>

      {/* Thông báo lỗi */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-5 py-4 rounded-2xl">
          Không thể tải dữ liệu. Vui lòng thử lại sau.
        </div>
      )}

      {/* Bảng danh sách */}
      <RoomTypeTable
        roomTypes={roomTypes}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onManageAmenities={handleOpenAmenities}
      />

      {/* Form Modal */}
      {openForm && (
        <RoomTypeForm
          initialData={editingRoomType}
          onSave={handleSave}
          onCancel={() => {
            setOpenForm(false);
            setEditingRoomType(null);
          }}
        />
      )}

      {/* Modal Quản lý Tiện ích */}
      <RoomTypeAmenities
        open={amenitiesDialog.open}
        onClose={handleCloseAmenities}
        roomTypeId={amenitiesDialog.roomTypeId}
        roomTypeName={amenitiesDialog.roomTypeName}
      />
    </div>
  );
};

export default RoomTypeManagement;