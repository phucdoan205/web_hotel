// AdminRoomsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/admin/roomApi';
import { Box, Typography, Tabs, Tab, Button } from '@mui/material';

import RoomTable from '../../components/admin/rooms/RoomTable';
import BulkCreateModal from '../../components/admin/rooms/BulkCreateModal';
import CleaningModal from '../../components/admin/rooms/CleaningModal';
import RoomDetailModal from '../../components/admin/rooms/RoomDetailModal';
import RoomForm from '../../components/admin/rooms/RoomForm';

export default function AdminRoomsPage() {
  const queryClient = useQueryClient();

  const [tab, setTab] = useState(0);
  const [openBulk, setOpenBulk] = useState(false);
  const [openCleaning, setOpenCleaning] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Fetch danh sách phòng
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await roomApi.getRooms();
      return res.data?.items || res.data || [];
    },
  });

  // Mutation cập nhật trạng thái dọn phòng
  const updateCleaningMutation = useMutation({
    mutationFn: ({ id, status }) => roomApi.updateCleaningStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['rooms']);
    },
  });

  // Xử lý mở modal chi tiết
  const handleOpenDetail = (room) => {
    setSelectedRoom(room);
    setOpenDetail(true);
  };

  // Xử lý mở modal dọn phòng
  const handleOpenCleaning = (room) => {
    setSelectedRoom(room);
    setOpenCleaning(true);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Quản lý Phòng
      </Typography>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Danh sách phòng" />
        <Tab label="Tạo phòng mới" />
      </Tabs>

      {/* Tab 0: Danh sách phòng */}
      {tab === 0 && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6">
              Tổng số phòng: <strong>{rooms.length}</strong>
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpenBulk(true)}
              size="large"
            >
              + Tạo nhiều phòng (Bulk)
            </Button>
          </Box>

          <RoomTable
            rooms={rooms}
            onClean={handleOpenCleaning}
            onDetail={handleOpenDetail}
          />
        </>
      )}

      {/* Tab 1: Tạo phòng đơn lẻ */}
      {tab === 1 && (
        <RoomForm
          onSuccess={() => queryClient.invalidateQueries(['rooms'])}
        />
      )}

      {/* Modals */}
      <BulkCreateModal
        open={openBulk}
        onClose={() => setOpenBulk(false)}
      />

      <CleaningModal
        open={openCleaning}
        room={selectedRoom}
        onClose={() => setOpenCleaning(false)}
        onSave={(status) => {
          if (selectedRoom) {
            updateCleaningMutation.mutate({
              id: selectedRoom.id,
              status
            });
          }
          setOpenCleaning(false);
        }}
      />

      <RoomDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        room={selectedRoom}
      />
    </Box>
  );
}