import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ContentCopy, Delete } from "@mui/icons-material";
import { roomsApi } from "../../api/admin/roomsApi";
import { roomInventoriesApi } from "../../api/admin/roomInventoriesApi";

export default function AdminRoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openInventory, setOpenInventory] = useState(false);
  const [openClone, setOpenClone] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [cloneForm, setCloneForm] = useState({
    targetRoomId: "",
    newItemType: "",
  });
  const [formData, setFormData] = useState({
    itemType: "",
    quantity: 1,
    priceIfLost: 0,
  });

  const { data: room } = useQuery({
    queryKey: ["room", id],
    queryFn: () => roomsApi.getRoomById(id),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory", id],
    queryFn: () => roomInventoriesApi.getInventoryByRoom(id),
    enabled: !!id,
  });

  const createInventoryMutation = useMutation({
    mutationFn: roomInventoriesApi.createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", id] });
      setOpenInventory(false);
      setFormData({ itemType: "", quantity: 1, priceIfLost: 0 });
    },
  });

  const cloneMutation = useMutation({
    mutationFn: roomInventoriesApi.cloneInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", id] });
      setOpenClone(false);
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: roomInventoriesApi.deleteInventory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inventory", id] }),
  });

  if (!room) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box p={3}>
      <Button onClick={() => navigate("/admin/rooms")} sx={{ mb: 2 }}>
        Quay lại danh sách phòng
      </Button>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Phòng {room.roomNumber}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>Loại phòng:</strong> {room.roomTypeName}
            </Typography>
            <Typography>
              <strong>Giá cơ bản:</strong>{" "}
              {room.basePrice?.toLocaleString("vi-VN")} VND
            </Typography>
            <Typography>
              <strong>Tầng:</strong> {room.floor}
            </Typography>
            <Typography>
              <strong>Trạng thái:</strong> {room.status}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>
              <strong>Trạng thái dọn:</strong> {room.cleaningStatus}
            </Typography>
            <Typography>
              <strong>Sức chứa:</strong> {room.capacityAdults} người lớn,{" "}
              {room.capacityChildren} trẻ em
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Danh sách vật tư phòng</Typography>
        <Button variant="contained" onClick={() => setOpenInventory(true)}>
          Thêm vật tư
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên vật tư</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="right">Giá nếu mất</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.itemType || item.equipmentName}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">
                  {item.priceIfLost?.toLocaleString("vi-VN")} VND
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setSelectedInventory(item);
                      setCloneForm({
                        targetRoomId: "",
                        newItemType: item.itemType || item.equipmentName || "",
                      });
                      setOpenClone(true);
                    }}
                  >
                    <ContentCopy />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => deleteInventoryMutation.mutate(item.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Chưa có vật tư nào
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openInventory} onClose={() => setOpenInventory(false)}>
        <DialogTitle>Thêm vật tư cho phòng {room.roomNumber}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên vật tư"
            value={formData.itemType}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, itemType: event.target.value }))
            }
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Số lượng"
            type="number"
            value={formData.quantity}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, quantity: Number(event.target.value) }))
            }
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Giá nếu mất (VND)"
            type="number"
            value={formData.priceIfLost}
            onChange={(event) =>
              setFormData((prev) => ({
                ...prev,
                priceIfLost: Number(event.target.value),
              }))
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInventory(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() =>
              createInventoryMutation.mutate({ roomId: Number(id), ...formData })
            }
          >
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openClone} onClose={() => setOpenClone(false)}>
        <DialogTitle>Clone vật tư sang phòng khác</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="ID phòng đích"
            type="number"
            value={cloneForm.targetRoomId}
            onChange={(event) =>
              setCloneForm((prev) => ({
                ...prev,
                targetRoomId: event.target.value,
              }))
            }
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Tên vật tư mới"
            value={cloneForm.newItemType}
            onChange={(event) =>
              setCloneForm((prev) => ({
                ...prev,
                newItemType: event.target.value,
              }))
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClone(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() =>
              cloneMutation.mutate({
                sourceInventoryId: selectedInventory.id,
                targetRoomId: Number(cloneForm.targetRoomId),
                newItemType: cloneForm.newItemType.trim() || undefined,
              })
            }
          >
            Clone
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
