import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import RoomAmenitiesEditor from "./RoomAmenitiesEditor";

export default function RoomAmenitiesModal({ open, onClose, room }) {
  if (!room) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="between">
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Quản lý tiện ích - Phòng {room.roomNumber}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Loại phòng: <strong>{room.roomTypeName}</strong>
        </Typography>
        
        <RoomAmenitiesEditor 
          roomId={room.id} 
          roomTypeAmenities={room.amenities || []} 
        />
      </DialogContent>
    </Dialog>
  );
}
