import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import RoomTable from "../../components/admin/rooms/RoomTable";
import RoomForm from "../../components/admin/rooms/RoomForm";
import BulkCreateModal from "../../components/admin/rooms/BulkCreateModal";
import CleaningModal from "../../components/admin/rooms/CleaningModal";
import DeleteRoomDialog from "../../components/admin/rooms/DeleteRoomDialog";
import RoomDetailModal from "../../components/admin/rooms/RoomDetailModal";
import RoomInventoryModal from "../../components/admin/rooms/RoomInventoryModal";
import RoomTypeManagement from "../../components/admin/roomtypes/RoomTypeManagement";
import { roomsApi } from "../../api/admin/roomsApi";
import { roomTypesApi } from "../../api/admin/roomTypesApi";
import { hasPermission } from "../../utils/permissions";

const defaultFilters = {
  search: "",
  status: "",
  cleaningStatus: "",
  roomTypeId: "",
  floor: "",
  page: 1,
  pageSize: 10,
};

export default function AdminRoomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const tab = location.pathname.includes("/room-types") ? 1 : 0;
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formState, setFormState] = useState({ open: false, room: null });
  const [openBulk, setOpenBulk] = useState(false);
  const [openCleaning, setOpenCleaning] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);
  const canCreateRooms = hasPermission("CREATE_ROOMS");
  const canEditRooms = hasPermission("EDIT_ROOMS");
  const canDeleteRooms = hasPermission("DELETE_ROOMS");
  const canUpdateRoomStatus = hasPermission("UPDATE_ROOM_STATUS");
  const canViewInventory = hasPermission("INVENTORY_ROOMS");

  const roomQueryParams = useMemo(() => {
    const params = {
      page: filters.page,
      pageSize: filters.pageSize,
    };

    if (filters.search.trim()) params.search = filters.search.trim();
    if (filters.status) params.status = filters.status;
    if (filters.cleaningStatus) params.cleaningStatus = filters.cleaningStatus;
    if (filters.roomTypeId) params.roomTypeId = Number(filters.roomTypeId);
    if (filters.floor !== "") params.floor = Number(filters.floor);

    return params;
  }, [filters]);

  const {
    data: roomsResponse,
    isLoading: isRoomsLoading,
    error: roomsError,
  } = useQuery({
    queryKey: ["rooms", roomQueryParams],
    queryFn: () => roomsApi.getRooms(roomQueryParams),
  });

  const { data: roomTypesResponse } = useQuery({
    queryKey: ["roomTypes", { page: 1, pageSize: 100 }],
    queryFn: () => roomTypesApi.getRoomTypes({ page: 1, pageSize: 100 }),
  });

  const updateCleaningMutation = useMutation({
    mutationFn: ({ id, cleaningStatus }) =>
      roomsApi.updateCleaningStatus(id, cleaningStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id) => roomsApi.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      setDeleteTarget(null);
    },
  });

  const restoreRoomMutation = useMutation({
    mutationFn: (id) => roomsApi.restoreRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });

  const rooms = roomsResponse?.items ?? [];
  const totalCount = roomsResponse?.totalCount ?? 0;
  const roomTypes = roomTypesResponse?.items ?? [];

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      if (name === "page") return { ...prev, page: value };
      if (name === "pageSize") return { ...prev, pageSize: value, page: 1 };

      return { ...prev, [name]: value, page: 1 };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-950">
          Quản lý phòng
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Quản lý phòng và thao tác vận hành theo phong cách admin hiện tại.
        </p>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          {[
            { label: "Phòng", value: 0 },
            { label: "Loại phòng", value: 1 },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                navigate(item.value === 0 ? "/admin/rooms" : "/admin/room-types")
              }
              className={`border-b-2 px-1 pb-3 text-sm font-black uppercase tracking-wide transition-all ${
                tab === item.value
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {roomsError ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          Không tải được danh sách phòng. Khả năng cao backend `Rooms` đang trả lỗi.
          {` ${roomsError.message || ""}`.trim()}
        </div>
      ) : null}

      {tab === 0 ? (
        <RoomTable
          rooms={rooms}
          totalCount={totalCount}
          loading={isRoomsLoading}
          filters={filters}
          roomTypes={roomTypes}
          canCreateRooms={canCreateRooms}
          canEditRooms={canEditRooms}
          canDeleteRooms={canDeleteRooms}
          canUpdateRoomStatus={canUpdateRoomStatus}
          canViewInventory={canViewInventory}
          onFilterChange={handleFilterChange}
          onResetFilters={() => setFilters(defaultFilters)}
          onCreate={() => setFormState({ open: true, room: null })}
          onEdit={(room) => setFormState({ open: true, room })}
          onBulkCreate={() => setOpenBulk(true)}
          onDelete={(room) => {
            deleteRoomMutation.reset();
            setDeleteTarget(room);
          }}
          onRestore={(room) => {
            restoreRoomMutation.mutate(room.id);
          }}
          onClean={(room) => {
            setSelectedRoom(room);
            setOpenCleaning(true);
          }}
          onOpenInventory={(room) => {
            setSelectedRoom(room);
            setOpenInventory(true);
          }}
        />
      ) : (
        <RoomTypeManagement />
      )}

      <RoomForm
        key={`${formState.room?.id ?? "new"}-${formState.open ? "open" : "closed"}`}
        open={formState.open}
        initialData={formState.room}
        roomTypes={roomTypes}
        rooms={rooms}
        onClose={() => setFormState({ open: false, room: null })}
      />

      <BulkCreateModal
        open={openBulk}
        roomTypes={roomTypes}
        onClose={() => setOpenBulk(false)}
      />

      <CleaningModal
        open={openCleaning}
        room={selectedRoom}
        onClose={() => setOpenCleaning(false)}
        onSave={(cleaningStatus) => {
          if (!selectedRoom?.id) return;
          updateCleaningMutation.mutate({ id: selectedRoom.id, cleaningStatus });
          setOpenCleaning(false);
        }}
      />

      <DeleteRoomDialog
        open={Boolean(deleteTarget)}
        room={deleteTarget}
        isPending={deleteRoomMutation.isPending}
        error={deleteRoomMutation.error?.response?.data ?? deleteRoomMutation.error?.message ?? ""}
        onClose={() => {
          if (deleteRoomMutation.isPending) return;
          deleteRoomMutation.reset();
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget?.id) return;
          deleteRoomMutation.mutate(deleteTarget.id);
        }}
      />

      <RoomDetailModal
        key={`${selectedRoom?.id ?? "room"}-${openDetail ? "open" : "closed"}`}
        open={openDetail}
        room={selectedRoom}
        roomTypes={roomTypes}
        onClose={() => setOpenDetail(false)}
      />

      <RoomInventoryModal
        open={openInventory}
        roomId={selectedRoom?.id}
        roomNumber={selectedRoom?.roomNumber}
        onClose={() => setOpenInventory(false)}
      />
    </div>
  );
}
