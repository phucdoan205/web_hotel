import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomAmenitiesApi } from "../../../api/admin/roomAmenitiesApi";

export default function RoomTypeAmenities({
  open,
  onClose,
  roomTypeId,
  roomTypeName,
}) {
  const queryClient = useQueryClient();
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: amenities = [] } = useQuery({
    queryKey: ["amenities"],
    queryFn: () => roomAmenitiesApi.getAmenities(),
    enabled: open,
  });

  const { data: currentAmenities = [] } = useQuery({
    queryKey: ["roomTypeAmenities", roomTypeId],
    queryFn: () => roomAmenitiesApi.getRoomTypeAmenities(roomTypeId),
    enabled: open && !!roomTypeId,
  });

  const addMutation = useMutation({
    mutationFn: (ids) =>
      Promise.all(ids.map((id) => roomAmenitiesApi.addAmenityToRoomType(roomTypeId, id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypeAmenities", roomTypeId] });
      setSelectedAmenities([]);
      setErrorMsg("");
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message ?? error.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => roomAmenitiesApi.removeAmenityFromRoomType(roomTypeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypeAmenities", roomTypeId] });
    },
  });

  const availableAmenities = amenities.filter(
    (item) => !currentAmenities.some((current) => current.id === item.id),
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Tiện ích của {roomTypeName}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Thêm tiện ích
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Autocomplete
                multiple
                fullWidth
                options={availableAmenities}
                getOptionLabel={(option) => option.name}
                value={selectedAmenities}
                onChange={(_, value) => setSelectedAmenities(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Chọn tiện ích" />
                )}
              />
              <Button
                variant="contained"
                onClick={() =>
                  addMutation.mutate(selectedAmenities.map((item) => item.id))
                }
                disabled={selectedAmenities.length === 0 || addMutation.isPending}
              >
                Thêm
              </Button>
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Tiện ích hiện có
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {currentAmenities.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  onDelete={() => removeMutation.mutate(item.id)}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
