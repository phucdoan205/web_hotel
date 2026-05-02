import React, { useState } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "../../../api/admin/roomsApi";
import { roomAmenitiesApi } from "../../../api/admin/roomAmenitiesApi";

export default function RoomAmenitiesEditor({ roomId, roomTypeAmenities = [] }) {
  const queryClient = useQueryClient();
  const [selectedAmenity, setSelectedAmenity] = useState(null);

  const { data: allAmenities = [] } = useQuery({
    queryKey: ["amenities", { includeInactive: false }],
    queryFn: () => roomAmenitiesApi.getAmenities(false),
  });

  const { data: roomSpecificAmenities = [] } = useQuery({
    queryKey: ["roomAmenities", roomId],
    queryFn: () => roomsApi.getRoomAmenities(roomId),
    enabled: !!roomId,
  });

  const addMutation = useMutation({
    mutationFn: (amenityId) => roomsApi.addAmenity(roomId, amenityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomAmenities", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setSelectedAmenity(null);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (amenityId) => roomsApi.removeAmenity(roomId, amenityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomAmenities", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const handleAdd = () => {
    if (selectedAmenity) {
      addMutation.mutate(selectedAmenity.id);
    }
  };

  // Filter out amenities already present in room type or room specific
  const availableAmenities = allAmenities.filter(
    (a) =>
      !roomTypeAmenities.includes(a.name) &&
      !roomSpecificAmenities.some((rsa) => rsa.id === a.id)
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Tiện nghi riêng của phòng
      </Typography>
      
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Autocomplete
          size="small"
          options={availableAmenities}
          getOptionLabel={(option) => option.name}
          sx={{ flexGrow: 1 }}
          value={selectedAmenity}
          onChange={(event, newValue) => setSelectedAmenity(newValue)}
          renderInput={(params) => <TextField {...params} label="Thêm tiện nghi" />}
        />
        <IconButton 
          color="primary" 
          onClick={handleAdd} 
          disabled={!selectedAmenity || addMutation.isPending}
        >
          <Chip label="Thêm" color="primary" onClick={handleAdd} />
        </IconButton>
      </Stack>

      <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #eee' }}>
        {roomSpecificAmenities.length === 0 ? (
          <ListItem>
            <ListItemText secondary="Chưa có tiện nghi riêng" />
          </ListItem>
        ) : (
          roomSpecificAmenities.map((amenity) => (
            <ListItem
              key={amenity.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => removeMutation.mutate(amenity.id)}>
                  <Delete size="small" />
                </IconButton>
              }
            >
              <ListItemText primary={amenity.name} />
            </ListItem>
          ))
        )}
      </List>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        * Tiện nghi từ loại phòng sẽ tự động hiển thị trên web.
      </Typography>
    </Box>
  );
}
