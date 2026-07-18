# HomeStay Dorm

HomeStay Dorm là hệ thống quản lý ký túc xá tư nhân, hỗ trợ hai hình thức lưu trú:

- Thuê nguyên phòng.
- Thuê giường ở ghép.

Ứng dụng quản lý xuyên suốt quy trình từ đăng ký nhu cầu thuê, xem phòng, đặt cọc, ký hợp đồng, nhận phòng, thanh toán, trả phòng, đối soát đến hoàn cọc và thanh lý hợp đồng.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS |
| Backend | ASP.NET Core Web API, .NET 9, Entity Framework Core 9 |
| Database | Microsoft SQL Server |
| Xác thực | JWT Bearer, BCrypt |

Kiến trúc repository:

```text
PTTKHTTT/
├── Backend/       ASP.NET Core Web API, EF Core, migration và dữ liệu demo
├── Frontend/      Ứng dụng React/Vite
├── DrawIo/        Sơ đồ thiết kế và sequence
├── KeToan/        Tài liệu, sơ đồ của tác nhân Kế toán
├── Sale/          Tài liệu, sơ đồ của tác nhân Sale
└── Tasks/         Đặc tả, mô tả màn hình và tài liệu phân tích
```

## Tác nhân và chức năng chính

### Khách hàng

- Đăng ký nhu cầu thuê.
- Xem lịch hẹn, thông tin phòng, nội quy và giá thuê.
- Gửi yêu cầu đặt cọc và xác nhận điều kiện thuê.
- Bổ sung hồ sơ nhận phòng.
- Xem, ký hợp đồng và xác nhận biên bản bàn giao.
- Thanh toán tiền cọc và các khoản nhận phòng.
- Yêu cầu trả phòng, xác nhận đối soát, thanh lý và hoàn cọc.

### Nhân viên Sale

- Tiếp nhận và rà soát hồ sơ đăng ký thuê.
- Tra cứu phòng/giường và sắp lịch xem phòng.
- Ghi nhận kết quả xem phòng.
- Rà soát yêu cầu đặt cọc và hồ sơ nhận phòng.
- Lập hợp đồng đặt cọc, hợp đồng thuê và tiếp nhận trả phòng.

### Quản lý

- Kiểm tra trạng thái phòng trước khi nhận đặt cọc.
- Kiểm tra điều kiện lưu trú của khách thuê.
- Kiểm tra hiện trạng phòng khi khách trả phòng.
- Xác nhận các nghiệp vụ hoàn cọc theo luồng xử lý.

### Kế toán

- Tạo yêu cầu thanh toán cọc.
- Lập các khoản thu khi nhận phòng.
- Xác nhận hoặc từ chối giao dịch thanh toán.
- Lập bảng đối soát khi trả phòng.
- Thực hiện hoàn cọc.

### Quản trị hệ thống

- Xem tổng quan hệ thống.
- Quản lý người dùng và trạng thái tài khoản.
- Phân quyền theo vai trò.
- Quản lý thông số hệ thống.
- Quản lý danh mục phòng/giường và trạng thái sử dụng.
- Quản lý danh mục dịch vụ.
- Quản lý nội quy, tiện nghi, ảnh phòng và giá dịch vụ áp dụng.

Thông báo là chức năng dùng chung cho các tác nhân.

## Yêu cầu môi trường

Cài đặt các thành phần sau:

