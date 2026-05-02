import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { Plus, Trash2, ShieldCheck, Info } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "../../../api/admin/roomsApi";
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
    borderRadius: "16px",
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
    fontSize: "0.9rem",
  },
};

export default function RoomAmenitiesEditor({ roomId, roomTypeAmenities = [], roomSpecificAmenities: initialRoomSpecific = [] }) {
  const queryClient = useQueryClient();
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const { data: allAmenities = [] } = useQuery({
    queryKey: ["amenities", { includeInactive: false }],
    queryFn: () => roomAmenitiesApi.getAmenities(false),
  });

  const { data: roomSpecificAmenities = initialRoomSpecific } = useQuery({
    queryKey: ["roomAmenities", roomId],
    queryFn: () => roomsApi.getRoomAmenities(roomId),
    enabled: !!roomId,
    initialData: initialRoomSpecific,
  });

  const addMutation = useMutation({
    mutationFn: (ids) => Promise.all(ids.map(id => roomsApi.addAmenity(roomId, id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomAmenities", roomId] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setSelectedAmenities([]);
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
    if (selectedAmenities.length > 0) {
      addMutation.mutate(selectedAmenities.map(a => a.id));
    }
  };

  const availableAmenities = allAmenities.filter(
    (a) =>
      !roomTypeAmenities.some(rta => rta.id === a.id) &&
      !roomSpecificAmenities.some((rsa) => rsa.id === a.id)
  );

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6">
        <div className="mb-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
            Thêm tiện nghi riêng cho phòng
          </h4>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Dành cho các tiện ích bổ sung chỉ có ở riêng phòng này.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <Autocomplete
              multiple
              fullWidth
              options={availableAmenities}
              getOptionLabel={(option) => option.name}
              value={selectedAmenities}
              onChange={(event, newValue) => setSelectedAmenities(newValue)}
              sx={inputSx}
              renderInput={(params) => <TextField {...params} placeholder="Chọn tiện nghi..." />}
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
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
          Tiện nghi riêng của phòng ({roomSpecificAmenities.length})
        </h4>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roomSpecificAmenities.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 py-10 text-center">
              <p className="text-sm font-bold text-slate-400 italic">Chưa có tiện nghi riêng</p>
            </div>
          ) : (
            roomSpecificAmenities.map((amenity) => (
              <div
                key={amenity.id}
                className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 pl-4 shadow-sm transition-all hover:border-orange-100 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-slate-50 text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    {amenity.iconUrl ? (
                      amenity.iconUrl.startsWith("http") ? (
                        <img src={amenity.iconUrl} alt="" className="size-4 object-contain" />
                      ) : (
                        <i className={`${amenity.iconUrl.includes("fa-") ? amenity.iconUrl : `fa-solid fa-${amenity.iconUrl}`} text-sm`} />
                      )
                    ) : <ShieldCheck className="size-4" />}
                  </div>
                  <span className="text-sm font-black text-slate-700">{amenity.name}</span>
                </div>
                <button
                  onClick={() => removeMutation.mutate(amenity.id)}
                  className="rounded-xl p-2 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
          <Info className="size-4" />
          Tiện nghi từ loại phòng (Kế thừa)
        </h4>
        <div className="flex flex-wrap gap-2">
          {roomTypeAmenities.length === 0 ? (
            <span className="text-sm font-bold text-slate-400 italic">Không có tiện nghi kế thừa</span>
          ) : (
            roomTypeAmenities.map((amenity) => (
              <div
                key={amenity.id}
                className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 opacity-75"
              >
                <div className="flex size-6 items-center justify-center rounded-lg bg-white text-slate-400">
                  {amenity.iconUrl ? (
                    amenity.iconUrl.startsWith("http") ? (
                      <img src={amenity.iconUrl} alt="" className="size-3 object-contain" />
                    ) : (
                      <i className={`${amenity.iconUrl.includes("fa-") ? amenity.iconUrl : `fa-solid fa-${amenity.iconUrl}`} text-[10px]`} />
                    )
                  ) : <ShieldCheck className="size-3" />}
                </div>
                <span className="text-xs font-bold text-slate-500">{amenity.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
