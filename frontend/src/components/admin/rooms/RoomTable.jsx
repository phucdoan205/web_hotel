// RoomTable.jsx
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';

const columns = (onClean, onDetail) => [
  { field: 'roomNumber', headerName: 'Số phòng', width: 130 },
  { field: 'roomTypeName', headerName: 'Loại phòng', flex: 1 },
  { field: 'floor', headerName: 'Tầng', width: 80 },
  { field: 'status', headerName: 'Trạng thái', width: 130 },
  { field: 'cleaningStatus', headerName: 'Dọn phòng', width: 140 },
  {
    field: 'actions',
    headerName: 'Hành động',
    width: 280,
    renderCell: (params) => (
      <>
        <Button size="small" color="primary" onClick={() => onClean(params.row)}>Dọn phòng</Button>
        <Button size="small" color="secondary" onClick={() => onDetail(params.row)}>Chi tiết + Vật tư</Button>
      </>
    ),
  },
];

export default function RoomTable({ rooms, onClean, onDetail }) {
  return (
    <DataGrid
      rows={rooms || []}
      columns={columns(onClean, onDetail)}
      getRowId={(row) => row.id}
      pageSizeOptions={[10, 20, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
    />
  );
}