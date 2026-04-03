import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export default function RoomTypeTable({
  roomTypes,
  isLoading,
  onEdit,
  onDelete,
  onManageAmenities,
}) {
  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Đang tải loại phòng...</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tên loại phòng</TableCell>
            <TableCell align="right">Giá cơ bản</TableCell>
            <TableCell>Sức chứa</TableCell>
            <TableCell>Giường</TableCell>
            <TableCell align="center">Số phòng</TableCell>
            <TableCell align="center">Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roomTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Chưa có loại phòng.
              </TableCell>
            </TableRow>
          ) : (
            roomTypes.map((roomType) => (
              <TableRow key={roomType.id}>
                <TableCell>
                  <Typography fontWeight={600}>{roomType.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {roomType.description || "Không có mô tả"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {(roomType.basePrice ?? 0).toLocaleString("vi-VN")} đ
                </TableCell>
                <TableCell>
                  {roomType.capacityAdults} người lớn, {roomType.capacityChildren} trẻ em
                </TableCell>
                <TableCell>{roomType.bedType || "Chưa có"}</TableCell>
                <TableCell align="center">{roomType.roomCount ?? 0}</TableCell>
                <TableCell align="center">
                  <Button onClick={() => onManageAmenities(roomType)}>
                    Tiện ích
                  </Button>
                  <Button onClick={() => onEdit(roomType)}>Sửa</Button>
                  <Button color="error" onClick={() => onDelete(roomType)}>
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
