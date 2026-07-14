# HomeStay Dorm

HomeStay Dorm là hệ thống hỗ trợ quản lý lưu trú dài hạn theo hai hình thức: thuê nguyên phòng và thuê giường ở ghép. Hệ thống kết nối bốn nhóm người dùng chính gồm Khách hàng, Nhân viên kinh doanh (Sale), Quản lý và Kế toán; Quản trị hệ thống quản lý tài khoản, thông số, phòng/giường và dịch vụ.

Repository triển khai theo kiến trúc client/server:

```text
Backend/   ASP.NET Core Web API, EF Core, SQL Server LocalDB, JWT
Frontend/  React, TypeScript, Vite, React Router
```

## Tình trạng hiện tại

- Backend đã có API đăng nhập và nhóm chức năng Quản trị hệ thống.
- Frontend đã kết nối API thật cho đăng nhập, người dùng, thông số, phòng/giường và dịch vụ.
- Các màn hình Khách hàng, Sale, Quản lý và Kế toán đã có giao diện mẫu nhưng một phần vẫn dùng mock data hoặc `localStorage`.
- Bốn UC nghiệp vụ bên dưới là phạm vi cần tiếp tục cài đặt và kết nối API/database.

## Yêu cầu môi trường

- Windows 10/11.
- .NET SDK 10.
- Node.js 20 trở lên và npm.
- SQL Server Express LocalDB (`MSSQLLocalDB`).

Kiểm tra LocalDB:

```cmd
sqllocaldb info
sqllocaldb info MSSQLLocalDB
```

Nếu instance chưa được tạo:

```cmd
sqllocaldb create MSSQLLocalDB
sqllocaldb start MSSQLLocalDB
```

## Chạy Backend

Connection string mặc định:

```text
Server=(localdb)\mssqllocaldb;Database=homestay_dorm;Trusted_Connection=True;TrustServerCertificate=True
```

Chạy API:

```cmd
cd /d D:\Hoccode\PTTKHTTT\Backend
dotnet restore
dotnet run
```

Backend chạy tại `http://localhost:5157`. Khi khởi động, EF Core tự động tạo/cập nhật database bằng migrations và chạy seeder. Không cần import file SQL thủ công.

## Chạy Frontend

Mở terminal thứ hai:

```cmd
cd /d D:\Hoccode\PTTKHTTT\Frontend
npm install
npm run dev
```

Mở `http://localhost:5173`. Frontend mặc định gọi API tại `http://localhost:5157/api`. Có thể thay đổi bằng biến môi trường `VITE_API_URL`.

## Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Quản trị hệ thống | `admin` | `Admin@123` |
| Quản lý | `manager` | `Demo@123` |
| Sale | `sales` | `Demo@123` |
| Kế toán | `accountant` | `Demo@123` |
| Sale chi nhánh Thủ Đức | `sales.td` | `Demo@123` |
| Khách hàng | `customer1` | `Demo@123` |

## Kiểm tra database

Kết nối bằng SQL Server Management Studio:

```text
Server name: (localdb)\MSSQLLocalDB
Authentication: Windows Authentication
Database: homestay_dorm
```

Hoặc dùng `sqlcmd`:

```cmd
sqlcmd -S "(localdb)\MSSQLLocalDB" -d homestay_dorm -E -Q "SELECT name FROM sys.tables"
```

# Phạm vi 4 UC nghiệp vụ và các UC hệ thống

Đặc tả riêng cho tác nhân Khách hàng và sơ đồ Mermaid được lưu tại [Tasks/DacTa_UC_HeThong_KhachHang.md](Tasks/DacTa_UC_HeThong_KhachHang.md).

Mỗi mục lớn dưới đây là một **UC nghiệp vụ** mô tả mục tiêu đầu-cuối của tổ chức. Các chức năng nhỏ bên trong là **UC hệ thống** mà từng tác nhân thực hiện trên phần mềm. Một UC nghiệp vụ có thể bắt đầu từ hoạt động tra cứu/tạo yêu cầu của khách, đi qua nhiều nhân viên và kết thúc khi trạng thái nghiệp vụ đã được cập nhật.

