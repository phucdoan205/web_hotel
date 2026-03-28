import React from "react";
import {
  InspectionHeader,
  ChecklistGroup,
} from "../../components/housekeeping/inspection/InspectionHeader";
import {
  EvidenceUpload,
  InspectionActions,
} from "../../components/housekeeping/inspection/InspectionActions";
const HousekeepingRoomInspectionDetailPage = () => {
  const roomData = {
    id: "302",
    type: "Deluxe King",
    code: "2023DLX",
    status: "Đang dọn dẹp (Vệ sinh sau trả phòng)",
    staff: "Lê Thị Hoa",
    startTime: "14:05 PM",
    guests: "02 Người lớn",
    endTime: "15:00 PM",
  };

  return (
    <div className="max-w-350 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: THÔNG TIN VÀ CHECKLIST */}
        <div className="lg:col-span-2 space-y-6">
          <InspectionHeader roomData={roomData} />

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <span className="size-6 bg-[#0085FF] text-white rounded-lg flex items-center justify-center text-[10px]">
                📋
              </span>
              <h2 className="text-sm font-black text-gray-900 uppercase">
                Danh mục kiểm tra kỹ thuật
              </h2>
            </div>

            <ChecklistGroup
              title="1. Giường & Chăn ga (Bedding)"
              badge="0/4"
              items={[
                "Thay toàn bộ ga trải giường và vỏ gối mới",
                "Làm phẳng mặt ga, không có nếp gấp hoặc nhăn",
                "Đệm được căn chỉnh chính xác vào khung",
                "Gối được sắp xếp đúng tiêu chuẩn thương hiệu",
              ]}
            />

            <ChecklistGroup
              title="2. Nhà vệ sinh & Phòng tắm (Bathroom)"
              badge="0/3"
              items={[
                "Gương, bồn rửa và vòi nước sáng bóng, không vết bẩn",
                "Thay mới khăn tắm, khăn tay và khăn mặt sạch",
                "Bổ sung đầy đủ bộ vật dụng vệ sinh (Toiletries)",
              ]}
            />

            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                📝 Ghi chú & Đánh giá
              </h3>
              <textarea
                placeholder="Nhập ghi chú cụ thể hoặc báo cáo hư hỏng nếu có..."
                className="w-full h-32 bg-gray-50 border-none rounded-4xl p-6 text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: MINH CHỨNG & NÚT BẤM */}
        <div className="space-y-6">
          <EvidenceUpload />
          <InspectionActions progress={65} />
        </div>
      </div>
    </div>
  );
};

export default HousekeepingRoomInspectionDetailPage;
