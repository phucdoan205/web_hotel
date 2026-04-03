// src/pages/admin/EquipmentManagement.jsx
import { useState } from 'react';
import {
    Box, Typography, Button, TextField, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
    Chip, Switch, Pagination, Stack, InputAdornment, Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { equipmentApi } from '../../api/admin/equipmentApi';

export default function EquipmentManagement() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [pageSize] = useState(15);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [isActive, setIsActive] = useState(null);

    const [openForm, setOpenForm] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);

    const [formData, setFormData] = useState({
        itemCode: '',
        name: '',
        category: '',
        unit: '',
        totalQuantity: 0,
        basePrice: 0,
        defaultPriceIfLost: 0,
        supplier: '',
        imageUrl: '',
    });

    // Lấy danh sách vật tư
    const { data: pagedData, isLoading } = useQuery({
        queryKey: ['equipments', page, search, category, isActive],
        queryFn: async () => {
            const res = await equipmentApi.getEquipments({
                search,
                category: category || undefined,
                isActive,
                page,
                pageSize
            });
            return res.data;
        }
    });

const equipments = pagedData?.items || [];
const totalPages = Math.ceil((pagedData?.totalCount || 0) / pageSize);

// Tạo / Cập nhật
const mutation = useMutation({
    mutationFn: (data) => {
        if (editingEquipment) {
            return equipmentApi.update(editingEquipment.id, data);
        }
        return equipmentApi.create(data);
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['equipments']);
        handleCloseForm();
    },
});

const toggleActiveMutation = useMutation({
    mutationFn: (id) => equipmentApi.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries(['equipments']),
});

const deleteMutation = useMutation({
    mutationFn: (id) => equipmentApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['equipments']),
});

const handleOpenForm = (equipment = null) => {
    if (equipment) {
        setEditingEquipment(equipment);
        setFormData({
            itemCode: equipment.itemCode,
            name: equipment.name,
            category: equipment.category || '',
            unit: equipment.unit || '',
            totalQuantity: equipment.totalQuantity || 0,
            basePrice: equipment.basePrice || 0,
            defaultPriceIfLost: equipment.defaultPriceIfLost || 0,
            supplier: equipment.supplier || '',
            imageUrl: equipment.imageUrl || '',
        });
    } else {
        setEditingEquipment(null);
        setFormData({
            itemCode: '', name: '', category: '', unit: '',
            totalQuantity: 0, basePrice: 0, defaultPriceIfLost: 0,
            supplier: '', imageUrl: ''
        });
    }
    setOpenForm(true);
};

const handleCloseForm = () => {
    setOpenForm(false);
    setEditingEquipment(null);
};

const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
};

return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
            Quản lý Vật tư / Thiết bị
        </Typography>

        {/* Thanh lọc - ĐÃ RỘNG TỐI ĐA (Flexbox) */}
        <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>

                {/* Ô tìm kiếm */}
                <Box sx={{ flex: '1 1 400px', minWidth: '280px' }}>
                    <TextField
                        fullWidth
                        placeholder="Tìm theo mã, tên, nhà cung cấp..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                        }}
                        size="medium"
                    />
                </Box>

                {/* Danh mục */}
                <Box sx={{ width: { xs: '100%', sm: 220, md: 240 } }}>
                    <FormControl fullWidth>
                        <InputLabel>Danh mục</InputLabel>
                        <Select
                            value={category}
                            label="Danh mục"
                            onChange={(e) => setCategory(e.target.value)}
                            size="medium"
                        >
                            <MenuItem value="">Tất cả danh mục</MenuItem>
                            <MenuItem value="Furniture">Nội thất</MenuItem>
                            <MenuItem value="Appliance">Thiết bị điện</MenuItem>
                            <MenuItem value="Utensil">Đồ dùng nhà bếp</MenuItem>
                            <MenuItem value="Bedding">Chăn ga gối đệm</MenuItem>
                            <MenuItem value="Decor">Trang trí</MenuItem>
                            <MenuItem value="Electronic">Điện tử</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Trạng thái */}
                <Box sx={{ width: { xs: '100%', sm: 180, md: 200 } }}>
                    <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                            value={isActive === null ? '' : isActive.toString()}
                            label="Trạng thái"
                            onChange={(e) => setIsActive(e.target.value === '' ? null : e.target.value === 'true')}
                            size="medium"
                        >
                            <MenuItem value="">Tất cả</MenuItem>
                            <MenuItem value="true">Đang hoạt động</MenuItem>
                            <MenuItem value="false">Ngừng hoạt động</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Nút Thêm mới */}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenForm()}
                    size="medium"
                    sx={{
                        height: '56px',
                        px: 4,
                        whiteSpace: 'nowrap',
                        minWidth: '160px'
                    }}
                >
                    THÊM MỚI
                </Button>

            </Box>
        </Paper>

        {/* Bảng danh sách */}
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Mã VT</TableCell>
                        <TableCell>Tên vật tư</TableCell>
                        <TableCell>Danh mục</TableCell>
                        <TableCell>Đơn vị</TableCell>
                        <TableCell align="right">Tổng SL</TableCell>
                        <TableCell align="right">Giá gốc</TableCell>
                        <TableCell align="right">Giá bồi thường</TableCell>
                        <TableCell>Nhà cung cấp</TableCell>
                        <TableCell align="center">Trạng thái</TableCell>
                        <TableCell align="center">Hành động</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {equipments.map((eq) => (
                        <TableRow key={eq.id}>
                            <TableCell><strong>{eq.itemCode}</strong></TableCell>
                            <TableCell>{eq.name}</TableCell>
                            <TableCell>{eq.category}</TableCell>
                            <TableCell>{eq.unit}</TableCell>
                            <TableCell align="right">{eq.totalQuantity}</TableCell>
                            <TableCell align="right">{eq.basePrice.toLocaleString('vi-VN')} ₫</TableCell>
                            <TableCell align="right">
                                <strong>{eq.defaultPriceIfLost.toLocaleString('vi-VN')} ₫</strong>
                            </TableCell>
                            <TableCell>{eq.supplier}</TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={eq.isActive ? "Hoạt động" : "Ngừng"}
                                    color={eq.isActive ? "success" : "default"}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="center">
                                <IconButton color="primary" onClick={() => handleOpenForm(eq)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="warning" onClick={() => toggleActiveMutation.mutate(eq.id)}>
                                    <Switch checked={eq.isActive} size="small" />
                                </IconButton>
                                <IconButton color="error" onClick={() => {
                                    if (window.confirm('Xóa thiết bị này?')) deleteMutation.mutate(eq.id);
                                }}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

        {/* Phân trang */}
        {totalPages > 1 && (
            <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                />
            </Stack>
        )}

        {/* Form Thêm / Sửa */}
        <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
            <DialogTitle>
                {editingEquipment ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Mã vật tư" value={formData.itemCode} onChange={e => setFormData({ ...formData, itemCode: e.target.value })} required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Tên vật tư" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Danh mục" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Đơn vị (Cái, Chiếc, Bộ...)" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} required />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Tổng số lượng" type="number" value={formData.totalQuantity} onChange={e => setFormData({ ...formData, totalQuantity: +e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Giá gốc" type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: +e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth label="Giá bồi thường khi mất" type="number" value={formData.defaultPriceIfLost} onChange={e => setFormData({ ...formData, defaultPriceIfLost: +e.target.value })} required />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Nhà cung cấp" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="URL Hình ảnh" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseForm}>Hủy</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
                    {editingEquipment ? 'Cập nhật' : 'Thêm mới'}
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
);
}
