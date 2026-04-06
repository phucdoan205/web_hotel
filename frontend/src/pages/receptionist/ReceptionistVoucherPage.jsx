import React, { useState } from "react";
import { Container, Typography, Box, TextField, Button, Paper, Alert } from "@mui/material";

const ReceptionistVoucherPage = () => {
    const [voucherCode, setVoucherCode] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const checkVoucher = async () => {
        try {
            const res = await fetch(`http://localhost:5291/api/Receptionist/check-voucher`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: voucherCode })
            });
            if (res.ok) {
                const data = await res.json();
                setResult(data);
                setError("");
            } else {
                const err = await res.text();
                setError(err);
                setResult(null);
            }
        } catch(e) {
            setError("Lỗi kết nối");
        }
    };

    const useVoucher = async () => {
        if (!result) return;
        try {
            const res = await fetch(`http://localhost:5291/api/Receptionist/apply-voucher`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ voucherId: result.voucherId, orderValue: 0 }) 
            });
            if(res.ok) {
                alert("Sử dụng voucher thành công!");
                setResult(null);
                setVoucherCode("");
            } else {
                alert(await res.text());
            }
        } catch(e) {
            console.error(e);
        }
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box mb={3}>
                <Typography variant="h4" fontWeight="bold">Kiểm tra Voucher</Typography>
            </Box>
            <Paper sx={{ p: 4 }}>
                <Box display="flex" gap={2} mb={3}>
                    <TextField 
                        label="Nhập mã Voucher" 
                        variant="outlined" 
                        fullWidth 
                        value={voucherCode} 
                        onChange={(e) => setVoucherCode(e.target.value)} 
                    />
                    <Button variant="contained" color="primary" onClick={checkVoucher}>Kiểm tra</Button>
                </Box>
                {error && <Alert severity="error">{error}</Alert>}
                {result && (
                    <Alert severity="success" sx={{ mt: 2 }} action={
                        <Button color="inherit" size="small" onClick={useVoucher}>
                            Áp dụng & Đánh dấu đã dùng
                        </Button>
                    }>
                        Mã hợp lệ! Được giảm: {result.discountValue} (Loại: {result.discountType})
                    </Alert>
                )}
            </Paper>
        </Container>
    );
};

export default ReceptionistVoucherPage;
