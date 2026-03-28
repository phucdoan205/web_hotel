Code backend hoàn chỉnh ở nhánh thai
Các controller/api đã làm:

AmenitiesController
ArticleCategoriesController
ArticlesController
AttractionsController
AuthController
GuestController
RoleController
RoomInventoriesController
RoomsController
RoomTypesController
UserManagementController
UserProfileController

Ảnh được upload lên cloudinary.

🛒 WEB HOTEL

 - Dự án Website Quản lí khách sạn
 - Dự án cuối kỳ môn Phát triển Hệ thống Web, sử dụng mô hình Decoupled (Tách biệt Front-end và Back-end).

 🏢 Sơ lược dự án
 + Back-end: .NET 10 Web API, Entity Framework Core.
 + Front-end: React (Vite), Tailwind CSS, Material UI.
 + Database: PostgreSQL (Host trên Supabase), SqlServer.
 + Tính năng chính: Quản lý phòng, đặt phòng, thanh toán, phân quyền Admin/Staff/Booking/Guest, Chatbot hỗ trợ.

 * 🛠 Hướng dẫn cài đặt khi Clone dự án
 - Sau khi clone repo về máy, bạn thực hiện các bước sau:

 1. Cấu hình Back-end (.NET)
 + Mở Terminal tại thư mục /backend:
 + Chạy dự án: dotnet run

 2. Cấu hình Front-end (React)
 -  Mở Terminal tại thư mục /frontend:
 + Cài đặt thư viện: npm install
 + Chạy dự án: npm run dev

 3. Quy trình cập nhật Database (Migration)
 - Khi bạn thêm Bảng mới hoặc Trường dữ liệu mới trong code C#, hãy thực hiện các lệnh sau tại thư mục /backend:

 + Bước 1: Tạo bản ghi thay đổi (Migration):dotnet ef migrations add Ten_Migration (thay Ten_Migration bằng nội dung bạn vừa sửa (ví dụ: AddPhoneToUser) ) 
 + Bước 2: Đẩy dữ liệu lên SqlServer (Supabase). Lệnh này sẽ cập nhật trực tiếp cấu trúc bảng lên Database online: dotnet ef database update

 * Lưu ý: Nếu bạn chưa cài công cụ EF Core, hãy chạy: dotnet tool install --global dotnet-ef trước.
 4. Cơ chế Phân quyền (Role-Based Access Control - RBAC)

Hệ thống áp dụng mô hình bảo mật tiêu chuẩn Enterprise **RBAC**. Mỗi người dùng sẽ được gán một Vai trò (Role) cố định, và mỗi Role sẽ có một tập hợp Quyền hạn (Permissions) cụ thể được kiểm soát chặt chẽ. Hệ thống được chia thành 4 nhóm Actors chính:

4.1 Guest (Khách hàng)
Nhóm người dùng phổ thông truy cập hệ thống từ bên ngoài.
* **Quyền hạn:** * Tìm kiếm và Đặt phòng (Booking).
  * Xem nội dung hệ thống (Bài viết, Dịch vụ, Điểm tham quan).
  * Viết đánh giá (Review) sau khi trải nghiệm.
  * Áp dụng Voucher/Mã khuyến mãi khi thanh toán.

4.2 Receptionist (Lễ tân)
Nhóm nhân viên trực tiếp giao tiếp và xử lý yêu cầu của khách tại quầy.
* **Quyền hạn:**
  * Thực hiện thủ tục Check-in / Check-out cho khách.
  * Gán phòng cụ thể dựa trên Booking của khách.
  * Sử dụng hệ thống POS (Point of Sale) để thêm các dịch vụ phát sinh (minibar, giặt ủi,...).
  * Xử lý thu tiền và xuất hóa đơn thanh toán.

4.3 Housekeeping (Nhân viên Buồng phòng)
Nhóm nhân viên đảm bảo chất lượng và vệ sinh phòng ốc.
* **Quyền hạn:**
  * Xem danh sách phòng cần dọn dẹp.
  * Cập nhật trạng thái phòng (Cần dọn -> Đang dọn -> Hoàn tất).
  * Báo cáo vật tư hư hỏng hoặc hao hụt (minibar) trực tiếp lên hệ thống để Lễ tân nắm thông tin.

4.4 Manager / Admin (Quản lý / Quản trị viên)
Nhóm có quyền lực cao nhất, vận hành toàn bộ hệ thống khách sạn.
* **Quyền hạn:**
  * **Toàn quyền hệ thống:** Truy cập mọi chức năng.
  * Xem và xuất các Báo cáo thống kê (Doanh thu, Tỷ lệ lấp đầy phòng,...).
  * Quản lý nhân sự (Tạo tài khoản, phân quyền cho Staff).
  * Theo dõi **Audit Log** (Nhật ký hoạt động của toàn bộ nhân viên để truy vết khi có sự cố).
 4. Quy trình chuẩn cho nhóm 5 người khi làm việc với Migration:
 
 - Để không bị lỗi "đè" nhau, nhóm bạn nên làm theo các bước sau:
 + Người A (Lead): Thay đổi Model -> Chạy dotnet ef migrations add -> Push cả code Model và thư mục Migrations lên Git.

 + Người B & C: git pull để lấy code và file Migration của Người A về máy mình.
 Gõ lệnh: dotnet ef database update.

 Lưu ý: Người B và C không được gõ lệnh add migration nữa, vì file đã có sẵn rồi, chỉ cần chạy lệnh update để nó cập nhật vào Database thôi.

 📦 Các thư viện quan trọng đã dùng
 - Thành phần: 
 + Back-end : Npgsql.EntityFrameworkCore.PostgreSQL, AutoMapper, Microsoft.AspNetCore.Authentication.JwtBearer, SqlServer.
 + Front-end : react-router-dom, @mui/material, @mui/icons-material, lucide-react, axios
