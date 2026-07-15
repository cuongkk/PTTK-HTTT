# Quy tắc thiết kế sơ đồ 3 lớp

Tài liệu này quy định cách thiết kế sơ đồ 3 lớp cho từng màn hình của hệ thống HomeStay Dorm. Mục tiêu là tạo sơ đồ tối giản, dễ đọc, thống nhất và có thể chỉnh sửa bằng draw.io.

## 1. Cấu trúc bắt buộc

Mỗi màn hình được thiết kế theo ba lớp từ trên xuống dưới:

```text
MH<TenChucNang>
       ↓
<DoiTuongNghiepVu>
       ↓
<DoiTuongNghiepVu>DB
```

Ví dụ:

```text
MHDangKyThue
       ↓
HoSoDangKyThue
       ↓
HoSoDangKyThueDB
```

Không ghi thêm các tiêu đề như:

- `TẦNG GIAO DIỆN (GUI)`
- `TẦNG NGHIỆP VỤ (BUS)`
- `TẦNG DỮ LIỆU (DAO)`
- `THIẾT KẾ KIẾN TRÚC 3 LỚP...`

Không ghi nội dung trên đường nối như `gửi dữ liệu`, `xử lý nghiệp vụ` hoặc `đọc/ghi dữ liệu`.

## 2. Quy tắc đặt tên

- Tên lớp và thuộc tính dùng tiếng Việt không dấu, viết PascalCase.
- Tên phương thức dùng tiếng Việt không dấu, bắt đầu bằng động từ.
- Lớp màn hình có tiền tố `MH`.
- Lớp nghiệp vụ không thêm hậu tố `BUS`.
- Lớp dữ liệu thêm hậu tố `DB`.
- Không dùng hậu tố `DAO`.

Ví dụ đúng:

```text
MHDangKyThue
HoSoDangKyThue
HoSoDangKyThueDB
```

Ví dụ không dùng:

```text
RentalRegistration
HoSoDangKyThueBUS
HoSoDangKyThueDAO
```

## 3. Lớp màn hình

Lớp màn hình mô tả các control người dùng trực tiếp nhìn thấy hoặc thao tác.

### 3.1. Tiền tố control

| Control | Cách đặt tên | Ví dụ |
|---|---|---|
| TextBox | `txt<ThuocTinh>` | `txtSoNguoiDuKienO : TextBox` |
| ComboBox | `cbo<ThuocTinh>` | `cboGioiTinh : ComboBox` |
| DateTimePicker | `dtp<ThuocTinh>` | `dtpNgayDuKienVao : DateTimePicker` |
| CheckBox | `chk<ThuocTinh>` | `chkCanDieuHoa : CheckBox` |
| TextArea | `txt<ThuocTinh>` | `txtYeuCauKhac : TextArea` |
| Button | `btn<ThaoTac>` | `btnDangKyThue : Button` |
| DataGridView | `dgv<NoiDung>` | `dgvDanhSachHoaDon : DataGridView` |
| Label chỉ hiển thị | `lbl<ThuocTinh>` | `lblTrangThai : Label` |

### 3.2. Quy tắc dùng Label

Nếu một nhãn chỉ mô tả cho TextBox, ComboBox, DateTimePicker hoặc control nhập liệu khác thì không liệt kê nhãn đó.

Ví dụ chỉ ghi:

```text
- txtSoNguoiDuKienO : TextBox
```

Không ghi đồng thời:

```text
- lblSoNguoiDuKienO : Label
- txtSoNguoiDuKienO : TextBox
```

Chỉ ghi `lbl... : Label` khi đó là dữ liệu chỉ hiển thị và không có control nhập tương ứng, ví dụ:

```text
- lblMaHoSo : Label
- lblTrangThai : Label
- lblThongBaoKetQua : Label
```

### 3.3. Phương thức màn hình

Chỉ liệt kê các sự kiện hoặc thao tác chính:

