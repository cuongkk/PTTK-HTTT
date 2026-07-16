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

    // Sinh mã ngắn dạng: 2 ký tự tiền tố + 10 chữ số từ Ticks hiện tại = đúng 12 ký tự,
    // khớp với giới hạn nvarchar(12) của các cột ma_doi_soat, ma_bb_tra, ma_chi_phi.
    private static string GenerateShortId(string prefix)
    {
        // Ticks có 18 chữ số, lấy 10 số cuối để đủ độ phân giải nhưng vẫn ngắn gọn
        var ticksPart = (DateTime.UtcNow.Ticks % 10_000_000_000L).ToString().PadLeft(10, '0');
        return $"{prefix}{ticksPart}"; // ví dụ: "DS1234567890" - đúng 12 ký tự
    }

    public async Task<CheckoutReportResultDto> CreateReportAndReconciliationAsync(CreateCheckoutReportDto dto, string accountId)
    {
        var account = await _db.Accounts.FirstOrDefaultAsync(a => a.AccountId == accountId);

        if (account == null || string.IsNullOrEmpty(account.EmployeeId))
        {
            return new CheckoutReportResultDto
            {
                Success = false,
                Message = "Tài khoản quản lý hiện tại không liên kết với thông tin nhân viên nào!"
            };
        }

        string managerEmployeeId = account.EmployeeId;

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

        var contract = await _db.RentalContracts
            .FirstOrDefaultAsync(c => c.ContractId == dto.ContractId);

        if (contract != null)
        {
            string saleEmployeeId = contract.SalesEmployeeId; // Đây chính là mã nhân viên sale!
        }

        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // 1. Khởi tạo đối tượng Đối soát (Reconciliation)
            var reconciliationId = GenerateShortId("DS"); // ví dụ: "DS1234567890" - 12 ký tự
            var reconciliation = new Reconciliation
            {
                ReconciliationId = reconciliationId,
                ContractId = dto.ContractId,
                ManagerEmployeeId = managerEmployeeId,
                AccountantEmployeeId = managerEmployeeId, // Chưa có kế toán tiếp nhận
                CreatedDate = DateOnly.FromDateTime(DateTime.UtcNow),

                OriginalDeposit = 0,
                RefundRate = 0,
                BaseRefund = 0,
                TotalDeductions = dto.EstimatedCost > 0 ? dto.EstimatedCost : 0,
                RefundAmount = null,
                AdditionalPaymentAmount = null,
                Status = "cho_xac_nhan"
            };

            // 2. Khởi tạo biên bản trả phòng (CheckoutReport)
            var checkoutReportId = GenerateShortId("BT"); // ví dụ: "BT1234567890" - 12 ký tự
            var checkoutReport = new CheckoutReport
            {
                CheckoutReportId = checkoutReportId,
                ReconciliationId = reconciliationId,
                ManagerEmployeeId = managerEmployeeId,
                CheckoutDate = DateOnly.FromDateTime(DateTime.UtcNow),

                RoomCondition = $"Tổng thể: {dto.OverallCondition} | Vệ sinh: {dto.Cleanliness} | Hư hại: {dto.DamageNotes}",
                FinalElectricityReading = null,
                FinalWaterReading = null,
                KeysReturned = true,
                Note = dto.EstimatedCost > 0 ? $"Chi phí sửa chữa ước tính: {dto.EstimatedCost}$" : null
            };

            // 3. Nếu có chi phí phát sinh > 0, tạo bản ghi AdditionalCost
            if (dto.EstimatedCost > 0)
            {
                var additionalCost = new AdditionalCost
                {
                    AdditionalCostId = GenerateShortId("CP"), // ví dụ: "CP1234567890" - 12 ký tự
                    ReconciliationId = reconciliationId,
                    CostType = "hu_hong",
                    Amount = dto.EstimatedCost,
                    Description = !string.IsNullOrEmpty(dto.DamageNotes) ? dto.DamageNotes : "Chi phí phát sinh hư hại phòng"
                };
                _db.AdditionalCosts.Add(additionalCost);
            }

            // 4. Cập nhật trạng thái Yêu cầu trả phòng
            checkoutRequest.Status = "cho_doi_soat";
            checkoutRequest.ReconciliationId = reconciliationId;
            checkoutRequest.ConfirmedInspectionAt = DateTime.UtcNow;
            checkoutRequest.ManagerEmployeeId = managerEmployeeId;

            // 5. Đồng bộ trạng thái Hợp đồng thuê
            if (contract != null)
            {
                contract.Status = "cho_doi_soat";
            }

            // 6. Lưu tất cả thay đổi
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
            var detail = ex.InnerException?.Message ?? ex.Message;
            return new CheckoutReportResultDto
            {
                Success = false,
                Message = $"Có lỗi xảy ra trong quá trình lưu dữ liệu: {detail}"
            };
        }
    }
}