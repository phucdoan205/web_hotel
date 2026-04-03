// src/components/admin/rooms/RoomTable.jsx
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';

const columns = (onClean, onDetail, onOpenInventory) => [
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
          color="primary"
          onClick={() => onDetail(params.row)}
          sx={{ mr: 1 }}
        >
          Chi tiết
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={() => onOpenInventory(params.row)}
        >
          Vật tư
        </Button>
      </>
    ),
  },
];

export default function RoomTable({ 
  rooms, 
  onClean, 
  onDetail, 
  onOpenInventory 
}) {
  return (
    <DataGrid
      rows={rooms || []}
      columns={columns(onClean, onDetail, onOpenInventory)}
      getRowId={(row) => row.id}
      pageSizeOptions={[10, 20, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
      disableRowSelectionOnClick
      autoHeight
    />
  );
}