```text
+ HienThi()
+ btnDangKyThue_Click()
+ btnQuayLai_Click()
```

Không đưa các hàm kỹ thuật của framework vào sơ đồ.

## 4. Lớp nghiệp vụ

Lớp nghiệp vụ biểu diễn đối tượng chính mà màn hình xử lý. Lớp này gồm hai phần:

1. Các trường dữ liệu nhận từ màn hình hoặc đọc từ cơ sở dữ liệu.
2. Các phương thức kiểm tra và xử lý nghiệp vụ.

### 4.1. Thuộc tính

Thuộc tính phải cover đủ:

- Dữ liệu người dùng nhập trên màn hình.
- Mã định danh cần dùng trong xử lý.
- Trạng thái nghiệp vụ.
- Dữ liệu hệ thống sinh ra và trả về màn hình.

Ví dụ:

```text
HoSoDangKyThue

- MaHoSo : String
- MaKhachHang : String
- SoNguoiDuKienO : Integer
- GioiTinh : String
- KhuVucMongMuon : String
- HinhThucThue : String
- MucGiaToiThieu : Decimal
- MucGiaToiDa : Decimal
- NgayDuKienVao : Date
- ThoiHanThue : Integer
- TrangThai : String
- NgayTao : DateTime
```

Không thêm trường không được màn hình, nghiệp vụ hoặc cơ sở dữ liệu sử dụng.

### 4.2. Phương thức

Phương thức phải thể hiện quy tắc hoặc thao tác nghiệp vụ, không mô tả thao tác giao diện.

Ví dụ:

```text
+ KiemTraThongTin(hoSo : HoSoDangKyThue) : Boolean
+ TaoHoSoDangKy(maTaiKhoan : String, hoSo : HoSoDangKyThue) : String
+ GanNhanVienSale(maHoSo : String) : Boolean
```

Tham số và kiểu trả về phải được ghi rõ.

## 5. Lớp dữ liệu

Lớp dữ liệu có tên bằng tên đối tượng nghiệp vụ cộng hậu tố `DB`:

```text
HoSoDangKyThueDB
```

Lớp này chỉ chứa các phương thức đọc, thêm, cập nhật hoặc xóa dữ liệu. Không đặt quy tắc nghiệp vụ trong lớp DB.

Ví dụ:

```text
+ DocKhachHang(maTaiKhoan : String) : KhachHang
+ ThemHoSoDangKy(hoSo : HoSoDangKyThue) : Boolean
+ ThemNguoiDungTen(thanhVien : ThanhVienThue) : Boolean
+ ThemThongBaoSale(thongBao : ThongBao) : Boolean
```

Khi thêm hoặc cập nhật đối tượng chính, lớp DB nhận trực tiếp đối tượng nghiệp vụ làm tham số.

## 6. Quan hệ giữa các lớp

Chỉ vẽ các quan hệ thật sự cần thiết:

```text
Màn hình → Lớp nghiệp vụ → Lớp DB
```

Quy tắc trình bày:

- Sắp xếp theo chiều dọc.
- Mỗi lớp nằm trong một khối UML có tên, thuộc tính và phương thức.
- Đường nối không cần nhãn.
- Không thêm Controller, Service, DTO, API Client hoặc framework class vào sơ đồ tối giản.
- Chỉ tách thêm lớp nghiệp vụ hoặc lớp DB khi màn hình thật sự làm việc với nhiều đối tượng độc lập.

## 7. Quy tắc màu và định dạng draw.io

- Lớp màn hình: nền xanh nhạt.
- Lớp nghiệp vụ: nền vàng nhạt.
- Lớp dữ liệu: nền cam nhạt.
- Font đề xuất: Times New Roman.
- Tên lớp căn giữa và in đậm.
- Thuộc tính và phương thức căn trái.
- Không dùng bóng đổ hoặc trang trí không cần thiết.
- File đầu ra có định dạng `.drawio` và phải chỉnh sửa được từng khối.

