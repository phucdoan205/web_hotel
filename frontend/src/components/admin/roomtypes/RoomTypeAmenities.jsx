import { useState } from "react";
import {
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";
import { Plus, Trash2, ShieldCheck, X, Info, Settings2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomAmenitiesApi } from "../../../api/admin/roomAmenitiesApi";

const inputSx = {
  "& .MuiInputLabel-root": {
    color: "#94a3b8",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#ea580c",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "20px",
    backgroundColor: "#f8fafc",
    fontWeight: 600,
    "& fieldset": {
      borderColor: "#e2e8f0",
    },
    "&:hover fieldset": {
      borderColor: "#cbd5e1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#fdba74",
      borderWidth: 1,
    },
  },
  "& .MuiInputBase-input": {
    color: "#0f172a",
    fontSize: "0.95rem",
  },
};

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
            <h2 className="text-xl font-black text-slate-900">Tiện ích loại phòng</h2>
            <p className="text-sm font-medium text-slate-500">{roomTypeName}</p>
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
        <div className="space-y-8">
          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 border border-rose-100 flex items-center gap-2">
              <Info className="size-4" />
              {errorMsg}
            </div>
          )}

          <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6">
            <div className="mb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Thêm tiện ích mới</h4>
              <p className="mt-1 text-xs font-medium text-slate-500">Chọn một hoặc nhiều tiện ích từ danh sách để gán cho loại phòng này.</p>
            </div>
            
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <Autocomplete
                  multiple
                  fullWidth
                  options={availableAmenities}
                  getOptionLabel={(option) => option.name}
                  value={selectedAmenities}
                  onChange={(_, value) => setSelectedAmenities(value)}
                  sx={inputSx}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Chọn tiện ích..." />
                  )}
                />
              </div>
              <button
                onClick={() => addMutation.mutate(selectedAmenities.map((item) => item.id))}
                disabled={selectedAmenities.length === 0 || addMutation.isPending}
                className="flex h-[56px] items-center justify-center gap-2 rounded-[20px] bg-orange-600 px-8 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 disabled:opacity-50"
              >
                <Plus className="size-5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
              <ShieldCheck className="size-4" />
              Tiện ích đang có ({currentAmenities.length})
            </h4>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentAmenities.length === 0 ? (
                <div className="col-span-full py-10 text-center">
                  <p className="text-sm font-bold text-slate-400 italic">Chưa có tiện ích nào được gán.</p>
                </div>
              ) : (
                currentAmenities.map((item) => (
                  <div 
                    key={item.id}
                    className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 pl-4 shadow-sm transition-all hover:border-orange-100 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-slate-50 text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                        {item.iconUrl ? (
                            item.iconUrl.startsWith("http") ? (
                              <img src={item.iconUrl} alt="" className="size-4 object-contain" />
                            ) : (
                              <i className={`${item.iconUrl.includes("fa-") ? item.iconUrl : `fa-solid fa-${item.iconUrl}`} text-sm`} />
                            )
                         ) : <ShieldCheck className="size-4" />}
                      </div>
                      <span className="text-sm font-black text-slate-700">{item.name}</span>
                    </div>
                    <button
                      onClick={() => removeMutation.mutate(item.id)}
                      className="rounded-xl p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
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
