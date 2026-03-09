🛒 WEB HOTEL

 - Dự án Website Quản lí khách sạn
 - Dự án cuối kỳ môn Phát triển Hệ thống Web, sử dụng mô hình Decoupled (Tách biệt Front-end và Back-end).

 🏢 Sơ lược dự án
 + Back-end: .NET 8 Web API, Entity Framework Core.
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

 4. Quy trình chuẩn cho nhóm 3 người khi làm việc với Migration:
 
 - Để không bị lỗi "đè" nhau, nhóm bạn nên làm theo các bước sau:
 + Người A (Lead): Thay đổi Model -> Chạy dotnet ef migrations add -> Push cả code Model và thư mục Migrations lên Git.

 + Người B & C: git pull để lấy code và file Migration của Người A về máy mình.
 Gõ lệnh: dotnet ef database update.

 Lưu ý: Người B và C không được gõ lệnh add migration nữa, vì file đã có sẵn rồi, chỉ cần chạy lệnh update để nó cập nhật vào Database thôi.

 📦 Các thư viện quan trọng đã dùng
 - Thành phần: 
 + Back-end : Npgsql.EntityFrameworkCore.PostgreSQL, AutoMapper, Microsoft.AspNetCore.Authentication.JwtBearer, SqlServer.
 + Front-end : react-router-dom, @mui/material, @mui/icons-material, lucide-react, axios