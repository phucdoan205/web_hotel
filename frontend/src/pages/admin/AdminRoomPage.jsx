import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/admin/roomApi';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Tabs, Tab, Box, Typography } from '@mui/material';
import BulkCreateModal from '../../components/admin/rooms/BulkCreateModal';
import CleaningModal from '../../components/admin/rooms/CleaningModal';
import RoomForm from '../../components/admin/rooms/RoomForm';

export default function AdminRoomsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [openBulk, setOpenBulk] = useState(false);
  const [openCleaning, setOpenCleaning] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomApi.getRooms().then(r => r.data.items || []),
  });

  const updateCleaningMutation = useMutation({
    mutationFn: ({ id, status }) => roomApi.updateCleaningStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries(['rooms']),
  });

  const columns = [
    { field: 'roomNumber', headerName: 'Số phòng', width: 120 },
    { field: 'roomTypeName', headerName: 'Loại phòng', width: 180 },
    { field: 'status', headerName: 'Trạng thái', width: 130 },
    { field: 'cleaningStatus', headerName: 'Dọn phòng', width: 130 },
    {
      field: 'actions',
      headerName: 'Hành động',
      width: 300,
      renderCell: (params) => (
        <>
          <Button size="small" onClick={() => { setSelectedRoom(params.row); setOpenCleaning(true); }}>Dọn phòng</Button>
          <Button size="small" color="secondary" onClick={() => alert(`Xem chi tiết phòng ${params.row.roomNumber}`)}>Chi tiết</Button>
        </>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4">Quản lý Phòng</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Danh sách phòng" />
        <Tab label="Tạo phòng nhanh" />
      </Tabs>

      {tab === 0 && (
        <>
          <Button variant="contained" onClick={() => setOpenBulk(true)}>Tạo nhiều phòng (Bulk)</Button>
          <DataGrid rows={rooms || []} columns={columns} getRowId={row => row.id} />
        </>
      )}

      {tab === 1 && <RoomForm onSuccess={() => queryClient.invalidateQueries(['rooms'])} />}

      <BulkCreateModal open={openBulk} onClose={() => setOpenBulk(false)} />
      <CleaningModal
        open={openCleaning}
        room={selectedRoom}
        onClose={() => setOpenCleaning(false)}
        onSave={(status) => {
          updateCleaningMutation.mutate({ id: selectedRoom.id, status });
          setOpenCleaning(false);
        }}
      />
    </Box>
  );
}