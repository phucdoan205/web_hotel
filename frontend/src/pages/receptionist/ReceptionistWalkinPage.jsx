import React, { useState } from "react";
import { Container, Typography, Box, Button, TextField, Paper, Grid } from "@mui/material";

const ReceptionistWalkinPage = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5291/api/Receptionist/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if(res.ok) {
                alert("Đăng ký thành viên thành công cho khách vãng lai!");
            } else {
                const err = await res.text();
                alert(`Lỗi: ${err}`);
            }
        } catch(e) {
            console.error(e);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box mb={3}>
                <Typography variant="h4" fontWeight="bold">Đăng ký khách vãng lai / Tiềm năng</Typography>
            </Box>
            <Paper sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Họ và tên" name="fullName" value={formData.fullName} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Ngày sinh" name="dateOfBirth" type="date" InputLabelProps={{ shrink: true }} value={formData.dateOfBirth} onChange={handleChange} required />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>Đăng ký thành viên</Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default ReceptionistWalkinPage;
