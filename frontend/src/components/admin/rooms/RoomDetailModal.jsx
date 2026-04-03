import { useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "../../../api/admin/roomsApi";
import { roomTypesApi } from "../../../api/admin/roomTypesApi";

const createRoomFormData = (room) => ({
  roomNumber: room?.roomNumber ?? "",
  floor: room?.floor ?? "",
  status: room?.status ?? "Available",
  cleaningStatus: room?.cleaningStatus ?? "Dirty",
  roomTypeId: room?.roomTypeId ?? "",
});

export default function RoomDetailModal({ open, onClose, room, roomTypes = [] }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState(() => createRoomFormData(room));

  const { data: roomType } = useQuery({
    queryKey: ["roomType", room?.roomTypeId],
    queryFn: () => roomTypesApi.getRoomTypeById(room.roomTypeId),
    enabled: open && !!room?.roomTypeId,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => roomsApi.updateRoom(room.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["roomType", room?.roomTypeId] });
      setIsEditing(false);
      onClose();
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message ?? error.message);
    },
  });

  if (!room) {
    return null;
  }

  const handleSave = () => {
    updateMutation.mutate({
      roomNumber: formData.roomNumber.trim(),
      floor: formData.floor === "" ? null : Number(formData.floor),
      status: formData.status,
      cleaningStatus: formData.cleaningStatus,
      roomTypeId: formData.roomTypeId ? Number(formData.roomTypeId) : null,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết phòng {room.roomNumber}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Typography variant="h6">Thông tin phòng</Typography>

                  <TextField
                    label="Số phòng"
                    value={formData.roomNumber}
                    disabled={!isEditing}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        roomNumber: event.target.value,
                      }))
                    }
                  />

                  <TextField
                    label="Tầng"
                    type="number"
                    value={formData.floor}
                    disabled={!isEditing}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, floor: event.target.value }))
                    }
                  />

                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Trạng thái phòng</InputLabel>
                    <Select
                      label="Trạng thái phòng"
                      value={formData.status}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: event.target.value,
                        }))
                      }
                    >
                      <MenuItem value="Available">Available</MenuItem>
                      <MenuItem value="Occupied">Occupied</MenuItem>
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                      <MenuItem value="Cleaning">Cleaning</MenuItem>
                      <MenuItem value="OutOfOrder">OutOfOrder</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Trạng thái dọn phòng</InputLabel>
                    <Select
                      label="Trạng thái dọn phòng"
                      value={formData.cleaningStatus}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          cleaningStatus: event.target.value,
                        }))
                      }
                    >
                      <MenuItem value="Dirty">Dirty</MenuItem>
                      <MenuItem value="InProgress">InProgress</MenuItem>
                      <MenuItem value="Clean">Clean</MenuItem>
                      <MenuItem value="Inspected">Inspected</MenuItem>
                      <MenuItem value="Pickup">Pickup</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth disabled={!isEditing}>
                    <InputLabel>Loại phòng</InputLabel>
                    <Select
                      label="Loại phòng"
                      value={formData.roomTypeId}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          roomTypeId: event.target.value,
                        }))
                      }
                    >
                      {roomTypes.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6">{roomType?.name ?? room.roomTypeName}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Giá cơ bản: {(roomType?.basePrice ?? room.basePrice ?? 0).toLocaleString("vi-VN")} đ
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Sức chứa: {roomType?.capacityAdults ?? room.capacityAdults ?? 0} người lớn,
                  {" "}
                  {roomType?.capacityChildren ?? room.capacityChildren ?? 0} trẻ em
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Giường: {roomType?.bedType ?? room.bedType ?? "Chưa có"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Diện tích: {roomType?.size ?? room.size ?? "Chưa có"}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Tiện ích
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(roomType?.amenities ?? room.amenities ?? []).map((item) => (
                    <Chip key={item} label={item} size="small" />
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={() => setIsEditing(false)}>Hủy sửa</Button>
            <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Đóng</Button>
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Sửa phòng
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