Các trường được đánh dấu **Bắt buộc** là dữ liệu được nhắc trực tiếp trong đề hoặc cần thiết để hoàn thành giao dịch. **Nên thêm** là dữ liệu giúp vận hành, truy vết và demo rõ ràng hơn.

## UC nghiệp vụ 01 - Đăng ký thuê và xem phòng

### Luồng nghiệp vụ chính

1. Khách hàng tra cứu danh sách phòng/giường để biết lựa chọn hiện có.
2. Khách xem chi tiết một phòng, so sánh và chọn phòng quan tâm; nếu chưa có tài khoản thì đăng ký hoặc để lại thông tin liên hệ.
3. Khách gửi nhu cầu thuê hoặc Sale nhập giúp khách tại quầy.
4. Sale tiếp nhận đăng ký, kiểm tra điều kiện và tra cứu lại trạng thái phòng/giường còn trống, chưa đặt cọc.
5. Sale đề xuất thêm các phòng phù hợp và tạo lịch xem phòng.
6. Khách nhận và xác nhận/đề nghị đổi lịch hẹn.
7. Sale ghi nhận kết quả sau buổi xem: quan tâm, muốn xem thêm, điều chỉnh tiêu chí hoặc chọn đặt cọc.

### UC hệ thống 01.1 - Tra cứu phòng/giường

**Tác nhân:** Khách hàng, khách vãng lai hoặc Sale.

**Bắt buộc:**

- Chi nhánh/khu vực muốn tìm.
- Hình thức thuê: nguyên phòng hoặc giường ở ghép.
- Ngày dự kiến vào ở.
- Số lượng người dự kiến ở.
- Chỉ hiển thị phòng/giường còn trống, chưa được giữ chỗ hoặc đặt cọc.

**Nên thêm:** khoảng giá, giới tính/khu dành cho nam/nữ, gửi xe, điều hòa, mức độ yên tĩnh, diện tích, sắp xếp theo giá và tình trạng có thể nhận phòng.

**Kết quả:** danh sách phòng/giường phù hợp; khách có thể mở chi tiết hoặc điều chỉnh bộ lọc khi không có kết quả.

### UC hệ thống 01.2 - Xem chi tiết và chọn phòng quan tâm

**Tác nhân:** Khách hàng, khách vãng lai hoặc Sale.

**Bắt buộc:** mã phòng/giường, chi nhánh, loại phòng, sức chứa, số chỗ còn trống, giá thuê, dịch vụ/chi phí điện nước, điều kiện giới tính và trạng thái hiện tại.

**Nên thêm:** hình ảnh, diện tích, tầng/khu, tiện nghi, nội quy, bản đồ, người đang ở đối với phòng ghép, ngày có thể nhận và nút lưu phòng yêu thích.

**Kết quả:** khách chọn một hoặc nhiều phòng quan tâm để đưa vào đăng ký. Việc chọn quan tâm không đồng nghĩa giữ chỗ.

### UC hệ thống 01.3 - Đăng ký/nhận diện khách hàng

**Tác nhân:** Khách vãng lai, Khách hàng hoặc Sale.

**Bắt buộc:** họ tên, số điện thoại và CCCD/giấy tờ tùy thân khi chuyển thành hồ sơ thuê chính thức.

**Nên thêm:** email, mật khẩu nếu tự tạo tài khoản, OTP xác thực, đồng ý điều khoản xử lý dữ liệu cá nhân.

**Trường hợp:** khách đã có tài khoản thì đăng nhập; khách chưa có tài khoản có thể đăng ký; Sale có thể tạo hồ sơ tạm từ số điện thoại và mời khách kích hoạt sau.

### UC hệ thống 01.4 - Tạo đăng ký thuê

**Bắt buộc:**

- Người đăng ký/đại diện nhóm: họ tên, CCCD/giấy tờ tùy thân, số điện thoại.
- Số lượng người dự kiến ở.
- Giới tính của người thuê hoặc thành viên nhóm.
- Khu vực/chi nhánh mong muốn.
- Hình thức thuê: nguyên phòng hoặc giường ở ghép.
- Mức giá tối thiểu/tối đa.
- Ngày dự kiến vào ở.
- Thời hạn thuê dự kiến.
- Tiêu chí ưu tiên được đề nêu: giờ giấc sinh hoạt, yêu cầu yên tĩnh, gửi xe, điều hòa.

