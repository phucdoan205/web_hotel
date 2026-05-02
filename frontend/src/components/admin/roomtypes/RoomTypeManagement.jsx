import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { roomTypesApi } from "../../../api/admin/roomTypesApi";
import { hasPermission } from "../../../utils/permissions";
import RoomTypeForm from "./RoomTypeForm";
import RoomTypeTable from "./RoomTypeTable";
import RoomTypeAmenities from "./RoomTypeAmenities";

export default function RoomTypeManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [amenitiesDialog, setAmenitiesDialog] = useState({
    open: false,
    roomTypeId: null,
    roomTypeName: "",
  });
  const canCreateRoomTypes = hasPermission("CREATE_ROOMS");
  const canEditRoomTypes = hasPermission("EDIT_ROOMS");
  const canDeleteRoomTypes = hasPermission("DELETE_ROOMS");

  const { data, isLoading } = useQuery({
    queryKey: ["roomTypes", { search, page: 1, pageSize: 100 }],
    queryFn: () => roomTypesApi.getRoomTypes({ search, page: 1, pageSize: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => roomTypesApi.createRoomType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      setOpenForm(false);
      setEditingRoomType(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => roomTypesApi.updateRoomType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
      setOpenForm(false);
      setEditingRoomType(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => roomTypesApi.deleteRoomType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomTypes"] });
    },
  });

  const roomTypes = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Danh sách loại phòng</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Quản lý loại phòng, ảnh hiển thị và nhóm tiện ích đi kèm.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm loại phòng"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-orange-300 focus:bg-white"
            />
            {canCreateRoomTypes ? (
              <button
                type="button"
                onClick={() => {
                  setEditingRoomType(null);
                  setOpenForm(true);
                }}
                className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700"
              >
                Thêm loại phòng
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <RoomTypeTable
        roomTypes={roomTypes}
        isLoading={isLoading}
        canEdit={canEditRoomTypes}
        canDelete={canDeleteRoomTypes}
        canManageAmenities={canEditRoomTypes}
        onView={(roomType) => {
          window.open(`/room-types/${roomType.id}`, "_blank");
        }}
        onEdit={async (roomType) => {
          const detail = await roomTypesApi.getRoomTypeById(roomType.id);
          setEditingRoomType(detail);
          setOpenForm(true);
        }}
        onDelete={(roomType) => {
          if (!window.confirm(`Xóa loại phòng ${roomType.name}?`)) return;
          deleteMutation.mutate(roomType.id);
        }}
        onManageAmenities={(roomType) =>
          setAmenitiesDialog({
            open: true,
            roomTypeId: roomType.id,
            roomTypeName: roomType.name,
          })
        }
      />

      <RoomTypeForm
        key={`${editingRoomType?.id ?? "new"}-${openForm ? "open" : "closed"}`}
        open={openForm}
        initialData={editingRoomType}
        onSave={(payload) => {
          if (editingRoomType?.id) {
            updateMutation.mutate({ id: editingRoomType.id, payload });
            return;
          }

          createMutation.mutate(payload);
        }}
        onCancel={() => {
          setOpenForm(false);
          setEditingRoomType(null);
        }}
      />

      <RoomTypeAmenities
        open={amenitiesDialog.open}
        roomTypeId={amenitiesDialog.roomTypeId}
        roomTypeName={amenitiesDialog.roomTypeName}
        onClose={() =>
          setAmenitiesDialog({
            open: false,
            roomTypeId: null,
            roomTypeName: "",
          })
        }
      />
    </div>
  );
}
