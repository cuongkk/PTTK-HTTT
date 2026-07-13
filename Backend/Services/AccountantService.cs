using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Dtos;
using Backend.Models;
using Backend.Utilities;
using Backend.Common;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AccountantService : IAccountantService
{
    private readonly AppDbContext _dbContext;

    public AccountantService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // ==========================================
    // 1. PAYMENT REQUESTS
    // ==========================================

    public async Task<List<ContractInvoiceInfoDto>> GetPendingContractsForInvoiceAsync()
    {
        // Lấy danh sách phiếu đặt cọc chưa có hóa đơn cọc, hoặc hóa đơn cọc bị hủy
        var depositSlips = await _dbContext.DepositSlips
            .Include(d => d.Application).ThenInclude(r => r.Customer)
            .Include(d => d.Beds)
            .Where(d => d.Status == "cho_thanh_toan")
            .ToListAsync();

        var result = new List<ContractInvoiceInfoDto>();
        foreach (var dep in depositSlips)
        {
            // Kiểm tra xem đã có hóa đơn cọc nào chưa
            var hasActiveInvoice = await _dbContext.Invoices
                .AnyAsync(i => i.DepositId == dep.DepositId && i.Status != "huy");

            if (!hasActiveInvoice)
            {
                var roomName = "Chưa xếp phòng";
                decimal monthlyRent = 0;
                int bedCount = dep.Beds?.Count ?? 0;
                var firstBed = dep.Beds?.FirstOrDefault();
                if (firstBed != null)
                {
                    var bed = await _dbContext.Beds.Include(b => b.Room)
                        .FirstOrDefaultAsync(b => b.BedId == firstBed.BedId);
                    if (bed != null)
                    {
                        roomName = bed.Room.RoomName;
                        monthlyRent = bed.Room.RoomType == "nguyen_can" ? (bed.Room.RoomPrice ?? 0) : bed.MonthlyRent;
                    }
                }

                result.Add(new ContractInvoiceInfoDto
                {
                    Id = dep.DepositId,
                    ContractId = dep.DepositId,
                    CustomerId = dep.Application.CustomerId,
                    CustomerName = dep.Application.Customer.FullName,
                    RoomName = roomName,
                    MonthlyRent = monthlyRent,
                    BedCount = bedCount
                });
            }
        }

        // Lấy danh sách hợp đồng thuê chưa có hóa đơn tiền thuê phòng kỳ đầu
        var rentalContracts = await _dbContext.RentalContracts
            .Include(c => c.Customer)
            .Include(c => c.Room)
            .Where(c => c.Status == "hieu_luc")
            .ToListAsync();

        foreach (var c in rentalContracts)
        {
            var hasFirstMonthInvoice = await _dbContext.Invoices
                .AnyAsync(i => i.ContractId == c.ContractId && i.InvoiceType == "tien_thue");

            if (!hasFirstMonthInvoice)
            {
                result.Add(new ContractInvoiceInfoDto
                {
                    Id = c.ContractId,
                    ContractId = c.ContractId,
                    CustomerId = c.CustomerId,
                    CustomerName = c.Customer.FullName,
                    RoomName = c.Room.RoomName,
                    MonthlyRent = c.MonthlyRent,
                    BedCount = c.NumberOfBeds
                });
            }
        }

        return result;
    }

    public async Task CreateInvoiceRequestAsync(CreateInvoiceRequest request, string accountantId)
    {
        var customer = await _dbContext.Customers.FindAsync(request.CustomerId)
            ?? throw new NotFoundException($"Không tìm thấy khách hàng '{request.CustomerId}'.");

        var employeeId = await GetEmployeeIdFromAccountIdAsync(accountantId);

        var now = DateTime.UtcNow;
        var dueDate = request.DueDate ?? now.AddHours(24);

        var invoice = new Invoice
        {
            InvoiceId = IdGenerator.Generate("HD", 12),
            CustomerId = request.CustomerId,
            AccountantEmployeeId = employeeId,
            DepositId = request.DepositId,
            ContractId = request.ContractId,
            ReconciliationId = request.ReconciliationId,
            InvoiceType = request.InvoiceType,
            DocumentType = "thu",
            TotalAmount = request.TotalAmount,
            Status = "cho_thanh_toan",
            BillingPeriod = request.BillingCycle,
            CreatedAt = now,
            Note = request.Notes
        };

        await _dbContext.Invoices.AddAsync(invoice);

        // Tạo thông báo cho khách hàng
        var customerAccount = await _dbContext.Accounts
            .FirstOrDefaultAsync(a => a.CustomerId == request.CustomerId);
        if (customerAccount != null)
        {
            var notification = new Notification
            {
                NotificationId = IdGenerator.Generate("TB", 12),
                SenderAccountId = null, // Hệ thống gửi tự động
                RecipientAccountId = customerAccount.AccountId,
                Title = "Yêu cầu thanh toán mới",
                Content = $"Bạn có yêu cầu thanh toán mới cho khoản '{GetInvoiceTypeName(request.InvoiceType)}' với số tiền là {request.TotalAmount:#,##0} VNĐ."
            };
            await _dbContext.Notifications.AddAsync(notification);
        }

        await _dbContext.SaveChangesAsync();
    }

    public async Task<List<InvoiceDto>> GetSentRequestsAsync()
    {
        // On-demand: kiểm tra và tự động hủy hóa đơn quá hạn 24h
        await CancelExpiredInvoicesAsync();

        var invoices = await _dbContext.Invoices
            .Join(_dbContext.Customers,
                i => i.CustomerId,
                c => c.CustomerId,
                (i, c) => new { Invoice = i, CustomerName = c.FullName })
            .OrderByDescending(x => x.Invoice.CreatedAt)
            .ToListAsync();

        var result = new List<InvoiceDto>();
        foreach (var item in invoices)
        {
            var invoice = item.Invoice;
            var roomName = "Chưa xếp phòng";

            if (!string.IsNullOrEmpty(invoice.ContractId))
            {
                var rc = await _dbContext.RentalContracts.Include(c => c.Room)
                    .FirstOrDefaultAsync(c => c.ContractId == invoice.ContractId);
                if (rc != null) roomName = rc.Room.RoomName;
            }
            else if (!string.IsNullOrEmpty(invoice.ReconciliationId))
            {
                var reconRecord = await _dbContext.Reconciliations
                    .FirstOrDefaultAsync(r => r.ReconciliationId == invoice.ReconciliationId);
                if (reconRecord != null)
                {
                    var rc = await _dbContext.RentalContracts.Include(c => c.Room)
                        .FirstOrDefaultAsync(c => c.ContractId == reconRecord.ContractId);
                    if (rc != null) roomName = rc.Room.RoomName;
                }
            }
            else if (!string.IsNullOrEmpty(invoice.DepositId))
            {
                var dep = await _dbContext.DepositSlips.Include(d => d.Beds)
                    .FirstOrDefaultAsync(d => d.DepositId == invoice.DepositId);
                if (dep != null && dep.Beds.Any())
                {
                    var bed = await _dbContext.Beds.Include(b => b.Room)
                        .FirstOrDefaultAsync(b => b.BedId == dep.Beds.First().BedId);
                    if (bed != null) roomName = bed.Room.RoomName;
                }
            }

            result.Add(new InvoiceDto
            {
                InvoiceId = invoice.InvoiceId,
                CustomerId = invoice.CustomerId,
                CustomerName = item.CustomerName,
                RoomName = roomName,
                InvoiceType = invoice.InvoiceType,
                DocumentType = invoice.DocumentType,
                TotalAmount = invoice.TotalAmount,
                PaymentMethod = invoice.PaymentMethod,
                BankName = invoice.BankName,
                AccountNumber = invoice.BankAccountNumber,
                AccountName = invoice.BankAccountHolder,
                TransactionId = invoice.TransactionId,
                ProofImage = invoice.ProofImageUrl,
                CreatedAt = invoice.CreatedAt,
                PaidAt = invoice.PaidAt,
                Status = invoice.Status,
                DueDate = invoice.CreatedAt.AddHours(24), // Tính toán hạn thanh toán = thời điểm tạo + 24h
                Notes = invoice.Note,
                BillingCycle = invoice.BillingPeriod
            });
        }

        return result;
    }

    /// <summary>
    /// Kiểm tra on-demand: tự động hủy các hóa đơn tiền cọc quá hạn 24h và giải phóng giường.
    /// Chạy mỗi khi Kế toán mở danh sách yêu cầu thanh toán.
    /// </summary>
    private async Task CancelExpiredInvoicesAsync()
    {
        var now = DateTime.UtcNow;

        var expiredInvoices = await _dbContext.Invoices
            .Where(i => i.Status == "cho_thanh_toan"
                     && i.InvoiceType == "tien_coc"
                     && i.CreatedAt.AddHours(24) < now)
            .ToListAsync();

        if (expiredInvoices.Count == 0) return;

        foreach (var invoice in expiredInvoices)
        {
            invoice.Status = "huy";
            invoice.Note = (invoice.Note ?? "") + $"\n[Hệ thống] Tự động hủy do quá hạn thanh toán 24h ({now:dd/MM/yyyy HH:mm} UTC).";

            // Giải phóng giường đã cọc
            if (!string.IsNullOrEmpty(invoice.DepositId))
            {
                var deposit = await _dbContext.DepositSlips
                    .Include(d => d.Beds)
                    .FirstOrDefaultAsync(d => d.DepositId == invoice.DepositId);

                if (deposit != null)
                {
                    deposit.Status = "huy";

                    foreach (var depositBed in deposit.Beds)
                    {
                        var bed = await _dbContext.Beds.FindAsync(depositBed.BedId);
                        if (bed != null && bed.Status == "da_coc")
                        {
                            bed.Status = "trong";
                        }
                    }
                }
            }

            // Gửi thông báo cho khách hàng
            var customerAccount = await _dbContext.Accounts
                .FirstOrDefaultAsync(a => a.CustomerId == invoice.CustomerId);
            if (customerAccount != null)
            {
                var notification = new Notification
                {
                    NotificationId = IdGenerator.Generate("TB", 12),
                    SenderAccountId = null,
                    RecipientAccountId = customerAccount.AccountId,
                    Title = "Yêu cầu thanh toán đã bị hủy",
                    Content = $"Yêu cầu thanh toán {invoice.InvoiceId} đã bị tự động hủy do quá hạn 24 giờ. Vui lòng liên hệ kế toán nếu cần hỗ trợ."
                };
                await _dbContext.Notifications.AddAsync(notification);
            }
        }

        await _dbContext.SaveChangesAsync();
    }

    // ==========================================
    // 2. PAYMENT CONFIRMATIONS
    // ==========================================

    public async Task<List<InvoiceDto>> GetPendingConfirmationsAsync()
    {
        var query = await _dbContext.Invoices
            .Where(i => i.Status == "cho_thanh_toan" && (!string.IsNullOrEmpty(i.ProofImageUrl) || i.PaymentMethod == "tien_mat"))
            .Where(i => i.InvoiceType != "tien_coc")
            .Join(_dbContext.Customers,
                i => i.CustomerId,
                c => c.CustomerId,
                (i, c) => new { Invoice = i, CustomerName = c.FullName })
            .OrderByDescending(x => x.Invoice.CreatedAt)
            .ToListAsync();

        var result = new List<InvoiceDto>();
        foreach (var item in query)
        {
            var invoice = item.Invoice;
            var roomName = "Chưa xếp phòng";

            if (!string.IsNullOrEmpty(invoice.ContractId))
            {
                var rc = await _dbContext.RentalContracts.Include(c => c.Room)
                    .FirstOrDefaultAsync(c => c.ContractId == invoice.ContractId);
                if (rc != null) roomName = rc.Room.RoomName;
            }
            else if (!string.IsNullOrEmpty(invoice.ReconciliationId))
            {
                var reconRecord = await _dbContext.Reconciliations
                    .FirstOrDefaultAsync(r => r.ReconciliationId == invoice.ReconciliationId);
                if (reconRecord != null)
                {
                    var rc = await _dbContext.RentalContracts.Include(c => c.Room)
                        .FirstOrDefaultAsync(c => c.ContractId == reconRecord.ContractId);
                    if (rc != null) roomName = rc.Room.RoomName;
                }
            }
            else if (!string.IsNullOrEmpty(invoice.DepositId))
            {
                var dep = await _dbContext.DepositSlips.Include(d => d.Beds)
                    .FirstOrDefaultAsync(d => d.DepositId == invoice.DepositId);
                if (dep != null && dep.Beds.Any())
                {
                    var bed = await _dbContext.Beds.Include(b => b.Room)
                        .FirstOrDefaultAsync(b => b.BedId == dep.Beds.First().BedId);
                    if (bed != null) roomName = bed.Room.RoomName;
                }
            }

            result.Add(new InvoiceDto
            {
                InvoiceId = invoice.InvoiceId,
                CustomerId = invoice.CustomerId,
                CustomerName = item.CustomerName,
                RoomName = roomName,
                InvoiceType = invoice.InvoiceType,
                DocumentType = invoice.DocumentType,
                TotalAmount = invoice.TotalAmount,
                PaymentMethod = invoice.PaymentMethod,
                BankName = invoice.BankName,
                AccountNumber = invoice.BankAccountNumber,
                AccountName = invoice.BankAccountHolder,
                TransactionId = invoice.TransactionId,
                ProofImage = invoice.ProofImageUrl,
                CreatedAt = invoice.CreatedAt,
                PaidAt = invoice.PaidAt,
                Status = invoice.Status,
                Notes = invoice.Note,
                BillingCycle = invoice.BillingPeriod
            });
        }

        return result;
    }

    public async Task ApprovePaymentAsync(string invoiceId, string accountantId)
    {
        var invoice = await _dbContext.Invoices.FindAsync(invoiceId)
            ?? throw new NotFoundException($"Không tìm thấy hóa đơn '{invoiceId}'.");

        var employeeId = await GetEmployeeIdFromAccountIdAsync(accountantId);

        invoice.Status = "da_thanh_toan";
        invoice.PaidAt = DateTime.UtcNow;
        invoice.AccountantEmployeeId = employeeId;

        // Nếu là hóa đơn tiền cọc
        if (invoice.InvoiceType == "tien_coc" && !string.IsNullOrEmpty(invoice.DepositId))
        {
            var deposit = await _dbContext.DepositSlips
                .Include(d => d.Beds)
                .FirstOrDefaultAsync(d => d.DepositId == invoice.DepositId);

            if (deposit != null)
            {
                deposit.Status = "hoan_thanh";
                deposit.PaidAt = DateTime.UtcNow;

                // Khóa trạng thái giường sang 'da_dat_coc'
                var bedIds = deposit.Beds.Select(b => b.BedId).ToList();
                var beds = await _dbContext.Beds.Where(b => bedIds.Contains(b.BedId)).ToListAsync();
                foreach (var bed in beds)
                {
                    bed.Status = "da_dat_coc";
                    bed.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        // Nếu là hóa đơn tiền phòng nhận phòng kỳ đầu
        if (invoice.InvoiceType == "tien_thue" && !string.IsNullOrEmpty(invoice.ContractId))
        {
            var contract = await _dbContext.RentalContracts
                .Include(c => c.Room).ThenInclude(r => r.Beds)
                .FirstOrDefaultAsync(c => c.ContractId == invoice.ContractId);

            if (contract != null)
            {
                contract.Status = "hieu_luc";

                // Cập nhật trạng thái giường/phòng sang 'dang_thue'
                if (contract.Room.RoomType == "nguyen_can")
                {
                    contract.Room.Status = "dang_thue";
                    contract.Room.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Lấy ra các giường được cọc thông qua phiếu đặt cọc liên kết với hợp đồng
                    var deposit = await _dbContext.DepositSlips
                        .Include(d => d.Beds)
                        .FirstOrDefaultAsync(d => d.DepositId == contract.DepositId);
                    
                    if (deposit != null)
                    {
                        var bedIds = deposit.Beds.Select(b => b.BedId).ToList();
                        var beds = await _dbContext.Beds.Where(b => bedIds.Contains(b.BedId)).ToListAsync();
                        foreach (var bed in beds)
                        {
                            bed.Status = "dang_thue";
                            bed.UpdatedAt = DateTime.UtcNow;
                        }
                    }
                }
            }
        }

        // Tạo thông báo cho khách hàng
        var customerAccount = await _dbContext.Accounts
            .FirstOrDefaultAsync(a => a.CustomerId == invoice.CustomerId);
        if (customerAccount != null)
        {
            var notification = new Notification
            {
                NotificationId = IdGenerator.Generate("TB", 12),
                SenderAccountId = null,
                RecipientAccountId = customerAccount.AccountId,
                Title = "Xác nhận thanh toán thành công",
                Content = $"Hóa đơn '{GetInvoiceTypeName(invoice.InvoiceType)}' của bạn trị giá {invoice.TotalAmount:#,##0} VNĐ đã được kế toán xác nhận thanh toán."
            };
            await _dbContext.Notifications.AddAsync(notification);
        }

        await _dbContext.SaveChangesAsync();
    }

    public async Task RejectPaymentAsync(string invoiceId, string accountantId, string reason)
    {
        var invoice = await _dbContext.Invoices.FindAsync(invoiceId)
            ?? throw new NotFoundException($"Không tìm thấy hóa đơn '{invoiceId}'.");

        invoice.Status = "cho_thanh_toan";
        invoice.ProofImageUrl = null; // Xóa ảnh minh chứng cũ để khách tải lại
        invoice.TransactionId = null;
        invoice.Note = (invoice.Note ?? "") + $"\nBị từ chối thanh toán ngày {DateTime.Now:dd/MM/yyyy}. Lý do: {reason}";

        // Tạo thông báo cho khách hàng
        var customerAccount = await _dbContext.Accounts
            .FirstOrDefaultAsync(a => a.CustomerId == invoice.CustomerId);
        if (customerAccount != null)
        {
            var notification = new Notification
            {
                NotificationId = IdGenerator.Generate("TB", 12),
                SenderAccountId = null,
                RecipientAccountId = customerAccount.AccountId,
                Title = "Từ chối xác nhận thanh toán",
                Content = $"Hóa đơn '{GetInvoiceTypeName(invoice.InvoiceType)}' của bạn bị từ chối duyệt. Lý do: {reason}. Vui lòng kiểm tra lại minh chứng thanh toán."
            };
            await _dbContext.Notifications.AddAsync(notification);
        }

        await _dbContext.SaveChangesAsync();
    }

    // ==========================================
    // 3. CHECK-IN CHARGES
    // ==========================================

    public async Task<List<CheckInContractDto>> GetPendingCheckInContractsAsync()
    {
        // Lấy danh sách hợp đồng đã ký nhưng chưa được kế toán tính phí nhận phòng kỳ đầu
        var contracts = await _dbContext.RentalContracts
            .Include(c => c.Customer)
            .Include(c => c.Room).ThenInclude(r => r.Beds)
            .Include(c => c.Deposit)
            .Where(c => c.Status == "hieu_luc")
            .OrderBy(c => c.StartDate)
            .ToListAsync();

        var result = new List<CheckInContractDto>();
        foreach (var c in contracts)
        {
            // Kiểm tra xem đã có hóa đơn thuê/dịch vụ kỳ đầu được tạo chưa
            var hasCharges = await _dbContext.Invoices
                .AnyAsync(i => i.ContractId == c.ContractId && i.InvoiceType == "tien_thue");

            if (!hasCharges)
            {
                // Giả định phí dịch vụ nền
                var serviceFee = 200000m;
                var isComplete = c.NumberOfBeds > 0 && c.MonthlyRent > 0;

                result.Add(new CheckInContractDto
                {
                    Id = c.ContractId,
                    ContractId = c.ContractId,
                    CustomerName = c.Customer.FullName,
                    RoomName = c.Room.RoomName,
                    MoveInDate = c.StartDate.ToString("dd/MM/yyyy"),
                    EndDate = c.EndDate?.ToString("dd/MM/yyyy") ?? "Không thời hạn",
                    BedCount = c.NumberOfBeds,
                    RentPrice = c.MonthlyRent,
                    PaymentCycle = c.PaymentCycle == "hang_thang" ? "Hàng tháng" : c.PaymentCycle,
                    DepositAmount = c.Deposit?.DepositAmount ?? 0,
                    FirstMonthRent = c.MonthlyRent,
                    ServiceFee = serviceFee,
                    IsComplete = isComplete
                });
            }
        }

        return result;
    }

    public async Task SaveCheckInChargesAsync(SaveCheckInChargesDto dto, string accountantId)
    {
        var contract = await _dbContext.RentalContracts
            .Include(c => c.Customer)
            .FirstOrDefaultAsync(c => c.ContractId == dto.ContractId)
            ?? throw new NotFoundException($"Không tìm thấy hợp đồng '{dto.ContractId}'.");

        var employeeId = await GetEmployeeIdFromAccountIdAsync(accountantId);

        // Tạo hóa đơn tiền phòng tháng đầu
        var rentInvoice = new Invoice
        {
            InvoiceId = IdGenerator.Generate("HD", 12),
            CustomerId = contract.CustomerId,
            AccountantEmployeeId = employeeId,
            ContractId = contract.ContractId,
            InvoiceType = "tien_thue",
            DocumentType = "thu",
            TotalAmount = dto.FirstMonthRent,
            Status = "cho_thanh_toan",
            BillingPeriod = contract.StartDate,
            CreatedAt = DateTime.UtcNow,
            Note = dto.Notes
        };
        await _dbContext.Invoices.AddAsync(rentInvoice);

        // Tạo hóa đơn phí dịch vụ tháng đầu nếu có
        if (dto.OtherFees > 0)
        {
            var feeInvoice = new Invoice
            {
                InvoiceId = IdGenerator.Generate("HD", 12),
                CustomerId = contract.CustomerId,
                AccountantEmployeeId = employeeId,
                ContractId = contract.ContractId,
                InvoiceType = "dich_vu",
                DocumentType = "thu",
                TotalAmount = dto.OtherFees,
                Status = "cho_thanh_toan",
                BillingPeriod = contract.StartDate,
                CreatedAt = DateTime.UtcNow,
                Note = "Phí dịch vụ ban đầu lúc nhận phòng."
            };
            await _dbContext.Invoices.AddAsync(feeInvoice);
        }

        // Tạo thông báo cho khách hàng
        var customerAccount = await _dbContext.Accounts
            .FirstOrDefaultAsync(a => a.CustomerId == contract.CustomerId);
        if (customerAccount != null)
        {
            var notification = new Notification
            {
                NotificationId = IdGenerator.Generate("TB", 12),
                SenderAccountId = null,
                RecipientAccountId = customerAccount.AccountId,
                Title = "Hóa đơn nhận phòng mới",
                Content = $"Hệ thống đã phát hành hóa đơn nhận phòng cho hợp đồng {contract.ContractId}. Vui lòng thanh toán khoản phí {dto.FirstMonthRent + dto.OtherFees:#,##0} VNĐ để hoàn tất nhận phòng."
            };
            await _dbContext.Notifications.AddAsync(notification);
        }

        await _dbContext.SaveChangesAsync();
    }

    // ==========================================
    // 4. RECONCILIATIONS
    // ==========================================

    public async Task<List<ReconciliationListItemDto>> GetReconciliationsAsync()
    {
        var list = await _dbContext.Reconciliations.ToListAsync();

        var result = new List<ReconciliationListItemDto>();
        foreach (var r in list)
        {
            var contract = await _dbContext.RentalContracts
                .Include(c => c.Customer)
                .Include(c => c.Room)
                .FirstOrDefaultAsync(c => c.ContractId == r.ContractId);

            if (contract == null) continue;

            var additionalCosts = await _dbContext.AdditionalCosts
                .Where(c => c.ReconciliationId == r.ReconciliationId)
                .ToListAsync();

            var damages = additionalCosts.Where(f => f.CostType == "hu_hong").Sum(f => f.Amount);
            var utilities = additionalCosts.Where(f => f.CostType == "dien_nuoc").Sum(f => f.Amount);
            var rentArrears = additionalCosts.Where(f => f.CostType == "no_tien_thue").Sum(f => f.Amount);
            var violationFines = additionalCosts.Where(f => f.CostType == "phat_vi_pham").Sum(f => f.Amount);
            var otherDeductions = additionalCosts.Where(f => f.CostType == "khac").Sum(f => f.Amount);
            var otherNote = additionalCosts.FirstOrDefault(f => f.CostType == "khac")?.Description;

            var checkoutReport = await _dbContext.CheckoutReports
                .FirstOrDefaultAsync(cr => cr.ReconciliationId == r.ReconciliationId);

            // Xác định phương thức hoàn tiền từ hóa đơn hoàn cọc (nếu đã có)
            string? refundMethod = null;
            string? bankName = null;
            string? accountNumber = null;
            
            var refundInvoice = await _dbContext.Invoices
                .FirstOrDefaultAsync(i => i.ReconciliationId == r.ReconciliationId && i.InvoiceType == "hoan_coc");

            if (refundInvoice != null)
            {
                refundMethod = refundInvoice.PaymentMethod;
                bankName = refundInvoice.BankName;
                accountNumber = refundInvoice.BankAccountNumber;
            }

            result.Add(new ReconciliationListItemDto
            {
                ReconciliationId = r.ReconciliationId,
                ContractId = contract.ContractId,
                CustomerId = contract.CustomerId,
                CustomerName = contract.Customer.FullName,
                RoomName = contract.Room.RoomName,
                MoveInDate = contract.StartDate.ToString("dd/MM/yyyy"),
                MoveOutDate = checkoutReport?.CheckoutDate.ToString("dd/MM/yyyy") ?? "Chưa trả",
                Deposit = r.OriginalDeposit,
                MonthlyRent = contract.MonthlyRent,
                RefundRate = r.RefundRate,
                BaseRefundAmount = r.BaseRefund,
                Damages = damages,
                UnpaidUtilities = utilities,
                RentArrears = rentArrears,
                ViolationFines = violationFines,
                OtherDeductions = otherDeductions,
                OtherDeductionsNote = otherNote,
                RefundAmount = (r.AdditionalPaymentAmount > 0)
                    ? -r.AdditionalPaymentAmount.Value
                    : (r.RefundAmount ?? (r.BaseRefund - r.TotalDeductions)),
                Status = r.Status == "cho_xac_nhan" ? "Chờ tính toán" : (r.Status == "da_xac_nhan" ? "Chờ xử lý" : "Đã hoàn thành"),
                RefundMethod = refundMethod,
                BankName = bankName,
                AccountNumber = accountNumber
            });
        }

        return result;
    }

    public async Task SaveReconciliationDeductionsAsync(SaveReconciliationDeductionsDto dto, string accountantId)
    {
        var recon = await _dbContext.Reconciliations
            .FirstOrDefaultAsync(r => r.ReconciliationId == dto.ReconciliationId)
            ?? throw new NotFoundException($"Không tìm thấy bản ghi đối soát '{dto.ReconciliationId}'.");

        // Xóa chi phí phát sinh cũ
        var existingCosts = await _dbContext.AdditionalCosts
            .Where(c => c.ReconciliationId == recon.ReconciliationId)
            .ToListAsync();
        _dbContext.AdditionalCosts.RemoveRange(existingCosts);

        // Thêm chi phí mới
        var listFees = new List<AdditionalCost>();
        if (dto.Damages > 0)
        {
            listFees.Add(new AdditionalCost
            {
                AdditionalCostId = IdGenerator.Generate("CP", 12),
                ReconciliationId = recon.ReconciliationId,
                CostType = "hu_hong",
                Amount = dto.Damages,
                Description = "Hư hại tài sản phòng"
            });
        }
        if (dto.Utilities > 0)
        {
            listFees.Add(new AdditionalCost
            {
                AdditionalCostId = IdGenerator.Generate("CP", 12),
                ReconciliationId = recon.ReconciliationId,
                CostType = "dien_nuoc",
                Amount = dto.Utilities,
                Description = "Chỉ số điện nước chưa trả"
            });
        }
        if (dto.RentArrears > 0)
        {
            listFees.Add(new AdditionalCost
            {
                AdditionalCostId = IdGenerator.Generate("CP", 12),
                ReconciliationId = recon.ReconciliationId,
                CostType = "no_tien_thue",
                Amount = dto.RentArrears,
                Description = "Nợ tiền phòng lưu trú"
            });
        }
        if (dto.ViolationFines > 0)
        {
            listFees.Add(new AdditionalCost
            {
                AdditionalCostId = IdGenerator.Generate("CP", 12),
                ReconciliationId = recon.ReconciliationId,
                CostType = "phat_vi_pham",
                Amount = dto.ViolationFines,
                Description = "Phạt vi phạm nội quy"
            });
        }
        if (dto.OtherDeductions > 0)
        {
            listFees.Add(new AdditionalCost
            {
                AdditionalCostId = IdGenerator.Generate("CP", 12),
                ReconciliationId = recon.ReconciliationId,
                CostType = "khac",
                Amount = dto.OtherDeductions,
                Description = dto.OtherDeductionsNote ?? "Khấu trừ khác"
            });
        }

        await _dbContext.AdditionalCosts.AddRangeAsync(listFees);

        // Tính toán lại
        recon.TotalDeductions = dto.Damages + dto.Utilities + dto.RentArrears + dto.ViolationFines + dto.OtherDeductions;
        var finalAmt = recon.BaseRefund - recon.TotalDeductions;

        if (finalAmt >= 0)
        {
            recon.RefundAmount = finalAmt;
            recon.AdditionalPaymentAmount = 0;
        }
        else
        {
            recon.RefundAmount = 0;
            recon.AdditionalPaymentAmount = -finalAmt;
        }

        recon.Status = "da_xac_nhan"; // Chờ xử lý thanh toán hoàn hoặc thu thêm
        recon.AccountantEmployeeId = (await GetEmployeeIdFromAccountIdAsync(accountantId)) ?? accountantId;

        await _dbContext.SaveChangesAsync();
    }

    public async Task ProcessRefundAsync(ProcessRefundDto dto, string accountantId)
    {
        var recon = await _dbContext.Reconciliations
            .FirstOrDefaultAsync(r => r.ReconciliationId == dto.ReconciliationId)
            ?? throw new NotFoundException($"Không tìm thấy bản ghi đối soát '{dto.ReconciliationId}'.");

        var contract = await _dbContext.RentalContracts
            .FirstOrDefaultAsync(c => c.ContractId == recon.ContractId)
            ?? throw new NotFoundException($"Không tìm thấy hợp đồng '{recon.ContractId}'.");

        var employeeId = await GetEmployeeIdFromAccountIdAsync(accountantId);

        var finalAmt = recon.RefundAmount ?? (recon.BaseRefund - recon.TotalDeductions);

        string dbPaymentMethod = dto.Method == "transfer" ? "chuyen_khoan" : "tien_mat";

        if (finalAmt > 0)
        {
            // Tạo phiếu chi hoàn cọc (hoa_don.loai_chung_tu = 'chi', loai_hoa_don = 'hoan_coc')
            var refundInvoice = new Invoice
            {
                InvoiceId = IdGenerator.Generate("HD", 12),
                CustomerId = contract.CustomerId,
                AccountantEmployeeId = employeeId,
                ReconciliationId = recon.ReconciliationId,
                InvoiceType = "hoan_coc",
                DocumentType = "chi",
                TotalAmount = finalAmt,
                PaymentMethod = dbPaymentMethod,
                BankName = dto.BankName,
                BankAccountNumber = dto.AccountNumber,
                BankAccountHolder = dto.AccountName,
                TransactionId = dto.Method == "transfer" ? "TXN-" + IdGenerator.Generate(string.Empty, 8) : null,
                Status = "da_thanh_toan",
                PaidAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                Note = $"Hoàn trả tiền cọc thanh lý hợp đồng {contract.ContractId}."
            };
            await _dbContext.Invoices.AddAsync(refundInvoice);
        }
        else if (recon.AdditionalPaymentAmount > 0)
        {
            // Tạo yêu cầu thu thêm
            var chargeInvoice = new Invoice
            {
                InvoiceId = IdGenerator.Generate("HD", 12),
                CustomerId = contract.CustomerId,
                AccountantEmployeeId = employeeId,
                ReconciliationId = recon.ReconciliationId,
                InvoiceType = "thu_them",
                DocumentType = "thu",
                TotalAmount = recon.AdditionalPaymentAmount.Value,
                PaymentMethod = dbPaymentMethod,
                BankName = dto.BankName,
                BankAccountNumber = dto.AccountNumber,
                BankAccountHolder = dto.AccountName,
                Status = "cho_thanh_toan",
                CreatedAt = DateTime.UtcNow,
                Note = $"Thu thêm khoản tiền chênh lệch đối soát trả phòng hợp đồng {contract.ContractId}."
            };
            await _dbContext.Invoices.AddAsync(chargeInvoice);
        }

        recon.Status = "hoan_tat";
        contract.Status = "thanh_ly"; // Thanh lý hợp đồng

        // Giải phóng phòng/giường về trạng thái 'trong'
        var room = await _dbContext.Rooms.FindAsync(contract.RoomId);
        if (room != null)
        {
            if (room.RoomType == "nguyen_can")
            {
                room.Status = "trong";
                room.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Tìm kiếm giường trong hợp đồng để giải phóng
                var deposit = await _dbContext.DepositSlips
                    .Include(d => d.Beds)
                    .FirstOrDefaultAsync(d => d.DepositId == contract.DepositId);
                
                if (deposit != null)
                {
                    var bedIds = deposit.Beds.Select(b => b.BedId).ToList();
                    var beds = await _dbContext.Beds.Where(b => bedIds.Contains(b.BedId)).ToListAsync();
                    foreach (var bed in beds)
                    {
                        bed.Status = "trong";
                        bed.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
        }

        // Tạo thông báo cho khách hàng
        var customerAccount = await _dbContext.Accounts
            .FirstOrDefaultAsync(a => a.CustomerId == contract.CustomerId);
        if (customerAccount != null)
        {
            var notification = new Notification
            {
                NotificationId = IdGenerator.Generate("TB", 12),
                SenderAccountId = null,
                RecipientAccountId = customerAccount.AccountId,
                Title = "Hoàn tất đối soát trả phòng",
                Content = $"Hồ sơ trả phòng cho hợp đồng {contract.ContractId} đã được Kế toán hoàn tất đối soát và thực hiện chi tiền."
            };
            await _dbContext.Notifications.AddAsync(notification);
        }

        await _dbContext.SaveChangesAsync();
    }

    // ==========================================
    // HELPERS & MAPPING
    // ==========================================

    private async Task<string?> GetEmployeeIdFromAccountIdAsync(string accountId)
    {
        var account = await _dbContext.Accounts.FindAsync(accountId);
        return account?.EmployeeId;
    }

    private static string GetInvoiceTypeName(string type)
    {
        return type switch
        {
            "tien_coc" => "Tiền cọc phòng",
            "tien_thue" => "Tiền thuê phòng tháng",
            "dich_vu" => "Phí dịch vụ sinh hoạt",
            "hoan_coc" => "Hoàn tiền cọc",
            "thu_them" => "Thu thêm đối soát",
            _ => type
        };
    }
}
