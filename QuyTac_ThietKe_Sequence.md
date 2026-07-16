# Quy tắc thiết kế sơ đồ Sequence

## 1. Mục đích

Quy tắc này dùng để thiết kế sơ đồ sequence cho từng chức năng của hệ thống dựa trên giao diện, lớp nghiệp vụ, lớp dữ liệu và code xử lý thực tế.

Sơ đồ phải thể hiện đúng thứ tự tương tác theo thời gian, đúng đối tượng tham gia và đúng phương thức đã có căn cứ từ sơ đồ 3 lớp, đặc tả hoặc code.

## 2. Mô hình BCE

Sơ đồ sử dụng ba loại đối tượng theo mô hình BCE:

| Thành phần | Ký hiệu | Mục đích |
|---|---|---|
| Giao diện | `Boundary Object` | Nhận thao tác từ Actor và hiển thị kết quả |
| Nghiệp vụ | `Control Object` | Kiểm tra điều kiện và điều phối nghiệp vụ |
| Dữ liệu | `Entity Object` | Đại diện lớp DB thực hiện đọc hoặc ghi dữ liệu |

Không dùng một kiểu participant chung cho cả ba nhóm.

## 3. Thứ tự các đối tượng

Các lifeline phải được xếp từ trái sang phải theo thứ tự:

```text
Actor → Boundary → các Control → các Entity DB
```

Ví dụ:

```text
KhachHang
    → MHDangKyThue
        → TaiKhoan
        → KhachHang
        → HoSoDangKy
        → TaiKhoanDB
        → KhachHangDB
        → HoSoDangKyDB
```

Không xếp xen kẽ một lớp nghiệp vụ với lớp DB tương ứng.

Ví dụ không dùng:

```text
Boundary → TaiKhoan → TaiKhoanDB → KhachHang → KhachHangDB
```

## 4. Actor

- Actor đặt ngoài cùng bên trái.
- Tên Actor thể hiện đúng vai trò đang thao tác, ví dụ `Khách hàng`, `Sale`, `Quản lý`, `Kế toán`.
- Actor chỉ gửi thao tác đến Boundary hoặc nhận kết quả hiển thị từ Boundary.
- Actor không gọi trực tiếp Control hoặc Entity DB.

## 5. Boundary Object

- Mỗi màn hình UI được biểu diễn bằng một `Boundary Object`.
- Tên Boundary sử dụng đúng tên lớp màn hình có tiền tố `MH`.
- Boundary nhận sự kiện click, dữ liệu nhập và yêu cầu điều hướng từ Actor.
- Boundary gọi các Control để xử lý nghiệp vụ.
- Boundary không gọi trực tiếp Entity DB.

Ví dụ:

```text
MHDangKyThue
MHYeuCauHoanCoc
MHXacNhanDoiSoat
```

## 6. Control Object

- Các lớp nghiệp vụ được biểu diễn bằng `Control Object`.
- Tên Control dùng tên entity nghiệp vụ bằng tiếng Việt không dấu, PascalCase.
- Không thêm hậu tố `BUS`, `Service` hoặc `Controller` vào tên hiển thị nếu sơ đồ 3 lớp không sử dụng các hậu tố đó.
- Control chịu trách nhiệm kiểm tra điều kiện, tạo entity, cập nhật trạng thái và điều phối việc đọc hoặc ghi DB.
- Chỉ đưa Control vào sơ đồ khi chức năng thực sự sử dụng entity đó.

Ví dụ:

```text
HoSoDangKy
PhieuDatCoc
HopDongThue
ThongBao
```

## 7. Entity Object

- Các lớp dữ liệu được biểu diễn bằng `Entity Object`.
- Tên Entity Object là tên entity cộng hậu tố `DB`.
- Không dùng hậu tố `DAO`.
- Entity DB chỉ nhận lời gọi đọc, thêm, cập nhật hoặc xóa dữ liệu từ Control.
- Không tạo Entity DB theo tên button hoặc thao tác nếu CSDL không có entity tương ứng.

Ví dụ đúng:

```text
HoSoDangKyDB
PhieuDatCocDB
ThongBaoDB
```

Ví dụ không đúng nếu không có bảng tương ứng:

```text
DangKyThueDB
YeuCauHoanCocDB
XacNhanXemPhongDB
```

## 8. Message

### 8.1. Lời gọi xử lý

- Dùng đường liền và đầu mũi tên đặc cho lời gọi đồng bộ.
- Tên message phải là sự kiện hoặc phương thức có thật.
- Ghi rõ tham số quan trọng.
- Có thể đánh số message theo thứ tự thực hiện.

Ví dụ:

```text
1. Click Đăng ký thuê
2. KiemTraThongTin(hoSo)
3. TaoMoi(maKhachHang, hoSo)
4. Them(hoSo)
```

### 8.2. Dữ liệu trả về

- Dùng đường nét đứt và đầu mũi tên rỗng cho return message.
- Nội dung return là dữ liệu hoặc kết quả được trả về.
- Không cần đánh số return message nếu việc đánh số làm sơ đồ khó đọc.

Ví dụ:

```text
true
maKhachHang
hoSoDaTao
taiKhoanSale
```

### 8.3. Thông báo cho Actor

Boundary trả kết quả cho Actor bằng nội dung giao diện nhìn thấy.

Ví dụ:

```text
HienThiKetQua(maHoSo)
Hiển thị thông báo thông tin không hợp lệ
```

Không dùng tên kỹ thuật của API làm nội dung hiển thị cho Actor.

## 9. Activation