**Nên thêm:**

- Mã đăng ký, email, ngày sinh, quốc tịch, địa chỉ.
- Danh sách thành viên nhóm và quan hệ với người đại diện.
- Số lượng xe, vật nuôi, ghi chú đặc biệt.
- Nguồn tiếp cận, Sale phụ trách, thời điểm tạo/cập nhật.
- Trạng thái: mới tạo, đang tư vấn, đã hẹn xem, đã xem, chờ quyết định, chuyển đặt cọc, hủy.
- Lý do hủy hoặc không phù hợp.

### UC hệ thống 01.5 - Sale tiếp nhận và đề xuất phòng/giường

**Bắt buộc:**

- Mã đăng ký.
- Phòng/giường còn trống và chưa đặt cọc.
- Chi nhánh, khu vực, loại phòng, sức chứa.
- Giá thuê.
- Điều kiện giới tính/khu vực.
- Có gửi xe, điều hòa và các tiêu chí phù hợp khác.

**Nên thêm:**

- Điểm phù hợp và lý do đề xuất.
- Ảnh phòng, diện tích, tầng, tiện nghi.
- Danh sách người đang ở đối với phòng ghép.
- Khoảng thời gian giữ đề xuất.

### UC hệ thống 01.6 - Tạo và xác nhận lịch xem phòng

**Bắt buộc:** mã đăng ký, khách hàng, Sale phụ trách, phòng/giường sẽ xem, ngày giờ và địa điểm/chi nhánh.

**Nên thêm:** người tham gia, ghi chú đường đi, trạng thái chờ xác nhận/đã xác nhận/đổi lịch/hủy/vắng mặt, nhắc lịch, lịch sử đổi/hủy lịch.

Khách được phép xác nhận, từ chối hoặc đề nghị thời gian khác. Sale chỉ được đặt lịch tại khung giờ còn khả dụng.

### UC hệ thống 01.7 - Ghi nhận kết quả xem phòng

**Bắt buộc:** lịch xem, các phòng đã xem, thời điểm xem và lựa chọn của khách.

**Nên thêm:** đánh giá từng phòng, lý do không chọn, tiêu chí cần điều chỉnh, ngày liên hệ lại, ghi chú của Sale.

### Các luồng thay thế và ngoại lệ

- Không tìm thấy phòng phù hợp: khách lưu bộ tiêu chí; hệ thống thông báo khi có phòng mới phù hợp.
- Khách chọn phòng nhưng trạng thái đã thay đổi: hệ thống báo phòng không còn trống và đề xuất phòng khác.
- Thông tin khách đã tồn tại theo CCCD/số điện thoại: liên kết hồ sơ cũ thay vì tạo trùng.
- Đăng ký thuê theo nhóm: người đại diện nhập danh sách thành viên; hệ thống kiểm tra số người không vượt sức chứa.
- Sale phát hiện khách/nhóm không đáp ứng điều kiện: từ chối có lý do hoặc yêu cầu điều chỉnh tiêu chí.
- Không còn lịch xem phù hợp: đề xuất khung giờ/chi nhánh khác.
- Khách đổi/hủy lịch hoặc vắng mặt: cập nhật trạng thái, giải phóng lịch và cho phép đặt lại.
- Sau khi xem, khách chưa quyết định: giữ đăng ký ở trạng thái chờ theo dõi, không khóa phòng.
- Khách muốn đặt cọc: kết thúc UC01 và tạo đầu vào cho UC nghiệp vụ 02.

## UC nghiệp vụ 02 - Đặt cọc và xác nhận thuê

### Luồng nghiệp vụ chính

1. Sale rà soát lại khách thuê và gửi yêu cầu kiểm tra phòng/giường cho Quản lý.
2. Quản lý kiểm tra trạng thái thực tế và xác nhận còn khả năng nhận cọc hoặc từ chối.
3. Sale lập phiếu/thỏa thuận đặt cọc.
4. Kế toán tính tiền cọc và tạo yêu cầu thanh toán có hạn 24 giờ.
5. Khách hàng thanh toán bằng tiền mặt hoặc chuyển khoản và gửi chứng từ nếu có.
6. Kế toán kiểm tra giao dịch; Quản lý xác nhận khoản cọc hợp lệ.
7. Hệ thống khóa phòng/giường ở trạng thái `đã đặt cọc`, Sale hẹn ngày nhận phòng.

