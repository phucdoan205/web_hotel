import React, { useState, useEffect } from "react";
import { 
    Container, Typography, Box, Button, Table, TableBody, TableCell, TableHead, 
    TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, MenuItem, Select, InputLabel, FormControl 
} from "@mui/material";

const AdminVouchersPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [users, setUsers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [newVoucher, setNewVoucher] = useState({
        code: "",
        discountType: "fixed",
        discountValue: 0,
        usageLimit: 1,
        userId: "",
        targetAudience: "All",
        validFrom: "",
        validTo: ""
    });

    const [sendEmail, setSendEmail] = useState(false);
    const [customerEmail, setCustomerEmail] = useState("");

    useEffect(() => {
        fetchVouchers();
        fetchUsers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const res = await fetch("http://localhost:5291/api/Vouchers");
            if (res.ok) setVouchers(await res.json());
        } catch(e) {}
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:5291/api/UserManagement");
            if (res.ok) setUsers(await res.json());
        } catch(e) {}
    };

    const handleUserChange = (e) => {
        const selectedUserId = e.target.value;
        
        if (!selectedUserId) {
            setNewVoucher({...newVoucher, userId: ""});
            setSendEmail(false);
            setCustomerEmail("");
            return;
        }

        const selectedUser = users.find(u => u.id === selectedUserId);
        if (selectedUser) {
            let autoCode = "";
            if (selectedUser.fullName && selectedUser.dateOfBirth) {
                // Tên
                const nameParts = selectedUser.fullName.trim().split(" ");
                const firstName = nameParts[nameParts.length - 1].toUpperCase();

                // Sinh nhật (DDMMYYYY)
                const dob = new Date(selectedUser.dateOfBirth);
                const dd = String(dob.getDate()).padStart(2, '0');
                const mm = String(dob.getMonth() + 1).padStart(2, '0');
                const yyyy = dob.getFullYear();

                autoCode = `${firstName}${dd}${mm}${yyyy}`;
            }

            setNewVoucher({
                ...newVoucher, 
                userId: selectedUserId,
                code: autoCode || newVoucher.code
            });
            setSendEmail(true);
            setCustomerEmail(selectedUser.email || "");
        }
    };

    const handleCreate = async () => {
        try {
            const payload = {
                ...newVoucher,
                userId: newVoucher.userId === "" ? null : parseInt(newVoucher.userId),
                validFrom: newVoucher.validFrom || null,
                validTo: newVoucher.validTo || null,
                sendEmail,
                customerEmail: newVoucher.targetAudience === 'SpecificUser' ? customerEmail : undefined
            };
            const res = await fetch("http://localhost:5291/api/Vouchers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setOpenModal(false);
                fetchVouchers();
                setNewVoucher({ code: "", discountType: "fixed", discountValue: 0, usageLimit: 1, userId: "", targetAudience: "All", validFrom: "", validTo: "" });
                setSendEmail(false);
                setCustomerEmail("");
            } else {
                alert("Lỗi khi tạo voucher");
            }
        } catch(e) {}
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Quản lý Voucher</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>TẠO VOUCHER MỚI</Button>
            </Box>
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã Voucher</TableCell>
                            <TableCell>Giảm giá</TableCell>
                            <TableCell>Loại</TableCell>
                            <TableCell>Lượt dùng</TableCell>
                            <TableCell>Thành viên (Riêng)</TableCell>
                            <TableCell>Trạng thái</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vouchers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Chưa có voucher nào</TableCell>
                            </TableRow>
                        ) : (
                            vouchers.map(v => (
                                <TableRow key={v.id}>
                                    <TableCell>{v.code}</TableCell>
                                    <TableCell>{v.discountValue}</TableCell>
                                    <TableCell>{v.discountType}</TableCell>
                                    <TableCell>{v.usageCount} / {v.usageLimit || '∞'}</TableCell>
                                    <TableCell>{v.user?.fullName || "Chung (Mọi người)"}</TableCell>
                                    <TableCell>{v.isActive ? "Còn hạn" : "Khóa"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Tạo Voucher Mới</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField 
                            label="Mã Voucher" 
                            value={newVoucher.code} 
                            onChange={(e) => setNewVoucher({...newVoucher, code: e.target.value})} 
                        />
                        <TextField 
                            label="Giảm giá (Số tiền hoặc %)" 
                            type="number"
                            value={newVoucher.discountValue} 
                            onChange={(e) => setNewVoucher({...newVoucher, discountValue: e.target.value})} 
                        />
                        <TextField 
                            label="Thời gian bắt đầu (Valid From)" 
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            value={newVoucher.validFrom} 
                            onChange={(e) => setNewVoucher({...newVoucher, validFrom: e.target.value})} 
                        />
                        <TextField 
                            label="Thời gian hết hạn (Valid To)" 
                            type="datetime-local"
                            InputLabelProps={{ shrink: true }}
                            value={newVoucher.validTo} 
                            onChange={(e) => setNewVoucher({...newVoucher, validTo: e.target.value})} 
                        />
                        <TextField 
                            label="Giới hạn số lần dùng" 
                            type="number"
                            value={newVoucher.usageLimit} 
                            onChange={(e) => setNewVoucher({...newVoucher, usageLimit: parseInt(e.target.value) || 1})} 
                        />
                        <FormControl>
                            <InputLabel>Đối tượng áp dụng</InputLabel>
                            <Select
                                value={newVoucher.targetAudience}
                                label="Đối tượng áp dụng"
                                onChange={(e) => {
                                    setNewVoucher({...newVoucher, targetAudience: e.target.value, userId: ""});
                                    if (e.target.value !== 'SpecificUser' && e.target.value !== 'All') {
                                        setSendEmail(true);
                                    } else {
                                        setSendEmail(false);
                                    }
                                }}
                            >
                                <MenuItem value="All">Tất cả khách hàng (Không email)</MenuItem>
                                <MenuItem value="SpecificUser">Một khách hàng cụ thể</MenuItem>
                                <MenuItem value="Staff">Nhân viên & Staff</MenuItem>
                                <MenuItem value="LoyalCustomer">Khách hàng VIP (Thân thiết)</MenuItem>
                                <MenuItem value="BirthdayMonth">Khách có sinh nhật tháng này</MenuItem>
                                <MenuItem value="NewRegistration">Thành viên đăng ký mới (Tuần này)</MenuItem>
                            </Select>
                        </FormControl>

                        {newVoucher.targetAudience === 'SpecificUser' && (
                            <FormControl>
                                <InputLabel>Chọn Khách hàng (Cụ thể)</InputLabel>
                                <Select
                                    value={newVoucher.userId}
                                    label="Chọn Khách hàng (Cụ thể)"
                                    onChange={handleUserChange}
                                >
                                    <MenuItem value="">-- Vui lòng chọn --</MenuItem>
                                    {users.map(u => (
                                        <MenuItem key={u.id} value={u.id}>{u.fullName} - {u.email}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {sendEmail && (
                            <Box display="flex" flexDirection="column" gap={1} mt={1} p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="primary">Sẽ tự động gửi Email tới:</Typography>
                                <TextField 
                                    size="small"
                                    label="Email nhận Voucher"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Hủy</Button>
                    <Button onClick={handleCreate} variant="contained" color="primary">Tạo</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminVouchersPage;
