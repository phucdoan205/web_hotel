import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import { X, Settings2 } from "lucide-react";
import RoomAmenitiesEditor from "./RoomAmenitiesEditor";

export default function RoomAmenitiesModal({ open, onClose, room }) {
  if (!room) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        }
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Settings2 className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Tiện ích phòng</h2>
            <p className="text-sm font-medium text-slate-500">Phòng {room.roomNumber} - {room.roomTypeName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="size-6" />
        </button>
      </div>

      <DialogContent className="p-8">
        <RoomAmenitiesEditor 
          roomId={room.id} 
          roomTypeAmenities={room.roomTypeAmenities || []} 
          roomSpecificAmenities={room.roomSpecificAmenities || []}
        />
      </DialogContent>

      <div className="flex justify-end border-t border-slate-100 bg-slate-50/30 px-8 py-5">
        <button
          onClick={onClose}
          className="rounded-2xl border border-slate-200 bg-white px-8 py-3 text-sm font-black uppercase tracking-wide text-slate-600 shadow-sm transition-all hover:bg-slate-50"
        >
          Đóng
        </button>
      </div>
    </Dialog>
  );
}
