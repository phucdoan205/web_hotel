import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, MoreVertical, AlertTriangle } from "lucide-react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Switch, FormControlLabel, Box, Typography, Divider, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const GuestTable = ({ activeTab, data }) => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  
  const [checkoutData, setCheckoutData] = useState({
     userId: "",
     roomAmount: 1800000,
     serviceAmount: 500000,
     damagedItemsFee: 0,
     discountAmount: 0,
     isBlacklisted: false
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
     fetch("http://localhost:5291/api/UserManagement")
         .then(res => res.json())
         .then(data => setUsers(data))
         .catch(err => console.log(err));
  }, []);

  const handleCheckoutClick = (guest) => {
      setSelectedGuest(guest);
      setOpenModal(true);
  };

  const handleConfirmCheckout = async () => {
      try {
          const res = await fetch("http://localhost:5291/api/Checkout/process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  bookingId: 1, // Dummy
                  userId: checkoutData.userId ? parseInt(checkoutData.userId) : null,
                  roomAmount: checkoutData.roomAmount,
                  serviceAmount: checkoutData.serviceAmount,
                  damagedItemsFee: checkoutData.damagedItemsFee,
                  discountAmount: checkoutData.discountAmount,
                  isBlacklisted: checkoutData.isBlacklisted
              })
          });
          if(res.ok) {
              alert("Checkout thành công! Đã cộng vào Tổng chi tiêu.");
              setOpenModal(false);
          }
      } catch (err) {}
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
      {/* Table Header với thanh Search */}
      <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "in" ? "check-in" : "check-out"}...`}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs w-80 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
              <th className="px-8 py-5">Guest Name</th>
              <th className="px-6 py-5">Booking ID</th>
              <th className="px-6 py-5">Room Type</th>
              <th className="px-6 py-5">
                {activeTab === "in" ? "Arrival Date" : "Departure Date"}
              </th>
              <th className="px-6 py-5 text-center">Payment</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((guest, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50/30 transition-colors group"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                      {guest.name.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      {guest.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-xs font-bold text-gray-400">
                  {guest.id}
                </td>
                <td className="px-6 py-5 text-xs font-medium text-gray-600">
                  {guest.room}
                </td>
                <td className="px-6 py-5 text-xs font-medium text-gray-500">
                  {guest.date}
                </td>
                <td className="px-6 py-5 text-center">
                  <span
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${
                      guest.payment === "Paid"
                        ? "bg-emerald-50 text-emerald-500"
                        : guest.payment === "Partial"
                          ? "bg-amber-50 text-amber-500"
                          : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    {guest.payment}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => activeTab === "out" ? handleCheckoutClick(guest) : null}
                      className={`${activeTab === "in" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100" : "bg-rose-500 hover:bg-rose-600 shadow-rose-100"} text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg`}
                    >
                      {activeTab === "in" ? "Check-in" : "Check-out"}
                    </button>
                    <button className="p-2 text-gray-300 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Checkout Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', color: '#111' }}>
              Xác nhận Check-out & Thanh Toán
          </DialogTitle>
          <DialogContent>
              <Box display="flex" flexDirection="column" gap={3} mt={1}>
                  <Box p={2} bgcolor="#f8fafc" borderRadius={2}>
                      <Typography variant="body2" color="textSecondary">Đang checkout cho Booking ID: <span className="font-bold text-black">{selectedGuest?.id}</span></Typography>
                  </Box>

                  <FormControl fullWidth>
                      <InputLabel>Liên kết với tài khoản Khách hàng (Được tích điểm)</InputLabel>
                      <Select
                          value={checkoutData.userId}
                          label="Liên kết với tài khoản Khách hàng (Được tích điểm)"
                          onChange={(e) => setCheckoutData({...checkoutData, userId: e.target.value})}
                      >
                          <MenuItem value="">-- Khách vãng lai (Guest) --</MenuItem>
                          {users.map(u => (
                              <MenuItem key={u.id} value={u.id}>{u.fullName} - {u.email}</MenuItem>
                          ))}
                      </Select>
                  </FormControl>

                  <Box display="flex" gap={2}>
                      <TextField 
                          label="Tiền Phòng (VND)" 
                          fullWidth 
                          type="number" 
                          value={checkoutData.roomAmount}
                          onChange={e => setCheckoutData({...checkoutData, roomAmount: Number(e.target.value)})}
                      />
                      <TextField 
                          label="Tiền Dịch vụ/Ăn uống (VND)" 
                          fullWidth 
                          type="number"
                          value={checkoutData.serviceAmount}
                          onChange={e => setCheckoutData({...checkoutData, serviceAmount: Number(e.target.value)})}
                      />
                  </Box>

                  <TextField 
                      label="Phí Đền Bù Hư Hỏng (VND)" 
                      fullWidth 
                      type="number"
                      color="error"
                      value={checkoutData.damagedItemsFee}
                      onChange={e => setCheckoutData({...checkoutData, damagedItemsFee: Number(e.target.value)})}
                  />
                  
                  <Box p={2} bgcolor="#fff1f2" borderRadius={2} border="1px solid #ffe4e6">
                      <FormControlLabel 
                          control={
                              <Switch 
                                  color="error"
                                  checked={checkoutData.isBlacklisted}
                                  onChange={e => setCheckoutData({...checkoutData, isBlacklisted: e.target.checked})}
                              />
                          } 
                          label={<span className="font-bold text-rose-600 flex items-center gap-1"><AlertTriangle size={16}/> Khách có thái độ tệ / Cấm thăng hạng Vĩnh viễn</span>} 
                      />
                      <Typography variant="caption" color="error" display="block" ml={4}>
                          Nếu bật, khách hàng này sẽ bị "Blacklist" và vô hiệu hoá đặc quyền Member.
                      </Typography>
                  </Box>

                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight="bold">Tổng Hóa Đơn Trả:</Typography>
                      <Typography variant="h5" fontWeight="black" color="primary">
                          {Number(checkoutData.roomAmount + checkoutData.serviceAmount + checkoutData.damagedItemsFee - checkoutData.discountAmount).toLocaleString('vi-VN')} VND
                      </Typography>
                  </Box>
              </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setOpenModal(false)} color="inherit" variant="text">Hủy</Button>
              <Button onClick={handleConfirmCheckout} variant="contained" color="primary" size="large" sx={{ fontWeight: 'bold', px: 4 }}>
                  Thu Tiền & Hoàn Tất
              </Button>
          </DialogActions>
      </Dialog>
    </div>
  );
};

export default GuestTable;