## 8. Mẫu áp dụng cho màn hình mới

```text
MH<TenChucNang>

- txt<ThuocTinh> : TextBox
- cbo<ThuocTinh> : ComboBox
- dtp<ThuocTinh> : DateTimePicker
- chk<ThuocTinh> : CheckBox
- lbl<DuLieuChiHienThi> : Label
- btn<ThaoTac> : Button

+ HienThi()
+ btn<ThaoTac>_Click()


<DoiTuongNghiepVu>

- MaDoiTuong : String
- <ThuocTinhNghiepVu> : <KieuDuLieu>
- TrangThai : String

+ KiemTraThongTin(doiTuong : <DoiTuongNghiepVu>) : Boolean
+ XuLy(doiTuong : <DoiTuongNghiepVu>) : <KieuTraVe>


<DoiTuongNghiepVu>DB

+ DocThongTin(maDoiTuong : String) : <DoiTuongNghiepVu>
+ Them(doiTuong : <DoiTuongNghiepVu>) : Boolean
+ CapNhat(doiTuong : <DoiTuongNghiepVu>) : Boolean
```

## 9. Checklist trước khi hoàn thành

- [ ] Tên lớp và thuộc tính dùng tiếng Việt không dấu.
- [ ] Lớp màn hình có tiền tố `MH`.
- [ ] Lớp nghiệp vụ không có hậu tố `BUS`.
- [ ] Lớp dữ liệu có hậu tố `DB`, không dùng `DAO`.
- [ ] Không liệt kê Label đi kèm control nhập liệu.
- [ ] Label chỉ dùng cho dữ liệu chỉ hiển thị.
- [ ] Lớp nghiệp vụ có đủ dữ liệu nhận vào và trả ra.
- [ ] Phương thức có tham số và kiểu trả về rõ ràng.
- [ ] Lớp DB chỉ chứa thao tác dữ liệu.
- [ ] Không có tiêu đề tầng, tiêu đề sơ đồ hoặc nhãn trên đường nối.
- [ ] Sơ đồ được bố trí theo chiều dọc và tối giản.
- [ ] File `.drawio` mở được và chỉnh sửa được từng thành phần.

## 10. Quy tắc rà soát thừa

- Mỗi màn hình có thể sử dụng nhiều lớp nghiệp vụ khi chức năng thật sự phải đọc hoặc ghi nhiều đối tượng.
- Mỗi lớp `DB` bắt buộc phải có đúng một lớp nghiệp vụ tương ứng ở phía trên.
- Không nối lớp màn hình trực tiếp xuống lớp `DB`.
- Không tạo một lớp nghiệp vụ tổng hợp chỉ để nối trực tiếp xuống nhiều lớp `DB` không tương ứng.
- Mỗi bảng hoặc entity được đọc/ghi phải có một cặp `LopNghiepVu → LopNghiepVuDB`. Không gom phương thức truy cập nhiều bảng khác nhau vào một lớp `DB`.
- Không đưa `Controller`, `Service`, `AppDbContext`, `Entity`, `API` vào sơ đồ 3 lớp tối giản.
- Mã dùng để truy vết khi đi giữa các màn hình phải ghi rõ trong tham số: `maHoSo`, `maLich`, `maPhong`, `maGiuong`; không truyền cả đối tượng.
- Màn hiển thông tin chỉ cần `HienThi(ma...)`; màn có cập nhật trạng thái mới có thêm phương thức `CapNhat...`.

## 11. Xác định dữ liệu trước khi vẽ

Trước khi tạo sơ đồ phải đọc giao diện, luồng nghiệp vụ và các bảng dữ liệu thật. Xác định lần lượt bốn nhóm sau:

1. **Dữ liệu đầu vào**
   - Mã nhận từ route, phiên đăng nhập hoặc màn hình trước.
   - Các giá trị người dùng nhập, chọn hoặc xác nhận trên giao diện.