### UC hệ thống 02.1 - Sale rà soát khách thuê

**Bắt buộc:** thông tin cá nhân, giới tính, quốc tịch, giấy tờ tùy thân, phòng/giường muốn thuê, số người và cam kết tuân thủ nội quy.

**Nên thêm:** ảnh giấy tờ, ngày hết hạn giấy tờ, kết quả xác minh, điều kiện tài chính nếu áp dụng, người thực hiện và lý do đạt/không đạt.

### UC hệ thống 02.2 - Quản lý xác nhận phòng/giường

**Bắt buộc:** phòng/giường, chi nhánh, trạng thái thực tế, kết quả còn trống/đã giữ/đã cọc, Quản lý xác nhận và thời điểm xác nhận.

**Nên thêm:** ảnh hiện trạng, ghi chú bảo trì, phiên bản dữ liệu để chống hai Sale nhận cọc cùng lúc, thời hạn giữ chỗ tạm thời.

### UC hệ thống 02.3 - Sale lập phiếu đặt cọc

**Bắt buộc:** khách/người đại diện, danh sách phòng/giường, số giường thuê, giá thuê từng giường/phòng, chi nhánh, thời điểm đặt cọc.

**Nên thêm:** mã phiếu cọc, Sale lập phiếu, ngày dự kiến nhận phòng, điều khoản hủy, chữ ký/xác nhận điện tử, phiên bản điều khoản.

### UC hệ thống 02.4 - Kế toán tạo yêu cầu thanh toán cọc

**Bắt buộc:** phiếu cọc, công thức `tiền thuê 2 tháng × số giường thuê`, tổng tiền, thời điểm tạo, hạn thanh toán 24 giờ và phương thức tiền mặt/chuyển khoản.

**Nên thêm:** mã yêu cầu thanh toán, nội dung chuyển khoản, tài khoản nhận, QR thanh toán, trạng thái chờ/đã trả/quá hạn/hủy, người lập.

### UC hệ thống 02.5 - Khách thanh toán và Kế toán đối chiếu

**Bắt buộc:** yêu cầu thanh toán, số tiền, phương thức, thời điểm thanh toán, chứng từ/hình ảnh giao dịch khi chuyển khoản.

**Nên thêm:** mã giao dịch ngân hàng, ngân hàng gửi/nhận, người nộp tiền, file biên nhận, ghi chú chênh lệch, người Kế toán đối chiếu.

### UC hệ thống 02.6 - Quản lý xác nhận cọc và khóa chỗ

**Bắt buộc:** kết quả hợp lệ/không hợp lệ, người xác nhận, thời điểm xác nhận, khách cọc, phòng/giường, chi nhánh và thời điểm nhận phòng dự kiến.

**Nên thêm:** lý do từ chối, lịch sử trạng thái, biên nhận cọc, thời điểm khóa phòng/giường. Yêu cầu quá 24 giờ chưa thanh toán phải tự hủy và giải phóng chỗ.

### Các luồng thay thế và ngoại lệ

- Phòng/giường vừa được Sale khác giữ hoặc đặt cọc: Quản lý từ chối; Sale quay lại đề xuất lựa chọn khác.
- Khách thay đổi người ở, số giường hoặc phòng: cập nhật đăng ký và rà soát lại từ đầu.
- Hồ sơ/điều kiện thuê chưa đạt: yêu cầu bổ sung hoặc kết thúc yêu cầu cọc có lý do.
- Kế toán tính tiền cho thuê nguyên phòng: số giường dùng tính cọc bằng toàn bộ sức chứa tối đa của phòng.
- Khách trả thiếu/thừa hoặc chứng từ không hợp lệ: Kế toán đánh dấu cần xử lý, chưa xác nhận cọc.
- Khách thanh toán tiền mặt: Kế toán lập phiếu thu thay cho ảnh chuyển khoản.
- Quá hạn 24 giờ chưa trả: hệ thống tự hủy yêu cầu và giải phóng phòng/giường.
- Thanh toán đến sát thời điểm hết hạn: giao dịch phải được đối soát theo mã yêu cầu để tránh hủy nhầm.
- Quản lý từ chối giao dịch: ghi lý do, Kế toán xử lý hoàn/chỉnh giao dịch nếu tiền đã vào.

