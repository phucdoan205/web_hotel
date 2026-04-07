import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";

const AdminMembershipsPage = () => {
    const [memberships, setMemberships] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchMemberships();
        fetchUsers();
    }, []);

    const fetchMemberships = async () => {
        try {
            const res = await fetch("http://localhost:5291/api/Memberships");
            if (res.ok) {
                const data = await res.json();
                setMemberships(data);
            }
        } catch (error) {
            console.error("Failed to fetch memberships", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:5291/api/Memberships/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {}
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Quản lý Hạng Thành Viên</Typography>
                <Button variant="contained" color="primary">Thêm Hạng Mới</Button>
            </Box>
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên Hạng</TableCell>
                            <TableCell>Mức chi tiêu tối thiểu (VND)</TableCell>
                            <TableCell>Ưu đãi (%)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {memberships.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center">Chưa có hạng thành viên nào (Đồng, Bạc, Vàng...)</TableCell>
                            </TableRow>
                        ) : (
                            memberships.map(m => (
                                <TableRow key={m.id}>
                                    <TableCell>{m.tierName}</TableCell>
                                    <TableCell>{Number(m.minPoints).toLocaleString('vi-VN')} VND</TableCell>
                                    <TableCell>{m.discountPercent}%</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={6} mb={3}>
                <Typography variant="h5" fontWeight="bold">Danh Sách Hạng Khách Hàng</Typography>
            </Box>
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên Khách Hàng</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Tổng Chi Tiêu (VND)</TableCell>
                            <TableCell>Hạng Thành Viên</TableCell>
                            <TableCell>Trạng Thái</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Chưa có khách hàng nào phát sinh chi tiêu</TableCell>
                            </TableRow>
                        ) : (
                            users.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{u.fullName}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell sx={{ color: '#2563eb', fontWeight: 'bold' }}>{Number(u.totalSpending).toLocaleString('vi-VN')} đ</TableCell>
                                    <TableCell>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            u.isBlacklisted ? 'bg-rose-100 text-rose-600' : 
                                            u.tierName === 'Diamond' ? 'bg-purple-100 text-purple-600' :
                                            u.tierName === 'Gold' ? 'bg-yellow-100 text-yellow-600' :
                                            u.tierName === 'Silver' ? 'bg-gray-200 text-gray-600' :
                                            u.tierName === 'Bronze' ? 'bg-orange-100 text-orange-600' :
                                            'bg-gray-100 text-gray-500'
                                        }`}>
                                            {u.tierName}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {u.isBlacklisted ? (
                                            <span className="text-rose-500 text-xs font-bold flex items-center gap-1">⛔ Banned</span>
                                        ) : (
                                            <span className="text-emerald-500 text-xs font-bold">✅ Active</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
};

export default AdminMembershipsPage;
