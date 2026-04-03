// src/components/admin/rooms/RoomTable.jsx
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { ContentCopy as CloneIcon } from '@mui/icons-material';

const columns = (onClean, onDetail, onOpenInventory, onClone) => [
  { field: 'roomNumber', headerName: 'Số phòng', width: 130 },
  { field: 'roomTypeName', headerName: 'Loại phòng', flex: 1 },
  { field: 'floor', headerName: 'Tầng', width: 80 },
  { field: 'status', headerName: 'Trạng thái', width: 130 },
  { field: 'cleaningStatus', headerName: 'Dọn phòng', width: 140 },
  {
    field: 'actions',
    headerName: 'Hành động',
    width: 420,                    // Tăng chiều rộng để đủ chỗ 4 nút
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
          color="info"
          onClick={() => onDetail(params.row)}
          sx={{ mr: 1 }}
        >
          Chi tiết
        </Button>

        <Button
          size="small"
          color="secondary"
          onClick={() => onOpenInventory(params.row)}
          sx={{ mr: 1 }}
        >
          Vật tư
        </Button>

        {/* Nút Clone - Mới thêm */}
        <Button
          size="small"
          color="success"
          variant="outlined"
          startIcon={<CloneIcon />}
          onClick={() => onClone(params.row)}
        >
          Clone
        </Button>
      </>
    ),
  },
];

export default function RoomTable({ 
  rooms, 
  onClean, 
  onDetail, 
  onOpenInventory,
  onClone   // ← Nhận prop này
}) {
  return (
    <DataGrid
      rows={rooms || []}
      columns={columns(onClean, onDetail, onOpenInventory, onClone)}
      getRowId={(row) => row.id}
      pageSizeOptions={[10, 20, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
      disableRowSelectionOnClick
      autoHeight
      sx={{
        '& .MuiDataGrid-cell': {
          display: 'flex',
          alignItems: 'center',
        }
      }}
    />
  );
}