## UC nghiệp vụ 03 - Nhận phòng, ký hợp đồng và bàn giao

### Luồng nghiệp vụ chính

1. Sale kiểm tra phiếu cọc, giấy tờ và bổ sung thông tin cư trú của tất cả người ở.
2. Quản lý kiểm tra điều kiện lưu trú và duyệt/từ chối từng thành viên.
3. Sale lập hợp đồng thuê theo danh sách được duyệt.
4. Kế toán tạo hóa đơn/yêu cầu thanh toán tiền thuê kỳ đầu và các khoản phí nhận phòng.
5. Khách hàng thanh toán; Kế toán xác nhận đã thu đủ.
6. Quản lý kiểm tra hiện trạng, lập biên bản và bàn giao phòng/giường, tài sản, chìa khóa/thẻ từ.
7. Hợp đồng chuyển sang hiệu lực và phòng/giường chuyển sang `đang thuê`.

### UC hệ thống 03.1 - Sale kiểm tra cọc và hoàn thiện hồ sơ cư trú

**Bắt buộc:** phiếu cọc, người đại diện, danh sách tất cả thành viên, CCCD/giấy tờ, giới tính, quốc tịch, phòng/giường và số người thực tế.

**Nên thêm:** ảnh chân dung/giấy tờ, quê quán, thường trú, liên hệ khẩn cấp, nghề nghiệp/trường học, biển số xe, ngày bắt đầu cư trú.

### UC hệ thống 03.2 - Quản lý duyệt điều kiện lưu trú

**Bắt buộc:** kết quả duyệt của từng người, điều kiện giới tính/khu vực/sức chứa, người duyệt, thời điểm và lý do từ chối nếu có.

**Nên thêm:** checklist điều kiện, bằng chứng đính kèm, yêu cầu bổ sung hồ sơ, hạn hoàn thành.

### UC hệ thống 03.3 - Sale lập và ký hợp đồng thuê

**Bắt buộc:** các bên ký, phòng/giường, số giường hoặc thuê cả phòng, giá thuê, thời hạn thuê, ngày hiệu lực, kỳ thanh toán, điện/nước/WiFi/gửi xe và dịch vụ khác, quy định hoàn/khấu trừ cọc, nội quy và xử lý vi phạm.

**Nên thêm:** mã hợp đồng, mẫu/phiên bản hợp đồng, danh sách thành viên, phương thức thanh toán, ngày đến hạn hàng kỳ, chữ ký điện tử, file hợp đồng, trạng thái duyệt/ký/hiệu lực.

### UC hệ thống 03.4 - Kế toán tạo hóa đơn/khoản thu nhận phòng

**Bắt buộc:** hợp đồng, tiền thuê kỳ đầu, các phí/dịch vụ cần thu, số đã cọc được đối chiếu, tổng phải thanh toán và hạn thanh toán.

**Nên thêm:** số hóa đơn/phiếu thu, thuế nếu áp dụng, giảm giá/phụ thu, công nợ, QR/nội dung chuyển khoản, trạng thái thanh toán.

### UC hệ thống 03.5 - Khách thanh toán và Kế toán xác nhận

**Bắt buộc:** hóa đơn/yêu cầu thanh toán, số tiền thực nhận, phương thức, thời gian và Kế toán xác nhận đã thu đủ/chưa đủ.

**Nên thêm:** mã giao dịch, chứng từ, số phiếu thu, chênh lệch và ghi chú xử lý.

### UC hệ thống 03.6 - Quản lý bàn giao phòng/giường và tài sản

**Bắt buộc:** hợp đồng, phòng/giường, hiện trạng, danh sách tài sản/vật dụng gồm giường, nệm, tủ, chìa khóa/thẻ từ, người giao, người nhận và thời điểm bàn giao.

