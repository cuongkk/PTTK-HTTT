# Hướng dẫn phát triển song song cho Sale, Quản lý và Kế toán

## 1. Commit nền phải có trước khi tách branch

Ba nhánh phải được tạo từ cùng commit nền chứa schema, migration, seed, đăng nhập, phân quyền, thông báo và chức năng Khách hàng hiện tại.

Tài khoản demo dùng mật khẩu `Demo@123`: `sales`, `manager`, `accountant`.

Mỗi lần Backend khởi động, database bị reset và seed lại. Không dựa vào dữ liệu nhập tay để kiểm thử.

## 2. Phạm vi sở hữu

| Actor | Frontend được sửa | Route riêng | Service Frontend | Backend nên tạo |
|---|---|---|---|---|
| Sale | `components/sales/` | `routes/salesRoutes.tsx` | `services/sales/` | `SalesController`, `SalesService`, DTO Sale |
| Quản lý | `components/manager/` | `routes/managerRoutes.tsx` | `services/manager/` | `ManagerController`, `ManagerService`, DTO Quản lý |
| Kế toán | `components/accountant/` | `routes/accountantRoutes.tsx` | `services/accountant/` | `AccountantController`, `AccountantService`, DTO Kế toán |

## 3. Prefix API bắt buộc

- Sale: `/api/sales/*`
- Quản lý: `/api/manager/*`
- Kế toán: `/api/accountant/*`

Controller phải có `[Authorize(Roles = "sale")]`, `[Authorize(Roles = "quan_ly")]` hoặc `[Authorize(Roles = "ke_toan")]` tương ứng.

Component không gọi `fetch` trực tiếp. Mọi request đi qua file API trong `Frontend/src/app/services/<actor>/`.

## 4. File dùng chung không tự sửa trong PR actor

- `Frontend/src/app/routes.tsx`
- `Frontend/src/app/components/layouts/MainLayout.tsx`
- `Frontend/src/app/services/apiClient.ts`
- `Backend/Program.cs`
- `Backend/Data/AppDbContext.cs`
- `Backend/Data/DbSeeder.cs`
- migration đã có

Nếu cần dependency injection, seed hoặc thay schema, ghi rõ trong PR để người tích hợp thực hiện một commit chung. Không để ba PR cùng sửa các file trên.

## 5. Dữ liệu seed sẵn có

- Sale: `HS0000000004` trạng thái `moi`.
- Quản lý: `HS0000000005` trạng thái `cho_ra_soat_coc` với phòng `P_TD_102`.
- Kế toán: `DC0000000003` và `HDON00000004` chờ thanh toán/đối chiếu; `HDON00000003` chờ hoàn cọc.

## 6. Yêu cầu trước khi mở PR

1. Rebase lên commit nền mới nhất.
2. `dotnet build` thành công nếu có sửa Backend.
3. `npm run build` thành công nếu có sửa Frontend.
4. Không commit `bin/`, `obj/`, `dist/`, `.build-*` hoặc file cấu hình cá nhân.
5. PR chỉ chứa phạm vi một actor; ghi endpoint, màn hình và tài khoản đã kiểm thử.
