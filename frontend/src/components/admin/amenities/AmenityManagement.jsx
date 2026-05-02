import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomAmenitiesApi } from "../../../api/admin/roomAmenitiesApi";
import AmenityTable from "./AmenityTable";
import AmenityForm from "./AmenityForm";

export default function AmenityManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);

  const { data: amenities, isLoading } = useQuery({
    queryKey: ["amenities", { includeInactive: true }],
    queryFn: () => roomAmenitiesApi.getAmenities(true),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => roomAmenitiesApi.createAmenity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      setOpenForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => roomAmenitiesApi.updateAmenity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
      setOpenForm(false);
      setEditingAmenity(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roomAmenitiesApi.deleteAmenity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => roomAmenitiesApi.toggleAmenityStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["amenities"] });
    },
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredAmenities = (amenities ?? []).filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedAmenities = filteredAmenities.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredAmenities.length / pageSize);

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Danh sách tiện nghi</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Quản lý danh sách tiện nghi và trạng thái hiển thị của chúng.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm tiện nghi"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => {
                setEditingAmenity(null);
                setOpenForm(true);
              }}
              className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700"
            >
              Thêm tiện nghi
            </button>
          </div>
        </div>
      </div>

      <AmenityTable
        amenities={paginatedAmenities}
        isLoading={isLoading}
        onEdit={(item) => {
          setEditingAmenity(item);
          setOpenForm(true);
        }}
        onDelete={(item) => {
          if (window.confirm(`Xóa tiện nghi ${item.name}?`)) {
            deleteMutation.mutate(item.id);
          }
        }}
        onToggle={(item) => toggleMutation.mutate(item.id)}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="flex items-center px-4 text-sm font-bold text-slate-600">
            Trang {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      <AmenityForm
        open={openForm}
        initialData={editingAmenity}
        onClose={() => {
          setOpenForm(false);
          setEditingAmenity(null);
        }}
        onSave={(payload) => {
          if (editingAmenity) {
            updateMutation.mutate({ id: editingAmenity.id, payload });
          } else {
            createMutation.mutate(payload);
          }
        }}
      />
    </div>
  );
}
