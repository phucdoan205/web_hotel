import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "../../../api/admin/roomsApi";

export default function RoomCloneModal({ open, onClose, room }) {
  const queryClient = useQueryClient();
  const [roomNumbersInput, setRoomNumbersInput] = useState(
    room?.roomNumber ? `${room.roomNumber}-COPY` : "",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const roomNumbers = useMemo(
    () =>
      roomNumbersInput
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    [roomNumbersInput],
  );

  const cloneMutation = useMutation({
    mutationFn: async (numbers) =>
      Promise.all(
        numbers.map((newRoomNumber) =>
          roomsApi.cloneRoom(room.id, { newRoomNumber }),
        ),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onClose();
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message ?? error.message);
    },
  });

  const handleClone = () => {
    if (!room?.id || roomNumbers.length === 0) {
      setErrorMsg("Nhập ít nhất một số phòng để clone.");
      return;
    }

    setErrorMsg("");
    cloneMutation.mutate(roomNumbers);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Clone phòng {room?.roomNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Nhập một hoặc nhiều số phòng, mỗi số trên một dòng hoặc cách nhau
            bằng dấu phẩy.
          </Typography>

          {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}

          <TextField
            label="Danh sách số phòng mới"
            multiline
            minRows={4}
            value={roomNumbersInput}
            onChange={(event) => setRoomNumbersInput(event.target.value)}
            placeholder={"301\n302\n303A"}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleClone}
          disabled={cloneMutation.isPending}
        >
          {cloneMutation.isPending
            ? "Đang clone..."
            : `Clone ${roomNumbers.length || ""}`.trim()}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