**Nên thêm:** ảnh/video hiện trạng, số lượng và tình trạng từng tài sản, chỉ số điện/nước ban đầu, mã chìa khóa/thẻ, chữ ký hai bên, file biên bản.

### Các luồng thay thế và ngoại lệ

- Khách đến nhận phòng nhưng không có cọc hợp lệ: dừng thủ tục và chuyển về UC02.
- Cá nhân không đạt điều kiện: Quản lý từ chối ký hợp đồng và chuyển xử lý hoàn cọc theo UC04.
- Một thành viên nhóm không đạt: loại thành viên đó; chỉ tiếp tục nếu số người còn lại phù hợp số giường/phòng đã đặt.
- Nhóm không muốn tiếp tục sau khi loại thành viên: hủy nhận phòng và chuyển đối soát hoàn cọc.
- Thông tin thực tế khác phiếu cọc: Sale cập nhật hồ sơ, Quản lý duyệt lại và lập hợp đồng mới.
- Khách không đồng ý điều khoản hoặc chưa ký: hợp đồng chưa có hiệu lực, không tạo bàn giao.
- Khách chưa thanh toán đủ khoản nhận phòng: Kế toán ghi nhận thanh toán một phần; Quản lý chưa được bàn giao.
- Phòng có hư hỏng trước bàn giao: lập biên bản, đổi phòng hoặc đưa phòng vào bảo trì.
- Thiếu tài sản/chìa khóa: không hoàn tất bàn giao cho đến khi bổ sung hoặc khách xác nhận ngoại lệ.

## UC nghiệp vụ 04 - Trả phòng, đối soát và hoàn cọc

### Luồng nghiệp vụ chính

1. Khách hoặc người đại diện gửi yêu cầu trả phòng cho Sale.
2. Sale tạo lịch trả phòng và chuyển Quản lý kiểm tra.
3. Quản lý kiểm tra phòng/giường, tài sản, vệ sinh, hư hỏng và nghĩa vụ bàn giao.
4. Kế toán đối soát tiền thuê, điện nước/dịch vụ, hư hỏng, mất mát và vi phạm.
5. Kế toán tính tỷ lệ hoàn cọc theo đề và tạo bảng đối soát.
6. Quản lý trao đổi kết quả với khách; khách xác nhận hoặc thanh toán thêm.
7. Các bên ký biên bản trả phòng/thanh lý; Kế toán hoàn cọc nếu còn dư.
8. Quản lý thu hồi chìa khóa/thẻ, xác nhận kết thúc lưu trú và chuyển phòng/giường về `trống` hoặc `bảo trì`.

### UC hệ thống 04.1 - Khách/Sale đăng ký trả phòng

**Bắt buộc:** khách/người đại diện, hợp đồng hoặc phiếu cọc, phòng/giường và thời gian muốn trả.

**Nên thêm:** lý do trả, tài khoản nhận hoàn tiền, phương thức hoàn, địa chỉ liên hệ sau trả phòng, Sale tiếp nhận.

### UC hệ thống 04.2 - Quản lý kiểm tra hiện trạng

**Bắt buộc:** phòng/giường, tài sản, vệ sinh, hư hỏng/mất mát, thời điểm kiểm tra, Quản lý và khách tham gia.

**Nên thêm:** checklist so với biên bản nhận phòng, ảnh trước/sau, mức độ hư hỏng, đề xuất chi phí sửa chữa, chỉ số điện/nước cuối, chìa khóa/thẻ đã thu hồi.

### UC hệ thống 04.3 - Kế toán lập bảng đối soát

**Bắt buộc:** tiền cọc gốc, tình trạng hợp đồng, thời gian lưu trú, tiền thuê còn nợ, điện nước/dịch vụ còn nợ, sửa chữa/bồi thường, tiền phạt vi phạm.

Tỷ lệ hoàn cọc cơ bản theo đề:

| Trường hợp | Tỷ lệ hoàn |
|---|---:|
| Đã cọc nhưng chưa ký hợp đồng | 80% |
| Đã ký, chưa hết hạn và ở dưới 6 tháng | 50% |
| Đã ký, chưa hết hạn và ở trên 6 tháng | 70% |
| Hết hạn hợp đồng | 100% |

