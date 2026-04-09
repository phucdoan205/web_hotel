import { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  Inventory2Outlined as InventoryIcon,
  WarningAmberRounded as WarningIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomInventoriesApi } from "../../../api/admin/roomInventoriesApi";
import { getEquipmentList } from "../../../api/admin/equipmentApi";
import { roomsApi } from "../../../api/admin/roomsApi";

const getApiMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data ||
  error?.message ||
  fallback;

export default function RoomInventoryModal({
  open,
  onClose,
  roomId,
  roomNumber,
}) {
  const queryClient = useQueryClient();
  const [selectedToDelete, setSelectedToDelete] = useState([]);
  const [createFeedback, setCreateFeedback] = useState("");
  const [cloneFeedback, setCloneFeedback] = useState("");
  const [inventoryForm, setInventoryForm] = useState({
    equipmentId: null,
    itemType: "",
    quantity: 1,
    priceIfLost: 0,
  });
  const [cloneRoomId, setCloneRoomId] = useState(null);

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

  const { data: roomsResponse } = useQuery({
    queryKey: ["roomInventoryCloneSources"],
    queryFn: () => roomsApi.getRooms({ page: 1, pageSize: 300 }),
    enabled: open,
  });

  const availableCloneRooms = useMemo(
    () => (roomsResponse?.items ?? []).filter((room) => room.id !== roomId),
    [roomId, roomsResponse?.items],
  );

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
      setCreateFeedback("Đã thêm vật tư vào phòng.");
    },
    onError: (error) => {
      setCreateFeedback(getApiMessage(error, "Không thể thêm vật tư vào phòng."));
    },
  });

  const cloneMutation = useMutation({
    mutationFn: (payload) => roomInventoriesApi.cloneInventory(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
      queryClient.invalidateQueries({ queryKey: ["housekeepingInventoryReports"] });
      setCloneFeedback(
        response?.message || "Đã clone vật tư từ phòng nguồn sang phòng hiện tại.",
      );
    },
    onError: (error) => {
      setCloneFeedback(getApiMessage(error, "Không thể clone vật tư từ phòng khác."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roomInventoriesApi.deleteInventory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
    },
  });

  const handleAddInventory = () => {
    setCreateFeedback("");

    if (!roomId || !inventoryForm.itemType.trim()) {
      setCreateFeedback("Vui lòng nhập tên vật tư trước khi thêm.");
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

  const handleCloneRoom = () => {
    setCloneFeedback("");

    if (!roomId || !cloneRoomId) {
      setCloneFeedback("Vui lòng chọn phòng nguồn để clone vật tư.");
      return;
    }

    cloneMutation.mutate({
      sourceRoomId: cloneRoomId,
      targetRoomId: roomId,
    });
  };

  const handleBulkDelete = async (ids) => {
    await Promise.all(ids.map((id) => roomInventoriesApi.deleteInventory(id)));
    queryClient.invalidateQueries({ queryKey: ["roomInventory", roomId] });
    setSelectedToDelete([]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <Box
            sx={{
              display: "flex",
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              bgcolor: "sky.50",
              color: "info.main",
            }}
          >
            <InventoryIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Vật tư phòng {roomNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thêm nhanh vật tư hoặc clone cấu hình vật tư từ phòng khác sang phòng này.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 4,
              background:
                "linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(255,255,255,1) 55%)",
            }}
          >
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Clone từ phòng khác
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Hệ thống sẽ kiểm tra tồn kho trước khi chuyển vật tư. Nếu thiếu, báo cáo sẽ được đẩy sang Housekeeping.
                  </Typography>
                </Box>
                <Chip
                  icon={<ContentCopyIcon />}
                  label="Clone theo phòng"
                  color="info"
                  variant="outlined"
                />
              </Stack>

              {cloneFeedback ? (
                <Alert
                  severity={cloneFeedback.includes("thiếu") || cloneFeedback.includes("Housekeeping") ? "warning" : "success"}
                  onClose={() => setCloneFeedback("")}
                >
                  {cloneFeedback}
                </Alert>
              ) : null}

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Autocomplete
                  fullWidth
                  options={availableCloneRooms}
                  value={availableCloneRooms.find((room) => room.id === cloneRoomId) ?? null}
                  getOptionLabel={(option) => `Phòng ${option.roomNumber} • ${option.roomTypeName || "Không rõ loại"}`}
                  onChange={(_, value) => setCloneRoomId(value?.id ?? null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Phòng nguồn"
                      placeholder="Chọn phòng cần clone vật tư"
                    />
                  )}
                />

                <Button
                  variant="contained"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCloneRoom}
                  disabled={cloneMutation.isPending || !cloneRoomId}
                  sx={{ minWidth: { md: 220 }, borderRadius: 3, px: 3 }}
                >
                  {cloneMutation.isPending ? "Đang clone..." : "Clone vật tư"}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  Thêm vật tư thủ công
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Dùng khi cần thêm riêng lẻ một vật tư mới cho phòng hiện tại.
                </Typography>
              </Box>

              {createFeedback ? (
                <Alert
                  severity={createFeedback.includes("không đủ") || createFeedback.includes("thieu") ? "warning" : "success"}
                  onClose={() => setCreateFeedback("")}
                >
                  {createFeedback}
                </Alert>
              ) : null}

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
                      priceIfLost: Number(value?.defaultPriceIfLost ?? value?.basePrice ?? 0),
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
                  sx={{ minWidth: { md: 160 }, borderRadius: 3, px: 3 }}
                >
                  {createMutation.isPending ? "Đang thêm..." : "Thêm vật tư"}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Danh sách vật tư hiện có
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {inventoryItems.length} vật tư đang gắn với phòng {roomNumber}.
                  </Typography>
                </Box>

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
            </Box>

            <Divider />

            {inventoryItems.length === 0 ? (
              <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
                <WarningIcon color="warning" />
                <Typography sx={{ mt: 1 }} fontWeight={700}>
                  Phòng này chưa có vật tư nào.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Bạn có thể thêm tay hoặc clone nhanh từ một phòng khác.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell>Vật tư</TableCell>
                      <TableCell align="center">Số lượng</TableCell>
                      <TableCell align="right">Giá đền bù</TableCell>
                      <TableCell align="center">Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryItems.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedToDelete.includes(item.id)}
                            onChange={() =>
                              setSelectedToDelete((prev) =>
                                prev.includes(item.id)
                                  ? prev.filter((value) => value !== item.id)
                                  : [...prev, item.id],
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography fontWeight={700}>
                              {item.equipmentName || item.itemType}
                            </Typography>
                            {item.equipmentCode ? (
                              <Typography variant="caption" color="text.secondary">
                                Mã: {item.equipmentCode}
                              </Typography>
                            ) : null}
                          </Stack>
                        </TableCell>
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
            )}
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
