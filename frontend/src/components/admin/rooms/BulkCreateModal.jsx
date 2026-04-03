import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "../../../api/admin/roomsApi";

const initialForm = {
  roomTypeId: "",
  startNumber: "101",
  count: 5,
  floor: 1,
  status: "Available",
  cleaningStatus: "Dirty",
};

export default function BulkCreateModal({ open, onClose, roomTypes = [] }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [errorMsg, setErrorMsg] = useState("");

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const startNumber = Number(payload.startNumber);
      const rooms = Array.from({ length: Number(payload.count) }, (_, index) => ({
        roomNumber: String(startNumber + index),
        roomTypeId: Number(payload.roomTypeId),
        floor: Number(payload.floor),
        status: payload.status,
        cleaningStatus: payload.cleaningStatus,
      }));

      return roomsApi.bulkCreateRooms({ rooms });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setForm(initialForm);
      setErrorMsg("");
      onClose();
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message ?? error.message);
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMsg("");
    mutation.mutate(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Thêm nhiều phòng cùng lúc</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}

            <FormControl fullWidth>
              <InputLabel>Loại phòng</InputLabel>
              <Select
                label="Loại phòng"
                value={form.roomTypeId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, roomTypeId: event.target.value }))
                }
              >
                {roomTypes.map((roomType) => (
                  <MenuItem key={roomType.id} value={roomType.id}>
                    {roomType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Số phòng bắt đầu"
              value={form.startNumber}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startNumber: event.target.value }))
              }
            />

            <TextField
              label="Số lượng"
              type="number"
              value={form.count}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, count: event.target.value }))
              }
            />

            <TextField
              label="Tầng"
              type="number"
              value={form.floor}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, floor: event.target.value }))
              }
            />

            <FormControl fullWidth>
              <InputLabel>Trạng thái phòng</InputLabel>
              <Select
                label="Trạng thái phòng"
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Occupied">Occupied</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Cleaning">Cleaning</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Trạng thái dọn phòng</InputLabel>
              <Select
                label="Trạng thái dọn phòng"
                value={form.cleaningStatus}
                onChange={(event) =>
                  setForm((prev) => ({
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
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending || !form.roomTypeId}
          >
            {mutation.isPending ? "Đang tạo..." : "Tạo phòng"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