- Dùng activation bar để biểu diễn khoảng thời gian một đối tượng đang xử lý.
- Boundary được kích hoạt từ khi nhận thao tác của Actor đến khi hiển thị kết quả.
- Control được kích hoạt trong khoảng thời gian kiểm tra hoặc điều phối nghiệp vụ.
- Entity DB bắt buộc có activation bar trong khoảng thời gian thực hiện mỗi thao tác đọc, thêm, cập nhật hoặc xóa dữ liệu.
- Mỗi lời gọi từ Control đến Entity DB sử dụng một activation bar ngắn riêng, bắt đầu khi DB nhận message và kết thúc khi DB trả kết quả.
- Boundary, Control và Entity DB đều phải có activation bar khi đang trực tiếp xử lý; không chỉ vẽ activation cho màn hình và lớp nghiệp vụ.
- Không kéo activation qua các đoạn mà đối tượng không tham gia xử lý.

## 10. Combined Fragment

### 10.1. `alt`

Dùng `alt` khi luồng có từ hai kết quả loại trừ nhau.

Mỗi nhánh phải có guard condition đặt trong dấu ngoặc vuông:

```text
[Thông tin hợp lệ]
[Thông tin không hợp lệ]
```

Nhánh không hợp lệ phải kết thúc trước các thao tác ghi DB nếu nghiệp vụ không cho phép tiếp tục.

Ví dụ:

```text
alt
    [Thông tin hợp lệ]
        Tạo hồ sơ
        Ghi thành viên thuê
        Tạo thông báo
    --------------------------------
    [Thông tin không hợp lệ]
        Hiển thị thông báo lỗi
```

Không tạo nhánh `alt` chỉ để mô tả hai câu thông báo khác nhau nếu luồng xử lý không thay đổi.

### 10.2. `opt`

Dùng `opt` cho một bước chỉ thực hiện khi có điều kiện và không có nhánh đối lập cần mô tả.

Ví dụ:

```text
opt [Có khoản phát sinh phải thanh toán]
    Hiển thị mã QR
    Xác nhận thanh toán
```

### 10.3. `loop`

Dùng `loop` khi một thao tác lặp theo danh sách hoặc số lượng.

Ví dụ:

```text
loop [Mỗi thành viên thuê]
    TaoThanhVien(thongTinThanhVien)
    Them(thanhVien)
```

Không dùng `loop` cho một truy vấn đơn hoặc một lần cập nhật trạng thái.

## 11. Quan hệ với sơ đồ 3 lớp

Trước khi vẽ sequence phải đọc sơ đồ 3 lớp của chức năng.

- Lớp `MH` trong sơ đồ 3 lớp trở thành Boundary.
- Lớp nghiệp vụ trở thành Control.
- Lớp có hậu tố `DB` trở thành Entity Object.
- Phương thức trên message phải lấy từ các lớp tương ứng hoặc từ code thật.
- Không tự thêm participant không có trong sơ đồ 3 lớp hoặc code mà không có giải thích.

Nếu code và sơ đồ 3 lớp không thống nhất, phải kiểm tra code hiện tại và cập nhật thiết kế trước khi vẽ sequence.

## 12. Quy trình thiết kế

1. Xác định Actor thực hiện chức năng.
2. Đọc màn hình UI và xác định sự kiện bắt đầu.
3. Đọc sơ đồ 3 lớp liên quan.
4. Đọc controller, service và truy vấn dữ liệu thực tế.
5. Liệt kê Boundary, Control và Entity DB tham gia.
6. Xếp participant theo thứ tự Actor → Boundary → Control → Entity DB.
7. Vẽ message theo đúng thứ tự xử lý.
8. Bổ sung return message cho dữ liệu quan trọng.
9. Thêm activation bar.
10. Thêm `alt`, `opt` hoặc `loop` nếu luồng thực sự cần.
11. Kiểm tra nhánh lỗi không tiếp tục ghi DB.
12. Xuất file `.drawio` có thể chỉnh sửa từng thành phần.

## 13. Quy tắc trình bày Draw.io

- Actor dùng ký hiệu UML Actor.
- Giao diện dùng ký hiệu UML Boundary.
- Nghiệp vụ dùng ký hiệu UML Control.
- DB dùng ký hiệu UML Entity.
- Lifeline là đường thẳng đứng nét đứt.
- Activation là hình chữ nhật hẹp đặt trên lifeline.
- Message đồng bộ là đường liền, đầu mũi tên đặc.
- Return message là đường nét đứt, đầu mũi tên rỗng.
- Font sử dụng Times New Roman.
- Message được bố trí từ trên xuống dưới theo thời gian.
- Hạn chế đường chéo và đường cắt nhau.
- Không đặt tiêu đề tầng trong sequence.
- Không gộp nhiều phương thức khác nhau vào một message.

## 14. Checklist

- [ ] Actor đúng với vai trò thực hiện chức năng.
- [ ] Giao diện dùng Boundary Object.
- [ ] Nghiệp vụ dùng Control Object.
- [ ] DB dùng Entity Object.
- [ ] Participant được xếp Actor → Boundary → Control → Entity DB.
- [ ] Actor không gọi trực tiếp Control hoặc DB.
- [ ] Boundary không gọi trực tiếp DB.
- [ ] Tên message có căn cứ từ UI, sơ đồ 3 lớp hoặc code.
- [ ] Lời gọi dùng đường liền và return dùng đường nét đứt.
- [ ] Activation bar phản ánh đúng thời gian xử lý.
- [ ] Mỗi lời gọi đọc hoặc ghi Entity DB đều có activation bar tương ứng.
- [ ] Nhánh `alt` có guard condition rõ ràng.
- [ ] Nhánh lỗi không thực hiện thao tác ghi DB.
- [ ] Không tạo Entity DB giả theo tên thao tác.
- [ ] Không dùng hậu tố `BUS` hoặc `DAO`.
- [ ] Font Times New Roman.
- [ ] File Draw.io mở được và chỉnh sửa được.