2. **Dữ liệu cần hiển thị**
   - Chỉ liệt kê control và `lbl...` thật sự xuất hiện trên màn hình.
   - Dữ liệu kết quả do hệ thống sinh ra phải có thuộc tính nghiệp vụ và control hiển thị tương ứng.
3. **Dữ liệu cần lấy ra để thực hiện chức năng**
   - Xác định rõ từng bảng cần đọc và mỗi phương thức `Doc...` tương ứng.
   - Không thêm thao tác đọc chỉ vì dữ liệu có trong CSDL; chỉ thêm khi luồng hiện tại thật sự sử dụng.
4. **Dữ liệu cần lưu xuống CSDL**
   - Xác định từng bảng được thêm, cập nhật hoặc xóa.
   - Lớp nghiệp vụ phải có đủ các thuộc tính được lưu.
   - Mỗi lớp `DB` chỉ chứa phương thức truy cập bảng tương ứng.

Không suy diễn dữ liệu từ tên màn hình. Nếu giao diện không hiển thị, backend không đọc hoặc không ghi trường đó thì không đưa vào sơ đồ.

## 12. Quy tắc đường nối draw.io

- Dùng connector UML **Aggregation 2** để nối các khối.
- Đầu hình thoi rỗng đặt ở phía lớp sử dụng lớp còn lại.
- Nối lớp màn hình với từng lớp nghiệp vụ mà màn hình sử dụng.
- Nối mỗi lớp nghiệp vụ với đúng một lớp `DB` cùng đối tượng.
- Không nối một lớp nghiệp vụ xuống nhiều lớp `DB` của các đối tượng khác nhau.
- Không ghi nhãn trên đường nối.
- Kiểu draw.io tương ứng: `startArrow=diamondThin;startFill=0;endArrow=none`.

## 13. Dữ liệu phiên đăng nhập và dữ liệu truyền giữa màn hình

- `MaTaiKhoan` và `MaKhachHang` đã có trong phiên đăng nhập không phải là control của màn hình.
- Không ghi `maTaiKhoan` hoặc `maKhachHang` vào tham số `HienThi(...)` nếu người dùng không truyền các mã này qua route.
- Màn hình đầu của luồng có thể dùng `TaiKhoan → TaiKhoanDB` để xác định khách hàng hiện tại.
- Màn hình con được mở từ màn hình trước phải nhận mã định danh cụ thể như `maLich`, `maHoSo`, `maPhong` hoặc `maHopDong`.
- Không vẽ lại chuỗi `TaiKhoan → TaiKhoanDB` trong mọi màn hình con chỉ để lấy lại thông tin đã có trong phiên.
- Việc kiểm tra dữ liệu có thuộc người dùng hiện tại hay không được biểu diễn bằng phương thức nghiệp vụ như `KiemTraThuocKhachHang(...)`, không cần thêm control tài khoản trên giao diện.
- Khi điều hướng chỉ truyền các mã mà màn đích cần. Không truyền tên hiển thị hoặc toàn bộ đối tượng.

## 14. Tách màn hình theo trạng thái nghiệp vụ

- Hai giao diện dùng chung component hoặc route vẫn phải tách thành hai sơ đồ nếu chúng phục vụ hai chức năng nghiệp vụ khác nhau.
- Mỗi sơ đồ chỉ chứa control, dữ liệu và thao tác ứng với trạng thái của màn đó.
- Ví dụ: trạng thái `sap_den` thuộc màn Xem lịch; trạng thái `dang_xem` và `hoan_thanh` thuộc màn Xem nội quy, giá thuê.

## 15. Đặt tên lớp cho bảng liên kết

- Có thể dùng tên nghiệp vụ dễ hiểu thay cho tên bảng vật lý khó đọc.
- Ví dụ: bảng `lich_xem_phong_phong` được biểu diễn bằng `PhongTrongLichXem` và `PhongTrongLichXemDB`.
- Tên lớp nghiệp vụ và lớp `DB` phải thống nhất với nhau.
