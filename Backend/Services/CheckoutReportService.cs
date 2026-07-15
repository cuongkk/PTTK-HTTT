using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class CheckoutReportService : ICheckoutReportService
{
    private readonly AppDbContext _db;

    public CheckoutReportService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<CheckoutReportResultDto> CreateReportAndReconciliationAsync(CreateCheckoutReportDto dto, string accountId)
    {
        // 0. Sửa lỗi trùng biến đầu vào: Khớp "accountId" viết thường từ tham số
        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountId == accountId);

        // Kiểm tra xem tài khoản có tồn tại hoặc có được liên kết với Nhân viên nào không
        if (account == null || string.IsNullOrEmpty(account.EmployeeId))
        {
            return new CheckoutReportResultDto
            {
                Success = false,
                Message = "Tài khoản quản lý hiện tại không liên kết với thông tin nhân viên nào!"
            };
        }

        // Đã tìm được mã nhân viên chính xác (ví dụ: NV0000000X)
        string managerEmployeeId = account.EmployeeId;

        // BỔ SUNG LƯỢNG DỮ LIỆU: Truy vấn đối tượng Yêu cầu trả phòng đang xử lý để có thực thể gán trạng thái
        var checkoutRequest = await _db.CheckoutRequests
            .FirstOrDefaultAsync(r => r.ContractId == dto.ContractId && 
                                    (r.Status == "cho_kiem_tra" || r.Status == "da_xac_nhan_lich"));

        if (checkoutRequest == null)
        {
            return new CheckoutReportResultDto
            {
                Success = false,
                Message = "Không tìm thấy yêu cầu trả phòng hợp lệ nào đang chờ kiểm tra cho hợp đồng này!"
            };
        }

        // BỔ SUNG LƯỢNG DỮ LIỆU: Lấy thông tin Hợp đồng thuê để chuyển đổi trạng thái đồng bộ
        var contract = await _db.RentalContracts
            .FirstOrDefaultAsync(c => c.ContractId == dto.ContractId);

        // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu cho tất cả các bảng liên quan
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // 1. Khởi tạo đối tượng Đối soát (Reconciliation) với các thông tin cơ bản trước
            var reconciliationId = Guid.NewGuid().ToString();
            var reconciliation = new Reconciliation
            {
                ReconciliationId = reconciliationId,
                ContractId = dto.ContractId,
                ManagerEmployeeId = managerEmployeeId,
                AccountantEmployeeId = "", // Chưa có kế toán tiếp nhận
                CreatedDate = DateOnly.FromDateTime(DateTime.UtcNow),
                
                // Các thông tin tài chính để mặc định
                OriginalDeposit = 0,
                RefundRate = 0,
                BaseRefund = 0,
                // [CẬP NHẬT ĐỂ ĐỒNG BỘ]: Cộng dồn chi phí hư hại ước tính trực tiếp vào tổng khấu trừ ban đầu nếu có
                TotalDeductions = dto.EstimatedCost > 0 ? dto.EstimatedCost : 0, 
                RefundAmount = null,
                AdditionalPaymentAmount = null,
                Status = "cho_doi_soat" // Trạng thái chờ đối soát kế toán trực tiếp
            };

            // 2. Khởi tạo biên bản trả phòng (CheckoutReport) liên kết với đối soát trên
            var checkoutReportId = Guid.NewGuid().ToString();
            var checkoutReport = new CheckoutReport
            {
                CheckoutReportId = checkoutReportId,
                ReconciliationId = reconciliationId,
                ManagerEmployeeId = managerEmployeeId,
                CheckoutDate = DateOnly.FromDateTime(DateTime.UtcNow),
                
                // Tổng hợp thông tin hiện trạng từ FE gửi lên
                RoomCondition = $"Tổng thể: {dto.OverallCondition} | Vệ sinh: {dto.Cleanliness} | Hư hại: {dto.DamageNotes}",
                FinalElectricityReading = null, // Nhân viên sẽ điền sau
                FinalWaterReading = null,       // Nhân viên sẽ điền sau
                KeysReturned = true,
                Note = dto.EstimatedCost > 0 ? $"Chi phí sửa chữa ước tính: {dto.EstimatedCost}$" : null
            };

            // 3. BỔ SUNG: Nếu có chi phí phát sinh > 0, tạo một bản ghi AdditionalCost độc lập lưu vào DB
            if (dto.EstimatedCost > 0)
            {
                var additionalCost = new AdditionalCost
                {
                    AdditionalCostId = Guid.NewGuid().ToString(),
                    ReconciliationId = reconciliationId,
                    CostType = "hu_hong", // Ghi nhận loại chi phí hư hỏng cơ sở vật chất
                    Amount = dto.EstimatedCost,
                    Description = !string.IsNullOrEmpty(dto.DamageNotes) ? dto.DamageNotes : "Chi phí phát sinh hư hại phòng"
                };
                _db.AdditionalCosts.Add(additionalCost);
            }

            // 4. CẬP NHẬT: Trạng thái Yêu cầu trả phòng được kích hoạt và gán giá trị hợp lệ
            checkoutRequest.Status = "cho_doi_soat"; // Đi thẳng sang trạng thái chờ đối soát
            checkoutRequest.ReconciliationId = reconciliationId;
            checkoutRequest.ConfirmedInspectionAt = DateTime.UtcNow;
            checkoutRequest.ManagerEmployeeId = managerEmployeeId;

            // 5. BỔ SUNG: Đồng bộ cập nhật trạng thái của Hợp đồng thuê sang Chờ đối soát
            if (contract != null)
            {
                contract.Status = "cho_doi_soat";
            }

            // 6. Lưu đồng thời tất cả các thay đổi vào cơ sở dữ liệu
            _db.Reconciliations.Add(reconciliation);
            _db.CheckoutReports.Add(checkoutReport);
            
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return new CheckoutReportResultDto
            {
                Success = true,
                Message = "Tạo biên bản trả phòng thành công! Luồng trạng thái đã chuyển thẳng sang Chờ đối soát.",
                CheckoutReportId = checkoutReportId,
                ReconciliationId = reconciliationId
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return new CheckoutReportResultDto
            {
                Success = false,
                Message = $"Có lỗi xảy ra trong quá trình lưu dữ liệu: {ex.Message}"
            };
        }
    }
}