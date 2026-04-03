// src/components/admin/rooms/RoomCloneModal.jsx
import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Alert
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../../api/admin/roomApi';

export default function RoomCloneModal({
    open,
    onClose,
    room
}) {
    const queryClient = useQueryClient();
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [error, setError] = useState('');

    const cloneMutation = useMutation({
        mutationFn: (newNumber) => roomApi.cloneRoom(room?.id, { newRoomNumber: newNumber }),
        onSuccess: () => {
            queryClient.invalidateQueries(['rooms']);
            handleClose();
            alert(`✅ Clone phòng #${room?.roomNumber} thành công!`);
        },
        onError: (err) => {
            setError(err.response?.data?.message || 'Clone phòng thất bại');
        },
    });

    const handleClose = () => {
        setNewRoomNumber('');
        setError('');
        onClose();
    };

    const handleClone = () => {
        if (!newRoomNumber.trim()) {
            setError('Vui lòng nhập số phòng mới');
            return;
        }
        cloneMutation.mutate(newRoomNumber.trim());
    };

    // Reset form khi mở modal
    useEffect(() => {
        if (open && room) {
            setNewRoomNumber(`${room.roomNumber}-Copy`);
            setError('');
        }
    }, [open, room]);

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Clone Phòng #{room?.roomNumber}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Phòng mới sẽ được sao chép <strong>toàn bộ thông tin</strong> và
                    <strong> danh sách vật tư</strong> từ phòng gốc.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    autoFocus
                    fullWidth
                    label="Số phòng mới *"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="Ví dụ: 105A, 201-Copy..."
                    sx={{ mt: 1 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Hủy</Button>
                <Button
                    variant="contained"
                    onClick={handleClone}
                    disabled={cloneMutation.isPending || !newRoomNumber.trim()}
                >
                    {cloneMutation.isPending ? 'Đang clone...' : 'Clone Phòng'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}