**Nên thêm:** từng dòng khấu trừ, chứng từ đi kèm, công thức tính, người lập/duyệt, phiên bản đối soát và lịch sử điều chỉnh.

### UC hệ thống 04.4 - Quản lý thông báo và Khách xác nhận kết quả

**Bắt buộc:** tổng được hoàn cơ bản, tổng khấu trừ và kết quả cuối cùng: hoàn cho khách hoặc khách phải trả thêm.

**Nên thêm:** hạn phản hồi, ý kiến khách, trạng thái tranh chấp, phương thức hoàn/thu thêm, tài khoản nhận, mã giao dịch.

### UC hệ thống 04.5 - Kế toán thu thêm hoặc hoàn cọc

**Bắt buộc:** bảng đối soát đã được xác nhận, số tiền phải thu thêm hoặc hoàn lại, phương thức, người thực hiện, thời điểm và mã giao dịch/phiếu tiền mặt.

**Nên thêm:** tài khoản ngân hàng nhận hoàn, chứng từ, trạng thái giao dịch, lý do thất bại và lịch sử thử lại.

### UC hệ thống 04.6 - Thanh lý hợp đồng và giải phóng phòng/giường

**Bắt buộc:** biên bản trả phòng, thanh lý hợp đồng, xác nhận thanh toán thêm hoặc hoàn cọc, người ký, thời điểm hoàn tất và trạng thái mới của phòng/giường.

**Nên thêm:** file biên bản, chữ ký điện tử, phiếu hoàn tiền, lịch sử trạng thái, yêu cầu bảo trì trước khi đưa chỗ ở về trạng thái trống.

### Các luồng thay thế và ngoại lệ

- Khách chỉ mới đặt cọc, chưa ký hợp đồng: không kiểm tra nghĩa vụ hợp đồng; áp dụng mức hoàn cơ bản 80% rồi khấu trừ hợp lệ nếu có.
- Khách trả trước hạn dưới/trên 6 tháng hoặc đúng hạn: hệ thống tự chọn tỷ lệ 50%/70%/100% nhưng Kế toán phải thấy công thức.
- Khách còn nợ nhỏ hơn tiền hoàn: khấu trừ và hoàn phần còn lại.
- Tổng nợ lớn hơn tiền được hoàn: tạo yêu cầu khách thanh toán phần chênh lệch.
- Khách không đồng ý hư hỏng/khấu trừ: chuyển trạng thái tranh chấp, chưa thanh lý và chưa hoàn tiền.
- Không có hư hỏng/công nợ: tạo đối soát không khấu trừ.
- Khách không đến kiểm tra: cho phép lập biên bản vắng mặt kèm bằng chứng và quy trình phê duyệt.
- Giao dịch hoàn cọc thất bại: giữ hợp đồng ở trạng thái chờ hoàn, không đánh dấu hoàn tất.
- Phòng đạt yêu cầu: chuyển về `trống`; phòng cần sửa chữa/vệ sinh: chuyển `bảo trì` và chỉ mở lại sau xác nhận hoàn tất.

# Notification kết nối luồng demo

Notification không thay thế trạng thái nghiệp vụ trong database. Mỗi hành động phải cập nhật giao dịch trước, sau đó tạo notification dẫn người nhận đến đúng màn hình/bản ghi cần xử lý.

## Dữ liệu notification đề xuất

| Trường | Ý nghĩa |
|---|---|
| `notification_id` | Mã thông báo |
| `recipient_account_id` | Người nhận |
| `type` | Loại sự kiện |
| `title`, `message` | Nội dung hiển thị |
| `entity_type`, `entity_id` | Loại và mã bản ghi liên quan |
| `action_url` | Route mở đúng màn hình chi tiết |
| `priority` | Mức độ ưu tiên |
| `is_read`, `read_at` | Trạng thái đọc |
| `created_at`, `expires_at` | Thời gian tạo/hết hạn |

## Chuỗi notification khi demo

