# Mô tả 5 màn hình đăng nhập và đăng ký

## 1. Đăng nhập

**Mục đích:** Cho phép người dùng đăng nhập vào hệ thống.

**Thông tin nhập:**

- Tên đăng nhập.
- Mật khẩu.

**Thao tác:**

- Đăng nhập.
- Đi đến Quên mật khẩu.
- Đi đến Đăng ký tài khoản.

**Kết quả:**

- Thông tin hợp lệ: chuyển đến trang phù hợp với vai trò người dùng.
- Thông tin không hợp lệ: hiển thị thông báo lỗi.

## 2. Đăng ký tài khoản

**Mục đích:** Cho phép khách hàng tạo tài khoản mới.

**Thông tin nhập:**

- Họ và tên.
- Số điện thoại.
- Email.
- Tên đăng nhập.
- Mật khẩu.
- Nhập lại mật khẩu.

**Thao tác:**

- Gửi đăng ký.
- Quay lại Đăng nhập.

**Kết quả:**

- Thông tin hợp lệ: tạo tài khoản ở trạng thái chờ xác thực và chuyển đến màn Xác thực OTP đăng ký.
- Thông tin không hợp lệ hoặc bị trùng: hiển thị thông báo lỗi.

## 3. Xác thực OTP đăng ký

**Mục đích:** Xác thực email trước khi kích hoạt tài khoản khách hàng.

**Thông tin hiển thị:**

- Email đã được che một phần.
- Thời hạn sử dụng OTP.
- Mã OTP demo trong môi trường phát triển.

**Thông tin nhập:**

- Mã OTP gồm 6 chữ số.

**Thao tác:**

- Xác nhận đăng ký.
- Gửi lại mã OTP.

**Kết quả:**

- OTP hợp lệ: chuyển trạng thái tài khoản từ `cho_xac_thuc` thành `kich_hoat`.
- OTP sai hoặc hết hạn: hiển thị lỗi và cho phép gửi lại mã.

## 4. Quên mật khẩu

**Mục đích:** Cho phép người dùng yêu cầu đặt lại mật khẩu.

**Thông tin nhập:**

- Email đã xác thực của tài khoản.

**Thao tác:**

- Gửi mã xác thực.
- Quay lại Đăng nhập.

**Kết quả:**

- Email tồn tại và tài khoản đang hoạt động: tạo OTP, liên kết đặt lại mật khẩu và chuyển đến màn Đặt lại mật khẩu.
- Email không tồn tại hoặc tài khoản không hoạt động: hiển thị thông báo lỗi.

## 5. Đặt lại mật khẩu

**Mục đích:** Cho phép người dùng tạo mật khẩu mới sau khi xác thực yêu cầu quên mật khẩu.

**Thông tin hiển thị:**

- Email đã được che một phần.
- Mã OTP demo hoặc liên kết đặt lại mật khẩu trong môi trường phát triển.

**Thông tin nhập:**

- Mã OTP gồm 6 chữ số.
- Mật khẩu mới.
- Nhập lại mật khẩu mới.

**Thao tác:**

- Đặt lại mật khẩu.
- Gửi lại mã OTP.

**Kết quả:**

- Thông tin hợp lệ: cập nhật mật khẩu, xóa OTP và chuyển người dùng về Đăng nhập.
- OTP sai, hết hạn hoặc mật khẩu không hợp lệ: hiển thị thông báo lỗi.

## Luồng chuyển màn hình

```text
Đăng nhập
├── Đăng ký tài khoản → Xác thực OTP đăng ký → Đăng nhập
└── Quên mật khẩu → Đặt lại mật khẩu → Đăng nhập
```
