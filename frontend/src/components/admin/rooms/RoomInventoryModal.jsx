import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomInventoriesApi } from "../../../api/admin/roomInventoriesApi";
import { getEquipmentList } from "../../../api/admin/equipmentApi";

export default function RoomInventoryModal({
  open,
  onClose,
  roomId,
  roomNumber,
}) {
  const queryClient = useQueryClient();
  const [selectedToDelete, setSelectedToDelete] = useState([]);
  const [inventoryForm, setInventoryForm] = useState({
    equipmentId: null,
    itemType: "",
    quantity: 1,
    priceIfLost: 0,
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["roomInventory", roomId],
    queryFn: () => roomInventoriesApi.getInventoryByRoom(roomId),
    enabled: open && !!roomId,
  });

  const { data: equipmentSuggestions = [] } = useQuery({
    queryKey: ["equipmentSuggestions"],
    queryFn: async () => {
      const data = await getEquipmentList({ isActive: true, page: 1, pageSize: 100 });
      return data?.items ?? [];
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => roomInventoriesApi.createInventory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
      setInventoryForm({
        equipmentId: null,
        itemType: "",
        quantity: 1,
        priceIfLost: 0,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roomInventoriesApi.deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
    },
  });

  const handleAddInventory = () => {
    if (!roomId || !inventoryForm.itemType.trim()) {
      return;
    }

    createMutation.mutate({
      roomId,
      equipmentId: inventoryForm.equipmentId,
      itemType: inventoryForm.itemType.trim(),
      quantity: Number(inventoryForm.quantity) || 1,
      priceIfLost: Number(inventoryForm.priceIfLost) || 0,
      isActive: true,
    });
  };

  const handleBulkDelete = async (ids) => {
    await Promise.all(ids.map((id) => roomInventoriesApi.deleteInventory(id)));
    queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
    setSelectedToDelete([]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Vật tư phòng {roomNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Thêm vật tư
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Autocomplete
                fullWidth
                options={equipmentSuggestions}
                getOptionLabel={(option) => option.name ?? ""}
                onChange={(_, value) =>
                  setInventoryForm((prev) => ({
                    ...prev,
                    equipmentId: value?.id ?? null,
                    itemType: value?.name ?? "",
                    priceIfLost: Number(
                      value?.defaultPriceIfLost ?? value?.basePrice ?? 0,
                    ),
                  }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Thiết bị có sẵn" />
                )}
              />

              <TextField
                label="Tên vật tư"
                value={inventoryForm.itemType}
                onChange={(event) =>
                  setInventoryForm((prev) => ({
                    ...prev,
                    itemType: event.target.value,
                    equipmentId: null,
                  }))
                }
              />

              <TextField
                label="Số lượng"
                type="number"
                value={inventoryForm.quantity}
                onChange={(event) =>
                  setInventoryForm((prev) => ({
                    ...prev,
                    quantity: event.target.value,
                  }))
                }
              />

              <TextField
                label="Giá đền bù"
                type="number"
                value={inventoryForm.priceIfLost}
                onChange={(event) =>
                  setInventoryForm((prev) => ({
                    ...prev,
                    priceIfLost: event.target.value,
                  }))
                }
              />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddInventory}
                disabled={createMutation.isPending}
              >
                Thêm
              </Button>
            </Stack>
          </Box>

          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle1">
                Danh sách vật tư ({inventoryItems.length})
              </Typography>

              {selectedToDelete.length > 0 ? (
                <Button
                  color="error"
                  startIcon={<DeleteSweepIcon />}
                  onClick={() => handleBulkDelete(selectedToDelete)}
                >
                  Xóa đã chọn
                </Button>
              ) : null}
            </Stack>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>Tên vật tư</TableCell>
                    <TableCell align="center">Số lượng</TableCell>
                    <TableCell align="right">Giá đền bù</TableCell>
                    <TableCell align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedToDelete.includes(item.id)}
                          onChange={() =>
                            setSelectedToDelete((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id],
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>{item.equipmentName || item.itemType}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {(item.priceIfLost ?? 0).toLocaleString("vi-VN")} đ
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => deleteMutation.mutate(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