1. Khách tạo đăng ký → Sale nhận: **Có đăng ký thuê mới cần tư vấn**.
2. Sale tạo lịch xem → Khách nhận: **Lịch xem phòng đã được tạo**.
3. Khách chọn đặt cọc → Quản lý nhận: **Cần xác nhận tình trạng phòng/giường**.
4. Quản lý xác nhận còn chỗ → Sale nhận: **Có thể lập phiếu đặt cọc**.
5. Sale lập phiếu cọc → Kế toán nhận: **Cần tạo yêu cầu thanh toán cọc**.
6. Kế toán tạo yêu cầu → Khách nhận: **Thanh toán cọc trong 24 giờ**.
7. Khách tải chứng từ → Kế toán nhận: **Có giao dịch cọc cần đối chiếu**.
8. Kế toán đối chiếu → Quản lý nhận: **Cần xác nhận khoản cọc**.
9. Quản lý xác nhận → Khách và Sale nhận: **Đặt cọc thành công, chờ nhận phòng**.
10. Sale hoàn tất hồ sơ → Quản lý nhận: **Cần duyệt điều kiện lưu trú**.
11. Quản lý duyệt → Sale nhận: **Có thể lập hợp đồng thuê**.
12. Sale lập hợp đồng → Kế toán nhận: **Cần tạo khoản thu nhận phòng**.
13. Kế toán tạo hóa đơn → Khách nhận: **Có khoản thanh toán nhận phòng mới**.
14. Kế toán xác nhận thu đủ → Quản lý nhận: **Có thể bàn giao phòng**.
15. Quản lý bàn giao → Khách nhận: **Nhận phòng thành công**.
16. Khách yêu cầu trả phòng → Sale và Quản lý nhận: **Có yêu cầu kiểm tra trả phòng**.
17. Quản lý hoàn tất kiểm tra → Kế toán nhận: **Cần lập bảng đối soát**.
18. Kế toán lập đối soát → Quản lý nhận: **Cần trao đổi kết quả với khách**.
19. Quản lý gửi kết quả → Khách nhận: **Xác nhận đối soát trả phòng**.
20. Khách xác nhận/thanh toán thêm → Kế toán nhận: **Có thể hoàn cọc hoặc hoàn tất công nợ**.
21. Kế toán hoàn tất → Quản lý và Sale nhận: **Có thể thanh lý và giải phóng phòng/giường**.

## Cách triển khai notification

- Giai đoạn demo tối thiểu: lưu notification trong database, Frontend gọi API định kỳ mỗi 10-15 giây và hiển thị badge chuông.
- Giai đoạn hoàn thiện: Backend phát sự kiện thời gian thực bằng SignalR; Frontend nhận notification ngay mà không cần tải lại trang.
- Mỗi notification cần có `action_url`, ví dụ `/manager/contract-approval?id=...`, để khi bấm sẽ đến đúng công việc.
- Các sự kiện quá hạn 24 giờ và nhắc lịch xem phòng nên được tạo bởi background job, không phụ thuộc người dùng đang mở Frontend.

# Các bảng nghiệp vụ cần bổ sung

Schema hiện tại mới có dữ liệu nền. Để triển khai đủ bốn UC, tối thiểu nên bổ sung các nhóm bảng:

- Đăng ký thuê, thành viên nhóm thuê, đề xuất phòng và lịch xem phòng.
- Phiếu đặt cọc, chi tiết phòng/giường được cọc và yêu cầu thanh toán.
- Giao dịch/chứng từ thanh toán.
- Hợp đồng thuê, thành viên hợp đồng và dịch vụ hợp đồng.
- Hóa đơn/phiếu thu và chi tiết khoản thu.
- Biên bản bàn giao và chi tiết tài sản bàn giao.
- Yêu cầu trả phòng, biên bản kiểm tra và chi tiết hư hỏng.
- Bảng đối soát, chi tiết khấu trừ, thanh lý và hoàn cọc.
- Notification và lịch sử thay đổi trạng thái/audit log.

Các bảng trên cần dùng khóa ngoại đến `tai_khoan`, `khach_hang`, `nhan_vien`, `chi_nhanh`, `phong`, `giuong` và `dich_vu` để luồng demo có dữ liệu xuyên suốt, không phải sao chép thông tin giữa các màn hình.
