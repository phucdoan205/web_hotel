import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";

const createRoomTypeFormState = (initialData) => ({
  name: initialData?.name ?? "",
  basePrice: initialData?.basePrice ?? "",
  capacityAdults: initialData?.capacityAdults ?? "",
  capacityChildren: initialData?.capacityChildren ?? "",
  size: initialData?.size ?? "",
  bedType: initialData?.bedType ?? "",
  description: initialData?.description ?? "",
});

export default function RoomTypeForm({
  open,
  initialData,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(() => createRoomTypeFormState(initialData));

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      name: form.name.trim(),
      basePrice: Number(form.basePrice) || 0,
      capacityAdults: Number(form.capacityAdults) || 0,
      capacityChildren: Number(form.capacityChildren) || 0,
      size: form.size === "" ? null : Number(form.size),
      bedType: form.bedType.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
      <DialogTitle>
        {initialData ? "Cập nhật loại phòng" : "Thêm loại phòng"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên loại phòng"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá cơ bản"
                type="number"
                value={form.basePrice}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, basePrice: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Diện tích"
                type="number"
                value={form.size}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, size: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Người lớn"
                type="number"
                value={form.capacityAdults}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    capacityAdults: event.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Trẻ em"
                type="number"
                value={form.capacityChildren}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    capacityChildren: event.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Loại giường"
                value={form.bedType}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, bedType: event.target.value }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Mô tả"
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="submit" variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
