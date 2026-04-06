import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";

const AdminMembershipsPage = () => {
    const [memberships, setMemberships] = useState([]);

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
                                    <TableCell>{m.minPoints}</TableCell>
                                    <TableCell>{m.discountPercent}</TableCell>
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
