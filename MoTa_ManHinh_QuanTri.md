# Mô tả màn hình Quản trị hệ thống

Actor **Quản trị hệ thống** có 7 màn hình riêng. Màn hình **Thông báo** là chức năng dùng chung nên không được tính trong danh sách này.

## 1. Tổng quan

Màn hình hiển thị số liệu tổng hợp được lấy trực tiếp từ cơ sở dữ liệu.

Thông tin chính:

- Tổng số tài khoản và số tài khoản đang hoạt động.
- Tổng số vai trò và quyền nghiệp vụ.
- Tổng số phòng, giường và số lượng còn trống.
- Tổng số dịch vụ và dịch vụ đang áp dụng.
- Các lối tắt để đi đến những chức năng quản trị khác.

## 2. Quản lý người dùng

Màn hình dùng để quản lý tài khoản của khách hàng và nhân viên.

Chức năng chính:

- Xem và tìm kiếm danh sách tài khoản.
- Xem thông tin chi tiết của người dùng.
- Tạo tài khoản khách hàng hoặc nhân viên.
- Cập nhật thông tin tài khoản.
- Gán vai trò và chi nhánh làm việc cho nhân viên.
- Khóa, kích hoạt hoặc vô hiệu hóa tài khoản.
- Đặt lại mật khẩu.

Hệ thống không cung cấp chức năng xóa tài khoản.

## 3. Phân quyền hệ thống

Màn hình dùng để thiết lập các quyền nghiệp vụ cho từng vai trò.

Chức năng chính:

- Hiển thị danh sách vai trò trong hệ thống.
- Hiển thị danh sách quyền nghiệp vụ.
- Xem số tài khoản đang thuộc mỗi vai trò.
- Chọn hoặc bỏ chọn quyền của từng vai trò.
- Lưu ma trận vai trò – quyền xuống cơ sở dữ liệu.

## 4. Cài đặt thông số hệ thống

Màn hình dùng để cấu hình các tham số áp dụng chung cho quy trình thuê phòng.

Thông số chính:

- Số tháng tiền thuê dùng để tính tiền cọc.
- Thời hạn thanh toán tiền cọc.
- Tỷ lệ hoàn cọc trước khi ký hợp đồng.
- Tỷ lệ hoàn cọc khi thuê dưới 6 tháng.
- Tỷ lệ hoàn cọc khi thuê trên 6 tháng.
- Tỷ lệ hoàn cọc khi khách trả phòng đúng hạn.

Quản trị viên có thể thay đổi và lưu lại các giá trị trên.

## 5. Quản lý phòng/giường

Màn hình dùng để duy trì danh mục phòng và giường của ký túc xá.

Chức năng chính:

- Xem và tìm kiếm danh sách phòng.
- Thêm, sửa hoặc ngừng sử dụng phòng.
- Cập nhật loại phòng, sức chứa, giá thuê và trạng thái phòng.
- Cập nhật khu vực, tầng, diện tích và điều kiện sử dụng phòng.
- Xem danh sách giường thuộc từng phòng.
- Thêm, sửa hoặc xóa giường khi chưa phát sinh ràng buộc nghiệp vụ.
- Cập nhật giá thuê và trạng thái của giường.

## 6. Quản lý dịch vụ

Màn hình dùng để quản lý danh mục dịch vụ của ký túc xá.

Chức năng chính:

- Xem và tìm kiếm danh sách dịch vụ.
- Thêm dịch vụ mới.
- Cập nhật tên, loại dịch vụ và đơn vị tính.
- Cập nhật đơn giá mặc định.
- Cập nhật mô tả và trạng thái hoạt động.
- Xóa dịch vụ khi chưa phát sinh ràng buộc dữ liệu.

## 7. Danh mục vận hành

Đây là một màn hình duy nhất, gồm 4 tab nghiệp vụ.

### 7.1. Nội quy

- Quản lý nội quy áp dụng theo từng chi nhánh.
- Cập nhật nội dung, loại nội quy và mức xử lý vi phạm.
- Cập nhật mức phạt, thời gian hiệu lực và trạng thái nội quy.

### 7.2. Tiện nghi

- Quản lý danh mục tiện nghi.
- Cập nhật tên, mô tả và trạng thái tiện nghi.
- Gán tiện nghi cho từng phòng.
- Cập nhật số lượng và ghi chú của tiện nghi trong phòng.

### 7.3. Ảnh phòng

- Thêm, sửa và xóa đường dẫn ảnh của phòng.
- Cập nhật mô tả và thứ tự hiển thị.
- Chọn một ảnh làm ảnh đại diện của phòng.

### 7.4. Giá dịch vụ áp dụng

- Thiết lập giá dịch vụ riêng cho một chi nhánh hoặc một phòng.
- Cập nhật trạng thái áp dụng của mức giá.
- Khi hiển thị giá dịch vụ, hệ thống ưu tiên giá theo thứ tự: giá riêng của phòng, giá của chi nhánh, sau đó là giá mặc định của dịch vụ.

