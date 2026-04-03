import { useState } from "react";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roomTypesApi } from "../../../api/admin/roomTypesApi";
import RoomTypeForm from "./RoomTypeForm";
import RoomTypeTable from "./RoomTypeTable";
import RoomTypeAmenities from "./RoomTypeAmenities";

export default function RoomTypeManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [amenitiesDialog, setAmenitiesDialog] = useState({
    open: false,
    roomTypeId: null,
    roomTypeName: "",
  });

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

  const handleSave = (payload) => {
    if (editingRoomType?.id) {
      updateMutation.mutate({ id: editingRoomType.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const roomTypes = data?.items ?? [];

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <div>
            <Typography variant="h6">Loại phòng</Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý danh sách loại phòng và tiện ích đi kèm.
            </Typography>
          </div>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="Tìm loại phòng"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                setEditingRoomType(null);
                setOpenForm(true);
              }}
            >
              Thêm loại phòng
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <RoomTypeTable
        roomTypes={roomTypes}
        isLoading={isLoading}
        onEdit={(roomType) => {
          setEditingRoomType(roomType);
          setOpenForm(true);
        }}
        onDelete={(roomType) => {
          if (!window.confirm(`Xóa loại phòng ${roomType.name}?`)) {
            return;
          }
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
        onSave={handleSave}
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
    </Stack>
  );
}