- [.NET SDK 9](https://dotnet.microsoft.com/download/dotnet/9.0).
- [Node.js 20](https://nodejs.org/) trở lên và npm.
- Microsoft SQL Server 2019 trở lên, SQL Server Express hoặc SQL Server LocalDB.

Kiểm tra phiên bản:

```powershell
dotnet --version
node --version
npm --version
```

## Cấu hình database

Connection string mặc định nằm trong `Backend/appsettings.json`:

```text
Server=.;Database=homestay_dorm;Trusted_Connection=True;TrustServerCertificate=True
```

Cấu hình trên sử dụng SQL Server mặc định trên máy Windows. Có thể thay đổi trực tiếp trong `Backend/appsettings.json` hoặc đặt biến môi trường trước khi chạy backend.

Ví dụ dùng SQL Server LocalDB trong PowerShell:

```powershell
$env:ConnectionStrings__DefaultConnection='Server=(localdb)\MSSQLLocalDB;Database=homestay_dorm;Trusted_Connection=True;TrustServerCertificate=True'
```

Ví dụ dùng SQL Server Express:

```powershell
$env:ConnectionStrings__DefaultConnection='Server=.\SQLEXPRESS;Database=homestay_dorm;Trusted_Connection=True;TrustServerCertificate=True'
```

Khi backend khởi động, ứng dụng tự động:

1. Áp dụng EF Core migrations.
2. Tạo database `homestay_dorm` nếu chưa tồn tại.
3. Nạp dữ liệu demo bằng `DbSeeder`.

> **Lưu ý:** cấu hình Development hiện đặt `Database:ResetOnStartup` bằng `true`. Vì vậy database sẽ bị xóa và tạo lại mỗi lần chạy backend. Đây là chế độ phục vụ demo.

Muốn giữ dữ liệu giữa các lần chạy, đặt biến môi trường sau trong terminal chạy backend:

```powershell
$env:Database__ResetOnStartup='false'
```

Không cần import thủ công file `homestay_dorm.sql` để chạy ứng dụng.

## Cách chạy ứng dụng

Ứng dụng cần hai terminal: một terminal chạy Backend và một terminal chạy Frontend.

### 0. Cài đặt sau khi giải nén source

Gói source không chứa `Frontend/node_modules`, `Frontend/dist`, `Backend/bin` và `Backend/obj`. Sau khi giải nén, cần khôi phục dependency trước khi chạy.

Khôi phục package Backend:

```powershell
cd D:\Hoccode\PTTKHTTT\Backend
dotnet restore
```

Cài package Frontend:

```powershell
cd D:\Hoccode\PTTKHTTT\Frontend
npm install
```

Chỉ cần thực hiện lại `npm install` khi mới giải nén source hoặc khi `package.json`/`package-lock.json` thay đổi. `dotnet restore` cũng sẽ được `dotnet run` và `dotnet build` tự động thực hiện nếu package chưa có.

### 1. Chạy Backend

Mở PowerShell tại thư mục project:

```powershell
cd D:\Hoccode\PTTKHTTT\Backend
dotnet restore
dotnet run --launch-profile http
```

Backend chạy tại:

```text
http://localhost:5157
```

OpenAPI ở môi trường Development:

```text
http://localhost:5157/openapi/v1.json
```

### 2. Chạy Frontend

Mở terminal PowerShell thứ hai:

```powershell
cd D:\Hoccode\PTTKHTTT\Frontend
npm install
npm run dev -- --port 5173
```

Mở trình duyệt tại:

```text
http://localhost:5173/login
```

Frontend mặc định gọi API tại `http://localhost:5157/api`.

Nếu cần thay đổi địa chỉ API, tạo file `Frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5157/api
```

Nếu port `5173` đang được sử dụng, có thể chạy frontend bằng port `5174`:

```powershell
npm run dev -- --port 5174
```

Backend hiện chấp nhận frontend từ cả `http://localhost:5173` và `http://localhost:5174`.

## Tài khoản demo

Database seeder tạo sẵn các tài khoản sau:

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Quản trị hệ thống | `admin` | `Admin@123` |
| Quản lý | `manager` | `Demo@123` |
| Sale | `sales` | `Demo@123` |
| Sale chi nhánh Thủ Đức | `sales.td` | `Demo@123` |
| Kế toán | `accountant` | `Demo@123` |
| Khách hàng 1 | `customer1` | `Demo@123` |
| Khách hàng 2 | `customer2` | `Demo@123` |
| Khách hàng 3 | `customer3` | `Demo@123` |

## Build kiểm tra trước khi nộp

Backend:

```powershell
cd D:\Hoccode\PTTKHTTT
dotnet build Backend\Backend.csproj
```

Frontend:

```powershell
cd D:\Hoccode\PTTKHTTT\Frontend
npm run build
```

Nếu backend đang chạy và Windows báo `Backend.exe` đang bị khóa, hãy dừng tiến trình backend rồi build lại, hoặc build sang thư mục tạm:

```powershell
dotnet build D:\Hoccode\PTTKHTTT\Backend\Backend.csproj -o "$env:TEMP\PTTKHTTT-backend-build"
```

## Một số lỗi thường gặp

### Không kết nối được database

- Kiểm tra SQL Server service đã chạy.
- Kiểm tra đúng tên server trong connection string.
- Kiểm tra tài khoản Windows có quyền tạo database.

### Frontend đăng nhập thất bại hoặc request có kích thước 0 B

- Kiểm tra backend đang chạy tại port `5157`.
- Mở `http://localhost:5157/openapi/v1.json` để xác nhận API hoạt động.
- Kiểm tra `VITE_API_URL` phải kết thúc bằng `/api`.
- Khởi động lại backend sau khi pull code hoặc thay đổi DTO/API.

### Frontend tự chuyển về trang đăng nhập

JWT có thời hạn mặc định 120 phút. Khi token hết hạn, đăng nhập lại bằng tài khoản demo.

### Dữ liệu vừa nhập bị mất sau khi chạy lại backend

Đây là hành vi của `Database:ResetOnStartup=true`. Đặt `Database__ResetOnStartup=false` nếu muốn giữ dữ liệu.

## Ghi chú phát triển

- Không sửa trạng thái trực tiếp trong database khi demo; nên thực hiện qua đúng màn hình của từng tác nhân để giữ luồng nghiệp vụ nhất quán.
- Sau khi thay đổi DTO hoặc API backend, cần khởi động lại backend đang chạy.
- Notification chỉ thông báo công việc; trạng thái nghiệp vụ phải được cập nhật thành công trước khi tạo thông báo.
- Các route được bảo vệ theo vai trò bằng JWT ở backend và điều hướng theo vai trò ở frontend.
