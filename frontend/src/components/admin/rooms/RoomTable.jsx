// RoomTable.jsx
import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import RoomDetailModal from './RoomDetailModal';   // ← Import modal

const columns = (onClean, onDetail) => [
  { field: 'roomNumber', headerName: 'Số phòng', width: 130 },
  { field: 'roomTypeName', headerName: 'Loại phòng', flex: 1 },
  { field: 'floor', headerName: 'Tầng', width: 80 },
  { field: 'status', headerName: 'Trạng thái', width: 130 },
  { field: 'cleaningStatus', headerName: 'Dọn phòng', width: 140 },
  {
    field: 'actions',
    headerName: 'Hành động',
    width: 320,
    renderCell: (params) => (
      <>
        <Button
          size="small"
          color="primary"
          onClick={() => onClean(params.row)}
          sx={{ mr: 1 }}
        >
          Dọn phòng
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={() => onDetail(params.row)}
        >
          Chi tiết + Vật tư
        </Button>
      </>
    ),
  },
];

export default function RoomTable({ rooms, onClean }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleDetail = (room) => {
    setSelectedRoom(room);
    setDetailOpen(true);
  };

  return (
    <>
      <DataGrid
        rows={rooms || []}
        columns={columns(onClean, handleDetail)}   // Truyền handleDetail vào
        getRowId={(row) => row.id}
        pageSizeOptions={[10, 20, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 15 } }
        }}
        disableRowSelectionOnClick
        autoHeight
      />

      {/* Modal Chi tiết phòng */}
      <RoomDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        room={selectedRoom}
      />
    </>
  );
}